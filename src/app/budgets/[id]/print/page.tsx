"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget, AppSettings } from '@/lib/definitions';
import { BudgetPrintView } from '@/components/budget-print-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrintBudgetPage() {
  const params = useParams();
  const { id } = params;

  const [budgets] = useLocalStorage<Budget[]>('budgets', []);
  const [settings] = useLocalStorage<AppSettings>('app-settings', { pixQrCode: null });
  
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundBudget = budgets.find(b => b.id === id);
    if (foundBudget) {
      setBudget(foundBudget);
    }
    setIsLoading(false);
  }, [id, budgets]);

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Orçamento Não Encontrado</h1>
          <p className="text-muted-foreground">O orçamento solicitado não pôde ser encontrado.</p>
        </div>
      </div>
    );
  }

  return <BudgetPrintView budget={budget} settings={settings} />;
}
