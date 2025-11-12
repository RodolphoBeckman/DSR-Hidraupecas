"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget } from '@/lib/definitions';
import { BudgetPrintView } from '@/components/budget-print-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';

export default function PrintBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const printRef = useRef<HTMLDivElement>(null);

  const [budgets] = useLocalStorage<Budget[]>('budgets', []);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editedContent, setEditedContent] = useState<string | null>(null);

  useEffect(() => {
    const foundBudget = budgets.find(b => b.id === id);
    if (foundBudget) {
      setBudget(foundBudget);
       const storedContent = localStorage.getItem(`budget-html-${id}`);
       setEditedContent(storedContent);
    }
    setIsLoading(false);
  }, [id, budgets]);

  const handleBack = () => {
    router.back();
  };
  
  const handlePrint = async () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const contentToPrint = document.getElementById('printable-area')?.innerHTML;
      if (contentToPrint) {
        printWindow.document.write(`
        <html>
            <head>
            <title>Imprimir Orçamento ${budget?.id}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { 
                    font-family: sans-serif;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .print-container {
                  width: 210mm;
                  margin: 0 auto;
                  padding: 2rem;
                }
              </style>
            </head>
            <body>
                <div class="print-container">
                  ${contentToPrint}
                </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() { window.close(); };
                }
            </script>
            </body>
        </html>
        `);
        printWindow.document.close();
      }
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
                Imprimir
            </Button>
        </div>
        <div id="printable-area" ref={printRef}>
          {editedContent ? (
            <div dangerouslySetInnerHTML={{ __html: editedContent }} />
          ) : (
            <BudgetPrintView budget={budget} />
          )}
        </div>
    </div>
  );
}
