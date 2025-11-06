"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget } from '@/lib/definitions';
import { BudgetPrintView } from '@/components/budget-print-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';


export default function PrintBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const printRef = useRef<HTMLDivElement>(null);

  const [budgets] = useLocalStorage<Budget[]>('budgets', []);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundBudget = budgets.find(b => b.id === id);
    if (foundBudget) {
      setBudget(foundBudget);
    }
    setIsLoading(false);
  }, [id, budgets]);

  const handleBack = () => {
    router.back();
  };
  
  const handlePrint = () => {
    const element = printRef.current;
    if (element) {
        const opt = {
          margin:       0,
          filename:     `orcamento-${budget?.id}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    }
  };


  if (isLoading) {
    return (
      <div className="p-8 bg-muted min-h-screen">
        <Skeleton className="h-12 w-1/2 mb-8" />
        <Skeleton className="h-[1000px] w-full max-w-[800px] mx-auto" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Orçamento Não Encontrado</h1>
          <p className="text-muted-foreground">O orçamento solicitado não pôde ser encontrado.</p>
        </div>
         <Button onClick={handleBack} variant="secondary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
     <div className="bg-muted p-4 md:p-8">
        <div className="flex justify-center items-center gap-4 mb-8 no-print">
            <Button onClick={handleBack} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
            </Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Baixar PDF
            </Button>
        </div>
        <div ref={printRef}>
            <BudgetPrintView budget={budget} />
        </div>
    </div>
  );
}
