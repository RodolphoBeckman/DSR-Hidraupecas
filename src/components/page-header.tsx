import React from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  className?: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, className, children }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between space-y-2 mb-6',
        className
      )}
    >
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <div className="flex items-center space-x-2">{children}</div>
    </div>
  );
}
