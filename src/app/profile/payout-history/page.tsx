
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
import { ArrowLeft, CheckCircle, Clock, TrendingUpIcon, ChevronDown, SearchIcon, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"

type PayoutStatus = 'Paid' | 'Pending';

const payoutHistoryData = [
  { id: 'PAY-007', date: new Date().toISOString(), amount: 125.50, status: 'Pending' as const, method: 'Mobile Money' },
  { id: 'PAY-006', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), amount: 250.75, status: 'Pending' as const, method: 'Mobile Money' },
  { id: 'PAY-001', date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), amount: 480.50, status: 'Paid' as const, method: 'Mobile Money' },
  { id: 'PAY-002', date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(), amount: 512.00, status: 'Paid' as const, method: 'Mobile Money' },
  { id: 'PAY-003', date: new Date(new Date().setDate(new Date().getDate() - 21)).toISOString(), amount: 450.75, status: 'Paid' as const, method: 'Bank Transfer' },
  { id: 'PAY-004', date: new Date(new Date().setDate(new Date().getDate() - 40)).toISOString(), amount: 495.25, status: 'Paid' as const, method: 'Mobile Money' },
  { id: 'PAY-005', date: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(), amount: 530.00, status: 'Paid' as const, method: 'Mobile Money' },
];

const PayoutHistoryPage: NextPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'All'>('All');
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const filteredPayouts = payoutHistoryData
    .filter(payout => {
      if (statusFilter === 'All') return true;
      return payout.status === statusFilter;
    })
    .filter(payout => {
        if (!date) return true;
        const payoutDate = new Date(payout.date);
        if (date.from && date.to) {
            return payoutDate >= date.from && payoutDate <= date.to;
        }
        if (date.from) {
            return payoutDate >= date.from;
        }
        if (date.to) {
            return payoutDate <= date.to;
        }
        return true;
    })
    .filter(payout => {
      const query = searchQuery.toLowerCase();
      const payoutDate = new Date(payout.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return (
        payout.id.toLowerCase().includes(query) ||
        payoutDate.toLowerCase().includes(query) ||
        payout.amount.toString().includes(query) ||
        payout.method.toLowerCase().includes(query)
      );
    });

  const totalPaidOut = payoutHistoryData
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayout = payoutHistoryData
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const thisMonthEarnings = payoutHistoryData
    .filter(p => new Date(p.date) >= startOfMonth && p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const statusFilterOptions: (PayoutStatus | 'All')[] = ['All', 'Paid', 'Pending'];

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
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-background rounded-lg">
                    <p className="text-2xl font-bold">ZMW {totalPaidOut.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Paid Out</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">ZMW {pendingPayout.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Pending Payout</p>
                </div>
                 <div className="p-4 bg-background rounded-lg">
                    <p className="text-2xl font-bold">ZMW {thisMonthEarnings.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                </div>
            </CardContent>
        </Card>

        <Card className="w-full max-w-2xl shadow-md">
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A complete record of your payouts.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative flex-grow w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search transactions..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    Status: {statusFilter}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                                {statusFilterOptions.map((option) => (
                                    <DropdownMenuItem key={option} onSelect={() => setStatusFilter(option)}>
                                        {option}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                  date.to ? (
                                    <>
                                      {format(date.from, "LLL dd, y")} -{" "}
                                      {format(date.to, "LLL dd, y")}
                                    </>
                                  ) : (
                                    format(date.from, "LLL dd, y")
                                  )
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                              />
                            </PopoverContent>
                          </Popover>
                    </div>
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
                                        <p className="text-xs text-muted-foreground">{new Date(payout.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} via {payout.method}</p>
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

    