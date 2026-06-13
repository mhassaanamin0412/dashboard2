import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { LEAD_STATUSES, STATUS_COLORS, TABLE_PAGE_SIZES } from '@/constants/status';
import useClientStore from '@/store/useClientStore';
import { exportToCSV } from '@/utils/csvExport';
import { clientService } from '@/lib/supabase';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS['New Lead'];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
};

const SortIcon = ({ sorted }) => {
  if (sorted === 'asc') return <ArrowUp className="ml-1 h-3 w-3" />;
  if (sorted === 'desc') return <ArrowDown className="ml-1 h-3 w-3" />;
  return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
};

export default function LeadsTable() {
  const {
    clients,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    searchQuery,
    statusFilter,
    sortField,
    sortDirection,
    setSearchQuery,
    setStatusFilter,
    setPage,
    setPageSize,
    setSortField,
    fetchClients,
    setEditingClient,
    setDeletingClient,
  } = useClientStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Fetch on filter/sort/page changes
  useEffect(() => {
    fetchClients();
  }, [page, pageSize, searchQuery, statusFilter, sortField, sortDirection]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        sortable: true,
        cell: ({ row }) => (
          <div className="font-medium text-foreground">{row.original.name}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        sortable: false,
        cell: ({ row }) => (
          <a
            href={`mailto:${row.original.email}`}
            className="text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.email}
          </a>
        ),
      },
      {
        accessorKey: 'profession',
        header: 'Profession',
        sortable: false,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.profession}</span>
        ),
      },
      {
        accessorKey: 'website_url',
        header: 'Website',
        sortable: false,
        cell: ({ row }) => {
          const url = row.original.website_url;
          if (!url) return <span className="text-sm text-muted-foreground">-</span>;
          return (
            <a
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {url.length > 25 ? `${url.slice(0, 25)}...` : url}
            </a>
          );
        },
      },
      {
        accessorKey: 'shopify_page',
        header: 'Shopify',
        sortable: false,
        cell: ({ row }) => {
          const url = row.original.shopify_page;
          if (!url) return <span className="text-sm text-muted-foreground">-</span>;
          return (
            <a
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {url.length > 25 ? `${url.slice(0, 25)}...` : url}
            </a>
          );
        },
      },
      {
        accessorKey: 'portfolio_url',
        header: 'Portfolio',
        sortable: false,
        cell: ({ row }) => {
          const url = row.original.portfolio_url;
          if (!url) return <span className="text-sm text-muted-foreground">-</span>;
          return (
            <a
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {url.length > 25 ? `${url.slice(0, 25)}...` : url}
            </a>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        sortable: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        sortable: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.original.created_at
              ? format(new Date(row.original.created_at), 'MMM dd, yyyy')
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated',
        sortable: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {row.original.updated_at
              ? format(new Date(row.original.updated_at), 'MMM dd, yyyy')
              : '-'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        sortable: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setEditingClient(row.original)}
                className="gap-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletingClient(row.original)}
                className="gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [setEditingClient, setDeletingClient]
  );

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    state: {
      sorting: [{ id: sortField, desc: sortDirection === 'desc' }],
    },
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await clientService.exportLeads(searchQuery, statusFilter);
      if (data.length > 0) {
        exportToCSV(data);
        toast.success(`${data.length} leads exported successfully!`);
      } else {
        toast.error('No leads to export');
      }
    } catch (err) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const from = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, totalCount);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/20">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button
          onClick={fetchClients}
          variant="outline"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">All Leads</h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {totalCount}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by name, email, profession..."
                className="w-full pl-9 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter || '__all'}
                onValueChange={(v) => setStatusFilter(v === '__all' ? '' : v)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All Statuses</SelectItem>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting || totalCount === 0}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  const isSortable = header.column.columnDef.sortable;
                  return (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap"
                      style={{ cursor: isSortable ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (isSortable) {
                          setSortField(header.column.id);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {isSortable && (
                          <SortIcon
                            sorted={
                              sortField === header.column.id
                                ? sortDirection === 'asc'
                                  ? 'asc'
                                  : 'desc'
                                : null
                            }
                          />
                        )}
                      </div>
                    </TableHead>
                  );
                })
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="mb-2 h-8 w-8 opacity-40" />
                    <p className="text-sm font-medium">
                      {searchQuery || statusFilter
                        ? 'No leads match your filters'
                        : 'No leads found'}
                    </p>
                    <p className="text-xs">
                      {searchQuery || statusFilter
                        ? 'Try adjusting your search or filter criteria'
                        : 'Create your first lead to get started'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-muted/50"
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
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {from} to {to} of {totalCount} leads
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TABLE_PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="mx-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
