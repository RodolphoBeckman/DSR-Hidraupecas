import * as React from 'react';
import Image from 'next/image';

export const Logo = () => (
  <div className="flex items-center gap-2 p-2" aria-label="DSR Orçamento Logo">
    <div className="relative w-8 h-8">
      <Image 
        src="/Logo.png" 
        alt="DSR Orçamento Logo" 
        width={32} 
        height={32} 
      />
    </div>
    <span className="text-lg font-headline font-bold">
      DSR Orçamento
    </span>
  </div>
);
