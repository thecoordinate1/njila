
'use client';

import { useState } from 'react';
import type { NextPage } from 'next';
import BottomNavbar from '@/components/BottomNavbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Phone, SearchIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface Driver {
  id: string;
  name: string;
  avatarUrl: string;
  status: 'Available' | 'Making delivery';
  currentOrderId?: string;
  phone: string;
}

const driversData: Driver[] = [
  { id: 'DRV-001', name: 'John Tembo', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=JT', status: 'Available', phone: '+260977123456' },
  { id: 'DRV-002', name: 'Maria Phiri', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=MP', status: 'Making delivery', currentOrderId: 'ORD-002', phone: '+260977234567' },
  { id: 'DRV-003', name: 'David Banda', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=DB', status: 'Making delivery', currentOrderId: 'ORD-005', phone: '+260977345678' },
  { id: 'DRV-004', name: 'Grace Zulu', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=GZ', status: 'Available', phone: '+260977456789' },
  { id: 'DRV-005', name: 'Peter Mwale', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=PM', status: 'Available', phone: '+260977567890' },
  { id: 'DRV-006', name: 'Charity Sakala', avatarUrl: 'https://placehold.co/100x100/E0F8F8/006666?text=CS', status: 'Making delivery', currentOrderId: 'ORD-001', phone: '+260977678901' },
];

type StatusFilter = 'All' | 'Available' | 'Making delivery';

const DriversPage: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const filteredDrivers = driversData
    .filter(driver => {
      if (statusFilter === 'All') return true;
      return driver.status === statusFilter;
    })
    .filter(driver =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filterOptions: StatusFilter[] = ['All', 'Available', 'Making delivery'];

  return (
    <div className="relative min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Driver Status</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center p-4 md:p-6 pb-32">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by driver name..."
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

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-3 h-6 w-6" />
                Active Drivers
              </CardTitle>
              <CardDescription>
                A real-time overview of your drivers and their current status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <Link key={driver.id} href={`/drivers/${driver.id}`} className="block rounded-lg transition-colors hover:bg-muted/50">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={driver.avatarUrl} alt={driver.name} data-ai-hint="driver avatar" />
                            <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{driver.name}</p>
                            {driver.status === 'Making delivery' && driver.currentOrderId ? (
                              <span className="text-xs text-primary">
                                View Order #{driver.currentOrderId}
                              </span>
                            ) : (
                              <p className="text-xs text-muted-foreground">Ready for new orders</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={cn(
                              driver.status === 'Available' && 'bg-green-100 text-green-800 border-green-200',
                              driver.status === 'Making delivery' && 'bg-amber-100 text-amber-800 border-amber-200'
                            )}
                            variant="outline"
                          >
                            {driver.status}
                          </Badge>
                          <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={(e) => e.stopPropagation()}>
                            <a href={`tel:${driver.phone}`}>
                              <Phone className="h-4 w-4 text-primary" />
                              <span className="sr-only">Call {driver.name}</span>
                            </a>
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No drivers match your criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default DriversPage;
