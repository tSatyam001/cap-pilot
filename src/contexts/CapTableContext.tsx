import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export type Role = 'Founder' | 'Investor' | 'ESOP';
export type ShareClass = 'Common' | 'Preferred' | 'ESOP';

export interface Stakeholder {
  id: string;
  name: string;
  role: Role;
  shares: number;
  shareClass: ShareClass;
}

export interface FundingRound {
  id: string;
  name: string;
  preMoneyValuation: number;
  investmentAmount: number;
  newSharesIssued: number;
}

export interface Scenario {
  id: string;
  name: string;
  stakeholders: Stakeholder[];
  description?: string;
}

interface CapTableContextType {
  stakeholders: Stakeholder[];
  addStakeholder: (s: Omit<Stakeholder, 'id'>) => void;
  updateStakeholder: (s: Stakeholder) => void;
  removeStakeholder: (id: string) => void;
  totalShares: number;
  getOwnership: (shares: number) => number;
  getOwnershipByRole: (role: Role) => number;
  scenarios: Scenario[];
  addScenario: (s: Omit<Scenario, 'id'>) => void;
  removeScenario: (id: string) => void;
  currency: '$' | '₹';
  setCurrency: (c: '$' | '₹') => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  hasUnsavedChanges: boolean;
  commitChanges: () => Promise<void>;
  loading: boolean;
}

const CapTableContext = createContext<CapTableContextType | null>(null);

const defaultStakeholders: Stakeholder[] = [
  { id: '1', name: 'Alice Chen', role: 'Founder', shares: 4000000, shareClass: 'Common' },
  { id: '2', name: 'Bob Kumar', role: 'Founder', shares: 3000000, shareClass: 'Common' },
  { id: '3', name: 'Sequoia Capital', role: 'Investor', shares: 2000000, shareClass: 'Preferred' },
  { id: '4', name: 'Employee Pool', role: 'ESOP', shares: 1000000, shareClass: 'ESOP' },
];

function assertNoError<T>(result: { data: T; error: { message: string } | null }, fallbackMessage: string): T {
  if (result.error) {
    throw new Error(result.error.message || fallbackMessage);
  }
  return result.data;
}

