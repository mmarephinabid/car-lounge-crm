"use client";

import { AlertTriangle, Mail, Phone, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MVPBannerProps {
  variant?: "inline" | "full-page";
  featureName?: string;
}

export function MVPBanner({ variant = "inline", featureName }: MVPBannerProps) {
  if (variant === "full-page") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="max-w-lg border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/50">
                <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-amber-800 dark:text-amber-200">
                {featureName ? `${featureName} - ` : ""}MVP Feature
              </h2>
              <p className="mt-2 text-lg text-amber-700 dark:text-amber-300">
                This is an MVP only
              </p>
              <p className="mt-4 text-amber-600 dark:text-amber-400">
                To get full access to this feature and unlock all capabilities, you need to make a deal with us.
              </p>

              <div className="mt-6 w-full space-y-3 rounded-lg bg-white/80 p-4 dark:bg-gray-900/50">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  Contact Us:
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="h-4 w-4" />
                  <span>The Car Lounge - Dubai, UAE</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>contact@thecarlounge.ae</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>+971 50 123 4567</span>
                </div>
              </div>

              <Button className="mt-6 bg-amber-600 hover:bg-amber-700" asChild>
                <a href="mailto:contact@thecarlounge.ae?subject=Full%20Access%20Request">
                  Request Full Access
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-50/50 p-4 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-200">
            MVP Feature {featureName ? `- ${featureName}` : ""}
          </p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            This is an MVP only. To get full access, you need to make a deal with us.
          </p>
        </div>
      </div>
    </div>
  );
}

export function MVPPageWrapper({
  children,
  featureName
}: {
  children?: React.ReactNode;
  featureName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{featureName}</h1>
          <p className="text-muted-foreground">
            This feature is not available in the MVP
          </p>
        </div>
      </div>

      <MVPBanner variant="full-page" featureName={featureName} />

      {children}
    </div>
  );
}
