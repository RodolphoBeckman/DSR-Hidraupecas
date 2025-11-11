"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget } from '@/lib/definitions';
import { BudgetPrintView } from '@/components/budget-print-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { renderToString } from 'react-dom/server';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const budgetToHtml = (budget: Budget): string => {
  // A simple and robust way to generate initial HTML
  let itemsHtml = '';
  if (budget.budgetType === 'items') {
    itemsHtml = budget.items.map(item => `<tr><td>${item.description}</td><td style="text-align: right;">${(item.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>`).join('');
  } else {
    itemsHtml = budget.items.map(item => `<tr><td colspan="2">${item.description}</td></tr>`).join('');
  }

  const subtotal = budget.budgetType === 'group' 
    ? budget.total + (budget.discount || 0)
    : budget.items.reduce((sum, item) => sum + (item.value || 0), 0);

  let totalsHtml = `
    <p>Subtotal: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
    ${budget.discount ? `<p>Desconto: -${budget.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>` : ''}
    <h3><strong>TOTAL: ${budget.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></h3>
  `;
  
  let paymentHtml = '';
  if (budget.paymentPlan) {
    paymentHtml = `<p><strong>Condições de Pagamento:</strong> ${budget.paymentPlan.name}</p>`;
    if (budget.installmentsCount && budget.installmentsCount > 1) {
      paymentHtml += `<p>${budget.installmentsCount}x de ${(budget.total / budget.installmentsCount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>`;
    }
  }


  return `
    <h1><strong>ORÇAMENTO Nº: ${budget.id}</strong></h1>
    <p><strong>Data:</strong> ${new Date(budget.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
    <br/>
    <h2><strong>Cliente</strong></h2>
    <p>${budget.client.name}</p>
    <p>${budget.client.cpfCnpj}</p>
    <p>${budget.client.phone}</p>
    <br/>
    <h2><strong>Vendedor</strong></h2>
    <p>${budget.salesperson.name}</p>
    <br/>
    <h2><strong>Serviços</strong></h2>
    <table style="width: 100%;">
      <thead>
        <tr>
          <th style="text-align: left;">DESCRIÇÃO</th>
          <th style="text-align: right;">VALOR</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <br/>
    ${budget.observation ? `<p><strong>Observações:</strong><br/>${budget.observation}</p><br/>` : ''}
    ${totalsHtml}
    ${paymentHtml}
  `;
}

export default function EditBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [editableContent, setEditableContent] = useState('');
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundBudget = budgets.find(b => b.id === id);
    if (foundBudget) {
      setBudget(foundBudget);
      // Check if there is edited content in local storage
      const storedContent = localStorage.getItem(`budget-edit-${id}`);
      setEditableContent(storedContent || budgetToHtml(foundBudget));
    }
    setIsLoading(false);
  }, [id, budgets]);

  const handleBack = () => {
    router.back();
  };

  const handlePrint = async () => {
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
  };
  
  const handleSaveContent = () => {
      if (budget) {
          localStorage.setItem(`budget-edit-${id}`, editableContent);
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
        <Skeleton className="h-[600px] w-full" />
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
      <div className="bg-background rounded-md">
        <ReactQuill
          theme="snow"
          value={editableContent}
          onChange={setEditableContent}
          className="bg-card text-card-foreground"
          modules={{
              toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline','strike', 'blockquote'],
                  [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                  [{ 'align': [] }],
                  [{'color': []}, {'background': []}],
                  ['link', 'image'],
                  ['clean']
              ],
          }}
        />
      </div>
    </div>
  );
}
