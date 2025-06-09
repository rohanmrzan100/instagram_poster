import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs/promises';
@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadToCloudinary(filePath: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video',
        folder: 'your-folder-name', // optional
      });


      // delete video after uploading to cloudinary
      await fs
        .unlink(filePath)
        .catch((cleanupErr) =>
          console.error(`Error cleaning up temp video: ${cleanupErr.message}`),
        );
      console.log('Video uploaded to cloudinary ......');
      return { cloudinaryUrl: result.secure_url, public_id: result.public_id };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }
  async uploadImageToCloudinary(filePath: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'image',
        folder: 'your-folder-name', // optional
        format: 'png',
      });

      await fs
        .unlink(filePath)
        .catch((cleanupErr) =>
          console.error(`Error cleaning up temp video: ${cleanupErr.message}`),
        );
      console.log('Image uploaded to cloudinary ......');
      return { cloudinaryUrl: result.secure_url, public_id: result.public_id };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  async deletefromCloudinary(public_id: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(public_id, { resource_type: 'video' });

      console.log('deletion from cloudinary', result);
    } catch (error) {
      throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
  }
}
