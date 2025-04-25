import React, { useState } from 'react';
import { Menu, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';

export function Topbar() {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-neutral-200 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="px-4 border-r border-neutral-200 text-neutral-500 md:hidden">
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex-1 flex items-center">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-1 16H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V9h8v2zm0-4H8V5h8v2z"/>
          </svg>
          <span className="ml-2 text-lg font-semibold text-neutral-900">RefinePost</span>
        </div>
        <div className="flex items-center">
          <div className="ml-3 relative">
            <div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
