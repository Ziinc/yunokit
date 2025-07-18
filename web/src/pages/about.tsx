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
        <h2 className="text-2xl font-semibold mt-8 mb-2">About the Developer</h2>
        <p className="mb-4">
          Placeholder for developer information. Update this section with details about the individual or team behind Yunokit.
        </p>
      </main>
    </Layout>
  );
}
