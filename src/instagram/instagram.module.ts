import { Module } from '@nestjs/common';
import { InstagramController } from './instagram.controller';
import { HttpModule } from '@nestjs/axios';
import { InstagramService } from './instagram.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { ImageGenerationService } from 'src/canva/canva.service';
import { GroqService } from 'src/groq/groq.service';
import { RedditService } from 'src/reddit/reddit.service';

@Module({
  imports: [HttpModule],
  controllers: [InstagramController],
  exports: [InstagramModule, InstagramService],
  providers: [
    InstagramService,
    CloudinaryService,
    FfmpegService,
    ImageGenerationService,
    GroqService,
    RedditService,
  ],
})
export class InstagramModule {}
