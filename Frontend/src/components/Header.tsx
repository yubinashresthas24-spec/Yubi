import { Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-2 text-slate-400">
          <Mail className="w-4 h-4" />
          <span className="text-sm">{user?.email || 'demo@inventrack.app'}</span>
        </div>
      </div>
    </header>
  );
}
