import { useState, useMemo } from 'react';
import { useCapTable } from '@/contexts/CapTableContext';
import { formatNumber, formatPercent } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

export default function ESOPTool() {
  const { stakeholders, totalShares, getOwnership } = useCapTable();
  const [targetPct, setTargetPct] = useState('10');

  const target = Number(targetPct) || 0;
  const currentESOPShares = stakeholders.filter(s => s.role === 'ESOP').reduce((sum, s) => sum + s.shares, 0);
  const currentESOPPct = totalShares > 0 ? (currentESOPShares / totalShares) * 100 : 0;

  // ESOP shares required = (Target % × Current Total Shares) / (1 - Target %)
  const requiredNewShares = target < 100 ? Math.round((target / 100 * totalShares) / (1 - target / 100)) - currentESOPShares : 0;
  const actualNewShares = Math.max(0, requiredNewShares);
  const newTotal = totalShares + actualNewShares;

  const comparison = useMemo(() => {
    return stakeholders.map(s => {
      const oldPct = getOwnership(s.shares);
      const newPct = newTotal > 0 ? (s.shares / newTotal) * 100 : 0;
      return { ...s, oldPct, newPct, dilution: oldPct - newPct };
    });
  }, [stakeholders, newTotal, getOwnership]);

  const dilutionExceeds20 = comparison.some(s => s.role === 'Founder' && s.dilution > 20);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">ESOP Pool Creator</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Plan your employee stock option pool and assess dilution impact</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Target ESOP %</Label>
          <Input type="number" min="0" max="99" step="0.5" value={targetPct} onChange={e => setTargetPct(e.target.value)} />
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Current ESOP</p>
          <p className="text-lg font-semibold finance-number text-foreground mt-1">{formatPercent(currentESOPPct)}</p>
          <p className="text-xs text-muted-foreground">{formatNumber(currentESOPShares)} shares</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">New Shares Required</p>
          <p className="text-lg font-semibold finance-number text-foreground mt-1">{formatNumber(actualNewShares)}</p>
          <p className="text-xs text-muted-foreground">New total: {formatNumber(newTotal)}</p>
        </div>
      </div>

      {dilutionExceeds20 && (
        <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-sm text-foreground">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <span>Warning: Founder dilution exceeds 20%. Consider reducing the target ESOP percentage.</span>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Dilution Impact</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-enterprise">
            <thead>
              <tr>
                <th className="text-left">Stakeholder</th>
                <th className="text-left">Role</th>
                <th className="text-right">Shares</th>
                <th className="text-right">Before (%)</th>
                <th className="text-right">After (%)</th>
                <th className="text-right">Dilution (%)</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(s => (
                <tr key={s.id}>
                  <td className="font-medium text-foreground">{s.name}</td>
                  <td className="text-muted-foreground">{s.role}</td>
                  <td className="text-right finance-number text-foreground">
                    {formatNumber(s.role === 'ESOP' ? s.shares + actualNewShares : s.shares)}
                  </td>
                  <td className="text-right finance-number text-foreground">{formatPercent(s.oldPct)}</td>
                  <td className="text-right finance-number text-foreground">
                    {formatPercent(s.role === 'ESOP' ? (newTotal > 0 ? ((s.shares + actualNewShares) / newTotal) * 100 : 0) : s.newPct)}
                  </td>
                  <td className={`text-right finance-number ${s.dilution > 5 ? 'text-destructive' : s.dilution > 0 ? 'text-warning' : 'text-success'}`}>
                    {s.role === 'ESOP' ? '—' : `-${formatPercent(s.dilution)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
