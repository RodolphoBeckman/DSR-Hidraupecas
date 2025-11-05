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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import type { Salesperson } from '@/lib/definitions';
import PageHeader from '@/components/page-header';
import { useMounted } from '@/hooks/use-mounted';

const emptySalesperson: Salesperson = { id: '', name: '', whatsapp: '' };

export default function SalespeoplePage() {
  const { toast } = useToast();
  const [salespeople, setSalespeople] = useLocalStorage<Salesperson[]>('salespeople', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSalesperson, setCurrentSalesperson] = useState<Salesperson>(emptySalesperson);
  const hasMounted = useMounted();

  const handleOpenDialog = (salesperson?: Salesperson) => {
    setCurrentSalesperson(salesperson || emptySalesperson);
    setIsDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!currentSalesperson.name || !currentSalesperson.whatsapp) {
      toast({
        variant: 'destructive',
        title: 'Erro de Validação',
        description: 'Nome e número do WhatsApp são obrigatórios.',
      });
      return;
    }
    
    if (currentSalesperson.id) {
      setSalespeople(salespeople.map(s => s.id === currentSalesperson.id ? currentSalesperson : s));
      toast({ title: 'Vendedor Atualizado', description: `Os detalhes de ${currentSalesperson.name} foram atualizados.` });
    } else {
      const newSalesperson = { ...currentSalesperson, id: uuidv4() };
      setSalespeople([...salespeople, newSalesperson]);
      toast({ title: 'Vendedor Adicionado', description: `${newSalesperson.name} foi adicionado.` });
    }
    
    setIsDialogOpen(false);
    setCurrentSalesperson(emptySalesperson);
  };

  const handleDelete = (id: string) => {
    setSalespeople(salespeople.filter(s => s.id !== id));
    toast({ title: 'Vendedor Excluído', description: 'O vendedor foi excluído.' });
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Vendedores">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Vendedor
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendedores</CardTitle>
          <CardDescription>Gerencie seus vendedores cadastrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salespeople.length > 0 ? (
              salespeople.map(sp => (
                <div key={sp.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="font-medium">
                    <p className="text-base text-secondary-foreground">{sp.name}</p>
                    <p className="text-sm text-muted-foreground">{sp.whatsapp}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(sp)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(sp.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum vendedor encontrado. Adicione um para começar.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentSalesperson.id ? 'Editar Vendedor' : 'Adicionar Novo Vendedor'}</DialogTitle>
            <DialogDescription>
                {currentSalesperson.id ? 'Atualize os detalhes deste vendedor.' : 'Preencha os detalhes do novo vendedor.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={currentSalesperson.name} onChange={e => setCurrentSalesperson({...currentSalesperson, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="whatsapp" className="text-right">WhatsApp</Label>
              <Input id="whatsapp" placeholder="+5511999999999" value={currentSalesperson.whatsapp} onChange={e => setCurrentSalesperson({...currentSalesperson, whatsapp: e.target.value})} className="col-span-3" />
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
