"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  UserCog,
  Phone,
  Mail,
  Building2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function EmployeesPage() {
  const { data: employees, isLoading } = trpc.employees.list.useQuery({
    activeOnly: true,
  });

  const { data: expiringDocs } = trpc.employees.getExpiringDocuments.useQuery({
    daysAhead: 30,
  });

  const { data: departments } = trpc.employees.getDepartments.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your team and HR documents
          </p>
        </div>
        <Button asChild>
          <Link href="/employees/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </div>

      {/* Document Expiry Alert */}
      {expiringDocs && expiringDocs.length > 0 && (
        <Card className="border-warning bg-yellow-500/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-700">
                {expiringDocs.length} Employee Document{expiringDocs.length > 1 ? "s" : ""} Expiring Soon
              </p>
              <p className="text-sm text-muted-foreground">
                Check Emirates ID, Passport, Visa, and Labour Card expiry dates
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              View Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Departments */}
      {departments && departments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">All ({employees?.length || 0})</Badge>
          {departments.map((dept) => (
            <Badge key={dept} variant="outline">
              {dept}
            </Badge>
          ))}
        </div>
      )}

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : employees && employees.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {employees.map((employee) => (
                <Link
                  key={employee.id}
                  href={`/employees/${employee.id}`}
                  className="block"
                >
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{employee.name}</p>
                            <Badge variant="outline">{employee.employeeNumber}</Badge>
                          </div>
                          <p className="text-sm text-primary">{employee.position}</p>
                          {employee.department && (
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {employee.department}
                            </p>
                          )}
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            {formatCurrency(parseFloat(employee.salary))} /month
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <UserCog className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium">No employees found</p>
              <p className="text-muted-foreground">
                Add your team members to get started
              </p>
              <Button className="mt-4" asChild>
                <Link href="/employees/new">Add Employee</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
