"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusCircle, Trash2, FileText, Share2, TicketPercent } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Client, Salesperson, PaymentPlan, ServiceItem, Budget } from '@/lib/definitions';
import PageHeader from '@/components/page-header';
import { useMounted } from '@/hooks/use-mounted';

export default function BudgetCreationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const hasMounted = useMounted();
  
  const budgetId = searchParams.get('id');

  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [salespeople] = useLocalStorage<Salesperson[]>('salespeople', []);
  const [paymentPlans] = useLocalStorage<PaymentPlan[]>('paymentPlans', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>('');
  const [selectedPaymentPlanId, setSelectedPaymentPlanId] = useState<string>('');
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    if (budgetId && budgets.length > 0) {
      const budgetToEdit = budgets.find(b => b.id === budgetId);
      if (budgetToEdit) {
        setSelectedClientId(budgetToEdit.client.id);
        setSelectedSalespersonId(budgetToEdit.salesperson.id);
        setItems(budgetToEdit.items);
        if(budgetToEdit.paymentPlan) {
            setSelectedPaymentPlanId(budgetToEdit.paymentPlan.id);
        }
        if(budgetToEdit.installmentsCount) {
            setInstallmentsCount(budgetToEdit.installmentsCount);
        }
        if(budgetToEdit.discount) {
            setDiscount(budgetToEdit.discount);
        }
      }
    }
  }, [budgetId, budgets]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.value, 0), [items]);
  const total = useMemo(() => subtotal - discount, [subtotal, discount]);
  
  const selectedPaymentPlan = useMemo(() => {
    return paymentPlans.find(p => p.id === selectedPaymentPlanId);
  }, [selectedPaymentPlanId, paymentPlans]);

  useEffect(() => {
    if (selectedPaymentPlan?.installments === 1) {
      setInstallmentsCount(1);
    }
  }, [selectedPaymentPlan]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = parseFloat(value.replace('.', '').replace(',', '.'));
    setDiscount(isNaN(parsedValue) ? 0 : parsedValue);
  }


  const handleAddItem = () => {
    const value = parseFloat(newItemValue.replace('.', '').replace(',', '.'));
    if (!newItemDesc || isNaN(value) || value <= 0) {
      toast({
        variant: 'destructive',
        title: 'Item Inválido',
        description: 'Por favor, forneça uma descrição válida e um valor positivo para o serviço.',
      });
      return;
    }
    setItems([...items, { id: uuidv4(), description: newItemDesc, value }]);
    setNewItemDesc('');
    setNewItemValue('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleSaveBudget = () => {
    const client = clients.find(c => c.id === selectedClientId);
    const salesperson = salespeople.find(s => s.id === selectedSalespersonId);
    
    if (!client || !salesperson || items.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Informações Incompletas',
            description: 'Por favor, selecione um cliente, um vendedor e adicione pelo menos um item de serviço.',
        });
        return null;
    }

    const budgetData: Omit<Budget, 'id' | 'createdAt'> = {
        client,
        salesperson,
        items,
        paymentPlan: selectedPaymentPlan,
        installmentsCount: selectedPaymentPlan && selectedPaymentPlan.installments && selectedPaymentPlan.installments > 1 ? installmentsCount : undefined,
        discount: discount > 0 ? discount : undefined,
        total,
    };
    
    if (budgetId) {
        const updatedBudgets = budgets.map(b => b.id === budgetId ? { ...b, ...budgetData } : b);
        setBudgets(updatedBudgets);
        toast({
            title: 'Orçamento Atualizado',
            description: `O orçamento ${budgetId} foi atualizado com sucesso.`,
        });
        return budgetId;
    } else {
        const newBudget: Budget = {
            id: `ORC-${new Date().getTime()}`,
            createdAt: new Date().toISOString(),
            ...budgetData
        };
        setBudgets([...budgets, newBudget]);
        toast({
          title: 'Orçamento Criado',
          description: `O orçamento ${newBudget.id} foi salvo com sucesso.`,
        });
        return newBudget.id;
    }
  };

  const handleGeneratePdf = () => {
    const savedBudgetId = handleSaveBudget();
    if (savedBudgetId) {
      router.push(`/budgets/${savedBudgetId}/print`);
    }
  };
  
  const handleShareOnWhatsApp = () => {
      const savedBudgetId = handleSaveBudget();
      if (!savedBudgetId) return;

      const budget = budgets.find(b => b.id === savedBudgetId) ?? {id: savedBudgetId, salesperson: salespeople.find(s => s.id === selectedSalespersonId), total: total, client: clients.find(c => c.id === selectedClientId)};

      if (budget?.salesperson?.whatsapp) {
          const message = encodeURIComponent(`Olá ${budget.client?.name}, aqui está seu orçamento #${budget.id} com um total de ${formatCurrency(budget.total)}. Por favor me avise se tiver alguma dúvida.`);
          window.open(`https://wa.me/${budget.salesperson.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
      } else {
          toast({
              variant: 'destructive',
              title: 'Número do WhatsApp não encontrado',
              description: "O vendedor selecionado não possui um número de WhatsApp cadastrado.",
          });
      }
  };

  if (!hasMounted) {
    return null;
  }
  
  const pageTitle = budgetId ? 'Editar Orçamento' : 'Criar Novo Orçamento';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title={pageTitle} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Envolvidos</CardTitle>
            <CardDescription>Selecione o cliente e o vendedor para este orçamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesperson">Vendedor</Label>
              <Select onValueChange={setSelectedSalespersonId} value={selectedSalespersonId}>
                <SelectTrigger id="salesperson">
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {salespeople.map(sp => (
                    <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Itens do Serviço</CardTitle>
             <CardDescription>Adicione os serviços incluídos neste orçamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto] gap-2 items-end">
                <div className="space-y-1">
                  <Label htmlFor="item-desc">Descrição</Label>
                  <Input id="item-desc" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} placeholder="Ex: Desenvolvimento de Site" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="item-value">Valor (R$)</Label>
                  <Input id="item-value" type="text" value={newItemValue} onChange={e => setNewItemValue(e.target.value)} placeholder="Ex: 1500,00" />
                </div>
                <Button onClick={handleAddItem} className="w-full md:w-auto">
                  <PlusCircle className="mr-2" /> Adicionar Item
                </Button>
              </div>
              <Separator />
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum item adicionado ainda.</p>
                ) : (
                  items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                      <span className="font-medium">{item.description}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{formatCurrency(item.value)}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
           <CardFooter className="flex-col items-stretch gap-4 border-t pt-6">
               <div className="flex justify-between items-center text-md font-medium text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-md font-medium text-muted-foreground">
                <Label htmlFor='discount' className="flex items-center gap-2 cursor-pointer">
                    <TicketPercent className="h-5 w-5" /> Desconto (R$)
                </Label>
                <Input 
                    id="discount" 
                    type="text" 
                    value={discount > 0 ? discount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''} 
                    onChange={handleDiscountChange}
                    className="max-w-[120px] text-right" 
                    placeholder="0,00"
                />
              </div>
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Finalização</CardTitle>
            <CardDescription>Selecione um plano de pagamento e finalize o orçamento.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="payment-plan">Plano de Pagamento</Label>
                    <Select onValueChange={setSelectedPaymentPlanId} value={selectedPaymentPlanId}>
                        <SelectTrigger id="payment-plan">
                        <SelectValue placeholder="Selecione um plano de pagamento (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                        {paymentPlans.map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                {selectedPaymentPlan && selectedPaymentPlan.installments && selectedPaymentPlan.installments > 1 && (
                     <div className="space-y-2">
                        <Label htmlFor="installments">Parcelas</Label>
                        <Select 
                            onValueChange={(value) => setInstallmentsCount(parseInt(value, 10))} 
                            value={String(installmentsCount)}
                        >
                            <SelectTrigger id="installments">
                                <SelectValue placeholder="Selecione o nº de parcelas" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: selectedPaymentPlan.installments }, (_, i) => i + 1).map(installment => (
                                    <SelectItem key={installment} value={String(installment)}>
                                        {installment}x de {formatCurrency(total / installment)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
             </div>
          </CardContent>
          <CardFooter className="gap-2 border-t pt-6">
            <Button onClick={handleSaveBudget} className="flex-1">
                <FileText /> {budgetId ? 'Salvar Alterações' : 'Salvar Orçamento'}
            </Button>
            <Button onClick={handleGeneratePdf} variant="secondary" className="flex-1">
                <FileText /> Salvar e Gerar PDF
            </Button>
            <Button onClick={handleShareOnWhatsApp} variant="secondary" className="flex-1">
                <Share2/> Compartilhar no WhatsApp
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
