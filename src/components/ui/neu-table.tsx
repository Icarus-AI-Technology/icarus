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
 *
 * A table component with neumorphic design following ICARUS Dark Glass Medical patterns.
 * Supports sorting, custom rendering, row actions, and loading states.
 *
 * @example
 * // Basic table
 * <NeuTable
 *   data={products}
 *   columns={[
 *     { key: 'codigo', label: 'Código', sortable: true },
 *     { key: 'nome', label: 'Nome', sortable: true },
 *     { key: 'preco', label: 'Preço', render: (v) => `R$ ${v.toFixed(2)}` },
 *   ]}
 * />
 *
 * @example
 * // Table with row click
 * <NeuTable
 *   data={items}
 *   columns={columns}
 *   onRowClick={(row) => handleEdit(row)}
 *   hoverable
 *   striped
 * />
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
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-primary-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary-500" />
    );
  };

  return (
    <div
      className={cn(
        'w-full rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-white to-gray-50',
        'shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)]',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    compact ? 'px-4 py-2' : 'px-6 py-4',
                    'text-left text-xs font-semibold text-gray-700 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer select-none hover:bg-gray-100/50',
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
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
                    <span>Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'border-b border-gray-100 transition-colors',
                    striped && rowIndex % 2 === 1 && 'bg-gray-50/30',
                    hoverable && 'hover:bg-gray-100/50',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        compact ? 'px-4 py-2' : 'px-6 py-4',
                        'text-sm text-gray-900',
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
