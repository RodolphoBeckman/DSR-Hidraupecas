import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';

type PageHeaderProps = {
  title: string;
  className?: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, className, children }: PageHeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div
      className={cn(
        'flex items-center justify-between space-y-2 mb-6',
        className
      )}
    >
        <div className="flex items-center gap-4">
            {!isHomePage && (
                 <Link href="/" legacyBehavior>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                </Link>
            )}
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>

      <div className="flex items-center space-x-2">{children}</div>
    </div>
  );
}
