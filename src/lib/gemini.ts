import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Generate a text response from Gemini
export async function generateText(prompt: string, context?: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    let fullPrompt = prompt;
    if (context) {
      fullPrompt = `${context}\n\n${prompt}`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    return 'Sorry, I encountered an error processing your request.';
  }
}

// Generate a farming recommendation based on input data
export async function generateFarmingRecommendation(
  cropType: string,
  location: string,
  soilType: string,
  weatherData: any
): Promise<string> {
  const prompt = `
    As an agricultural expert, provide a detailed farming recommendation for:
    Crop: ${cropType}
    Location: ${location}
    Soil Type: ${soilType}
    Current Weather: ${JSON.stringify(weatherData)}
    
    Include advice on:
    1. Optimal planting time
    2. Irrigation needs based on current weather
    3. Fertilizer recommendations
    4. Pest control suggestions
    5. Expected yield and harvest time
  `;

  return generateText(prompt);
}

// Generate market insights and price predictions
export async function generateMarketInsights(
  cropType: string,
  historicalPrices: any,
  marketTrends: any
): Promise<string> {
  const prompt = `
    As a market analyst for agricultural products, provide insights on:
    Crop: ${cropType}
    Historical Price Data: ${JSON.stringify(historicalPrices)}
    Market Trends: ${JSON.stringify(marketTrends)}
    
    Include:
    1. Price prediction for the next 3 months
    2. Best time to sell for maximum profit
    3. Market demand analysis
    4. Risks and opportunities in the current market
    5. Recommendations for the farmer
  `;

  return generateText(prompt);
}

// Generate disease diagnosis based on crop image description (placeholder for image analysis)
export async function generateDiseaseDiagnosis(
  cropType: string,
  symptoms: string,
  imageDescription?: string
): Promise<string> {
  const prompt = `
    As a plant pathologist, diagnose the following crop issue:
    Crop: ${cropType}
    Symptoms: ${symptoms}
    ${imageDescription ? `Visual Description: ${imageDescription}` : ''}
    
    Provide:
    1. Likely disease or condition
    2. Severity assessment
    3. Treatment recommendations
    4. Preventive measures
    5. Impact on yield if left untreated
  `;

  return generateText(prompt);
}

// Function to get weather alerts and recommendations
export async function generateWeatherAlerts(
  weatherData: any,
  cropTypes: string[],
  location: string
): Promise<string> {
  const prompt = `
    Based on the following weather forecast for ${location}:
    ${JSON.stringify(weatherData)}
    
    The farmer is growing: ${cropTypes.join(', ')}
    
    Provide:
    1. Critical weather alerts that may affect the crops
    2. Recommended actions to protect crops from weather conditions
    3. Irrigation adjustments needed
    4. Best times for field operations in the coming days
    5. Long-term weather pattern analysis for seasonal planning
  `;

  return generateText(prompt);
}

// AI Chatbot function for farmer assistance
export async function farmingChatbotResponse(
  userQuery: string,
  chatHistory: {role: 'user' | 'bot', content: string}[]
): Promise<string> {
  const historyText = chatHistory
    .map(msg => `${msg.role === 'user' ? 'Farmer' : 'AgriGenie AI'}: ${msg.content}`)
    .join('\n');
  
  const context = `
    You are AgriGenie AI, an expert farming assistant with deep knowledge of agriculture, crop management, 
    market trends, weather impacts, and modern farming techniques. You provide Indian farmers with 
    helpful, practical advice that considers local conditions and traditional knowledge.
    
    Chat history:
    ${historyText}
  `;
  
  return generateText(userQuery, context);
} 