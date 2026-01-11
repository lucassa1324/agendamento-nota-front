import { Package, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: "name" | "price" | "status";
  setSortBy: (value: "name" | "price" | "status") => void;
  showAddForm: boolean;
  setShowAddForm: (value: boolean) => void;
}

export function InventoryHeader({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  showAddForm,
  setShowAddForm,
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          Gestão de Inventário
        </h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto"
          variant={showAddForm ? "outline" : "default"}
        >
          {showAddForm ? (
            "Cancelar"
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 sm:gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value: "name" | "price" | "status") =>
              setSortBy(value)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="price">Preço</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
