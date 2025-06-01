import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
export interface PublishContent {
  media_url: string;
  ig_id: string;
}
const bgImages = [
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748793655/samples/aebf440644c1232bc35440a3484dda9b_wkq485.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748793655/samples/image2_kxpdhb.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748793655/samples/9f8dce63f7b6e7c3c25c582d18e56132_f2igtx.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748793655/samples/image3_cquaba.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748793655/samples/IMG_3628_vrl8ds.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748793655/samples/a0ebf912affd01e64ff9433f104e9f3b_xirkly.jpg',
];
@Injectable()
export class ImageGenerationService {
  private htmlFilePath = path.resolve(__dirname, '../../client/index.html');

  async generateImage({
    authorText,
    quote,
  }: {
    authorText: string;
    quote: string;
  }) {
    console.log(this.htmlFilePath);

    try {
      let html = await fs.readFile(this.htmlFilePath, 'utf-8');
      const browser = await puppeteer.launch({
        headless: true, // or `true` in older versions
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      await page.waitForFunction(
        () => (window as any).html2canvas !== undefined,
      );
      const randomIndex = Math.floor(Math.random() * bgImages.length);
      const selectedImage = bgImages[randomIndex];

      const imageDataUrl = await page.evaluate(
        async (quote: string, authorText: string, bgImage: string) => {
          const container = document.querySelector(
            '.quote-container',
          ) as HTMLElement;
          const quoteText = document.querySelector('.quote-text');
          const author = document.querySelector('.author');
          if (quoteText && author && container) {
            quoteText.textContent = quote;
            author.textContent = authorText ? '- ' + authorText : '';
            container.style.backgroundImage = `url('${bgImage}')`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
          }

          const canvas = await (window as any).html2canvas(container, {
            scale: 1,
            useCORS: true,
          });
          return canvas.toDataURL('image/png');
        },
        quote,
        authorText,
        selectedImage,
      );

      await browser.close();

      return imageDataUrl;
    } catch (error) {
      console.error('Image generation failed', error);
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
