const crypto = require("crypto");
const qrcode = require("qrcode");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const mongoose = require("mongoose");

const QR = require("../models/QR");
const Team = require("../models/Team");
const Attendance = require("../models/Attendance");
const FoodLog = require("../models/FoodLog");
const Hackathon = require("../models/Hackathon");

const VALID_MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const DEFAULT_MEAL_WINDOWS = {
  breakfast: { start: "06:00", end: "10:30" },
  lunch: { start: "12:00", end: "15:00" },
  dinner: { start: "18:00", end: "22:30" },
};
const DEFAULT_MEAL_SESSION_DURATION_MINUTES = 30;
const MAX_MEAL_SESSION_DURATION_MINUTES = 180;

/**
 * QR Service
 * Generate and validate dynamic QR codes.
 */

const parseTimeToMinutes = (value) => {
  if (!value || typeof value !== "string") return null;
  const [h, m] = value.split(":");
  const hour = Number(h);
  const minute = Number(m);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
};

const getMealWindow = (hackathon, mealType) => {
  const configured = hackathon?.mealWindows?.[mealType];
  const fallback = DEFAULT_MEAL_WINDOWS[mealType];
  return {
    start: configured?.start || fallback.start,
    end: configured?.end || fallback.end,
  };
};

const isWithinMealWindow = (hackathon, mealType, now = new Date()) => {
  const window = getMealWindow(hackathon, mealType);
  const startMin = parseTimeToMinutes(window.start);
  const endMin = parseTimeToMinutes(window.end);

  if (startMin === null || endMin === null) return false;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (startMin <= endMin) {
    return nowMin >= startMin && nowMin <= endMin;
  }

  // Overnight window support (e.g., 22:00 -> 02:00)
  return nowMin >= startMin || nowMin <= endMin;
};

const createQrImage = async (token, verifyPath, background) => {
  const baseURL =
    process.env.NODE_ENV === "production"
      ? process.env.DOMAIN || "https://whateveridk-loc8w2.onrender.com"
      : `https://whateveridk-loc8w2.onrender.com`;

  const qrData = `${baseURL}${verifyPath}?token=${token}`;

  const qrBuffer = await qrcode.toBuffer(qrData, {
    type: "png",
    width: 500,
    margin: 2,
  });

  const textSVG = Buffer.from(`
    <svg width="500" height="60">
        <style>
        .token {
            font-size: 36px;
            font-weight: bold;
            text-anchor: middle;
            fill: #000;
            font-family: Arial, sans-serif;
        }
        </style>
        <text x="50%" y="50%" class="token" dominant-baseline="middle">${token.substring(0, 8).toUpperCase()}</text>
    </svg>
  `);

  return sharp({
    create: {
      width: 500,
      height: 560,
      channels: 4,
      background,
    },
  })
    .composite([
      { input: qrBuffer, top: 0, left: 0 },
      { input: textSVG, top: 500, left: 0 },
    ])
    .png()
    .toBuffer();
};

const uploadQrImage = async (combinedBuffer, publicIdPrefix, token) => {
  return new Promise((resolve, reject) => {
    const cldUploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "qrcodes",
        public_id: `${publicIdPrefix}-${token.substring(0, 16)}`,
        overwrite: true,
        resource_type: "image",
        format: "png",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );

    streamifier.createReadStream(combinedBuffer).pipe(cldUploadStream);
  });
};

const ensureShortlistedStudent = async (userId, hackathonId) => {
  const shortlistedTeam = await Team.findOne({
    hackathon: hackathonId,
    status: "shortlisted",
    $or: [{ leader: userId }, { members: userId }],
  });

  if (!shortlistedTeam) {
    throw new Error(
      "Only shortlisted students can generate entry QR for this hackathon",
    );
  }
};

const assertValidMealType = (mealType) => {
  if (!VALID_MEAL_TYPES.includes(mealType)) {
    throw new Error("Invalid meal type");
  }
};

const getMealSessionInfo = (hackathon, mealType) => {
  const session = hackathon?.mealSessions?.[mealType] || {};
  const startsAt = session.startsAt ? new Date(session.startsAt) : null;
  const endsAt = session.endsAt ? new Date(session.endsAt) : null;
  const now = new Date();
  const isActive = Boolean(
    session.isActive && startsAt && endsAt && now >= startsAt && now <= endsAt,
  );

  return {
    isActive,
    startsAt,
    endsAt,
  };
};

const ensureMealSessionActive = (hackathon, mealType) => {
  const session = getMealSessionInfo(hackathon, mealType);
  if (!session.isActive) {
    throw new Error(
      `${mealType} session is not active. Ask admin to start/extend this meal session.`,
    );
  }
  return session;
};

