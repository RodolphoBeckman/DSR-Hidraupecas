
export type Client = {
  id: string;
  type: 'pessoa_fisica' | 'pessoa_juridica';
  name: string; // Razão Social para PJ, Nome completo para PF
  tradeName?: string; // Nome Fantasia, opcional
  cpfCnpj: string; // CPF ou CNPJ
  ieRg?: string; // Inscrição Estadual ou RG
  phone: string;
  email: string;
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  observations?: string;
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
  quantity: number;
  unitPrice: number;
  value: number; // total for the item (quantity * unitPrice)
};

export type Budget = {
  id: string;
  client: Client;
  salesperson: Salesperson;
  items: ServiceItem[];
  budgetType: 'items' | 'group';
  groupUnitPrice?: number;
  groupQuantity?: number;
  observation?: string;
  paymentPlan?: PaymentPlan;
  installmentsCount?: number;
  discount?: number;
  total: number;
  createdAt: string;
  status: 'pendente' | 'realizado';
};

export type CompanyInfo = {
  name: string | null;
  cnpj: string | null;
  address: string | null;
  cityStateZip: string | null;
  email: string | null;
};

export type UserInfo = {
  name: string | null;
  email: string | null;
  avatar: string | null;
};

export type AppSettings = {
  pixQrCode: string | null;
  headerImage: string | null;
  companyInfo: CompanyInfo | null;
  backgroundImage: string | null;
  userInfo: UserInfo | null;
};
