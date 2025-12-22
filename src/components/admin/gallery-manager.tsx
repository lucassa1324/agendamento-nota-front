"use client";
import { ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function GalleryManager() {
  const { toast } = useToast();

  const handleUpload = () => {
    toast({
      title: "Upload de imagem",
      description:
        "Funcionalidade de upload será implementada com integração de storage",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gerenciar Galeria</h2>
        <p className="text-muted-foreground">
          Adicione e organize as fotos dos seus trabalhos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Imagens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Arraste imagens aqui ou clique para selecionar
            </p>
            <Button onClick={handleUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Imagens
            </Button>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Dicas para melhores resultados:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use imagens de alta qualidade (mínimo 1200x800px)</li>
              <li>Formatos aceitos: JPG, PNG, WebP</li>
              <li>Tamanho máximo: 5MB por imagem</li>
              <li>Organize por categoria para facilitar a navegação</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary/30">
        <CardHeader>
          <CardTitle>Integração com Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para habilitar o upload de imagens, você precisa configurar uma
            integração de storage como Vercel Blob, Cloudinary ou AWS S3. Entre
            em contato com o suporte para mais informações.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
