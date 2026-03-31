const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { initSocketHandlers } = require("./sockets/socketManager");
const { upload } = require("./middleware/uploadMiddleware");
const cloudController = require("./config/cloud");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Connect to Database
connectDB();
cloudController.initCloudStorage();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ──────────────── Routes ────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/sms", require("./routes/smsRoutes"));
app.use("/api/verification", require("./routes/verificationRoutes"));

app.use("/api/hackathons", require("./routes/hackathonRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/problems", require("./routes/problemRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/evaluations", require("./routes/evaluationRoutes"));
app.use("/api/mentors", require("./routes/mentorRoutes"));

// File Upload Routes (Directly linked to avoid new structural files)
const { protect } = require("./middleware/authMiddleware");
app.post(
  "/api/uploads",
  protect,
  upload.single("file"),
  cloudController.uploadFileController,
);
app.delete(
  "/api/uploads/:fileId(*)",
  protect,
  cloudController.deleteFileController,
);

app.use("/api/qr", require("./routes/qrRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/food", require("./routes/foodRoutes"));
app.use("/api/broadcasts", require("./routes/broadcastRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/summary", require("./routes/summaryRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/plagiarism", require("./routes/plagiarismRoutes"));
app.use("/api/help", require("./routes/helpRoutes"));

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Socket.io
initSocketHandlers(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
