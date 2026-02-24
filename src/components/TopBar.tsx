import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCapTable } from '@/contexts/CapTableContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Sun, Moon, Save, Pencil, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TopBar() {
  const { currency, setCurrency, companyName, setCompanyName, hasUnsavedChanges, commitChanges } = useCapTable();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(companyName);
  const [saving, setSaving] = useState(false);
  const topBarBgClass = 'bg-[#d4dfee] dark:bg-card';

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setCompanyName(nameInput.trim());
    }
    setEditingName(false);
  };

  const handleCommit = async () => {
    setSaving(true);
    await commitChanges();
    setSaving(false);
  };

  return (
    <header className={`h-14 border-b border-border ${topBarBgClass} flex items-center justify-between px-6`}>
      <div className="flex items-center gap-2">
        {editingName ? (
          <form onSubmit={e => { e.preventDefault(); handleSaveName(); }} className="flex items-center gap-2">
            <Input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="h-8 w-40 text-sm"
              autoFocus
              onBlur={handleSaveName}
            />
          </form>
        ) : (
          <div className="flex items-center gap-1.5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">{companyName}</h2>
              <p className="text-xs text-muted-foreground">Cap Table Management</p>
            </div>
            {user && (
              <button
                type="button"
                onClick={() => { setNameInput(companyName); setEditingName(true); }}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user && hasUnsavedChanges && (
          <Button variant="default" size="sm" onClick={handleCommit} disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving...' : 'Commit'}
          </Button>
        )}
        <div className="flex items-center bg-secondary rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setCurrency('$')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              currency === '$' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            USD ($)
          </button>
          <button
            type="button"
            onClick={() => setCurrency('₹')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              currency === '₹' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            INR (₹)
          </button>
        </div>
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        {user && (
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-2 rounded-md bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="User settings"
          >
            <UserCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}
