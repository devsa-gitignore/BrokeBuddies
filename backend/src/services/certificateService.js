/**
 * Certificate Service
 * Generates real certificates by compositing text and QR code onto
 * the certificate-template.png using Jimp@1.6.0.
 */

const { Jimp, loadFont, HorizontalAlign, measureText } = require("jimp");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const TEMPLATE_PATH = path.join(__dirname, "../utils/certificate-template.png");
const CERT_OUTPUT_DIR = path.join(__dirname, "../utils/certificates");

// Ensure output directory exists
if (!fs.existsSync(CERT_OUTPUT_DIR)) {
  fs.mkdirSync(CERT_OUTPUT_DIR, { recursive: true });
}

// Find fonts in node_modules
const getFontPath = (name) => {
  try {
    const printPluginPath = require.resolve("@jimp/plugin-print");
    const fontsDir = path.join(
      path.dirname(printPluginPath),
      "..",
      "..",
      "fonts",
      "open-sans",
    );
    return path.join(fontsDir, name, `${name}.fnt`);
  } catch (err) {
    console.error("Error finding fonts:", err);
    return null;
  }
};

/**
 * Generate QR code as a PNG buffer.
 */
async function generateQRBuffer(data) {
  return QRCode.toBuffer(data, {
    type: "png",
    width: 150,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

/**
 * Core certificate image generator.
 */
async function buildCertificateImage({
  participantName,
  hackathonName,
  category,
  date,
  organizerName,
  headJudgeName,
  verifyUrl,
  outputPath,
}) {
  // Load template
  const img = await Jimp.read(TEMPLATE_PATH);
  const W = img.bitmap.width; // 1536
  const H = img.bitmap.height; // 1024

  // Load fonts from local node_modules
  const fontLgPath = getFontPath("open-sans-64-black");
  const fontMdPath = getFontPath("open-sans-32-black");
  const fontSmPath = getFontPath("open-sans-16-black");

  const fontLg = await loadFont(fontLgPath);
  const fontMd = await loadFont(fontMdPath);
  const fontSm = await loadFont(fontSmPath);

  // Helper to print centered
  const printCentered = (text, y, font) => {
    const textW = measureText(font, text);
    const x = (W - textW) / 2;
    img.print({ font, x, y, text });
  };

  // Helper to print centered on a specific X
  const printAtX = (text, centerX, y, font) => {
    const textW = measureText(font, text);
    const x = centerX - textW / 2;
    img.print({ font, x, y, text });
  };

  // --- CLEANUP PLACEHOLDERS ---
  // We cover the placeholder texts with a rectangle of the background color (#FDFDFD)
  // 1. Participant Name area
  img.scan(W * 0.2, 350, W * 0.6, 120, function (x, y, idx) {
    this.bitmap.data[idx] = 253; // R
    this.bitmap.data[idx + 1] = 253; // G
    this.bitmap.data[idx + 2] = 253; // B
  });
  // 2. Hackathon Name area
  img.scan(W * 0.2, 500, W * 0.6, 50, function (x, y, idx) {
    this.bitmap.data[idx] = 253;
    this.bitmap.data[idx + 1] = 253;
    this.bitmap.data[idx + 2] = 253;
  });
  // 3. Category area
  img.scan(W * 0.2, 590, W * 0.6, 50, function (x, y, idx) {
    this.bitmap.data[idx] = 253;
    this.bitmap.data[idx + 1] = 253;
    this.bitmap.data[idx + 2] = 253;
  });
  // 4. Date area
  img.scan(W * 0.4, 690, W * 0.2, 40, function (x, y, idx) {
    this.bitmap.data[idx] = 253;
    this.bitmap.data[idx + 1] = 253;
    this.bitmap.data[idx + 2] = 253;
  });
  // 5. Signatures areas
  img.scan(250, 640, 250, 40, function (x, y, idx) {
    this.bitmap.data[idx] = 253;
    this.bitmap.data[idx + 1] = 253;
    this.bitmap.data[idx + 2] = 253;
  });
  img.scan(W - 500, 640, 250, 40, function (x, y, idx) {
    this.bitmap.data[idx] = 253;
    this.bitmap.data[idx + 1] = 253;
    this.bitmap.data[idx + 2] = 253;
  });

  // --- PRINTING REAL DATA ---
  // 1. Participant Name
  printCentered(participantName, 370, fontLg);

  // 2. Hackathon Name
  printCentered(hackathonName.toUpperCase(), 505, fontMd);

  // 3. Category
  printCentered(category.toUpperCase(), 595, fontMd);

  // 4. Date
  printCentered(date, 695, fontSm);

  // 5. Bottom Title (HackFire 2026)
  // Usually at the very bottom
  printCentered(hackathonName, 770, fontSm);

  // 6. Signatures
  // Organizer (Left side, approx X=375)
  printAtX(organizerName, 375, 645, fontSm);

  // Head Judge (Right side, approx X=1160)
  printAtX(headJudgeName, 1160, 645, fontSm);

  // 7. QR Code
  const verifyUrlShort = verifyUrl;
  const qrBuffer = await generateQRBuffer(verifyUrlShort);
  const qrImg = await Jimp.read(qrBuffer);
  qrImg.resize({ w: 140, h: 140 });
  img.composite(qrImg, 1308, 622);

  // Save
  await img.write(outputPath);
}

/**
 * Generate (or retrieve existing) certificate for a user.
 */
async function generateCertificateFile(
  userId,
  hackathonId,
  {
    participantName,
    hackathonName,
    category = "participation",
    organizerName = "Organizer",
    headJudgeName = "Head Judge",
    baseUrl = process.env.API_BASE_URL ||
      "https://whateveridk-loc8w2.onrender.com",
  },
) {
  const verifyCode = crypto.randomBytes(8).toString("hex");
  const verifyUrl = `${baseUrl}/api/certificates/verify/${verifyCode}`;

  const categoryLabel =
    {
      participation: "Participant",
      winner: "Winner",
      runner_up: "Runner Up",
      second_runner_up: "2nd Runner Up",
    }[category] || category;

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const filename = `cert_${userId}_${hackathonId}_${category}.png`;
  const outputPath = path.join(CERT_OUTPUT_DIR, filename);

  await buildCertificateImage({
    participantName,
    hackathonName,
    category: categoryLabel,
    date: dateStr,
    organizerName,
    headJudgeName,
    verifyUrl,
    outputPath,
  });

  return { filePath: outputPath, verifyCode, filename };
}

module.exports = { generateCertificateFile };
