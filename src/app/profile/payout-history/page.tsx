
'use client';

import { useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, CheckCircle, Clock, TrendingUpIcon, ChevronDown, SearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PayoutStatus = 'Paid' | 'Pending';

const payoutHistoryData = [
  { id: 'PAY-006', date: 'October 27, 2023', amount: 250.75, status: 'Pending' as const, method: 'Mobile Money' },
  { id: 'PAY-001', date: 'October 20, 2023', amount: 480.50, status: 'Paid' as const, method: 'Mobile Money' },
  { id: 'PAY-002', date: 'October 13, 2023', amount: 512.00, status: 'Paid' as const, method: 'Mobile Money' },
  { id: 'PAY-003', date: 'October 06, 2023', amount: 450.75, status: 'Paid' as const, method: 'Bank Transfer' },
  { id: 'PAY-004', date: 'September 29, 2023', amount: 495.25, status: 'Paid' as const, method: 'Mobile Money' },
  { id: 'PAY-005', date: 'September 22, 2023', amount: 530.00, status: 'Paid' as const, method: 'Mobile Money' },
];

const PayoutHistoryPage: NextPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'All'>('All');

  const totalEarnings = payoutHistoryData
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const thisMonthPayouts = 5820.00; // Placeholder

  const filteredPayouts = payoutHistoryData
    .filter(payout => {
      if (statusFilter === 'All') return true;
      return payout.status === statusFilter;
    })
    .filter(payout => {
      const query = searchQuery.toLowerCase();
      return (
        payout.id.toLowerCase().includes(query) ||
        payout.date.toLowerCase().includes(query) ||
        payout.amount.toString().includes(query) ||
        payout.method.toLowerCase().includes(query)
      );
    });

  const filterOptions: (PayoutStatus | 'All')[] = ['All', 'Paid', 'Pending'];

  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Payout History</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-20 space-y-6">
        <Card className="w-full max-w-2xl shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <TrendingUpIcon className="mr-3 h-6 w-6" />
                    Earnings Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-background rounded-lg">
                    <p className="text-2xl font-bold">ZMW {totalEarnings.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Paid Out</p>
                </div>
                 <div className="p-4 bg-background rounded-lg">
                    <p className="text-2xl font-bold">ZMW {thisMonthPayouts.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total All-Time</p>
                </div>
            </CardContent>
        </Card>

        <Card className="w-full max-w-2xl shadow-md">
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A complete record of your payouts.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex justify-between items-center mb-6 gap-4">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search transactions..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-48 justify-between shrink-0">
                                Filter: {statusFilter}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                            {filterOptions.map((option) => (
                                <DropdownMenuItem key={option} onSelect={() => setStatusFilter(option)}>
                                    {option}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
                 <div className="space-y-4">
                    {filteredPayouts.length > 0 ? (
                        filteredPayouts.map(payout => (
                            <div key={payout.id} className="flex justify-between items-center p-4 bg-background rounded-lg">
                                <div className="flex items-center">
                                    <div className={cn(
                                        "mr-4 flex h-10 w-10 items-center justify-center rounded-full",
                                        payout.status === 'Paid' ? 'bg-green-100' : 'bg-amber-100'
                                    )}>
                                        {payout.status === 'Paid' ? 
                                            <CheckCircle className="h-6 w-6 text-green-600" /> : 
                                            <Clock className="h-6 w-6 text-amber-600" />
                                        }
                                    </div>
                                    <div>
                                        <p className="font-semibold">ZMW {payout.amount.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">{payout.date} via {payout.method}</p>
                                    </div>
                                </div>
                               <Badge
                                    variant={payout.status === 'Paid' ? 'secondary' : 'outline'}
                                    className={cn(
                                        payout.status === 'Paid' && 'bg-green-100 text-green-800 border-green-200',
                                        payout.status === 'Pending' && 'bg-amber-100 text-amber-800 border-amber-200'
                                    )}
                                >
                                    {payout.status}
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No transactions match your criteria.</p>
                        </div>
                    )}
                 </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PayoutHistoryPage;
