
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

  const subtotal = budget.budgetType === 'group' 
    ? budget.total + (budget.discount || 0)
    : budget.items.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
     <div className="bg-white text-black">
        {/* Estilos para impressão */}
        <style jsx global>{`
            @media print {
              body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
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
        
        <div className="print-container w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg p-8 font-sans text-xs">
            {/* Cabeçalho */}
            <header className="flex justify-between items-start mb-6">
                <div className="w-1/3">
                    {settings.headerImage ? (
                        <Image src={settings.headerImage} alt="Logo da Empresa" width={150} height={60} className="object-contain" />
                    ) : (
                         <div className="w-[150px] h-[60px] bg-gray-200 flex items-center justify-center text-gray-500">
                            Logo
                         </div>
                    )}
                </div>
                <div className="w-2/3 text-right">
                    <h1 className="font-bold text-base uppercase">{settings.companyInfo?.name || 'Nome da Empresa'}</h1>
                    <p>{settings.companyInfo?.address || 'Endereço da Empresa'}</p>
                    <p>{settings.companyInfo?.cityStateZip || 'Cidade, Estado, CEP'}</p>
                    <p>{settings.companyInfo?.email || 'email@empresa.com'}</p>
                </div>
            </header>

            {/* Informações do Orçamento */}
            <section className="mb-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">ORÇAMENTO</h2>
                    <div className="text-right">
                        <p><span className="font-bold">Nº:</span> {budget.id}</p>
                        <p><span className="font-bold">Data:</span> {formatDate(budget.createdAt)}</p>
                    </div>
                </div>
            </section>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border p-3 rounded-md">
                    <h3 className="font-bold mb-1">CLIENTE:</h3>
                    <p className="font-semibold">{budget.client.name}</p>
                    <p>{budget.client.phone}</p>
                    {budget.client.email && <p>{budget.client.email}</p>}
                    {budget.client.address && <p>{budget.client.address}</p>}
                </div>
                 <div className="border p-3 rounded-md">
                    <h3 className="font-bold mb-1">VENDEDOR:</h3>
                    <p>{budget.salesperson.name}</p>
                    <p>WhatsApp: {budget.salesperson.whatsapp}</p>
                </div>
            </div>

            {/* Itens do Serviço */}
            <section className="mb-4">
                <h3 className="text-sm font-bold mb-2 border-b pb-1">SERVIÇOS</h3>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left py-1 font-bold uppercase">DESCRIÇÃO</th>
                            {budget.budgetType === 'items' && <th className="text-right py-1 font-bold uppercase w-32">VALOR</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {budget.items.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="py-1.5 pr-2 whitespace-pre-wrap align-top">{item.description}</td>
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

            <div className="border-t-2 border-black pt-4 mt-auto">
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
            </div>
        </div>
     </div>
  );
};

    