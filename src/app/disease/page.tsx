import { DiseaseDetection } from "@/components/disease/detection";
import { Toaster } from "@/components/ui/toaster";

export default function DiseasePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Plant Disease Detection</h1>
        <p className="text-muted-foreground mb-8">
          Upload a photo of your plant to detect diseases and get instant treatment recommendations.
        </p>
        <DiseaseDetection />
      </div>
      <Toaster />
    </div>
  );
} 