import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  RotateCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CameraCapture = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [currentView, setCurrentView] = useState<'side' | 'front' | 'rear'>('side');
  const [currentTip, setCurrentTip] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureViews = [
    { id: 'side', label: 'Side View', icon: <Eye className="w-5 h-5" />, primary: true },
    { id: 'front', label: 'Front View', icon: <Eye className="w-5 h-5" />, primary: false },
    { id: 'rear', label: 'Rear View', icon: <Eye className="w-5 h-5" />, primary: false }
  ];

  const tips = [
    "Ensure good lighting for best results",
    "Capture the full body of the animal",
    "Keep the animal calm and still",
    "Side view provides the most accurate identification",
    "Avoid shadows on key identifying features"
  ];

  const handleCapture = useCallback(async () => {
    setIsCapturing(true);
    
    // Simulate camera capture with processing delay
    setTimeout(() => {
      setIsCapturing(false);
      toast({
        title: "Image captured successfully!",
        description: "Processing breed identification...",
      });
      // Navigate to results with mock data
      navigate('/results', { 
        state: { 
          imageData: 'mock-image-data',
          viewType: currentView 
        } 
      });
    }, 1500);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card shadow-soft">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Capture Image</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFlashEnabled(!flashEnabled)}
          className={flashEnabled ? 'text-accent' : 'text-muted-foreground'}
        >
          {flashEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
        </Button>
      </header>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative bg-muted/20">
        {/* Mock Camera View */}
        <div className="h-full camera-overlay flex items-center justify-center">
          <div className="relative w-80 h-60 border-2 border-primary border-dashed rounded-xl flex items-center justify-center bg-card/10 backdrop-blur-sm">
            <div className="text-center">
              <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-sm text-foreground font-medium">Position animal in frame</p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentView === 'side' ? 'Side view recommended' : `${currentView} view active`}
              </p>
            </div>
            
            {/* Corner guides */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg"></div>
          </div>
        </div>

        {/* View Selector */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex gap-2 justify-center">
            {captureViews.map((view) => (
              <Button
                key={view.id}
                variant={currentView === view.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setCurrentView(view.id as any)}
                className="flex items-center gap-2"
              >
                {view.icon}
                {view.label}
                {view.primary && <Badge variant="outline" className="ml-1 text-xs">Best</Badge>}
              </Button>
            ))}
          </div>
        </div>

        {/* Tips Carousel */}
        <div className="absolute bottom-32 left-4 right-4">
          <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-medium">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-accent flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{tips[currentTip]}</p>
              <Button variant="ghost" size="sm" onClick={nextTip}>
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-card shadow-medium">
        <div className="flex items-center justify-center gap-6">
          {/* Gallery Upload */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleGalleryUpload}
            className="w-16 h-16 rounded-full touch-target"
          >
            <ImageIcon className="w-6 h-6" />
          </Button>

          {/* Capture Button */}
          <Button
            onClick={handleCapture}
            disabled={isCapturing}
            className="w-20 h-20 rounded-full bg-gradient-primary hover:bg-primary-hover capture-button touch-target"
            size="lg"
          >
            {isCapturing ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Camera className="w-8 h-8" />
            )}
          </Button>

          {/* Switch Camera */}
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full touch-target"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Tap to capture or upload from gallery
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default CameraCapture;