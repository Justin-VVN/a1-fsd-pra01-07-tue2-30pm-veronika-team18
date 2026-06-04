import "reflect-metadata";
import express from "express";
import path from "path";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/user.routes";
import venueRoutes from "./routes/venue.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import blockedDateRoutes from "./routes/blockedDate.routes";
import documentRoutes from "./routes/Document.routes";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
// Serve uploaded files at /uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api", authRoutes);
app.use("/api", bookingRoutes);
app.use("/api", venueRoutes);
app.use("/api", userRoutes);
app.use("/api", reviewRoutes);
app.use("/api", blockedDateRoutes);
app.use("/api", documentRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a different value.`);
      } else {
        console.error("Server failed to start:", error);
      }
      process.exit(1);
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );
