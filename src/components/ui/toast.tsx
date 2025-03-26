import { toast } from "sonner";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info" | "warning";
};

export const showToast = ({ message, type = "info" }: ToastProps) => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    default:
      toast(message);
  }
};

export const agriToasts = {
  showToast,
  cropListed: (cropName: string) => 
    showToast({ 
      message: `Successfully listed ${cropName} in the marketplace`, 
      type: "success" 
    }),
  
  diseaseDetected: (cropName: string, disease: string) => 
    showToast({ 
      message: `⚠️ ${disease} detected in your ${cropName}! Check recommendations.`, 
      type: "warning" 
    }),
  
  orderReceived: (cropName: string, quantity: string) => 
    showToast({ 
      message: `New order received for ${quantity} of ${cropName}!`, 
      type: "info" 
    }),
  
  weatherAlert: (alert: string) => 
    showToast({ 
      message: `Weather Alert: ${alert}`, 
      type: "warning" 
    }),
  
  priceAlert: (cropName: string, price: string) => 
    showToast({ 
      message: `💰 Best time to sell ${cropName}! Current market price: ₹${price}`, 
      type: "success" 
    }),
  
  error: (error: string) => 
    showToast({ 
      message: `Error: ${error}`, 
      type: "error" 
    })
};