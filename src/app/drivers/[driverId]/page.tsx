
'use client';

import { useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Truck, History, Star, TrendingUp, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DriverDetailsPageProps {
  params: {
    driverId: string;
  };
}

// Mock data - in a real app, this would be fetched from an API
const driversData = {
  'DRV-001': { id: 'DRV-001', name: 'John Tembo', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=JT', status: 'Available' as const, phone: '+260977123456', rating: 4.9, totalDeliveries: 152, memberSince: '2022-08-15', totalPayout: 22800, cancelledDeliveries: 5 },
  'DRV-002': { id: 'DRV-002', name: 'Maria Phiri', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=MP', status: 'Making delivery' as const, currentOrderId: 'ORD-002', phone: '+260977234567', rating: 4.8, totalDeliveries: 210, memberSince: '2021-11-20', totalPayout: 35700, cancelledDeliveries: 10 },
  'DRV-003': { id: 'DRV-003', name: 'David Banda', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=DB', status: 'Making delivery' as const, currentOrderId: 'ORD-005', phone: '+260977345678', rating: 4.9, totalDeliveries: 180, memberSince: '2022-01-10', totalPayout: 28800, cancelledDeliveries: 8 },
  'DRV-004': { id: 'DRV-004', name: 'Grace Zulu', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=GZ', status: 'Available' as const, phone: '+260977456789', rating: 4.7, totalDeliveries: 95, memberSince: '2023-03-05', totalPayout: 13205, cancelledDeliveries: 12 },
  'DRV-005': { id: 'DRV-005', name: 'Peter Mwale', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=PM', status: 'Available' as const, phone: '+260977567890', rating: 5.0, totalDeliveries: 320, memberSince: '2020-05-25', totalPayout: 54400, cancelledDeliveries: 3 },
  'DRV-006': { id: 'DRV-006', name: 'Charity Sakala', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=CS', status: 'Making delivery' as const, currentOrderId: 'ORD-001', phone: '+260977678901', rating: 4.8, totalDeliveries: 115, memberSince: '2022-10-30', totalPayout: 17825, cancelledDeliveries: 6 },
};

const fullHistory = [
    { id: 'LSK-HIST-001', destination: 'Taj Pamodzi Hotel', payout: 185.25, date: 'Yesterday', status: 'Completed' as const },
    { id: 'LSK-HIST-003', destination: 'Manda Hill Mall', payout: 75.50, date: '2 days ago', status: 'Completed' as const },
    { id: 'LSK-HIST-004', destination: 'University of Zambia', payout: 120.00, date: '2 days ago', status: 'Cancelled' as const },
    { id: 'LSK-HIST-005', destination: 'Levy Junction Mall', payout: 65.00, date: '3 days ago', status: 'Completed' as const },
    { id: 'LSK-HIST-006', destination: 'Soweto Market', payout: 115.75, date: '4 days ago', status: 'Completed' as const },
    { id: 'LSK-HIST-007', destination: 'Civic Centre', payout: 55.25, date: '5 days ago', status: 'Cancelled' as const },
]


const DriverDetailsPage: NextPage<DriverDetailsPageProps> = ({ params }) => {
  const router = useRouter();
  const { driverId } = params;
  const driverData = driversData[driverId as keyof typeof driversData];
  const [showFullHistory, setShowFullHistory] = useState(false);

  const historyToShow = showFullHistory ? fullHistory : fullHistory.slice(0, 3);

  if (!driverData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Driver not found.</p>
        <Button onClick={() => router.back()} variant="link">Go back</Button>
      </div>
    );
  }

  const completionRate = driverData.totalDeliveries > 0 
    ? ((driverData.totalDeliveries - driverData.cancelledDeliveries) / driverData.totalDeliveries) * 100 
    : 0;
    
  const averagePayout = driverData.totalDeliveries > 0 
    ? driverData.totalPayout / (driverData.totalDeliveries - driverData.cancelledDeliveries) 
    : 0;

  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight truncate">Driver Details</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-20 space-y-6">
        <Card className="w-full max-w-2xl shadow-md">
            <CardHeader className="flex flex-row items-center space-x-4">
                 <Avatar className="h-20 w-20">
                    <AvatarImage src={driverData.avatarUrl} alt={driverData.name} data-ai-hint="driver avatar" />
                    <AvatarFallback>{driverData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle className="text-2xl">{driverData.name}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                        <Badge
                          className={cn(
                            driverData.status === 'Available' && 'bg-green-100 text-green-800 border-green-200',
                            driverData.status === 'Making delivery' && 'bg-amber-100 text-amber-800 border-amber-200'
                          )}
                          variant="outline"
                        >
                          {driverData.status}
                        </Badge>
                         <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-4 w-4 mr-1 text-amber-400 fill-amber-400" />
                            <span className="font-semibold text-foreground">{driverData.rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                 <Button asChild variant="outline" size="icon" className="rounded-full h-12 w-12">
                    <a href={`tel:${driverData.phone}`}>
                        <Phone className="h-5 w-5 text-primary" />
                        <span className="sr-only">Call {driverData.name}</span>
                    </a>
                </Button>
            </CardHeader>
        </Card>

        {driverData.status === 'Making delivery' && driverData.currentOrderId && (
            <Card className="w-full max-w-2xl shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Truck className="mr-3 h-6 w-6" />
                        Current Delivery
                    </CardTitle>
                    <CardDescription>
                        This driver is currently handling order #{driverData.currentOrderId}.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="bg-muted/50 p-4 border-t">
                    <Button asChild className="w-full" variant="secondary">
                        <Link href={`/orders/${driverData.currentOrderId}`}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            View Order Details
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        )}

         <Card className="w-full max-w-2xl shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <TrendingUp className="mr-3 h-6 w-6" />
                    Performance Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold">{driverData.totalDeliveries}</p>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                </div>
                 <div className="p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold">{driverData.rating.toFixed(1)}/5.0</p>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                </div>
                 <div className="p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Completion</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold">ZMW {averagePayout.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Avg. Payout</p>
                </div>
            </CardContent>
        </Card>


        <Card className="w-full max-w-2xl shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <History className="mr-3 h-6 w-6" />
                    Delivery History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {historyToShow.map(order => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                            <div>
                                <p className="font-semibold">{order.destination}</p>
                                <p className="text-xs text-muted-foreground">Payout: ZMW {order.payout.toFixed(2)} | {order.date}</p>
                            </div>
                            <Badge
                                variant={order.status === 'Completed' ? 'secondary' : 'destructive'}
                                className={cn(
                                    order.status === 'Completed' && 'bg-green-100 text-green-800 border-green-200',
                                    order.status === 'Cancelled' && 'bg-red-100 text-red-800 border-red-200'
                                )}
                            >
                                {order.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
             {fullHistory.length > 3 && (
                <CardFooter className="p-3 border-t bg-muted/50">
                    <Button
                        variant="ghost"
                        className="w-full text-primary hover:text-primary"
                        onClick={() => setShowFullHistory(!showFullHistory)}
                    >
                        {showFullHistory ? (
                            <>
                                <ChevronUp className="mr-2 h-4 w-4" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Show More
                            </>
                        )}
                    </Button>
                </CardFooter>
            )}
        </Card>

      </main>
    </div>
  );
};

export default DriverDetailsPage;
