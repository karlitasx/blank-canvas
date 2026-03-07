import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryDonutProps {
  data: CategoryData[];
  onCategoryClick: (category: string | null) => void;
  selectedCategory: string | null;
}

const CategoryDonut = ({ data, onCategoryClick, selectedCategory }: CategoryDonutProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            R$ {item.value.toLocaleString("pt-BR")} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Gastos por Categoria</h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                onClick={(_, index) => {
                  const category = data[index].name;
                  onCategoryClick(selectedCategory === category ? null : category);
                }}
                className="cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
                    stroke="transparent"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3">
          {data.map((item) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <button
                key={item.name}
                onClick={() =>
                  onCategoryClick(selectedCategory === item.name ? null : item.name)
                }
                className={`flex items-center gap-2 p-2 rounded-lg transition-all text-left ${
                  selectedCategory === item.name
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                } ${selectedCategory && selectedCategory !== item.name ? "opacity-50" : ""}`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCategory && (
        <button
          onClick={() => onCategoryClick(null)}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Limpar filtro de categoria
        </button>
      )}
    </div>
  );
};

export default CategoryDonut;
