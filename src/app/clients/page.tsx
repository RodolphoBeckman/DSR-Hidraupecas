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
import type { Client } from '@/lib/definitions';
import PageHeader from '@/components/page-header';
import { useMounted } from '@/hooks/use-mounted';

const emptyClient: Client = { id: '', name: '', email: '', phone: '', address: '' };

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client>(emptyClient);
  const hasMounted = useMounted();

  const handleOpenDialog = (client?: Client) => {
    setCurrentClient(client || emptyClient);
    setIsDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!currentClient.name) {
      toast({
        variant: 'destructive',
        title: 'Erro de Validação',
        description: 'O nome do cliente é obrigatório.',
      });
      return;
    }
    
    if (currentClient.id) {
      setClients(clients.map(c => c.id === currentClient.id ? currentClient : c));
      toast({ title: 'Cliente Atualizado', description: `Cliente ${currentClient.name} foi atualizado.` });
    } else {
      const newClient = { ...currentClient, id: uuidv4() };
      setClients([...clients, newClient]);
      toast({ title: 'Cliente Adicionado', description: `Cliente ${newClient.name} foi adicionado.` });
    }
    
    setIsDialogOpen(false);
    setCurrentClient(emptyClient);
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    toast({ title: 'Cliente Excluído', description: 'O cliente foi excluído.' });
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Clientes">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Cliente
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Gerencie seus clientes cadastrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.length > 0 ? (
              clients.map(client => (
                <div key={client.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary">
                  <div className="font-medium">
                    <p className="text-base text-secondary-foreground">{client.name}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p>{client.email} - {client.phone}</p>
                        <p>{client.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClient(client.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum cliente encontrado. Adicione um para começar.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentClient.id ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
            <DialogDescription>
              {currentClient.id ? 'Atualize os detalhes deste cliente.' : 'Preencha os detalhes do novo cliente.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={currentClient.name || ''} onChange={e => setCurrentClient({...currentClient, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={currentClient.email || ''} onChange={e => setCurrentClient({...currentClient, email: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Telefone</Label>
              <Input id="phone" value={currentClient.phone || ''} onChange={e => setCurrentClient({...currentClient, phone: e.target.value})} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Endereço</Label>
              <Input id="address" value={currentClient.address || ''} onChange={e => setCurrentClient({...currentClient, address: e.target.value})} className="col-span-3" />
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
