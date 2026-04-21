import { HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { InventoryItem } from "@/lib/inventory-service";

interface InventoryAddFormProps {
  newItem: {
    name: string;
    quantity: string;
    minQuantity: string;
    price: string;
    unit: string;
    secondaryUnit?: string;
    conversionFactor?: string;
    isShared?: boolean;
  };
  setNewItem: (item: {
    name: string;
    quantity: string;
    minQuantity: string;
    price: string;
    unit: string;
    secondaryUnit?: string;
    conversionFactor?: string;
    isShared?: boolean;
  }) => void;
  onNameChange: (value: string) => void;
  handleAddItem: () => void;
  setShowAddForm: (show: boolean) => void;
  matchingItems: InventoryItem[];
  exactMatchItem: InventoryItem | null;
  onOpenQuickEntry: (item: InventoryItem) => void;
  isDuplicateBlocked: boolean;
  isLoading?: boolean;
}

function HelpHint({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ajuda"
          className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onMouseEnter={() => {
            clearCloseTimer();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
          onClick={() => {
            clearCloseTimer();
            setOpen((prev) => !prev);
          }}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-2 text-xs"
        onMouseEnter={clearCloseTimer}
        onMouseLeave={scheduleClose}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function InventoryAddForm({
  newItem,
  setNewItem,
  onNameChange,
  handleAddItem,
  setShowAddForm,
  matchingItems,
  exactMatchItem,
  onOpenQuickEntry,
  isDuplicateBlocked,
  isLoading = false,
}: InventoryAddFormProps) {
  const landingPageUrl = (process.env.NEXT_PUBLIC_LANDING_PAGE_URL || "").replace(
    /\/$/,
    "",
  );
  const tutorialsUrl = landingPageUrl ? `${landingPageUrl}/tutorials` : "/tutorials";

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-sm sm:text-base font-bold text-primary">
          Novo Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="mb-4 rounded-md border border-primary/20 bg-background p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            Dica rápida para preencher:
          </p>
          <p>
            1) Escolha como você compra o produto em{" "}
            <strong>Unidade Principal</strong> (ex: caixa, unidade, pacote).
          </p>
          <p>
            2) Em <strong>Quantidade Inicial</strong>, informe o total nessa
            unidade principal (se compra em caixa, informe em caixa).
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="name">Nome do Produto</Label>
                <HelpHint>
                  <p>Insira o nome completo do item (ex: Henna, Pinça, etc).</p>
                </HelpHint>
              </div>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="Ex: Henna Profissional"
                  value={newItem.name ?? ""}
                  disabled={isLoading}
                  onChange={(e) => onNameChange(e.target.value)}
                />
                {matchingItems.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
                    <div className="px-2 py-1.5 border-b text-xs font-medium">
                      Produtos encontrados
                    </div>
                    <div className="max-h-40 overflow-y-auto p-1">
                      <div className="space-y-1">
                        {matchingItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="w-full text-left text-xs rounded border px-2 py-1 hover:bg-muted transition-colors"
                            onClick={() => onOpenQuickEntry(item)}
                            disabled={isLoading}
                          >
                            {item.name} ({item.unit})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {isDuplicateBlocked && exactMatchItem && (
                <div className="rounded-md border border-red-300 bg-red-50 p-2 text-xs text-red-800">
                  Produto já cadastrado: <strong>{exactMatchItem.name}</strong>.
                  Para evitar duplicidade, faça a entrada rápida neste item.
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 ml-1 text-red-800 underline"
                    onClick={() => onOpenQuickEntry(exactMatchItem)}
                    disabled={isLoading}
                  >
                    Dar entrada neste produto
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="quantity">Quantidade Inicial</Label>
                <HelpHint>
                  <p>Quantidade total que você tem disponível agora.</p>
                </HelpHint>
              </div>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                placeholder="Ex: 10"
                value={newItem.quantity ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                A quantidade inicial sempre usa a{" "}
                <strong>Unidade Principal</strong>.
                {newItem.unit
                  ? ` Exemplo: se você compra em ${newItem.unit}, informe em ${newItem.unit}.`
                  : ""}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="min-quantity">
                  Estoque Mínimo{" "}
                  {newItem.secondaryUnit
                    ? `(${newItem.secondaryUnit})`
                    : newItem.unit
                      ? `(${newItem.unit})`
                      : ""}
                </Label>
                <HelpHint>
                  <p>
                    O sistema avisará quando o estoque for igual ou menor que
                    este valor.
                    {newItem.secondaryUnit && (
                      <>
                        <br />
                        <strong>Dica:</strong> Use a unidade de consumo (
                        {newItem.secondaryUnit}) para o alerta.
                      </>
                    )}
                  </p>
                </HelpHint>
              </div>
              <Input
                id="min-quantity"
                type="number"
                step="0.001"
                placeholder="Ex: 2"
                value={newItem.minQuantity ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  setNewItem({ ...newItem, minQuantity: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="price">Preço Unitário (R$)</Label>
                <HelpHint>
                  <p>Valor pago por cada unidade do produto.</p>
                </HelpHint>
              </div>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Ex: 45.90"
                value={newItem.price ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="unit">Unidade Principal</Label>
                <HelpHint>
                  <p>Como você compra o produto (pacote, vidro, etc).</p>
                </HelpHint>
              </div>
              <Select
                value={newItem.unit}
                disabled={isLoading}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, unit: value })
                }
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade (un)</SelectItem>
                  <SelectItem value="kg">Quilograma (kg)</SelectItem>
                  <SelectItem value="g">Grama (g)</SelectItem>
                  <SelectItem value="mg">Miligrama (mg)</SelectItem>
                  <SelectItem value="lt">Litro (lt)</SelectItem>
                  <SelectItem value="ml">Mililitro (ml)</SelectItem>
                  <SelectItem value="pct">Pacote (pct)</SelectItem>
                  <SelectItem value="cx">Caixa (cx)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Exemplo: se você compra em caixa, selecione{" "}
                <strong>Caixa (cx)</strong> e informe a quantidade em caixas.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="secondary-unit">
                  Unidade Secundária (Consumo)
                </Label>
                <HelpHint>
                  <p>
                    Unidade menor usada para consumo (ex: se o produto é
                    pacote, a secundária é gramas).
                  </p>
                </HelpHint>
              </div>
              <Select
                value={newItem.secondaryUnit}
                disabled={isLoading}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, secondaryUnit: value })
                }
              >
                <SelectTrigger id="secondary-unit">
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade (un)</SelectItem>
                  <SelectItem value="kg">Quilograma (kg)</SelectItem>
                  <SelectItem value="g">Grama (g)</SelectItem>
                  <SelectItem value="mg">Miligrama (mg)</SelectItem>
                  <SelectItem value="lt">Litro (lt)</SelectItem>
                  <SelectItem value="ml">Mililitro (ml)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Opcional: use para controlar consumo em unidade menor (ex:
                caixa -&gt; unidade, pacote -&gt; grama).
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="conversion-factor">Fator de Conversão</Label>
                <HelpHint>
                  <p>
                    Quantas unidades secundárias tem em uma unidade principal?
                    (Ex: 1 pacote tem 500g, fator = 500).
                  </p>
                </HelpHint>
              </div>
              <Input
                id="conversion-factor"
                type="number"
                step="0.001"
                placeholder="Ex: 500"
                value={newItem.conversionFactor ?? ""}
                disabled={isLoading}
                onChange={(e) =>
                  setNewItem({ ...newItem, conversionFactor: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: 1 caixa com 20 unidades = fator <strong>20</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="is-shared">
                  Item de uso compartilhado (EPI)
                </Label>
                <HelpHint>
                  <p>
                    Se ativado, este item será cobrado apenas uma vez por
                    atendimento, mesmo que o cliente realize múltiplos serviços
                    que o utilizem.
                  </p>
                </HelpHint>
              </div>
              <div className="flex items-center h-10">
                <Switch
                  id="is-shared"
                  checked={newItem.isShared || false}
                  onCheckedChange={(checked) =>
                    setNewItem({ ...newItem, isShared: checked })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="is-shared" className="ml-2 cursor-pointer">
                  {newItem.isShared ? "Sim" : "Não"}
                </Label>
              </div>
            </div>
          </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            onClick={handleAddItem}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAddForm(false)}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Precisa de ajuda? Veja os tutoriais de estoque e consumo de itens em{" "}
          <Link
            href={tutorialsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-primary"
          >
            Tutoriais
          </Link>
          .
        </div>
      </CardContent>
    </Card>
  );
}
