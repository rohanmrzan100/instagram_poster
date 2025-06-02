import { Module } from '@nestjs/common';
import { RedditController } from './reddit.controller';
import { RedditService } from './reddit.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [RedditController],
  providers: [RedditService],
})
export class RedditModule {}
