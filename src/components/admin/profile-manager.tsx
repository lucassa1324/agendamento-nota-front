"use client";

import imageCompression from "browser-image-compression";
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
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL, useSession } from "@/lib/auth-client";
import type { SiteProfile } from "@/lib/booking-data";

export function ProfileManager() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const { studio, updateStudioInfo } = useStudio();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialProfileRef = useRef<SiteProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Interface para tipagem segura da sessão
  interface SessionUser {
    businessId?: string;
    business?: { id: string };
  }

  // Origem do ID: Consome do StudioContext (preferencial) ou da sessão
  const user = session?.user as SessionUser | undefined;
  const companyId = studio?.id || user?.businessId || user?.business?.id;

  const [profile, setProfile] = useState<SiteProfile>({
    name: "",
    description: "",
    titleSuffix: "",
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

  // Removido o isDirty como estado para usar comparação direta
  const isDirty =
    initialProfileRef.current &&
    JSON.stringify(profile) !== JSON.stringify(initialProfileRef.current);

  // Busca inicial das configurações do Back-end
  const fetchProfile = useCallback(async () => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const response = await customFetch(
        `${API_BASE_URL}/api/settings/profile/${companyId}`,
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        console.log(">>> [PROFILE] Dados recebidos:", data);

        const loadedProfile = {
          name: data.siteName || data.name || "",
          description: data.description || "",
          titleSuffix: data.titleSuffix || "",
          phone: data.phone || "",
          email: studio?.email || session?.user?.email || data.email || "",
          address: data.address || "",
          instagram: data.instagram || "",
          whatsapp: data.whatsapp || "",
          facebook: data.facebook || "",
          tiktok: data.tiktok || "",
          linkedin: data.linkedin || "",
          x: data.x || "",
          logoUrl: data.logoUrl || "",
          showInstagram: data.showInstagram ?? true,
          showWhatsapp: data.showWhatsapp ?? true,
          showFacebook: data.showFacebook ?? true,
          showTiktok: data.showTiktok ?? false,
          showLinkedin: data.showLinkedin ?? false,
          showX: data.showX ?? false,
        };

        setProfile(loadedProfile);
        initialProfileRef.current = loadedProfile;
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível carregar as configurações do site.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, companyId, studio?.email, session?.user?.email]);

  useEffect(() => {
    if (companyId) {
      fetchProfile();
    }
  }, [fetchProfile, companyId]);

  const handleSave = async () => {
    if (!companyId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // 1. Dirty Checking: Compara estado atual com inicial
    const initialProfile = initialProfileRef.current;
    if (!initialProfile) return;

    const changes: Record<string, string | boolean | null | undefined> = {};
    let hasChanges = false;

    Object.keys(profile).forEach((key) => {
      const k = key as keyof SiteProfile;
      if (profile[k] !== initialProfile[k]) {
        // Mapeia 'name' para 'siteName' conforme expectativa do backend
        const backendKey = k === "name" ? "siteName" : k;
        changes[backendKey] = profile[k];
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      toast({
        title: "Nenhuma alteração",
        description: "Nenhuma alteração detectada para salvar.",
      });
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // O backend agora espera o objeto completo conforme a nova especificação
      const payload = {
        siteName: profile.name,
        titleSuffix: profile.titleSuffix,
        description: profile.description,
        instagram: profile.instagram,
        showInstagram: profile.showInstagram,
        whatsapp: profile.whatsapp,
        showWhatsapp: profile.showWhatsapp,
        facebook: profile.facebook,
        showFacebook: profile.showFacebook,
        tiktok: profile.tiktok,
        showTiktok: profile.showTiktok,
        linkedin: profile.linkedin,
        showLinkedin: profile.showLinkedin,
        phone: profile.phone,
        email: profile.email || "",
        address: profile.address || "",
      };

      console.log(">>> [PROFILE] Enviando payload completo:", payload);

      const response = await customFetch(`${API_BASE_URL}/api/settings/profile/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Erro de validação nos dados enviados.",
          );
        }
        throw new Error(`Falha ao salvar (Status: ${response.status})`);
      }

      // Atualiza o dado inicial após salvar com sucesso
      initialProfileRef.current = { ...profile };

      toast({
        title: "Perfil Atualizado",
        description: "As informações do site foram salvas com sucesso.",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao tentar salvar as informações no servidor.";

      toast({
        title: "Erro ao Salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const maskPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .substring(0, 15);
    }
    return numbers.substring(0, 11);
  };

  const updateField = (field: keyof SiteProfile, value: string | boolean) => {
    let finalValue = value;
    if (field === "phone" && typeof value === "string") {
      finalValue = maskPhone(value);
    }
    setProfile((prev) => ({ ...prev, [field]: finalValue }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;

    // 1. Validação básica de tamanho (opcional aqui, pois vamos comprimir)
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limite antes da compressão
      toast({
        title: "Arquivo muito grande",
        description: "A imagem original deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 2. Compressão no Client-side
      const options = {
        maxSizeMB: 0.2, // 200KB alvo
        maxWidthOrHeight: 800, // Máximo 800px de largura/altura
        useWebWorker: true,
        onProgress: (p: number) => setUploadProgress(Math.round(p * 0.5)), // 50% do progresso é compressão
      };

      const compressedFile = await imageCompression(file, options);
      console.log(
        `>>> [LOGO] Original: ${(file.size / 1024 / 1024).toFixed(2)}MB | Comprimida: ${(compressedFile.size / 1024).toFixed(2)}KB`,
      );

      // 3. Upload Assíncrono com XHR (para acompanhar progresso real)
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("companyId", companyId);

      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete =
              Math.round((event.loaded / event.total) * 50) + 50; // Os outros 50% são upload
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              reject(new Error("Erro ao processar resposta do servidor."));
            }
          } else {
            reject(new Error(`Erro no upload: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () =>
          reject(new Error("Erro na conexão durante o upload.")),
        );
        xhr.open("POST", `${API_BASE_URL}/api/settings/logo`);
        xhr.withCredentials = true;
        xhr.send(formData);
      });

      const response = (await uploadPromise) as { logoUrl: string };

      // 4. Sucesso: Atualiza estados e StudioContext
      updateField("logoUrl", response.logoUrl);

      // Cache local no StudioContext
      if (updateStudioInfo) {
        updateStudioInfo({ logoUrl: response.logoUrl });
      }

      toast({
        title: "Logo Atualizada",
        description: "A nova logo foi carregada e salva com sucesso.",
      });
    } catch (error) {
      console.warn(">>> [ADMIN_WARN] Erro no processo de logo:", error);
      toast({
        title: "Erro no Upload",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao processar a logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-25 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Carregando configurações...
        </p>
      </div>
    );
  }

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
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-suffix">
              Sufixo do Título (Aba do Navegador)
            </Label>
            <Input
              id="site-suffix"
              value={profile.titleSuffix || ""}
              onChange={(e) => updateField("titleSuffix", e.target.value)}
              placeholder="Ex: Agendamento Online, Especialidade, Slogan..."
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Define como o nome aparecerá na aba do navegador. Exemplo:
              <span className="font-medium ml-1">
                {profile.name || "Nome do Negócio"} |{" "}
                {profile.titleSuffix || "Sufixo Escolhido"}
              </span>
            </p>
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
                  autoComplete="off"
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
                  autoComplete="off"
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
                autoComplete="off"
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
                  autoComplete="off"
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
                autoComplete="off"
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
                  autoComplete="off"
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
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                placeholder="contato@exemplo.com"
                readOnly
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground">
                O e-mail é definido no cadastro da empresa e não pode ser
                alterado aqui.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço / Localização</Label>
              <Input
                id="address"
                value={profile.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="São Paulo, SP"
                autoComplete="off"
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
                className={`relative border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors cursor-pointer group flex flex-col items-center justify-center h-full ${
                  isUploading
                    ? "opacity-50 cursor-wait"
                    : "hover:border-primary"
                }`}
              >
                {isUploading ? (
                  <div className="w-full space-y-4">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                    <div className="space-y-2">
                      <Progress value={uploadProgress || 0} className="h-2" />
                      <p className="text-xs text-muted-foreground font-medium">
                        {uploadProgress && uploadProgress < 50
                          ? "Otimizando imagem..."
                          : "Enviando para o servidor..."}
                        ({uploadProgress}%)
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm text-muted-foreground">
                      Clique para fazer upload da logo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou SVG (máx. 10MB)
                    </p>
                  </>
                )}
              </label>
              <input
                id="logo-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={isUploading}
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
