// be-aja/app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const pool = require("./config/database");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const kunjunganRoutes = require("./routes/kunjungan");
const rekapRoutes = require("./routes/rekap"); // NEW

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Initialize express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/kunjungan", kunjunganRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rekap", rekapRoutes); // NEW - Rekap PDF routes

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "DPRD Lampung Kunjungan API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/login": "Admin login",
        "GET /api/auth/profile": "Get admin profile (protected)",
        "POST /api/auth/logout": "Admin logout",
        "GET /api/auth/verify": "Verify token",
      },
      kunjungan: {
        "POST /api/kunjungan": "Submit kunjungan form (public)",
        "GET /api/kunjungan": "Get all kunjungan (admin)",
        "GET /api/kunjungan/:id": "Get kunjungan by ID (admin)",
        "PUT /api/kunjungan/:id/status": "Update status (admin)",
        "DELETE /api/kunjungan/:id": "Delete kunjungan (admin)",
      },
      rekap: {
        "GET /api/rekap/available-months": "Get available months for rekap",
        "GET /api/rekap/pdf?bulan=10&tahun=2025": "Generate PDF rekap",
      },
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}
   📝 Environment: ${process.env.NODE_ENV || "development"}
   🌐 Health check: http://localhost:${PORT}/health
   📚 API docs: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

module.exports = app;