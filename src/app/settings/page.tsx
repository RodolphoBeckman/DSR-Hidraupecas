"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, Save, Download, UploadCloud, FileSpreadsheet } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { AppSettings, CompanyInfo, UserInfo, Client } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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

const initialCompanyInfo: CompanyInfo = {
  name: '',
  address: '',
  cityStateZip: '',
  email: '',
}

const initialUserInfo: UserInfo = {
    name: 'Usuário',
    email: 'usuario@exemplo.com',
    avatar: null,
}

const LOCAL_STORAGE_KEYS = ['budgets', 'clients', 'salespeople', 'paymentPlans', 'app-settings'];


export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', { 
    pixQrCode: null, 
    headerImage: null,
    companyInfo: initialCompanyInfo,
    backgroundImage: null,
    userInfo: initialUserInfo,
  });
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isImportAlertOpen, setIsImportAlertOpen] = useState(false);
  const [dataToImport, setDataToImport] = useState<string | null>(null);
  
  const importFileRef = useRef<HTMLInputElement>(null);
  const importClientsFileRef = useRef<HTMLInputElement>(null);

  const hasMounted = useMounted();

  const qrPlaceholder = PlaceHolderImages.find(p => p.id === 'pix-qr-code')!;
  const headerPlaceholder = PlaceHolderImages.find(p => p.id === 'header-image')!;
  const backgroundPlaceholder = PlaceHolderImages.find(p => p.id === 'background-image')!;
  const avatarPlaceholder = PlaceHolderImages.find(p => p.id === 'user-avatar')!;


  useEffect(() => {
    if (hasMounted) {
      setQrCodePreview(settings.pixQrCode);
      setHeaderImagePreview(settings.headerImage);
      setBackgroundImagePreview(settings.backgroundImage);
      if (settings.companyInfo) {
        setCompanyInfo(settings.companyInfo);
      }
      if(settings.userInfo) {
        setUserInfo(settings.userInfo);
        setAvatarPreview(settings.userInfo.avatar);
      }
    }
  }, [settings, hasMounted]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'qr' | 'header' | 'background' | 'avatar') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if(type === 'qr'){
            setQrCodePreview(result);
        } else if (type === 'header') {
            setHeaderImagePreview(result);
        } else if (type === 'background') {
            setBackgroundImagePreview(result);
        } else {
            setAvatarPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({...prev, [name]: value}));
  }

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({...prev, [name]: value}));
  }


  const handleSave = () => {
    setSettings({ 
        pixQrCode: qrCodePreview, 
        headerImage: headerImagePreview,
        companyInfo: companyInfo,
        backgroundImage: backgroundImagePreview,
        userInfo: { ...userInfo, avatar: avatarPreview},
    });
    toast({
      title: 'Configurações Salvas',
      description: 'Suas configurações foram atualizadas com sucesso.',
    });
  };

  const handleExportData = () => {
    try {
      const dataToExport: { [key: string]: any } = {};
      LOCAL_STORAGE_KEYS.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          dataToExport[key] = JSON.parse(item);
        }
      });
      
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `dados-app-orcamentos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Exportação Concluída',
        description: 'Os dados do aplicativo foram exportados com sucesso.',
      });

    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        variant: 'destructive',
        title: 'Erro na Exportação',
        description: 'Não foi possível exportar os dados do aplicativo.',
      });
    }
  };
  
  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDataToImport(text);
        setIsImportAlertOpen(true);
      };
      reader.readAsText(file);
    }
    // Reset file input
    if(importFileRef.current) importFileRef.current.value = '';
  };
  
  const handleConfirmImport = () => {
    if (!dataToImport) return;
    try {
      const importedData = JSON.parse(dataToImport);
      let validKeys = 0;
      LOCAL_STORAGE_KEYS.forEach(key => {
        if (importedData[key]) {
          localStorage.setItem(key, JSON.stringify(importedData[key]));
          validKeys++;
        }
      });

      if (validKeys === 0) {
        throw new Error("O arquivo não contém dados válidos para importação.");
      }

      toast({
        title: 'Importação Concluída',
        description: 'Os dados foram importados com sucesso. A página será recarregada.',
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error("Erro ao importar dados:", error);
      toast({
        variant: 'destructive',
        title: 'Erro na Importação',
        description: error.message || 'O arquivo selecionado é inválido ou está corrompido.',
      });
    } finally {
        setIsImportAlertOpen(false);
        setDataToImport(null);
    }
  };

  const handleImportClientsFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if(json.length < 2) {
            toast({ variant: 'destructive', title: 'Planilha Vazia', description: 'A planilha selecionada não contém dados de clientes.'});
            return;
        }

        const headers = (json[0] as string[]).map(h => h.toLowerCase().trim());
        const requiredHeaders = ['name', 'cpf/cnpj', 'phone', 'email'];
        const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));

        if (missingHeaders.length > 0) {
           toast({ variant: 'destructive', title: 'Cabeçalhos Ausentes', description: `Sua planilha precisa ter as colunas: ${missingHeaders.join(', ')}`});
           return;
        }

        const nameIndex = headers.indexOf('name');
        const cpfCnpjIndex = headers.indexOf('cpf/cnpj');
        const phoneIndex = headers.indexOf('phone');
        const emailIndex = headers.indexOf('email');
        const tradeNameIndex = headers.indexOf('trade name');
        const ieRgIndex = headers.indexOf('ie/rg');
        const addressIndex = headers.indexOf('address');

        const newClients: Client[] = json.slice(1).map(row => {
          const cpfCnpj = String(row[cpfCnpjIndex] || '');
          const isJuridica = cpfCnpj.replace(/\D/g, '').length === 14;

          return {
            id: uuidv4(),
            type: isJuridica ? 'pessoa_juridica' : 'pessoa_fisica',
            name: String(row[nameIndex] || ''),
            cpfCnpj: cpfCnpj,
            phone: String(row[phoneIndex] || ''),
            email: String(row[emailIndex] || ''),
            tradeName: tradeNameIndex > -1 ? String(row[tradeNameIndex] || '') : undefined,
            ieRg: ieRgIndex > -1 ? String(row[ieRgIndex] || '') : undefined,
            address: addressIndex > -1 ? String(row[addressIndex] || '') : undefined,
            observations: undefined,
          };
        }).filter(c => c.name && c.cpfCnpj);
        
        if (newClients.length > 0) {
          setClients(prevClients => [...prevClients, ...newClients]);
          toast({
            title: 'Clientes Importados',
            description: `${newClients.length} novos clientes foram adicionados com sucesso.`,
          });
        } else {
           toast({
            variant: 'destructive',
            title: 'Nenhum Cliente Válido Encontrado',
            description: 'Verifique se as colunas de nome e CPF/CNPJ estão preenchidas corretamente na planilha.',
          });
        }

      } catch (error: any) {
        console.error("Erro ao importar planilha de clientes:", error);
        toast({
          variant: 'destructive',
          title: 'Erro na Importação',
          description: error.message || 'Não foi possível ler o arquivo da planilha.',
        });
      }
    };
    reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'Erro de Leitura',
            description: 'Não foi possível ler o arquivo selecionado.',
        });
    }
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    if(importClientsFileRef.current) importClientsFileRef.current.value = '';
  };


  if (!hasMounted) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Configurações" />
      
       <Card>
        <CardHeader>
          <CardTitle>Perfil do Operador</CardTitle>
          <CardDescription>
            Personalize as informações que aparecem no menu do usuário.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="userName">Nome do Operador</Label>
                    <Input id="userName" name="name" value={userInfo.name || ''} onChange={handleUserInfoChange} placeholder="Nome do Operador" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="userEmail">Email</Label>
                    <Input id="userEmail" name="email" type="email" value={userInfo.email || ''} onChange={handleUserInfoChange} placeholder="email@dominio.com" />
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="flex-1 w-full space-y-2">
                    <Label htmlFor="avatar-upload">Imagem do Avatar</Label>
                    <div className="flex items-center gap-2">
                    <Input id="avatar-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} className="flex-1" />
                    <Button size="icon" className="md:hidden" asChild>
                        <label htmlFor="avatar-upload"><Upload className="h-4 w-4" /></label>
                    </Button>
                    </div>
                </div>
                 <div className="flex-shrink-0">
                    <p className="text-sm font-medium mb-2 text-center">Pré-visualização</p>
                    <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
                    <Image
                        src={avatarPreview || avatarPlaceholder.imageUrl}
                        alt="Pré-visualização do avatar"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                        data-ai-hint={avatarPlaceholder.imageHint}
                    />
                    </div>
                </div>
            </div>

        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Personalize a aparência do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
           <div className="flex-1 w-full space-y-2">
            <Label htmlFor="background-image-upload">Imagem de Fundo</Label>
            <div className="flex items-center gap-2">
              <Input id="background-image-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'background')} className="flex-1" />
              <Button size="icon" className="md:hidden" asChild>
                <label htmlFor="background-image-upload"><Upload className="h-4 w-4" /></label>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Essa imagem será exibida no fundo de todas as telas. Use uma imagem com proporção 16:9 (ex: 1920x1080) para melhores resultados.
            </p>
          </div>
          <div className="flex-shrink-0">
            <p className="text-sm font-medium mb-2 text-center">Pré-visualização</p>
            <div className="w-64 h-36 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
              <Image
                src={backgroundImagePreview || backgroundPlaceholder.imageUrl}
                alt="Pré-visualização da imagem de fundo"
                width={256}
                height={144}
                className="object-cover w-full h-full"
                data-ai-hint={backgroundPlaceholder.imageHint}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Gerenciamento de Dados</CardTitle>
            <CardDescription>Exporte todos os dados do aplicativo para um backup ou importe para restaurar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleExportData} className="flex-1">
                    <Download className="mr-2" /> Exportar Dados do App
                </Button>
                <Button onClick={() => importFileRef.current?.click()} className="flex-1" variant="outline">
                    <UploadCloud className="mr-2" /> Importar Dados do App
                </Button>
                 <Button onClick={() => importClientsFileRef.current?.click()} className="flex-1" variant="outline">
                    <FileSpreadsheet className="mr-2" /> Importar Clientes (XLSX/CSV)
                </Button>
                <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={handleImportFileChange} />
                <input type="file" ref={importClientsFileRef} className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleImportClientsFromFile} />
            </div>
            <p className="text-xs text-muted-foreground">
              Ao importar dados do app, todos os dados atuais serão substituídos. Recomenda-se fazer um backup (exportar) antes. <br/>
              A importação de clientes (XLSX/CSV) adicionará novos clientes à lista existente. A planilha deve conter as colunas obrigatórias: 'name', 'cpf/cnpj', 'phone', 'email'. Opcionais: 'trade name', 'ie/rg', 'address'.
            </p>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Estes dados serão exibidos no cabeçalho dos seus orçamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input id="companyName" name="name" value={companyInfo.name || ''} onChange={handleCompanyInfoChange} placeholder="Sua Empresa LTDA" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="companyAddress">Endereço</Label>
                    <Input id="companyAddress" name="address" value={companyInfo.address || ''} onChange={handleCompanyInfoChange} placeholder="Rua Exemplo, 123, Sala 100" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="companyCity">Cidade, Estado, CEP</Label>
                    <Input id="companyCity" name="cityStateZip" value={companyInfo.cityStateZip || ''} onChange={handleCompanyInfoChange} placeholder="Cidade, Estado, 12345-678" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email de Contato</Label>
                    <Input id="companyEmail" name="email" type="email" value={companyInfo.email || ''} onChange={handleCompanyInfoChange} placeholder="contato@suaempresa.com" />
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagem do Cabeçalho do Orçamento</CardTitle>
          <CardDescription>
            Faça o upload da imagem que será exibida no cabeçalho dos orçamentos em PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full space-y-2">
            <Label htmlFor="header-image-upload">Imagem do Cabeçalho</Label>
            <div className="flex items-center gap-2">
              <Input id="header-image-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'header')} className="flex-1" />
              <Button size="icon" className="md:hidden" asChild>
                <label htmlFor="header-image-upload"><Upload className="h-4 w-4" /></label>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use uma imagem panorâmica (ex: 1200x400) para melhores resultados.
            </p>
          </div>
          <div className="flex-shrink-0">
            <p className="text-sm font-medium mb-2 text-center">Pré-visualização</p>
            <div className="w-64 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
              <Image
                src={headerImagePreview || headerPlaceholder.imageUrl}
                alt="Pré-visualização da imagem do cabeçalho"
                width={256}
                height={96}
                className="object-cover w-full h-full"
                data-ai-hint={headerPlaceholder.imageHint}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamento PIX</CardTitle>
          <CardDescription>
            Faça o upload da imagem do seu QR Code PIX aqui. Ele será exibido nos orçamentos em PDF gerados.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full space-y-2">
            <Label htmlFor="qr-code-upload">Imagem do QR Code</Label>
            <div className="flex items-center gap-2">
              <Input id="qr-code-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'qr')} className="flex-1" />
              <Button size="icon" className="md:hidden" asChild>
                <label htmlFor="qr-code-upload"><Upload className="h-4 w-4" /></label>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Carregue uma imagem quadrada para melhores resultados.
            </p>
          </div>
          <div className="flex-shrink-0">
            <p className="text-sm font-medium mb-2 text-center">Pré-visualização</p>
            <div className="w-40 h-40 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
              <Image
                src={qrCodePreview || qrPlaceholder.imageUrl}
                alt="Pré-visualização do QR Code PIX"
                width={160}
                height={160}
                className="object-contain"
                data-ai-hint={qrPlaceholder.imageHint}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Salvar Configurações
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isImportAlertOpen} onOpenChange={setIsImportAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Importação de Dados?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação substituirá TODOS os dados atuais do aplicativo (orçamentos, clientes, configurações, etc.) pelos dados do arquivo que você selecionou. Esta ação não pode ser desfeita.
              <br/><br/>
              <strong>Recomenda-se fortemente que você exporte seus dados atuais antes de continuar.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsImportAlertOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>Sim, Importar e Substituir Tudo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
