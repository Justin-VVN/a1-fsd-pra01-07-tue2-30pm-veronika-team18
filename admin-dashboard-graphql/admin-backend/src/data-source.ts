import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../../../backend/src/entity/User';
import { Venue } from '../../../backend/src/entity/Venue';
import { Booking } from '../../../backend/src/entity/Booking';
import { Document } from '../../../backend/src/entity/Document';
import { BlockedDate } from '../../../backend/src/entity/BlockedDate';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 1433,
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'SqlExpress#2026',
  database: process.env.DB_NAME || 'venue_booking',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  synchronize: true,
  logging: false,
  entities: [User, Venue, Booking, Document, BlockedDate],
  migrations: [],
  subscribers: [],
});
