"use client";

import imageCompression from "browser-image-compression";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { customFetch } from "@/lib/api-client";

interface ImageUploaderProps {
  businessId: string;
  section: string;
  onUploadSuccess: (imageUrl: string) => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUploader({
  businessId,
  section,
  onUploadSuccess,
  className,
  disabled,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(">>> [ImageUploader] EVENTO: Usuário clicou em 'Abrir' no seletor de arquivos.");
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(">>> [ImageUploader] Arquivo selecionado:", {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
      section,
      businessId,
    });

    // Validações básicas
    if (!file.type.startsWith("image/")) {
      console.warn(">>> [ImageUploader] Tipo de arquivo inválido:", file.type);
      alert("Por favor, selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      console.warn(">>> [ImageUploader] Arquivo muito grande:", file.size);
      alert("A imagem deve ter no máximo 10MB.");
      return;
    }

    setIsUploading(true);

    try {
      console.log(">>> [ImageUploader] Iniciando compressão...");
      // Compressão
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      console.log(">>> [ImageUploader] Compressão finalizada:", {
        originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
      });

      // Preparar FormData para o Backblaze B2 via Backend
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("businessId", businessId);
      formData.append("section", section);

      console.log(">>> [ImageUploader] Enviando para o backend (POST /api/settings/background-image)...");
      // Chamada para o endpoint do backend
      const response = await customFetch("/api/settings/background-image", {
        method: "POST",
        body: formData,
      });

      console.log(">>> [ImageUploader] Resposta do servidor:", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(">>> [ImageUploader] Erro na resposta do servidor:", errorText);
        throw new Error("Falha no upload da imagem");
      }

      const data = await response.json();
      console.log(">>> [ImageUploader] Dados retornados:", data);

      if (data.success && data.imageUrl) {
        console.log(">>> [ImageUploader] Upload concluído com sucesso! URL:", data.imageUrl);
        onUploadSuccess(data.imageUrl);
      } else {
        throw new Error(data.message || "Erro desconhecido no upload");
      }
    } catch (error) {
      console.error(">>> [ImageUploader] Erro fatal durante o upload:", error);
      alert("Erro ao fazer upload da imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isUploading || disabled}
      />
      <Button
        variant="outline"
        type="button"
        className="w-full h-10 border-dashed text-xs gap-2"
        onClick={() => {
          console.log(">>> [ImageUploader] Botão de upload clicado. Abrindo seletor de arquivos...");
          fileInputRef.current?.click();
        }}
        disabled={isUploading || disabled}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processando...
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" /> Fazer Upload (B2)
          </>
        )}
      </Button>
    </div>
  );
}
