"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, Printer, Calendar as CalendarIcon, X, Edit, CheckCircle, Clock, FileText } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import PageHeader from '@/components/page-header';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Budget } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function BudgetsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const hasMounted = useMounted();

  const filteredBudgets = useMemo(() => {
    return budgets
      .filter(budget => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const clientName = budget.client.name.toLowerCase();
        const clientPhone = budget.client.phone;
        const clientCpfCnpj = budget.client.cpfCnpj;
        return clientName.includes(lowerCaseSearchTerm) || clientPhone.includes(searchTerm) || clientCpfCnpj.includes(searchTerm);
      })
      .filter(budget => {
        if (!dateRange?.from) return true;
        const budgetDate = new Date(budget.createdAt);
        if (dateRange.from && !dateRange.to) {
             return budgetDate >= dateRange.from;
        }
        if (dateRange.from && dateRange.to) {
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            return budgetDate >= dateRange.from && budgetDate <= toDate;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [budgets, searchTerm, dateRange]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString: string) => {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm");
  }

  const handleDeleteBudget = () => {
    if (budgetToDelete) {
      setBudgets(budgets.filter(b => b.id !== budgetToDelete));
      toast({ title: 'Orçamento Excluído', description: `O orçamento ${budgetToDelete} foi removido.` });
      setBudgetToDelete(null);
    }
    setIsAlertOpen(false);
  };
  
  const openDeleteConfirmation = (id: string) => {
    setBudgetToDelete(id);
    setIsAlertOpen(true);
  };

  const handlePrintBudget = (id: string) => {
    router.push(`/budgets/${id}/print`);
  };

  const handleEditBudget = (id: string) => {
    router.push(`/budgets/new?id=${id}`);
  };

  const handleEditAndPrintBudget = (id: string) => {
    router.push(`/budgets/${id}/edit`);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRange(undefined);
  }

  const handleStatusChange = (id: string, status: 'pendente' | 'realizado') => {
    setBudgets(budgets.map(b => b.id === id ? { ...b, status } : b));
    toast({
      title: 'Status Alterado',
      description: `O orçamento ${id} foi marcado como ${status}.`
    });
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Orçamentos" />
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Orçamentos</CardTitle>
          <CardDescription>Pesquise e gerencie os orçamentos criados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, telefone ou CPF/CNPJ do cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                        "w-full md:w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                        dateRange.to ? (
                        <>
                            {format(dateRange.from, "LLL dd, y", {locale: ptBR})} -{" "}
                            {format(dateRange.to, "LLL dd, y", {locale: ptBR})}
                        </>
                        ) : (
                        format(dateRange.from, "LLL dd, y", {locale: ptBR})
                        )
                    ) : (
                        <span>Selecione um período</span>
                    )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                    />
                </PopoverContent>
            </Popover>
            <Button variant="ghost" onClick={handleClearFilters} className="p-2 h-10">
                <X className="h-4 w-4 mr-2" /> Limpar
            </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Orçamento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.length > 0 ? (
                  filteredBudgets.map(budget => (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">{budget.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium">{budget.client.name}</span>
                            <span className="text-sm text-muted-foreground">{budget.client.cpfCnpj}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(budget.createdAt)}</TableCell>
                       <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className={cn(
                                "w-32 justify-start",
                                budget.status === 'pendente' ? 'text-yellow-500 border-yellow-500' : 'text-green-500 border-green-500'
                            )}>
                              {budget.status === 'pendente' ? (
                                  <Clock className="mr-2 h-4 w-4" />
                              ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              {budget.status === 'pendente' ? 'Pendente' : 'Realizado'}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleStatusChange(budget.id, 'pendente')}>
                              <Clock className="mr-2 h-4 w-4" />
                              Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(budget.id, 'realizado')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Realizado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(budget.total)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                           <Button variant="outline" size="sm" onClick={() => handleEditBudget(budget.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </Button>
                           <Button variant="outline" size="sm" onClick={() => handlePrintBudget(budget.id)}>
                            <Printer className="mr-2 h-4 w-4" /> Imprimir PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditAndPrintBudget(budget.id)}>
                            <FileText className="mr-2 h-4 w-4" /> Editar e Imprimir
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteConfirmation(budget.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum orçamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o orçamento e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBudgetToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBudget}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
