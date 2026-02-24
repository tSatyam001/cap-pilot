import { useState } from 'react';
import { useCapTable } from '@/contexts/CapTableContext';
import { formatPercent, formatCompact } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

interface Round {
  id: string;
  name: string;
  preMoney: number;
  investment: number;
}

export default function ScenarioAnalysis() {
  const { totalShares, getOwnershipByRole, currency } = useCapTable();
  const [rounds, setRounds] = useState<Round[]>([
    { id: '1', name: 'Seed', preMoney: 5000000, investment: 1000000 },
    { id: '2', name: 'Series A', preMoney: 20000000, investment: 5000000 },
  ]);

  const addRound = () => {
    setRounds(prev => [...prev, {
      id: Date.now().toString(),
      name: `Round ${prev.length + 1}`,
      preMoney: 0,
      investment: 0,
    }]);
  };

  const updateRound = (id: string, field: keyof Round, value: string | number) => {
    setRounds(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRound = (id: string) => {
    setRounds(prev => prev.filter(r => r.id !== id));
  };

  // Simulate cumulative dilution
  const founderBasePct = getOwnershipByRole('Founder');
  const investorBasePct = getOwnershipByRole('Investor');
  const esopBasePct = getOwnershipByRole('ESOP');

  const simResults = rounds.reduce<Array<{
    name: string;
    founderPct: number;
    investorPct: number;
    esopPct: number;
    postMoney: number;
    newInvestorPct: number;
  }>>((acc, round) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : {
      founderPct: founderBasePct,
      investorPct: investorBasePct,
      esopPct: esopBasePct,
    };

    const postMoney = round.preMoney + round.investment;
    const newInvestorPct = postMoney > 0 ? (round.investment / postMoney) * 100 : 0;
    const dilutionFactor = postMoney > 0 ? round.preMoney / postMoney : 1;

    return [...acc, {
      name: round.name,
      founderPct: prev.founderPct * dilutionFactor,
      investorPct: prev.investorPct * dilutionFactor + newInvestorPct,
      esopPct: prev.esopPct * dilutionFactor,
      postMoney,
      newInvestorPct,
    }];
  }, []);

  const lastResult = simResults[simResults.length - 1];
  const overDiluted = lastResult && lastResult.founderPct < 30;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Scenario Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Simulate multiple funding rounds and compare dilution</p>
        </div>
        <Button onClick={addRound} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Round
        </Button>
      </div>

      {/* Round inputs */}
      <div className="space-y-3">
        {rounds.map((round, i) => (
          <div key={round.id} className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Round Name</Label>
              <Input value={round.name} onChange={e => updateRound(round.id, 'name', e.target.value)} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Pre-Money ({currency})</Label>
              <Input type="number" min="0" value={round.preMoney} onChange={e => updateRound(round.id, 'preMoney', Number(e.target.value))} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Investment ({currency})</Label>
              <Input type="number" min="0" value={round.investment} onChange={e => updateRound(round.id, 'investment', Number(e.target.value))} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeRound(round.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {overDiluted && (
        <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-sm text-foreground">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <span>Over-dilution risk: Founders would hold less than 30% after all simulated rounds.</span>
        </div>
      )}

      {/* Comparison table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Round-by-Round Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-enterprise">
            <thead>
              <tr>
                <th className="text-left">Round</th>
                <th className="text-right">Post-Money</th>
                <th className="text-right">Founder %</th>
                <th className="text-right">Investor %</th>
                <th className="text-right">ESOP %</th>
                <th className="text-right">New Investor %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-foreground">Current</td>
                <td className="text-right text-muted-foreground">—</td>
                <td className="text-right finance-number text-foreground">{formatPercent(founderBasePct)}</td>
                <td className="text-right finance-number text-foreground">{formatPercent(investorBasePct)}</td>
                <td className="text-right finance-number text-foreground">{formatPercent(esopBasePct)}</td>
                <td className="text-right text-muted-foreground">—</td>
              </tr>
              {simResults.map((r, i) => (
                <tr key={i}>
                  <td className="font-medium text-foreground">{r.name}</td>
                  <td className="text-right finance-number text-foreground">{formatCompact(r.postMoney, currency)}</td>
                  <td className={`text-right finance-number ${r.founderPct < 30 ? 'text-destructive font-semibold' : r.founderPct < 50 ? 'text-warning' : 'text-foreground'}`}>
                    {formatPercent(r.founderPct)}
                  </td>
                  <td className="text-right finance-number text-foreground">{formatPercent(r.investorPct)}</td>
                  <td className="text-right finance-number text-foreground">{formatPercent(r.esopPct)}</td>
                  <td className="text-right finance-number text-foreground">{formatPercent(r.newInvestorPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
