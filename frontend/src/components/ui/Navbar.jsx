'use client';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/store/slices/authSlice';
import Link from 'next/link';
import { Leaf, LayoutDashboard, Store, Package, MessageSquare, Bell, LogOut, ChevronDown, List } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalNavbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  // Hide on auth pages or landing
  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['farmer', 'buyer', 'admin'] },
    { name: 'Products', href: '/products', icon: List, roles: ['farmer'] },
    { name: 'Market', href: '/marketplace', icon: Store, roles: ['farmer', 'buyer'] },
    { name: 'Orders', href: '/orders', icon: Package, roles: ['farmer', 'buyer'] },
    { name: 'Chat', href: '/chat', icon: MessageSquare, roles: ['farmer', 'buyer'] },
  ];

  return (
    <nav className="fixed top-0 w-full glass z-50 px-6 h-16 flex justify-between items-center border-b border-slate-700/50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Leaf className="text-green-500" size={24} />
          <span className="text-lg font-bold tracking-tight">Krishi<span className="text-green-400">Setu</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.filter(l => l.roles.includes(user?.role)).map((link) => {
            const isActive = pathname.startsWith(link.href) && (link.href !== '/dashboard' || pathname === '/dashboard' || pathname === `/dashboard/${user.role}`);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-slate-700/80 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                <link.icon size={16} /> {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/notifications" className="p-2 rounded-full hover:bg-slate-700/50 text-slate-300 transition-colors relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900 border-none"></span>
          )}
        </Link>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-green-400 capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
