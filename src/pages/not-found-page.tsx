import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Routes } from "@/router/routes";

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-5xl font-semibold tracking-tight text-muted-foreground">
        404
      </p>
      <p className="text-sm text-muted-foreground">
        This page could not be found.
      </p>
      <Button asChild variant="outline">
        <Link to={Routes.home}>Back to editor</Link>
      </Button>
    </div>
  );
}
