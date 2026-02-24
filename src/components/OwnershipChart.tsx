import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCapTable } from '@/contexts/CapTableContext';
import { formatPercent } from '@/lib/format';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-1))',
];

export default function OwnershipChart() {
  const { stakeholders, totalShares } = useCapTable();

  const data = useMemo(() => {
    return stakeholders.map(s => ({
      id: s.id,
      name: s.name,
      value: s.shares,
      pct: totalShares > 0 ? (s.shares / totalShares) * 100 : 0,
    }));
  }, [stakeholders, totalShares]);

  if (data.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Ownership Breakdown</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={72}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((d, i) => (
                  <Cell key={d.id} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatPercent(totalShares > 0 ? (value / totalShares) * 100 : 0),
                  name,
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-medium finance-number text-foreground ml-auto pl-4">
                {formatPercent(d.pct)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
