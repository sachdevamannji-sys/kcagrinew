import { Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "Dashboard", subtitle = "Overview of your crop trading operations" }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900" data-testid="header-title">
            {title}
          </h2>
          <p className="text-sm text-gray-600 mt-0.5" data-testid="header-subtitle">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Today's Date</span>
            <div className="text-gray-500" data-testid="text-current-date">
              {currentDate}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
