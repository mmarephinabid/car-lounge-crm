"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceStatusBadge } from "@/components/business/invoice-status-badge";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusTabs = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export default function InvoicesPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.invoices.list.useQuery({
    status: status || undefined,
    page,
    limit: 20,
  });

  const { data: overdueInvoices } = trpc.invoices.getOverdue.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your invoices and payments
          </p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueInvoices && overdueInvoices.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">
                {overdueInvoices.length} Overdue Invoice{overdueInvoices.length > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                Total outstanding:{" "}
                {formatCurrency(
                  overdueInvoices.reduce(
                    (sum, inv) => sum + parseFloat(inv.balanceDue),
                    0
                  )
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={status === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {status ? statusTabs.find((t) => t.value === status)?.label : "All"} Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{invoice.invoiceNumber}</span>
                          <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.customer?.name || "Unknown Customer"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Issued: {formatDate(invoice.issueDate)}
                          {invoice.dueDate && ` • Due: ${formatDate(invoice.dueDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(parseFloat(invoice.total))}
                      </p>
                      {parseFloat(invoice.balanceDue) > 0 && (
                        <p className="text-sm text-destructive">
                          Balance: {formatCurrency(parseFloat(invoice.balanceDue))}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium">No invoices found</p>
              <p className="text-muted-foreground">
                Invoices are created when jobs are completed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
