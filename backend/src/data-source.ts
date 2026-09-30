import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Venue } from './entity/Venue';
import { Booking } from "./entity/Booking";
import { Review } from "./entity/Review";
import { BlockedDate } from "./entity/BlockedDate";
import { Document } from "./entity/Document";

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 1433,
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'SqlExpress#2026',
  database: process.env.DB_NAME || 'venue_booking',
  options: {
    encrypt: false, // Use this for Azure SQL Database
    trustServerCertificate: true, // Use this for Windows Authentication (if applicable)
  },
  // synchronize: true will automatically create database tables based on entity definitions
  // and update them when entity definitions change. This is useful during development
  // but should be disabled in production to prevent accidental data loss.
  synchronize: true,
  logging: true, // Enable logging for debugging purposes
  entities: [User, Venue, Booking, Review, BlockedDate, Document],
  migrations: [],
  subscribers: [],
});
