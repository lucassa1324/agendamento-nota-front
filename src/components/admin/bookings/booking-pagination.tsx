import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

export function BookingPagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: BookingPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-border/40">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(1)}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          className={`h-8 w-8 rounded-xl border-0 ${
            currentPage === page
              ? "bg-primary text-primary-foreground"
              : "bg-muted/40 hover:bg-muted"
          }`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(totalPages)}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
