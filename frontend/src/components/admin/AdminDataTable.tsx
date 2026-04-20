import { cn } from '@/lib/utils'

type AdminDataTableColumn<RowT> = {
  id: string
  header: string
  className?: string
  headerClassName?: string
  renderCell: (row: RowT) => React.ReactNode
}

type AdminDataTableProps<RowT> = {
  columns: AdminDataTableColumn<RowT>[]
  rows: RowT[]
  rowKey: (row: RowT) => string
  emptyMessage?: string
  minWidthClassName?: string
}

export default function AdminDataTable<RowT>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records available.',
  minWidthClassName = 'min-w-[920px]',
}: Readonly<AdminDataTableProps<RowT>>) {
  return (
    <div className="overflow-x-auto rounded-md border border-grey-200 pb-px">
      <table className={cn('w-full border-collapse text-xs text-grey-700', minWidthClassName)}>
        <caption className="sr-only">Administrative records table</caption>
        <thead className="bg-grey-50 text-[11px] uppercase tracking-wide text-grey-500">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn('px-4 py-3 text-left font-medium', column.headerClassName)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-grey-200">
              {columns.map((column) => (
                <td key={column.id} className={cn('px-4 py-3', column.className)}>
                  {column.renderCell(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-grey-500">
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
