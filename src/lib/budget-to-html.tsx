import ReactDOMServer from 'react-dom/server';
import { BudgetPrintView } from '@/components/budget-print-view';
import type { Budget } from './definitions';

export const budgetToHtml = (budget: Budget): string => {
  // We need to render the component to a string to pass it to the editor
  // This is a temporary solution until we can pass the budget object directly
  // to the editor component and have it render the preview.
  const budgetHtml = ReactDOMServer.renderToString(
    <BudgetPrintView budget={budget} />
  );
  return budgetHtml;
};
