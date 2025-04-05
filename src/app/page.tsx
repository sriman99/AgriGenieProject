"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Leaf,
  Activity,
  ShoppingCart,
  BarChart3,
  Bot,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function LandingPage() {
  const { user, profile } = useAuth();

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    if (!profile?.user_type) return "/dashboard";

    switch (profile.user_type.toLowerCase()) {
      case "farmer":
        return "/dashboard/farmer";
      case "buyer":
        return "/dashboard/buyer";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        id="home"
        className="relative py-20 overflow-hidden bg-gradient-to-br from-green-50 to-green-100"
      >
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/pattern-light.svg')] bg-repeat opacity-30"></div>
        </div>
        <div className="container relative z-10 px-4 mx-auto">
          <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
            <div className="flex flex-col max-w-2xl space-y-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-green-900 md:text-5xl lg:text-6xl">
                AI-Powered Farming{" "}
                <span className="text-green-600">Revolution</span>
              </h1>
              <p className="text-xl text-gray-700">
                AgriGenie empowers farmers with AI-driven insights, real-time
                analytics, and a direct marketplace to maximize yield and
                profit.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                {user ? (
                  <Link href={getDashboardRoute()}>
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="relative flex items-center justify-center w-full md:w-1/2">
              <div className="relative w-full max-w-lg overflow-hidden rounded-xl shadow-2xl aspect-[4/3]">
                <Image
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Smart Farming with AgriGenie"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute bottom-0 right-0 p-4 translate-y-1/4 bg-white rounded-lg shadow-xl -translate-x-1/4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Yield Increase
                    </p>
                    <p className="text-2xl font-bold text-green-600">+35%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              How AgriGenie Works
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              A simple process designed to help farmers maximize their
              productivity and income
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative p-8 bg-white rounded-xl shadow-sm">
              <div className="absolute flex items-center justify-center w-12 h-12 font-bold text-white bg-green-600 rounded-full -top-6">
                1
              </div>
              <h3 className="mt-6 mb-4 text-xl font-bold text-gray-900">
                Connect Your Farm
              </h3>
              <p className="text-gray-600">
                Sign up and input your farming details such as location, crop
                types, and farming methods.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 bg-white rounded-xl shadow-sm">
              <div className="absolute flex items-center justify-center w-12 h-12 font-bold text-white bg-green-600 rounded-full -top-6">
                2
              </div>
              <h3 className="mt-6 mb-4 text-xl font-bold text-gray-900">
                Receive AI Insights
              </h3>
              <p className="text-gray-600">
                Get personalized recommendations, disease detection, and market
                analysis based on your data.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 bg-white rounded-xl shadow-sm">
              <div className="absolute flex items-center justify-center w-12 h-12 font-bold text-white bg-green-600 rounded-full -top-6">
                3
              </div>
              <h3 className="mt-6 mb-4 text-xl font-bold text-gray-900">
                Sell Directly to Buyers
              </h3>
              <p className="text-gray-600">
                List your crops on our marketplace and connect with buyers for
                the best possible price.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Success Stories
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Hear from farmers who have transformed their operations with
              AgriGenie
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center mb-4 space-x-4">
                <div className="relative w-12 h-12 overflow-hidden bg-gray-200 rounded-full">
                  <Image
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                    alt="Farmer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Rajesh Kumar</h4>
                  <p className="text-sm text-gray-600">Wheat Farmer, Punjab</p>
                </div>
              </div>
              <p className="text-gray-600">
                "AgriGenie helped me increase my wheat yield by 30% and I was
                able to sell at 20% higher prices using the market insights."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center mb-4 space-x-4">
                <div className="relative w-12 h-12 overflow-hidden bg-gray-200 rounded-full">
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                    alt="Farmer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Lakshmi Patel</h4>
                  <p className="text-sm text-gray-600">
                    Rice Farmer, Tamil Nadu
                  </p>
                </div>
              </div>
              <p className="text-gray-600">
                "The disease detection saved my entire crop from a fungal
                infection. The AI identified it early and provided treatment
                suggestions."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center mb-4 space-x-4">
                <div className="relative w-12 h-12 overflow-hidden bg-gray-200 rounded-full">
                  <Image
                    src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                    alt="Farmer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Amit Singh</h4>
                  <p className="text-sm text-gray-600">
                    Vegetable Farmer, Maharashtra
                  </p>
                </div>
              </div>
              <p className="text-gray-600">
                "I connected with buyers directly through the marketplace and
                eliminated middlemen, increasing my profits by 40%."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-green-600 text-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold">10,000+</p>
              <p className="text-lg font-medium">Farmers Empowered</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">30%</p>
              <p className="text-lg font-medium">Average Yield Increase</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">₹12 Cr+</p>
              <p className="text-lg font-medium">Marketplace Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">25%</p>
              <p className="text-lg font-medium">Profit Enhancement</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="p-8 text-center bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Ready to Revolutionize Your Farming?
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-600">
              Join thousands of farmers who are already benefiting from
              AgriGenie's AI-powered solutions.
            </p>
            <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              {user ? (
                <Link href={getDashboardRoute()}>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Get Started for Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Learn More
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">AgriGenie</h3>
              <p className="mb-4">
                AI-powered farming solutions to empower farmers across India.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">Features</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-white">
                    AI Chatbot
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white">
                    Disease Detection
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white">
                    Market Analysis
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white">
                    Direct Marketplace
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white">
                    Government Schemes
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#testimonials" className="hover:text-white">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#stats" className="hover:text-white">
                    Statistics
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#cta" className="hover:text-white">
                    Get Started
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#home" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#home" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#home" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#home" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#home" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-gray-800 text-center">
            <p>© 2023 AgriGenie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
