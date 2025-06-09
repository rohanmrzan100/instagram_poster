import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
export interface PublishContent {
  media_url: string;
  ig_id: string;
}
const bgImages = [
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748931611/samples/image2_cv7uwe.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748931611/samples/IMG_3628_vsc8pk.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748931611/samples/aebf440644c1232bc35440a3484dda9b_qwetkq.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748931611/samples/9f8dce63f7b6e7c3c25c582d18e56132_n1rc5w.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748931611/samples/image3_uzclqg.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748931611/samples/a0ebf912affd01e64ff9433f104e9f3b_msg0tz.jpg',
  'https://res.cloudinary.com/df2zfm1f2/image/upload/v1748931610/samples/696ddef4b7741a0de8e9889ea5c8eb8f_b2rhqr.jpg',
];

@Injectable()
export class ImageGenerationService {
  private htmlFilePath = path.resolve(__dirname, '../../client/football.html');

  async generateImage({ authorText, quote }: { authorText: string; quote: string }) {
    const htmlFilePath = path.resolve(__dirname, '../../client/index.html');
    try {
      let html = await fsp.readFile(htmlFilePath, 'utf-8');
      // Check if Chrome exists
      if (!fs.existsSync('/usr/bin/google-chrome')) {
        throw new Error('Chrome executable not found at /usr/bin/google-chrome');
      }

      const browser = await puppeteer.launch({
        headless: true, // or `true` in older versions
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/usr/bin/google-chrome',
      });
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      await page.waitForFunction(() => (window as any).html2canvas !== undefined);
      const randomIndex = Math.floor(Math.random() * bgImages.length);
      const selectedImage = bgImages[randomIndex];

      const imageDataUrl = await page.evaluate(
        async (quote: string, authorText: string, bgImage: string) => {
          const container = document.querySelector('.quote-container') as HTMLElement;
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
      console.log('Image generated ......');
      return imageDataUrl;
    } catch (error) {
      console.error('Image generation failed', error);
      return new HttpException('Image generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async recordVideo(): Promise<string | HttpException> {
    const htmlFilePath = path.resolve(__dirname, '../../client/reddit.html');

    try {
      if (!fs.existsSync('/usr/bin/google-chrome')) {
        throw new Error('Chrome executable not found at /usr/bin/google-chrome');
      }
      const containerWidth = 1180;
      const containerHeight = 2020;

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/usr/bin/google-chrome',
        defaultViewport: { width: containerWidth, height: containerHeight },
      });

      const page = await browser.newPage();

      const outputDir = path.join(__dirname, '../../output');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

      const videoPath = path.join(outputDir, 'reddit-container.mp4');

      await page.goto(`file://${htmlFilePath}`, { waitUntil: 'networkidle2' });

      const recorder = new PuppeteerScreenRecorder(page, {
        followNewTab: true,
        fps: 30,
        videoFrame: {
          width: containerWidth,
          height: containerHeight,
        },
        aspectRatio: '9:16',
      });

      await recorder.start(videoPath);

      await new Promise((r) => setTimeout(r, 20000));

      await recorder.stop();
      await browser.close();

      console.log(`🎥 Video recorded at ${videoPath}`);
      return videoPath;
    } catch (error) {
      console.error('recordVideo failed:', error);
      return new HttpException('Video recording failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateFootballImage(title: string, img_path: string) {
    let browser: puppeteer.Browser | null = null;
    try {
      let html = await fsp.readFile(this.htmlFilePath, 'utf-8');
      // Check if Chrome exists
      if (!fs.existsSync('/usr/bin/google-chrome')) {
        throw new Error('Chrome executable not found at /usr/bin/google-chrome');
      }
      browser = await puppeteer.launch({
        headless: true, // or `true` in older versions
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/usr/bin/google-chrome',
      });
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      await page.waitForFunction(() => (window as any).html2canvas !== undefined);

      const imageDataUrl = await page.evaluate(
        async (title: string, img_path: string) => {
          const container = document.querySelector('.meme-card') as HTMLElement;
          const header = document.querySelector('.meme-title') as HTMLElement;
          const image = document.querySelector('.meme-image') as HTMLElement;

          console.log(container, header, image);

          if (header && container && image) {
            header.textContent = title;
            image.style.backgroundImage = `url('${img_path}')`;
          }
          const canvas = await (window as any).html2canvas(container, {
            scale: 1,
            useCORS: true,
          });

          return canvas.toDataURL('image/png');
        },
        title,
        img_path,
      );

      console.log('Image generated ......');

      return imageDataUrl;
    } catch (error) {
      console.error('Image generation failed', error);
      throw new HttpException('Image generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await browser?.close();
    }
  }
}
