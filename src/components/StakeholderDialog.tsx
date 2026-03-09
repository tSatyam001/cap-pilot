import { useState, useEffect } from 'react';
import { useCapTable, type Stakeholder, type Role, type ShareClass } from '@/contexts/CapTableContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  editing: Stakeholder | null;
}

const MAX_SHARE_DIGITS = 20;

const toWholeShareBigInt = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return 0n;
  return BigInt(Math.trunc(value));
};

export default function StakeholderDialog({ open, onClose, editing }: Props) {
  const { stakeholders, addStakeholder, updateStakeholder } = useCapTable();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Founder');
  const [shares, setShares] = useState('');
  const [shareClass, setShareClass] = useState<ShareClass>('Common');

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setRole(editing.role);
      setShares(editing.shares.toString());
      setShareClass(editing.shareClass);
    } else {
      setName('');
      setRole('Founder');
      setShares('');
      setShareClass('Common');
    }
  }, [editing, open]);

  useEffect(() => {
    if (shares.length > MAX_SHARE_DIGITS) {
      setShares(shares.slice(0, MAX_SHARE_DIGITS));
    }
  }, [shares]);

  const handleSharesChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setShares(digitsOnly.slice(0, MAX_SHARE_DIGITS));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shareDigits = shares.trim();
    if (shareDigits.length === 0 || Number(shareDigits) < 1) {
      toast({
        title: 'Invalid share count',
        description: 'Number of shares must be at least 1.',
        variant: 'destructive',
      });
      return;
    }

    if (shareDigits.length > MAX_SHARE_DIGITS) {
      toast({
        title: 'Share limit exceeded',
        description: `Shares can be at most ${MAX_SHARE_DIGITS} digits.`,
        variant: 'destructive',
      });
      return;
    }

    const currentTotalWithoutEditing = stakeholders
      .filter(s => !editing || s.id !== editing.id)
      .reduce((sum, s) => sum + toWholeShareBigInt(s.shares), 0n);
    const proposedTotal = currentTotalWithoutEditing + BigInt(shareDigits);

    if (proposedTotal.toString().length > MAX_SHARE_DIGITS) {
      toast({
        title: 'Total shares limit exceeded',
        description: `Total shares cannot exceed ${MAX_SHARE_DIGITS} digits.`,
        variant: 'destructive',
      });
      return;
    }

    const data = { name, role, shares: Number(shareDigits), shareClass };
    if (editing) {
      updateStakeholder({ ...data, id: editing.id });
    } else {
      addStakeholder(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Stakeholder' : 'Add Stakeholder'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" required />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={v => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Founder">Founder</SelectItem>
                <SelectItem value="Investor">Investor</SelectItem>
                <SelectItem value="ESOP">ESOP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={MAX_SHARE_DIGITS}
              value={shares}
              onChange={e => handleSharesChange(e.target.value)}
              placeholder="e.g. 1000000"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Share Class</Label>
            <Select value={shareClass} onValueChange={v => setShareClass(v as ShareClass)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Common">Common</SelectItem>
                <SelectItem value="Preferred">Preferred</SelectItem>
                <SelectItem value="ESOP">ESOP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Add'} Stakeholder</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
