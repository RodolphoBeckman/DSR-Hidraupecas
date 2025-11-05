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

// Componente que usa o hook e precisa estar dentro do Provider
function CustomSidebarTrigger() {
    const { toggleSidebar, state } = useSidebar();
    return (
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {state === 'expanded' ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
    )
}

// O conteúdo do layout que depende do contexto do Sidebar
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className={cn(
            "transition-all",
            "group-data-[collapsible=icon]:[&_.logo-text]:hidden"
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
          {/* O SidebarTrigger padrão para mobile */}
          <SidebarTrigger className="sm:hidden" />
          {/* O gatilho customizado para desktop */}
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

// O componente principal que exportamos
export function AppLayout({ children }: { children: React.ReactNode }) {
  // A função AppLayout agora APENAS renderiza o provider
  // e passa o 'children' para o LayoutContent, que está DENTRO do provider.
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
