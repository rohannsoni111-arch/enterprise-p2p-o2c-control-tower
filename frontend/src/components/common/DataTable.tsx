import React from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  statusFilterOptions?: { label: string; value: string }[];
  statusFilterValue?: string;
  onStatusFilterChange?: (val: string) => void;
  secondaryFilterOptions?: { label: string; value: string }[];
  secondaryFilterPlaceholder?: string;
  secondaryFilterValue?: string;
  onSecondaryFilterChange?: (val: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (colKey: string) => void;
  loading?: boolean;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  actionButton?: React.ReactNode;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  statusFilterOptions,
  statusFilterValue,
  onStatusFilterChange,
  secondaryFilterOptions,
  secondaryFilterPlaceholder = 'All Categories',
  secondaryFilterValue,
  onSecondaryFilterChange,
  sortBy,
  sortOrder,
  onSort,
  loading = false,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search query or active filters.',
  actionButton,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      {/* Table Controls Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-sap-blue"
              />
            </div>
          )}

          {statusFilterOptions && onStatusFilterChange && (
            <div className="relative">
              <select
                value={statusFilterValue || ''}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sap-blue pr-8"
              >
                <option value="">All Statuses</option>
                {statusFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {secondaryFilterOptions && onSecondaryFilterChange && (
            <div className="relative">
              <select
                value={secondaryFilterValue || ''}
                onChange={(e) => onSecondaryFilterChange(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sap-blue pr-8"
              >
                <option value="">{secondaryFilterPlaceholder}</option>
                {secondaryFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {actionButton && <div>{actionButton}</div>}
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                  className={`px-4 py-3 ${col.sortable ? 'cursor-pointer select-none hover:text-sap-blue' : ''} ${
                    col.className || ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-sap-blue" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-sap-blue border-t-transparent rounded-full animate-spin" />
                    <span>Loading operational records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="max-w-xs mx-auto text-center">
                    <Filter className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{emptyTitle}</h4>
                    <p className="text-xs text-slate-400 mt-1">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors duration-75 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40' : 'hover:bg-slate-50/40'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {total > 0 && onPageChange && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(page * limit, total)}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
