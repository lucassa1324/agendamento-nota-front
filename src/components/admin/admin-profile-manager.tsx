"use client";

import {
  Check,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type AdminUser, getStoredAdminUser, saveAdminProfile } from "@/lib/admin-auth";

export function AdminProfileManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<AdminUser>({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    const admin = getStoredAdminUser();
    setProfile(admin);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      saveAdminProfile(profile);
      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado com sucesso.",
      });
      // Disparar evento customizado para atualizar a sidebar imediatamente
      window.dispatchEvent(new CustomEvent('adminProfileUpdated'));
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.current !== profile.password) {
      toast({
        title: "Erro",
        description: "A senha atual está incorreta.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const updatedProfile = { ...profile, password: passwords.new };
      saveAdminProfile(updatedProfile);
      setProfile(updatedProfile);
      setPasswords({ current: "", new: "", confirm: "" });
      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-10"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Usuário de Login</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-10 bg-muted"
                  value={profile.username}
                  disabled
                  placeholder="admin"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                O nome de usuário não pode ser alterado.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={profile.email || ""}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone/WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-10"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Mantenha sua conta segura alterando a senha regularmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Atualizar Senha
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
