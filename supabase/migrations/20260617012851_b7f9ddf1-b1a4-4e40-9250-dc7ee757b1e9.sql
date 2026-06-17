
CREATE TABLE public.demand_entries (
  procedure_id TEXT PRIMARY KEY,
  fila_atual NUMERIC NOT NULL DEFAULT 0,
  entrada_mensal NUMERIC NOT NULL DEFAULT 0,
  saida_mensal NUMERIC NOT NULL DEFAULT 0,
  capacidade_mensal NUMERIC NOT NULL DEFAULT 0,
  meta_proposta_hospital NUMERIC NOT NULL DEFAULT 0,
  meta_proposta_regulacao NUMERIC NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.demand_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demand_entries TO authenticated;
GRANT ALL ON public.demand_entries TO service_role;

ALTER TABLE public.demand_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read demand" ON public.demand_entries FOR SELECT USING (true);
CREATE POLICY "Public write demand" ON public.demand_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update demand" ON public.demand_entries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete demand" ON public.demand_entries FOR DELETE USING (true);
