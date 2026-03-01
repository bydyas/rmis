import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities';

@Entity({ name: 'sessions' })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  refreshToken: string;

  @Column()
  lang: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column({ default: false })
  isInvalidated: boolean;

  @Column('timestamp')
  expiresAt: Date;

  @Column('timestamp')
  lastActivity: Date;

  @ManyToOne(() => User, (user) => user.sessions)
  user: User;
}
