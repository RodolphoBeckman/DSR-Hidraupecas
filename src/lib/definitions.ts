export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type Salesperson = {
  id: string;
  name: string;
  whatsapp: string;
};

export type PaymentPlan = {
  id: string;
  name: string;
  description: string;
  installments?: number;
};

export type ServiceItem = {
  id: string;
  description: string;
  value: number;
};

export type Budget = {
  id: string;
  client: Client;
  salesperson: Salesperson;
  items: ServiceItem[];
  paymentPlan?: PaymentPlan;
  installmentsCount?: number;
  total: number;
  createdAt: string;
};

export type AppSettings = {
  pixQrCode: string | null;
};
