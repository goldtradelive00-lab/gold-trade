export type UserRole = "investor" | "admin";
export type KycStatus = "pending" | "verified" | "rejected";
export type AssetType =
  | "equity"
  | "etf"
  | "bond"
  | "real_estate"
  | "private_equity"
  | "cash"
  | "other";
export type TransactionType =
  | "buy"
  | "sell"
  | "deposit"
  | "withdrawal"
  | "dividend"
  | "referral_bonus"
  | "daily_profit";
export type PermissionLevel = "super_admin" | "compliance_officer" | "support";

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_approved: boolean;
  referral_code?: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  name: string;
  asset_type: AssetType;
  quantity: number;
  avg_cost: number;
  current_price: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  portfolio_id: string;
  type: TransactionType;
  description: string;
  amount: number;
  occurred_at: string;
}

export interface PortfolioOverview {
  portfolio_id: string;
  cash_balance: number;
  principal_balance: number;
  holdings_value: number;
  total_value: number;
  holdings: Holding[];
}

export interface InvestorSummary {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  is_approved: boolean;
  email_verified: boolean;
  kyc_status: KycStatus;
  rejection_reason: string | null;
  created_at: string;
  portfolio_total_value: number;
}

export interface InvestorDetail extends InvestorSummary {
  holdings?: Holding[];
  transactions?: Transaction[];
}

export interface ComplianceRow {
  user_id: string;
  full_name: string | null;
  email: string;
  kyc_status: KycStatus;
  aml_flag: boolean;
  risk_score: number | null;
  reviewed_at: string | null;
}

export interface AdminTeamMember {
  user_id: string;
  full_name: string;
  email: string;
  permission_level: PermissionLevel;
  created_at: string;
}
