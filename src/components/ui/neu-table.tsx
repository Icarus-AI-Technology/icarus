import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface NeuTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

/**
 * NeuTable - Neumorphic Table Component
 * Dark Glass Medical Design System
 *
 * A table component with neumorphic design following ICARUS Dark Glass Medical patterns.
 * Supports sorting, custom rendering, row actions, and loading states.
 */
export function NeuTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  striped = false,
  hoverable = true,
  compact = false,
  className,
}: NeuTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 text-[#64748B]" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-[#6366F1]" />
    ) : (
      <ArrowDown className="w-4 h-4 text-[#6366F1]" />
    );
  };

  return (
    <div
      className={cn(
        'w-full rounded-2xl overflow-hidden',
        'bg-[#15192B]',
        'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(255,255,255,0.02)]',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-white/5 bg-[#1A1F35]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    compact ? 'px-4 py-2' : 'px-6 py-4',
                    'text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider',
                    column.sortable && 'cursor-pointer select-none hover:bg-[#252B44]',
                    column.headerClassName
                  )}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-[#94A3B8]">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#6366F1] border-t-transparent" />
                    <span>Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-[#64748B]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'border-b border-white/5 transition-colors',
                    striped && rowIndex % 2 === 1 && 'bg-[#1A1F35]/50',
                    hoverable && 'hover:bg-[#252B44]',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        compact ? 'px-4 py-2' : 'px-6 py-4',
                        'text-sm text-white',
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

NeuTable.displayName = 'NeuTable';
