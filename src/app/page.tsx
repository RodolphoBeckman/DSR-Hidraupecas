"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FilePlus2,
  Users,
  Briefcase,
  CreditCard,
  Settings,
  Archive,
  LayoutDashboard,
} from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Visualize as métricas e gráficos.'
  },
  {
    href: '/budgets/new',
    label: 'Novo Orçamento',
    icon: FilePlus2,
    description: 'Crie um novo orçamento para um cliente.'
  },
  {
    href: '/budgets',
    label: 'Orçamentos',
    icon: Archive,
    description: 'Gerencie orçamentos existentes.'
  },
  {
    href: '/clients',
    label: 'Clientes',
    icon: Users,
    description: 'Adicione e gerencie seus clientes.'
  },
  {
    href: '/salespeople',
    label: 'Vendedores',
    icon: Briefcase,
    description: 'Gerencie sua equipe de vendedores.'
  },
  {
    href: '/payment-plans',
    label: 'Planos de Pag.',
    icon: CreditCard,
    description: 'Configure formas de pagamento.'
  },
  {
    href: '/settings',
    label: 'Configurações',
    icon: Settings,
    description: 'Personalize as configurações do app.'
  },
];

export default function HomePage() {
    const router = useRouter();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Menu Principal" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {menuItems.map((item) => (
          <Link href={item.href} key={item.href} className="block hover:no-underline">
              <Card className="hover:bg-card/60 hover:border-primary transition-all duration-200 cursor-pointer h-full futuristic-glow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium text-primary">
                    {item.label}
                  </CardTitle>
                  <item.icon className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
