import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Camera, Upload, CheckCircle, XCircle } from 'lucide-react';
import mlService from '@/services/mlService';

const MLBreedIdentification = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleIdentifyBreed = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Starting analysis...');
    setError(null);
    setResult(null);

    try {
      const response = await mlService.identifyBreedWithProgress(
        selectedImage,
        (progressValue, message) => {
          setProgress(progressValue);
          setProgressMessage(message);
        }
      );

      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || 'Identification failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            AI Breed Identification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={handleCameraCapture}
                disabled={isProcessing}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={resetForm}
                  className="absolute top-2 right-2"
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progressMessage}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Identify Button */}
            {selectedImage && !isProcessing && (
              <Button
                onClick={handleIdentifyBreed}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Identify Breed
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Identification Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Primary Result */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Primary Match</h3>
                      <Badge className={getConfidenceColor(result.confidence)}>
                        {getConfidenceText(result.confidence)} Confidence
                      </Badge>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-lg capitalize">
                        {result.primary_breed.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {result.confidence}%
                      </p>
                    </div>
                  </div>

                  {/* Alternative Matches */}
                  {result.alternative_breeds && result.alternative_breeds.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Alternative Matches</h3>
                      <div className="space-y-2">
                        {result.alternative_breeds.map((breed, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-muted p-3 rounded-lg"
                          >
                            <span className="font-medium capitalize">
                              {breed.name || breed.breed.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <Badge variant="secondary">
                              {breed.confidence}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detected Features */}
                  {result.detected_features && result.detected_features.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Detected Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.detected_features.map((feature, index) => (
                          <Badge key={index} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Model Info */}
                  <div className="text-xs text-muted-foreground">
                    Model: {result.model_version} | Processing Time: {result.processing_time}ms
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MLBreedIdentification;
