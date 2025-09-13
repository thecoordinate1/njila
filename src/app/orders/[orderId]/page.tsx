
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface OrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

const OrderDetailsPage: NextPage<OrderDetailsPageProps> = ({ params }) => {
  const router = useRouter();
  const { orderId } = params;

  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-20">
        <Card className="w-full max-w-2xl shadow-md">
          <CardHeader>
            <CardTitle>Details for Order #{orderId}</CardTitle>
            <CardDescription>
              This is a placeholder page for the order details. More information about the order stops, customer, and items will be displayed here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Order ID: <span className="font-mono bg-muted p-1 rounded-md">{orderId}</span></p>
            {/* More details will go here */}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderDetailsPage;
