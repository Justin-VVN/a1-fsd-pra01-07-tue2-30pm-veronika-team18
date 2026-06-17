import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../../../backend/src/entity/User';
import { Venue } from '../../../backend/src/entity/Venue';
import { Booking } from '../../../backend/src/entity/Booking';
import { Document } from '../../../backend/src/entity/Document';
import { BlockedDate } from '../../../backend/src/entity/BlockedDate';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: 'dipto-database.cn2ems8y2mfe.ap-southeast-2.rds.amazonaws.com',
  port: 1433,
  username: 's3969801',
  password: 'VuVuong123',
  database: 's3969801',
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
