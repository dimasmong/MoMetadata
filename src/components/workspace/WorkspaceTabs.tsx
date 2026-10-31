import React from 'react';
import { useMetadata } from '../../context/MetadataContext';
import type { WorkspaceTab } from '../../context/MetadataContext';
import { useLanguage } from '../../i18n';
import { LayoutGrid, ListFilter, Edit3, ShieldAlert, Download } from 'lucide-react';

export const WorkspaceTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useMetadata();
  const { t } = useLanguage();

  const tabs: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t.tabs.overview, icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'allMetadata', label: t.tabs.allMetadata, icon: <ListFilter className="w-4 h-4" /> },
    { id: 'editMetadata', label: t.tabs.editMetadata, icon: <Edit3 className="w-4 h-4" /> },
    { id: 'removeMetadata', label: t.tabs.removeMetadata, icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'export', label: t.tabs.export, icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4">
      <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto no-scrollbar" role="tablist" aria-label="Metadata Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-2 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
