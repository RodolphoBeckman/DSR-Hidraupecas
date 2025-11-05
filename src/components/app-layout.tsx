"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMounted } from '@/hooks/use-mounted';
import type { AppSettings } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/logo';
import { Button } from './ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [settings] = useLocalStorage<AppSettings>('app-settings', { 
    backgroundImage: null,
    pixQrCode: null,
    headerImage: null,
    companyInfo: null
  });
  const hasMounted = useMounted();
  
  const backgroundPlaceholder = PlaceHolderImages.find(p => p.id === 'background-image')!;
  const finalBgImage = settings.backgroundImage || backgroundPlaceholder.imageUrl;

  return (
    <div className="relative min-h-screen w-full">
      {hasMounted && finalBgImage && (
        <>
            <div className="fixed inset-0 z-0">
                <Image
                src={finalBgImage}
                alt="Background"
                fill={true}
                objectFit="cover"
                quality={100}
                className="opacity-50"
                />
                <div className="absolute inset-0 bg-background/90"></div>
            </div>
        </>
      )}

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 w-full border-b bg-background/60 backdrop-blur-lg">
           <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo />
            <div className="flex flex-1 items-center justify-end space-x-4">
              <nav className="flex items-center space-x-1">
                <Link href="/">
                  <Button variant="ghost">
                    <Home className="h-4 w-4 mr-2" /> Início
                  </Button>
                </Link>
                 <UserNav />
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
