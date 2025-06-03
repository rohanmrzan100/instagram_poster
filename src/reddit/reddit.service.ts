import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import qs from 'qs';
@Injectable()
export class RedditService {
  constructor(private readonly httpService: HttpService) {}

  async getToken() {
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
  async getIdentity(access_token: string) {
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
  async getSubreddit(access_token: string) {
    const subreddit = 'askreddit';
    try {
      const response = await this.httpService.axiosRef.get(
        `https://oauth.reddit.com/r/${subreddit}/top`,
        {
          headers: {
            Authorization: `Bearer ` + access_token,
            'User-Agent': 'MyRedditBot/1.0 by ' + process.env.REDDIT_USERNAME,
          },
        },
      );
      const title = response.data.data.children[0].data.title;
      const id = response.data.data.children[0].data.name.split('_')[1];
      const comments = await this.getComments(access_token, subreddit, id);
      return { title, comments };
    } catch (error) {
      console.log(error);
      throw new HttpException('Error getting Identity', HttpStatusCode.Forbidden);
    }
  }
  private async getComments(access_token: string, subreddit: string, id: string) {
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
        arr.push(cmnt);
      }
      return arr;
    } catch (error) {
      console.log(error);
      throw new HttpException('Error getting Identity', HttpStatusCode.Forbidden);
    }
  }
}
