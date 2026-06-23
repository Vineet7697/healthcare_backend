// const express = require("express");
// const app = express();
// require("dotenv").config();
// const cors = require("cors");
// const path = require("path");
// const expireCertificatesJob = require("../cron/expireCertificates");
// expireCertificatesJob();
// const paymentRoutes = require("./routes/payment");

// // rate limiters
// const {
//   globalLimiter,
//   authLimiter,
//   livekitLimiter,
//   paymentLimiter,
// } = require("./middleware/rateLimit");
// /* =========================
//    ✅ CORS CONFIG (IMPORTANT)
//    ========================= */

// app.set("trust proxy", 1);
// const corsOptions = {
//   origin: process.env.ALLOWED_ORIGINS
//     ? process.env.ALLOWED_ORIGINS.split(",")
//     : [
//         "http://localhost:3000",
//         "http://localhost:3001",
//         "http://localhost:4173",
//         "https://yodoctor.in",
//         "https://www.yodoctor.in",
//       ],
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.options("/{*path}", cors(corsOptions));

// app.use("/uploads", express.static("uploads"));

// app.use(globalLimiter);
// /* =========================
//    ✅ MIDDLEWARE
//    ========================= */
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));




// /* =========================
//    EVENT SYSTEM
//    ========================= */
// const eventBus = require("./events/eventBus");
// const events = require("./events/notification.events");
// const handlers = require("./notifications/notification.handler");
// const certificateHandlers = require("./notifications/certificate.handler");

// //Certicate lifecycle
// eventBus.on(
//   events.CERTIFICATE_REQUEST_CREATED,
//   certificateHandlers.handleCertificateRequestCreated,
// );
// eventBus.on(
//   events.CERTIFICATE_APPROVED,
//   certificateHandlers.handleCertificateApproved,
// );
// eventBus.on(
//   events.CERTIFICATE_REJECTED,
//   certificateHandlers.handleCertificateRejected,
// );
// eventBus.on(
//   events.CERTIFICATE_EXPIRED,
//   certificateHandlers.handleCertificateExpired,
// );
// eventBus.on(
//   events.CERTIFICATE_EXPIRY_REMINDER,
//   certificateHandlers.handleExpiryReminder,
// );

// // Appointment lifecycle
// eventBus.on(events.APPOINTMENT_REQUESTED, handlers.handleAppointmentRequested);
// eventBus.on(events.APPOINTMENT_CONFIRMED, handlers.handleAppointmentConfirmed);
// eventBus.on(events.APPOINTMENT_REJECTED, handlers.handleAppointmentRejected);
// eventBus.on(
//   events.APPOINTMENT_CANCELLED_BY_PATIENT,
//   handlers.handleAppointmentCancelledByPatient,
// );
// eventBus.on(
//   events.APPOINTMENT_CANCELLED_BY_ADMIN,
//   handlers.handleAppointmentCancelledByAdmin,
// );
// eventBus.on(events.APPOINTMENT_COMPLETED, handlers.handleAppointmentCompleted);

// // Reminders
// eventBus.on(events.APPOINTMENT_REMINDER, handlers.handleAppointmentReminder);

// // Doctor onboarding
// eventBus.on(events.DOCTOR_APPROVED, handlers.handleDoctorApproved);
// eventBus.on(events.DOCTOR_REJECTED, handlers.handleDoctorRejected);

// // Visit summary
// eventBus.on(events.VISIT_SUMMARY_ADDED, handlers.handleVisitSummaryAdded);

// // app.use("/auth", require("./routes/auth.routes"));
// app.use("/auth", authLimiter, require("./routes/auth.routes"));
// app.use("/patient", require("./routes/patient.routes"));
// app.use("/doctor", require("./routes/doctor.routes"));
// app.use("/admin", require("./routes/admin.routes"));
// app.use("/notifications", require("./routes/notification.routes"));
// app.use("/contact", require("./routes/enquiry.routes"));
// app.use("/certificate", require("./routes/certificate.routes"));



// app.use("/api/payment", paymentLimiter, paymentRoutes);
// app.use("/api/livekit", livekitLimiter, require("./routes/livekit.routes"));
// app.use("/api/chatbot", require("./routes/chatbot.routes"));

// app.get("/", (req, res) => {
//   res.send("Server running 🚀");
// });

// module.exports = app;





const express = require("express");
const app = express();
app.disable("x-powered-by");
require("dotenv").config();
const requiredEnv = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "JWT_SECRET",
];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is missing in .env`);
  }
});
const cors = require("cors");

const path = require("path");

const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

app.use(helmet());

const expireCertificatesJob = require("../cron/expireCertificates");
const EVENTS = require("./events/notification.events");
const registerEvents = require("./events/registerEvents");
const { activateScheduledUpgrades } = require("../cron/subscriptionUpgradeCron");
  activateScheduledUpgrades();

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://yodoctor.in",
        "https://www.yodoctor.in",
      ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature"],
  // allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  "/razorpay/webhooks/razorpay",
  express.raw({ type: "application/json" }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use(["/auth", "/patient", "/doctor", "/admin"], limiter);

expireCertificatesJob();

registerEvents();

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/auth", require("./routes/auth.routes"));
app.use("/patient", require("./routes/patient.routes"));
app.use("/doctor", require("./routes/doctor.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/notifications", require("./routes/notification.routes"));

app.use("/certificate", require("./routes/certificate.routes"));
app.use("/api/chatbot", require("./routes/chatbot.routes"));

// app.use("/uploads", express.static("uploads"));
// path.join(__dirname, "../uploads")
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/contact", require("./routes/enquiry.routes"));

app.use("/razorpay", require("./routes/razorpay.routes"));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "YoDoctor API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// 404 handler  ← ADD HERE

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;