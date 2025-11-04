import React from 'react';
import Image from 'next/image';
import type { Budget, AppSettings } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';

interface BudgetPrintViewProps {
  budget: Budget;
  settings: AppSettings;
}

export const BudgetPrintView = ({ budget, settings }: BudgetPrintViewProps) => {
  const qrPlaceholder = PlaceHolderImages.find(p => p.id === 'pix-qr-code')!;

  return (
    <div className="bg-white text-black font-sans p-10 print:p-0">
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>
      <header className="flex justify-between items-start border-b-2 border-neutral-200 pb-6 mb-8">
        <div>
          <Logo />
          <div className="mt-4 text-sm text-neutral-600">
            <p>Your Company Name</p>
            <p>123 Business Rd, Suite 100</p>
            <p>City, State, 12345</p>
            <p>contact@yourcompany.com</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold text-neutral-800">BUDGET</h1>
          <p className="text-neutral-600 mt-2"># {budget.id}</p>
          <p className="text-neutral-600">Date: {new Date(budget.createdAt).toLocaleDateString()}</p>
        </div>
      </header>
      
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Billed To</h2>
        <div className="text-neutral-800">
          <p className="font-bold">{budget.client.name}</p>
          <p>{budget.client.email}</p>
          <p>{budget.client.phone}</p>
        </div>
      </section>

      <section className="mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-100">
              <th className="p-3 font-semibold text-neutral-700">Service Description</th>
              <th className="p-3 font-semibold text-neutral-700 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {budget.items.map(item => (
              <tr key={item.id} className="border-b border-neutral-100">
                <td className="p-3">{item.description}</td>
                <td className="p-3 text-right">${item.value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      <section className="flex justify-end mb-8">
        <div className="w-full md:w-1/3">
            <div className="flex justify-between py-2 border-b">
                <span className="font-medium text-neutral-600">Subtotal</span>
                <span className="text-neutral-800">${budget.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 bg-primary text-primary-foreground font-bold text-xl p-3 rounded-md">
                <span>Total</span>
                <span>${budget.total.toFixed(2)}</span>
            </div>
        </div>
      </section>

      <footer className="border-t-2 border-neutral-200 pt-6 mt-8">
        <div className="flex justify-between items-start">
            <div className="text-sm text-neutral-600 max-w-md">
                {budget.paymentPlan && (
                    <>
                        <h3 className="font-bold text-neutral-800 mb-2">Payment Plan: {budget.paymentPlan.name}</h3>
                        <p className="mb-4">{budget.paymentPlan.description}</p>
                    </>
                )}
                <h3 className="font-bold text-neutral-800 mb-2">Payment Instructions</h3>
                <p>Please make the payment via PIX using the QR code.</p>
                <p className="mt-4">Thank you for your business!</p>
                <p className="font-semibold mt-2">Salesperson: {budget.salesperson.name}</p>
            </div>
            {settings.pixQrCode && (
                <div className="text-center">
                    <p className="font-semibold mb-2">Scan to Pay with PIX</p>
                    <Image
                        src={settings.pixQrCode || qrPlaceholder.imageUrl}
                        alt="PIX QR Code"
                        width={128}
                        height={128}
                        className="object-contain"
                        data-ai-hint={qrPlaceholder.imageHint}
                    />
                </div>
            )}
        </div>
      </footer>
       <div className="no-print mt-8 text-center text-muted-foreground text-sm">
        <p>You can now print this page or save it as a PDF.</p>
        <p>This message will not appear on the printed document.</p>
      </div>
    </div>
  );
};
