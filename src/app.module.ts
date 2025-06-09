import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { InstagramModule } from './instagram/instagram.module';
import { CanvaModule } from './canva/canva.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FfmpegModule } from './ffmpeg/ffmpeg.module';
import { ScheduleModule } from '@nestjs/schedule';

import { TaskModule } from './task/task.module';
import { RedditModule } from './reddit/reddit.module';
import { GroqModule } from './groq/groq.module';
import { TiktokModule } from './tiktok/tiktok.module';

@Module({
  imports: [
    InstagramModule,
    InstagramModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    ScheduleModule.forRoot(),
    CloudinaryModule,
    CanvaModule,
    FfmpegModule,
    TaskModule,
    RedditModule,
    GroqModule,
    TiktokModule,
  ],
})
export class AppModule {}
