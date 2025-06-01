import { Module } from '@nestjs/common';
import { FfmpegService } from './ffmpeg.service';

@Module({
  providers: [FfmpegService],
  exports: [FfmpegModule, FfmpegService],
})
export class FfmpegModule {}
