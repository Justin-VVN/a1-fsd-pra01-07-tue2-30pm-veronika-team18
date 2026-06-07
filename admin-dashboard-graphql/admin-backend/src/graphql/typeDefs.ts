export const typeDefs = `#graphql
  type User {
    id: ID!
    fullName: String!
    email: String!
    type: String!
    createdAt: String!
  }

  type Venue {
    id: ID!
    name: String!
    imgSrc: String!
    location: String!
    capacity: Int!
    price: Float!
    suitability: [String]
    featured: Boolean!
    onSale: Boolean!
    owner: User
    ownerId: Int
    createdAt: String!
  }

  type Booking {
    id: ID!
    hirerId: Int!
    venueId: Int!
    checkIn: String!
    checkOut: String!
    status: String!
    eventTime: String
    rating: Int
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    username: String!
  }

  type PopularVenueReport {
    venue: Venue!
    bookingCount: Int!
    mostPopularDay: String
    mostPopularTimeSlot: String
  }

  type ActiveHirerReport {
    hirerId: Int!
    hirerName: String!
    hirerEmail: String!
    totalBookings: Int!
    successfulBookings: Int!
  }

  type DiscountNotification {
    venue: Venue!
    message: String!
    discountPercent: Int!
  }

  input VenueInput {
    name: String!
    imgSrc: String!
    location: String!
    capacity: Int!
    price: Float!
    suitability: [String]
    ownerId: Int
  }

  type Query {
    venues: [Venue!]!
    venue(id: ID!): Venue
    vendors: [User!]!
    users(type: String): [User!]!
    bookings: [Booking!]!
    topPopularVenues: [PopularVenueReport!]!
    topActiveHirers: [ActiveHirerReport!]!
    featuredVenues: [Venue!]!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    assignVendorToVenue(venueId: ID!, vendorId: ID!): Venue!
    createVenue(input: VenueInput!): Venue!
    updateVenue(id: ID!, input: VenueInput!): Venue!
    deleteVenue(id: ID!): Boolean!
    toggleFeaturedVenue(id: ID!): Venue!
    triggerVenueDiscount(venueId: ID!): Venue!
    clearVenueDiscount(venueId: ID!): Venue!
  }

  type Subscription {
    # Fires whenever an admin marks a venue on sale with 45% discount
    venueDiscountNotification: DiscountNotification!
  }
`;
