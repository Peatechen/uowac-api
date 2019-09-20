import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Sculpture } from '../../content/entity/sculpture.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  likeId: string;

  @ManyToOne(type => User, user => user.likes, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(type => Sculpture, sculpture => sculpture.likes, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sculptureId' })
  sculpture: Sculpture;

  @Column()
  sculptureId: string;

  @CreateDateColumn()
  likedTime: string;
}
