// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connect from "./src/db/connect.js";
// import cookieParser from "cookie-parser";
// import fs from "node:fs";
// import errorHandler from "./src/helpers/errorhandler.js";

// dotenv.config();

// const port = process.env.PORT || 8000;

// const app = express();

// // middleware
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.get("/", (req, res) => {
//   res.send("API is working fine 🚀");
// });

// // error handler middleware
// app.use(errorHandler);

// //routes
// const routeFiles = fs.readdirSync("./src/routes");

// routeFiles.forEach((file) => {
//   // use dynamic import
//   import(`./src/routes/${file}`)
//     .then((route) => {
//       app.use("/api/v1", route.default);
//     })
//     .catch((err) => {
//       console.log("Failed to load route file", err);
//     });
// });

// const server = async () => {
//   try {
//     await connect();

//     app.listen(port, () => {
//       console.log(`Server is running on port ${port}`);
//     });
//   } catch (error) {
//     console.log("Failed to strt server.....", error.message);
//     process.exit(1);
//   }
// };

// server();


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "fs/promises"; // Using async fs
import errorHandler from "./src/helpers/errorhandler.js";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// Allowed origins (for local dev & production)
const allowedOrigins = [
  "http://localhost:3000", // Local frontend
  process.env.CLIENT_URL,   // Production frontend from .env
];

console.log("✅ Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ CORS Error: Blocked Origin -", origin);
        callback(new Error("CORS policy violation"), false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




// header('Access-Control-Allow-Origin : *');
// header('Access-Control-Allow-Methods : POST, GET, PUT, DELETE, OPTIONS,post, Get, get');
// header('Access-Control-Allow-Headers : Content-Type, X-Auth-Token, Origin, Authorization');




// Test API Route
app.get("/", (req, res) => {
  res.send("API is working fine 🚀");
});

// Load and Register Routes Dynamically
const loadRoutes = async () => {
  try {
    const routeFiles = await fs.readdir("./src/routes");
    for (const file of routeFiles) {
      const route = await import(`./src/routes/${file}`);
      app.use("/api/v1", route.default);
    }
    console.log("✅ All routes loaded successfully!");
  } catch (err) {
    console.error("❌ Failed to load route files", err);
  }
};

// Apply Error Handling Middleware
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connect(); // Database connection

    await loadRoutes(); // Load routes before starting the server

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
