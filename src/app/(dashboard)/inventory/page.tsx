"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Package,
  Search,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data: products, isLoading } = trpc.inventory.list.useQuery({
    search: search || undefined,
    lowStockOnly,
  });

  const { data: lowStockProducts } = trpc.inventory.getLowStock.useQuery();
  const { data: categories } = trpc.inventory.getCategories.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage products and stock levels
          </p>
        </div>
        <Button asChild>
          <Link href="/inventory/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <Card className="border-warning bg-yellow-500/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-700">
                {lowStockProducts.length} Product{lowStockProducts.length > 1 ? "s" : ""} Low on Stock
              </p>
              <p className="text-sm text-muted-foreground">
                These items need to be reordered soon
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setLowStockOnly(true)}
            >
              View Low Stock
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant={lowStockOnly ? "default" : "outline"}
              onClick={() => setLowStockOnly(!lowStockOnly)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Low Stock Only
            </Button>
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {lowStockOnly ? "Low Stock Products" : "All Products"} ({products?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => {
                const isLowStock = product.stockQuantity <= product.minStockLevel;
                return (
                  <Link
                    key={product.id}
                    href={`/inventory/${product.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.name}</span>
                            <Badge variant="outline">{product.sku}</Badge>
                            {product.category && (
                              <Badge variant="secondary">{product.category}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Cost: {formatCurrency(parseFloat(product.costPrice))}</span>
                            <span>Sell: {formatCurrency(parseFloat(product.sellingPrice))}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {isLowStock && (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                          <span
                            className={`text-lg font-semibold ${
                              isLowStock ? "text-yellow-600" : ""
                            }`}
                          >
                            {product.stockQuantity} {product.unit}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Min: {product.minStockLevel}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium">No products found</p>
              <p className="text-muted-foreground">
                {search || lowStockOnly
                  ? "Try different filters"
                  : "Add products to your inventory"}
              </p>
              {!search && !lowStockOnly && (
                <Button className="mt-4" asChild>
                  <Link href="/inventory/new">Add Product</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
