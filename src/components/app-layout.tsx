"use client";

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/logo';
import { Button } from './ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

function CustomSidebarTrigger() {
    const { toggleSidebar, state } = useSidebar();
    return (
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {state === 'expanded' ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
    )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className={cn(
            state === 'collapsed' && '[&>#logo-text]:hidden'
        )}>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className='hidden sm:block'>
            <CustomSidebarTrigger />
          </div>
          <div className="ml-auto">
            <UserNav />
          </div>
        </header>
        <main>{children}</main>
      </SidebarInset>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
