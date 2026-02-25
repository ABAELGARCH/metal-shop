'use client'
import { ReactNode } from 'react'

export type Column<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  loading?: boolean
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyMessage = 'No results found',
}: DataTableProps<T>) {
  return (
    <div className="rounded-lg border border-brand-steel-dark overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-brand-charcoal border-b border-brand-steel-dark">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-brand-steel-light font-semibold tracking-wider uppercase text-xs"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-steel-dark/50">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center">
                <div className="flex items-center justify-center gap-2 text-brand-steel">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-yellow" />
                  Loading...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-brand-steel">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="hover:bg-brand-charcoal/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-white">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
