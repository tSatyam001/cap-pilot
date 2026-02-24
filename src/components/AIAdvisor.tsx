import { useState } from 'react';
import { useCapTable } from '@/contexts/CapTableContext';
import { formatPercent } from '@/lib/format';
import { AlertTriangle, Bot, ChevronDown, ChevronUp } from 'lucide-react';

export default function AIAdvisor() {
  const [open, setOpen] = useState(false);
  const { stakeholders, totalShares, getOwnershipByRole } = useCapTable();

  const founderPct = getOwnershipByRole('Founder');
  const investorPct = getOwnershipByRole('Investor');
  const esopPct = getOwnershipByRole('ESOP');

  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (founderPct < 50) warnings.push('Founders hold less than 50% — control risk at board level.');
  if (founderPct < 30) warnings.push('Critical: Founder ownership below 30%. Future fundraising may leave founders with insufficient stake.');
  if (investorPct > 40) warnings.push('Investor ownership exceeds 40% — founders may face significant dilution in future rounds.');
  if (esopPct < 5) warnings.push('ESOP pool is below 5% — may be insufficient to attract top talent.');
  if (esopPct > 20) warnings.push('ESOP pool exceeds 20% — unusually large for early stage.');

  if (founderPct >= 60) recommendations.push('Healthy founder stake. You have room for 1–2 more funding rounds while retaining control.');
  if (founderPct >= 50 && founderPct < 60) recommendations.push('Consider keeping founder ownership above 50% through the next round for board control.');
  recommendations.push(`Safe equity range for next round: offer ${formatPercent(Math.min(25, Math.max(10, 100 - founderPct - esopPct - 40)))} to new investors.`);
  if (esopPct >= 10 && esopPct <= 15) recommendations.push('ESOP pool is within recommended range (10–15%).');

  const riskLevel = warnings.length === 0 ? 'Low' : warnings.length <= 2 ? 'Medium' : 'High';
  const riskColor = riskLevel === 'Low' ? 'text-success' : riskLevel === 'Medium' ? 'text-warning' : 'text-destructive';

  return (
    <div className="bg-card border border-border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Advisor</span>
          <span className={`text-xs font-medium ${riskColor}`}>Risk: {riskLevel}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Warnings</h4>
              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recommendations</h4>
            {recommendations.map((r, i) => (
              <p key={i} className="text-sm text-muted-foreground">• {r}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
