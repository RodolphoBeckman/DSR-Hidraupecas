
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  FilePlus2,
  Users,
  Briefcase,
  CreditCard,
  Settings,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    href: '/',
    label: 'Novo Orçamento',
    icon: FilePlus2,
  },
  {
    href: '/budgets',
    label: 'Orçamentos',
    icon: Archive,
  },
  {
    href: '/clients',
    label: 'Clientes',
    icon: Users,
  },
  {
    href: '/salespeople',
    label: 'Vendedores',
    icon: Briefcase,
  },
  {
    href: '/payment-plans',
    label: 'Planos de Pag.',
    icon: CreditCard,
  },
  {
    href: '/settings',
    label: 'Configurações',
    icon: Settings,
  },
];

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn('p-2', className)}>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
