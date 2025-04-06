'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, AlertCircle } from "lucide-react";

interface DetectionResult {
  disease_name: string;
  confidence: number;
  treatment: string[];
  prevention: string[];
  images: string[];
}

export function DiseaseDetection() {
  const [file, setFile] = useState<File | null>(null);
  const [cropName, setCropName] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    if (!cropName.trim()) {
      toast({
        title: "Error",
        description: "Please enter the crop name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('crop_name', cropName);

    try {
      const response = await fetch('/api/disease-detection/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to detect disease');
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Success",
        description: `Disease detected: ${data.disease_name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to detect disease. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Disease Detection</h2>
        <p className="text-muted-foreground mb-6">
          Upload an image of your plant to detect any diseases and get treatment recommendations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Crop Name</label>
              <Input
                type="text"
                placeholder="Enter crop name (e.g., Rice, Wheat)"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !file || !cropName.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Detect Disease
                  </>
                )}
              </Button>
            </div>

            {preview && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </form>
      </Card>

      {result && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Detection Result</h3>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <p className="font-medium">
                  {result.disease_name} (Confidence: {(result.confidence * 100).toFixed(1)}%)
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Treatment Recommendations</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.treatment.map((item, index) => (
                  <li key={index} className="text-muted-foreground">{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Prevention Tips</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.prevention.map((item, index) => (
                  <li key={index} className="text-muted-foreground">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 