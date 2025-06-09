import { Controller, Post } from '@nestjs/common';
import { TiktokService } from './tiktok.service';

@Controller('api/tiktok')
export class TiktokController {
  constructor(private tiktokService: TiktokService) {}

  @Post('upload')
  async Post() {
    return await this.tiktokService.Post();
  }
}
