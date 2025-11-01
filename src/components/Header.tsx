'use client';
import { Bell, User, Truck, Package, ListChecks, BarChart2, Menu, Settings, LifeBuoy } from 'lucide-react';
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


const navItems = [
  { href: '/', label: 'Dashboard', icon: ListChecks },
  { href: '/deliveries', label: 'Deliveries', icon: Package },
  { href: '/drivers', label: 'Drivers', icon: Truck },
  { href: '/history', label: 'Reports', icon: BarChart2 },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/support', label: 'Support', icon: LifeBuoy },
]

const Header = () => {
    const pathname = usePathname();
    
    const navLinkClasses = (href: string) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      { 'bg-muted text-primary': pathname === href }
    );

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
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
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-14 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                    <Truck className="h-6 w-6 text-primary" />
                    <span>Njila</span>
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {navItems.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className={navLinkClasses(href)}>
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                    ))}
                </nav>
              </div>
               <div className="mt-auto p-4 border-t">
                <nav className="grid items-start text-sm font-medium gap-1">
                    {bottomNavItems.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} className={navLinkClasses(href)}>
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    ))}
                </nav>
              </div>
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
