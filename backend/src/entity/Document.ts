import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

//importing booking entity for the relationship with document entity
import { Booking } from "./Booking";

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  //foreign key for booking.
  @Column()
  bookingId: number;

 //foreign key forthe user that uploaded the document
  @Column()
  uploadedById: number;

  //foreign key for the venue of the booking, associated with the document.
  @Column()
  venueId: number;
 
  //foreign key for the hirer of the booking, assocated with the document.
  @Column()
  documentName: string;
  

  //document type for identifying.
  @Column()
  documentType: "contract" | "invoice" | "policy" | "receipt" | "other";

  //URL or file path to the stored document.
  @Column()
  documentUrl: string;

 //optional description or notes about the document/ 
  @Column({ nullable: true })
  description: string;

  //timestap for uploaded doc
  @CreateDateColumn()
  createdAt: Date;
 
  //timestamp for update to the doc
  @UpdateDateColumn()
  updatedAt: Date;

  // Many documents can belong to one booking
  @ManyToOne(() => Booking, (booking) => booking.documents, {
  onDelete: "CASCADE",
   })
  @JoinColumn({ name: "bookingId" })
  booking: Booking;
}