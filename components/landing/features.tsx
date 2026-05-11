'use client';

import { Workflow, ChartBar as BarChart3, Shield, Globe, Layers, Cpu } from 'lucide-react';

const features = [
  {
    icon: Workflow,
    title: 'Smart Workflows',
    description:
      'Automate repetitive tasks and build custom workflows that adapt to how your team actually works.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Get instant insights into your team\'s performance with live dashboards and customizable reports.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'SOC 2 compliant with end-to-end encryption, SSO, and granular access controls built in from day one.',
  },
  {
    icon: Globe,
    title: 'Global Collaboration',
    description:
      'Work together seamlessly across time zones with async-first tools and real-time editing.',
  },
  {
    icon: Layers,
    title: 'Powerful Integrations',
    description:
      'Connect with 200+ tools your team already uses. One-click setup, zero migration headaches.',
  },
  {
    icon: Cpu,
    title: 'AI-Powered Insights',
    description:
      'Let AI surface what matters most. Smart summaries, priority suggestions, and anomaly detection.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to move fast
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete toolkit designed for modern teams. No bloat, no
            compromises, just the tools that make a difference.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
