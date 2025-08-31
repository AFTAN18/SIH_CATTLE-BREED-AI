import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  RotateCcw, 
  ZapOff, 
  Zap, 
  Image as ImageIcon,
  ArrowLeft,
  Lightbulb,
  Eye,
  RotateCw,
  Target,
  Settings,
  Volume2,
  VolumeX,
  Check,
  X,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from '@/components/LanguageSelector';
import cameraService from '@/services/cameraService';

const CameraCapture = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [currentView, setCurrentView] = useState<'side' | 'front' | 'rear'>('side');
  const [currentTip, setCurrentTip] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureViews = [
    { id: 'side', label: t('camera.sideView'), icon: <Eye className="w-5 h-5" />, primary: true },
    { id: 'front', label: t('camera.frontView'), icon: <Eye className="w-5 h-5" />, primary: false },
    { id: 'rear', label: t('camera.rearView'), icon: <Eye className="w-5 h-5" />, primary: false }
  ];

  const tips = [
    t('camera.tips.lighting'),
    t('camera.tips.fullBody'),
    t('camera.tips.keepCalm'),
    t('camera.tips.sideView'),
    t('camera.tips.avoidShadows'),
    t('camera.tips.position'),
    t('camera.tips.background')
  ];

  // Initialize camera with enhanced service
  useEffect(() => {
    const initCamera = async () => {
      setIsInitializing(true);
      try {
        await cameraService.initialize();
        const mediaStream = await cameraService.startStream({
          facingMode: 'environment',
          width: 1920,
          height: 1080
        });
        
        setStream(mediaStream);
        setIsCameraActive(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      } catch (error) {
        console.error('Camera initialization failed:', error);
        toast({
          title: t('camera.cameraPermission'),
          description: t('camera.cameraPermissionMessage'),
          variant: "destructive"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initCamera();

    return () => {
      cameraService.destroy();
    };
  }, [toast, t]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !isCameraActive) return;

    setIsCapturing(true);
    
    try {
      const capturedImageData = await cameraService.captureImage(videoRef.current);
      
      // Show preview with captured image
      setCapturedImage(capturedImageData.dataUrl);
      setShowPreview(true);
      
      toast({
        title: t('camera.captureSuccess'),
        description: t('camera.reviewPhoto'),
      });
    } catch (error) {
      console.error('Capture failed:', error);
      toast({
        title: t('camera.captureError'),
        description: t('camera.tryAgain'),
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  }, [isCameraActive, toast, t]);

  const handleAcceptPhoto = () => {
    if (capturedImage) {
      toast({
        title: t('camera.photoAccepted'),
        description: t('camera.processing'),
      });
      
      navigate('/results', { 
        state: { 
          imageData: capturedImage,
          viewType: currentView,
          captured: true
        } 
      });
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setShowPreview(false);
  };

  const handleSavePhoto = async () => {
    if (capturedImage) {
      try {
        const link = document.createElement('a');
        link.download = `cattle-photo-${Date.now()}.jpg`;
        link.href = capturedImage;
        link.click();
        
        toast({
          title: t('camera.photoSaved'),
          description: t('camera.savedToDevice'),
        });
      } catch (error) {
        toast({
          title: t('camera.saveError'),
          description: t('camera.tryAgain'),
          variant: "destructive"
        });
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Image uploaded successfully!",
        description: "Processing breed identification...",
      });

      // Navigate to results
      navigate('/results', {
        state: {
          imageData: URL.createObjectURL(file),
          viewType: currentView,
          uploaded: true
        }
      });
    }
  };

  const handleGalleryUpload = () => {
    fileInputRef.current?.click();
  };

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Sound enabled" : "Sound muted",
      description: isMuted ? "Camera sounds are now on" : "Camera sounds are now off",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header 
        className="flex items-center justify-between p-4 bg-card shadow-soft"
        variants={itemVariants}
      >
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">{t('camera.title')}</h1>
        <div className="flex items-center gap-3">
          <LanguageSelector variant="dropdown" className="text-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className={isMuted ? 'text-muted-foreground' : 'text-accent'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFlashEnabled(!flashEnabled)}
            className={flashEnabled ? 'text-accent' : 'text-muted-foreground'}
          >
            {flashEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
          </Button>
        </div>
      </motion.header>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative bg-muted/20">
        <AnimatePresence mode="wait">
          {showPreview && capturedImage ? (
            /* Photo Preview Mode */
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full relative bg-black flex items-center justify-center"
            >
              <img 
                src={capturedImage} 
                alt="Captured photo"
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Preview Overlay */}
              <div className="absolute inset-0 bg-black/20">
                <div className="absolute top-4 left-4 right-4">
                  <Card className="p-3 bg-card/95 backdrop-blur-sm">
                    <p className="text-sm font-medium text-center">
                      {t('camera.photoPreview')}
                    </p>
                  </Card>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Camera View Mode */
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full relative"
            >
              {isCameraActive && stream && !isInitializing ? (
                <div className="h-full relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Camera Overlay */}
                  <div className="absolute inset-0 camera-overlay">
                    {/* Target Frame */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        className="relative w-80 h-60 border-2 border-primary border-dashed rounded-2xl flex items-center justify-center bg-card/10 backdrop-blur-sm"
                        animate={{ 
                          boxShadow: [
                            "0 0 0 0 rgba(var(--primary), 0.4)",
                            "0 0 0 20px rgba(var(--primary), 0)",
                            "0 0 0 0 rgba(var(--primary), 0)"
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="text-center">
                          <Target className="w-16 h-16 text-primary mx-auto mb-4 animate-float" />
                          <p className="text-sm text-foreground font-medium">{t('camera.positioningGuide')}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {currentView === 'side' ? t('camera.sideViewRecommended') : t('camera.viewActive', { view: currentView })}
                          </p>
                        </div>
                        
                        {/* Corner guides */}
                        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
                        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
                        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
                        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg"></div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Loading Camera View */
                <div className="h-full camera-overlay flex items-center justify-center">
                  <div className="relative w-80 h-60 border-2 border-primary border-dashed rounded-2xl flex items-center justify-center bg-card/10 backdrop-blur-sm">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                      <p className="text-sm text-foreground font-medium">
                        {isInitializing ? t('camera.initializing') : t('camera.cameraNotReady')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('camera.pleaseAllowAccess')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* View Selector */}
        <motion.div 
          className="absolute top-4 left-4 right-4"
          variants={itemVariants}
        >
          <div className="flex gap-2 justify-center">
            {captureViews.map((view) => (
              <motion.div
                key={view.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={currentView === view.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setCurrentView(view.id)}
                  className="flex items-center gap-2 shadow-soft"
                >
                  {view.icon}
                  {view.label}
                  {view.primary && <Badge variant="outline" className="ml-1 text-xs">{t('camera.best')}</Badge>}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips Carousel */}
        <motion.div 
          className="absolute bottom-32 left-4 right-4"
          variants={itemVariants}
        >
          <Card className="p-4 bg-card/95 backdrop-blur-sm shadow-medium border-0">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-accent flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{tips[currentTip]}</p>
              <Button variant="ghost" size="sm" onClick={nextTip}>
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div 
        className="p-6 bg-card shadow-medium"
        variants={itemVariants}
      >
        <AnimatePresence mode="wait">
          {showPreview ? (
            /* Preview Controls */
            <motion.div
              key="preview-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleRetakePhoto}
                  className="flex-1 h-14 touch-target"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t('camera.retake')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSavePhoto}
                  className="w-14 h-14 rounded-full touch-target"
                >
                  <Download className="w-6 h-6" />
                </Button>
                
                <Button
                  onClick={handleAcceptPhoto}
                  className="flex-1 h-14 bg-gradient-primary hover:bg-primary-hover touch-target"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {t('camera.usePhoto')}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                {t('camera.reviewInstructions')}
              </p>
            </motion.div>
          ) : (
            /* Camera Controls */
            <motion.div
              key="camera-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-center gap-6">
                {/* Gallery Upload */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleGalleryUpload}
                    className="w-16 h-16 rounded-full touch-target shadow-soft"
                  >
                    <ImageIcon className="w-6 h-6" />
                  </Button>
                </motion.div>

                {/* Capture Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleCapture}
                    disabled={isCapturing || !isCameraActive || isInitializing}
                    className="w-24 h-24 rounded-full bg-gradient-primary hover:bg-primary-hover capture-button touch-target shadow-glow"
                    size="lg"
                  >
                    {isCapturing ? (
                      <div className="w-8 h-8 animate-spin-slow rounded-full border-3 border-primary-foreground border-t-transparent" />
                    ) : (
                      <Camera className="w-10 h-10" />
                    )}
                  </Button>
                </motion.div>

                {/* Switch Camera */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => cameraService.switchCamera()}
                    disabled={!isCameraActive}
                    className="w-16 h-16 rounded-full touch-target shadow-soft"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>
                </motion.div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {isInitializing ? t('camera.initializing') : t('camera.tapToCapture')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </motion.div>
  );
};

export default CameraCapture;