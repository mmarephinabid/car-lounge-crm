"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  DollarSign,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function ServicesPage() {
  const { data: services, isLoading } = trpc.services.list.useQuery({
    activeOnly: true,
  });

  const { data: categories } = trpc.services.getCategories.useQuery();

  // Group services by category
  const servicesByCategory = services?.reduce((acc, service) => {
    const category = service.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Manage your service offerings and pricing
          </p>
        </div>
        <Button asChild>
          <Link href="/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Link>
        </Button>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">All ({services?.length || 0})</Badge>
          {categories.map((category) => (
            <Badge key={category} variant="outline">
              {category} ({servicesByCategory?.[category]?.length || 0})
            </Badge>
          ))}
        </div>
      )}

      {/* Services by Category */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : servicesByCategory && Object.keys(servicesByCategory).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category}
                  <Badge variant="secondary">{categoryServices?.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryServices?.map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.id}`}
                      className="block"
                    >
                      <Card className="transition-colors hover:bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <p className="font-medium">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {service.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-2">
                              <span className="flex items-center gap-1 text-lg font-semibold text-green-600">
                                <DollarSign className="h-4 w-4" />
                                {formatCurrency(parseFloat(service.defaultPrice))}
                              </span>
                              {service.estimatedTime && (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {Math.floor(service.estimatedTime / 60)}h{" "}
                                  {service.estimatedTime % 60}m
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium">No services found</p>
            <p className="text-muted-foreground">
              Add your service offerings to get started
            </p>
            <Button className="mt-4" asChild>
              <Link href="/services/new">Add Service</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
