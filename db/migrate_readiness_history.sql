-- Migration: readiness_history + extend personal_readiness_score
-- Run in Supabase Dashboard → SQL Editor after supabase_schema.sql

-- =========================================================================
-- READINESS HISTORY (score over time for trajectory charts)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.readiness_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.readiness_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own readiness history" ON public.readiness_history;
DROP POLICY IF EXISTS "Users can insert own readiness history" ON public.readiness_history;
DROP POLICY IF EXISTS "Users can update own readiness history" ON public.readiness_history;
DROP POLICY IF EXISTS "Users can delete own readiness history" ON public.readiness_history;
CREATE POLICY "Users can view own readiness history"
  ON public.readiness_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readiness history"
  ON public.readiness_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own readiness history"
  ON public.readiness_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own readiness history"
  ON public.readiness_history FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_readiness_history_user_id ON public.readiness_history(user_id);
CREATE INDEX IF NOT EXISTS idx_readiness_history_recorded_at ON public.readiness_history(recorded_at);

-- =========================================================================
-- EXTEND PERSONAL_READINESS_SCORE (credit, debt, income for charts)
-- =========================================================================
ALTER TABLE public.personal_readiness_score
  ADD COLUMN IF NOT EXISTS credit_score INT,
  ADD COLUMN IF NOT EXISTS debt DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS debt_to_income_ratio DECIMAL(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS income DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS income_stability DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS savings_target DECIMAL(10, 2);
