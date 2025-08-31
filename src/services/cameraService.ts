export interface CameraConfig {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
  deviceId?: string;
}

export interface CapturedImage {
  blob: Blob;
  dataUrl: string;
  metadata: ImageMetadata;
  quality: number;
}

export interface ImageMetadata {
  timestamp: string;
  deviceInfo: string;
  resolution: string;
  fileSize: number;
  format: string;
  location?: GeolocationPosition;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  facingMode?: string;
}

class CameraService {
  private stream: MediaStream | null = null;
  private devices: CameraDevice[] = [];
  private currentConfig: CameraConfig = {
    width: 1920,
    height: 1080,
    facingMode: 'environment'
  };

  async initialize(): Promise<void> {
    try {
      // Request camera permissions
      await this.requestPermissions();
      
      // Enumerate available devices
      await this.enumerateDevices();
      
      console.log('Camera service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize camera service:', error);
      throw new Error('Camera initialization failed');
    }
  }

  private async requestPermissions(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Camera permission denied. Please allow camera access.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No camera found on this device.');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Camera not supported on this device.');
        }
      }
      throw new Error('Failed to access camera');
    }
  }

  async enumerateDevices(): Promise<CameraDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
          facingMode: this.guessFacingMode(device.label)
        }));
      
      return this.devices;
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return [];
    }
  }

  private guessFacingMode(label: string): string {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('front') || lowerLabel.includes('user')) {
      return 'user';
    } else if (lowerLabel.includes('back') || lowerLabel.includes('rear') || lowerLabel.includes('environment')) {
      return 'environment';
    }
    return 'unknown';
  }

  async startStream(config?: Partial<CameraConfig>): Promise<MediaStream> {
    if (this.stream) {
      this.stopStream();
    }

    const finalConfig = { ...this.currentConfig, ...config };
    this.currentConfig = finalConfig;

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: finalConfig.width },
          height: { ideal: finalConfig.height },
          facingMode: finalConfig.facingMode,
          ...(finalConfig.deviceId && { deviceId: finalConfig.deviceId })
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.stream;
    } catch (error) {
      console.error('Failed to start camera stream:', error);
      throw new Error('Failed to start camera');
    }
  }

  stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  async captureImage(videoElement: HTMLVideoElement): Promise<CapturedImage> {
    if (!this.stream) {
      throw new Error('Camera stream not active');
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Set canvas size to video dimensions
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(videoElement, 0, 0);
      
      // Convert to blob with high quality
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        }, 'image/jpeg', 0.95);
      });
      
      // Create data URL for preview
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      // Generate metadata
      const metadata = await this.generateMetadata(blob);
      
      // Assess image quality
      const quality = this.assessCapturedImageQuality(canvas, ctx);
      
      return {
        blob,
        dataUrl,
        metadata,
        quality
      };
    } catch (error) {
      console.error('Failed to capture image:', error);
      throw new Error('Image capture failed');
    }
  }

  private async generateMetadata(blob: Blob): Promise<ImageMetadata> {
    const metadata: ImageMetadata = {
      timestamp: new Date().toISOString(),
      deviceInfo: navigator.userAgent,
      resolution: `${this.currentConfig.width}x${this.currentConfig.height}`,
      fileSize: blob.size,
      format: blob.type
    };

    // Try to get location if available
    try {
      const position = await this.getCurrentLocation();
      metadata.location = position;
    } catch (error) {
      console.log('Location not available:', error);
    }

    return metadata;
  }

  private getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  private assessCapturedImageQuality(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): number {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate image sharpness using Laplacian variance
    let variance = 0;
    let mean = 0;
    const pixels = data.length / 4;
    
    // Calculate mean brightness
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      mean += brightness;
    }
    mean /= pixels;
    
    // Calculate variance (proxy for sharpness)
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      variance += Math.pow(brightness - mean, 2);
    }
    variance /= pixels;
    
    // Normalize to 0-100 scale
    const quality = Math.min(variance / 100, 100);
    return Math.round(quality);
  }

  async switchCamera(): Promise<MediaStream> {
    const currentFacing = this.currentConfig.facingMode;
    const newFacing = currentFacing === 'user' ? 'environment' : 'user';
    
    return this.startStream({ facingMode: newFacing });
  }

  async switchToDevice(deviceId: string): Promise<MediaStream> {
    const device = this.devices.find(d => d.deviceId === deviceId);
    if (!device) {
      throw new Error('Camera device not found');
    }
    
    return this.startStream({ deviceId });
  }

  getAvailableDevices(): CameraDevice[] {
    return this.devices;
  }

  getCurrentConfig(): CameraConfig {
    return { ...this.currentConfig };
  }

  async compressImage(blob: Blob, maxSizeKB: number = 500): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate compression ratio
        let quality = 0.9;
        const targetSize = maxSizeKB * 1024;
        
        const compress = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((compressedBlob) => {
            if (!compressedBlob) {
              reject(new Error('Compression failed'));
              return;
            }
            
            if (compressedBlob.size <= targetSize || quality <= 0.1) {
              resolve(compressedBlob);
            } else {
              quality -= 0.1;
              compress();
            }
          }, 'image/jpeg', quality);
        };
        
        compress();
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  validateImageForAI(blob: Blob): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check file size (max 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      issues.push('Image too large (max 10MB)');
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) {
      issues.push('Unsupported image format');
    }
    
    // Check minimum size
    if (blob.size < 10 * 1024) {
      issues.push('Image too small (min 10KB)');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  async enhanceImage(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply basic image enhancements
        ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((enhancedBlob) => {
          if (enhancedBlob) {
            resolve(enhancedBlob);
          } else {
            reject(new Error('Image enhancement failed'));
          }
        }, 'image/jpeg', 0.95);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  getStreamStats(): any {
    if (!this.stream) return null;
    
    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) return null;
    
    const settings = videoTrack.getSettings();
    const capabilities = videoTrack.getCapabilities();
    
    return {
      settings,
      capabilities,
      readyState: videoTrack.readyState,
      enabled: videoTrack.enabled
    };
  }

  async captureMultipleAngles(videoElement: HTMLVideoElement, count: number = 3): Promise<CapturedImage[]> {
    const images: CapturedImage[] = [];
    
    for (let i = 0; i < count; i++) {
      // Wait 2 seconds between captures for different angles
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const image = await this.captureImage(videoElement);
      images.push(image);
    }
    
    return images;
  }

  destroy(): void {
    this.stopStream();
    this.devices = [];
  }
}

export const cameraService = new CameraService();
export default cameraService;
