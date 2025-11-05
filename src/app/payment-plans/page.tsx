"use client";

import { useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import type { PaymentPlan } from '@/lib/definitions';
import PageHeader from '@/components/page-header';

const emptyPlan: PaymentPlan = { id: '', name: '', description: '', installments: 1 };

export default function PaymentPlansPage() {
  const { toast } = useToast();
  const [paymentPlans, setPaymentPlans] = useLocalStorage<PaymentPlan[]>('paymentPlans', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PaymentPlan>(emptyPlan);

  const handleOpenDialog = (plan?: PaymentPlan) => {
    setCurrentPlan(plan || emptyPlan);
    setIsDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!currentPlan.name) {
      toast({
        variant: 'destructive',
        title: 'Erro de Validação',
        description: 'O nome do plano é obrigatório.',
      });
      return;
    }
    
    if (currentPlan.id) {
      setPaymentPlans(paymentPlans.map(p => p.id === currentPlan.id ? currentPlan : p));
      toast({ title: 'Plano Atualizado', description: `O plano ${currentPlan.name} foi atualizado.` });
    } else {
      const newPlan = { ...currentPlan, id: uuidv4() };
      setPaymentPlans([...paymentPlans, newPlan]);
      toast({ title: 'Plano Adicionado', description: `O plano ${newPlan.name} foi adicionado.` });
    }
    
    setIsDialogOpen(false);
    setCurrentPlan(emptyPlan);
  };

  const handleDelete = (id: string) => {
    setPaymentPlans(paymentPlans.filter(p => p.id !== id));
    toast({ title: 'Plano Excluído', description: 'O plano de pagamento foi excluído.' });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Planos de Pagamento">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Plano
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Planos</CardTitle>
          <CardDescription>Configure e gerencie diferentes planos de pagamento para oferecer aos clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentPlans.length > 0 ? (
              paymentPlans.map(plan => (
                <div key={plan.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary">
                  <div className="font-medium">
                    <p className="text-base text-secondary-foreground">{plan.name}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.description}</p>
                    {plan.installments && plan.installments > 1 && (
                         <p className="text-sm text-muted-foreground">Até {plan.installments}x</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum plano de pagamento encontrado. Adicione um para começar.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentPlan.id ? 'Editar Plano' : 'Adicionar Novo Plano'}</DialogTitle>
            <DialogDescription>
                {currentPlan.id ? 'Atualize os detalhes deste plano de pagamento.' : 'Preencha os detalhes para o novo plano de pagamento.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={currentPlan.name} onChange={e => setCurrentPlan({...currentPlan, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Descrição</Label>
              <Textarea id="description" value={currentPlan.description} onChange={e => setCurrentPlan({...currentPlan, description: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="installments" className="text-right">Nº de Parcelas</Label>
                <Input 
                    id="installments" 
                    type="number" 
                    value={currentPlan.installments || 1} 
                    onChange={e => setCurrentPlan({...currentPlan, installments: parseInt(e.target.value, 10) || 1})} 
                    className="col-span-3" 
                    min="1"
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
