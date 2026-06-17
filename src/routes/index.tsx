import { Fragment, useMemo, useRef, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, Upload, ListChecks, BarChart3, Users2, TrendingUp,
  FileSpreadsheet, Trash2, AlertTriangle, CheckCircle2, Info,
  Calculator, RotateCcw, Download, Cloud, CloudDownload, CloudUpload,
  ChevronDown, FileText, Image, Printer
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          <div className="h-[500px]"> {/* Altura ajustada para dar respiro aos textos */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                margin={{ left: 0, right: 30, top: 0, bottom: 0 }} // Margem esquerda zerada (o YAxis já vai fazer esse papel)
                data={procedures
                  .slice()
                  .sort((a, b) => b.metaTotal - a.metaTotal)
                  .slice(0, 15)
                  .map((p) => ({
                    // Como agora temos mais espaço real, podemos deixar até 55 caracteres sem cortar
                    name: p.name.length > 55 ? p.name.substring(0, 55) + "…" : p.name,
                    hosp: p.metaHospital,
                    reg: p.metaRegulacao
                  }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={true} />
                <XAxis type="number" tick={{ fontSize: 11 }} />

                {/* O width agora é de 340px, garantindo que o texto fique em uma linha só e encoste no gráfico */}
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={340} />

                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                  formatter={(v: number) => fmt(v)}
                />
                <Legend />

                {/* minPointSize garante que proporções muito baixas continuem visíveis */}
                <Bar dataKey="hosp" name="PS-AMB (Hospital)" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} minPointSize={2} />
                <Bar dataKey="reg" name="REGSMS (Regulação)" stackId="a" fill="var(--chart-2)" radius={[0, 4, 4, 0]} minPointSize={4} />
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

  // --- EXPORTAÇÃO DA FILA ---
  const handleExportFila = (format: "csv" | "xls") => {
    const isCsv = format === "csv";
    let content = isCsv
      ? "ID,Procedimento,Fila Atual,Entrada/mes,Saida/mes,Capacidade/mes,Liquido\n"
      : "<html><meta charset='utf-8'><body><table border='1'><tr><th>ID</th><th>Procedimento</th><th>Fila Atual</th><th>Entrada/mês</th><th>Saída/mês</th><th>Capacidade/mês</th><th>Líquido</th></tr>";

    list.forEach((p) => {
      const d = demand[p.id];
      if (!d) return;
      const totalOutflow = d.capacidadeMensal + d.saidaMensal;
      const liquido = totalOutflow - d.entradaMensal;

      if (isCsv) {
        // Remove aspas duplas do nome para não quebrar o CSV
        const safeName = p.name.replace(/"/g, "'");
        content += `"${p.id}","${safeName}",${d.filaAtual},${d.entradaMensal},${d.saidaMensal},${d.capacidadeMensal},${liquido}\n`;
      } else {
        content += `<tr><td>${p.id}</td><td>${p.name}</td><td>${d.filaAtual}</td><td>${d.entradaMensal}</td><td>${d.saidaMensal}</td><td>${d.capacidadeMensal}</td><td>${liquido}</td></tr>`;
      }
    });

    if (!isCsv) content += "</table></body></html>";

    const mime = isCsv ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel;charset=utf-8;";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fila-demanda.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Lista de fila exportada em ${format.toUpperCase()} com sucesso!`);
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

      {/* BARRA DE FILTRO E EXPORTAÇÃO ALINHADA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar Lista
              <ChevronDown className="ml-2 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExportFila("xls")} className="cursor-pointer">
              <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> Planilha (.xls)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportFila("csv")} className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4 text-blue-600" /> Tabela (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

/* ───────────────────────── PROJEÇÃO 60 MESES ───────────────────────── */

function ProjectionTab() {
  const procedures = useStore((s) => s.procedures);
  const demand = useStore((s) => s.demand);
  const setDemand = useStore((s) => s.setDemand);
  const setDemandBulk = useStore((s) => s.setDemandBulk);
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
  
  // TICKET MÉDIO FINANCEIRO (Apenas se tiver produção importada)
  const unitPrice = prodMap[selectedId]?.produced > 0 
    ? prodMap[selectedId].valueApproved / prodMap[selectedId].produced 
    : 0;

  // ----------------------------------------------------------------------
  // CORREÇÃO DO MOTOR DA FILA: EVITANDO DUPLA CONTAGEM
  // A saída média do SISREG (d.saidaMensal) já inclui o que NÓS atendemos hoje.
  // "Outras saídas" = pessoas que foram para outros hospitais, desistiram ou faleceram.
  // ----------------------------------------------------------------------
  const currentTotalCapacity = p.metaHospital + p.metaRegulacao;
  const currentRegCapacity = p.metaRegulacao; 
  
  const baseOtherExits = Math.max(0, d.saidaMensal - currentRegCapacity);

  // --- CENÁRIO 1: STATUS QUO (Contrato Atual) ---
  const currentOutflow = currentRegCapacity + baseOtherExits; // Equivalente à Saída SISREG real
  const mZeroCurrent = monthsToZero(d.filaAtual, d.entradaMensal, currentOutflow);
  const projCurrent = projectQueue({
    initialQueue: d.filaAtual,
    monthlyIntake: d.entradaMensal,
    monthlyExits: baseOtherExits, // Passamos apenas as "outras saídas"
    capacity: currentRegCapacity, // Passamos apenas a regulação
    months: 60,
  });

  // --- CENÁRIO 2: PROPOSTA (Valores Simulados) ---
  const proposedTotalCapacity = d.metaPropostaHospital + d.metaPropostaRegulacao;
  const proposedRegCapacity = d.metaPropostaRegulacao;
  const proposedOutflow = proposedRegCapacity + baseOtherExits; // Apenas regulação mexe na fila
  const mZeroProposed = monthsToZero(d.filaAtual, d.entradaMensal, proposedOutflow);
  const projProposed = projectQueue({
    initialQueue: d.filaAtual,
    monthlyIntake: d.entradaMensal,
    monthlyExits: baseOtherExits,
    capacity: proposedRegCapacity,
    months: 60,
  });

  // --- DADOS PARA O GRÁFICO ---
  const chartData = projCurrent.map((curr, idx) => ({
    month: curr.month,
    filaAtual: curr.queue,
    filaProposta: projProposed[idx]?.queue ?? 0,
  }));

  // --- CÁLCULOS DE DELTA ---
  const diffHosp = d.metaPropostaHospital - p.metaHospital;
  const pctHosp = p.metaHospital > 0 ? (diffHosp / p.metaHospital) * 100 : (diffHosp > 0 ? 100 : 0);

  const diffReg = d.metaPropostaRegulacao - p.metaRegulacao;
  const pctReg = p.metaRegulacao > 0 ? (diffReg / p.metaRegulacao) * 100 : (diffReg > 0 ? 100 : 0);

  const diffTotal = proposedTotalCapacity - currentTotalCapacity;
  const pctTotal = currentTotalCapacity > 0 ? (diffTotal / currentTotalCapacity) * 100 : (diffTotal > 0 ? 100 : 0);

  const finCurrent = currentTotalCapacity * unitPrice;
  const finProposed = proposedTotalCapacity * unitPrice;
  const finDelta = finProposed - finCurrent;

  const formatPct = (val: number) => {
    if (val === 0) return "0%";
    return (val > 0 ? "+" : "") + val.toFixed(1) + "%";
  };

  // O déficit é calculado considerando todas as forças do município (nós + outros)
  const isDeficit = proposedOutflow < d.entradaMensal;

  // --- RESUMO DE ALTERAÇÕES E RESET ---
  const changedList = procedures.filter(proc => {
    const dem = demand[proc.id];
    return dem && (dem.metaPropostaHospital !== proc.metaHospital || dem.metaPropostaRegulacao !== proc.metaRegulacao);
  });

  const handleResetAll = () => {
    const resets: Record<string, Partial<DemandEntry>> = {};
    changedList.forEach((proc) => {
      resets[proc.id] = {
        metaPropostaHospital: proc.metaHospital,
        metaPropostaRegulacao: proc.metaRegulacao,
      };
    });
    setDemandBulk(resets);
    toast.success("Todas as simulações foram restauradas para o contrato original.");
  };

  // --- EXPORTAÇÃO NATIVA ---
  const handleExport = (format: "csv" | "xls" | "pdf" | "png") => {
    if (format === "csv" || format === "xls") {
      const isCsv = format === "csv";
      let content = isCsv
        ? "Procedimento,Hospital Atual,Hospital Proposto,Regulacao Atual,Regulacao Proposta,Impacto Físico,Impacto Financeiro (R$)\n"
        : "<html><meta charset='utf-8'><body><table border='1'><tr><th>Procedimento</th><th>Hospital Atual</th><th>Hospital Proposto</th><th>Regulação Atual</th><th>Regulação Proposta</th><th>Impacto Físico</th><th>Impacto Financeiro (R$)</th></tr>";

      changedList.forEach((proc) => {
        const dem = demand[proc.id];
        const difH = dem.metaPropostaHospital - proc.metaHospital;
        const difR = dem.metaPropostaRegulacao - proc.metaRegulacao;
        const difTot = difH + difR;
        
        const pUnitPrice = prodMap[proc.id]?.produced > 0 ? prodMap[proc.id].valueApproved / prodMap[proc.id].produced : 0;
        const pFinDelta = difTot * pUnitPrice;

        if (isCsv) {
          const safeName = proc.name.replace(/"/g, "'");
          content += `"${proc.id} - ${safeName}",${proc.metaHospital},${dem.metaPropostaHospital},${proc.metaRegulacao},${dem.metaPropostaRegulacao},${difTot},${pFinDelta.toFixed(2)}\n`;
        } else {
          content += `<tr><td>${proc.id} - ${proc.name}</td><td>${proc.metaHospital}</td><td>${dem.metaPropostaHospital}</td><td>${proc.metaRegulacao}</td><td>${dem.metaPropostaRegulacao}</td><td>${difTot}</td><td>${pFinDelta.toFixed(2)}</td></tr>`;
        }
      });

      if (!isCsv) content += "</table></body></html>";

      const mime = isCsv ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel;charset=utf-8;";
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resumo-simulacoes.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Resumo exportado em ${format.toUpperCase()} com sucesso!`);
    } else if (format === "pdf") {
      toast.info("Na tela de impressão que vai abrir, altere o Destino para 'Salvar como PDF'.");
      setTimeout(() => window.print(), 800);
    } else if (format === "png") {
      toast.info("Dica: Utilize a ferramenta nativa de captura (Windows+Shift+S ou Cmd+Shift+4) para recortar o resumo com perfeição na sua tela!");
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertTitle>Painel de Negociação — Cenário 60 Meses</AlertTitle>
        <AlertDescription className="text-sm">
          Selecione um procedimento abaixo. O gráfico de trajetória responde <strong>exclusivamente</strong> às mudanças na meta de <strong>Regulação</strong>. Ajustes na meta do Hospital alteram o faturamento total, mas não reduzem a fila externa.
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
            {procedures
              .filter((proc) => proc.tipo.includes("REGSMS"))
              .map((proc) => (
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
              Demanda Municipal (SISREG)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row k="Fila externa atual" v={fmt(d.filaAtual)} />
            <Row k="Entrada nova/mês" v={fmt(d.entradaMensal, 1)} />
            <Row k="Saída total (Rede)/mês" v={fmt(d.saidaMensal, 1)} />
            <div className="pt-2 border-t border-border">
              <Row k="Nossa produção média real" v={months ? `${fmt(prodMensalReal, 1)}/mês` : "sem dados"} />
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
              <Row k="Total Físico Contratado" v={fmt(currentTotalCapacity)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-primary uppercase tracking-wider">
              Cenário Simulado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex flex-col justify-between h-full">
            <div className="space-y-4 mt-1">
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
            </div>
            
            <div className="pt-3 border-t border-primary/20 flex flex-col gap-1.5">
              <div className="flex justify-between font-semibold text-sm">
                <span className="text-primary/80">Nossa Oferta Total</span>
                <span className="text-primary">{fmt(proposedTotalCapacity)}</span>
              </div>
              
              {/* ALERTA CRÍTICO DE DÉFICIT DA FILA MUNICIPAL */}
              <div className="flex justify-between text-[11px] items-center bg-background/50 rounded p-1.5">
                <span className="text-muted-foreground font-medium leading-tight">Vazão Fila (Regulação + HMSJ) <br/>vs Entrada Mensal</span>
                <span className={`px-2 py-0.5 rounded font-bold ${proposedOutflow < d.entradaMensal ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"}`}>
                  {fmt(proposedOutflow, 1)} / {fmt(d.entradaMensal, 1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* GRÁFICO */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trajetória da Fila (Pacientes Regulados)</CardTitle>
            <CardDescription>
              Comparativo visual entre a vazão da regulação atual (linha cinza) e a vazão simulada (linha colorida sólida).
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

        {/* RELATÓRIO EXECUTIVO */}
        <Card className="bg-primary text-primary-foreground flex flex-col shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Relatório Executivo</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Resumo da simulação para apresentação
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 text-sm">
            <div>
              <div className="font-semibold text-primary-foreground/70 uppercase text-xs mb-2">
                Impacto Operacional (Físico)
              </div>
              <ul className="space-y-2 border-l-2 border-primary-foreground/20 pl-3">
                <li>
                  <span className="opacity-80">Hospital:</span> de {fmt(p.metaHospital)} para <strong>{fmt(d.metaPropostaHospital)}</strong> ({formatPct(pctHosp)})
                </li>
                <li>
                  <span className="opacity-80">Regulação:</span> de {fmt(p.metaRegulacao)} para <strong>{fmt(d.metaPropostaRegulacao)}</strong> ({formatPct(pctReg)})
                </li>
                <li className="pt-2 mt-2 border-t border-primary-foreground/20 font-medium">
                  Oferta Geral: de {fmt(currentTotalCapacity)} para {fmt(proposedTotalCapacity)} ({formatPct(pctTotal)})
                </li>
              </ul>
            </div>

            {/* IMPACTO FINANCEIRO */}
            <div className="pt-2">
              <div className="font-semibold text-primary-foreground/70 uppercase text-xs mb-2">
                Impacto Financeiro (SUS)
              </div>
              {unitPrice > 0 ? (
                <ul className="space-y-2 border-l-2 border-primary-foreground/20 pl-3">
                  <li>
                    <span className="opacity-80">Ticket Médio:</span> {fmtBRL(unitPrice)}
                  </li>
                  <li>
                    <span className="opacity-80">Faturamento/mês:</span> de {fmtBRL(finCurrent)} para <strong>{fmtBRL(finProposed)}</strong>
                  </li>
                  <li className="pt-1 mt-1 font-medium">
                    Saldo: <span className={finDelta > 0 ? "text-emerald-300" : finDelta < 0 ? "text-red-300" : ""}>
                      {finDelta > 0 ? "+" : ""}{fmtBRL(finDelta)}/mês
                    </span>
                  </li>
                </ul>
              ) : (
                <div className="text-xs opacity-80 italic pl-3 border-l-2 border-primary-foreground/20">
                  Valor indisponível. Importe o DBF para ver a estimativa financeira.
                </div>
              )}
            </div>

            <div className="pt-2">
              <div className="font-semibold text-primary-foreground/70 uppercase text-xs mb-2">
                Previsão da Fila Regulada
              </div>
              {isDeficit ? (
                <div className="flex items-start gap-2 bg-destructive/40 p-3 rounded-md border border-destructive/50 text-destructive-foreground">
                  <TrendingUp className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="leading-snug">
                    Risco Crítico! A vazão simulada da fila ({fmt(proposedOutflow, 1)}/mês) é menor que a entrada municipal ({fmt(d.entradaMensal, 1)}/mês). A fila irá colapsar.
                  </p>
                </div>
              ) : mZeroProposed === 0 ? (
                <div className="flex items-start gap-2 bg-blue-500/20 p-3 rounded-md border border-blue-400/30 text-blue-50">
                  <CheckCircle2 className="h-5 w-5 text-blue-300 mt-0.5 shrink-0" />
                  <p className="leading-snug">
                    Fluxo Equilibrado! A fila atual já está zerada e a vazão proposta cobre perfeitamente as novas entradas.
                  </p>
                </div>
              ) : mZeroProposed <= 60 ? (
                <div className="flex items-start gap-2 bg-emerald-500/20 p-3 rounded-md border border-emerald-400/30 text-emerald-50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300 mt-0.5 shrink-0" />
                  <p className="leading-snug">
                    Com a regulação simulada, a demanda externa zera no <strong>mês {mZeroProposed}</strong> do contrato.
                    {mZeroCurrent === -1 && <span className="opacity-80 block mt-1">Lembrando que no Status Quo a fila não zera.</span>}
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-amber-500/20 p-3 rounded-md border border-amber-400/30 text-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-300 mt-0.5 shrink-0" />
                  <p className="leading-snug">
                    Atenção: A fila levará <strong>mais de 60 meses</strong> para zerar {mZeroProposed === -1 ? "(ou nunca zerará)" : `(${mZeroProposed} meses)`}. A regulação proposta é insuficiente.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* LISTA DE ALTERAÇÕES */}
        {changedList.length > 0 && (
          <Card className="lg:col-span-3 border-primary/20 bg-muted/10">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
              <div>
                <CardTitle className="text-base">Resumo das Simulações (Deltas)</CardTitle>
                <CardDescription>
                  Abaixo estão todos os procedimentos cujas propostas diferem do contrato atual.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                      <ChevronDown className="ml-2 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport("xls")} className="cursor-pointer">
                      <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> Planilha (.xls)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4 text-blue-600" /> Tabela (.csv)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer">
                      <Printer className="mr-2 h-4 w-4" /> Salvar como PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("png")} className="cursor-pointer">
                      <Image className="mr-2 h-4 w-4 text-purple-600" /> Salvar como PNG
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={handleResetAll} className="text-destructive hover:text-destructive">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restaurar Originais
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead className="text-right">Hospital Atual</TableHead>
                    <TableHead className="text-right">Hospital Proposto</TableHead>
                    <TableHead className="text-right border-l border-border/50">Regulação Atual</TableHead>
                    <TableHead className="text-right">Regulação Proposta</TableHead>
                    <TableHead className="text-right border-l border-border/50">Impacto Físico</TableHead>
                    <TableHead className="text-right">Impacto Financeiro (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changedList.map(proc => {
                    const dem = demand[proc.id];
                    const difH = dem.metaPropostaHospital - proc.metaHospital;
                    const difR = dem.metaPropostaRegulacao - proc.metaRegulacao;
                    const difTot = difH + difR;
                    
                    const pUnitPrice = prodMap[proc.id]?.produced > 0 ? prodMap[proc.id].valueApproved / prodMap[proc.id].produced : 0;
                    const pFinDelta = difTot * pUnitPrice;

                    return (
                      <TableRow 
                        key={proc.id} 
                        className="cursor-pointer hover:bg-muted/50" 
                        onClick={() => setSelectedId(proc.id)}
                      >
                        <TableCell className="font-medium text-xs max-w-[300px] truncate" title={proc.name}>
                          {proc.id} - {proc.name}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{fmt(proc.metaHospital)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {fmt(dem.metaPropostaHospital)}
                          {difH !== 0 && (
                            <span className={`ml-2 text-[10px] ${difH > 0 ? "text-emerald-500" : "text-destructive"}`}>
                              {difH > 0 ? "+" : ""}{fmt(difH)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground border-l border-border/50">{fmt(proc.metaRegulacao)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {fmt(dem.metaPropostaRegulacao)}
                          {difR !== 0 && (
                            <span className={`ml-2 text-[10px] ${difR > 0 ? "text-emerald-500" : "text-destructive"}`}>
                              {difR > 0 ? "+" : ""}{fmt(difR)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold border-l border-border/50">
                          <span className={difTot > 0 ? "text-emerald-600" : difTot < 0 ? "text-destructive" : ""}>
                            {difTot > 0 ? "+" : ""}{fmt(difTot)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {pUnitPrice > 0 ? (
                            <span className={pFinDelta > 0 ? "text-emerald-600" : pFinDelta < 0 ? "text-destructive" : ""}>
                              {pFinDelta > 0 ? "+" : ""}{fmtBRL(pFinDelta)}
                            </span>
                          ) : <span className="text-muted-foreground text-xs font-normal">Indisponível</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
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