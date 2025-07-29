import { CustomBaseEntity } from '../../../models/customBase.entity';
import { Entity, Column, OneToMany } from 'typeorm';
@Entity()
export class User extends CustomBaseEntity {
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ unique: true })
  firebaseId: string;

  @Column({nullable: true})
  fcmToken: string;
}
