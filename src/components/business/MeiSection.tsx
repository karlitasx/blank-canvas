import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBusinessFinance } from "@/hooks/useBusinessFinance";
import { toast } from "sonner";

interface Props {
  biz: ReturnType<typeof useBusinessFinance>;
}

const MeiSection = ({ biz }: Props) => {
  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const handleAddDas = async () => {
    const exists = biz.dasPayments.some(d => d.reference_month === currentMonthKey);
    if (exists) { toast.info("DAS deste mês já registrado"); return; }
    await biz.addDasPayment(currentMonthKey);
    toast.success("DAS do mês adicionado!");
  };

  return (
    <div className="space-y-4">
      {/* MEI Limit Card */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            📊 Limite Anual MEI
          </h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            biz.meiLimitPercent >= 90 ? "bg-destructive/15 text-destructive" :
            biz.meiLimitPercent >= 80 ? "bg-yellow-500/15 text-yellow-600" :
            "bg-primary/15 text-primary"
          }`}>
            {biz.meiLimitPercent.toFixed(1)}%
          </span>
        </div>
        <Progress value={Math.min(biz.meiLimitPercent, 100)} className="h-3" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Faturado: {formatCurrency(biz.annualRevenue)}</span>
          <span className="text-muted-foreground">Limite: {formatCurrency(biz.MEI_ANNUAL_LIMIT)}</span>
        </div>
        {biz.meiLimitPercent >= 80 && (
          <div className={`p-3 rounded-xl flex items-center gap-2 ${
            biz.meiLimitPercent >= 90 ? "bg-destructive/10" : "bg-yellow-500/10"
          }`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 ${
              biz.meiLimitPercent >= 90 ? "text-destructive" : "text-yellow-600"
            }`} />
            <span className="text-xs font-medium text-foreground">
              {biz.meiLimitPercent >= 90
                ? "Muito próximo do limite! Considere migrar para Simples Nacional."
                : "Atenção: você está se aproximando do limite anual."}
            </span>
          </div>
        )}
      </div>

      {/* DAS Control */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">💳 Controle do DAS</h3>
          <Button size="sm" variant="outline" onClick={handleAddDas} className="gap-1 text-xs">
            <Plus className="w-3 h-3" /> Adicionar mês
          </Button>
        </div>
        {biz.dasPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum DAS registrado</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {biz.dasPayments.map(das => (
              <div key={das.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  {das.status === "pago" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium text-foreground">{das.reference_month}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {Number(das.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                  <Button
                    size="sm"
                    variant={das.status === "pago" ? "secondary" : "default"}
                    onClick={() => biz.toggleDasStatus(das.id)}
                    className="text-xs h-7 px-2"
                  >
                    {das.status === "pago" ? "Pago ✓" : "Marcar pago"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeiSection;
