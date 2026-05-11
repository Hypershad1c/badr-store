'use client';

import { Rocket, Settings, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Rocket,
    step: '01',
    title: 'Connect your tools',
    description:
      'Import your existing projects, connect your repos, and sync with your team\'s toolchain in minutes.',
  },
  {
    icon: Settings,
    step: '02',
    title: 'Configure your workflow',
    description:
      'Use pre-built templates or create custom workflows that match exactly how your team operates.',
  },
  {
    icon: TrendingUp,
    step: '03',
    title: 'Ship and iterate',
    description:
      'Deploy with confidence, track results in real-time, and continuously improve based on data.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three simple steps to transform how your team builds and ships.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(100%_-_1rem)] w-[calc(100%_-_2rem)] h-px border-t-2 border-dashed border-primary/20" />
              )}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 border">
                  <step.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
