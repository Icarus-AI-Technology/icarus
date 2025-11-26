/**
 * DataTable - Componente de tabela usando HeroUI
 * 
 * Features:
 * - Ordenação por colunas
 * - Paginação integrada
 * - Seleção de linhas
 * - Busca/filtro
 * - Responsivo
 * - Integrado com OraclusX Design System
 * 
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'name', label: 'Nome', sortable: true },
 *     { key: 'price', label: 'Preço', sortable: true },
 *     { key: 'status', label: 'Status' },
 *   ]}
 *   data={products}
 *   onRowClick={(row) => console.log(row)}
 *   selectable
 *   searchable
 * />
 * ```
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
  Selection,
  SortDescriptor,
} from '@heroui/react';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'start' | 'center' | 'end';
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string | number }> {
  /** Definição das colunas */
  columns: Column<T>[];
  /** Dados da tabela */
  data: T[];
  /** Callback quando uma linha é clicada */
  onRowClick?: (row: T) => void;
  /** Callback quando a seleção muda */
  onSelectionChange?: (selection: T[]) => void;
  /** Habilitar seleção de linhas */
  selectable?: boolean;
  /** Habilitar busca */
  searchable?: boolean;
  /** Placeholder do campo de busca */
  searchPlaceholder?: string;
  /** Colunas para buscar */
  searchColumns?: (keyof T)[];
  /** Itens por página (default: 10) */
  itemsPerPage?: number;
  /** Opções de itens por página */
  itemsPerPageOptions?: number[];
  /** Mostrar paginação */
  showPagination?: boolean;
  /** Estado de loading */
  isLoading?: boolean;
  /** Mensagem quando não há dados */
  emptyMessage?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Ações em massa */
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    variant?: 'default' | 'danger';
  }[];
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  onSelectionChange,
  selectable = false,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  searchColumns,
  itemsPerPage = 10,
  itemsPerPageOptions = [5, 10, 20, 50],
  showPagination = true,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado',
  className,
  bulkActions,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const [searchValue, setSearchValue] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({});
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  // Colunas para busca (default: todas as string columns)
  const searchableColumns = useMemo(() => {
    if (searchColumns) return searchColumns;
    return columns
      .filter((col) => col.filterable !== false)
      .map((col) => col.key) as (keyof T)[];
  }, [columns, searchColumns]);

  // Filtrar dados pela busca
  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return data;

    const search = searchValue.toLowerCase();
    return data.filter((row) =>
      searchableColumns.some((key) => {
        const value = row[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(search);
      })
    );
  }, [data, searchValue, searchableColumns]);

  // Ordenar dados
  const sortedData = useMemo(() => {
    if (!sortDescriptor.column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const column = sortDescriptor.column as keyof T;
      const first = a[column];
      const second = b[column];

      let cmp = 0;
      if (first == null && second == null) cmp = 0;
      else if (first == null) cmp = -1;
      else if (second == null) cmp = 1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [filteredData, sortDescriptor]);

  // Paginar dados
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, page, rowsPerPage]);

  // Total de páginas
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // Linhas selecionadas
  const selectedRows = useMemo(() => {
    if (selectedKeys === 'all') return data;
    return data.filter((row) => (selectedKeys as Set<string | number>).has(row.id));
  }, [data, selectedKeys]);

  // Callback de seleção
  const handleSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedKeys(keys);
      if (onSelectionChange) {
        if (keys === 'all') {
          onSelectionChange(data);
        } else {
          const selected = data.filter((row) => (keys as Set<string | number>).has(row.id));
          onSelectionChange(selected);
        }
      }
    },
    [data, onSelectionChange]
  );

  // Render cell content
  const renderCell = useCallback(
    (row: T, columnKey: string | number) => {
      const column = columns.find((col) => col.key === columnKey);
      const value = row[columnKey as keyof T];

      if (column?.render) {
        return column.render(value, row);
      }

      // Render default para tipos comuns
      if (value === null || value === undefined) {
        return <span className="text-[var(--text-tertiary)]">-</span>;
      }

      if (typeof value === 'boolean') {
        return (
          <Chip
            color={value ? 'success' : 'danger'}
            variant="flat"
            size="sm"
          >
            {value ? 'Sim' : 'Não'}
          </Chip>
        );
      }

      return String(value);
    },
    [columns]
  );

  // Top content (search, bulk actions)
  const topContent = useMemo(() => {
    if (!searchable && !bulkActions?.length) return null;

    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center gap-4">
          {searchable && (
            <Input
              isClearable
              placeholder={searchPlaceholder}
              startContent={<Search className="w-4 h-4 text-[var(--text-tertiary)]" />}
              value={searchValue}
              onValueChange={setSearchValue}
              onClear={() => setSearchValue('')}
              className="w-full max-w-sm"
              classNames={{
                inputWrapper: 'bg-[var(--surface-inset)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]',
              }}
            />
          )}

          {bulkActions && selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">
                {selectedRows.length} selecionado(s)
              </span>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  color={action.variant === 'danger' ? 'danger' : 'primary'}
                  variant="flat"
                  startContent={action.icon}
                  onPress={() => action.onClick(selectedRows)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [searchable, searchPlaceholder, searchValue, bulkActions, selectedRows]);

  // Bottom content (pagination, rows per page)
  const bottomContent = useMemo(() => {
    if (!showPagination) return null;

    return (
      <div className="flex justify-between items-center mt-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-tertiary)]">
            Itens por página:
          </span>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                size="sm"
                endContent={<ChevronDown className="w-4 h-4" />}
              >
                {rowsPerPage}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Itens por página"
              selectionMode="single"
              selectedKeys={new Set([String(rowsPerPage)])}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                if (value) {
                  setRowsPerPage(Number(value));
                  setPage(1);
                }
              }}
            >
              {itemsPerPageOptions.map((option) => (
                <DropdownItem key={option}>{option}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text-tertiary)]">
            {`${((page - 1) * rowsPerPage) + 1}-${Math.min(page * rowsPerPage, sortedData.length)} de ${sortedData.length}`}
          </span>
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={totalPages}
            onChange={setPage}
          />
        </div>
      </div>
    );
  }, [showPagination, rowsPerPage, page, totalPages, sortedData.length, itemsPerPageOptions]);

  return (
    <div className={cn('w-full', className)}>
      {topContent}
      
      <Table
        aria-label="Tabela de dados"
        isHeaderSticky
        selectionMode={selectable ? 'multiple' : 'none'}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        onRowAction={onRowClick ? (key) => {
          const row = data.find((r) => r.id === key);
          if (row) onRowClick(row);
        } : undefined}
        classNames={{
          wrapper: cn(
            'bg-[var(--surface-raised)] rounded-xl',
            'shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]',
            'border border-[var(--border-default)]'
          ),
          th: 'bg-[var(--surface-inset)] text-[var(--text-secondary)] font-semibold',
          tr: cn(
            'hover:bg-[var(--surface-inset)] transition-colors',
            onRowClick && 'cursor-pointer'
          ),
          td: 'text-[var(--text-primary)]',
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={String(column.key)}
              align={column.align}
              allowsSorting={column.sortable}
              width={column.width}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={paginatedData}
          isLoading={isLoading}
          loadingContent={
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
            </div>
          }
          emptyContent={
            <div className="text-center p-8 text-[var(--text-tertiary)]">
              {emptyMessage}
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {bottomContent}
    </div>
  );
}

export default DataTable;

