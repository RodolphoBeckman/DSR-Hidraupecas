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
     <div className="bg-white text-black p-8">
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
            }
            }
        `}</style>
        
        <div className="print-container w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg p-10">
            {/* Cabeçalho */}
            <header className="flex justify-between items-start mb-8 border-b pb-4">
                <div className="flex-1">
                    {settings.headerImage ? (
                        <Image src={settings.headerImage} alt="Logo da Empresa" width={250} height={100} className="object-contain" />
                    ) : (
                         <div className="w-[250px] h-[100px] bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">Logo da Empresa</span>
                         </div>
                    )}
                </div>
                <div className="text-right text-sm">
                    <h1 className="font-bold text-lg">{settings.companyInfo?.name || 'Nome da Empresa'}</h1>
                    <p>{settings.companyInfo?.address || 'Endereço da Empresa'}</p>
                    <p>{settings.companyInfo?.cityStateZip || 'Cidade, Estado, CEP'}</p>
                    <p>{settings.companyInfo?.email || 'email@empresa.com'}</p>
                </div>
            </header>

            {/* Informações do Orçamento */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">ORÇAMENTO</h2>
                    <div className="text-right">
                        <p><span className="font-bold">Nº:</span> {budget.id}</p>
                        <p><span className="font-bold">Data:</span> {formatDate(budget.createdAt)}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="border p-3 rounded">
                        <h3 className="font-bold mb-2">CLIENTE:</h3>
                        <p>{budget.client.name}</p>
                        <p>{budget.client.phone}</p>
                        <p>{budget.client.email}</p>
                        <p>{budget.client.address}</p>
                    </div>
                     <div className="border p-3 rounded">
                        <h3 className="font-bold mb-2">VENDEDOR:</h3>
                        <p>{budget.salesperson.name}</p>
                        <p>WhatsApp: {budget.salesperson.whatsapp}</p>
                    </div>
                </div>
            </section>

            {/* Itens do Serviço */}
            <section className="mb-8">
                <h3 className="text-lg font-bold mb-2 border-b pb-2">SERVIÇOS</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 font-bold">DESCRIÇÃO</th>
                            {budget.budgetType === 'items' && <th className="text-right py-2 font-bold">VALOR</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {budget.items.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="py-2 pr-2 whitespace-pre-wrap">{item.description}</td>
                                {budget.budgetType === 'items' && <td className="text-right py-2">{formatCurrency(item.value)}</td>}
                            </tr>
                        ))}
                         {budget.budgetType === 'group' && (
                             <tr>
                                <td className="py-2 italic text-gray-600" colSpan={1}>
                                    Valor total referente ao grupo de serviços descritos acima.
                                </td>
                            </tr>
                         )}
                    </tbody>
                </table>
            </section>
            
             {/* Observações */}
            {budget.observation && (
                 <section className="mb-8 p-3 bg-gray-50 rounded text-sm">
                    <h3 className="font-bold mb-2">OBSERVAÇÕES:</h3>
                    <p className="whitespace-pre-wrap">{budget.observation}</p>
                </section>
            )}

            {/* Totais */}
            <section className="flex justify-end mb-8">
                <div className="w-1/2 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    {budget.discount && budget.discount > 0 && (
                        <div className="flex justify-between">
                            <span>Desconto:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(budget.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(budget.total)}</span>
                    </div>
                </div>
            </section>

            {/* Condições de Pagamento e PIX */}
            <footer className="grid grid-cols-2 gap-8 pt-8 border-t text-sm">
                 <div>
                    {budget.paymentPlan && (
                        <>
                            <h3 className="font-bold mb-2">CONDIÇÕES DE PAGAMENTO:</h3>
                            <p className="font-medium">{budget.paymentPlan.name}</p>
                            <p className="whitespace-pre-wrap text-xs text-gray-600">{budget.paymentPlan.description}</p>
                            {budget.installmentsCount && budget.installmentsCount > 1 && (
                                <p className="mt-2">
                                    {budget.installmentsCount}x de {formatCurrency(budget.total / budget.installmentsCount)}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {settings.pixQrCode && (
                    <div className="flex flex-col items-center justify-center">
                        <h3 className="font-bold mb-2">Pague com PIX</h3>
                        <Image src={settings.pixQrCode} alt="QR Code PIX" width={120} height={120} />
                    </div>
                )}
            </footer>

        </div>
     </div>
  );
};
