import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;
  
  //name of the place
  @Column()
  name: string;
 
  @Column()
  ownerId: number;
 
  //image source for the venue card
  @Column()
  imgSrc: string;

  @Column()
  location: string;

  @Column()
  capacity: number;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}