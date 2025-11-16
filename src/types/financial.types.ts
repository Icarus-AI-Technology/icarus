// =====================================================
// ICARUS v5.0 - Financial Module Types
// =====================================================

export type AccountType = 'receivable' | 'payable'
export type AccountStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial'
export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'boleto'
  | 'check'

export type BankAccountType = 'checking' | 'savings' | 'investment'
export type BankAccountStatus = 'active' | 'inactive' | 'closed'

export type CashFlowType = 'income' | 'expense'

// =====================================================
// Financial Account
// =====================================================

export interface FinancialAccount {
  id: string
  company_id: string

  // Type & Category
  type: AccountType
  category: string
  description: string

  // Financial Data
  amount: number
  paid_amount: number
  discount: number
  interest: number
  final_amount: number

  // Dates
  issue_date: string
  due_date: string
  payment_date: string | null

  // Status
  status: AccountStatus

  // Relations
  related_invoice_id: string | null
  related_surgery_id: string | null

  // Payment Info
  payment_method: PaymentMethod | null
  bank_account_id: string | null

  // Additional Info
  notes: string | null
  attachments: any[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface FinancialAccountFormData {
  type: AccountType
  category: string
  description: string
  amount: number
  discount?: number
  interest?: number
  issue_date: string
  due_date: string
  payment_date?: string | null
  status?: AccountStatus
  payment_method?: PaymentMethod | null
  bank_account_id?: string | null
  notes?: string | null
}

export interface FinancialAccountFilters {
  type?: AccountType
  status?: AccountStatus
  category?: string
  startDate?: string
  endDate?: string
  search?: string
}

// =====================================================
// Bank Account
// =====================================================

export interface BankAccount {
  id: string
  company_id: string

  // Bank Info
  bank_name: string
  bank_code: string | null
  agency: string
  account_number: string
  account_type: BankAccountType | null

  // Balance
  initial_balance: number
  current_balance: number

  // Status
  status: BankAccountStatus
  is_main: boolean

  // Additional Info
  notes: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface BankAccountFormData {
  bank_name: string
  bank_code?: string
  agency: string
  account_number: string
  account_type: BankAccountType
  initial_balance: number
  is_main?: boolean
  notes?: string
}

// =====================================================
// Cash Flow Entry
// =====================================================

export interface CashFlowEntry {
  id: string
  company_id: string
  bank_account_id: string | null

  // Type & Category
  type: CashFlowType
  category: string
  description: string

  // Financial Data
  amount: number

  // Date
  entry_date: string

  // Relations
  financial_account_id: string | null

  // Payment Info
  payment_method: PaymentMethod | null

  // Additional Info
  notes: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface CashFlowFormData {
  type: CashFlowType
  category: string
  description: string
  amount: number
  entry_date: string
  bank_account_id?: string | null
  payment_method?: PaymentMethod | null
  notes?: string | null
}

// =====================================================
// Summary / KPI Types
// =====================================================

export interface FinancialSummary {
  receivables: {
    total: number
    pending: number
    overdue: number
    paid: number
  }
  payables: {
    total: number
    pending: number
    overdue: number
    paid: number
  }
  cashFlow: {
    totalIncome: number
    totalExpense: number
    netFlow: number
  }
  bankAccounts: {
    totalBalance: number
    accountCount: number
  }
}

export interface MonthlyFinancialData {
  month: string
  income: number
  expense: number
  netFlow: number
  receivables: number
  payables: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  count: number
}

// =====================================================
// DRE (Demonstração de Resultados)
// =====================================================

export interface DREData {
  period: {
    start: string
    end: string
  }
  revenue: {
    sales: number
    services: number
    other: number
    total: number
  }
  costs: {
    materials: number
    labor: number
    overhead: number
    total: number
  }
  expenses: {
    administrative: number
    sales: number
    financial: number
    other: number
    total: number
  }
  result: {
    grossProfit: number
    operatingProfit: number
    netProfit: number
    grossMargin: number
    netMargin: number
  }
}

// =====================================================
// Payment / Transaction
// =====================================================

export interface PaymentData {
  financial_account_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  bank_account_id?: string | null
  notes?: string | null
}

export interface PaymentReceipt {
  id: string
  financial_account_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  confirmation_number: string | null
  created_at: string
}
