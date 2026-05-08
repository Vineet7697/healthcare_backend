exports.handleAppointmentRequested = (data) => {
  console.log("Appointment requested", data);
};

exports.handleAppointmentConfirmed = (data) => {
  console.log("Appointment confirmed", data);
};

exports.handleAppointmentRejected = (data) => {
  console.log("Appointment rejected", data);
};

exports.handleAppointmentCancelledByPatient = (data) => {
  console.log("Appointment cancelled by patient", data);
};

exports.handleAppointmentCancelledByAdmin = (data) => {
  console.log("Appointment cancelled by admin", data);
};

exports.handleAppointmentCompleted = (data) => {
  console.log("Appointment completed", data);
};

exports.handleAppointmentReminder = (data) => {
  console.log("Appointment reminder", data);
};

exports.handleDoctorApproved = (data) => {
  console.log("Doctor approved", data);
};

exports.handleDoctorRejected = (data) => {
  console.log("Doctor rejected", data);
};

exports.handleVisitSummaryAdded = (data) => {
  console.log("Visit summary added", data);
};