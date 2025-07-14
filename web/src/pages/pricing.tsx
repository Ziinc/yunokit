import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { Check, DollarSign, ChevronDown, Rocket, Zap } from 'lucide-react';
import { Button } from '../../../shared/src/ui/button';
import { Alert, AlertDescription } from '../../../shared/src/ui/alert';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../../shared/src/ui/collapsible';
import { cn } from '../lib/utils';

const plans = [
  {
    name: "Free",
    description: "Perfect for individuals getting started",
    price: 0,
    features: [
      "1 user included",
      "1 workspace",
      "Basic content management",
      "Standard support"
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
    price: 15,
    features: [
      { text: "3 users included", highlight: true },
      { text: "2 workspace included", highlight: true },
      { text: "Community features", highlight: true },
      "System authors",
      "Content approval flow",
      "Priority support"
    ],
    addOns: [
      { name: "Additional Workspace User", price: 5 },
      { name: "Additional Workspace", price: 10 }
    ],
    cta: "Start Free Trial",
    popular: true
  }
];

const faqs = [
  {
    question: "How does the user limit work?",
    answer: "Each plan comes with a set number of user seats. Additional users can be added to Pro plans for a monthly fee per user. Users can be added or removed at any time."
  },
  {
    question: "What happens when I exceed my workspace limit?",
    answer: "Pro plan users can add additional workspaces for a monthly fee. Free plan users are limited to one workspace."
  },
  {
    question: "Can I switch between plans?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards and debit cards. Enterprise customers can arrange for invoice-based billing."
  }
];

function ShipFastBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-cms-purple-light via-cms-green-light to-cms-purple-light py-24">
      <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="rounded-full bg-cms-green/10 p-3 mb-8">
            <Zap className="w-8 h-8 text-cms-green animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cms-purple to-cms-green bg-clip-text text-transparent">
            Ship Content Faster with Confidence
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get started in minutes, not days. Our intuitive platform helps you focus on what matters most - creating amazing content.
          </p>
          <div className="flex gap-4 items-center text-lg font-medium">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-cms-green" />
              <span>Quick Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-cms-green" />
              <span>Easy Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-cms-green" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuirkyFooterBanner() {
  return (
    <div className="py-24 bg-gradient-to-br from-cms-purple-light via-cms-green-light to-cms-purple-light">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex justify-center">
            <DollarSign className="w-12 h-12 text-cms-purple animate-bounce" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cms-purple">
            No Hidden Fees, No Sneaky Surprises!
          </h2>
          <p className="text-xl mb-6 text-muted-foreground">
            Just straightforward pricing that won't make your wallet cry. 
            <span className="block mt-2">
              (We promise it's cheaper than your coffee addiction! ☕️)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ plan }) {
  return (
    <Alert className={cn(
      "rounded-2xl p-8 transition-all relative border-2 hover:shadow-xl",
      plan.popular 
        ? "border-cms-purple bg-gradient-to-b from-cms-purple-light/30 to-transparent shadow-lg" 
        : "border-muted hover:border-cms-purple/50"
    )}>
      {plan.popular && (
        <div className="absolute -top-3 left-0 w-full flex justify-center">
          <span className="bg-cms-purple text-white px-6 py-1.5 rounded-full text-sm font-medium shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      <div className={cn("text-center mb-8", plan.popular && "mt-4")}>
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <AlertDescription className="mb-4">{plan.description}</AlertDescription>
        <div className="flex items-center justify-center gap-1">
          <DollarSign className="h-6 w-6 text-cms-purple" />
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, idx) => {
          const isHighlighted = typeof feature === 'object' && feature.highlight;
          const featureText = typeof feature === 'object' ? feature.text : feature;
          
          return (
            <li key={idx} className={cn(
              "flex items-start gap-3",
              isHighlighted && "bg-cms-purple-light/30 -mx-2 p-2 rounded-lg"
            )}>
              <Check className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5",
                isHighlighted ? "text-cms-purple" : "text-cms-green"
              )} />
              <span className={cn(
                "text-foreground",
                isHighlighted && "font-medium"
              )}>{featureText}</span>
            </li>
          );
        })}
        
        {plan.limitations && (
          <>
            <li className="pt-4 border-t">
              <p className="text-muted-foreground font-medium mb-2">Limitations:</p>
            </li>
            {plan.limitations.map((limitation, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                <span className="h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">•</span>
                <span>{limitation}</span>
              </li>
            ))}
          </>
        )}
      </ul>

      {plan.addOns && (
        <div className="mb-8 pt-4 border-t">
          <p className="text-foreground font-medium mb-3">Available Add-ons:</p>
          <ul className="space-y-2">
            {plan.addOns.map((addon, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{addon.name}</span>
                <span className="text-foreground">${addon.price}/mo per unit</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button asChild className="w-full" variant="default" size="lg">
        <Link to="/docs/intro" className="flex items-center justify-center gap-2">
          <Rocket className="w-4 h-4" />
          {plan.cta}
        </Link>
      </Button>
    </Alert>
  );
}

function FAQSection() {
  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="rounded-2xl border divide-y bg-card">
          {faqs.map((faq, idx) => (
            <Collapsible key={idx}>
              <CollapsibleTrigger className="w-full px-6 py-6 hover:bg-muted/50">
                {faq.question}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6">
                  <div className="rounded-xl bg-muted/50 px-6 py-4">
                    <p className="text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Pricing(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <Layout
      title={`Pricing | ${siteConfig.title}`}
      description="Simple, transparent pricing plans for teams of all sizes">
      <ShipFastBanner />
      <main className="bg-gradient-to-b from-background/50 to-background">
        <div className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <PricingCard key={idx} plan={plan} />
            ))}
          </div>
        </div>
        <FAQSection />
        <QuirkyFooterBanner />
      </main>
    </Layout>
  );
} 