import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { Check, DollarSign, Zap } from 'lucide-react';

const plans = [
  {
    name: "Free",
    description: "Perfect for individuals getting started",
    price: "0",
    features: [
      "1 user included",
      "1 workspace",
      "Basic content management",
      "Standard support",
      "Basic analytics"
    ],
    limitations: [
      "No community features",
      "No system authors",
      "No content approval flow"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    description: "For growing teams that need more power",
    price: "5",
    features: [
      "3 users included",
      "1 workspace included",
      "Community features",
      "System authors",
      "Content approval flow",
      "Priority support",
      "Advanced analytics"
    ],
    addOns: [
      { name: "Additional User", price: 1 },
      { name: "Additional Workspace", price: 5 }
    ],
    cta: "Start Free Trial",
    popular: true
  }
];

function PricingHeader() {
  return (
    <div className="py-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include core features to get you started.
        </p>
      </div>
    </div>
  );
}

function PricingCard({ plan }) {
  return (
    <div className={clsx(
      "rounded-2xl p-8 transition-all",
      plan.popular 
        ? "bg-white shadow-xl border-2 border-purple-500 relative" 
        : "bg-white/80 shadow-lg"
    )}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        <div className="flex items-center justify-center gap-1">
          {typeof plan.price === 'number' || plan.price === '0' ? (
            <>
              <DollarSign className="h-6 w-6 text-purple-600" />
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-600">/month</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-purple-600">{plan.price}</span>
          )}
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
        
        {plan.limitations && (
          <>
            <li className="pt-4 border-t">
              <p className="text-gray-500 font-medium mb-2">Limitations:</p>
            </li>
            {plan.limitations.map((limitation, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-500">
                <span className="h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">•</span>
                <span>{limitation}</span>
              </li>
            ))}
          </>
        )}
      </ul>

      {plan.addOns && (
        <div className="mb-8 pt-4 border-t">
          <p className="text-gray-700 font-medium mb-3">Available Add-ons:</p>
          <ul className="space-y-2">
            {plan.addOns.map((addon, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">{addon.name}</span>
                <span className="text-gray-900">${addon.price}/mo per unit</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/docs/getting-started"
        className={clsx(
          "block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors",
          plan.popular
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        )}>
        {plan.cta}
      </Link>
    </div>
  );
}

export default function Pricing(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <Layout
      title={`Pricing | ${siteConfig.title}`}
      description="Simple, transparent pricing plans for teams of all sizes">
      <PricingHeader />
      
      <main className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <PricingCard key={idx} plan={plan} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
} 