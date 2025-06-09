import { Controller, Get, Param, Post } from '@nestjs/common';
import { ImageGenerationService } from 'src/canva/canva.service';
import { RedditService } from './reddit.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import * as path from 'path';
import { GroqService } from 'src/groq/groq.service';

@Controller('api/reddit')
export class RedditController {
  constructor(
    private redditService: RedditService,
    private imageGenerationService: ImageGenerationService,
    private cloudinaryService: CloudinaryService,
    private ffmpegService: FfmpegService,
    private groqService: GroqService,
  ) {}
  @Get()
  callReddit() {
    return 'Hello reddit ! ';
  }

  @Get()
  async Here() {
    return await this.redditService.getSubreddit('askreddit');
  }
  @Get('/:id')
  async GetTopPostAndComment(@Param() params: any) {
    return await this.redditService.getSubreddit(params.id);
  }
  @Post('record')
  async RecordVideo() {
    return await this.imageGenerationService.recordVideo();
  }
  @Post('post-quotes')
  async postQuotes() {
    return await this.redditService.getQuotesAll();
  }

}
