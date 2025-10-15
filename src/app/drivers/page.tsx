
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Phone, SearchIcon, ChevronDown, PlusCircle } from 'lucide-react';
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
  status: 'Available' | 'Busy';
  phone: string;
  totalDeliveries: number;
  rating: number;
}

const driversData: Driver[] = [
  { id: 'DRV-001', name: 'John Tembo', avatarUrl: 'https://placehold.co/100x100/34D399/1C252D?text=JT', status: 'Available', phone: '+260977123456', totalDeliveries: 152, rating: 4.9 },
  { id: 'DRV-002', name: 'Maria Phiri', avatarUrl: 'https://placehold.co/100x100/34D399/1C252D?text=MP', status: 'Busy', phone: '+260977234567', totalDeliveries: 210, rating: 4.8 },
  { id: 'DRV-003', name: 'David Banda', avatarUrl: 'https://placehold.co/100x100/34D399/1C252D?text=DB', status: 'Busy', phone: '+260977345678', totalDeliveries: 180, rating: 4.9 },
  { id: 'DRV-004', name: 'Grace Zulu', avatarUrl: 'https://placehold.co/100x100/34D399/1C252D?text=GZ', status: 'Available', phone: '+260977456789', totalDeliveries: 95, rating: 4.7 },
  { id: 'DRV-005', name: 'Peter Mwale', avatarUrl: 'https://placehold.co/100x100/34D399/1C252D?text=PM', status: 'Available', phone: '+260977567890', totalDeliveries: 320, rating: 5.0 },
  { id: 'DRV-006', name: 'Charity Sakala', avatarUrl: 'https://placehold.co/100x100/34D399/1C252D?text=CS', status: 'Busy', phone: '+260977678901', totalDeliveries: 115, rating: 4.8 },
];

type StatusFilter = 'All' | 'Available' | 'Busy';

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

  const filterOptions: StatusFilter[] = ['All', 'Available', 'Busy'];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Drivers</h1>
              <p className="text-muted-foreground">Manage your team of couriers.</p>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Driver
            </Button>
        </div>

        <Card className="shadow-md">
        <CardHeader>
            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-grow">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by driver name..."
                    className="pl-10 bg-background"
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
                        <p className="text-xs text-muted-foreground">Rating: {driver.rating.toFixed(1)} | {driver.totalDeliveries} deliveries</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge
                        className={cn(
                            driver.status === 'Available' && 'bg-green-500/20 text-green-400 border-green-500/30',
                            driver.status === 'Busy' && 'bg-red-500/20 text-red-400 border-red-500/30'
                        )}
                        variant="outline"
                        >
                        {driver.status}
                        </Badge>
                        <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={(e) => {e.preventDefault(); window.location.href = `tel:${driver.phone}`;}}>
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
  );
};

export default DriversPage;
