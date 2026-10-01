import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Search, Zap } from "lucide-react";
import { EmptyState } from "./ui";

interface VirtualDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  initialGlobalFilter?: string;
}

/**
 * Data table built for very large datasets: TanStack Table handles
 * sorting / filtering / column visibility, while @tanstack/react-virtual
 * renders only the rows in the viewport (dynamic row measurement, so
 * multi-line cells stay pixel-aligned with the sticky header).
 */
export function VirtualDataTable<T>({ data, columns, searchPlaceholder = "Search…", initialGlobalFilter = "" }: VirtualDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumns, setShowColumns] = useState(false);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) =>
      Object.values(row.original as Record<string, unknown>).some((v) =>
        String(v ?? "").toLowerCase().includes(String(filterValue).toLowerCase()),
      ),
  });

  const rows = table.getRowModel().rows;
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 12,
  });

  const items = virtualizer.getVirtualItems();
  const padTop = items.length > 0 ? items[0].start : 0;
  const padBottom = items.length > 0 ? virtualizer.getTotalSize() - (items[items.length - 1].end ?? 0) : 0;
  const colCount = table.getVisibleLeafColumns().length;
  const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide());

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowColumns((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Columns <ChevronDown size={15} />
          </button>
          {showColumns && (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {hideable.map((col) => (
                <label key={col.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={(e) => col.toggleVisibility(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  <span className="capitalize">{col.id.replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <p className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Zap size={12} className="text-indigo-500" />
          {rows.length.toLocaleString()} of {data.length.toLocaleString()} rows · virtualized
        </p>
      </div>

      {/* virtualized table */}
      <div ref={parentRef} className="h-[560px] overflow-auto border-t border-slate-100 dark:border-slate-800">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-slate-50/95 backdrop-blur dark:bg-slate-900/95">
                {hg.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp size={13} />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} className="text-slate-300 dark:text-slate-600" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {padTop > 0 && (
              <tr>
                <td style={{ height: padTop, padding: 0, border: 0 }} colSpan={colCount} />
              </tr>
            )}
            {items.map((vi) => {
              const row = rows[vi.index];
              return (
                <tr
                  key={row.id}
                  data-index={vi.index}
                  ref={virtualizer.measureElement}
                  className="border-t border-slate-100 transition hover:bg-indigo-50/40 dark:border-slate-800 dark:hover:bg-indigo-950/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {padBottom > 0 && (
              <tr>
                <td style={{ height: padBottom, padding: 0, border: 0 }} colSpan={colCount} />
              </tr>
            )}
            {rows.length === 0 && (
              <tr>
                <td colSpan={colCount}>
                  <EmptyState title="No results found" hint="Try adjusting your search or filters." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Rendering <span className="font-semibold text-slate-700 dark:text-slate-200">{items.length}</span> of{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{rows.length.toLocaleString()}</span> rows in the viewport
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">scroll to load more</p>
      </div>
    </div>
  );
}
