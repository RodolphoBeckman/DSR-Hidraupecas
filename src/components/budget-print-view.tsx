
"use client";

import React from 'react';
import Image from 'next/image';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMounted } from '@/hooks/use-mounted';
import type { AppSettings, Budget, CompanyInfo, UserInfo } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { format } from 'date-fns';

const initialCompanyInfo: CompanyInfo = {
  name: '',
  cnpj: '',
  address: '',
  cityStateZip: '',
  email: '',
}

const initialUserInfo: UserInfo = {
    name: 'Usuário',
    email: 'usuario@exemplo.com',
    avatar: null,
}

const initialSettings: AppSettings = {
    pixQrCode: null,
    headerImage: null,
    companyInfo: initialCompanyInfo,
    backgroundImage: null,
    userInfo: initialUserInfo,
}

type BudgetPrintViewProps = {
  budget: Budget;
};

export const BudgetPrintView = ({ budget }: BudgetPrintViewProps) => {
  const [settings] = useLocalStorage<AppSettings>('app-settings', initialSettings);
  const hasMounted = useMounted();

  const qrPlaceholder = PlaceHolderImages.find(p => p.id === 'pix-qr-code')!;
  const headerPlaceholder = PlaceHolderImages.find(p => p.id === 'header-image')!;

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando visualização...</p>
      </div>
    );
  }
  
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString: string) => {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm");
  }

  const formatAddress = (address: Budget['client']['address']) => {
    if (!address) return 'Endereço não informado';
    const parts = [
      address.street,
      address.number,
      address.neighborhood,
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean);
    return parts.join(', ');
  }

  const subtotal = budget.budgetType === 'group' 
    ? budget.total + (budget.discount || 0)
    : budget.items.reduce((sum, item) => sum + item.value, 0);

  return (
     <div className="bg-white text-black">
        {/* Estilos para impressão */}
        <style jsx global>{`
            @media print {
              body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
              }
              .no-print {
                  display: none;
              }
              .print-container {
                  width: 100%;
                  margin: 0;
                  padding: 0;
                  box-shadow: none;
                  border: none;
              }
            }
        `}</style>
        
        <div className="print-container w-[210mm] mx-auto bg-white shadow-lg font-sans text-xs">
            {/* Cabeçalho */}
            <header className="relative w-full h-[120px] mb-8">
              <div className="absolute inset-0">
                <Image 
                  src={settings.headerImage || headerPlaceholder.imageUrl} 
                  alt="Cabeçalho do Orçamento" 
                  fill={true} 
                  objectFit="cover"
                  className="object-center"
                />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 flex h-full items-center justify-between p-4 text-white">
                <div className="space-y-0.5">
                  <h1 className="text-xl font-bold uppercase">{settings.companyInfo?.name || 'Nome da Empresa'}</h1>
                  {settings.companyInfo?.cnpj && <p className="text-xs">CNPJ: {settings.companyInfo.cnpj}</p>}
                  <p className="text-xs">{settings.companyInfo?.address || 'Endereço'}</p>
                  <p className="text-xs">{settings.companyInfo?.cityStateZip || 'Cidade, Estado, CEP'}</p>
                  <p className="text-xs">{settings.companyInfo?.email || 'email@empresa.com'}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <h2 className="text-lg font-bold">ORÇAMENTO</h2>
                  <p className="text-xs"><span className="font-bold">Nº:</span> {budget.id}</p>
                  <p className="text-xs"><span className="font-bold">Data:</span> {formatDate(budget.createdAt)}</p>
                </div>
              </div>
            </header>

            {/* Informações do Cliente e Vendedor */}
            <section className="px-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border p-3 rounded-md">
                        <h3 className="font-bold mb-1 uppercase">Cliente:</h3>
                        <p className="font-semibold">{budget.client.name}</p>
                        {budget.client.tradeName && <p className="text-sm">{budget.client.tradeName}</p>}
                        <p>{budget.client.type === 'pessoa_juridica' ? 'CNPJ' : 'CPF'}: {budget.client.cpfCnpj}</p>
                        {budget.client.ieRg && <p>{budget.client.type === 'pessoa_juridica' ? 'IE' : 'RG'}: {budget.client.ieRg}</p>}
                        <p>Tel: {budget.client.phone}</p>
                        {budget.client.email && <p>Email: {budget.client.email}</p>}
                        {budget.client.address && <p>End: {formatAddress(budget.client.address)}</p>}
                    </div>
                    <div className="border p-3 rounded-md">
                        <h3 className="font-bold mb-1 uppercase">Vendedor:</h3>
                        <p>{budget.salesperson.name}</p>
                        <p>WhatsApp: {budget.salesperson.whatsapp}</p>
                    </div>
                </div>
            </section>

            {/* Corpo do Orçamento */}
            <div className="flex-grow px-8">
                {/* Itens do Serviço */}
                <section className="mb-4">
                    <h3 className="text-sm font-bold mb-2 border-b pb-1">SERVIÇOS</h3>
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-1 font-bold uppercase">DESCRIÇÃO</th>
                                {budget.budgetType === 'items' && <th className="text-center py-1 font-bold uppercase w-20">QTD.</th>}
                                {budget.budgetType === 'items' && <th className="text-right py-1 font-bold uppercase w-32">VLR. UNIT.</th>}
                                {budget.budgetType === 'items' && <th className="text-right py-1 font-bold uppercase w-32">VLR. TOTAL</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {budget.items.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-1.5 pr-2 whitespace-pre-wrap align-top">{item.description}</td>
                                     {budget.budgetType === 'items' && <td className="text-center py-1.5 align-top">{item.quantity}</td>}
                                     {budget.budgetType === 'items' && <td className="text-right py-1.5 align-top">{formatCurrency(item.unitPrice)}</td>}
                                     {budget.budgetType === 'items' && <td className="text-right py-1.5 align-top">{formatCurrency(item.value)}</td>}
                                </tr>
                            ))}
                            {budget.budgetType === 'group' && (
                                <tr>
                                    <td className="pt-2 italic text-gray-500" colSpan={1}>
                                        Valor total referente ao grupo de serviços descritos acima.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
                
                {/* Observações */}
                {budget.observation && (
                    <section className="mb-4 text-xs">
                        <h3 className="font-bold">OBSERVAÇÕES:</h3>
                        <p className="whitespace-pre-wrap">{budget.observation}</p>
                    </section>
                )}
                
                {/* Totais */}
                <div className="flex justify-end mb-6">
                    <div className="w-2/5 space-y-1">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {budget.discount && budget.discount > 0 && (
                            <div className="flex justify-between">
                                <span>Desconto:</span>
                                <span className="text-red-600">-{formatCurrency(budget.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold border-t pt-1 mt-1">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(budget.total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rodapé */}
            <footer className="border-t-2 border-black pt-4 mt-auto px-8 pb-8">
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    {budget.paymentPlan && (
                        <>
                            <h3 className="font-bold mb-2 uppercase">Condições de Pagamento:</h3>
                            <p className="font-semibold">{budget.paymentPlan.name}</p>
                            {budget.paymentPlan.description && <p className="whitespace-pre-wrap text-gray-600">{budget.paymentPlan.description}</p>}
                            {budget.installmentsCount && budget.installmentsCount > 1 && (
                                <p className="mt-1">
                                    {budget.installmentsCount}x de {formatCurrency(budget.total / budget.installmentsCount)}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {settings.pixQrCode && (
                    <div className="flex flex-col items-center">
                        <h3 className="font-bold mb-2">Pague com PIX</h3>
                        <Image src={settings.pixQrCode} alt="QR Code PIX" width={100} height={100} />
                    </div>
                )}
              </div>
            </footer>
        </div>
     </div>
  );
};
