import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';
import { InstagramService, PublishContent } from './instagram.service';

@Controller('api/instagram')
export class InstagramController {
  constructor(private instagramService: InstagramService) {}

  @Get('publish')
  async helloworld(): Promise<string> {
    return 'hello instagram ! ';
  }

  @Post('publish')
  async publishContent(@Body() data: PublishContent): Promise<any> {
    return this.instagramService.publishContent(data);
  }
}
  