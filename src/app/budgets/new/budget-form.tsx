
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusCircle, Trash2, FileText, Share2, TicketPercent, DollarSign, NotebookText } from 'lucide-react';
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
import { Combobox } from '@/components/ui/combobox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


export default function BudgetForm() {
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
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnitPrice, setNewItemUnitPrice] = useState('');
  
  const [discount, setDiscount] = useState<number>(0);
  const [discountInput, setDiscountInput] = useState<string>('');

  const [status, setStatus] = useState<Budget['status']>('pendente');
  const [budgetType, setBudgetType] = useState<Budget['budgetType']>('items');
  
  const [groupTotal, setGroupTotal] = useState<number>(0);
  const [groupTotalInput, setGroupTotalInput] = useState<string>('');
  const [observation, setObservation] = useState<string>('');


  useEffect(() => {
    if (budgetId && budgets.length > 0) {
      const budgetToEdit = budgets.find(b => b.id === budgetId);
      if (budgetToEdit) {
        setSelectedClientId(budgetToEdit.client.id);
        setSelectedSalespersonId(budgetToEdit.salesperson.id);
        setItems(budgetToEdit.items);
        setStatus(budgetToEdit.status);
        setBudgetType(budgetToEdit.budgetType || 'items');
        setObservation(budgetToEdit.observation || '');
        
        if (budgetToEdit.budgetType === 'group') {
          const totalValue = budgetToEdit.total + (budgetToEdit.discount || 0);
          setGroupTotal(totalValue);
          setGroupTotalInput(formatBRL(totalValue));
        }
        if(budgetToEdit.paymentPlan) {
            setSelectedPaymentPlanId(budgetToEdit.paymentPlan.id);
        }
        if(budgetToEdit.installmentsCount) {
            setInstallmentsCount(budgetToEdit.installmentsCount);
        }
        if(budgetToEdit.discount) {
            setDiscount(budgetToEdit.discount);
            setDiscountInput(formatBRL(budgetToEdit.discount));
        }
      }
    }
  }, [budgetId, budgets]);

  const subtotal = useMemo(() => {
    if (budgetType === 'group') {
      return groupTotal;
    }
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items, budgetType, groupTotal]);

  const total = useMemo(() => subtotal - discount, [subtotal, discount]);
  
  const selectedPaymentPlan = useMemo(() => {
    return paymentPlans.find(p => p.id === selectedPaymentPlanId);
  }, [selectedPaymentPlanId, paymentPlans]);
  
  const clientOptions = useMemo(() => {
    return clients.map(client => ({
        value: client.id,
        label: `${client.name} - ${client.cpfCnpj}`,
    }));
  }, [clients]);

  useEffect(() => {
    if (selectedPaymentPlan?.installments === 1) {
      setInstallmentsCount(1);
    }
  }, [selectedPaymentPlan]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const parseBRL = (value: string) => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  }

  const formatBRL = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  const handleValueInputChange = (e: React.ChangeEvent<HTMLInputElement>, setValue: (value: number) => void, setInput: (value: string) => void) => {
    const { value } = e.target;
    // Allow only numbers and a single comma
    const sanitizedValue = value.replace(/[^0-9,]/g, '');
    const parts = sanitizedValue.split(',');
    const finalValue = parts.length > 2 ? `${parts[0]},${parts.slice(1).join('')}` : sanitizedValue;
    
    setInput(finalValue);
    setValue(parseBRL(finalValue));
  }

  const handleValueInputBlur = (e: React.ChangeEvent<HTMLInputElement>, setValue: (value: number) => void, setInput: (value: string) => void) => {
      const numericValue = parseBRL(e.target.value);
      setValue(numericValue);
      setInput(numericValue > 0 ? formatBRL(numericValue) : '');
  }

  const handleAddItem = () => {
    if (!newItemDesc.trim()) {
       toast({
        variant: 'destructive',
        title: 'Descrição Inválida',
        description: 'Por favor, forneça uma descrição para o serviço.',
      });
      return;
    }

    if (budgetType === 'items') {
      const unitPrice = parseBRL(newItemUnitPrice);
      if (unitPrice <= 0) {
        toast({
          variant: 'destructive',
          title: 'Valor Inválido',
          description: 'Por favor, forneça um preço unitário positivo para o serviço.',
        });
        return;
      }
      if (newItemQuantity <= 0) {
        toast({
          variant: 'destructive',
          title: 'Quantidade Inválida',
          description: 'Por favor, forneça uma quantidade positiva para o serviço.',
        });
        return;
      }
      setItems([...items, { 
          id: uuidv4(), 
          description: newItemDesc.trim(), 
          quantity: newItemQuantity,
          unitPrice: unitPrice,
          value: newItemQuantity * unitPrice,
        }]);
    } else {
       setItems([...items, { id: uuidv4(), description: newItemDesc.trim(), quantity: 1, unitPrice: 0, value: 0 }]);
    }

    setNewItemDesc('');
    setNewItemUnitPrice('');
    setNewItemQuantity(1);
  };
  
  const handleItemDescKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAddItem();
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const getNextBudgetId = () => {
    const dsrBudgets = budgets.filter(b => b.id.startsWith('DSR-'));
    if (dsrBudgets.length === 0) {
        return 'DSR-0001';
    }
    const highestId = dsrBudgets.reduce((max, b) => {
        const num = parseInt(b.id.split('-')[1] || '0', 10);
        return num > max ? num : max;
    }, 0);
    return `DSR-${String(highestId + 1).padStart(4, '0')}`;
  };

  const handleSaveBudget = (redirect = false) => {
    const client = clients.find(c => c.id === selectedClientId);
    const salesperson = salespeople.find(s => s.id === selectedSalespersonId);
    
    if (!client || !salesperson || (budgetType === 'group' && groupTotal <= 0) || (budgetType === 'items' && items.length === 0)) {
        let description = 'Por favor, selecione um cliente, um vendedor e adicione pelo menos um item de serviço.';
        if (budgetType === 'group' && groupTotal <= 0) {
          description = 'Por favor, insira um valor total para o grupo de serviços.';
        }
        toast({
            variant: 'destructive',
            title: 'Informações Incompletas',
            description,
        });
        return null;
    }

    const budgetData: Omit<Budget, 'id' | 'createdAt'> = {
        client,
        salesperson,
        items,
        budgetType,
        observation: observation || undefined,
        paymentPlan: selectedPaymentPlan,
        installmentsCount: selectedPaymentPlan && selectedPaymentPlan.installments && selectedPaymentPlan.installments > 1 ? installmentsCount : undefined,
        discount: discount > 0 ? discount : undefined,
        total,
        status,
    };
    
    let savedBudgetId: string;

    if (budgetId) {
        savedBudgetId = budgetId;
        const updatedBudgets = budgets.map(b => b.id === budgetId ? { ...b, ...budgetData, createdAt: b.createdAt } : b);
        setBudgets(updatedBudgets);
        toast({
            title: 'Orçamento Atualizado',
            description: `O orçamento ${budgetId} foi atualizado com sucesso.`,
        });
    } else {
        savedBudgetId = getNextBudgetId();
        const newBudget: Budget = {
            id: savedBudgetId,
            createdAt: new Date().toISOString(),
            ...budgetData,
            status: 'pendente',
        };
        setBudgets([...budgets, newBudget]);
        toast({
          title: 'Orçamento Criado',
          description: `O orçamento ${newBudget.id} foi salvo com sucesso.`,
        });
    }

    if (redirect) {
      router.push('/budgets');
    }

    return savedBudgetId;
  };
  
  const handleSaveAndRedirect = () => {
    handleSaveBudget(true);
  }

  const handleGeneratePdf = () => {
    const savedBudgetId = handleSaveBudget();
    if (savedBudgetId) {
      router.push(`/budgets/${savedBudgetId}/print`);
    }
  };
  
  const handleShareOnWhatsApp = () => {
      const savedBudgetId = handleSaveBudget();
      if (!savedBudgetId) return;

      const budget = budgets.find(b => b.id === savedBudgetId) ?? {id: savedBudgetId, salesperson: salespeople.find(s => s.id === selectedSalespersonId), total: total, client: clients.find(c => c.id === selectedClientId), status: 'pendente', budgetType: 'items', items: []};

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
    <>
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
               <Combobox
                    options={clientOptions}
                    value={selectedClientId}
                    onSelect={setSelectedClientId}
                    placeholder="Selecione um cliente"
                    searchPlaceholder="Pesquisar cliente..."
                    notFoundMessage="Nenhum cliente encontrado."
                />
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
              <div className="space-y-2">
                  <Label>Tipo de Precificação</Label>
                  <RadioGroup value={budgetType} onValueChange={(value) => setBudgetType(value as Budget['budgetType'])} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="items" id="items" />
                      <Label htmlFor="items">Item a item</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="group" id="group" />
                      <Label htmlFor="group">Grupo de serviços</Label>
                    </div>
                  </RadioGroup>
              </div>

              <div className={cn(
                  "grid grid-cols-1 md:grid-cols-[1fr_80px_150px_auto] gap-2 items-end",
                  budgetType === 'group' && "md:grid-cols-[1fr_auto]"
              )}>
                <div className="space-y-1">
                  <Label htmlFor="item-desc">Descrição</Label>
                  <Textarea 
                    id="item-desc" 
                    value={newItemDesc} 
                    onChange={e => setNewItemDesc(e.target.value)} 
                    placeholder="Ex: Manutenção de sistema hidráulico&#10;Use Shift+Enter para quebrar a linha."
                    onKeyDown={handleItemDescKeyDown}
                    className="min-h-[60px]"
                    />
                </div>
                {budgetType === 'items' && (
                  <>
                    <div className="space-y-1">
                        <Label htmlFor="item-quantity">Qtd.</Label>
                        <Input id="item-quantity" type="number" value={newItemQuantity} onChange={e => setNewItemQuantity(Math.max(1, parseInt(e.target.value, 10)))} min="1" placeholder="1" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="item-unit-price">Vlr. Unit. (R$)</Label>
                        <Input id="item-unit-price" type="text" value={newItemUnitPrice} onChange={e => setNewItemUnitPrice(e.target.value)} placeholder="Ex: 1.500,00" />
                    </div>
                  </>
                )}
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
                    <div key={item.id} className="flex items-start justify-between p-2 rounded-md bg-secondary">
                      <div className="flex-1">
                        <span className="font-medium whitespace-pre-wrap">{item.description}</span>
                        {budgetType === 'items' && item.quantity > 1 && (
                            <p className="text-sm text-muted-foreground">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {budgetType === 'items' && item.value && (
                          <span className="font-semibold">{formatCurrency(item.value)}</span>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={() => handleRemoveItem(item.id)}>
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
              {budgetType === 'items' ? (
                <div className="flex justify-between items-center text-md font-medium text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              ) : (
                 <div className="flex justify-between items-center text-md font-medium text-muted-foreground">
                    <Label htmlFor='group-total' className="flex items-center gap-2 cursor-pointer">
                        <DollarSign className="h-5 w-5" /> Valor Total do Grupo (R$)
                    </Label>
                    <Input 
                        id="group-total" 
                        type="text" 
                        value={groupTotalInput} 
                        onChange={(e) => handleValueInputChange(e, setGroupTotal, setGroupTotalInput)}
                        onBlur={(e) => handleValueInputBlur(e, setGroupTotal, setGroupTotalInput)}
                        className="max-w-[150px] text-right" 
                        placeholder="0,00"
                    />
                </div>
              )}
               <div className="flex justify-between items-center text-md font-medium text-muted-foreground">
                <Label htmlFor='discount' className="flex items-center gap-2 cursor-pointer">
                    <TicketPercent className="h-5 w-5" /> Desconto (R$)
                </Label>
                <Input 
                    id="discount" 
                    type="text" 
                    value={discountInput} 
                    onChange={(e) => handleValueInputChange(e, setDiscount, setDiscountInput)}
                    onBlur={(e) => handleValueInputBlur(e, setDiscount, setDiscountInput)}
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
            <CardTitle>Observações e Pagamento</CardTitle>
            <CardDescription>Adicione observações e selecione um plano de pagamento.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <Label htmlFor="observation" className='flex items-center gap-2'>
                    <NotebookText />
                    Observações do Orçamento
                </Label>
                <Textarea
                    id="observation"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Adicione detalhes sobre o serviço, prazos, condições especiais, etc."
                    className="h-32"
                />
            </div>
              <div className="space-y-4">
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
            <Button onClick={handleSaveAndRedirect} className="flex-1">
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
    </>
  );
}
