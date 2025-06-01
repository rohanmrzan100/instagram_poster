import { Module } from '@nestjs/common';

import { ImageGenerationService } from './canva.service';

@Module({
  providers: [ImageGenerationService, CanvaModule],
  exports: [CanvaModule],
})
export class CanvaModule {}
