"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Save, FileText, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Pipette, Pilcrow, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BudgetPrintView } from '@/components/budget-print-view';

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
      if (storedContent) {
        setEditableContent(storedContent);
      }
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
  
  const handleSaveContent = () => {
      const currentContent = document.getElementById('printable-area')?.innerHTML;
      if (budget && currentContent) {
          localStorage.setItem(`budget-html-${id}`, currentContent);
          toast({
              title: "Conteúdo Salvo",
              description: "As alterações no orçamento foram salvas localmente."
          })
      }
  }

  const handleFormat = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
  }

  const changeFontSize = (direction: 'increase' | 'decrease') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer.parentElement;

    if (parentElement) {
      const currentSize = window.getComputedStyle(parentElement, null).getPropertyValue('font-size');
      let newSize = parseFloat(currentSize);
      
      newSize += (direction === 'increase' ? 2 : -2);
      newSize = Math.max(8, newSize); 
      
      const span = document.createElement('span');
      span.style.fontSize = `${newSize}px`;

      if (range.collapsed) {
        // No text selected, apply to future text.
        // This is complex, for now we only support selected text
        toast({
          variant: "destructive",
          title: "Seleção necessária",
          description: "Por favor, selecione um texto para alterar o tamanho da fonte.",
        });
        return
      }

      const selectedText = range.extractContents();
      span.appendChild(selectedText);
      range.insertNode(span);

      // Clean up nested spans if any
      const innerSpans = span.querySelectorAll('span');
      innerSpans.forEach(innerSpan => {
        if(innerSpan.style.fontSize){
          innerSpan.style.fontSize = `${newSize}px`;
        }
      });
    }
  };

  if (isLoading && !budget) {
    return (
      <div className="p-8 bg-muted min-h-screen">
        <Skeleton className="h-12 w-1/2 mb-8" />
        <Skeleton className="h-[1000px] w-full max-w-4xl mx-auto" />
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
      <div className="bg-background rounded-md border shadow-lg max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-1 border-b p-2 sticky top-16 bg-background z-10">
            <Button variant="outline" size="sm" onClick={() => handleFormat('bold')}><Bold className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handleFormat('italic')}><Italic className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handleFormat('underline')}><Underline className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handleFormat('justifyLeft')}><AlignLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handleFormat('justifyCenter')}><AlignCenter className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handleFormat('justifyRight')}><AlignRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handleFormat('insertUnorderedList')}><List className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handleFormat('insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => changeFontSize('decrease')}><Minus className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => changeFontSize('increase')}><Plus className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" asChild className="relative">
                <label htmlFor="color-picker" className="cursor-pointer">
                    <Pipette className="h-4 w-4" />
                    <input 
                        id="color-picker"
                        type="color" 
                        onChange={(e) => handleFormat('foreColor', e.target.value)} 
                        className="absolute opacity-0 w-full h-full top-0 left-0"
                    />
                </label>
            </Button>
        </div>
        <div id="printable-area" contentEditable={true} suppressContentEditableWarning={true} className="bg-white text-black p-8 min-h-[1000px] focus:outline-none">
          {editableContent ? (
            <div dangerouslySetInnerHTML={{ __html: editableContent }} />
          ) : (
            <BudgetPrintView budget={budget} />
          )}
        </div>
      </div>
    </div>
  );
}
