import { Controller, Get, Post } from '@nestjs/common';
import { RedditService } from './reddit.service';

@Controller('api/reddit')
export class RedditController {
  constructor(private redditService: RedditService) {}
  @Get()
  callReddit() {
    return 'Hello reddit ! ';
  }

  @Post()
  async Here() {
    const { access_token, token_type } = await this.redditService.getToken();
    return await this.redditService.getSubreddit(access_token);
  }
}
