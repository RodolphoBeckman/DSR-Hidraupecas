import * as React from 'react';
import Image from 'next/image';

export const Logo = () => (
  <div className="flex items-center gap-2 p-2 group" aria-label="DSR Orçamento Logo">
    <div className="relative w-8 h-8 transform-gpu transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110">
      <Image 
        src="/Logo.png" 
        alt="DSR Orçamento Logo" 
        width={32} 
        height={32} 
        className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary))]"
      />
    </div>
    <span className="text-lg font-headline font-bold group-data-[collapsible=icon]:hidden transition-opacity duration-300">
      DSR Orçamento
    </span>
  </div>
);
