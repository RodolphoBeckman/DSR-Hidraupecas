"use client";

import { Suspense } from 'react';
import PageHeader from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import BudgetForm from './budget-form';

function BudgetSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 lg:col-span-1" />
                <Skeleton className="h-72 lg:col-span-2" />
                <Skeleton className="h-48 lg:col-span-3" />
            </div>
        </div>
    )
}

export default function NewBudgetPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Suspense fallback={<BudgetSkeleton />}>
            <BudgetForm />
        </Suspense>
    </div>
  );
}
