const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");
const { requireActiveUser } = require("../middleware/activeUser");


// Dashboard
router.get(
  "/dashboard",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.getDashboard
);


// Doctors list
router.get(
  "/doctors",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.getDoctors
);


// Doctor details
router.get(
  "/doctors/:id",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.getDoctorDetails
);


// Doctor documents
router.get(
  "/doctors/:id/documents",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.getDoctorVerification
);


// Verify / Reject document
router.put(
  "/doctors/:id/documents/verify",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.verifyDoctorDocument
);


// Verify doctor account
router.put(
  "/doctors/:id/verify",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.verifyDoctorAccount
);


// Change doctor status
router.put(
  "/doctors/:id/status",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.updateDoctorStatus
);

// Notifications
router.get(
  "/notifications",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.getAdminNotifications
);

router.get(
  "/analytics/appointments",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.getAppointmentAnalytics
);

// Admin notifications mark as read
router.put(
  "/notifications/:id/read",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.markNotificationRead
);

router.get(
  "/contact-requests",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.getAllContactRequests
);

router.put(
  "/contact-requests/:id",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.updateContactStatus
);


router.delete(
  "/contact-requests/:id",
  verifyToken,
  requireActiveUser,
  allowRoles("ADMIN"),
  adminController.deleteContactRequest
);

module.exports = router;