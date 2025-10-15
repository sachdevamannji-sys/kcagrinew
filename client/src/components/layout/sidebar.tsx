import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Users, 
  Sprout, 
  MapPin, 
  ShoppingCart, 
  TrendingUp, 
  FileText, 
  Package, 
  BookOpen, 
  BarChart3,
  Wallet,
  Trash2,
  LogOut
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    category: 'MASTERS',
    items: [
      {
        name: 'Parties',
        href: '/parties',
        icon: Users
      },
      {
        name: 'Crops',
        href: '/crops',
        icon: Sprout
      },
      {
        name: 'Locations',
        href: '/locations',
        icon: MapPin
      }
    ]
  },
  {
    category: 'TRANSACTIONS',
    items: [
      {
        name: 'Purchase',
        href: '/purchase',
        icon: ShoppingCart
      },
      {
        name: 'Sales',
        href: '/sales',
        icon: TrendingUp
      },
      {
        name: 'Expenses',
        href: '/expenses',
        icon: FileText
      }
    ]
  },
  {
    category: 'REPORTS',
    items: [
      {
        name: 'Inventory',
        href: '/inventory',
        icon: Package
      },
      {
        name: 'Ledger',
        href: '/ledger',
        icon: BookOpen
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: BarChart3
      }
    ]
  },
  {
    name: 'Rokar / Cash',
    href: '/rokar',
    icon: Wallet
  },
  {
    name: 'Trash',
    href: '/trash',
    icon: Trash2
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location === '/' || location === '/dashboard';
    }
    return location === href;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 flex flex-col">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">KCAgri-Trade</h1>
        </div>
      </div>
      
      <nav className="p-4 space-y-6 overflow-y-auto flex-1">
        {navigation.map((item, index) => (
          <div key={index}>
            {item.category ? (
              <div>
                <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  {item.category}
                </h3>
                <div className="space-y-1">
                  {item.items?.map((subItem) => {
                    const Icon = subItem.icon;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm",
                          isActive(subItem.href)
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        data-testid={`nav-${subItem.name.toLowerCase()}`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span>{subItem.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm",
                  isActive(item.href!)
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                data-testid={`nav-${item.name?.toLowerCase().replace(' / ', '-')}`}
              >
                {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900" data-testid="sidebar-user-name">
                {user?.name || 'admin'}
              </p>
              <p className="text-gray-500 text-xs">Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="button-sidebar-logout"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}
