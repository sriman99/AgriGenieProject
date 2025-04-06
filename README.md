# AgriGenie - AI-Powered Agriculture Platform

AgriGenie is a comprehensive digital platform designed to connect farmers and buyers while providing AI-powered insights for agricultural decision-making.

## Key Features

- **Role-based Dashboards**: Separate dashboards for farmers and buyers with tailored features
- **Marketplace**: Browse, list, and purchase crops directly on the platform
- **AI Assistant**: Gemini AI-powered chatbot that provides farming advice, market insights, and crop disease diagnosis
- **Weather Intelligence**: Real-time weather data and forecasts with crop suitability recommendations
- **Market Price Analytics**: Track crop prices, trends, and forecasts to optimize buying/selling decisions
- **User Authentication**: Secure login system with role-based access control

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **APIs**: 
  - OpenWeather API for weather data
  - Google Gemini API for AI features
  - Market price data (simulated)

## Getting Started

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/agrigenie.git
   cd agrigenie
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # External API Keys
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key
   NEXT_PUBLIC_GOOGLE_API_KEY=your-google-api-key  # For Gemini AI

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```
   npm run dev
   ```

5. **Open your browser and navigate to**
   ```
   http://localhost:3000
   ```

## Database Schema

The application uses Supabase with the following main tables:

- **profiles**: User profile information with role (farmer/buyer)
- **marketplace_listings**: Crop listings posted by farmers
- **marketplace_orders**: Orders placed by buyers

## API Integration

### Weather API

The application integrates with OpenWeather API to provide:
- Current weather conditions
- 5-day forecasts
- Weather-based crop suitability analysis

### Gemini AI

Google's Gemini AI powers several features:
- Conversational farming assistant
- Crop recommendations based on conditions
- Market trend analysis
- Disease diagnosis from descriptions

## Deployment

The application can be deployed to Vercel or any other platform that supports Next.js applications.

```bash
npm run build
npm start
```

## License

[MIT](LICENSE)

Project By - 