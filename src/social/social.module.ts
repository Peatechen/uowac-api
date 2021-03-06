import { Module } from '@nestjs/common';
import { CommentService } from './service/comment.service';
import { CommentController } from './controller/comment.controller';
import { VisitController } from './controller/visit.controller';
import { VisitService } from './service/visit.service';
import { AuthModule } from '../auth/auth.module';
import { LikeController } from './controller/like.controller';
import { LikeService } from './service/like.service';
import { StatsController } from './controller/stats.controller';
import { StatsService } from './service/stats.service';
/**
 * Module for social and user engagement features.
 * Including likes, comments, visits and statistics for each of them
 *
 * Created by: Quang Minh Nguyen (qmn1312)
 */
@Module({
  imports: [AuthModule],
  controllers: [
    CommentController,
    VisitController,
    LikeController,
    StatsController,
  ],
  providers: [CommentService, VisitService, LikeService, StatsService],
})
export class SocialModule {}
