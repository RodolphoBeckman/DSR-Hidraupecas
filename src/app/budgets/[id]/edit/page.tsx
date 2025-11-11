"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { budgetToHtml } from '@/lib/budget-to-html';
import { cn } from '@/lib/utils';
import 'react-quill/dist/quill.snow.css';

export default function EditBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [editableContent, setEditableContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundBudget = budgets.find(b => b.id === id);
    if (foundBudget) {
      setBudget(foundBudget);
      const storedContent = localStorage.getItem(`budget-html-${id}`);
      setEditableContent(storedContent || budgetToHtml(foundBudget));
    }
    setIsLoading(false);
  }, [id, budgets]);

  const handleBack = () => {
    router.back();
  };

  const handlePrint = async () => {
    if (editableContent) {
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
                    ${editableContent}
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
      if (budget) {
          localStorage.setItem(`budget-html-${id}`, editableContent);
          toast({
              title: "Conteúdo Salvo",
              description: "As alterações no orçamento foram salvas localmente."
          })
      }
  }

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
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
      <div className="bg-background rounded-md border p-2">
        <div className="flex items-center gap-2 border-b p-2 mb-2">
            <Button variant="outline" size="sm" onClick={() => handleFormat('bold')}><b>B</b></Button>
            <Button variant="outline" size="sm" onClick={() => handleFormat('italic')}><i>I</i></Button>
        </div>
        <div
          contentEditable={true}
          dangerouslySetInnerHTML={{ __html: editableContent }}
          onBlur={(e) => setEditableContent(e.currentTarget.innerHTML)}
          className="bg-white text-black p-4 rounded-md min-h-[800px] focus:outline-none"
        />
      </div>
    </div>
  );
}
