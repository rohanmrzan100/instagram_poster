import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { InstagramService } from 'src/instagram/instagram.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { ImageGenerationService } from 'src/canva/canva.service';
import { HttpModule } from '@nestjs/axios';
import { TaskController } from './task.controller';
import { GroqService } from 'src/groq/groq.service';
import { RedditService } from 'src/reddit/reddit.service';
@Module({
  imports: [HttpModule],
  providers: [
    TaskService,
    InstagramService,
    CloudinaryService,
    FfmpegService,
    ImageGenerationService,
    GroqService,
    RedditService,
  ],
  exports: [TaskModule],
  controllers: [TaskController],
})
export class TaskModule {}
