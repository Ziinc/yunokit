import React from 'react';
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
    icon: <Database className="h-6 w-6 text-yellow-500" />,
    title: "YunoContent",
    subtitle: "Content Management System",
    description: "Transform your Supabase database into a powerful CMS with schema builder, content editor, and version control."
  },
  {
    icon: <Users className="h-6 w-6 text-yellow-500" />,
    title: "YunoCommunity", 
    subtitle: "Forum Platform",
    description: "Build engaging communities with forums, posts, comments, and moderation tools powered by your Supabase backend."
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
            Your Supabase Backend {' '}
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
              to="/docs/intro">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-colors"
              to="/docs/intro">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}



function FeatureSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Two Powerful Micro-Apps</h2>
          <p className="text-xl text-gray-600">Everything you need to manage content and build communities on Supabase</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {features.map((feature, idx) => (
            <div key={idx} className="p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all">
              <div className="bg-purple-50 rounded-full p-4 inline-block mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
              <p className="text-purple-600 font-medium text-sm uppercase tracking-wide mb-4">{feature.subtitle}</p>
              <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
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

function ChillSection() {
  const chillQuotes = [
    {
      text: "I used to stress about shipping features. Now I stress about having too much free time.",
      author: "Developer, Identity Crisis"
    },
    {
      text: "My work-life balance improved so much, I forgot what anxiety feels like.",
      author: "Senior Dev, Suspiciously Calm"
    },
    {
      text: "Weekends are for relaxing, not emergency fixes for the admin dashboard. Who knew?",
      author: "Tech Lead, Mind Blown"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Finally, You Can{' '}
              <span className="relative italic text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                Actually Chill
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Remember when you used to panic about content updates at 2 AM? 
              Those days are over. YunoKit handles the chaos so you can handle... well, literally anything else.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="/img/chilling.png"
                alt="Developer finally relaxing thanks to YunoKit"
                className="w-full h-auto max-w-lg mx-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
                This could be you! 🧘‍♂️
              </div>
            </div>

            <div className="space-y-6">
              {/* Quote 1 - Top left */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <p className="text-gray-700 italic text-base leading-relaxed">
                  "{chillQuotes[0].text}"
                </p>
                <p className="text-sm text-gray-500 mt-3 font-medium">
                  — {chillQuotes[0].author}
                </p>
              </div>

              {/* Quote 2 - Center right */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500 transform rotate-1 hover:rotate-0 transition-transform duration-300 ml-8">
                <p className="text-gray-700 italic text-base leading-relaxed">
                  "{chillQuotes[1].text}"
                </p>
                <p className="text-sm text-gray-500 mt-3 font-medium">
                  — {chillQuotes[1].author}
                </p>
              </div>

              {/* Quote 3 - Bottom left */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500 transform -rotate-1 hover:rotate-0 transition-transform duration-300 mr-4">
                <p className="text-gray-700 italic text-base leading-relaxed">
                  "{chillQuotes[2].text}"
                </p>
                <p className="text-sm text-gray-500 mt-3 font-medium">
                  — {chillQuotes[2].author}
                </p>
              </div>

              {/* Benefits grid */}
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 mt-8">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span>No more 3 AM content emergencies</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span>Marketing team stops DMing you</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span>Weekends become actual weekends</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span>Inner peace (results may vary)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        <ChillSection />
        <TimeMetricSection />
      </main>
    </Layout>
  );
} 