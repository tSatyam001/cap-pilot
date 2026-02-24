import { useState, useMemo } from 'react';
import { useCapTable } from '@/contexts/CapTableContext';
import { formatNumber, formatPercent, formatCompact } from '@/lib/format';
import { exportFundingRoundPdf } from '@/lib/exportPdf';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download } from 'lucide-react';

export default function FundingSimulator() {
  const { stakeholders, totalShares, getOwnership, currency } = useCapTable();
  const [preMoneyVal, setPreMoneyVal] = useState('10000000');
  const [investmentAmt, setInvestmentAmt] = useState('2000000');
  const [newSharesManual, setNewSharesManual] = useState('');

  const preMoney = Number(preMoneyVal) || 0;
  const investment = Number(investmentAmt) || 0;
  const postMoney = preMoney + investment;

  const pricePerShare = totalShares > 0 ? preMoney / totalShares : 0;
  const autoNewShares = pricePerShare > 0 ? Math.round(investment / pricePerShare) : 0;
  const newShares = newSharesManual ? Number(newSharesManual) : autoNewShares;
  const newTotal = totalShares + newShares;

  const investorNewPct = newTotal > 0 ? (newShares / newTotal) * 100 : 0;

  const comparison = useMemo(() => {
    return stakeholders.map(s => {
      const oldPct = getOwnership(s.shares);
      const newPct = newTotal > 0 ? (s.shares / newTotal) * 100 : 0;
      const dilution = oldPct - newPct;
      return { ...s, oldPct, newPct, dilution };
    });
  }, [stakeholders, newTotal, getOwnership]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Funding Round Simulator</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Model the impact of a new funding round on ownership</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportFundingRoundPdf(stakeholders, { preMoney, investment, postMoney, pricePerShare, newShares, investorNewPct, currency }, comparison)}>
          <Download className="w-4 h-4 mr-1.5" />
          Export PDF
        </Button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 space-y-1.5">
          <Label htmlFor="premoney" className="text-xs text-muted-foreground uppercase tracking-wide">Pre-Money Valuation ({currency})</Label>
          <Input id="premoney" type="number" min="0" value={preMoneyVal} onChange={e => setPreMoneyVal(e.target.value)} />
        </div>
        <div className="bg-card border border-border rounded-lg p-5 space-y-1.5">
          <Label htmlFor="investment" className="text-xs text-muted-foreground uppercase tracking-wide">Investment Amount ({currency})</Label>
          <Input id="investment" type="number" min="0" value={investmentAmt} onChange={e => setInvestmentAmt(e.target.value)} />
        </div>
        <div className="bg-card border border-border rounded-lg p-5 space-y-1.5">
          <Label htmlFor="newshares" className="text-xs text-muted-foreground uppercase tracking-wide">New Shares (auto-calc)</Label>
          <Input id="newshares" type="number" min="0" value={newSharesManual} onChange={e => setNewSharesManual(e.target.value)} placeholder={autoNewShares.toLocaleString()} />
        </div>
      </div>

      {/* Results summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Post-Money Valuation', value: formatCompact(postMoney, currency) },
          { label: 'New Investor Ownership', value: formatPercent(investorNewPct) },
          { label: 'Price per Share', value: `${currency}${pricePerShare.toFixed(2)}` },
          { label: 'New Shares Issued', value: formatNumber(newShares) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-lg font-semibold finance-number text-foreground mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Before vs After table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Before vs After Comparison</h3>
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
                  <td className="text-right finance-number text-foreground">{formatNumber(s.shares)}</td>
                  <td className="text-right finance-number text-foreground">{formatPercent(s.oldPct)}</td>
                  <td className="text-right finance-number text-foreground">{formatPercent(s.newPct)}</td>
                  <td className={`text-right finance-number ${s.dilution > 5 ? 'text-destructive' : 'text-warning'}`}>
                    -{formatPercent(s.dilution)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="font-medium text-foreground">New Investor</td>
                <td className="text-muted-foreground">Investor</td>
                <td className="text-right finance-number text-foreground">{formatNumber(newShares)}</td>
                <td className="text-right finance-number text-muted-foreground">—</td>
                <td className="text-right finance-number text-foreground">{formatPercent(investorNewPct)}</td>
                <td className="text-right finance-number text-muted-foreground">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {investorNewPct > 30 && (
        <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-sm text-foreground">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <span>Warning: New investor would own more than 30%. Consider reducing round size or increasing pre-money valuation.</span>
        </div>
      )}
    </div>
  );
}
