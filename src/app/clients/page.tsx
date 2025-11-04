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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import type { Client } from '@/lib/definitions';
import PageHeader from '@/components/page-header';

const emptyClient: Client = { id: '', name: '', email: '', phone: '' };

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client>(emptyClient);

  const handleOpenDialog = (client?: Client) => {
    setCurrentClient(client || emptyClient);
    setIsDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!currentClient.name) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Client name is required.',
      });
      return;
    }
    
    if (currentClient.id) {
      // Update existing client
      setClients(clients.map(c => c.id === currentClient.id ? currentClient : c));
      toast({ title: 'Client Updated', description: `Client ${currentClient.name} has been updated.` });
    } else {
      // Add new client
      const newClient = { ...currentClient, id: uuidv4() };
      setClients([...clients, newClient]);
      toast({ title: 'Client Added', description: `Client ${newClient.name} has been added.` });
    }
    
    setIsDialogOpen(false);
    setCurrentClient(emptyClient);
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    toast({ title: 'Client Deleted', description: 'The client has been deleted.' });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Clients">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>Manage your registered clients.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.length > 0 ? (
              clients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="font-medium">
                    <p className="text-base text-secondary-foreground">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email} - {client.phone}</p>
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
              <p className="text-center text-muted-foreground py-8">No clients found. Add one to get started.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentClient.id ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {currentClient.id ? 'Update the details for this client.' : 'Fill in the details for the new client.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={currentClient.name} onChange={e => setCurrentClient({...currentClient, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={currentClient.email} onChange={e => setCurrentClient({...currentClient, email: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input id="phone" value={currentClient.phone} onChange={e => setCurrentClient({...currentClient, phone: e.target.value})} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
