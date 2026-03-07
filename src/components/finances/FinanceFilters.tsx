import { useState } from "react";
import { Filter, X, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FinanceFiltersProps {
  onPeriodChange: (period: string) => void;
  onTypeChange: (type: "all" | "income" | "expense") => void;
  onClearFilters: () => void;
  selectedPeriod: string;
  selectedType: "all" | "income" | "expense";
}

const periods = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
  { value: "custom", label: "Personalizado" },
];

const types = [
  { value: "all", label: "Todos" },
  { value: "income", label: "Receitas" },
  { value: "expense", label: "Despesas" },
];

const FinanceFilters = ({
  onPeriodChange,
  onTypeChange,
  onClearFilters,
  selectedPeriod,
  selectedType,
}: FinanceFiltersProps) => {
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = selectedPeriod !== "month" || selectedType !== "all";

  const handleExport = (format: "pdf" | "csv") => {
    // Mock export functionality
    console.log(`Exporting as ${format}`);
    alert(`Exportando como ${format.toUpperCase()}...`);
  };

  return (
    <div className="glass-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Period Filter */}
        <div className="flex gap-2 flex-wrap">
          {periods.slice(0, 4).map((period) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-glass hover:bg-white/10"
              }`}
            >
              {period.label}
            </button>
          ))}

          {/* Custom Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedPeriod === "custom"
                    ? "bg-primary text-primary-foreground"
                    : "bg-glass hover:bg-white/10"
                }`}
              >
                <Calendar className="w-4 h-4" />
                {customDate ? format(customDate, "dd/MM/yyyy") : "Personalizado"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-900 border-white/20" align="start">
              <CalendarComponent
                mode="single"
                selected={customDate}
                onSelect={(date) => {
                  setCustomDate(date);
                  onPeriodChange("custom");
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="h-6 w-px bg-white/20 hidden md:block" />

        {/* Type Filter */}
        <div className="flex gap-2">
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value as "all" | "income" | "expense")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedType === type.value
                  ? type.value === "income"
                    ? "bg-green-500/20 text-green-400 border border-green-400"
                    : type.value === "expense"
                    ? "bg-red-500/20 text-red-400 border border-red-400"
                    : "bg-primary text-primary-foreground"
                  : "bg-glass hover:bg-white/10"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar filtros
          </Button>
        )}

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            className="bg-glass border-white/20"
          >
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            className="bg-glass border-white/20"
          >
            <Download className="w-4 h-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinanceFilters;
