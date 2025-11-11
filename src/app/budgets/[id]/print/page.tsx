"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget } from '@/lib/definitions';
import { BudgetPrintView } from '@/components/budget-print-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, FileText } from 'lucide-react';

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
        // Dynamic import for client-side only library
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
    if (element) {
      const htmlToDocx = (await import('html-to-docx')).default;
      
      // Clona o elemento para não afetar a visualização
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Remove a tag de estilo para não quebrar a geração do DOCX
      const styleTag = clonedElement.querySelector('style');
      if (styleTag) {
        styleTag.remove();
      }

      const fileBuffer = await htmlToDocx(clonedElement.outerHTML, undefined, {
        margins: {
          top: 720, // 0.5 inch
          right: 720,
          bottom: 720,
          left: 720,
        },
      });
  
      const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orcamento-${budget?.id}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
            <Button onClick={handleExportDocx} variant="outline">
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
