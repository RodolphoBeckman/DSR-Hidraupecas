"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, FileText, Share2 } from 'lucide-react';
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

export default function BudgetCreationPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [salespeople] = useLocalStorage<Salesperson[]>('salespeople', []);
  const [paymentPlans] = useLocalStorage<PaymentPlan[]>('paymentPlans', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>('');
  const [selectedPaymentPlanId, setSelectedPaymentPlanId] = useState<string>('');
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemValue, setNewItemValue] = useState('');

  const total = useMemo(() => items.reduce((sum, item) => sum + item.value, 0), [items]);

  const handleAddItem = () => {
    const value = parseFloat(newItemValue);
    if (!newItemDesc || isNaN(value) || value <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Item',
        description: 'Please provide a valid description and positive value for the service.',
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

  const handleCreateBudget = () => {
    const client = clients.find(c => c.id === selectedClientId);
    const salesperson = salespeople.find(s => s.id === selectedSalespersonId);

    if (!client || !salesperson || items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please select a client, a salesperson, and add at least one service item.',
      });
      return;
    }

    const paymentPlan = paymentPlans.find(p => p.id === selectedPaymentPlanId);

    const newBudget: Budget = {
      id: `BUD-${new Date().getTime()}`,
      client,
      salesperson,
      items,
      paymentPlan,
      total,
      createdAt: new Date().toISOString(),
    };

    setBudgets([...budgets, newBudget]);
    toast({
      title: 'Budget Created',
      description: `Budget ${newBudget.id} has been saved successfully.`,
    });
    
    // For this demonstration, we'll use the "Generate PDF" button to navigate to a print view.
    // In a real app, you might clear the form here.
    return newBudget.id;
  };

  const handleGeneratePdf = () => {
    const budgetId = handleCreateBudget();
    if (budgetId) {
      router.push(`/budgets/${budgetId}/print`);
    }
  };
  
  const handleShareOnWhatsApp = () => {
      const budgetId = handleCreateBudget();
      if (!budgetId) return;

      const budget = budgets.find(b => b.id === budgetId) ?? {id: budgetId, salesperson: salespeople.find(s => s.id === selectedSalespersonId), total: total, client: clients.find(c => c.id === selectedClientId)};

      if (budget?.salesperson?.whatsapp) {
          const message = encodeURIComponent(`Hello ${budget.client?.name}, here is your budget #${budget.id} with a total of $${budget.total.toFixed(2)}. Please let me know if you have any questions.`);
          window.open(`https://wa.me/${budget.salesperson.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
      } else {
          toast({
              variant: 'destructive',
              title: 'WhatsApp number not found',
              description: "The selected salesperson doesn't have a WhatsApp number registered.",
          });
      }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Create New Budget" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parties Involved</CardTitle>
            <CardDescription>Select the client and salesperson for this budget.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesperson">Salesperson</Label>
              <Select onValueChange={setSelectedSalespersonId} value={selectedSalespersonId}>
                <SelectTrigger id="salesperson">
                  <SelectValue placeholder="Select a salesperson" />
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
            <CardTitle>Service Items</CardTitle>
             <CardDescription>Add the services included in this budget.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto] gap-2 items-end">
                <div className="space-y-1">
                  <Label htmlFor="item-desc">Description</Label>
                  <Input id="item-desc" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} placeholder="e.g., Website Development" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="item-value">Value ($)</Label>
                  <Input id="item-value" type="number" value={newItemValue} onChange={e => setNewItemValue(e.target.value)} placeholder="e.g., 1500.00" />
                </div>
                <Button onClick={handleAddItem} className="w-full md:w-auto">
                  <PlusCircle className="mr-2" /> Add Item
                </Button>
              </div>
              <Separator />
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No items added yet.</p>
                ) : (
                  items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                      <span className="font-medium">{item.description}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">${item.value.toFixed(2)}</span>
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
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Finalization</CardTitle>
            <CardDescription>Select a payment plan and finalize the budget.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-2">
                <Label htmlFor="payment-plan">Payment Plan</Label>
                <Select onValueChange={setSelectedPaymentPlanId} value={selectedPaymentPlanId}>
                    <SelectTrigger id="payment-plan">
                    <SelectValue placeholder="Select a payment plan (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                    {paymentPlans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
             </div>
          </CardContent>
          <CardFooter className="gap-2 border-t pt-6">
            <Button onClick={handleGeneratePdf} className="flex-1">
                <FileText /> Save & Generate PDF
            </Button>
            <Button onClick={handleShareOnWhatsApp} variant="secondary" className="flex-1">
                <Share2/> Share on WhatsApp
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
