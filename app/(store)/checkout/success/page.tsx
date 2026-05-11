'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Checkmark icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-600" />
          </div>

          {/* Celebration message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Your order has been placed!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. We are processing your order and will
              send you a confirmation shortly.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button asChild className="w-full">
              <Link href="/orders">View Orders</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
