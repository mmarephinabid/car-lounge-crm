import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  booked: { label: "Booked", variant: "info" },
  checked_in: { label: "Checked In", variant: "info" },
  in_progress: { label: "In Progress", variant: "warning" },
  qc_pending: { label: "QC Pending", variant: "warning" },
  qc_passed: { label: "QC Passed", variant: "success" },
  ready: { label: "Ready", variant: "success" },
  delivered: { label: "Delivered", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

interface JobStatusBadgeProps {
  status: string;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
