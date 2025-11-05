"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Save } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { AppSettings, CompanyInfo } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useMounted } from '@/hooks/use-mounted';

const initialCompanyInfo: CompanyInfo = {
  name: '',
  address: '',
  cityStateZip: '',
  email: '',
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', { 
    pixQrCode: null, 
    headerImage: null,
    companyInfo: initialCompanyInfo,
    backgroundImage: null,
  });
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);

  const hasMounted = useMounted();

  const qrPlaceholder = PlaceHolderImages.find(p => p.id === 'pix-qr-code')!;
  const headerPlaceholder = PlaceHolderImages.find(p => p.id === 'header-image')!;
  const backgroundPlaceholder = PlaceHolderImages.find(p => p.id === 'background-image')!;

  useEffect(() => {
    if (hasMounted) {
      setQrCodePreview(settings.pixQrCode);
      setHeaderImagePreview(settings.headerImage);
      setBackgroundImagePreview(settings.backgroundImage);
      if (settings.companyInfo) {
        setCompanyInfo(settings.companyInfo);
      }
    }
  }, [settings, hasMounted]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'qr' | 'header' | 'background') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if(type === 'qr'){
            setQrCodePreview(result);
        } else if (type === 'header') {
            setHeaderImagePreview(result);
        } else {
            setBackgroundImagePreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({...prev, [name]: value}));
  }

  const handleSave = () => {
    setSettings({ 
        pixQrCode: qrCodePreview, 
        headerImage: headerImagePreview,
        companyInfo: companyInfo,
        backgroundImage: backgroundImagePreview,
    });
    toast({
      title: 'Configurações Salvas',
      description: 'Suas configurações foram atualizadas com sucesso.',
    });
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Configurações" />

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
              Essa imagem será exibida no fundo de todas as telas.
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
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Estes dados serão exibidos no cabeçalho dos seus orçamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input id="companyName" name="name" value={companyInfo.name ?? ''} onChange={handleCompanyInfoChange} placeholder="Sua Empresa LTDA" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="companyAddress">Endereço</Label>
                    <Input id="companyAddress" name="address" value={companyInfo.address ?? ''} onChange={handleCompanyInfoChange} placeholder="Rua Exemplo, 123, Sala 100" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="companyCity">Cidade, Estado, CEP</Label>
                    <Input id="companyCity" name="cityStateZip" value={companyInfo.cityStateZip ?? ''} onChange={handleCompanyInfoChange} placeholder="Cidade, Estado, 12345-678" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email de Contato</Label>
                    <Input id="companyEmail" name="email" type="email" value={companyInfo.email ?? ''} onChange={handleCompanyInfoChange} placeholder="contato@suaempresa.com" />
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
    </div>
  );
}
