export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type ApplicableLaw = 'freelance_act' | 'subcontract_act' | 'both'

export type ViolationItem = {
  law: ApplicableLaw
  article_code: string      // 条文コード（例："FL-5-4"）
  article: string           // 条文番号（例："フリーランス新法 第5条第4号"）
  article_name: string      // 条項名（例："買いたたきの禁止"）
  severity: RiskLevel
  confidence: ConfidenceLevel
  requires_review: boolean  // 専門家による確認が推奨される場合 true
  description: string       // 問題点の詳細説明
  excerpt: string           // 契約書の該当箇所の抜粋（なければ空文字）
  legal_basis: string       // 根拠となる法律の条文テキスト（公式テキスト）
  correction: string        // 具体的な修正案（契約書条文形式）
}

export type AnalysisResult = {
  risk_level: RiskLevel
  applicable_laws: ApplicableLaw[]
  summary: string
  violations: ViolationItem[]
  compliant_points: string[]
  missing_clauses: MissingClause[]
  recommendation: string
  disclaimer: string
}

export type MissingClause = {
  law: ApplicableLaw
  article: string
  article_name: string
  description: string
  suggested_clause: string
}

export type ContractAnalysis = {
  id: string
  user_id: string
  file_name: string
  file_type: 'pdf' | 'image' | 'text'
  extracted_text: string | null
  analysis_result: AnalysisResult
  risk_level: RiskLevel
  created_at: string
}

export type Profile = {
  id: string
  email: string | null
  created_at: string
}

// ── Stripe / 決済関連 ──────────────────────────────────────

export type PlanType = 'single' | 'corporate'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending'

export type UserSubscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  plan_type: PlanType | null
  status: SubscriptionStatus
  credits_remaining: number
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type PlanConfig = {
  id: PlanType
  name: string
  price: number
  interval: 'once' | 'month'
  description: string
  features: string[]
  stripePriceId: string
  badge?: string
}

// ── 決済状態チェック結果 ──────────────────────────────────

export type AccessStatus =
  | { allowed: true; planType: PlanType; creditsRemaining?: number }
  | { allowed: false; reason: 'no_subscription' | 'no_credits' | 'expired' | 'pending' }
