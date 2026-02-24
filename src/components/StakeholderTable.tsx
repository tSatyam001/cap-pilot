import { useCapTable, type Stakeholder } from '@/contexts/CapTableContext';
import { formatNumber, formatPercent } from '@/lib/format';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  onEdit: (s: Stakeholder) => void;
}

const roleBadgeClass: Record<string, string> = {
  Founder: 'bg-primary/10 text-primary',
  Investor: 'bg-success/10 text-success',
  ESOP: 'bg-warning/10 text-warning',
};

export default function StakeholderTable({ onEdit }: Props) {
  const { stakeholders, totalShares, getOwnership, removeStakeholder } = useCapTable();

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Stakeholders</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Ownership breakdown across all share classes</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-enterprise">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th className="text-left">Role</th>
              <th className="text-right">Shares</th>
              <th className="text-right">Ownership %</th>
              <th className="text-left">Share Class</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stakeholders.map(s => (
              <tr key={s.id}>
                <td className="font-medium text-foreground">{s.name}</td>
                <td>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleBadgeClass[s.role]}`}>
                    {s.role}
                  </span>
                </td>
                <td className="text-right finance-number text-foreground">{formatNumber(s.shares)}</td>
                <td className="text-right finance-number text-foreground">{formatPercent(getOwnership(s.shares))}</td>
                <td className="text-muted-foreground">{s.shareClass}</td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(s)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeStakeholder(s.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="font-semibold text-foreground" colSpan={2}>Total</td>
              <td className="text-right finance-number font-semibold text-foreground">{formatNumber(totalShares)}</td>
              <td className="text-right finance-number font-semibold text-foreground">100.00%</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
