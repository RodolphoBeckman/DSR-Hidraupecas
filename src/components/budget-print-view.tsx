"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import type { Budget, AppSettings } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

interface BudgetPrintViewProps {
  budget: Budget;
  settings: AppSettings;
}

export const BudgetPrintView = ({ budget, settings }: BudgetPrintViewProps) => {
  const router = useRouter();
  const printAreaRef = useRef<HTMLDivElement>(null);
  const qrPlaceholder = PlaceHolderImages.find(p => p.id === 'pix-qr-code')!;
  const headerPlaceholder = PlaceHolderImages.find(p => p.id === 'header-image')!;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPdf = async () => {
    const element = printAreaRef.current;
    if (element) {
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
          margin:       0,
          filename:     `orcamento-${budget.id}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { useCORS: true, scale: 2 },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    }
  };

  const handleBack = () => {
    router.back();
  };
  
  const companyInfo = settings.companyInfo;
  const subtotal = budget.budgetType === 'group'
    ? budget.total + (budget.discount || 0)
    : budget.items.reduce((acc, item) => acc + (item.value || 0), 0);

  return (
    <div className="bg-gray-100 min-h-screen">
      <style jsx global>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          .no-print { 
            display: none !important; 
          }
           .print-area {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
        @page {
          size: a4;
          margin: 0;
        }
      `}</style>
      
      <div className="no-print bg-background/80 backdrop-blur-lg border-b border-border p-4 sticky top-0 z-50 flex justify-end items-center gap-2">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
         <Button onClick={handleDownloadPdf} variant="default">
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
        <Button onClick={handleBack} variant="secondary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      <div className="print-container p-4 sm:p-8">
        <div ref={printAreaRef} className="max-w-4xl mx-auto shadow-lg">
            <div className="bg-white text-black font-sans print-area text-[9px] p-2">
            
            <div className="relative h-16 w-full text-white">
                <Image
                    src={settings.headerImage || headerPlaceholder.imageUrl}
                    alt="Cabeçalho do Orçamento"
                    fill
                    className="object-cover"
                    data-ai-hint={headerPlaceholder.imageHint}
                />
                 <div className="absolute inset-0 bg-black/60 flex flex-col justify-between p-1 z-10">
                    <div className="flex justify-between items-start gap-2">
                        <div style={{ flexShrink: 0 }}>
                            <Logo variant="white" />
                            {companyInfo && (
                                <div className="text-[7px] leading-tight space-y-0 mt-0.5">
                                    <p>{companyInfo.name || 'Sua Empresa'}</p>
                                    <p>{companyInfo.address || 'Rua Exemplo, 123, Sala 100'}</p>
                                    <p>{companyInfo.cityStateZip || 'Cidade, Estado, 12345-678'}</p>
                                    <p>{companyInfo.email || 'contato@suaempresa.com'}</p>
                                </div>
                            )}
                        </div>
                         <div className="text-right flex-shrink-0">
                            <h1 className="text-lg font-bold text-white mb-0">ORÇAMENTO</h1>
                            <p className="font-semibold text-xs"># {budget.id}</p>
                            <p className="text-[8px]">Data: {new Date(budget.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-1">
                <header className="pb-1 mb-1">
                    <section>
                        <h2 className="text-[7px] font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">Orçamento para</h2>
                        <div className="text-neutral-800 text-[8px] leading-tight">
                            <p className="font-bold text-[9px]">{budget.client.name}</p>
                            <p>{budget.client.email}</p>
                            <p>{budget.client.phone}</p>
                            <p>{budget.client.address}</p>
                        </div>
                    </section>
                </header>
                
                <section className="mb-1">
                    <table className="w-full text-left text-[8px]">
                    <thead>
                        <tr className="bg-neutral-100">
                        <th className="p-0.5 font-semibold text-neutral-700">Descrição do Serviço</th>
                        {budget.budgetType === 'items' && (
                          <th className="p-0.5 font-semibold text-neutral-700 text-right w-[80px]">Valor</th>
                        )}
                        </tr>
                    </thead>
                    <tbody>
                        {budget.items.map(item => (
                        <tr key={item.id} className="border-b border-neutral-100">
                            <td className="p-0.5 whitespace-pre-wrap">{item.description}</td>
                            {budget.budgetType === 'items' && item.value && (
                                <td className="p-0.5 text-right">{formatCurrency(item.value)}</td>
                            )}
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </section>
                
                {budget.observation && (
                  <section className="mb-1">
                    <h3 className="text-[7px] font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">Observações</h3>
                    <div className="text-neutral-700 text-[8px] whitespace-pre-wrap p-1 bg-neutral-50 rounded-sm">{budget.observation}</div>
                  </section>
                )}

                <section className="flex justify-between items-start mb-1 gap-2">
                    <div className="w-2/3 space-y-0 text-[9px]">
                        <div className="flex justify-between py-0.5 border-b">
                          <span className="font-medium text-neutral-600">Subtotal</span>
                          <span className="text-neutral-800">{formatCurrency(subtotal)}</span>
                        </div>
                        {budget.discount && budget.discount > 0 && (
                             <div className="flex justify-between py-0.5 border-b text-red-600">
                                <span className="font-medium">Desconto</span>
                                <span>- {formatCurrency(budget.discount)}</span>
                            </div>
                        )}
                        {budget.installmentsCount && budget.installmentsCount > 1 && (
                            <div className="flex justify-between py-0.5 border-b">
                                <span className="font-medium text-neutral-600">{budget.installmentsCount}x</span>
                                <span className="text-neutral-800">{formatCurrency(budget.total / budget.installmentsCount)}</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between py-1 bg-primary text-primary-foreground font-bold text-[10px] p-1.5 rounded-md mt-1">
                            <span>Total</span>
                            <span>{formatCurrency(budget.total)}</span>
                        </div>
                    </div>
                     {settings.pixQrCode && (
                        <div className="w-1/3 text-center flex flex-col items-center justify-center">
                            <p className="font-semibold mb-0.5 text-[8px]">Escanear para Pagar com PIX</p>
                            <Image
                                src={settings.pixQrCode || qrPlaceholder.imageUrl}
                                alt="QR Code do PIX"
                                width={60}
                                height={60}
                                className="object-contain"
                                data-ai-hint={qrPlaceholder.imageHint}
                            />
                        </div>
                    )}
                </section>

                <footer className="border-t-2 border-neutral-200 pt-1 mt-1">
                  <div className="flex justify-between gap-2 text-[8px] text-neutral-600">
                      {budget.paymentPlan && (
                        <div className="w-1/2">
                          <h3 className="font-bold text-neutral-800 mb-0.5 text-[9px]">Plano de Pagamento: {budget.paymentPlan.name}</h3>
                          <p className="whitespace-pre-wrap">{budget.paymentPlan.description}</p>
                          {budget.installmentsCount && budget.installmentsCount > 1 && (
                              <p>Pagamento em {budget.installmentsCount} parcelas de {formatCurrency(budget.total/budget.installmentsCount)}.</p>
                          )}
                        </div>
                      )}
                      <div className="w-1/2">
                        <h3 className="font-bold text-neutral-800 mb-0.5 text-[9px]">Instruções de Pagamento</h3>
                        <p>Por favor, realize o pagamento via PIX utilizando o QR code.</p>
                        <p className="mt-0.5">Obrigado pela sua preferência!</p>
                        <p className="font-semibold mt-0.5">Vendedor: {budget.salesperson.name}</p>
                      </div>
                  </div>
                </footer>
            </div>
            </div>
        </div>

       <div className="no-print mt-8 text-center text-muted-foreground text-sm pb-8">
        <p>Você pode imprimir esta página ou salvá-la como PDF.</p>
        <p>Esta mensagem não aparecerá no documento impresso.</p>
      </div>
      </div>
    </div>
  );
};
