"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BudgetPrintView } from '@/components/budget-print-view';
import { cn } from '@/lib/utils';


export default function EditBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const foundBudget = budgets.find(b => b.id === id);
    if (foundBudget) {
      setBudget(foundBudget);
      const storedContent = localStorage.getItem(`budget-html-${id}`);
      if (storedContent && editorRef.current) {
        editorRef.current.innerHTML = storedContent;
      }
    }
    setIsLoading(false);
  }, [id, budgets]);

  const handleBack = () => {
    router.back();
  };

  const handlePrint = async () => {
    if (editorRef.current) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
            <html>
                <head>
                <title>Imprimir Orçamento ${budget?.id}</title>
                 <style>
                    body { font-family: sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background-color: #f2f2f2; }
                 </style>
                </head>
                <body>
                    ${editorRef.current.innerHTML}
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
  
  const handleSaveContent = () => {
      if (budget && editorRef.current) {
          localStorage.setItem(`budget-html-${id}`, editorRef.current.innerHTML);
          toast({
              title: "Conteúdo Salvo",
              description: "As alterações no orçamento foram salvas localmente."
          })
      }
  }

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
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">Editor de Orçamento</h1>
        <div className="flex gap-2">
            <Button onClick={handleBack} variant="secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={handleSaveContent}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Edições
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
        </div>
      </div>
      <div 
        ref={editorRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        className={cn(
            "bg-white text-black p-8 rounded-md shadow-lg",
            "prose prose-sm max-w-none",
            "focus:outline-none focus:ring-2 focus:ring-primary"
        )}
       >
         <BudgetPrintView budget={budget} />
      </div>
    </div>
  );
}
