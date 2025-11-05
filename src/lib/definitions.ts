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
  discount?: number;
  total: number;
  createdAt: string;
};

export type CompanyInfo = {
  name: string | null;
  address: string | null;
  cityStateZip: string | null;
  email: string | null;
};

export type AppSettings = {
  pixQrCode: string | null;
  headerImage: string | null;
  companyInfo: CompanyInfo | null;
};
