import { useCapTable } from '@/contexts/CapTableContext';
import { formatNumber, formatPercent } from '@/lib/format';
import { Users, TrendingUp, PieChart, Briefcase } from 'lucide-react';

export default function SummaryCards() {
  const { totalShares, getOwnershipByRole } = useCapTable();

  const cards = [
    { label: 'Total Shares', value: formatNumber(totalShares), icon: PieChart, color: 'text-primary' },
    { label: 'Founder Ownership', value: formatPercent(getOwnershipByRole('Founder')), icon: Users, color: 'text-success' },
    { label: 'Investor Ownership', value: formatPercent(getOwnershipByRole('Investor')), icon: Briefcase, color: 'text-primary' },
    { label: 'ESOP Pool', value: formatPercent(getOwnershipByRole('ESOP')), icon: TrendingUp, color: 'text-warning' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <p className="text-2xl font-semibold finance-number text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}
