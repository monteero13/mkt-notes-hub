"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Search, ArrowUpDown, Edit, Trash2, ExternalLink, Building2, User, Mail, DollarSign } from "lucide-react";
import type { Client } from "@/types";
import { formatCurrency } from "@/lib/utils/workspace";
import { deleteClient } from "@/actions/clients";
import { toast } from "sonner";
import { EditClientDialog } from "./edit-client-dialog";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted/10 text-muted-foreground border-border",
  prospect: "bg-brand/10 text-brand border-brand/20",
  churned: "bg-error/10 text-error border-error/20",
};

const helper = createColumnHelper<Client>();

interface Props {
  clients: Client[];
  workspaceId: string;
}

export function ClientsTable({ clients, workspaceId }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const t = useTranslations("clientes");

  const columns = [
    helper.accessor("company_name", {
      header: ({ column }) => (
        <button className="flex items-center gap-2 technical-label text-[10px] uppercase tracking-widest hover:text-brand transition-colors" onClick={() => column.toggleSorting()}>
          {t("table.organization")} <ArrowUpDown size={10} />
        </button>
      ),
      cell: (info) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-8 w-8 rounded-sm bg-accent/5 border border-border flex items-center justify-center text-brand font-black uppercase text-[10px]">
            {info.getValue().charAt(0)}
          </div>
          <div>
            <div className="text-[12px] font-black uppercase tracking-tight text-foreground leading-none mb-1">{info.getValue()}</div>
            {info.row.original.contact_name && (
              <div className="text-[9px] technical-label opacity-40 uppercase tracking-widest">{info.row.original.contact_name}</div>
            )}
          </div>
        </div>
      ),
    }),
    helper.accessor("niche", {
      header: () => <span className="technical-label text-[10px] uppercase tracking-widest">{t("table.sector")}</span>,
      cell: (info) => info.getValue() ? (
        <Badge variant="outline" className="rounded-sm border-border bg-accent/5 technical-label text-[8px] uppercase tracking-widest px-2 py-0.5">
          {info.getValue()}
        </Badge>
      ) : <span className="technical-label text-[8px] opacity-20 uppercase tracking-widest">{t("table.sector")}</span>,
    }),
    helper.accessor("contact_email", {
      header: () => <span className="technical-label text-[10px] uppercase tracking-widest">{t("table.link")}</span>,
      cell: (info) => info.getValue()
        ? <a href={`mailto:${info.getValue()}`} className="text-[11px] font-bold text-muted-foreground hover:text-brand transition-colors lowercase">{info.getValue()}</a>
        : <span className="technical-label text-[8px] opacity-20">—</span>,
    }),
    helper.accessor("monthly_retainer", {
      header: ({ column }) => (
        <button className="flex items-center gap-2 technical-label text-[10px] uppercase tracking-widest hover:text-brand transition-colors" onClick={() => column.toggleSorting()}>
          {t("table.retainer")} <ArrowUpDown size={10} />
        </button>
      ),
      cell: (info) => info.getValue()
        ? <span className="contundente-number text-brand text-[14px] font-black">{formatCurrency(info.getValue()!)}</span>
        : <span className="technical-label text-[8px] opacity-20">—</span>,
    }),
    helper.accessor("status", {
      header: () => <span className="technical-label text-[10px] uppercase tracking-widest">{t("table.status")}</span>,
      cell: (info) => (
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-sm border technical-label text-[8px] uppercase tracking-widest",
          STATUS_STYLES[info.getValue()] ?? STATUS_STYLES.inactive
        )}>
          {t(`status.${info.getValue()}`)}
        </span>
      ),
    }),
    helper.display({
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:bg-accent/5">
                <MoreHorizontal size={14} className="opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-sm border-border bg-card p-1 shadow-2xl">
              <DropdownMenuItem onClick={() => setEditingClient(row.original)} className="p-2 rounded-sm technical-label text-[9px] uppercase tracking-widest cursor-pointer">
                <Edit size={12} className="mr-2 opacity-60" /> {t("table.modify_dossier")}
              </DropdownMenuItem>
              {row.original.website && (
                <DropdownMenuItem asChild className="p-2 rounded-sm technical-label text-[9px] uppercase tracking-widest cursor-pointer">
                  <a href={row.original.website} target="_blank" rel="noreferrer">
                    <ExternalLink size={12} className="mr-2 opacity-60" /> {t("table.neural_link")}
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="p-2 rounded-sm technical-label text-[9px] uppercase tracking-widest text-error cursor-pointer focus:bg-error/10 focus:text-error"
                onClick={async () => {
                  if (!confirm(t("table.terminate_confirm"))) return;
                  const result = await deleteClient(row.original.id, workspaceId);
                  if (result.error) toast.error(result.error);
                  else toast.success(t("table.terminate_success"));
                }}
              >
                <Trash2 size={12} className="mr-2" /> {t("table.terminate")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: clients,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-brand transition-colors" />
          <Input
            placeholder={t("table.search_placeholder")}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 rounded-sm border-border bg-accent/5 pl-10 text-[11px] font-bold tracking-tight transition-all placeholder:text-muted-foreground/30 focus:border-brand focus:ring-0 outline-none"
          />
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-accent/5">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-border hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 border-none">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="py-24 text-center border-none">
                  <div className="flex flex-col items-center gap-4">
                    <Building2 className="h-12 w-12 text-muted-foreground/10" />
                    <span className="technical-label text-[10px] opacity-40 uppercase tracking-widest">
                      {t("table.empty_state")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border hover:bg-accent/5 transition-colors group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 border-none">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingClient && (
        <EditClientDialog
          client={editingClient}
          workspaceId={workspaceId}
          onClose={() => setEditingClient(null)}
        />
      )}
    </div>
  );
}
