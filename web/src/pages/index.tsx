import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { Sparkles, Zap, Users, Database, Wand2, Clock, ArrowRight } from 'lucide-react';

// Reusing testimonials from sign-in page for consistency
const testimonials = [
  {
    quote: "Finally! I no longer wake up to 3am Slack messages asking me to update a typo. YunoContent gave our marketing team superpowers and gave me back my sanity.",
    author: "Developer Who Can Sleep Again",
    role: "Senior Engineer"
  },
  {
    quote: "Our content team went from 'Can you add this comma?' to 'We deployed three landing pages today.' My code commits are now for features, not fixing typos.",
    author: "Engineer with Better Git History",
    role: "Tech Lead"
  },
  {
    quote: "The marketing department and I haven't had a single emergency meeting since implementing YunoContent. They're happier, I'm happier, and our website is updated faster than ever.",
    author: "CTO Who Recovered Their Calendar",
    role: "Chief Technology Officer"
  }
];

const features = [
  {
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    title: "Lightning Fast",
    description: "Dramatically accelerate your content workflow with optimized tools designed for efficiency."
  },
  {
    icon: <Users className="h-6 w-6 text-yellow-500" />,
    title: "Community Magic",
    description: "Transform engagement with powerful moderation and interactive features your users will love."
  },
  {
    icon: <Database className="h-6 w-6 text-yellow-500" />,
    title: "Supabase Integration",
    description: "Seamlessly connects with your Supabase database for a unified tech stack and simplified development."
  },
  {
    icon: <Wand2 className="h-6 w-6 text-yellow-500" />,
    title: "Effortless Setup",
    description: "Get started in minutes with intuitive configuration that requires minimal technical expertise."
  }
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-24">
      {/* Floating sparkles for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Sparkles className="absolute top-[10%] left-[5%] text-yellow-400 h-6 w-6 animate-pulse" />
        <Sparkles className="absolute top-[20%] right-[8%] text-yellow-400 h-5 w-5 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute top-[80%] left-[15%] text-yellow-400 h-7 w-7 animate-pulse" style={{ animationDelay: '1.2s' }} />
        <Sparkles className="absolute top-[65%] right-[12%] text-yellow-400 h-4 w-4 animate-pulse" style={{ animationDelay: '0.7s' }} />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white mb-6">
            Content Management{' '}
            <span className="relative italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
              Reimagined
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full animate-pulse"></span>
            </span>
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            {siteConfig.tagline}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-purple-600 font-semibold hover:bg-yellow-50 transition-colors"
              to="/docs/getting-started">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-colors"
              to="/docs/introduction">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function TestimonialSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Loved by Developers Worldwide
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-gray-800">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose YunoContent?</h2>
          <p className="text-xl text-gray-600">The Strapi-alternative that transforms your Supabase database into a powerful, intuitive CMS.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-all">
              <div className="bg-purple-50 rounded-full p-3 inline-block mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      title: "Content Manager",
      features: [
        "Intuitive dashboard for content organization",
        "Version control and content history",
        "Role-based access control",
        "Scheduled publishing and drafts",
        "Real-time collaboration tools"
      ]
    },
    {
      title: "Content Builder",
      features: [
        "Drag-and-drop page builder",
        "Custom field types and validations",
        "Reusable content blocks",
        "SEO optimization tools",
        "Mobile preview and responsive editing"
      ]
    },
    {
      title: "Assets Library",
      features: [
        "Centralized media management",
        "Automatic image optimization",
        "AI-powered tagging and organization",
        "CDN integration for fast delivery",
        "Bulk upload and management"
      ]
    },
    {
      title: "Community Management",
      features: [
        "User-generated content moderation",
        "Automated content filtering",
        "Community engagement analytics",
        "Comment and discussion management",
        "User reputation system"
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features for Modern Teams</h2>
          <p className="text-xl text-gray-600">Everything you need to manage, create, and scale your content operations</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-6 text-purple-600">{benefit.title}</h3>
              <ul className="space-y-4">
                {benefit.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimeMetricSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 mr-3 text-yellow-300" />
          <h2 className="text-3xl font-bold">Save 5+ hours every week!*</h2>
        </div>
        <p className="text-yellow-200 italic opacity-80">
          *Hours measured in developer time, which somehow expands when estimating project deadlines yet shrinks during lunch breaks.
        </p>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Transform your Supabase database into a powerful, intuitive CMS">
      <HomepageHeader />
      <main>
        <FeatureSection />
        <BenefitsSection />
        <TestimonialSection />
        <TimeMetricSection />
      </main>
    </Layout>
  );
} 