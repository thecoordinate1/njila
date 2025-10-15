
'use client';

import { useState } from 'react';
import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


type DeliveryStatus = 'Pending' | 'Assigned' | 'In Transit' | 'Delivered' | 'Cancelled';
type DeliveryTier = 'Express' | 'Standard' | 'Economy';

interface Delivery {
  id: string;
  buyerName: string;
  buyerPhone: string;
  vendorName: string;
  pickupAddress: string;
  deliveryAddress: string;
  tier: DeliveryTier;
  status: DeliveryStatus;
  driver?: string;
}

const deliveriesData: Delivery[] = [
    { id: 'ORD-101', buyerName: 'Alice Johnson', buyerPhone: '555-0101', vendorName: 'Gadget World', pickupAddress: '123 Tech Ave', deliveryAddress: '456 Home St', tier: 'Express', status: 'Pending' },
    { id: 'ORD-102', buyerName: 'Bob Williams', buyerPhone: '555-0102', vendorName: 'Fresh Grocers', pickupAddress: '789 Market Rd', deliveryAddress: '101 Maple Dr', tier: 'Standard', status: 'Assigned', driver: 'John Tembo' },
    { id: 'ORD-103', buyerName: 'Charlie Brown', buyerPhone: '555-0103', vendorName: 'Book Barn', pickupAddress: '456 Library Ln', deliveryAddress: '212 Oak Ct', tier: 'Economy', status: 'In Transit', driver: 'Maria Phiri' },
    { id: 'ORD-104', buyerName: 'Diana Prince', buyerPhone: '555-0104', vendorName: 'Fashion Hub', pickupAddress: '321 Style Blvd', deliveryAddress: '777 Hero Way', tier: 'Express', status: 'Delivered', driver: 'David Banda' },
    { id: 'ORD-105', buyerName: 'Ethan Hunt', buyerPhone: '555-0105', vendorName: 'Outdoor Gear', pickupAddress: '654 Mountain Pass', deliveryAddress: '987 Safe House', tier: 'Standard', status: 'Cancelled' },
    { id: 'ORD-106', buyerName: 'Fiona Glenanne', buyerPhone: '555-0106', vendorName: 'Explosives Inc.', pickupAddress: '12 Dynamite Rd', deliveryAddress: '45 Burn Notice Blvd', tier: 'Express', status: 'Pending' },
];

const TABS: DeliveryStatus[] = ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'];

const getStatusBadgeColor = (status: DeliveryStatus) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Assigned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; // New status
    case 'In Transit': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const DeliveriesPage: NextPage = () => {

  const renderContent = (status: DeliveryStatus) => {
    const filteredDeliveries = deliveriesData.filter(d => d.status === status);

    if (filteredDeliveries.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No deliveries with status "{status}".</p>
            </div>
        );
    }
    
    return (
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Delivery Address</TableHead>
              <TableHead>Tier</TableHead>
              {status !== 'Pending' && <TableHead>Driver</TableHead>}
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell className="font-medium">{delivery.id}</TableCell>
                <TableCell>
                    <div>{delivery.buyerName}</div>
                    <div className="text-xs text-muted-foreground">{delivery.buyerPhone}</div>
                </TableCell>
                <TableCell>
                    <div>{delivery.vendorName}</div>
                    <div className="text-xs text-muted-foreground">{delivery.pickupAddress}</div>
                </TableCell>
                <TableCell>{delivery.deliveryAddress}</TableCell>
                <TableCell>{delivery.tier}</TableCell>
                {status !== 'Pending' && <TableCell>{delivery.driver || 'N/A'}</TableCell>}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {delivery.status === 'Pending' && <DropdownMenuItem>Assign Driver</DropdownMenuItem>}
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Cancel Order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    );
  }

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
        <Tabs defaultValue="Pending">
          <TabsList>
            {TABS.map(tab => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
                <Badge className={cn("ml-2", getStatusBadgeColor(tab))}>
                  {deliveriesData.filter(d => d.status === tab).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card>
                {renderContent(tab)}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
    </div>
  );
};

export default DeliveriesPage;
