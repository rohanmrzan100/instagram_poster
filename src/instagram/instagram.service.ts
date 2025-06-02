import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import { ImageGenerationService } from 'src/canva/canva.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { GroqService } from 'src/groq/groq.service';

export interface PublishContent {
  author: string;
  quote: string;
  caption: string;
}

@Injectable()
export class InstagramService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private ffmpegService: FfmpegService,
    private imagegenerationService: ImageGenerationService,
    private groqService: GroqService,
    private readonly httpService: HttpService,
  ) {}

  private ig_id = process.env.INSTAGRAM_USER_ID ?? '';
  private async createContainer(url: string, caption: string) {
    try {
      if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
        throw new HttpException(
          'Instagram access token is not set',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const creationResponse = await this.httpService.axiosRef.post(
        `https://graph.instagram.com/v21.0/${this.ig_id}/media`,
        {
          video_url: url,
          media_type: 'REELS',
          caption:
            caption +
            '#lovequotes #quotesaboutlove #quotesaboutlife #quoteslover #quoteslove #aboutlove #lovequotesforher  #quotesdaily #quoteoftheday #poetry #love #couplegoals',
          upload_type: 'resumable',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(creationResponse.data);

      return creationResponse.data.id;
    } catch (error) {
      console.error('Failed to create container', error.response?.data || error.message);

      throw new HttpException(
        error.response?.data || 'Failed to create container',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async PublsihContainer(container_id: string, ig_id: string) {
    try {
      const publishResponse = await this.httpService.axiosRef.post(
        `https://graph.instagram.com/v21.0/${ig_id}/media_publish`,
        {
          creation_id: container_id,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(publishResponse.data);
      return 'Published to instagram sucessfully !';
    } catch (error) {
      console.error('Failed to publish container', error.response?.data || error.message);

      throw new HttpException(
        error.response?.data || 'Failed to publish container',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async publishContent() {
    const data: PublishContent = await this.groqService.callGROQAPI();
    const image = await this.imagegenerationService.generateImage({
      authorText: data.author,
      quote: data.quote,
    });
    console.log('Image generated ......');
    const generatedVideo = await this.ffmpegService.createInstagramVideo(
      image,
      path.resolve(__dirname, '../../client/sound.mp3'),
      path.resolve(__dirname, `../../${Date.now()}.mp4`),
    );
    console.log('Video generated ......', generatedVideo);
    const cloudinaryUrl = await this.cloudinaryService.uploadToCloudinary(generatedVideo);
    console.log('Video uploaded to cloudinary ......', cloudinaryUrl);
    const contanerId = await this.createContainer(cloudinaryUrl, data.caption);
    await this.delay(30000);
    const publishResponse = await this.PublsihContainer(contanerId, this.ig_id);
    console.log({ publishResponse });
    return 'success';
  }
}
