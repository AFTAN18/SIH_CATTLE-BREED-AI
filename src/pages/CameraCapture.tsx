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
  VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from '@/components/LanguageSelector';

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

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        
        setStream(mediaStream);
        setIsCameraActive(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Camera access denied:', error);
        toast({
          title: t('camera.cameraPermission'),
          description: t('camera.cameraPermissionMessage'),
          variant: "destructive"
        });
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          
          // Simulate processing delay
          setTimeout(() => {
            setIsCapturing(false);
            toast({
              title: t('camera.captureSuccess'),
              description: t('camera.processing'),
            });
            
            navigate('/results', { 
              state: { 
                imageData: imageUrl,
                viewType: currentView,
                captured: true
              } 
            });
          }, 1500);
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Capture failed:', error);
      setIsCapturing(false);
      toast({
        title: "Capture failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [currentView, navigate, toast]);

  const handleGalleryUpload = () => {
    fileInputRef.current?.click();
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
        {/* Real Camera View */}
        {isCameraActive && stream ? (
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
          /* Fallback Camera View */
          <div className="h-full camera-overlay flex items-center justify-center">
            <div className="relative w-80 h-60 border-2 border-primary border-dashed rounded-2xl flex items-center justify-center bg-card/10 backdrop-blur-sm">
              <div className="text-center">
                <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-sm text-foreground font-medium">{t('camera.initializing')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('camera.pleaseAllowAccess')}
                </p>
              </div>
            </div>
          </div>
        )}

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
                  onClick={() => setCurrentView(view.id as any)}
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
              disabled={isCapturing || !isCameraActive}
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

          {/* Settings */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full touch-target shadow-soft"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t('camera.tapToCapture')}
          </p>
        </div>
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