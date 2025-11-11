"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget } from '@/lib/definitions';
import { BudgetPrintView } from '@/components/budget-print-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import { asBlob } from 'html-to-docx';


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
  
  const handlePrint = async () => {
    const element = printRef.current;
    if (element) {
        const html2pdf = (await import('html2pdf.js')).default;
        
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

  const handleExportDocx = async () => {
    const element = printRef.current;
    if (element && budget) {
      // The library is imported dynamically only when the function is called
      const { asBlob } = await import('html-to-docx');
      const data = await asBlob(element.innerHTML);
      saveAs(data, `orcamento-${budget.id}.docx`);
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
            <Button onClick={handleExportDocx}>
                <FileText className="mr-2 h-4 w-4" />
                Baixar DOCX
            </Button>
        </div>
        <div ref={printRef}>
            <BudgetPrintView budget={budget} />
        </div>
    </div>
  );
}
