import { Module } from '@nestjs/common';
import { RedditController } from './reddit.controller';
import { RedditService } from './reddit.service';
import { HttpModule } from '@nestjs/axios';
import { ImageGenerationService } from 'src/canva/canva.service';
import { GroqService } from 'src/groq/groq.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';

@Module({
  imports: [HttpModule],
  controllers: [RedditController],
  providers: [RedditService, ImageGenerationService, GroqService, CloudinaryService, FfmpegService],
})
export class RedditModule {}
