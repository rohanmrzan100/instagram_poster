import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import axios, { HttpStatusCode } from 'axios';
import qs from 'qs';
import { ImageGenerationService } from 'src/canva/canva.service';
import { GroqService } from 'src/groq/groq.service';
import * as fs from 'fs';
import * as path from 'path';
import { getNextFootballIndex, getRandomIndex } from 'src/utils/counter';
@Injectable()
export class RedditService {
  constructor(
    private readonly httpService: HttpService,
    private groqService: GroqService,
    private imageGenerationService: ImageGenerationService,
  ) {}

  private async getToken() {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const data = qs.stringify({
      grant_type: 'password',
      username,
      password,
      scope: 'read',
    });

    try {
      const response = await this.httpService.axiosRef.post(
        `https://www.reddit.com/api/v1/access_token`,
        data,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'MyRedditBot/1.0 by ' + username,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(error.response?.data || error.message);
      throw new HttpException('Error getting token', HttpStatusCode.Forbidden);
    }
  }
  async getIdentity() {
    const { access_token } = await this.getToken();
    try {
      const response = await this.httpService.axiosRef.get(`https://oauth.reddit.com/api/v1/me`, {
        headers: {
          Authorization: `Bearer ` + access_token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MyRedditBot/1.0 by ' + process.env.REDDIT_USERNAME,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error.response?.data || error.message);
      throw new HttpException('Error getting Identity', HttpStatusCode.Forbidden);
    }
  }
  async getSubreddit(subreddit: string) {
    const index = getNextFootballIndex() % 5;

    const { access_token } = await this.getToken();
    try {
      const response = await this.httpService.axiosRef.get(
        `https://oauth.reddit.com/r/${subreddit}/hot?t=day&count=10&g=IN`,
        {
          headers: {
            Authorization: `Bearer ` + access_token,
            'User-Agent': 'MyRedditBot/1.0 by ' + process.env.REDDIT_USERNAME,
          },
        },
      );
      const title = response.data.data.children[index].data.title;
      const image_uri = response.data.data.children[index].data.url_overridden_by_dest;
      const id = response.data.data.children[index].data.name.split('_')[1];
      const commentIndex = getRandomIndex(0, 4);
      const comments = await this.getComments(subreddit, id);

      const downloadsDir = path.resolve(__dirname, '../../client');

      const filename = `reddit-image-${id}${path.extname(image_uri) || '.jpg'}`;
      const filePath = path.join(downloadsDir, filename);
      if (image_uri) {
        // Create write stream
        const writer = fs.createWriteStream(filePath);

        // Fetch image as stream
        const imageResponse = await axios.get(image_uri, { responseType: 'stream' });

        // Pipe image data into file
        imageResponse.data.pipe(writer);

        // Wait for stream to finish
        await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => resolve());
          writer.on('error', reject);
        });
      }

      return { title, filePath, comments: comments[commentIndex] };
    } catch (error) {
      console.log(error);
      throw new HttpException('Error getting Identity', HttpStatusCode.Forbidden);
    }
  }
  private async getComments(subreddit: string, id: string) {
    const { access_token } = await this.getToken();
    const url = `https://oauth.reddit.com/r/${subreddit}/comments/${id}`;

    try {
      const response = await this.httpService.axiosRef.get(url, {
        headers: {
          Authorization: `Bearer ` + access_token,
          'User-Agent': 'MyRedditBot/1.0 by ' + process.env.REDDIT_USERNAME,
        },
      });

      let arr: string[] = [];
      for (let i = 1; i <= 5; i++) {
        const cmnt = response.data[1].data.children[i].data.body as string;
        if (cmnt.includes('https') || cmnt.includes('gif')) {
          continue;
        }
        arr.push(cmnt);
      }
      return arr;
    } catch (error) {
      console.log(error);
      throw new HttpException('Error getting Identity', HttpStatusCode.Forbidden);
    }
  }
  async getQuotes(subreddit: string, id: string, index: number) {
    const url = `https://oauth.reddit.com/r/${subreddit}/comments/${id}`;
    const { access_token } = await this.getToken();
    try {
      const response = await this.httpService.axiosRef.get(url, {
        headers: {
          Authorization: `Bearer ` + access_token,
          'User-Agent': 'MyRedditBot/1.0 by ' + process.env.REDDIT_USERNAME,
        },
      });

      let arr: string[] = [];
      for (let i = 0; i < response.data[1].data.children.length; i++) {
        const cmnt = response.data[1].data.children[i].data.body as string;
        arr.push(cmnt);
      }

      console.log(arr.length);

      const responseObj = await this.groqService.createQuoteFromString(arr[index]);
      return responseObj;
    } catch (error) {
      console.log(error);
      throw new HttpException('Error getting Identity', HttpStatusCode.Forbidden);
    }
  }

  async getQuotesAll() {
    const url = `https://oauth.reddit.com/r/quotes/comments/28vo7b`;
    const { access_token } = await this.getToken();
    try {
      const response = await this.httpService.axiosRef.get(url, {
        headers: {
          Authorization: `Bearer ` + access_token,
          'User-Agent': 'MyRedditBot/1.0 by ' + process.env.REDDIT_USERNAME,
        },
      });

      let arr: string[] = [];
      for (let i = 0; i < response.data[1].data.children.length; i++) {
        const cmnt = response.data[1].data.children[i].data.body as string;
        arr.push(cmnt);
      }

      return arr;
    } catch (error) {
      console.log(error);
      throw new HttpException('Error getting Identity', HttpStatusCode.Forbidden);
    }
  }
}
