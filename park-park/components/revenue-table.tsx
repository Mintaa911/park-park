"use client";

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { MonthlyRevenue } from "@/types"; // adjust path

export const columns: ColumnDef<MonthlyRevenue>[] = [
  {
    accessorKey: "lot_name",
    header: "Lot Name",
  },
  {
    accessorKey: "month",
    header: "Month",
  },
  {
    accessorKey: "booking",
    header: "Booking Count",
  },
  {
    accessorKey: "revenue",
    header: "Revenue ($)",
    cell: ({ getValue }) => {
      const raw = getValue();
      const value = typeof raw === "number" && !isNaN(raw) ? raw : 0;
      return `$${value.toFixed(2)}`;
      // const value = getValue() as number;
      // return `$${value.toFixed(2)}`;
    },
  },
];

export function RevenueTable({ data }: { data: MonthlyRevenue[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDownload = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "monthly_revenue.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Monthly Revenue Per Lot</h2>
        <Button onClick={handleDownload}>Download CSV</Button>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No revenue data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
