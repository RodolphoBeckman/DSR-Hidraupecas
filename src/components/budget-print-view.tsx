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
  }

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPdf = async () => {
    const element = printAreaRef.current;
    if (element) {
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
          margin:       [0,0,0,0],
          filename:     `orcamento-${budget.id}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    }
  };


  const handleBack = () => {
    router.back();
  };
  
  const companyInfo = settings.companyInfo;
  const subtotal = budget.items.reduce((acc, item) => acc + item.value, 0);

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
            <div className="bg-white text-black font-sans print-area">
            
            <div className="relative h-48 w-full text-white">
                <Image
                    src={settings.headerImage || headerPlaceholder.imageUrl}
                    alt="Cabeçalho do Orçamento"
                    layout="fill"
                    objectFit="cover"
                    className="object-cover"
                    data-ai-hint={headerPlaceholder.imageHint}
                />
                 <div className="absolute inset-0 bg-black/60 flex flex-col justify-between p-10 z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <Logo />
                            {companyInfo && (
                                <div className="text-sm leading-none space-y-0">
                                    <p>{companyInfo.name || 'Sua Empresa'}</p>
                                    <p>{companyInfo.address || 'Rua Exemplo, 123, Sala 100'}</p>
                                    <p>{companyInfo.cityStateZip || 'Cidade, Estado, 12345-678'}</p>
                                    <p>{companyInfo.email || 'contato@suaempresa.com'}</p>
                                </div>
                            )}
                        </div>
                         <div>
                            <h1 className="text-4xl font-bold text-white mb-2 text-right">ORÇAMENTO</h1>
                            <p className="font-semibold text-lg text-right"># {budget.id}</p>
                            <p className="text-right">Data: {new Date(budget.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-10">
                <header className="flex justify-between items-start pb-6 mb-8">
                    <section>
                        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Cobrança para</h2>
                        <div className="text-neutral-800">
                        <p className="font-bold">{budget.client.name}</p>
                        <p>{budget.client.email}</p>
                        <p>{budget.client.phone}</p>
                        </div>
                    </section>
                </header>
                
                <section className="mb-8">
                    <table className="w-full text-left">
                    <thead>
                        <tr className="bg-neutral-100">
                        <th className="p-3 font-semibold text-neutral-700">Descrição do Serviço</th>
                        <th className="p-3 font-semibold text-neutral-700 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budget.items.map(item => (
                        <tr key={item.id} className="border-b border-neutral-100">
                            <td className="p-3">{item.description}</td>
                            <td className="p-3 text-right">{formatCurrency(item.value)}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </section>
                
                <section className="flex justify-end mb-8">
                    <div className="w-full md:w-1/3 space-y-2">
                        <div className="flex justify-between py-2 border-b">
                            <span className="font-medium text-neutral-600">Subtotal</span>
                            <span className="text-neutral-800">{formatCurrency(subtotal)}</span>
                        </div>
                         {budget.discount && budget.discount > 0 && (
                             <div className="flex justify-between py-2 border-b text-red-600">
                                <span className="font-medium">Desconto</span>
                                <span>- {formatCurrency(budget.discount)}</span>
                            </div>
                        )}
                        {budget.installmentsCount && budget.installmentsCount > 1 ? (
                            <div className="flex justify-between py-2 border-b">
                                <span className="font-medium text-neutral-600">{budget.installmentsCount}x</span>
                                <span className="text-neutral-800">{formatCurrency(budget.total / budget.installmentsCount)}</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between py-3 bg-primary text-primary-foreground font-bold text-xl p-3 rounded-md">
                            <span>Total</span>
                            <span>{formatCurrency(budget.total)}</span>
                        </div>
                    </div>
                </section>

                <footer className="border-t-2 border-neutral-200 pt-6 mt-8">
                    <div className="flex justify-between items-start">
                        <div className="text-sm text-neutral-600 max-w-md">
                            {budget.paymentPlan && (
                                <>
                                    <h3 className="font-bold text-neutral-800 mb-2">Plano de Pagamento: {budget.paymentPlan.name}</h3>
                                    <p className="mb-4">{budget.paymentPlan.description}</p>
                                    {budget.installmentsCount && budget.installmentsCount > 1 && (
                                        <p className="mb-4">Pagamento em {budget.installmentsCount} parcelas de {formatCurrency(budget.total/budget.installmentsCount)}.</p>
                                    )}
                                </>
                            )}
                            <h3 className="font-bold text-neutral-800 mb-2">Instruções de Pagamento</h3>
                            <p>Por favor, realize o pagamento via PIX utilizando o QR code.</p>
                            <p className="mt-4">Obrigado pela sua preferência!</p>
                            <p className="font-semibold mt-2">Vendedor: {budget.salesperson.name}</p>
                        </div>
                        {settings.pixQrCode && (
                            <div className="text-center">
                                <p className="font-semibold mb-2">Escanear para Pagar com PIX</p>
                                <Image
                                    src={settings.pixQrCode || qrPlaceholder.imageUrl}
                                    alt="QR Code do PIX"
                                    width={128}
                                    height={128}
                                    className="object-contain"
                                    data-ai-hint={qrPlaceholder.imageHint}
                                />
                            </div>
                        )}
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