const explainInvalidToken = async (token, type, hackathonId) => {
  const qr = await QR.findOne({ token, type });
  if (!qr) throw new Error("Invalid QR token");

  if (hackathonId && qr.hackathonId.toString() !== hackathonId.toString()) {
    throw new Error("QR token does not belong to this hackathon");
  }

  if (qr.expiresAt <= new Date()) {
    throw new Error("QR token expired");
  }

  if (qr.used) {
    throw new Error("Token already used");
  }

  throw new Error("Invalid QR token");
};

const withTransaction = async (handler) => {
  const session = await mongoose.startSession();
  try {
    let result;
    try {
      await session.withTransaction(async () => {
        result = await handler(session);
      });
      return result;
    } catch (error) {
      const message = String(error?.message || "");
      const noTransactionSupport =
        message.includes(
          "Transaction numbers are only allowed on a replica set",
        ) || message.includes("Transaction not supported");

      if (!noTransactionSupport) {
        throw error;
      }

      // Fallback for local standalone MongoDB where sessions exist but transactions do not.
      return handler(null);
    }
  } finally {
    await session.endSession();
  }
};

const generateEntryQR = async (userId, hackathonId) => {
  await ensureShortlistedStudent(userId, hackathonId);

  const existingQr = await QR.findOne({
    userId,
    hackathonId,
    type: "entry",
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (existingQr) {
    return { token: existingQr.token, imageUrl: existingQr.imageUrl };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const qrBuffer = await createQrImage(
    token,
    `/api/hackathons/${hackathonId}/qr/entry/verify`,
    "#da7878ff",
  );

  const imageUrl = await uploadQrImage(qrBuffer, "qr-entry", token);

  await QR.create({
    hackathonId,
    userId,
    token,
    type: "entry",
    expiresAt,
    imageUrl,
  });

  return { token, imageUrl };
};

const verifyEntryQR = async (token, scannerId, hackathonId) => {
  const now = new Date();

  return withTransaction(async (session) => {
    const tx = session ? { session } : {};

    const qr = await QR.findOneAndUpdate(
      {
        token,
        type: "entry",
        hackathonId,
        used: false,
        expiresAt: { $gt: now },
      },
      { $set: { used: true, usedAt: now } },
      { new: true, ...tx },
    );

    if (!qr) {
      await explainInvalidToken(token, "entry", hackathonId);
    }

    const existingAttendance = await Attendance.findOne({
      hackathonId: qr.hackathonId,
      userId: qr.userId,
    }).session(session || null);

    if (existingAttendance) {
      throw new Error("Attendance already logged for this user");
    }

    await Attendance.create(
      [
        {
          hackathonId: qr.hackathonId,
          userId: qr.userId,
          scannedBy: scannerId,
          method: "qr",
        },
      ],
      tx,
    );

    return { type: "entry", userId: qr.userId, hackathonId: qr.hackathonId };
  });
};

const generateFoodQR = async (userId, hackathonId, mealType) => {
  assertValidMealType(mealType);

  const attendance = await Attendance.findOne({ hackathonId, userId });
  if (!attendance) {
    throw new Error("Student attendance is not verified for this hackathon");
  }

  const hackathon = await Hackathon.findById(hackathonId).select(
    "mealWindows mealSessions",
  );
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  const activeSession = ensureMealSessionActive(hackathon, mealType);

  const alreadyClaimed = await FoodLog.findOne({
    user: userId,
    hackathon: hackathonId,
    mealType,
  });

  if (alreadyClaimed) {
    throw new Error(`User has already claimed ${mealType} for this hackathon`);
  }

  const existingQr = await QR.findOne({
    userId,
    hackathonId,
    type: "food",
    mealType,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (existingQr) {
    return { token: existingQr.token, imageUrl: existingQr.imageUrl };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);
  const expiresAt =
    activeSession.endsAt && activeSession.endsAt < thirtyMinutesFromNow
      ? activeSession.endsAt
      : thirtyMinutesFromNow;

  const qrBuffer = await createQrImage(
    token,
    `/api/hackathons/${hackathonId}/qr/food/validate`,
    "#78da85ff",
  );

  const imageUrl = await uploadQrImage(qrBuffer, "qr-food", token);

  await QR.create({
    hackathonId,
    userId,
    token,
    type: "food",
    mealType,
    expiresAt,
    imageUrl,
  });

  return { token, imageUrl };
};

const validateFoodQR = async (
  token,
  scannerId,
  hackathonId,
  expectedMealType,
) => {
  if (expectedMealType) {
    assertValidMealType(expectedMealType);
  }

  const now = new Date();

  return withTransaction(async (session) => {
    const tx = session ? { session } : {};

    const qr = await QR.findOneAndUpdate(
      {
        token,
        type: "food",
        hackathonId,
        used: false,
        expiresAt: { $gt: now },
      },
      { $set: { used: true, usedAt: now } },
      { new: true, ...tx },
    );

    if (!qr) {
      await explainInvalidToken(token, "food", hackathonId);
    }

    if (expectedMealType && qr.mealType !== expectedMealType) {
      throw new Error(
        `This QR is for ${qr.mealType}, but you are validating for ${expectedMealType}`,
      );
    }

    const attendance = await Attendance.findOne({
      hackathonId: qr.hackathonId,
      userId: qr.userId,
    }).session(session || null);

    if (!attendance) {
      throw new Error("Student attendance is not verified for this hackathon");
    }

    const hackathon = await Hackathon.findById(qr.hackathonId)
      .select("mealWindows mealSessions")
      .session(session || null);

    if (!hackathon) {
      throw new Error("Hackathon not found");
    }

    ensureMealSessionActive(hackathon, qr.mealType);

    const existingFoodLog = await FoodLog.findOne({
      hackathon: qr.hackathonId,
      user: qr.userId,
      mealType: qr.mealType,
    }).session(session || null);

    if (existingFoodLog) {
      throw new Error(`User has already claimed ${qr.mealType}`);
    }

    let foodLog;
    try {
      [foodLog] = await FoodLog.create(
        [
          {
            user: qr.userId,
            hackathon: qr.hackathonId,
            mealType: qr.mealType,
            qr: qr._id,
            scannedBy: scannerId,
          },
        ],
        tx,
      );
    } catch (error) {
      if (error?.code === 11000) {
        throw new Error(`User has already claimed ${qr.mealType}`);
      }
      throw error;
    }

    return foodLog;
  });
};

const verifyScannedQR = async (token, scannerId, hackathonId, mealType) => {
  const qr = await QR.findOne({
    token,
    hackathonId,
    type: { $in: ["entry", "food"] },
  })
    .select("type")
    .lean();

  if (!qr) {
    throw new Error("Invalid QR token");
  }

  if (qr.type === "entry") {
    await verifyEntryQR(token, scannerId, hackathonId);
    return {
      type: "entry",
      message: "Entry authorized and attendance recorded",
    };
  }

  const foodLog = await validateFoodQR(token, scannerId, hackathonId, mealType);
  return {
    type: "food",
    mealType: foodLog.mealType,
    message: `${foodLog.mealType} successfully claimed`,
    foodLog,
  };
};

const startMealSession = async (
  hackathonId,
  mealType,
  durationMinutes = DEFAULT_MEAL_SESSION_DURATION_MINUTES,
) => {
  assertValidMealType(mealType);
  const safeDuration = Math.min(
    Math.max(
      Number(durationMinutes) || DEFAULT_MEAL_SESSION_DURATION_MINUTES,
      1,
    ),
    MAX_MEAL_SESSION_DURATION_MINUTES,
  );

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + safeDuration * 60 * 1000);

  const hackathon = await Hackathon.findByIdAndUpdate(
    hackathonId,
    {
      $set: {
        [`mealSessions.${mealType}.isActive`]: true,
        [`mealSessions.${mealType}.startsAt`]: startsAt,
        [`mealSessions.${mealType}.endsAt`]: endsAt,
      },
    },
    { new: true },
  ).select("mealSessions");

  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  return { mealType, startsAt, endsAt, isActive: true };
};

const extendMealSession = async (hackathonId, mealType, extendMinutes = 10) => {
  assertValidMealType(mealType);
  const extraMinutes = Math.min(Math.max(Number(extendMinutes) || 10, 1), 120);

  const hackathon =
    await Hackathon.findById(hackathonId).select("mealSessions");
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  const current = hackathon.mealSessions?.[mealType];
  if (!current?.startsAt || !current?.endsAt) {
    throw new Error(
      `${mealType} session has not been started yet. Start session first.`,
    );
  }

  const now = new Date();
  const baseline = current.endsAt > now ? current.endsAt : now;
  const endsAt = new Date(baseline.getTime() + extraMinutes * 60 * 1000);

  hackathon.mealSessions[mealType].isActive = true;
  hackathon.mealSessions[mealType].endsAt = endsAt;
  await hackathon.save();

  return {
    mealType,
    startsAt: hackathon.mealSessions[mealType].startsAt,
    endsAt,
    isActive: true,
  };
};

const getMealSessionsForHackathon = async (hackathonId) => {
  const hackathon =
    await Hackathon.findById(hackathonId).select("mealSessions");
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  const sessions = {};
  VALID_MEAL_TYPES.forEach((mealType) => {
    sessions[mealType] = getMealSessionInfo(hackathon, mealType);
  });
  return sessions;
};

module.exports = {
  VALID_MEAL_TYPES,
  DEFAULT_MEAL_WINDOWS,
  DEFAULT_MEAL_SESSION_DURATION_MINUTES,
  generateEntryQR,
  verifyEntryQR,
  generateFoodQR,
  validateFoodQR,
  verifyScannedQR,
  startMealSession,
  extendMealSession,
  getMealSessionsForHackathon,
  isWithinMealWindow,
  getMealWindow,
};
