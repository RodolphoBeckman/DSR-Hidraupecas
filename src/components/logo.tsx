import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'white';
}

export const Logo = ({ variant = 'default' }: LogoProps) => (
  <Link href="/" className="group flex items-center gap-2 p-2" aria-label="DSR HIDRAUPEÇAS Logo">
    <div className="relative h-8 w-8 transform-gpu transition-transform duration-500 group-hover:scale-110">
      <Image 
        src="/Logo.png" 
        alt="DSR HIDRAUPEÇAS Logo" 
        width={32} 
        height={32} 
        className="transition-all duration-300 group-hover:drop-shadow-[0_0_4px_hsl(var(--primary))]"
      />
    </div>
    <span className={cn(
        "logo-text text-lg font-headline font-bold transition-opacity duration-200",
        variant === 'white' && 'text-white'
    )}>
      DSR HIDRAUPEÇAS
    </span>
  </Link>
);
