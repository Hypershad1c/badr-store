import Link from 'next/link';
import { Zap } from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'Featured', href: '/shop?featured=true' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
  ],
  Support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '#' },
    { label: 'Shipping', href: '#' },
    { label: 'Returns', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
};

export function StoreFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight">badr store</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Premium products and services for modern teams.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold">{category}</h4>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} badr store. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Twitter', 'GitHub', 'LinkedIn'].map((s) => (
              <Link key={s} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
