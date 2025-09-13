'use client';

import type { NextPage } from 'next';
import { Suspense } from 'react';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';


type OrderType = 'express' | 'mid' | 'wait_for';
type OrderStatus = 'Confirmed' | 'Picking Up' | 'Delivering';

interface ActiveOrder {
  id: string;
  content: string;
  amount: number;
  location: string | string[];
  type: OrderType;
  status: OrderStatus;
  ordersSoFar?: number;
  ordersTarget?: number;
}

const mockOrders: ActiveOrder[] = [
  { id: 'ORD-001', content: 'Legal Documents', amount: 150.00, location: 'Arcades Mall', type: 'express', status: 'Picking Up' },
  { id: 'ORD-002', content: 'Catering Supplies', amount: 450.50, location: ['East Park Mall', 'Acacia Park', 'UNILUS'], type: 'mid', ordersSoFar: 3, ordersTarget: 5, status: 'Delivering' },
  { id: 'ORD-003', content: 'Electronics Parts', amount: 85.75, location: ['Manda Hill', 'Great East Road', 'PHi'], type: 'wait_for', ordersSoFar: 1, ordersTarget: 10, status: 'Confirmed' },
  { id: 'ORD-004', content: 'Flower Bouquet', amount: 220.00, location: 'Levy Junction', type: 'express', status: 'Confirmed' },
  { id: 'ORD-005', content: 'Clothing Parcel', amount: 110.25, location: ['Cosmopolitan Mall', 'Kamwala Market'], type: 'mid', ordersSoFar: 8, ordersTarget: 8, status: 'Delivering' },
];

const getTypeBadgeVariant = (orderType: OrderType) => {
  switch (orderType) {
    case 'express':
      return 'destructive';
    case 'mid':
      return 'secondary';
    case 'wait_for':
    default:
      return 'outline';
  }
};

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'Delivering':
      return 'default'; // default is primary color (teal)
    case 'Picking Up':
      return 'secondary'; // secondary is a lighter teal
    case 'Confirmed':
    default:
      return 'outline'; // outline is a gray-ish border
  }
};

const formatOrderType = (orderType: OrderType) => {
  switch (orderType) {
    case 'express':
      return 'Express';
    case 'mid':
      return 'Mid';
    case 'wait_for':
      return 'Wait For';
    default:
      return 'Standard';
  }
};

const HomePageContent: NextPage = () => {
  const router = useRouter();

  const handleRowClick = (order: ActiveOrder) => {
    if (Array.isArray(order.location)) {
      console.log(`Navigating to details for order ${order.id}`);
      // In a real app, you would navigate to a details page:
      // router.push(`/orders/${order.id}`);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary flex items-center">
            <LayoutDashboard className="inline-block mr-2 h-6 w-6 align-text-bottom" />
            Manager Dashboard
          </h1>
        </div>
      </header>

      <main className="flex-grow p-4 overflow-y-auto space-y-4">
        <Card className="shadow-lg rounded-lg bg-card w-full">
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>A real-time overview of ongoing deliveries.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Content</TableHead>
                  <TableHead>Amount (ZMW)</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow 
                    key={order.id}
                    onClick={() => handleRowClick(order)}
                    className={cn(
                      Array.isArray(order.location) && "cursor-pointer"
                    )}
                  >
                    <TableCell className="font-medium">
                      <div>{order.content}</div>
                      {(order.type === 'mid' || order.type === 'wait_for') && order.ordersSoFar !== undefined && order.ordersTarget !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">
                              Progress
                            </span>
                             <span className="text-xs font-semibold text-foreground">
                              {order.ordersSoFar}/{order.ordersTarget}
                            </span>
                          </div>
                          <Progress value={(order.ordersSoFar / order.ordersTarget) * 100} className="h-2" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{order.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {Array.isArray(order.location) ? (
                        <span className="font-semibold text-primary">Multiple</span>
                      ) : (
                        order.location
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(order.type)}>
                        {formatOrderType(order.type)}
                      </Badge>
                    </TableCell>
                     <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <BottomNavbar />
    </div>
  );
};

const HomePage: NextPage = () => {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Loading page...</div>}>
      <HomePageContent />
    </Suspense>
  );
};

export default HomePage;
