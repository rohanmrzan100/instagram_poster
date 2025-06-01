import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FfmpegService {
  async createInstagramVideo(
    base64Image: string,
    audioPath: string,
    outputPath: string,
  ): Promise<string> {
    console.log(`Audio file path provided: ${audioPath}`);

    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    let base64Data = base64Image;
    if (matches) {
      base64Data = matches[2];
    }

    // Create a temporary image file
    // Using a more robust temporary file naming (e.g., with tempfile or similar)
    // might be better in a production environment to avoid collisions.
    const tempImagePath = path.join(process.cwd(), `${Date.now()}.png`);
    await fs.writeFile(tempImagePath, base64Data, 'base64');
    console.log(`Temporary image created at: ${tempImagePath}`);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(tempImagePath)
        .inputOptions([
          '-loop',
          '1', // Loop the image indefinitely at the input stage
          '-framerate',
          '25', // Set the input framerate for the image
        ])
        .input(audioPath)
        .outputOptions([
          '-map',
          '0:v', // Map video from the first input (image)
          '-map',
          '1:a', // Map audio from the second input (sound)
          '-r',
          '25', // Output frame rate (matches the image input framerate)
          '-t',
          '30', // Set output duration to 30 seconds
          '-c:v',
          'h264', // Video codec
          '-tune',
          'stillimage', // Tune for still image input
          '-crf',
          '18', // Constant Rate Factor (quality setting for H.264)
          '-c:a',
          'copy', // <--- CHANGE THIS TO 'copy' for testing audio passthrough
          // '-b:a', '128k',   // Remove or comment out bitrate if using copy
          // '-ac', '2',       // Remove or comment out channels if using copy
          // '-ar', '44100',   // Remove or comment out sample rate if using copy
          '-pix_fmt',
          'yuv420p', // Pixel format for wider compatibility
          '-max_muxing_queue_size',
          '1024',
        ])
        .output(outputPath)
        .on('start', function (commandLine) {
          console.log('FFmpeg command: ' + commandLine);
        })
        .on('progress', function (progress) {
          // You might still see 'undefined%' initially, but it should resolve.
          if (progress.percent !== undefined) {
            console.log(`Processing: ${progress.percent.toFixed(2)}% done`);
          } else {
            console.log('Processing...'); // Indicate that processing is ongoing
          }
        })
        .on('error', async function (err, stdout, stderr) {
          console.error(`Error during FFmpeg processing: ${err.message}`);
          if (stdout) console.error('ffmpeg stdout:\n' + stdout);
          if (stderr) console.error('ffmpeg stderr:\n' + stderr);
          // Clean up temporary image on error
          await fs
            .unlink(tempImagePath)
            .catch((cleanupErr) =>
              console.error(
                `Error cleaning up temp image: ${cleanupErr.message}`,
              ),
            );
          reject(err);
        })
        .on('end', async function () {
          console.log(`Processing finished! Video saved as: ${outputPath}`);
          // Clean up temporary image
          await fs
            .unlink(tempImagePath)
            .catch((cleanupErr) =>
              console.error(
                `Error cleaning up temp image: ${cleanupErr.message}`,
              ),
            );
          resolve(outputPath);
        })
        .run();
    });
  }
}
