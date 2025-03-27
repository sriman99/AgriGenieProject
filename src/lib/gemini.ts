import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '');

// Safety settings to ensure appropriate responses
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Generate a text response from Gemini
export async function generateText(prompt: string, context?: string): Promise<string> {
  try {
    // Use gemini-1.0-pro which is the free model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
    
    let fullPrompt = prompt;
    if (context) {
      fullPrompt = `${context}\n\n${prompt}`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    if (error instanceof Error) {
      return `Sorry, I encountered an error: ${error.message}. Please try again with a different query.`;
    }
    return 'Sorry, I encountered an error processing your request. Please try again.';
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
    
    Ensure recommendations are practical, scientifically accurate, and suitable for Indian agricultural conditions.
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
    As a market analyst for agricultural products in India, provide insights on:
    Crop: ${cropType}
    Historical Price Data: ${JSON.stringify(historicalPrices)}
    Market Trends: ${JSON.stringify(marketTrends)}
    
    Include:
    1. Price prediction for the next 3 months
    2. Best time to sell for maximum profit
    3. Market demand analysis
    4. Risks and opportunities in the current market
    5. Recommendations for the farmer
    
    Base your analysis on real agricultural market patterns and pricing factors.
  `;

  return generateText(prompt);
}

// Generate disease diagnosis based on crop image description
export async function generateDiseaseDiagnosis(
  cropType: string,
  symptoms: string
): Promise<string> {
  const prompt = `
    As a plant pathologist specializing in Indian agricultural crops, diagnose the following crop issue:
    Crop: ${cropType}
    Symptoms: ${symptoms}
    
    Provide:
    1. Likely disease or condition (list top 2-3 possibilities)
    2. Severity assessment
    3. Treatment recommendations using both organic and chemical options
    4. Preventive measures for future crops
    5. Impact on yield if left untreated
    
    Be specific and practical in your recommendations, considering accessibility of treatments for small-scale farmers.
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
    
    Make recommendations specific to Indian agricultural practices and conditions.
  `;

  return generateText(prompt);
}

// AI Chatbot function for farmer assistance
export async function farmingChatbotResponse(
  userQuery: string,
  chatHistory: {role: 'user' | 'bot', content: string}[]
): Promise<string> {
  try {
    // Use the chat model with history capabilities
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
    
    // For a simple approach that works with the free model, just use the generateContent method
    // with the conversation history formatted in the prompt
    const systemPrompt = `You are AgriGenie AI, an expert farming assistant specializing in Indian agriculture. 
You provide helpful, practical advice on farming, crop management, market trends, weather impacts, 
and modern farming techniques tailored to Indian conditions. Always be specific, accurate, 
and considerate of local farming practices.

Current conversation history:
${chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

User's new question: ${userQuery}

Please respond to the user's most recent question.`;

    const result = await model.generateContent(systemPrompt);
    return result.response.text();
  } catch (error) {
    console.error('Error with Gemini chatbot:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "Sorry, there's an issue with the AI service configuration. Please check that your Google API key is valid and has access to the Gemini API.";
      }
      return `Sorry, I couldn't process your request right now. Error: ${error.message}`;
    }
    return 'Sorry, I encountered an error processing your request. Please try again with a different question.';
  }
} 