'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '0',
    description: 'Perfect for individuals and small experiments.',
    features: [
      'Up to 3 projects',
      'Basic analytics',
      'Community support',
      '1 GB storage',
    ],
    cta: 'Get Started Free',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'For growing teams who need more power.',
    features: [
      'Unlimited projects',
      'Advanced analytics & reports',
      'Priority support',
      '100 GB storage',
      'Custom workflows',
      'API access',
    ],
    cta: 'Start Free Trial',
    variant: 'default' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '99',
    description: 'For organizations that need full control.',
    features: [
      'Everything in Pro',
      'SSO & SAML',
      'Dedicated account manager',
      'Unlimited storage',
      'Custom SLAs',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    variant: 'outline' as const,
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No hidden fees. No surprises. Start free and scale as you grow.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border bg-card p-8 transition-all duration-300 hover:shadow-lg ${
                plan.popular
                  ? 'border-primary shadow-lg scale-[1.02] lg:scale-105'
                  : 'hover:-translate-y-0.5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  ${plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <Button
                variant={plan.variant}
                className="mt-6 w-full"
                size="lg"
              >
                {plan.cta}
              </Button>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
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
