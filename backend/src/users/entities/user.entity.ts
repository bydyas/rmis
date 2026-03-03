import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role, type TRole } from '../enums/role.enum';
import { IUser } from '../types/user.type';

@Entity({ name: 'users' })
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ enum: Role, default: Role.USER })
  role: TRole;
}
