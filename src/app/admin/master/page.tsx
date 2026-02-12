"use client";

import { useState, useEffect } from "react";
import { 
  Users,
  Store,
  Calendar,
  CheckCircle2,
  Search, 
  Power, 
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Mail,
  ShieldAlert
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/auth-client";

interface UserMasterData {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  companyName: string | null;
  companySlug: string | null;
}

interface MasterStats {
  totalUsers: number;
  totalCompanies: number;
  totalAppointments: number;
  activeCompanies: number;
}

export default function MasterDashboardPage() {
  console.log(">>> [MASTER_PAGE] Renderizando Dashboard Master...");
  const [users, setUsers] = useState<UserMasterData[]>([]);
  const [stats, setStats] = useState<MasterStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Estados para Edição de Email
  const [editingUser, setEditingUser] = useState<UserMasterData | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Buscar Estatísticas
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/master/stats`, {
        credentials: "include",
      });
      if (statsRes.status === 403) return handleForbidden();
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Buscar Usuários e Estúdios
      const usersRes = await fetch(`${API_BASE_URL}/api/admin/master/users`, {
        credentials: "include",
        headers: { "Accept": "application/json" },
      });
      if (usersRes.status === 403) return handleForbidden();
      if (!usersRes.ok) throw new Error("Falha ao buscar usuários");
      
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (error) {
      console.error(">>> [MASTER_ADMIN] Erro ao carregar dados:", error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível carregar os dados da dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForbidden = () => {
    toast({
      title: "Acesso Negado",
      description: "Você não tem permissão de Super Admin.",
      variant: "destructive",
    });
    window.location.href = "/admin"; // Redireciona para login
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/master/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (response.status === 403) return handleForbidden();
      if (!response.ok) throw new Error("Falha ao atualizar status");

      setUsers(prev => 
        prev.map(u => u.id === id ? { ...u, active: !currentStatus } : u)
      );

      toast({
        title: "Status Atualizado",
        description: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEmail = async () => {
    if (!editingUser || !newEmail) return;
    
    setIsUpdatingEmail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/master/users/${editingUser.id}/email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail }),
      });

      if (response.status === 403) return handleForbidden();
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Erro ao atualizar email");
      }

      setUsers(prev => 
        prev.map(u => u.id === editingUser.id ? { ...u, email: newEmail } : u)
      );

      toast({ 
        title: "Sucesso", 
        description: "Email atualizado com sucesso." 
      });
      setEditingUser(null);
    } catch (error: any) {
      toast({
        title: "Erro na Atualização",
        description: error.message || "O email pode já estar em uso.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Controle Master</h1>
        <p className="text-muted-foreground">Gerencie todos os usuários e estúdios da plataforma.</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? "..."}</div>
            <p className="text-xs text-muted-foreground">Contas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estúdios Ativos</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCompanies ?? "..."}</div>
            <p className="text-xs text-muted-foreground">de {stats?.totalCompanies ?? "..."} totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAppointments ?? "..."}</div>
            <p className="text-xs text-muted-foreground">Em toda a rede</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operacional</div>
            <p className="text-xs text-muted-foreground">Back-end conectado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Gerenciamento */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários e Estúdios</CardTitle>
          <CardDescription>
            Ative/desative contas ou altere dados de acesso.
          </CardDescription>
          <div className="flex items-center space-x-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou estúdio..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchData}>
              Atualizar Lista
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Estúdio</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-center">Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${ 
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700' 
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.companyName ? (
                          <div className="flex items-center space-x-1">
                            <span>{user.companyName}</span>
                            <a 
                              href={`/admin/${user.companySlug}/dashboard/overview`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Sem estúdio</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={user.active}
                            onCheckedChange={() => toggleUserStatus(user.id, user.active)}
                            disabled={user.role === 'SUPER_ADMIN'} // Não permite desativar a si mesmo ou outros masters
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => {
                                setEditingUser(user);
                                setNewEmail(user.email);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Editar Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 cursor-pointer"
                              onClick={() => toggleUserStatus(user.id, user.active)}
                            >
                              <Power className="mr-2 h-4 w-4" /> 
                              {user.active ? "Desativar Conta" : "Ativar Conta"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Email */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Editar Email de Acesso</DialogTitle>
            <DialogDescription>
              Altere o email do usuário <strong>{editingUser?.name}</strong>. Isso mudará o login dele.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Novo Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="col-span-3"
                placeholder="exemplo@email.com"
              />
            </div>
            {editingUser?.role === 'SUPER_ADMIN' && (
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 text-xs">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Atenção: Você está alterando o email de um administrador Master.</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isUpdatingEmail}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateEmail} disabled={isUpdatingEmail || !newEmail}>
              {isUpdatingEmail ? "Salvando..." : "Salvar Alteração"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
