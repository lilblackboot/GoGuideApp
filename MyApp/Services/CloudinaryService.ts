// services/CloudinaryService.ts - Fixed version without transformation issues
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";
export class CloudinaryService {
  private static readonly CLOUD_NAME = CLOUDINARY_CLOUD_NAME; // Replace with your Cloudinary cloud name
  private static readonly UPLOAD_PRESET = CLOUDINARY_UPLOAD_PRESET; // Replace with your unsigned upload preset
  private static readonly API_URL = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}`;

  /**
   * Upload media to Cloudinary using unsigned upload
   * @param uri - Local file URI
   * @param type - Media type ('image' or 'video')
   * @param folder - Optional folder name in Cloudinary
   * @returns Promise<string> - Cloudinary URL
   */
  static async uploadMedia(
    uri: string, 
    type: 'image' | 'video', 
    folder?: string
  ): Promise<string> {
    try {
      console.log('Starting Cloudinary upload for:', uri);

      // Create FormData for the upload
      const formData = new FormData();
      
      // Add the file
      const fileExtension = type === 'image' ? 'jpg' : 'mp4';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      
      // For React Native, append the file
      formData.append('file', {
        uri: uri,
        type: type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: fileName,
      } as any);

      // Add required upload parameters for unsigned upload
      formData.append('upload_preset', this.UPLOAD_PRESET);
      
      // Optional folder (if your preset allows it)
      if (folder) {
        formData.append('folder', folder);
      }

      // DO NOT add transformation parameter for unsigned uploads
      // Transformations must be applied when displaying the image, not during upload

      console.log('FormData prepared for upload');
      console.log('Upload preset:', this.UPLOAD_PRESET);
      console.log('Cloud name:', this.CLOUD_NAME);

      // Make the upload request
      const response = await fetch(`${this.API_URL}/${type}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Cloudinary upload successful:', {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format
      });

      return result.secure_url;

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(`Failed to upload ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
// Add this method to your CloudinaryService.ts
private static readonly CLOUDINARY_API_KEY = '226349218399493';
static async deleteMedia(publicId: string): Promise<void> {
  try {
    // Note: For security reasons, deletion from frontend should be limited
    // In production, you should handle deletion from your backend
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', this.CLOUDINARY_API_KEY);
    
    // Generate signature for deletion (this requires your API secret)
    // For security, this should be done on your backend
    const timestamp = Math.round(new Date().getTime() / 1000);
    formData.append('timestamp', timestamp.toString());
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to delete media');
    }
    
    console.log('Media deleted from Cloudinary successfully');
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error as post deletion is more important than media cleanup
  }
}
  /**
   * Generate a transformation URL for an existing Cloudinary image
   * Use this to apply transformations when displaying images, not during upload
   * @param imageUrl - Original Cloudinary URL
   * @param transformations - Transformation string (e.g., "c_limit,w_1080,h_1080,q_auto,f_auto")
   * @returns string - Transformed image URL
   */
  static getTransformedImageUrl(imageUrl: string, transformations: string): string {
    try {
      // Extract the public ID and other parts from the Cloudinary URL
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1) {
        console.warn('Invalid Cloudinary URL for transformation:', imageUrl);
        return imageUrl; // Return original URL if not a valid Cloudinary URL
      }

      // Insert transformation after 'upload'
      const beforeUpload = urlParts.slice(0, uploadIndex + 1);
      const afterUpload = urlParts.slice(uploadIndex + 1);
      
      const transformedUrl = [
        ...beforeUpload,
        transformations,
        ...afterUpload
      ].join('/');

      console.log('Generated transformed URL:', transformedUrl);
      return transformedUrl;
    } catch (error) {
      console.error('Error generating transformed URL:', error);
      return imageUrl; // Return original URL on error
    }
  }

  /**
   * Get optimized image URL for display
   * @param imageUrl - Original Cloudinary URL
   * @param size - Size preset ('thumbnail', 'medium', 'large')
   * @returns string - Optimized image URL
   */
  static getOptimizedImageUrl(imageUrl: string, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    const transformations = {
      thumbnail: 'c_fill,w_150,h_150,q_auto,f_auto',
      medium: 'c_limit,w_800,h_800,q_auto,f_auto',
      large: 'c_limit,w_1200,h_1200,q_auto,f_auto'
    };

    return this.getTransformedImageUrl(imageUrl, transformations[size]);
  }

  /**
   * Upload multiple media files
   * @param files - Array of {uri, type} objects
   * @param folder - Optional folder name
   * @returns Promise<string[]> - Array of Cloudinary URLs
   */
  static async uploadMultipleMedia(
    files: Array<{uri: string, type: 'image' | 'video'}>,
    folder?: string
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadMedia(file.uri, file.type, folder)
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  }

  /**
   * Validate if a URL is a Cloudinary URL
   * @param url - URL to validate
   * @returns boolean
   */
  static isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param url - Cloudinary URL
   * @returns string - Public ID or empty string if not found
   */
  static getPublicIdFromUrl(url: string): string {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex !== -1 && urlParts.length > uploadIndex + 1) {
        // Get everything after upload and remove file extension
        const publicIdParts = urlParts.slice(uploadIndex + 1);
        const fullPublicId = publicIdParts.join('/');
        
        // Remove file extension
        return fullPublicId.replace(/\.[^/.]+$/, '');
      }
      
      return '';
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return '';
    }
  }
}