'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { agriToasts } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, AlertTriangle, Camera, RefreshCw } from "lucide-react";
import Image from "next/image";

interface DetectionResult {
  disease_name: string;
  confidence: number;
  description: string;
  treatment: string;
  prevention: string;
}

export default function DiseaseDetectionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropName, setCropName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        agriToasts.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !cropName) {
      agriToasts.error("Please select an image and enter crop name");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await api.detectDisease(selectedImage, cropName);
      setDetectionResult(result);
      if (result.disease_name !== 'healthy') {
        agriToasts.diseaseDetected(cropName, result.disease_name);
      } else {
        agriToasts.showToast({
          message: `Your ${cropName} appears to be healthy!`,
          type: "success"
        });
      }
    } catch (error: any) {
      console.error('Disease detection error:', error);
      setError('Failed to analyze image. Please try again.');
      agriToasts.error("Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setCropName('');
    setDetectionResult(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-1/2" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Disease Detection</CardTitle>
            <CardDescription>
              Upload a photo of your crop to detect diseases and get treatment recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Crop Name</label>
                <Input
                  type="text"
                  placeholder="Enter crop name (e.g., Rice, Wheat)"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                  disabled={isAnalyzing}
                  className="max-w-md"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Select Image
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isAnalyzing}
                  />
                  {selectedImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={resetForm}
                      disabled={isAnalyzing}
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {previewUrl && (
                  <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={previewUrl}
                      alt="Selected crop"
                      className="object-contain"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={!selectedImage || !cropName || isAnalyzing}
                  className="w-full md:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {detectionResult && (
          <Card className={`border-none shadow-sm ${
            detectionResult.disease_name === 'healthy' 
              ? 'bg-green-50' 
              : 'bg-red-50'
          }`}>
            <CardHeader>
              <CardTitle className={
                detectionResult.disease_name === 'healthy'
                  ? 'text-green-800'
                  : 'text-red-800'
              }>
                Detection Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Diagnosis:</h3>
                <p className="text-gray-700">
                  {detectionResult.disease_name === 'healthy' 
                    ? 'Your crop appears to be healthy!' 
                    : `Detected ${detectionResult.disease_name} with ${Math.round(detectionResult.confidence * 100)}% confidence`
                  }
                </p>
              </div>

              {detectionResult.disease_name !== 'healthy' && (
                <>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Description:</h3>
                    <p className="text-gray-700">{detectionResult.description}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Treatment:</h3>
                    <p className="text-gray-700">{detectionResult.treatment}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Prevention:</h3>
                    <p className="text-gray-700">{detectionResult.prevention}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}