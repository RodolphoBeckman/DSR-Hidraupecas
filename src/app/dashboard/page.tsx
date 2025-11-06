"use client";

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { subDays, format } from 'date-fns';
import { Archive, Users, CheckCircle, Clock, DollarSign } from 'lucide-react';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMounted } from '@/hooks/use-mounted';
import type { Budget, Client } from '@/lib/definitions';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export default function DashboardPage() {
  const [budgets] = useLocalStorage<Budget[]>('budgets', []);
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const hasMounted = useMounted();

  const {
    budgetCount,
    clientCount,
    pendingBudgets,
    completedBudgets,
    completedValue,
    grossCompletedValue,
  } = useMemo(() => {
    const completed = budgets.filter(b => b.status === 'realizado');
    const totalValue = completed.reduce((acc, b) => acc + b.total, 0);
    const grossTotalValue = completed.reduce((acc, b) => acc + (b.total + (b.discount || 0)), 0);

    return {
      budgetCount: budgets.length,
      clientCount: clients.length,
      pendingBudgets: budgets.filter(b => b.status === 'pendente').length,
      completedBudgets: completed.length,
      completedValue: totalValue,
      grossCompletedValue: grossTotalValue,
    };
  }, [budgets, clients]);


  const recentBudgetsChartData = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();

    const data = last7Days.map(day => {
      const formattedDate = format(day, 'dd/MM');
      const budgetsOnDay = budgets.filter(budget => {
        const budgetDate = new Date(budget.createdAt);
        return budgetDate.toDateString() === day.toDateString();
      });
      return {
        date: formattedDate,
        orçamentos: budgetsOnDay.length,
      };
    });
    return data;
  }, [budgets]);
  
  const chartConfig = {
    orçamentos: {
      label: 'Orçamentos',
      color: 'hsl(var(--primary))',
    },
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (!hasMounted) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader title="Dashboard" />
        </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Dashboard" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos Totais</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetCount}</div>
            <p className="text-xs text-muted-foreground">Total de orçamentos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCount}</div>
            <p className="text-xs text-muted-foreground">Total de clientes na base</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos Realizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBudgets}</div>
             <p className="text-xs text-muted-foreground">Faturamento de {formatCurrency(completedValue)} (Bruto: {formatCurrency(grossCompletedValue)})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBudgets}</div>
             <p className="text-xs text-muted-foreground">Aguardando conclusão</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos nos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={recentBudgetsChartData} accessibilityLayer>
                 <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 5)}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  allowDecimals={false}
                />
                 <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="orçamentos" fill="var(--color-orçamentos)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
