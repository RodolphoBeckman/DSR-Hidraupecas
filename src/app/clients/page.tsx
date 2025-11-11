"use client";

import { useState } from 'react';
import { PlusCircle, Edit, Trash2, Building, User } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const emptyClient: Partial<Client> = { 
  type: 'pessoa_juridica', 
  name: '', 
  tradeName: '', 
  cpfCnpj: '', 
  ieRg: '', 
  phone: '', 
  email: '', 
  address: {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  },
  observations: '',
};

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({ ...emptyClient });
  const hasMounted = useMounted();

  const handleOpenDialog = (client?: Client) => {
    setCurrentClient(client ? { ...client } : { ...emptyClient });
    setIsDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!currentClient.name || !currentClient.cpfCnpj) {
      toast({
        variant: 'destructive',
        title: 'Erro de Validação',
        description: 'O campo de Nome/Razão Social e CPF/CNPJ são obrigatórios.',
      });
      return;
    }
    
    if (currentClient.id) {
      setClients(clients.map(c => c.id === currentClient.id ? currentClient as Client : c));
      toast({ title: 'Cliente Atualizado', description: `Cliente ${currentClient.name} foi atualizado.` });
    } else {
      const newClient = { ...currentClient, id: uuidv4() } as Client;
      setClients([...clients, newClient]);
      toast({ title: 'Cliente Adicionado', description: `Cliente ${newClient.name} foi adicionado.` });
    }
    
    setIsDialogOpen(false);
    setCurrentClient({ ...emptyClient });
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    toast({ title: 'Cliente Excluído', description: 'O cliente foi excluído.' });
  };
  
  const handleClientTypeChange = (type: 'pessoa_fisica' | 'pessoa_juridica') => {
    setCurrentClient(prev => ({ ...prev, type }));
  }

  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentClient(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentClient(prev => ({
        ...prev,
        address: {
            ...prev.address,
            [name]: value
        }
    }));
  };

  const formatAddress = (address: Client['address']) => {
    if (!address) return '';
    const parts = [
      address.street,
      address.number,
      address.neighborhood,
      address.city,
      address.state,
      address.zipCode,
    ];
    return parts.filter(Boolean).join(', ');
  }

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
                <div key={client.id} className="flex items-start justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        {client.type === 'pessoa_juridica' ? <Building className="h-5 w-5 text-muted-foreground" /> : <User className="h-5 w-5 text-muted-foreground" />}
                        <p className="text-lg font-semibold text-primary">{client.name}</p>
                    </div>
                    {client.tradeName && <p className="text-sm text-muted-foreground">{client.tradeName}</p>}
                    <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                        <p><span className="font-medium">CPF/CNPJ:</span> {client.cpfCnpj}</p>
                        <p><span className="font-medium">IE/RG:</span> {client.ieRg}</p>
                        <p><span className="font-medium">Telefone:</span> {client.phone}</p>
                        <p><span className="font-medium">Email:</span> {client.email}</p>
                    </div>
                    {client.address && <p className="text-sm text-muted-foreground"><span className="font-medium">Endereço:</span> {formatAddress(client.address)}</p>}
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
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentClient.id ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
            <DialogDescription>
              {currentClient.id ? 'Atualize os detalhes deste cliente.' : 'Preencha os detalhes do novo cliente.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <RadioGroup 
                value={currentClient.type || 'pessoa_juridica'} 
                onValueChange={(value) => handleClientTypeChange(value as 'pessoa_fisica' | 'pessoa_juridica')}
                className="flex items-center space-x-4"
            >
                <Label>Tipo de Pessoa:</Label>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pessoa_juridica" id="pessoa_juridica" />
                    <Label htmlFor="pessoa_juridica">Pessoa Jurídica</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pessoa_fisica" id="pessoa_fisica" />
                    <Label htmlFor="pessoa_fisica">Pessoa Física</Label>
                </div>
            </RadioGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                    <Label htmlFor="name">{currentClient.type === 'pessoa_fisica' ? 'Nome Completo' : 'Razão Social'}</Label>
                    <Input id="name" name="name" value={currentClient.name || ''} onChange={handleClientInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tradeName">Nome Fantasia</Label>
                    <Input id="tradeName" name="tradeName" value={currentClient.tradeName || ''} onChange={handleClientInputChange} disabled={currentClient.type === 'pessoa_fisica'} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cpfCnpj">{currentClient.type === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}</Label>
                    <Input id="cpfCnpj" name="cpfCnpj" value={currentClient.cpfCnpj || ''} onChange={handleClientInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ieRg">{currentClient.type === 'pessoa_fisica' ? 'RG' : 'Inscrição Estadual'}</Label>
                    <Input id="ieRg" name="ieRg" value={currentClient.ieRg || ''} onChange={handleClientInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" value={currentClient.phone || ''} onChange={handleClientInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={currentClient.email || ''} onChange={handleClientInputChange} />
                </div>
            </div>
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Endereço</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input id="zipCode" name="zipCode" value={currentClient.address?.zipCode || ''} onChange={handleAddressChange} />
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">Logradouro</Label>
                        <Input id="street" name="street" value={currentClient.address?.street || ''} onChange={handleAddressChange} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input id="number" name="number" value={currentClient.address?.number || ''} onChange={handleAddressChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input id="neighborhood" name="neighborhood" value={currentClient.address?.neighborhood || ''} onChange={handleAddressChange} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" name="city" value={currentClient.address?.city || ''} onChange={handleAddressChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input id="state" name="state" value={currentClient.address?.state || ''} onChange={handleAddressChange} />
                    </div>
                </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea id="observations" value={currentClient.observations || ''} onChange={e => setCurrentClient({...currentClient, observations: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
