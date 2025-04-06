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
import { agriToasts } from "@/components/ui/agri-toast";

import Image from "next/image";

interface DetectionResult {
  disease_name: string;
  confidence: number;
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null); // Reset previous results
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !cropName) {
      agriToasts.error("Please select an image and enter crop name");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await api.detectDisease(selectedImage, cropName);
      setDetectionResult(result);
      
      if (result.disease_name) {
        agriToasts.diseaseDetected(cropName, result.disease_name);
      }
    } catch (error) {
      agriToasts.error("Failed to analyze image");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Crop Disease Detection</CardTitle>
            <CardDescription>
              Upload a clear image of your crop to detect diseases and get treatment recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter crop name"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    required
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                  <Button type="submit" className="w-full" disabled={isAnalyzing}>
                    {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                  </Button>
                </div>

                {previewUrl && (
                  <div className="relative aspect-square">
                    <Image
                      src={previewUrl}
                      alt="Selected crop"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {detectionResult && (
          <Card className={`border-l-4 ${
            detectionResult.confidence > 0.7 ? 'border-l-red-500' : 'border-l-yellow-500'
          }`}>
            <CardHeader>
              <CardTitle className="text-xl">Detection Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Detected Disease:</h3>
                <p className="text-lg">{detectionResult.disease_name}</p>
                <p className="text-sm text-gray-500">
                  Confidence: {Math.round(detectionResult.confidence * 100)}%
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Treatment:</h3>
                <p>{detectionResult.treatment}</p>
              </div>

              <div>
                <h3 className="font-semibold">Prevention:</h3>
                <p>{detectionResult.prevention}</p>
              </div>

              <Button variant="outline" onClick={() => router.push('/chatbot')}>
                Discuss with AI Assistant
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}