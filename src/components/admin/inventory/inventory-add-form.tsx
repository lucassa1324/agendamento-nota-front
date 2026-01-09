import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InventoryAddFormProps {
  newItem: {
    name: string;
    quantity: string;
    minQuantity: string;
    price: string;
    unit: string;
    secondaryUnit?: string;
    conversionFactor?: string;
  };
  setNewItem: (item: {
    name: string;
    quantity: string;
    minQuantity: string;
    price: string;
    unit: string;
    secondaryUnit?: string;
    conversionFactor?: string;
  }) => void;
  handleAddItem: () => void;
  setShowAddForm: (show: boolean) => void;
}

export function InventoryAddForm({
  newItem,
  setNewItem,
  handleAddItem,
  setShowAddForm,
}: InventoryAddFormProps) {
  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-sm sm:text-base font-bold text-primary">Novo Produto</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="name">Nome do Produto</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Insira o nome completo do item (ex: Henna, Pinça, etc).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="name"
                placeholder="Ex: Henna Profissional"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="quantity">Quantidade Inicial</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quantidade total que você tem disponível agora.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                placeholder="Ex: 10"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="min-quantity">Estoque Mínimo</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>O sistema avisará quando o estoque for igual ou menor que este valor.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="min-quantity"
                type="number"
                step="0.001"
                placeholder="Ex: 2"
                value={newItem.minQuantity}
                onChange={(e) => setNewItem({ ...newItem, minQuantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="price">Preço Unitário (R$)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Valor pago por cada unidade do produto.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Ex: 45.90"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="unit">Unidade Principal</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Como você compra o produto (pacote, vidro, etc).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={newItem.unit}
                onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade (un)</SelectItem>
                  <SelectItem value="kg">Quilograma (kg)</SelectItem>
                  <SelectItem value="g">Grama (g)</SelectItem>
                  <SelectItem value="lt">Litro (lt)</SelectItem>
                  <SelectItem value="ml">Mililitro (ml)</SelectItem>
                  <SelectItem value="pct">Pacote (pct)</SelectItem>
                  <SelectItem value="cx">Caixa (cx)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="secondary-unit">Unidade Secundária (Consumo)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unidade menor usada para consumo (ex: se o produto é pacote, a secundária é gramas).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={newItem.secondaryUnit}
                onValueChange={(value) => setNewItem({ ...newItem, secondaryUnit: value })}
              >
                <SelectTrigger id="secondary-unit">
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade (un)</SelectItem>
                  <SelectItem value="kg">Quilograma (kg)</SelectItem>
                  <SelectItem value="g">Grama (g)</SelectItem>
                  <SelectItem value="lt">Litro (lt)</SelectItem>
                  <SelectItem value="ml">Mililitro (ml)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="conversion-factor">Fator de Conversão</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quantas unidades secundárias tem em uma unidade principal? (Ex: 1 pacote tem 500g, fator = 500).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="conversion-factor"
                type="number"
                step="0.001"
                placeholder="Ex: 500"
                value={newItem.conversionFactor}
                onChange={(e) => setNewItem({ ...newItem, conversionFactor: e.target.value })}
              />
            </div>
          </div>
        </TooltipProvider>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button onClick={handleAddItem} className="w-full sm:w-auto">Adicionar</Button>
          <Button variant="outline" onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
