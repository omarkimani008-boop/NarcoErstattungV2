
CREATE TABLE public.visitor_count (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.visitor_count ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visitor count" ON public.visitor_count FOR SELECT USING (true);
CREATE POLICY "Anyone can update visitor count" ON public.visitor_count FOR UPDATE USING (true);

INSERT INTO public.visitor_count (id, count) VALUES (1, 0);
