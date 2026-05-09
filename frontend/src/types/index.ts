export type User = {
  id: string;
  phone_number: string;
  full_name?: string | null;
  country_code?: string | null;
  primary_work_type?: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

export type JobStatus = {
  id: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  progress: number;
  error_code?: string | null;
  error_message?: string | null;
  created_at: string;
  completed_at?: string | null;
};

export type Dashboard = {
  score: number | null;
  grade: string;
  lender_readiness: string;
  recommended_amount?: string | null;
  recommended_term_days?: number | null;
  financial_health: string;
  income_trends: Array<{ month: string; amount: number }>;
  spending_behavior: Array<{ month: string; amount: number }>;
  flagged_anomalies: Array<{ evidence_id: string; flags: string[] }>;
  recommendations: string[];
  score_history: Array<{ score: number; grade: string; created_at: string }>;
};

export type HistoryResponse = {
  evidence: Array<{
    id: string;
    status: string;
    detected_source?: string | null;
    confidence: number;
    flags: string[];
    created_at: string;
  }>;
  events: Array<{
    id: string;
    event_type: string;
    occurred_at?: string | null;
    amount?: string | null;
    currency: string;
    description?: string | null;
  }>;
  score_snapshots: Array<{ score: number; grade: string; created_at: string }>;
};

export type InvestigationCase = {
  id: string;
  case_number: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  risk_score: number;
  amount?: string | null;
  currency: string;
  summary: string;
  flags: string[];
  timeline: Array<{ date: string; label: string; detail: string }>;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  tone: string;
  read_at?: string | null;
  created_at: string;
};
