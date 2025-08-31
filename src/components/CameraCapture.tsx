import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, SwitchCamera, Zap, ZapOff, RotateCcw, Download, Settings, Grid3X3, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import cameraService, { CapturedImage, CameraDevice } from '@/services/cameraService';
import aiService from '@/services/aiService';

interface CameraCaptureProps {
  onImageCaptured: (image: CapturedImage) => void;
  onAnalysisComplete: (results: any) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCaptured, onAnalysisComplete }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDevice, setCurrentDevice] = useState<string>('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [autoFocusEnabled, setAutoFocusEnabled] = useState(true);
  const [imageQuality, setImageQuality] = useState(0);
  const [streamStats, setStreamStats] = useState<any>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Initialize camera service
  useEffect(() => {
    const initCamera = async () => {
      try {
        await cameraService.initialize();
        const availableDevices = await cameraService.enumerateDevices();
        setDevices(availableDevices);
        setPermissionStatus('granted');
        
        if (availableDevices.length > 0) {
          setCurrentDevice(availableDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Camera initialization failed:', error);
        setPermissionStatus('denied');
        toast({
          title: t('errors.cameraNotAvailable'),
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
      }
    };

    initCamera();

    return () => {
      cameraService.destroy();
    };
  }, [t, toast]);

  // Start camera stream
  const startStream = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const stream = await cameraService.startStream({
        deviceId: currentDevice || undefined
      });
      
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
      
      // Update stream stats periodically
      const statsInterval = setInterval(() => {
        const stats = cameraService.getStreamStats();
        setStreamStats(stats);
      }, 1000);

      return () => clearInterval(statsInterval);
    } catch (error) {
      console.error('Failed to start camera stream:', error);
      toast({
        title: t('errors.cameraNotAvailable'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  }, [currentDevice, t, toast]);

  // Stop camera stream
  const stopStream = useCallback(() => {
    cameraService.stopStream();
    setIsStreaming(false);
    setStreamStats(null);
  }, []);

  // Capture image
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !isStreaming) return;

    setIsCapturing(true);
    try {
      const image = await cameraService.captureImage(videoRef.current);
      
      // Validate image quality
      const validation = cameraService.validateImageForAI(image.blob);
      if (!validation.isValid) {
        toast({
          title: t('errors.invalidImage'),
          description: validation.issues.join(', '),
          variant: 'destructive'
        });
        return;
      }

      // Enhance image if needed
      const enhancedBlob = await cameraService.enhanceImage(image.blob);
      const enhancedImage = { ...image, blob: enhancedBlob };
      
      setCapturedImage(enhancedImage);
      setImageQuality(image.quality);
      onImageCaptured(enhancedImage);
      
      // Stop stream after capture
      stopStream();
      
      toast({
        title: t('success.photoCaptured'),
        description: t('camera.captureSuccess')
      });
    } catch (error) {
      console.error('Image capture failed:', error);
      toast({
        title: t('errors.uploadFailed'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsCapturing(false);
    }
  }, [isStreaming, onImageCaptured, stopStream, t, toast]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    try {
      const stream = await cameraService.switchCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to switch camera:', error);
      toast({
        title: t('errors.cameraNotAvailable'),
        description: 'Failed to switch camera',
        variant: 'destructive'
      });
    }
  }, [t, toast]);

  // Analyze captured image
  const analyzeImage = useCallback(async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    try {
      const file = new File([capturedImage.blob], 'captured-image.jpg', {
        type: 'image/jpeg'
      });
      
      const results = await aiService.identifyBreed(file);
      onAnalysisComplete(results);
      
      toast({
        title: t('success.identificationComplete'),
        description: `Identified with ${results.predictions[0]?.confidence}% confidence`
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: t('errors.identificationFailed'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [capturedImage, onAnalysisComplete, t, toast]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setImageQuality(0);
    startStream();
  }, [startStream]);

  // Download captured image
  const downloadImage = useCallback(() => {
    if (!capturedImage) return;
    
    const link = document.createElement('a');
    link.href = capturedImage.dataUrl;
    link.download = `cattle-breed-${Date.now()}.jpg`;
    link.click();
  }, [capturedImage]);

  // Auto-start stream when component mounts
  useEffect(() => {
    if (permissionStatus === 'granted' && !capturedImage) {
      startStream();
    }
  }, [permissionStatus, capturedImage, startStream]);

  if (permissionStatus === 'denied') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">{t('camera.cameraPermission')}</h3>
          <p className="text-gray-600 mb-4">{t('camera.cameraPermissionMessage')}</p>
          <Button onClick={() => window.location.reload()}>
            {t('camera.grantPermission')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Camera Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('camera.title')}</h2>
            <div className="flex items-center gap-2">
              <Badge variant={isStreaming ? 'default' : 'secondary'}>
                {isStreaming ? t('common.online') : t('common.offline')}
              </Badge>
              {imageQuality > 0 && (
                <Badge variant={imageQuality > 70 ? 'default' : 'secondary'}>
                  {t('camera.quality')}: {imageQuality}%
                </Badge>
              )}
            </div>
          </div>

          {/* Camera Controls Row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={switchCamera}
              disabled={devices.length < 2}
            >
              <SwitchCamera className="w-4 h-4 mr-2" />
              {t('camera.switchCamera')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFlashEnabled(!flashEnabled)}
            >
              {flashEnabled ? (
                <><Zap className="w-4 h-4 mr-2" />{t('camera.flashOn')}</>
              ) : (
                <><ZapOff className="w-4 h-4 mr-2" />{t('camera.flashOff')}</>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGridEnabled(!gridEnabled)}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoFocusEnabled(!autoFocusEnabled)}
            >
              <Focus className="w-4 h-4 mr-2" />
              Focus
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera View */}
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Grid overlay */}
                {gridEnabled && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-white/30" />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Positioning guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-white/50 rounded-lg w-3/4 h-3/4 flex items-center justify-center">
                    <div className="text-white/70 text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{t('camera.positioningGuide')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Camera status */}
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white text-center">
                      <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                      <p>{t('camera.initializing')}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage.dataUrl}
                alt="Captured animal"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          {!capturedImage ? (
            <div className="flex justify-center gap-4">
              <Button
                onClick={captureImage}
                disabled={!isStreaming || isCapturing}
                size="lg"
                className="px-8"
              >
                <Camera className="w-5 h-5 mr-2" />
                {isCapturing ? t('camera.processing') : t('camera.capturePhoto')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Quality Indicator */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{t('camera.imageQuality')}</p>
                <Progress value={imageQuality} className="w-full max-w-xs mx-auto" />
                <p className="text-xs mt-1">
                  {imageQuality > 80 ? t('camera.excellent') : 
                   imageQuality > 60 ? t('camera.good') : t('camera.poor')}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-4 flex-wrap">
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  size="lg"
                  className="px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t('identification.processing')}
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Analyze Breed
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  {t('camera.retakePhoto')}
                </Button>
                
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {t('common.download')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Tips */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">📸 Photography Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p>{t('camera.tips.lighting')}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p>{t('camera.tips.fullBody')}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p>{t('camera.tips.sideView')}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <p>{t('camera.tips.position')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stream Statistics (Development Mode) */}
      {process.env.NODE_ENV === 'development' && streamStats && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">📊 Stream Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Resolution</p>
                <p className="font-mono">{streamStats.settings?.width}x{streamStats.settings?.height}</p>
              </div>
              <div>
                <p className="text-gray-600">Frame Rate</p>
                <p className="font-mono">{streamStats.settings?.frameRate} fps</p>
              </div>
              <div>
                <p className="text-gray-600">Device</p>
                <p className="font-mono">{streamStats.settings?.deviceId?.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-mono">{streamStats.readyState}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
