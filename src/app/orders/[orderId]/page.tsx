
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, User, MapPin, CircleCheck, CircleDashed, MoreVertical } from 'lucide-react';
import type { DeliveryBatch } from '@/types/delivery';
import { cn } from '@/lib/utils';

interface OrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

// Mock data for a multi-stop delivery batch
const mockBatchData: { [key: string]: DeliveryBatch } = {
  'ORD-002': {
    id: 'ORD-002',
    label: 'Catering Supplies for East Park Events',
    stops: [
      { id: 'stop-1', type: 'pickup', address: 'Bwaila Street, Lusaka', shortAddress: 'Bwaila St', coordinates: [-15.42, 28.29], status: 'delivered', sequence: 1, customerName: 'Central Catering Depot' },
      { id: 'stop-2', type: 'dropoff', address: 'East Park Mall, Great East Road', shortAddress: 'East Park Mall', coordinates: [-15.39, 28.34], status: 'delivered', sequence: 2, customerName: 'Event Staging Co.' },
      { id: 'stop-3', type: 'dropoff', address: 'Acacia Park, Thabo Mbeki Rd', shortAddress: 'Acacia Park', coordinates: [-15.40, 28.32], status: 'arrived_at_dropoff', sequence: 3, customerName: 'Acacia Office Management' },
      { id: 'stop-4', type: 'dropoff', address: 'University of Lusaka (UNILUS)', shortAddress: 'UNILUS', coordinates: [-15.39, 28.36], status: 'pending', sequence: 4, customerName: 'UNILUS Student Affairs' },
    ],
    estimatedTotalTime: '1 hr 15 mins',
    estimatedTotalDistance: '18 km'
  },
  'ORD-003': {
    id: 'ORD-003',
    label: 'Electronics Parts Distribution',
    stops: [
      { id: 'stop-1', type: 'pickup', address: 'Katondo Street, Lusaka', shortAddress: 'Katondo St', coordinates: [-15.42, 28.28], status: 'delivered', sequence: 1, customerName: 'ZED Electronics Hub' },
      { id: 'stop-2', type: 'dropoff', address: 'Manda Hill Shopping Mall', shortAddress: 'Manda Hill', coordinates: [-15.40, 28.31], status: 'pending', sequence: 2, customerName: 'Gadget Repair Shop' },
    ],
  },
  'ORD-005': {
    id: 'ORD-005',
    label: 'Clothing Parcel Run',
     stops: [
      { id: 'stop-1', type: 'pickup', address: 'Kamwala Market, Lusaka', shortAddress: 'Kamwala Market', coordinates: [-15.43, 28.29], status: 'delivered', sequence: 1, customerName: 'Local Fabrics Ltd.' },
      { id: 'stop-2', type: 'dropoff', address: 'Cosmopolitan Mall, Kafue Rd', shortAddress: 'Cosmopolitan Mall', coordinates: [-15.45, 28.27], status: 'pending', sequence: 2, customerName: 'Boutique Z' },
    ],
  }
};


const OrderDetailsPage: NextPage<OrderDetailsPageProps> = ({ params }) => {
  const router = useRouter();
  const { orderId } = params;
  const orderData = mockBatchData[orderId];

  const getStatusIcon = (status: string) => {
    const completedStatuses = ['picked_up', 'delivered', 'completed'];
    if (completedStatuses.includes(status)) {
      return <CircleCheck className="h-6 w-6 text-green-500" />;
    }
    return <CircleDashed className="h-6 w-6 text-muted-foreground" />;
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight truncate">Order Details</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-20">
        <Card className="w-full max-w-2xl shadow-md">
          <CardHeader>
            <CardTitle>Order #{orderId}</CardTitle>
            <CardDescription>
              {orderData?.label || 'Details for this batched delivery.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orderData ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Delivery Stops</h3>
                <div className="relative pl-6">
                  {/* Vertical line for the timeline */}
                  <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
                  
                  {orderData.stops.map((stop, index) => (
                    <div key={stop.id} className="relative flex items-start space-x-6 pb-8">
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-primary/50 shrink-0">
                         {getStatusIcon(stop.status)}
                      </div>
                      <div className="pt-2.5 min-w-0 flex-1">
                        <p className={cn("text-sm font-semibold", stop.status !== 'pending' && "text-foreground", stop.status === 'pending' && "text-muted-foreground")}>
                          Step {stop.sequence}: <span className="capitalize">{stop.type}</span>
                        </p>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex items-center">
                             <User className="h-4 w-4 mr-3 text-muted-foreground" />
                             <span>{stop.customerName}</span>
                          </div>
                          <div className="flex items-center">
                             <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                             <span>{stop.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No details found for order <span className="font-mono bg-muted p-1 rounded-md">{orderId}</span>. This might be an express order with no intermediate stops.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderDetailsPage;
