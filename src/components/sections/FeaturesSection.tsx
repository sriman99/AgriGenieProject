import Link from "next/link";
import Image from "next/image";
import {
  Bot,
  Leaf,
  BarChart3,
  ShoppingCart,
  Shield,
  Activity,
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900" id="features">
            AI-Driven Farming Solutions
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Leverage the power of artificial intelligence to transform your
            farming practices
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <Link href="/chatbot" className="block">
            <div className="p-6 transition-all h-full bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-200">
              <div className="p-3 mb-4 bg-green-100 rounded-full w-fit">
                <Bot className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                AI Farming Assistant
              </h3>
              <p className="text-gray-600">
                Get personalized farming guidance, weather updates, and best
                practices from our AI-powered chatbot.
              </p>
            </div>
          </Link>

          {/* Feature 2 */}
          <Link href="/disease-detection" className="block">
            <div className="p-6 transition-all h-full bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-200">
              <div className="p-3 mb-4 bg-green-100 rounded-full w-fit">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Crop Disease Detection
              </h3>
              <p className="text-gray-600">
                Instantly identify plant diseases by uploading images and
                receive treatment recommendations.
              </p>
            </div>
          </Link>

          {/* Feature 3 */}
          <Link href="/market/analysis" className="block">
            <div className="p-6 transition-all h-full bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-200">
              <div className="p-3 mb-4 bg-green-100 rounded-full w-fit">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Market Price Analysis
              </h3>
              <p className="text-gray-600">
                Track real-time crop prices, predict future trends, and get
                the best time to sell recommendations.
              </p>
            </div>
          </Link>

          {/* Feature 4 */}
          <Link href="/marketplace" className="block">
            <div className="p-6 transition-all h-full bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-200">
              <div className="p-3 mb-4 bg-green-100 rounded-full w-fit">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Direct Marketplace
              </h3>
              <p className="text-gray-600">
                Connect directly with buyers to sell your crops without
                middlemen, maximizing your profits.
              </p>
            </div>
          </Link>

          {/* Feature 5 */}
          <Link href="/schemes" className="block">
            <div className="p-6 transition-all h-full bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-200">
              <div className="p-3 mb-4 bg-green-100 rounded-full w-fit">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Government Schemes
              </h3>
              <p className="text-gray-600">
                Discover relevant government subsidies and schemes tailored to
                your farming profile.
              </p>
            </div>
          </Link>

          {/* Feature 6 */}
          <Link href="/alerts" className="block">
            <div className="p-6 transition-all h-full bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-200">
              <div className="p-3 mb-4 bg-green-100 rounded-full w-fit">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Smart Alerts
              </h3>
              <p className="text-gray-600">
                Receive timely notifications about weather changes, market
                fluctuations, and crop health issues.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
} 