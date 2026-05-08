


const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const expireCertificatesJob = require("../cron/expireCertificates");
expireCertificatesJob();
/* =========================
   ✅ CORS CONFIG (IMPORTANT)
   ========================= */

   app.set('trust proxy', 1); 
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:4173",
        "https://yodoctor.in",
        "https://www.yodoctor.in",
      ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));
/* =========================
   ✅ MIDDLEWARE
   ========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   EVENT SYSTEM
   ========================= */
const eventBus = require("./events/eventBus");
const events = require("./events/notification.events");
const handlers = require("./notifications/notification.handler");
const certificateHandlers = require("./notifications/certificate.handler");


//Certicate lifecycle
eventBus.on(events.CERTIFICATE_REQUEST_CREATED, certificateHandlers.handleCertificateRequestCreated);
eventBus.on(events.CERTIFICATE_APPROVED, certificateHandlers.handleCertificateApproved);
eventBus.on(events.CERTIFICATE_REJECTED, certificateHandlers.handleCertificateRejected);
eventBus.on(events.CERTIFICATE_EXPIRED, certificateHandlers.handleCertificateExpired);
eventBus.on(events.CERTIFICATE_EXPIRY_REMINDER, certificateHandlers.handleExpiryReminder);

// Appointment lifecycle
eventBus.on(events.APPOINTMENT_REQUESTED, handlers.handleAppointmentRequested);
eventBus.on(events.APPOINTMENT_CONFIRMED, handlers.handleAppointmentConfirmed);
eventBus.on(events.APPOINTMENT_REJECTED, handlers.handleAppointmentRejected);
eventBus.on(
  events.APPOINTMENT_CANCELLED_BY_PATIENT,
  handlers.handleAppointmentCancelledByPatient,
);
eventBus.on(
  events.APPOINTMENT_CANCELLED_BY_ADMIN,
  handlers.handleAppointmentCancelledByAdmin,
);
eventBus.on(events.APPOINTMENT_COMPLETED, handlers.handleAppointmentCompleted);

// Reminders
eventBus.on(events.APPOINTMENT_REMINDER, handlers.handleAppointmentReminder);

// Doctor onboarding
eventBus.on(events.DOCTOR_APPROVED, handlers.handleDoctorApproved);
eventBus.on(events.DOCTOR_REJECTED, handlers.handleDoctorRejected);

// Visit summary
eventBus.on(events.VISIT_SUMMARY_ADDED, handlers.handleVisitSummaryAdded);

app.use("/auth", require("./routes/auth.routes"));
app.use("/patient", require("./routes/patient.routes"));
app.use("/doctor", require("./routes/doctor.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/notifications", require("./routes/notification.routes"));
app.use("/contact", require("./routes/enquiry.routes"));
app.use("/certificate", require("./routes/certificate.routes"));

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

module.exports = app;