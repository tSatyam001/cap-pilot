import { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SummaryCards from '@/components/SummaryCards';
import StakeholderTable from '@/components/StakeholderTable';
import StakeholderDialog from '@/components/StakeholderDialog';
import AIAdvisor from '@/components/AIAdvisor';
import OwnershipChart from '@/components/OwnershipChart';
import { useCapTable } from '@/contexts/CapTableContext';
import type { Stakeholder } from '@/contexts/CapTableContext';
import { exportCapTablePdf } from '@/lib/exportPdf';

const Index = () => {
  const { stakeholders, totalShares, getOwnership, currency } = useCapTable();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Stakeholder | null>(null);

  const handleEdit = (s: Stakeholder) => {
    setEditing(s);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cap Table</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your company's ownership structure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCapTablePdf(stakeholders, totalShares, getOwnership, currency)}>
            <Download className="w-4 h-4 mr-1.5" />
            Export PDF
          </Button>
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Stakeholder
          </Button>
        </div>
      </div>

      <SummaryCards />
      <OwnershipChart />
      <StakeholderTable onEdit={handleEdit} />
      <AIAdvisor />

      <StakeholderDialog open={dialogOpen} onClose={handleClose} editing={editing} />
    </div>
  );
};

export default Index;
