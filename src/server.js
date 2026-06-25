
// const app = require("./app");
// require("dotenv").config();

// const syncPlans = require("./utils/syncPlans");
// const PORT = process.env.PORT || 4000;

// (async () => {
//   try {
//     await syncPlans();

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("Startup Error:", err);
//   }
// })();


require("dotenv").config();

const http = require("http");

const app = require("./app");

const syncPlans = require("./utils/syncPlans");

const PORT = process.env.PORT || 4000;

const { initializeSocket } = require("./socket");

const registerSocketEvents = require("./socket/socketEvents");

(async () => {
  try {
    await syncPlans();

    // Create HTTP Server
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    const io = initializeSocket(httpServer);

    // Register Socket Events
    registerSocketEvents(io);

    // Start Server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`✅ Socket.IO initialized`);
    });
  } catch (err) {
    console.error("Startup Error:", err);
  }
})();