'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-primary/3 blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="mx-auto max-w-6xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-muted-foreground">Now in public beta</span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl text-balance">
          Build what matters.{' '}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Ship it fast.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
          The modern platform for teams who move fast. Streamline your workflow,
          collaborate in real-time, and deliver exceptional results without the
          complexity.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="h-12 px-8 text-base gap-2 group">
            Start Building Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            Watch Demo
          </Button>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-40 grayscale">
            {['Vercel', 'Stripe', 'Linear', 'Notion', 'Figma'].map(
              (name) => (
                <span
                  key={name}
                  className="text-xl font-bold tracking-tight text-foreground"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative mt-20 mx-auto max-w-4xl">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-primary/20 to-accent/10 blur-2xl opacity-50" />
          <div className="relative rounded-xl border bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <div className="h-3 w-3 rounded-full bg-green-400/80" />
              <div className="ml-4 h-5 w-48 rounded bg-muted" />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                  <div className="h-32 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border" />
                </div>
                <div className="w-64 space-y-3 hidden sm:block">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-20 rounded-lg bg-muted/50 border" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
