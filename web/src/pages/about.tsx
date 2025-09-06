import React from 'react';
import Layout from '@theme/Layout';

export default function About(): JSX.Element {
  return (
    <Layout title="About Us" description="About Yunokit">
      <main className="py-16 container mx-auto px-4 max-w-3xl">
    <h1 className="text-4xl font-bold mb-4">About Yunokit</h1>
        <p className="mb-4">
          Yunokit aims to streamline feature development for Supabase apps by providing modular micro-apps and intuitive content management tools.
        </p>
        <p className="mb-4">
          This project exists to help teams focus on delivering value instead of building boilerplate infrastructure.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Goals: <strong>Stop remaking the wheel!</strong></h2>
        
        <div className="space-y-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">🚀 Accelerate Development</h3>
            <p className="text-gray-600">
              Reduce time-to-market by providing pre-built, production-ready components and workflows. 
              Skip the repetitive setup and jump straight into building features that matter to your users.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">🧩 Modular Architecture</h3>
            <p className="text-gray-600">
              Build scalable applications with composable micro-apps that can be mixed and matched based on your needs. 
              Each module is designed to work independently while integrating seamlessly with others.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">🔧 Developer Experience First</h3>
            <p className="text-gray-600">
              Prioritize developer productivity with Supabase-first tooling and integrations. 
              Spend less time remaking the wheel and more time building.
            </p>
          </div>
        
        </div>
        <h2 className="text-2xl font-semibold mt-8 mb-4">About the Developer</h2>
        
        <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
          <img 
            src="/img/developer-headshot.png" 
            alt="Tze Yiing (Ziinc)" 
            className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0 flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Ziinc 👋</h3>
            <p className="text-gray-600 mb-2">Engineer @ Supabase | Full-Stack Sorcerer | Elixir Evangelist</p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="mb-4">
            Meet Ziinc, the developer who somehow convinced Supabase to let him wrangle billions of API requests daily. When he's not busy optimizing garbage collection like it's 
            a personal vendetta against memory leaks, you'll find him deep in the Elixir/Erlang rabbit hole, 
            probably spawning processes faster than a caffeinated GenServer.
          </p>
          
          <p className="mb-4">
            <strong>His superpowers include:</strong>
          </p>
          
          <ul className="mb-4 space-y-2">
            <li>🔥 <strong>Elixir/Erlang Wizardry:</strong> Can spawn supervisors in his sleep and has probably named his pets after OTP behaviors</li>
            <li>📊 <strong>Performance Archaeology:</strong> Digs through performance metrics like Indiana Jones, but with more CPU graphs and fewer snakes</li>
            <li>🗄️ <strong>Database Sorcerer:</strong> Conjures Ecto queries that make PostgreSQL blush and keeps Logflare's billions of events flowing smoother than a caffeinated pipeline</li>
            <li>🎯 <strong>Observability Oracle:</strong> Knows exactly why your service is slow at 3 AM (spoiler: it's always the GC)</li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}