export function CapTableProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(defaultStakeholders);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currency, setCurrency] = useState<'$' | '₹'>('$');
  const [companyName, setCompanyName] = useState('My Company');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Load data from DB when user logs in
  useEffect(() => {
    if (!user) {
      setStakeholders(defaultStakeholders);
      setCompanyName('My Company');
      setScenarios([]);
      setHasUnsavedChanges(false);
      setInitialLoaded(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load profile
        const profileResult = await supabase
          .from('profiles')
          .select('company_name')
          .eq('user_id', user.id)
          .maybeSingle();
        const profile = assertNoError(profileResult, 'Failed to load profile');
        if (profile) setCompanyName(profile.company_name);

        // Load stakeholders
        const stakeholdersResult = await supabase
          .from('stakeholders')
          .select('*')
          .eq('user_id', user.id);
        const dbStakeholders = assertNoError(stakeholdersResult, 'Failed to load stakeholders');
        if (dbStakeholders && dbStakeholders.length > 0) {
          setStakeholders(dbStakeholders.map((s: any) => ({
            id: s.id,
            name: s.name,
            role: s.role as Role,
            shares: Number(s.shares),
            shareClass: s.share_class as ShareClass,
          })));
        } else {
          setStakeholders(defaultStakeholders);
        }

        // Load scenarios
        const scenariosResult = await supabase
          .from('scenarios')
          .select('*')
          .eq('user_id', user.id);
        const dbScenarios = assertNoError(scenariosResult, 'Failed to load scenarios');
        if (dbScenarios) {
          setScenarios(dbScenarios.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            stakeholders: s.stakeholders as Stakeholder[],
          })));
        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        toast({
          title: 'Failed to load data',
          description: err?.message || 'Could not fetch your cap table from the database.',
          variant: 'destructive',
        });
      }
      setLoading(false);
      setInitialLoaded(true);
      setHasUnsavedChanges(false);
    };

    loadData();
  }, [user, toast]);

  // Track changes after initial load
  const markChanged = useCallback(() => {
    if (initialLoaded && user) setHasUnsavedChanges(true);
  }, [initialLoaded, user]);

  const totalShares = useMemo(() => stakeholders.reduce((sum, s) => sum + s.shares, 0), [stakeholders]);

  const getOwnership = useCallback((shares: number) => {
    if (totalShares === 0) return 0;
    return (shares / totalShares) * 100;
  }, [totalShares]);

  const getOwnershipByRole = useCallback((role: Role) => {
    const roleShares = stakeholders.filter(s => s.role === role).reduce((sum, s) => sum + s.shares, 0);
    return getOwnership(roleShares);
  }, [stakeholders, getOwnership]);

  const addStakeholder = useCallback((s: Omit<Stakeholder, 'id'>) => {
    setStakeholders(prev => [...prev, { ...s, id: Date.now().toString() }]);
    markChanged();
  }, [markChanged]);

  const updateStakeholder = useCallback((s: Stakeholder) => {
    setStakeholders(prev => prev.map(existing => existing.id === s.id ? s : existing));
    markChanged();
  }, [markChanged]);

  const removeStakeholder = useCallback((id: string) => {
    setStakeholders(prev => prev.filter(s => s.id !== id));
    markChanged();
  }, [markChanged]);

  const addScenario = useCallback((s: Omit<Scenario, 'id'>) => {
    setScenarios(prev => [...prev, { ...s, id: Date.now().toString() }]);
    markChanged();
  }, [markChanged]);

  const removeScenario = useCallback((id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    markChanged();
  }, [markChanged]);

  const handleSetCompanyName = useCallback((name: string) => {
    setCompanyName(name);
    markChanged();
  }, [markChanged]);

  const commitChanges = useCallback(async () => {
    if (!user) return;

    try {
      // Update company name (ensure row exists)
      const profileUpsertResult = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, company_name: companyName }, { onConflict: 'user_id' });
      assertNoError(profileUpsertResult, 'Failed to save company profile');

      // Delete existing stakeholders and re-insert
      const stakeholderDeleteResult = await supabase.from('stakeholders').delete().eq('user_id', user.id);
      assertNoError(stakeholderDeleteResult, 'Failed to clear stakeholders');
      if (stakeholders.length > 0) {
        const stakeholderInsertResult = await supabase.from('stakeholders').insert(
          stakeholders.map(s => ({
            user_id: user.id,
            name: s.name,
            role: s.role,
            shares: s.shares,
            share_class: s.shareClass,
          }))
        );
        assertNoError(stakeholderInsertResult, 'Failed to save stakeholders');
      }

      // Delete existing scenarios and re-insert
      const scenarioDeleteResult = await supabase.from('scenarios').delete().eq('user_id', user.id);
      assertNoError(scenarioDeleteResult, 'Failed to clear scenarios');
      if (scenarios.length > 0) {
        const scenarioInsertResult = await supabase.from('scenarios').insert(
          scenarios.map(s => ({
            user_id: user.id,
            name: s.name,
            description: s.description || null,
            stakeholders: s.stakeholders as any,
          }))
        );
        assertNoError(scenarioInsertResult, 'Failed to save scenarios');
      }

      setHasUnsavedChanges(false);
      toast({ title: 'Saved', description: 'All changes have been committed.' });
    } catch (err: any) {
      toast({ title: 'Error saving', description: err.message, variant: 'destructive' });
    }
  }, [user, companyName, stakeholders, scenarios, toast]);

  return (
    <CapTableContext.Provider value={{
      stakeholders, addStakeholder, updateStakeholder, removeStakeholder,
      totalShares, getOwnership, getOwnershipByRole,
      scenarios, addScenario, removeScenario,
      currency, setCurrency,
      companyName, setCompanyName: handleSetCompanyName,
      hasUnsavedChanges, commitChanges, loading,
    }}>
      {children}
    </CapTableContext.Provider>
  );
}

export function useCapTable() {
  const ctx = useContext(CapTableContext);
  if (!ctx) throw new Error('useCapTable must be used within CapTableProvider');
  return ctx;
}
