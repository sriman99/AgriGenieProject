import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { diseases, prompt } = await req.json();

    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const treatmentPlan = JSON.parse(
      text.replace(/```json/g, "").replace(/```/g, "").trim()
    );

    return NextResponse.json(treatmentPlan);
  } catch (error) {
    console.error('Error generating treatment plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate treatment plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 