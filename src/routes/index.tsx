import { Fragment, useMemo, useRef, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, Upload, ListChecks, BarChart3, Users2, TrendingUp,
  FileSpreadsheet, Trash2, AlertTriangle, CheckCircle2, Info,
  Calculator, RotateCcw, Download, Cloud, CloudDownload, CloudUpload,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend, Cell,
} from "recharts";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import { parseDbfFile, type DbfRow } from "@/lib/dbf-parser";
import { aggregateProduction, projectQueue, monthsToZero } from "@/lib/analytics";
import { useStore, type DbfUpload } from "@/lib/store";
import type { Procedure } from "@/lib/procedures-data";
import { parseFilaXlsx } from "@/lib/fila-xlsx";
import { saveDemandToCloud, loadDemandFromCloud } from "@/lib/demand-sync";
import { saveUploadToCloud, deleteUploadFromCloud, loadUploadsFromCloud } from "@/lib/upload-sync";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel de Produção Ambulatorial — HMSJ Convênio SUS" },
      {
        name: "description",
        content:
          "Painel interativo para análise da produção ambulatorial SIA/SUS, comparação com metas físicas e proposta de metas para convênio de 60 meses.",
      },
    ],
  }),
  component: Dashboard,
});

const fmt = (n: number, d = 0) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function buildAggregatedProduction(
  procedures: Procedure[],
  uploads: DbfUpload[],
  selectedUploadIds: string[],
) {
  const map: Record<string, { produced: number; presented: number; valueApproved: number; months: number }> = {};
  for (const p of procedures) map[p.id] = { produced: 0, presented: 0, valueApproved: 0, months: 0 };

  const selectedSet = new Set(selectedUploadIds);
  const selectedUploads = uploads.filter((u) => selectedSet.has(u.id));
  for (const upload of selectedUploads) {
    for (const p of procedures) {
      const value = upload.production[p.id];
      if (!value) continue;
      map[p.id].produced += value.produced;
      map[p.id].presented += value.presented;
      map[p.id].valueApproved += value.valueApproved;
    }
  }

  const monthsCount = new Set(selectedUploads.map((u) => u.competencia)).size || 1;
  for (const id in map) map[id].months = monthsCount;
  return map;
}

function Dashboard() {
  const setUploadsBulk = useStore((s) => s.setUploadsBulk);
  const setDemandBulk = useStore((s) => s.setDemandBulk);

  useEffect(() => {
    async function bootstrapCloudData() {
      try {
        const cloudUploads = await loadUploadsFromCloud();
        if (cloudUploads && cloudUploads.length > 0) {
          setUploadsBulk(cloudUploads);
        }

        const cloudDemand = await loadDemandFromCloud();
        if (cloudDemand && Object.keys(cloudDemand).length > 0) {
          setDemandBulk(cloudDemand);
        }
      } catch (error) {
        console.error("Falha na inicialização dos dados da nuvem:", error);
      }
    }

    bootstrapCloudData();
  }, [setUploadsBulk, setDemandBulk]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-6">
            <TabsTrigger value="overview"><Activity className="mr-1.5 h-4 w-4" />Visão Geral</TabsTrigger>
            <TabsTrigger value="upload"><Upload className="mr-1.5 h-4 w-4" />Upload TABWIN</TabsTrigger>
            <TabsTrigger value="rules"><ListChecks className="mr-1.5 h-4 w-4" />Regras</TabsTrigger>
            <TabsTrigger value="production"><BarChart3 className="mr-1.5 h-4 w-4" />Produção vs Meta</TabsTrigger>
            <TabsTrigger value="demand"><Users2 className="mr-1.5 h-4 w-4" />Fila & Demanda</TabsTrigger>
            <TabsTrigger value="projection"><TrendingUp className="mr-1.5 h-4 w-4" />Proposta 60m</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
          <TabsContent value="upload" className="mt-6"><UploadTab /></TabsContent>
          <TabsContent value="rules" className="mt-6"><RulesTab /></TabsContent>
          <TabsContent value="production" className="mt-6"><ProductionTab /></TabsContent>
          <TabsContent value="demand" className="mt-6"><DemandTab /></TabsContent>
          <TabsContent value="projection" className="mt-6"><ProjectionTab /></TabsContent>
        </Tabs>
      </main>
      <footer className="mx-auto max-w-[1400px] px-4 pb-8 pt-2 text-xs text-muted-foreground lg:px-8">
        Painel HMSJ · Estudo de Produção Ambulatorial · Sincronizado automaticamente com a nuvem.
      </footer>
    </div>
  );
}

