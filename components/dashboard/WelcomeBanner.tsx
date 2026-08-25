import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeBanner() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Request Management Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review, approve, and manage official requests or export PDF reports.
        </p>
      </div>
      <Link href="/request-form">
        <Button className="gap-2 cursor-pointer font-semibold">
          <FileText className="size-4" />
          Open Request Form
        </Button>
      </Link>
    </div>
  );
}
