
// import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, MessageSquare, Star, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
//   const location = useLocation();
    const pathname = usePathname();

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/swap-requests', label: 'Requests', icon: MessageSquare },
    { path: '/feedback', label: 'Feedback', icon: Star },
    { path: '/profile/1', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-card border-b border-border p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div >
            <Link href="/" className="text-2xl font-bold text-primary">
            Skill Swap Platform
            </Link>
        </div>
        <div className="flex space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                asChild
                className="flex items-center gap-2"
              >
                <Link href={item.path}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;