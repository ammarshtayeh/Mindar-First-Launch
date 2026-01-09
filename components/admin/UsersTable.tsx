"use client"

import * as React from "react"
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
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search, Shield, ShieldAlert, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion } from "framer-motion"
import { getAllUsers, UserProfile } from "@/lib/services/dbService"
import { formatDistanceToNow } from "date-fns"

// Extend UserProfile for Table display (adding inferred role/status)
type UserTableItem = UserProfile & {
    role: "admin" | "user" | "moderator";
    status: "active" | "banned" | "pending";
    lastActiveFormatted: string;
}

const ADMIN_EMAILS = ["ammar@example.com", "admin@mindar.com", "ammar.shtayeh@gmail.com"];

export const columns: ColumnDef<UserTableItem>[] = [
  {
    accessorKey: "displayName", // Changed from 'name' to 'displayName' as per dbService
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-slate-200">
        {row.original.displayName || row.original.firstName + " " + (row.original.lastName || "") || "Unknown"}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-slate-400 hover:text-indigo-400"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase text-slate-400">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
            <div className={`flex items-center gap-2 text-xs font-bold uppercase px-2 py-1 rounded-full w-fit ${
                role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                role === 'moderator' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
                {role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                {role === 'moderator' && <Shield className="w-3 h-3" />}
                {role}
            </div>
        )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                    status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                    status === 'banned' ? 'bg-rose-500' : 'bg-amber-500'
                }`} />
                <span className="capitalize text-slate-300">{status}</span>
             </div>
        )
    },
  },
  {
    accessorKey: "lastActiveFormatted",
    header: "Last Active",
    cell: ({ row }) => <div className="text-slate-500 text-sm">{row.getValue("lastActiveFormatted")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer" onClick={() => navigator.clipboard.writeText(user.uid)}>
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">View Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10 cursor-pointer">Block User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function UsersTable() {
  const [data, setData] = React.useState<UserTableItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    const fetchUsers = async () => {
        try {
            const profiles = await getAllUsers();
            const formattedUsers: UserTableItem[] = profiles.map(profile => ({
                ...profile,
                name: profile.displayName || profile.firstName || "Unknown",
                // Infer Role
                role: profile.email && ADMIN_EMAILS.includes(profile.email) ? 'admin' : 'user',
                // Infer Status (default to active for now)
                status: 'active', 
                // Format Date
                lastActiveFormatted: profile.lastLogin?.seconds 
                    ? formatDistanceToNow(new Date(profile.lastLogin.seconds * 1000), { addSuffix: true })
                    : "Never"
            }));
            setData(formattedUsers);
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    fetchUsers();
  }, [])

  const table = useReactTable({
    data,
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
      rowSelection,
    },
  })

  if (loading) {
      return <div className="p-8 text-center text-slate-500">Scanning neural network for user signatures...</div>
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input
            placeholder="Filter emails..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="pl-10 bg-slate-900/50 border-slate-800 focus:border-indigo-500/50 text-slate-200 placeholder:text-slate-600 rounded-xl"
            />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-slate-300 hover:bg-slate-800 focus:bg-slate-800"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/20 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-slate-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-800 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-slate-400">
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-slate-800 hover:bg-slate-800/10 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
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
                  className="h-24 text-center text-slate-500"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-slate-500">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-lg disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
             className="bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-lg disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
