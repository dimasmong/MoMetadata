import React, { useState, useMemo } from 'react';
import { useMetadata } from '../../../context/MetadataContext';
import { useLanguage } from '../../../i18n';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FileSpreadsheet,
  FileCode,
  Table,
  Layers,
} from 'lucide-react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { exportMetadataAsJson, exportMetadataAsCsv } from '../../../core/exportUtils';

export const AllMetadataTab: React.FC = () => {
  const { selectedFile } = useMetadata();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'raw'>('grouped');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [copiedTagId, setCopiedTagId] = useState<string | null>(null);

  const groups = selectedFile?.metadata?.groups || [];

  // Filter groups and tags based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;

    const q = searchQuery.toLowerCase();
    return groups
      .map((g) => {
        const matchingTags = g.tags.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.displayName.toLowerCase().includes(q) ||
            String(t.value).toLowerCase().includes(q) ||
            g.name.toLowerCase().includes(q)
        );
        return { ...g, tags: matchingTags };
      })
      .filter((g) => g.tags.length > 0);
  }, [groups, searchQuery]);

  const allFilteredTags = useMemo(() => {
    return filteredGroups.flatMap((g) => g.tags);
  }, [filteredGroups]);

  if (!selectedFile || !selectedFile.metadata) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        {t.preview.noSelection}
      </div>
    );
  }

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedGroups({});
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    groups.forEach((g) => {
      allCollapsed[g.name] = true;
    });
    setCollapsedGroups(allCollapsed);
  };

  const handleCopyValue = (tagId: string, val: string | number | boolean) => {
    navigator.clipboard.writeText(String(val));
    setCopiedTagId(tagId);
    setTimeout(() => setCopiedTagId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-5xl">
      {/* Controls Bar: Search, View Mode Toggle, Expand/Collapse, Export buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.allMetadata.searchPlaceholder}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* View mode & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title={t.allMetadata.viewGrouped}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.allMetadata.viewGrouped}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'raw'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title={t.allMetadata.viewRaw}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.allMetadata.viewRaw}</span>
            </button>
          </div>

          {viewMode === 'grouped' && (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={handleExpandAll}>
                {t.allMetadata.expandAll}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleCollapseAll}>
                {t.allMetadata.collapseAll}
              </Button>
            </>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Export JSON / CSV */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportMetadataAsJson(groups, selectedFile.name)}
            icon={<FileCode className="w-3.5 h-3.5 text-blue-600" />}
          >
            {t.allMetadata.exportJson}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportMetadataAsCsv(groups, selectedFile.name)}
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
          >
            {t.allMetadata.exportCsv}
          </Button>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm">{t.allMetadata.emptySearch}</p>
        </div>
      ) : viewMode === 'grouped' ? (
        /* Grouped View */
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.name];
            return (
              <div
                key={group.name}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                {/* Group Header */}
                <button
                  type="button"
                  onClick={() => toggleGroupCollapse(group.name)}
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {group.name}
                    </span>
                    <Badge variant="slate" size="sm">
                      {group.tags.length}
                    </Badge>
                  </div>

                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    {group.category}
                  </span>
                </button>

                {/* Group Tags Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {group.tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-4 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 gap-2"
                      >
                        <div className="w-full sm:w-1/3 flex items-center gap-2">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {tag.displayName}
                          </span>
                          {tag.writable ? (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                              {t.allMetadata.writableBadge}
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                              {t.allMetadata.readOnlyBadge}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 font-mono text-slate-600 dark:text-slate-300 break-words select-all text-[11px] sm:text-xs">
                          {String(tag.value)}
                        </div>

                        <div className="shrink-0 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleCopyValue(tag.id, tag.value)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title={t.allMetadata.copyValue}
                            aria-label={`Copy value of ${tag.displayName}`}
                          >
                            {copiedTagId === tag.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Raw Flat Table View */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                <th className="py-2.5 px-4">{t.allMetadata.groupName}</th>
                <th className="py-2.5 px-4">{t.allMetadata.fieldName}</th>
                <th className="py-2.5 px-4">{t.allMetadata.fieldValue}</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allFilteredTags.map((tag) => (
                <tr
                  key={tag.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-2.5 px-4 text-[11px] font-mono text-slate-500">
                    {tag.group}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {tag.displayName}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300 break-words max-w-md select-all text-[11px]">
                    {String(tag.value)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleCopyValue(tag.id, tag.value)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title={t.allMetadata.copyValue}
                    >
                      {copiedTagId === tag.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
