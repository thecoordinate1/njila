
'use client';
import { Bell, User, Truck, Package, ListChecks, BarChart2, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


const mobileNavItems = [
  { href: '/', label: 'Dashboard', icon: ListChecks },
  { href: '/deliveries', label: 'Deliveries', icon: Package },
  { href: '/drivers', label: 'Drivers', icon: Truck },
  { href: '/history', label: 'Reports', icon: BarChart2 },
];

const Header = () => {
    const pathname = usePathname();
    const pageTitle = mobileNavItems.find(item => item.href === pathname)?.label || 'Dashboard';
    
    const navLinkClasses = (href: string) =>
    cn(
      'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
      { 'bg-muted text-foreground': pathname === href }
    );

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
       <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Truck className="h-6 w-6 text-primary" />
                  <span>Njila</span>
                </Link>
                {mobileNavItems.map(({href, label, icon: Icon}) => (
                    <Link
                      key={href}
                      href={href}
                      className={navLinkClasses(href)}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                ))}
              </nav>
            </SheetContent>
        </Sheet>
        <div className="w-full flex-1">
            {/* Can add a search bar here if needed */}
        </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
export default Header;
