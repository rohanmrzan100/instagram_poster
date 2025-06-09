import { Controller, Get, Post } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Controller('api/instagram')
export class InstagramController {
  constructor(private instagramService: InstagramService) {}

  @Post('publish/quotes')
  async publishContent(): Promise<any> {
    return this.instagramService.publishQuotesContent();
  }

  @Post('publish/football')
  async publishFootballOnInstagram(): Promise<any> {
    return this.instagramService.publishFootballOnInstagram();
  }
}
