"use client";

import { 
  AlertTriangle, 
  Calendar,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Power, 
  Search, 
  ShieldAlert,
  Store,
  Trash2,
  Users
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";

interface UserMasterData {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  companyId: string | null;
  businessId?: string | null; // Adicionado para compatibilidade com o backend
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
  
  // Estados para Exclusão de Conta
  const [userToDelete, setUserToDelete] = useState<UserMasterData | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleForbidden = useCallback(() => {
    toast({
      title: "Acesso Negado",
      description: "Você não tem permissão de Super Admin.",
      variant: "destructive",
    });
    window.location.href = "/admin"; // Redireciona para login
  }, [toast]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Buscar Estatísticas
      const statsRes = await customFetch(`${API_BASE_URL}/api/admin/master/stats`, {
        credentials: "include",
      });
      if (statsRes.status === 403) return handleForbidden();
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Buscar Usuários e Estúdios
      const usersRes = await customFetch(`${API_BASE_URL}/api/admin/master/users`, {
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
  }, [handleForbidden, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleUserStatus = async (user: UserMasterData) => {
    try {
      const { id, active: currentStatus } = user;
      const targetId = user.companyId || user.businessId;
      
      console.log('>>> [MASTER_ADMIN] ID enviado:', targetId);

      const response = await customFetch(`${API_BASE_URL}/api/admin/master/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          active: !currentStatus,
          companyId: targetId 
        }),
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
      console.error(">>> [MASTER_ADMIN] Erro ao atualizar status:", error);
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
      const response = await customFetch(`${API_BASE_URL}/api/admin/master/users/${editingUser.id}/email`, {
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "O email pode já estar em uso.";
      toast({
        title: "Erro na Atualização",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || confirmCode !== generatedCode) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/master/users/${userToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 403) return handleForbidden();

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erro ao excluir usuário");
      }

      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      
      // Atualiza estatísticas também
      if (stats) {
        setStats({
          ...stats,
          totalUsers: stats.totalUsers - 1,
          totalCompanies: userToDelete.companyId ? stats.totalCompanies - 1 : stats.totalCompanies,
          activeCompanies: userToDelete.active && userToDelete.companyId ? stats.activeCompanies - 1 : stats.activeCompanies,
        });
      }

      toast({
        title: "Usuário Excluído",
        description: "A conta e todos os dados vinculados foram removidos permanentemente.",
      });
      
      setUserToDelete(null);
      setConfirmCode("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao tentar excluir a conta.";
      toast({
        title: "Erro na Exclusão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (user: UserMasterData) => {
    setConfirmCode(""); // Limpa o input anterior
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setUserToDelete(user); // Define o usuário por último para disparar o modal
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.companyName?.toLowerCase().includes(searchTerm.toLowerCase()))
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
                            onCheckedChange={() => toggleUserStatus(user)}
                            disabled={user.role === 'SUPER_ADMIN'} // Não permite desativar a si mesmo ou outros masters
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          {user.role !== 'SUPER_ADMIN' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              type="button"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(user);
                              }}
                              title="Excluir Conta permanentemente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" type="button" className="h-8 w-8">
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
                                onClick={() => toggleUserStatus(user)}
                              >
                                <Power className="mr-2 h-4 w-4" /> 
                                {user.active ? "Desativar Conta" : "Ativar Conta"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 cursor-pointer font-semibold"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  openDeleteModal(user);
                                }}
                                disabled={user.role === 'SUPER_ADMIN'}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir permanentemente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Modal de Exclusão de Conta */}
      <Dialog key={userToDelete?.id || 'delete-modal'} open={!!userToDelete} onOpenChange={(open) => { if (!open) setUserToDelete(null); }}>
        <DialogContent className="sm:max-w-112.5 border-red-100 z-9999">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Exclusão Crítica de Conta
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-900 font-medium">
              Esta ação é <span className="text-red-600 underline">irreversível</span> e apagará permanentemente todos os dados vinculados a <strong>{userToDelete?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-100 p-4 rounded-lg space-y-3 text-sm text-red-800">
            <p className="font-bold flex items-center gap-2">
              O que será apagado:
            </p>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li>Dados do Usuário e Login</li>
              <li>Configurações do Estúdio ({userToDelete?.companyName || "N/A"})</li>
              <li>Todos os Agendamentos e Clientes</li>
              <li>Galeria de Fotos e Serviços</li>
            </ul>
          </div>

          <div className="space-y-4 py-2">
            <div className="space-y-2 text-center py-2 bg-slate-50 rounded-md border border-slate-200">
              <Label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Código de Confirmação</Label>
              <div className="text-3xl font-mono tracking-[0.5em] font-black text-slate-800 select-none">
                {generatedCode}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-code" className="text-sm font-semibold">Digite o código acima para confirmar:</Label>
              <Input
                id="confirm-code"
                placeholder="0000"
                className="text-center font-mono text-xl tracking-widest h-12"
                maxLength={4}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                disabled={isDeleting}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setUserToDelete(null)} 
              disabled={isDeleting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser} 
              disabled={isDeleting || confirmCode !== generatedCode}
              className="flex-1 font-bold"
            >
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
