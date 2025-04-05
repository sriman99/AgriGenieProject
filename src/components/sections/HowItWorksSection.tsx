export default function HowItWorksSection() {
  return (
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
  );
} 