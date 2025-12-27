"use client";

import {
  Check,
  ImageIcon,
  Instagram,
  Loader2,
  Phone,
  Type,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getSiteProfile,
  type SiteProfile,
  saveSiteProfile,
} from "@/lib/booking-data";

export function ProfileManager() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [profile, setProfile] = useState<SiteProfile>({
    name: "",
    description: "",
    logoUrl: "",
    instagram: "",
    whatsapp: "",
    facebook: "",
    tiktok: "",
    linkedin: "",
    x: "",
    phone: "",
    email: "",
    address: "",
    showInstagram: true,
    showWhatsapp: true,
    showFacebook: true,
    showTiktok: false,
    showLinkedin: false,
    showX: false,
  });

  useEffect(() => {
    const savedProfile = getSiteProfile();
    setProfile(savedProfile);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Simula um pequeno delay para feedback visual
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      saveSiteProfile(profile);
      setIsDirty(false);
      setSaveSuccess(true);
      toast({
        title: "Perfil Atualizado",
        description: "As informações do site foram salvas com sucesso.",
      });

      // Remove o estado de sucesso após 3 segundos
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      toast({
        title: "Erro ao Salvar",
        description: "Ocorreu um erro ao tentar salvar as informações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof SiteProfile, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "Erro no Upload",
          description: "A logo deve ter no máximo 4MB.",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateField("logoUrl", base64String);
        toast({
          title: "Logo Carregada",
          description: "A logo foi carregada. Clique em salvar para aplicar.",
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Configure o nome e descrição do seu site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Nome do Site</Label>
            <Input
              id="site-name"
              value={profile.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Ex: Brow Studio"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Descrição</Label>
            <Textarea
              id="site-description"
              value={profile.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Descreva seu studio de sobrancelhas..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="w-5 h-5" />
              Redes Sociais
            </CardTitle>
            <CardDescription>Links para suas redes sociais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="instagram">Instagram</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar Instagram no site
                  </p>
                </div>
                <Switch
                  checked={profile.showInstagram}
                  onCheckedChange={(checked) =>
                    updateField("showInstagram", checked)
                  }
                />
              </div>
              <div className="flex gap-2">
                <span className="flex items-center text-muted-foreground text-sm bg-muted px-3 rounded-md border border-input">
                  @
                </span>
                <Input
                  id="instagram"
                  value={profile.instagram || ""}
                  onChange={(e) => updateField("instagram", e.target.value)}
                  placeholder="usuario"
                  disabled={!profile.showInstagram}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar WhatsApp no site
                  </p>
                </div>
                <Switch
                  checked={profile.showWhatsapp}
                  onCheckedChange={(checked) =>
                    updateField("showWhatsapp", checked)
                  }
                />
              </div>
              <div className="flex gap-2">
                <span className="flex items-center text-muted-foreground text-sm bg-muted px-3 rounded-md border border-input">
                  +55
                </span>
                <Input
                  id="whatsapp"
                  value={profile.whatsapp || ""}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="11999999999"
                  disabled={!profile.showWhatsapp}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="facebook">Facebook</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar Facebook no site
                  </p>
                </div>
                <Switch
                  checked={profile.showFacebook}
                  onCheckedChange={(checked) =>
                    updateField("showFacebook", checked)
                  }
                />
              </div>
              <Input
                id="facebook"
                value={profile.facebook || ""}
                onChange={(e) => updateField("facebook", e.target.value)}
                placeholder="nome.da.pagina"
                disabled={!profile.showFacebook}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar TikTok no site
                  </p>
                </div>
                <Switch
                  checked={profile.showTiktok}
                  onCheckedChange={(checked) =>
                    updateField("showTiktok", checked)
                  }
                />
              </div>
              <div className="flex gap-2">
                <span className="flex items-center text-muted-foreground text-sm bg-muted px-3 rounded-md border border-input">
                  @
                </span>
                <Input
                  id="tiktok"
                  value={profile.tiktok || ""}
                  onChange={(e) => updateField("tiktok", e.target.value)}
                  placeholder="usuario"
                  disabled={!profile.showTiktok}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar LinkedIn no site
                  </p>
                </div>
                <Switch
                  checked={profile.showLinkedin}
                  onCheckedChange={(checked) =>
                    updateField("showLinkedin", checked)
                  }
                />
              </div>
              <Input
                id="linkedin"
                value={profile.linkedin || ""}
                onChange={(e) => updateField("linkedin", e.target.value)}
                placeholder="in/usuario"
                disabled={!profile.showLinkedin}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="x">X (Twitter)</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar X no site
                  </p>
                </div>
                <Switch
                  checked={profile.showX}
                  onCheckedChange={(checked) => updateField("showX", checked)}
                />
              </div>
              <div className="flex gap-2">
                <span className="flex items-center text-muted-foreground text-sm bg-muted px-3 rounded-md border border-input">
                  @
                </span>
                <Input
                  id="x"
                  value={profile.x || ""}
                  onChange={(e) => updateField("x", e.target.value)}
                  placeholder="usuario"
                  disabled={!profile.showX}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contato e Endereço
            </CardTitle>
            <CardDescription>
              Como os clientes podem encontrar você
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone de Contato</Label>
              <Input
                id="phone"
                value={profile.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="contato@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço / Localização</Label>
              <Input
                id="address"
                value={profile.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="São Paulo, SP"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          size="lg"
          className={`w-full md:w-auto transition-all duration-300 ${
            saveSuccess
              ? "bg-green-600 hover:bg-green-700 opacity-100"
              : isDirty
                ? "opacity-100"
                : "opacity-50"
          }`}
          disabled={isSaving || (!isDirty && !saveSuccess)}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Salvo com Sucesso
            </>
          ) : (
            "Salvar Todas as Informações"
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo do Site
          </CardTitle>
          <CardDescription>
            Faça upload da logo do seu studio. Ela aparecerá no cabeçalho,
            rodapé e como ícone do navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label>Logo Principal</Label>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <label
                htmlFor="logo-upload"
                className="relative border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer group flex flex-col items-center justify-center h-full"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload da logo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG ou SVG (máx. 4MB)
                </p>
              </label>
              <input
                id="logo-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />

              {profile.logoUrl && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Pré-visualização
                  </Label>
                  <div className="h-32 w-full bg-muted rounded-lg flex items-center justify-center p-4 border border-border overflow-hidden">
                    <Image
                      src={profile.logoUrl}
                      alt="Logo preview"
                      width={200}
                      height={128}
                      className="max-h-full max-w-full object-contain"
                      unoptimized
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => updateField("logoUrl", "")}
                  >
                    Remover Logo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
