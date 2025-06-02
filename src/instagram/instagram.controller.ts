import { Controller, Get, Post } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Controller('api/instagram')
export class InstagramController {
  constructor(private instagramService: InstagramService) {}

  @Get('publish')
  async helloworld(): Promise<string> {
    return 'hello instagram 123! ' + process.env.PORT;
  }


  @Post('publish')
  async publishContent(): Promise<any> {
    return this.instagramService.publishContent();
  }
}
