import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import { ImageGenerationService } from 'src/canva/canva.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';
import { GroqService } from 'src/groq/groq.service';
import { RedditService } from 'src/reddit/reddit.service';
import {
  getNextFootballIndex,
  getNextQuoteIndex,
  getRandomIndex,
  updateFootballCounter,
  updateQuoteCounter,
} from 'src/utils/counter';

export interface PublishContent {
  author: string;
  quote: string;
  caption: string;
}

@Injectable()
export class InstagramService {
  private readonly INSTAGRAM_QUOTES_USER_ID: string;
  private readonly INSTAGRAM_FOOTBALL_USER_ID: string;
  private readonly INSTAGRAM_QUOTES_ACCESS_TOKEN: string;
  private readonly INSTAGRAM_FOOTBALL_ACCESS_TOKEN: string;
  constructor(
    private cloudinaryService: CloudinaryService,
    private ffmpegService: FfmpegService,
    private imagegenerationService: ImageGenerationService,
    private groqService: GroqService,
    private httpService: HttpService,
    private redditService: RedditService,
  ) {
    this.INSTAGRAM_QUOTES_USER_ID = process.env.INSTAGRAM_QUOTES_USER_ID ?? '';
    this.INSTAGRAM_FOOTBALL_USER_ID = process.env.INSTAGRAM_FOOTBALL_USER_ID ?? '';
    this.INSTAGRAM_QUOTES_ACCESS_TOKEN = process.env.INSTAGRAM_QUOTES_ACCESS_TOKEN ?? '';
    this.INSTAGRAM_FOOTBALL_ACCESS_TOKEN = process.env.INSTAGRAM_FOOTBALL_ACCESS_TOKEN ?? '';
  }

  private async createContainer(
    url: string,
    caption: string,
    INSTAGRAM_ACCESS_TOKEN: string,
    INSTAGRAM_USER_ID: string,
  ) {
    try {
      const creationResponse = await this.httpService.axiosRef.post(
        `https://graph.instagram.com/v21.0/${INSTAGRAM_USER_ID}/media`,
        {
          video_url: url,
          media_type: 'REELS',
          caption: caption,
          upload_type: 'resumable',
        },
        {
          headers: {
            Authorization: `Bearer ${INSTAGRAM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Container created ....');

      return creationResponse.data.id;
    } catch (error) {
      console.error('Failed to create container', error.response?.data || error.message);

      throw new HttpException(
        error.response?.data || 'Failed to create container',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async PublsihContainer(
    container_id: string,
    INSTAGRAM_USER_ID: string,
    urlToDelete: string,
    INSTAGRAM_ACCESS_TOKEN: string,
  ) {
    try {
      const publishResponse = await this.httpService.axiosRef.post(
        `https://graph.instagram.com/v21.0/${INSTAGRAM_USER_ID}/media_publish`,
        {
          creation_id: container_id,
        },
        {
          headers: {
            Authorization: `Bearer ${INSTAGRAM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Published to instagram sucessfully !');
    } catch (error) {
      console.error('Failed to publish container', error.response?.data || error.message);

      throw new HttpException(
        error.response?.data || 'Failed to publish container',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    } finally {
      await this.cloudinaryService.deletefromCloudinary(urlToDelete);
    }
  }
  private async delay(ms: number) {
    const seconds = Math.floor(ms / 1000);

    for (let i = seconds; i > 0; i--) {
      console.log(`${i} second(s) remaining...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const remainingMs = ms % 1000;
    if (remainingMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingMs));
    }
  }
  async publishQuotesContent() {
    const randomArrayIndex = getNextQuoteIndex();

    const data = await this.redditService.getQuotes('Fantasy', 'upl8xu', randomArrayIndex);
    const image = await this.imagegenerationService.generateImage({
      authorText: data.author,
      quote: data.quote,
    });

    const randomAudioIndex = getRandomIndex(0, 4);

    const generatedVideo = await this.ffmpegService.createInstagramVideo(
      image,
      path.resolve(__dirname, `../../client/sound${randomAudioIndex}.mp3`),
      path.resolve(__dirname, `../../${Date.now()}.mp4`),
    );

    const { cloudinaryUrl, public_id } =
      await this.cloudinaryService.uploadToCloudinary(generatedVideo);

    const contanerId = await this.createContainer(
      cloudinaryUrl,
      data.caption,
      this.INSTAGRAM_QUOTES_ACCESS_TOKEN,
      this.INSTAGRAM_QUOTES_USER_ID,
    );
    await this.delay(50000);
    await this.PublsihContainer(
      contanerId,
      this.INSTAGRAM_QUOTES_USER_ID,
      public_id,
      this.INSTAGRAM_QUOTES_ACCESS_TOKEN,
    );
    updateQuoteCounter(randomArrayIndex, 50);

    return 'success';
  }
  async publishFootballOnInstagram() {
    const {
      title,
      filePath: img_local,
      comments,
    } = await this.redditService.getSubreddit('soccercirclejerk');

    const postIndex = getNextFootballIndex();

    const { title: newTitle, caption } = await this.groqService.createFootballTitle(
      title,
      comments,
    );
    console.log({ newTitle, caption });
    const newImg = await this.ffmpegService.compressImage(img_local);
    const { cloudinaryUrl } = await this.cloudinaryService.uploadImageToCloudinary(newImg);
    const post_img = await this.imagegenerationService.generateFootballImage(
      newTitle,
      cloudinaryUrl,
    );
    const randomAudioIndex = getRandomIndex(0, 2);
    const video = await this.ffmpegService.createInstagramVideo(
      post_img,
      path.resolve(__dirname, `../../client/sound${randomAudioIndex}.mp3`),
      path.resolve(__dirname, `../../${Date.now()}.mp4`),
    );

    const { cloudinaryUrl: video_url, public_id } =
      await this.cloudinaryService.uploadToCloudinary(video);

    const contanerId = await this.createContainer(
      video_url,
      caption,
      this.INSTAGRAM_FOOTBALL_ACCESS_TOKEN,
      this.INSTAGRAM_FOOTBALL_USER_ID,
    );
    await this.delay(60000);
    await this.PublsihContainer(
      contanerId,
      this.INSTAGRAM_FOOTBALL_USER_ID,
      public_id,
      this.INSTAGRAM_FOOTBALL_ACCESS_TOKEN,
    );
    updateFootballCounter(postIndex, 10);

    return 'Success';
  }
}
