import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/entity/user.entity';

@Entity('users_tokens')
@Index('IDX_users_tokens_token', ['token'])
@Index('IDX_users_tokens_refresh_token', ['refreshToken'])
export class BearerToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 512 })
  token: string;

  @Column({ length: 512, nullable: true })
  refreshToken: string | null;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  refreshExpiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
