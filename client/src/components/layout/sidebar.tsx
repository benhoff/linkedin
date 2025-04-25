import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  FileEdit, 
  Zap, 
  Megaphone, 
  Image, 
  BookOpen, 
  HelpCircle, 
  ChevronRight 
} from 'lucide-react';

export function Sidebar() {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/', label: 'Draft Edit Pipeline', icon: FileEdit },
    { path: '/hook-lab', label: 'Hook Lab', icon: Zap },
    { path: '/cta-lab', label: 'CTA Lab', icon: Megaphone },
    { path: '/graphics-lab', label: 'Graphics Lab', icon: Image },
    { path: '/story-editor', label: 'Story Editor', icon: BookOpen },
  ];
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-neutral-200 bg-white">
        <div className="h-16 flex items-center px-4 border-b border-neutral-200">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-1 16H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V9h8v2zm0-4H8V5h8v2z"/>
            </svg>
            <span className="ml-2 text-lg font-semibold text-neutral-900">RefinePost</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                >
                  <a className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                    isActive 
                      ? "bg-primary bg-opacity-10 text-primary" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  )}>
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>
          
          <div className="px-3 mt-6">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-900">Need help?</h3>
              <div className="mt-2 text-sm text-neutral-700">
                <p>Check out our quick start guide or watch the tutorial video.</p>
              </div>
              <div className="mt-3">
                <Link href="/help">
                  <a className="text-sm font-medium text-primary hover:text-primary-700 flex items-center">
                    View documentation <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-neutral-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <div className="inline-block h-9 w-9 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                  <span className="font-medium text-sm">AJ</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">
                  Profile
                </p>
                <p className="text-xs font-medium text-neutral-500 group-hover:text-neutral-700">
                  View settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
