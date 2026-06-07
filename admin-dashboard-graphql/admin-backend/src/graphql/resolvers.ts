import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Venue } from '../entity/Venue';
import { Booking } from '../entity/Booking';
import { pubsub, VENUE_DISCOUNT_EVENT } from '../pubsub';

const JWT_SECRET = process.env.JWT_SECRET || 'admin-graphql-secret-2026';
const DISCOUNT_PERCENT = 45;

function requireAdmin(token: string): void {
  if (!token) throw new Error('Authentication required');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'admin') throw new Error('Admin access required');
  } catch {
    throw new Error('Invalid or expired token');
  }
}

export const resolvers = {
  Query: {
    venues: async (_: unknown, __: unknown, { token }: { token: string }) => {
      requireAdmin(token);
      return AppDataSource.getRepository(Venue).find({ relations: ['owner'] });
    },

    venue: async (_: unknown, { id }: { id: string }, { token }: { token: string }) => {
      requireAdmin(token);
      return AppDataSource.getRepository(Venue).findOne({
        where: { id: parseInt(id) },
        relations: ['owner'],
      });
    },

    vendors: async (_: unknown, __: unknown, { token }: { token: string }) => {
      requireAdmin(token);
      return AppDataSource.getRepository(User).find({ where: { type: 'vendor' } });
    },

    users: async (
      _: unknown,
      { type }: { type?: string },
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const repo = AppDataSource.getRepository(User);
      if (type) return repo.find({ where: { type: type as 'hirer' | 'vendor' | 'admin' } });
      return repo.find();
    },

    bookings: async (_: unknown, __: unknown, { token }: { token: string }) => {
      requireAdmin(token);
      return AppDataSource.getRepository(Booking).find();
    },

    featuredVenues: async (_: unknown, __: unknown, { token }: { token: string }) => {
      requireAdmin(token);
      return AppDataSource.getRepository(Venue).find({
        where: { featured: true },
        relations: ['owner'],
      });
    },

    topPopularVenues: async (
      _: unknown,
      __: unknown,
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const bookingRepo = AppDataSource.getRepository(Booking);
      const venueRepo = AppDataSource.getRepository(Venue);

      const allBookings = await bookingRepo.find();

      const venueCounts: Record<number, number> = {};
      allBookings.forEach((b) => {
        venueCounts[b.venueId] = (venueCounts[b.venueId] || 0) + 1;
      });

      const top3 = Object.entries(venueCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      const results = [];

      for (const [venueIdStr, bookingCount] of top3) {
        const venueId = parseInt(venueIdStr);
        const venue = await venueRepo.findOne({
          where: { id: venueId },
          relations: ['owner'],
        });
        if (!venue) continue;

        const venueBookings = allBookings.filter((b) => b.venueId === venueId);

        const dayCounts: Record<string, number> = {};
        venueBookings.forEach((b) => {
          try {
            const d = new Date(b.checkIn);
            if (!isNaN(d.getTime())) {
              const day = d.toLocaleDateString('en-AU', { weekday: 'long' });
              dayCounts[day] = (dayCounts[day] || 0) + 1;
            }
          } catch {
          }
        });
        const mostPopularDay =
          Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

        const timeCounts: Record<string, number> = {};
        venueBookings.forEach((b) => {
          if (b.eventTime) {
            timeCounts[b.eventTime] = (timeCounts[b.eventTime] || 0) + 1;
          }
        });
        const mostPopularTimeSlot =
          Object.entries(timeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

        results.push({ venue, bookingCount, mostPopularDay, mostPopularTimeSlot });
      }

      return results;
    },

    topActiveHirers: async (
      _: unknown,
      __: unknown,
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const bookingRepo = AppDataSource.getRepository(Booking);
      const userRepo = AppDataSource.getRepository(User);

      const allBookings = await bookingRepo.find();

      const hirerMap: Record<number, { total: number; successful: number }> = {};
      allBookings.forEach((b) => {
        if (!hirerMap[b.hirerId]) hirerMap[b.hirerId] = { total: 0, successful: 0 };
        hirerMap[b.hirerId].total++;
        if (b.status === 'accepted' || b.status === 'confirmed') {
          hirerMap[b.hirerId].successful++;
        }
      });

      const top3 = Object.entries(hirerMap)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 3);

      const results = [];
      for (const [hirerIdStr, stats] of top3) {
        const hirerId = parseInt(hirerIdStr);
        const hirer = await userRepo.findOne({ where: { id: hirerId } });
        results.push({
          hirerId,
          hirerName: hirer?.fullName ?? 'Unknown',
          hirerEmail: hirer?.email ?? '',
          totalBookings: stats.total,
          successfulBookings: stats.successful,
        });
      }

      return results;
    },
  },

  Mutation: {
    login: async (
      _: unknown,
      { username, password }: { username: string; password: string }
    ) => {
      if (username !== 'admin' || password !== 'admin') {
        throw new Error('Invalid credentials');
      }
      const token = jwt.sign({ role: 'admin', username: 'admin' }, JWT_SECRET, {
        expiresIn: '24h',
      });
      return { token, username: 'admin' };
    },

    assignVendorToVenue: async (
      _: unknown,
      { venueId, vendorId }: { venueId: string; vendorId: string },
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const venueRepo = AppDataSource.getRepository(Venue);
      const userRepo = AppDataSource.getRepository(User);

      const venue = await venueRepo.findOne({ where: { id: parseInt(venueId) } });
      if (!venue) throw new Error('Venue not found');

      const vendor = await userRepo.findOne({ where: { id: parseInt(vendorId) } });
      if (!vendor) throw new Error('Vendor not found');
      if (vendor.type !== 'vendor') throw new Error('User is not a vendor');

      venue.owner = vendor;
      await venueRepo.save(venue);

      return venueRepo.findOne({ where: { id: venue.id }, relations: ['owner'] });
    },

    createVenue: async (
      _: unknown,
      { input }: { input: Partial<Venue> & { ownerId?: number } },
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const venueRepo = AppDataSource.getRepository(Venue);
      const userRepo = AppDataSource.getRepository(User);

      const venue = venueRepo.create({
        name: input.name,
        imgSrc: input.imgSrc,
        location: input.location,
        capacity: input.capacity,
        price: input.price,
        suitability: input.suitability ?? [],
        featured: false,
        onSale: false,
      });

      if (input.ownerId) {
        const owner = await userRepo.findOne({ where: { id: input.ownerId } });
        if (owner) venue.owner = owner;
      }

      await venueRepo.save(venue);
      return venueRepo.findOne({ where: { id: venue.id }, relations: ['owner'] });
    },

    updateVenue: async (
      _: unknown,
      { id, input }: { id: string; input: Partial<Venue> & { ownerId?: number } },
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const venueRepo = AppDataSource.getRepository(Venue);
      const userRepo = AppDataSource.getRepository(User);

      const venue = await venueRepo.findOne({ where: { id: parseInt(id) } });
      if (!venue) throw new Error('Venue not found');

      Object.assign(venue, {
        name: input.name ?? venue.name,
        imgSrc: input.imgSrc ?? venue.imgSrc,
        location: input.location ?? venue.location,
        capacity: input.capacity ?? venue.capacity,
        price: input.price ?? venue.price,
        suitability: input.suitability ?? venue.suitability,
      });

      if (input.ownerId !== undefined) {
        const owner = await userRepo.findOne({ where: { id: input.ownerId } });
        if (owner) venue.owner = owner;
      }

      await venueRepo.save(venue);
      return venueRepo.findOne({ where: { id: venue.id }, relations: ['owner'] });
    },

    deleteVenue: async (
      _: unknown,
      { id }: { id: string },
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const venueRepo = AppDataSource.getRepository(Venue);
      const venue = await venueRepo.findOne({ where: { id: parseInt(id) } });
      if (!venue) throw new Error('Venue not found');
      await venueRepo.remove(venue);
      return true;
    },

    toggleFeaturedVenue: async (
      _: unknown,
      { id }: { id: string },
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const venueRepo = AppDataSource.getRepository(Venue);
      const venue = await venueRepo.findOne({ where: { id: parseInt(id) } });
      if (!venue) throw new Error('Venue not found');

      venue.featured = !venue.featured;
      await venueRepo.save(venue);
      return venueRepo.findOne({ where: { id: venue.id }, relations: ['owner'] });
    },

    triggerVenueDiscount: async (
      _: unknown,
      { venueId }: { venueId: string },
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const venueRepo = AppDataSource.getRepository(Venue);
      const venue = await venueRepo.findOne({
        where: { id: parseInt(venueId) },
        relations: ['owner'],
      });
      if (!venue) throw new Error('Venue not found');

      venue.onSale = true;
      await venueRepo.save(venue);

      pubsub.publish(VENUE_DISCOUNT_EVENT, {
        venueDiscountNotification: {
          venue,
          message: `🎉 ${venue.name} is now on sale with ${DISCOUNT_PERCENT}% discount!`,
          discountPercent: DISCOUNT_PERCENT,
        },
      });

      return venue;
    },

    clearVenueDiscount: async (
      _: unknown,
      { venueId }: { venueId: string },
      { token }: { token: string }
    ) => {
      requireAdmin(token);
      const venueRepo = AppDataSource.getRepository(Venue);
      const venue = await venueRepo.findOne({
        where: { id: parseInt(venueId) },
        relations: ['owner'],
      });
      if (!venue) throw new Error('Venue not found');

      venue.onSale = false;
      await venueRepo.save(venue);
      return venue;
    },
  },

  Subscription: {
    venueDiscountNotification: {
      subscribe: () => pubsub.asyncIterator([VENUE_DISCOUNT_EVENT]),
    },
  },
};