function Header() {
  const clearAll = useStore((s) => s.clearAll);
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">HMSJ · Painel de Produção Ambulatorial</h1>
            <p className="text-xs text-muted-foreground">Estudo de convênio SUS · 55 procedimentos · projeção 60 meses</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <RotateCcw className="mr-1.5 h-4 w-4" />Limpar dados
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Limpar todos os dados?</DialogTitle>
              <DialogDescription>
                Isso remove arquivos importados, edições de regras e cadastros de fila/demanda. As metas originais
                dos 55 procedimentos serão restauradas. Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="destructive" onClick={() => { clearAll(); toast.success("Dados limpos."); }}>
                Confirmar limpeza
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

/* ───────────────────────── VISÃO GERAL ───────────────────────── */

function OverviewTab() {
  const procedures = useStore((s) => s.procedures);
  const uploads = useStore((s) => s.uploads);
  const selectedUploadIds = useStore((s) => s.selectedUploadIds);
  const demand = useStore((s) => s.demand);
  const prodMap = useMemo(
    () => buildAggregatedProduction(procedures, uploads, selectedUploadIds),
    [procedures, uploads, selectedUploadIds],
  );

  const totalMeta = procedures.reduce((a, p) => a + p.metaTotal, 0);
  const totalMetaReg = procedures.reduce((a, p) => a + p.metaRegulacao, 0);
  const totalFila = Object.values(demand).reduce((a, d) => a + d.filaAtual, 0);
  const months = new Set(uploads.filter((u) => selectedUploadIds.includes(u.id)).map((u) => u.competencia)).size || 0;
  const totalProdMensal =
    months > 0
      ? Object.values(prodMap).reduce((a, v) => a + v.produced, 0) / months
      : 0;
  const cumprimento = totalMeta > 0 ? (totalProdMensal / totalMeta) * 100 : 0;

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Como usar este painel</AlertTitle>
        <AlertDescription className="text-sm">
          1. Importe um ou mais arquivos <strong>.DBF</strong> do TABWIN (aba <em>Upload TABWIN</em>). 2. Revise as regras
          de consolidação dos 55 procedimentos (aba <em>Regras</em>). 3. Veja produção realizada vs meta. 4. Cadastre
          fila atual, entrada mensal e capacidade (<em>Fila & Demanda</em>). 5. Simule metas Hospital × Regulação para
          os 60 meses do convênio.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Procedimentos do convênio" value={fmt(procedures.length)} hint="55 itens contratualizados" icon={<ListChecks className="h-4 w-4" />} />
        <KpiCard
          label="Meta física mensal (total)"
          value={fmt(totalMeta)}
          hint={`${fmt(totalMetaReg)} para regulação SMS`}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <KpiCard
          label="Produção mensal média"
          value={months ? fmt(totalProdMensal) : "—"}
          hint={months ? `${months} competência(s) importada(s) · ${cumprimento.toFixed(1)}% da meta` : "Sem upload"}
          icon={<Activity className="h-4 w-4" />}
          tone={cumprimento >= 95 ? "good" : cumprimento >= 80 ? "warn" : "bad"}
        />
        <KpiCard
          label="Fila de espera total"
          value={fmt(totalFila)}
          hint={`${Object.values(demand).filter((d) => d.filaAtual > 0).length} procedimentos com fila cadastrada`}
          icon={<Users2 className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Composição da meta física: Hospital × Regulação SMS</CardTitle>
          <CardDescription>
            Para cada procedimento, parte da meta é absorvida pela demanda interna (PS-AMB) e parte é ofertada à
            regulação municipal. Esse equilíbrio é o ponto-chave da negociação do convênio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[450px]"> {/* Altura aumentada para comportar melhor as 15 barras horizontais */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                margin={{ left: 220, right: 20, top: 0, bottom: 0 }}
                data={procedures
                  .slice()
                  .sort((a, b) => b.metaTotal - a.metaTotal)
                  .slice(0, 15)
                  .map((p) => ({
                    // Usa o nome real e corta caso seja muito longo para não empurrar o gráfico
                    name: p.name.length > 40 ? p.name.substring(0, 40) + "…" : p.name,
                    hosp: p.metaHospital,
                    reg: p.metaRegulacao
                  }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={true} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={210} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                  formatter={(v: number) => fmt(v)}
                />
                <Legend />
                <Bar dataKey="hosp" name="PS-AMB (Hospital)" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="reg" name="REGSMS (Regulação)" stackId="a" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Top 15 procedimentos por volume contratualizado.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  label, value, hint, icon, tone,
}: { label: string; value: string; hint?: string; icon?: React.ReactNode; tone?: "good" | "warn" | "bad" }) {
  const toneClass =
    tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-destructive" : "";
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
          <span>{label}</span>
          <span className="text-primary">{icon}</span>
        </div>
        <div className={`mt-2 text-3xl font-semibold ${toneClass}`}>{value}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

/* ───────────────────────── UPLOAD TABWIN ───────────────────────── */

function UploadTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const procedures = useStore((s) => s.procedures);
  const uploads = useStore((s) => s.uploads);
  const addUpload = useStore((s) => s.addUpload);
  const removeUpload = useStore((s) => s.removeUpload);
  const toggleUpload = useStore((s) => s.toggleUpload);
  const selectedUploadIds = useStore((s) => s.selectedUploadIds);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        try {
          const dbf = await parseDbfFile(file);
          if (!dbf.fields.some((f) => f.name === "PRD_PA")) {
            toast.error(`${file.name}: não é um arquivo de Produção Ambulatorial SIA (campo PRD_PA ausente).`);
            continue;
          }
          const cmpCount: Record<string, number> = {};
          for (const r of dbf.rows) {
            const k = String(r.PRD_CMP ?? "").trim();
            cmpCount[k] = (cmpCount[k] ?? 0) + 1;
          }
          const competencia = Object.entries(cmpCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

          const agg = aggregateProduction(procedures, dbf.rows as DbfRow[]);
          const production: DbfUpload["production"] = {};
          agg.forEach((v, k) => {
            production[k] = { produced: v.produced, presented: v.presented, valueApproved: v.valueApproved, records: v.records };
          });
          const upload: DbfUpload = {
            id: crypto.randomUUID(),
            fileName: file.name,
            competencia,
            recordCount: dbf.recordCount,
            uploadedAt: new Date().toISOString(),
            production,
          };

          await saveUploadToCloud(upload);
          addUpload(upload);

          toast.success(`${file.name} salvo na nuvem — ${fmt(dbf.recordCount)} registros · competência ${competencia}.`);
        } catch (e: any) {
          console.error(e);
          toast.error(`${file.name}: ${e?.message ?? "falha ao processar"}`);
        }
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUploadFromCloud(id);
      removeUpload(id);
      toast.success("Arquivo removido da nuvem com sucesso.");
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao remover arquivo da nuvem.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar arquivos do TABWIN (.DBF)</CardTitle>
          <CardDescription>
            Selecione um ou mais arquivos <code>.dbf</code> de Produção Ambulatorial SIA/SUS. O parsing é feito
            integralmente no navegador — nenhum dado é enviado a servidores de terceiros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/40 p-10 text-center transition hover:border-primary/50"
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <FileSpreadsheet className="h-10 w-10 text-primary" />
            <div>
              <p className="font-medium">Arraste arquivos .DBF aqui ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground">
                Aceita múltiplos arquivos. Identifica campos PRD_PA, PRD_CBO, PRD_QT_A, PRD_CMP automaticamente.
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".dbf,application/x-dbf"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <Button onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? "Processando…" : "Selecionar arquivos .DBF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Arquivos importados ({uploads.length})</CardTitle>
          <CardDescription>
            Marque quais competências devem entrar no cálculo de produção vs meta. Médias mensais usam o número de
            competências distintas selecionadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum arquivo importado ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Usar</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead className="text-right">Registros</TableHead>
                  <TableHead className="text-right">Importado em</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUploadIds.includes(u.id)}
                        onChange={() => toggleUpload(u.id)}
                        className="h-4 w-4 accent-[color:var(--primary)]"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{u.fileName}</TableCell>
                    <TableCell><Badge variant="secondary">{u.competencia}</Badge></TableCell>
                    <TableCell className="text-right">{fmt(u.recordCount)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(u.uploadedAt).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────────────────── REGRAS / PROCEDIMENTOS ───────────────────────── */

function RulesTab() {
  const procedures = useStore((s) => s.procedures);
  const updateProcedure = useStore((s) => s.updateProcedure);
  const resetProcedures = useStore((s) => s.resetProcedures);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Procedure | null>(null);

  const filtered = procedures.filter(
    (p) => p.fullName.toLowerCase().includes(filter.toLowerCase()) || p.id.includes(filter),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Filtrar por nome ou ID (ex: 1.24)…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { resetProcedures(); toast.success("Regras restauradas."); }}>
            <RotateCcw className="mr-1.5 h-4 w-4" />Restaurar originais
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>SIGTAP</TableHead>
                  <TableHead>CBO</TableHead>
                  <TableHead>PT desc.</TableHead>
                  <TableHead className="text-right">Meta Total</TableHead>
                  <TableHead className="text-right">Regulação</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm leading-tight">{p.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.tipo.map((t) => (
                          <Badge key={t} variant={t === "REGSMS" ? "default" : "secondary"} className="text-[10px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.sigtap.length > 0 ? (
                        p.sigtap.slice(0, 2).join(", ") + (p.sigtap.length > 2 ? ` +${p.sigtap.length - 2}` : "")
                      ) : p.grupo ? (
                        <span className="text-muted-foreground">grupo {p.grupo}{p.subgrupo ? `/${p.subgrupo}` : ""}</span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.cbo.length > 0 ? p.cbo.slice(0, 2).join(", ") + (p.cbo.length > 2 ? ` +${p.cbo.length - 2}` : "") : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {p.ptDescontado.length > 0 ? (
                        <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                          PT{p.ptDescontado.join(",PT")}
                        </Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmt(p.metaTotal)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmt(p.metaRegulacao)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>Editar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Sobre "DESCONTADO PT"</AlertTitle>
        <AlertDescription className="text-sm">
          Algumas regras descontam procedimentos contados em outros itens (PT1=ponto 1, etc.). O painel identifica
          e sinaliza esses casos automaticamente.
        </AlertDescription>
      </Alert>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>{editing.id} · {editing.name}</DialogTitle>
                <DialogDescription className="font-mono text-xs">{editing.rule}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">SIGTAP (vírgula)</Label>
                    <Input
                      defaultValue={editing.sigtap.join(", ")}
                      onBlur={(e) => updateProcedure(editing.id, {
                        sigtap: e.target.value.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean),
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CBO (vírgula)</Label>
                    <Input
                      defaultValue={editing.cbo.join(", ")}
                      onBlur={(e) => updateProcedure(editing.id, {
                        cbo: e.target.value.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean),
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Grupo</Label>
                    <Input defaultValue={editing.grupo ?? ""} onBlur={(e) => updateProcedure(editing.id, { grupo: e.target.value || null })} />
                  </div>
                  <div>
                    <Label className="text-xs">Subgrupo</Label>
                    <Input defaultValue={editing.subgrupo ?? ""} onBlur={(e) => updateProcedure(editing.id, { subgrupo: e.target.value || null })} />
                  </div>
                  <div>
                    <Label className="text-xs">Meta Total Mensal</Label>
                    <Input type="number" defaultValue={editing.metaTotal} onBlur={(e) => updateProcedure(editing.id, { metaTotal: Number(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label className="text-xs">Meta Regulação Mensal</Label>
                    <Input type="number" defaultValue={editing.metaRegulacao} onBlur={(e) => updateProcedure(editing.id, { metaRegulacao: Number(e.target.value) || 0 })} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">As alterações são salvas automaticamente ao sair do campo.</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────────────────── PRODUÇÃO vs META ───────────────────────── */

function ProductionTab() {
  const procedures = useStore((s) => s.procedures);
  const uploads = useStore((s) => s.uploads);
  const selectedUploadIds = useStore((s) => s.selectedUploadIds);
  const prodMap = useMemo(
    () => buildAggregatedProduction(procedures, uploads, selectedUploadIds),
    [procedures, uploads, selectedUploadIds],
  );
  const months = new Set(uploads.filter((u) => selectedUploadIds.includes(u.id)).map((u) => u.competencia)).size || 0;

  const rows = useMemo(() => {
    return procedures.map((p) => {
      const v = prodMap[p.id] ?? { produced: 0, presented: 0, valueApproved: 0, months: 0 };
      const mensal = months > 0 ? v.produced / months : 0;
      const pct = p.metaTotal > 0 ? (mensal / p.metaTotal) * 100 : 0;
      return {
        id: p.id, name: p.name, meta: p.metaTotal, metaReg: p.metaRegulacao,
        mensal, pct, valor: v.valueApproved, tipo: p.tipo,
      };
    });
  }, [procedures, prodMap, months]);

  const downloadCsv = () => {
    const header = "id,procedimento,tipo,meta_total,meta_regulacao,producao_mensal_media,cumprimento_pct,valor_aprovado_total\n";
    const body = rows.map((r) =>
      [r.id, `"${r.name.replace(/"/g, "'")}"`, r.tipo.join("|"), r.meta, r.metaReg, r.mensal.toFixed(2), r.pct.toFixed(1), r.valor.toFixed(2)].join(","),
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "producao-vs-meta.csv"; a.click(); URL.revokeObjectURL(url);
  };

  if (months === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Sem produção carregada</AlertTitle>
        <AlertDescription>
          Importe pelo menos um arquivo .DBF na aba <em>Upload TABWIN</em> para ver o comparativo de produção vs meta.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Análise baseada em <strong>{months}</strong> competência(s) ·{" "}
          {uploads.filter((u) => selectedUploadIds.includes(u.id)).length} arquivo(s) selecionado(s).
        </p>
        <Button variant="outline" size="sm" onClick={downloadCsv}>
          <Download className="mr-1.5 h-4 w-4" />Exportar CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-14">ID</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead className="text-right">Meta/mês</TableHead>
                  <TableHead className="text-right">Produção/mês</TableHead>
                  <TableHead className="w-[180px]">Cumprimento</TableHead>
                  <TableHead className="text-right">Valor SUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const tone =
                    r.pct >= 95 ? "text-emerald-600" :
                      r.pct >= 70 ? "text-amber-600" : "text-destructive";
                  const Icon = r.pct >= 95 ? CheckCircle2 : AlertTriangle;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="max-w-md text-sm leading-tight">{r.name}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(r.meta)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(r.mensal, 1)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(r.pct, 100)} className="h-2 flex-1" />
                          <span className={`flex w-20 items-center justify-end gap-1 font-mono text-xs ${tone}`}>
                            <Icon className="h-3 w-3" />
                            {r.pct.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmtBRL(r.valor)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────────────────── FILA & DEMANDA ───────────────────────── */

function DemandTab() {
  const procedures = useStore((s) => s.procedures);
  const demand = useStore((s) => s.demand);
  const setDemand = useStore((s) => s.setDemand);
  const setDemandBulk = useStore((s) => s.setDemandBulk);
  const [filter, setFilter] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState<null | "import" | "save" | "load">(null);
  const xlsxRef = useRef<HTMLInputElement>(null);

  const onlyReg = procedures.filter((p) => p.tipo.includes("REGSMS"));
  const base = showAll ? procedures : onlyReg;
  const list = filter
    ? procedures.filter(
      (p) => p.fullName.toLowerCase().includes(filter.toLowerCase()) || p.id.includes(filter),
    )
    : base;

  const handleXlsx = async (file: File) => {
    setBusy("import");
    try {
      const buf = await file.arrayBuffer();
      const { matched, unmatched } = parseFilaXlsx(buf, procedures);
      setDemandBulk(matched);
      const n = Object.keys(matched).length;
      toast.success(`Fila importada: ${n} item(s) atualizados${unmatched.length ? ` · ${unmatched.length} sem correspondência` : ""}`);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao ler a planilha. Confira o formato das colunas.");
    } finally {
      setBusy(null);
      if (xlsxRef.current) xlsxRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setBusy("save");
    try {
      const n = await saveDemandToCloud(demand);
      toast.success(`Salvo na nuvem: ${n} procedimento(s).`);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao salvar na nuvem: " + (e?.message ?? "desconhecido"));
    } finally {
      setBusy(null);
    }
  };

  const handleLoad = async () => {
    setBusy("load");
    try {
      const loaded = await loadDemandFromCloud();
      const n = Object.keys(loaded).length;
      if (n === 0) {
        toast.message("Nuvem vazia — nada para carregar ainda.");
      } else {
        setDemandBulk(loaded);
        toast.success(`Carregado da nuvem: ${n} procedimento(s).`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao carregar da nuvem: " + (e?.message ?? "desconhecido"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Cadastro da demanda represada</AlertTitle>
        <AlertDescription className="text-sm">
          Importe a planilha de fila (ARE) para preencher automaticamente <strong>fila atual</strong>,
          <strong> entrada/mês</strong> e <strong>saída/mês</strong>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <input
            ref={xlsxRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleXlsx(e.target.files[0])}
          />
          <Button onClick={() => xlsxRef.current?.click()} disabled={busy !== null}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {busy === "import" ? "Importando…" : "Importar planilha de fila (.xlsx)"}
          </Button>
          <div className="mx-2 h-6 w-px bg-border" />
          <Button variant="outline" onClick={handleSave} disabled={busy !== null}>
            <CloudUpload className="mr-2 h-4 w-4" />
            {busy === "save" ? "Salvando…" : "Salvar na nuvem"}
          </Button>
          <Button variant="outline" onClick={handleLoad} disabled={busy !== null}>
            <CloudDownload className="mr-2 h-4 w-4" />
            {busy === "load" ? "Carregando…" : "Carregar da nuvem"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Filtrar por nome ou ID…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button variant={showAll ? "default" : "outline"} size="sm" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Mostrando os 55" : "Só REGSMS"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-14">ID</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead className="text-right w-28">Fila atual</TableHead>
                  <TableHead className="text-right w-28">Entrada/mês</TableHead>
                  <TableHead className="text-right w-28">Saída/mês</TableHead>
                  <TableHead className="text-right w-28">Capac./mês</TableHead>
                  <TableHead className="text-right w-28">Líquido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => {
                  const d = demand[p.id];
                  if (!d) return null;
                  const totalOutflow = d.capacidadeMensal + d.saidaMensal;
                  const liquido = totalOutflow - d.entradaMensal;
                  return (
                    <Fragment key={p.id}>
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell className="text-sm leading-tight">
                          {p.name}
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {p.tipo.map((t) => (
                              <Badge
                                key={t}
                                variant={t === "REGSMS" ? "default" : "secondary"}
                                className="text-[10px]"
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={d.filaAtual}
                            className="h-8 text-right"
                            onChange={(e) => setDemand(p.id, { filaAtual: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={d.entradaMensal}
                            className="h-8 text-right"
                            onChange={(e) => setDemand(p.id, { entradaMensal: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={d.saidaMensal}
                            className="h-8 text-right"
                            onChange={(e) => setDemand(p.id, { saidaMensal: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={d.capacidadeMensal}
                            className="h-8 text-right"
                            onChange={(e) =>
                              setDemand(p.id, { capacidadeMensal: Number(e.target.value) || 0 })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {liquido > 0 ? (
                            <span className="text-emerald-600">+{fmt(liquido, 1)}/mês</span>
                          ) : (
                            <span className="text-destructive">{fmt(liquido, 1)}/mês</span>
                          )}
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────────────────── PROJEÇÃO 60 MESES ───────────────────────── */

/* ───────────────────────── PROJEÇÃO 60 MESES ───────────────────────── */

function ProjectionTab() {
  const procedures = useStore((s) => s.procedures);
  const demand = useStore((s) => s.demand);
  const setDemand = useStore((s) => s.setDemand);
  const uploads = useStore((s) => s.uploads);
  const selectedUploadIds = useStore((s) => s.selectedUploadIds);
  const prodMap = useMemo(
    () => buildAggregatedProduction(procedures, uploads, selectedUploadIds),
    [procedures, uploads, selectedUploadIds],
  );
  const months = new Set(uploads.filter((u) => selectedUploadIds.includes(u.id)).map((u) => u.competencia)).size || 0;

  const [selectedId, setSelectedId] = useState<string>(
    procedures.find((p) => p.tipo.includes("REGSMS"))?.id ?? procedures[0].id,
  );
  const p = procedures.find((x) => x.id === selectedId)!;
  const d = demand[selectedId];

  const prodMensalReal = months > 0 ? (prodMap[selectedId]?.produced ?? 0) / months : 0;

  // --- CENÁRIO 1: STATUS QUO (Contrato Atual) ---
  const currentCapacity = p.metaTotal;
  const currentOutflow = currentCapacity + d.saidaMensal;
  const mZeroCurrent = monthsToZero(d.filaAtual, d.entradaMensal, currentOutflow);
  const projCurrent = projectQueue({
    initialQueue: d.filaAtual,
    monthlyIntake: d.entradaMensal,
    monthlyExits: d.saidaMensal,
    capacity: currentCapacity,
    months: 60,
  });

  // --- CENÁRIO 2: PROPOSTA (Valores Simulados) ---
  const proposedCapacity = d.metaPropostaHospital + d.metaPropostaRegulacao;
  const proposedOutflow = proposedCapacity + d.saidaMensal;
  const mZeroProposed = monthsToZero(d.filaAtual, d.entradaMensal, proposedOutflow);
  const projProposed = projectQueue({
    initialQueue: d.filaAtual,
    monthlyIntake: d.entradaMensal,
    monthlyExits: d.saidaMensal,
    capacity: proposedCapacity,
    months: 60,
  });

  // --- DADOS PARA O GRÁFICO (Mescla as duas linhas) ---
  const chartData = projCurrent.map((curr, idx) => ({
    month: curr.month,
    filaAtual: curr.queue,
    filaProposta: projProposed[idx]?.queue ?? 0,
  }));

  // --- CÁLCULOS DE DELTA PARA O RELATÓRIO ---
  const diffHosp = d.metaPropostaHospital - p.metaHospital;
  const pctHosp = p.metaHospital > 0 ? (diffHosp / p.metaHospital) * 100 : (diffHosp > 0 ? 100 : 0);

  const diffReg = d.metaPropostaRegulacao - p.metaRegulacao;
  const pctReg = p.metaRegulacao > 0 ? (diffReg / p.metaRegulacao) * 100 : (diffReg > 0 ? 100 : 0);

  const diffTotal = proposedCapacity - currentCapacity;
  const pctTotal = currentCapacity > 0 ? (diffTotal / currentCapacity) * 100 : (diffTotal > 0 ? 100 : 0);

  const formatPct = (val: number) => {
    if (val === 0) return "0%";
    return (val > 0 ? "+" : "") + val.toFixed(1) + "%";
  };

  return (
    <div className="space-y-6">
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertTitle>Painel de Negociação — Cenário 60 Meses</AlertTitle>
        <AlertDescription className="text-sm">
          Selecione um procedimento abaixo para comparar a trajetória da fila mantendo o <strong>Status Quo</strong> (contrato atual) versus o <strong>Cenário Simulado</strong>. Ajuste os valores propostos na tabela para encontrar o equilíbrio que permita zerar a demanda reprimida.
        </AlertDescription>
      </Alert>

      {/* SELETOR DE PROCEDIMENTO */}
      <Card>
        <CardContent className="pt-6">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
          >
            {procedures.map((proc) => (
              <option key={proc.id} value={proc.id}>{proc.id} — {proc.name}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* BLOCOS DE DADOS E INPUTS DE SIMULAÇÃO */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Demanda e Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row k="Fila atual" v={fmt(d.filaAtual)} />
            <Row k="Entrada nova/mês" v={fmt(d.entradaMensal, 1)} />
            <Row k="Saída externa/mês" v={fmt(d.saidaMensal, 1)} />
            <div className="pt-2 border-t border-border">
              <Row k="Produção média real" v={months ? `${fmt(prodMensalReal, 1)}/mês` : "sem dados"} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contrato Atual (Status Quo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row k="Hospital (PS-AMB)" v={fmt(p.metaHospital)} />
            <Row k="Regulação (REGSMS)" v={fmt(p.metaRegulacao)} />
            <div className="pt-2 border-t border-border font-medium text-foreground">
              <Row k="Vazão Contratual Mensal" v={fmt(currentCapacity)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-primary uppercase tracking-wider">
              Cenário Simulado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs text-muted-foreground flex-1">Hospital (PS-AMB)</Label>
              <Input 
                type="number" 
                className="w-24 h-8 text-right bg-background border-primary/20 focus-visible:ring-primary" 
                value={d.metaPropostaHospital} 
                onChange={(e) => setDemand(p.id, { metaPropostaHospital: Number(e.target.value) || 0 })} 
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs text-muted-foreground flex-1">Regulação (REGSMS)</Label>
              <Input 
                type="number" 
                className="w-24 h-8 text-right bg-background border-primary/20 focus-visible:ring-primary" 
                value={d.metaPropostaRegulacao} 
                onChange={(e) => setDemand(p.id, { metaPropostaRegulacao: Number(e.target.value) || 0 })} 
              />
            </div>
            <div className="pt-2 border-t border-primary/20 flex justify-between font-semibold text-sm">
              <span className="text-primary/80">Vazão Total Simulada</span>
              <span className="text-primary">{fmt(proposedCapacity)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* GRÁFICO (Ocupa 2/3 do espaço) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trajetória da Fila de Espera</CardTitle>
            <CardDescription>
              Comparativo visual entre não alterar o contrato (linha cinza tracejada) e adotar os números da simulação (linha colorida sólida).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} 
                    formatter={(v: number, name: string) => [fmt(v), name === "filaAtual" ? "Fila (Status Quo)" : "Fila (Simulada)"]} 
                    labelFormatter={(label) => `Mês do Convênio: ${label}`} 
                  />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  
                  {/* Linha Antiga (Cinza e Tracejada) */}
                  <Line 
                    type="monotone" 
                    dataKey="filaAtual" 
                    name="Contrato Atual (Status Quo)" 
                    stroke="var(--muted-foreground)" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={false} 
                    activeDot={{ r: 4 }} 
                  />
                  
                  {/* Linha Nova (Sólida e Destacada) */}
                  <Line 
                    type="monotone" 
                    dataKey="filaProposta" 
                    name="Cenário Simulado" 
                    stroke="var(--primary)" 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RELATÓRIO EXECUTIVO (Ocupa 1/3 do espaço) */}
        <Card className="bg-primary text-primary-foreground flex flex-col shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Relatório Executivo</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Resumo da simulação para apresentação
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-5 text-sm">
            {/* Impacto nas Metas */}
            <div>
              <div className="font-semibold text-primary-foreground/70 uppercase text-xs mb-2">
                Impacto Operacional (Agendas)
              </div>
              <ul className="space-y-2 border-l-2 border-primary-foreground/20 pl-3">
                <li>
                  <span className="opacity-80">Hospital:</span> de {fmt(p.metaHospital)} para <strong>{fmt(d.metaPropostaHospital)}</strong> ({formatPct(pctHosp)})
                </li>
                <li>
                  <span className="opacity-80">Regulação:</span> de {fmt(p.metaRegulacao)} para <strong>{fmt(d.metaPropostaRegulacao)}</strong> ({formatPct(pctReg)})
                </li>
                <li className="pt-2 mt-2 border-t border-primary-foreground/20 font-medium">
                  Oferta Total: de {fmt(currentCapacity)} para {fmt(proposedCapacity)} ({formatPct(pctTotal)})
                </li>
              </ul>
            </div>

            {/* Impacto na Fila (Cor Dinâmica com base no resultado) */}
            <div className="pt-2">
              <div className="font-semibold text-primary-foreground/70 uppercase text-xs mb-2">
                Previsão de Fila (Projeção)
              </div>
              
              {mZeroProposed > 0 && mZeroProposed <= 60 ? (
                <div className="flex items-start gap-2 bg-emerald-500/20 p-3 rounded-md border border-emerald-400/30 text-emerald-50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300 mt-0.5 shrink-0" />
                  <p className="leading-snug">
                    Com a simulação proposta, a demanda reprimida será zerada no <strong>mês {mZeroProposed}</strong> do contrato.
                    {mZeroCurrent === -1 && <span className="opacity-80 block mt-1">Lembrando que no Status Quo a fila cresce sem previsão de zerar.</span>}
                  </p>
                </div>
              ) : mZeroProposed > 60 ? (
                <div className="flex items-start gap-2 bg-amber-500/20 p-3 rounded-md border border-amber-400/30 text-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-300 mt-0.5 shrink-0" />
                  <p className="leading-snug">
                    Atenção: A fila levará <strong>mais de 60 meses</strong> para zerar ({mZeroProposed} meses). O aumento proposto é insuficiente para a vigência deste convênio.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-destructive/40 p-3 rounded-md border border-destructive/50 text-destructive-foreground">
                  <TrendingUp className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="leading-snug">
                    Risco Crítico! A vazão simulada ({fmt(proposedOutflow)}/mês) é menor que a entrada ({fmt(d.entradaMensal, 1)}/mês). A fila irá colapsar e crescer indefinidamente.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 pb-1.5 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}