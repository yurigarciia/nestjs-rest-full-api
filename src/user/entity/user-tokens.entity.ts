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
export class BearerToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 512 })
  token: string;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
