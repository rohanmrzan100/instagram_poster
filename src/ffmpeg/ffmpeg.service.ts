import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fsp from 'fs/promises';
import * as fs from 'fs';
@Injectable()
export class FfmpegService {
  async createInstagramVideo(
    base64Image: string,
    audioPath: string,
    outputPath: string,
  ): Promise<string> {
    console.log(`Audio file path provided: ${audioPath}`);

    // Ensure base64Image is a string
    const base64String = typeof base64Image === 'string' ? base64Image : String(base64Image);

    // Extract actual base64 data
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    const base64Data = matches ? matches[2] : base64String;

    const tempImagePath = path.join(process.cwd(), `${Date.now()}.png`);
    await fsp.writeFile(tempImagePath, base64Data, 'base64');
    console.log(`Temporary image created at: ${tempImagePath}`);

    const audioExists = fs.existsSync(audioPath);

    const cleanUpTempImage = async () => {
      try {
        await fsp.unlink(tempImagePath);
      } catch (err) {
        console.error(`Error cleaning up temp image: ${(err as Error).message}`);
      }
    };

    return new Promise((resolve, reject) => {
      const command = ffmpeg()
        .input(tempImagePath)
        .inputOptions(['-loop', '1', '-framerate', '25']);

      if (audioExists) {
        command
          .input(audioPath)
          .outputOptions([
            '-map',
            '0:v',
            '-map',
            '1:a',
            '-r',
            '25',
            '-t',
            '30',
            '-c:v',
            'h264',
            '-tune',
            'stillimage',
            '-crf',
            '18',
            '-c:a',
            'copy',
            '-pix_fmt',
            'yuv420p',
            '-max_muxing_queue_size',
            '1024',
          ]);
      } else {
        command.outputOptions([
          '-r',
          '25',
          '-t',
          '20',
          '-c:v',
          'h264',
          '-tune',
          'stillimage',
          '-crf',
          '18',
          '-pix_fmt',
          'yuv420p',
          '-shortest',
        ]);
      }

      command
        .output(outputPath)
        .on('progress', (progress) => {
          if (progress.percent !== undefined) {
            console.log(`Processing: ${progress.percent.toFixed(2)}% done`);
          } else {
            console.log('Processing...');
          }
        })
        .on('error', async (err, stdout, stderr) => {
          console.error(`Error during FFmpeg processing: ${err.message}`);
          if (stdout) console.error('ffmpeg stdout:\n' + stdout);
          if (stderr) console.error('ffmpeg stderr:\n' + stderr);
          await cleanUpTempImage();
          reject(err);
        })
        .on('end', async () => {
          console.log('Video generated successfully.');
          await cleanUpTempImage();
          resolve(outputPath);
        })
        .run();
    });
  }

  async compressImage(inputPath: string): Promise<string> {
    const dir = path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath)); // no extension
    const outputPath = path.join(dir, `${baseName}_compressed.jpg`);

    // Check if file exists and is not empty
    if (!fs.existsSync(inputPath) || fs.statSync(inputPath).size === 0) {
      throw new Error('Input file does not exist or is empty.');
    }

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .outputOptions('-q:v', '10') // use array syntax for safety
        .on('start', (commandLine) => {
          console.log('FFmpeg started with command:', commandLine);
        })
        .on('progress', () => {
          console.log('Processing...');
        })
        .on('end', () => {
          try {
            fs.unlinkSync(inputPath); // delete original image
          } catch (err) {
            console.warn('Failed to delete original file:', err);
          }
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Error compressing img:', err.message);
          reject(err);
        })
        .run();
    });
  }
}
