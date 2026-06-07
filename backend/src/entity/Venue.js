"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venue = void 0;
const typeorm_1 = require("typeorm");
//importing entities for the relationships
const Booking_1 = require("./Booking");
const BlockedDate_1 = require("./BlockedDate");
const User_1 = require("./User");
let Venue = class Venue {
    _setOwnerFullname() {
        this.ownerFullname = this.owner?.fullName ?? null;
        // this.venueOwner = {
        //   name,
        //   id,
        //   age...
        // }
    }
};
exports.Venue = Venue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Venue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Venue.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Venue.prototype, "imgSrc", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Venue.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Venue.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Venue.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Venue.prototype, "suitability", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Venue.prototype, "featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Venue.prototype, "onSale", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Venue.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Venue.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Booking_1.Booking, (booking) => booking.venue),
    __metadata("design:type", Array)
], Venue.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => BlockedDate_1.BlockedDate, (blockedDate) => blockedDate.venue),
    __metadata("design:type", Array)
], Venue.prototype, "blockedDates", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (owner) => owner.venues, { onDelete: 'CASCADE', eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ownerId' }),
    __metadata("design:type", User_1.User)
], Venue.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.RelationId)((venue) => venue.owner),
    __metadata("design:type", Number)
], Venue.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.AfterLoad)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Venue.prototype, "_setOwnerFullname", null);
exports.Venue = Venue = __decorate([
    (0, typeorm_1.Entity)()
], Venue);
//# sourceMappingURL=Venue.js.map