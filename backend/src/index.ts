import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/user.routes";
import venueRoutes from "./routes/venue.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import blockedDateRoutes from "./routes/blockedDate.routes";
import documentRoutes from "./routes/Document.routes";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use("/api", bookingRoutes);
app.use("/api", venueRoutes);
app.use("/api", userRoutes);
app.use("/api", reviewRoutes);
app.use("/api", blockedDateRoutes);
app.use("/api", documentRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );
