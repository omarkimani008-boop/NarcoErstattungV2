-- Tabelle für KI-Korrekturen
CREATE TABLE public.key_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  correct_key TEXT NOT NULL,
  is_money BOOLEAN NOT NULL DEFAULT false,
  money_per_unit INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (label)
);

ALTER TABLE public.key_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read corrections"
ON public.key_corrections FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert corrections"
ON public.key_corrections FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update corrections"
ON public.key_corrections FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete corrections"
ON public.key_corrections FOR DELETE
USING (true);

CREATE INDEX idx_key_corrections_label ON public.key_corrections (lower(label));