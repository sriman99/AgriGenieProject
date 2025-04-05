"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const router = useRouter();
  const { user } = useAuth();

  const handleSubscribe = (plan: string) => {
    if (user) {
      // If user is logged in, redirect to checkout
      router.push(`/checkout?plan=${plan}&interval=${billingInterval}`);
    } else {
      // If user is not logged in, redirect to sign up
      router.push(`/auth/signup?redirect=/checkout?plan=${plan}&interval=${billingInterval}`);
    }
  };

  const plans = [
    {
      name: "Free",
      description: "Perfect for small farms and individual farmers",
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        { name: "Basic crop health monitoring", included: true },
        { name: "Limited AI assistant queries (10/month)", included: true },
        { name: "Basic weather forecasts", included: true },
        { name: "Community forum access", included: true },
        { name: "Basic market price data", included: true },
        { name: "Crop disease detection (5/month)", included: true },
        { name: "Activity calendar", included: true },
        { name: "Email support", included: true },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
        { name: "API access", included: false },
        { name: "Custom reports", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "Ideal for growing farms and agricultural businesses",
      price: {
        monthly: 19.99,
        yearly: 199.99,
      },
      features: [
        { name: "Basic crop health monitoring", included: true },
        { name: "Unlimited AI assistant queries", included: true },
        { name: "Advanced weather forecasts", included: true },
        { name: "Community forum access", included: true },
        { name: "Detailed market price data", included: true },
        { name: "Crop disease detection (unlimited)", included: true },
        { name: "Activity calendar", included: true },
        { name: "Priority email support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
        { name: "API access", included: false },
        { name: "Custom reports", included: false },
      ],
      cta: "Subscribe Now",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For large agricultural operations and cooperatives",
      price: {
        monthly: 49.99,
        yearly: 499.99,
      },
      features: [
        { name: "Basic crop health monitoring", included: true },
        { name: "Unlimited AI assistant queries", included: true },
        { name: "Advanced weather forecasts", included: true },
        { name: "Community forum access", included: true },
        { name: "Detailed market price data", included: true },
        { name: "Crop disease detection (unlimited)", included: true },
        { name: "Activity calendar", included: true },
        { name: "Priority email support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
        { name: "API access", included: true },
        { name: "Custom reports", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the plan that works best for your farming needs. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <Tabs
          defaultValue="monthly"
          className="w-full max-w-md"
          onValueChange={(value) => setBillingInterval(value as "monthly" | "yearly")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly billing</TabsTrigger>
            <TabsTrigger value="yearly">Yearly billing</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="mt-2 text-center">
            <p className="text-sm text-gray-500">Pay monthly, cancel anytime</p>
          </TabsContent>
          <TabsContent value="yearly" className="mt-2 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-green-600">Save 20%</span> with annual billing
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${
              plan.popular ? "border-green-500 shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="bg-green-500 text-white text-center py-1 rounded-t-lg">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${plan.price[billingInterval]}
                </span>
                {plan.price[billingInterval] > 0 && (
                  <span className="text-gray-500 ml-2">
                    /{billingInterval === "monthly" ? "month" : "year"}
                  </span>
                )}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-start">
                    <span className="mr-2 mt-1">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300" />
                      )}
                    </span>
                    <span
                      className={
                        feature.included ? "text-gray-700" : "text-gray-400"
                      }
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  plan.popular ? "bg-green-600 hover:bg-green-700" : ""
                }`}
                onClick={() => handleSubscribe(plan.name.toLowerCase())}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div>
            <h3 className="text-lg font-medium mb-2">Can I change plans later?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Is there a contract or commitment?</h3>
            <p className="text-gray-600">
              No long-term contracts required. You can cancel your subscription at any time.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Do you offer refunds?</h3>
            <p className="text-gray-600">
              Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          For large agricultural operations or organizations with specific needs, we offer custom solutions tailored to your requirements.
        </p>
        <Button variant="outline" size="lg" onClick={() => router.push("/contact")}>
          Contact Sales
        </Button>
      </div>
    </div>
  );
}
