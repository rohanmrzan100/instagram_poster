import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { InstagramService } from 'src/instagram/instagram.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { ImageGenerationService } from 'src/canva/canva.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  providers: [
    TaskService,
    InstagramService,
    CloudinaryService,
    FfmpegService,
    ImageGenerationService,
  ],
  exports: [TaskModule],
})
export class TaskModule {}
