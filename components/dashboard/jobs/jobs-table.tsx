'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { IconChevronUpDown, IconChevronLeft } from '@/components/ui/icons'
import { Job } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: 'title',
    id: 'title',
    header: 'Titel',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-20 capitalize truncate md:w-32 xl:w-80 2xl:w-96">
              {row.getValue('title')}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.getValue('title')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
  {
    accessorKey: 'description',
    header: 'Beschreibung',
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-20 capitalize truncate md:w-32 xl:w-50 2xl:w-64">
              {row.getValue('description')}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.getValue('description')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-auto text-center md:w-full"
        >
          <div className="hidden md:flex">Erstellungsdatum</div>
          <div className="flex md:hidden">Datum</div>
          <IconChevronUpDown className="w-4 h-4 ml-2" />
        </Button>
      )
    },
    sortingFn: (a, b) => {
      const dateA = new Date(a.getValue('date'))
      const dateB = new Date(b.getValue('date'))

      if (dateA < dateB) {
        return -1
      }
      if (dateA > dateB) {
        return 1
      }
      return 0
    },
    cell: ({ row }) => (
      <div className="text-center lowercase">{row.getValue('date')}</div>
    )
  },
  {
    accessorKey: 'location',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full text-center"
        >
          Standort
          <IconChevronUpDown className="w-4 h-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('location')}</div>
    )
  }
]

interface JobsTableProps {
  jobs: Job[]
}

export function JobsTable({ jobs }: JobsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: jobs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Jobtitel suchen"
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={event =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="w-full"
        />
      </div>
      <div className="max-w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end py-4 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Vorherige Seite
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Nächste Seite
        </Button>
      </div>
    </div>
  )
}
