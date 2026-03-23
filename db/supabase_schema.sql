-- Home Readiness Planner — Complete Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- Uses Supabase Auth (auth.users) for authentication
-- All tables use UUID user_id referencing auth.users(id)

-- =========================================================================
-- PROFILES (extends auth.users with app-specific fields)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- PERSONAL READINESS SCORE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.personal_readiness_score (
  readiness_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT,
  status TEXT,
  downpayment_goal DECIMAL(10, 2),
  home_price_min DECIMAL(10, 2),
  total_saved DECIMAL(10, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.personal_readiness_score ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own readiness" ON public.personal_readiness_score;
DROP POLICY IF EXISTS "Users can insert own readiness" ON public.personal_readiness_score;
DROP POLICY IF EXISTS "Users can update own readiness" ON public.personal_readiness_score;
DROP POLICY IF EXISTS "Users can delete own readiness" ON public.personal_readiness_score;
CREATE POLICY "Users can view own readiness"
  ON public.personal_readiness_score FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readiness"
  ON public.personal_readiness_score FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own readiness"
  ON public.personal_readiness_score FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own readiness"
  ON public.personal_readiness_score FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- GOALS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.goals (
  goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_type TEXT DEFAULT 'savings',
  target_amount DECIMAL(18, 2),
  target_date DATE,
  current_progress DECIMAL(18, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- BUDGETS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  budget_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  total_amount DECIMAL(10, 2),
  percentage_of_goal DECIMAL(5, 2),
  UNIQUE (user_id, month, year)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- EXPENSES
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  expense_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES public.budgets(budget_id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- INCOME
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.income (
  income_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  income_date DATE NOT NULL,
  source TEXT,
  description TEXT
);

ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own income" ON public.income;
DROP POLICY IF EXISTS "Users can insert own income" ON public.income;
DROP POLICY IF EXISTS "Users can update own income" ON public.income;
DROP POLICY IF EXISTS "Users can delete own income" ON public.income;
CREATE POLICY "Users can view own income"
  ON public.income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own income"
  ON public.income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own income"
  ON public.income FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own income"
  ON public.income FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- MONTHLY PROGRESS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.monthly_progress (
  progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  total_income DECIMAL(10, 2),
  total_expenses DECIMAL(10, 2),
  net_savings DECIMAL(10, 2),
  UNIQUE (user_id, month, year)
);

ALTER TABLE public.monthly_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON public.monthly_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.monthly_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.monthly_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON public.monthly_progress;
CREATE POLICY "Users can view own progress"
  ON public.monthly_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress"
  ON public.monthly_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress"
  ON public.monthly_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress"
  ON public.monthly_progress FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- SPENDING HABITS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.spending_habits (
  habit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  percentage DECIMAL(5, 2),
  total_amount DECIMAL(10, 2),
  month INT NOT NULL,
  year INT NOT NULL
);

ALTER TABLE public.spending_habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own habits" ON public.spending_habits;
DROP POLICY IF EXISTS "Users can insert own habits" ON public.spending_habits;
DROP POLICY IF EXISTS "Users can update own habits" ON public.spending_habits;
DROP POLICY IF EXISTS "Users can delete own habits" ON public.spending_habits;
CREATE POLICY "Users can view own habits"
  ON public.spending_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits"
  ON public.spending_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits"
  ON public.spending_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits"
  ON public.spending_habits FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- DAILY TIPS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.daily_tips (
  tip_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_content TEXT NOT NULL,
  tip_date DATE NOT NULL
);

ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tips" ON public.daily_tips;
DROP POLICY IF EXISTS "Users can insert own tips" ON public.daily_tips;
DROP POLICY IF EXISTS "Users can update own tips" ON public.daily_tips;
DROP POLICY IF EXISTS "Users can delete own tips" ON public.daily_tips;
CREATE POLICY "Users can view own tips"
  ON public.daily_tips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tips"
  ON public.daily_tips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tips"
  ON public.daily_tips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tips"
  ON public.daily_tips FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_readiness_user_id ON public.personal_readiness_score(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON public.expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON public.income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON public.income(income_date);
CREATE INDEX IF NOT EXISTS idx_monthly_progress_user_id ON public.monthly_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_id ON public.spending_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tips_user_id ON public.daily_tips(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tips_date ON public.daily_tips(tip_date);
