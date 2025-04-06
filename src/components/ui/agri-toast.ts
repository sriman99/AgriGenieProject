import { toast } from './use-toast';

export const agriToasts = {
  showToast: ({ message, type = 'default' }: { message: string; type?: 'default' | 'error' | 'success' }) => {
    toast({
      title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  },

  priceAlert: (cropName: string, predictedPrice: string) => {
    toast({
      title: 'Price Alert',
      description: `Good time to sell ${cropName}! Predicted price: ₹${predictedPrice}/kg`,
      variant: 'default',
    });
  },

  success: (message: string) => {
    toast({
      title: 'Success',
      description: message,
      variant: 'default',
    });
  },

  error: (message: string) => {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  },

  diseaseDetected: (disease: string, confidence: number) => {
    toast({
      title: 'Disease Detection Result',
      description: `Detected: ${disease} (Confidence: ${confidence}%)`,
      variant: 'default',
    });
  },
}; 