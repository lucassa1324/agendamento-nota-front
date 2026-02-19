"use client";

import {
  CheckCircle2,
  ExternalLink,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AccessReleaseModal } from "@/components/admin/access-release-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";

interface CompanyMasterData {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  subscriptionStatus: string;
  trialEndsAt: string;
  accessType: string;
  createdAt: string;
  ownerEmail: string;
  ownerName?: string; // Mantendo opcional caso não venha
}

export default function MasterBusinessesPage() {
  const [companies, setCompanies] = useState<CompanyMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyMasterData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/admin/master/businesses`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error(`Erro ao buscar empresas: Status ${response.status}`);
        const errorText = await response.text();
        console.error(`Detalhes do erro: ${errorText}`);

        if (response.status === 403) {
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para visualizar empresas.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(`Falha ao buscar empresas (${response.status})`);
      }

      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de empresas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleOpenModal = (company: CompanyMasterData) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
      case "trialing":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Trial</Badge>;
      case "past_due":
        return <Badge variant="destructive">Pagamento Pendente</Badge>;
      case "unpaid":
        return <Badge variant="destructive">Não Pago</Badge>;
      case "canceled":
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Empresas</h1>
        <p className="text-muted-foreground">
          Controle de assinaturas e acesso das empresas cadastradas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>
            Visualize status de pagamento e libere acesso manualmente.
          </CardDescription>
          <div className="flex items-center space-x-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, slug ou email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchCompanies}>
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status Assinatura</TableHead>
                  <TableHead>Tipo Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma empresa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.name}
                        {company.ownerEmail && (
                          <span className="block text-xs text-muted-foreground">
                            {company.ownerEmail}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{company.slug}</TableCell>
                      <TableCell>{getStatusBadge(company.subscriptionStatus)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {company.accessType || "Padrão"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {company.subscriptionStatus !== "active" ? (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => handleOpenModal(company)}
                            >
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Liberar Acesso
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleOpenModal(company)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Ativo
                            </Button>
                          )}
                          
                          <Button size="icon" variant="ghost" asChild>
                            <a 
                              href={`/admin/${company.slug}/dashboard/overview`} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AccessReleaseModal 
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
