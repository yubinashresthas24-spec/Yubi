import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  pageTitle: string;
}

export function Layout({ children, currentPage, pageTitle }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar currentPage={currentPage} />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <Header title={pageTitle} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
