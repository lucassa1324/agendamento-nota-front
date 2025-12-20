"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Palette, Type, ImageIcon } from "lucide-react"

export function ProfileManager() {
  const [siteName, setSiteName] = useState("Brow Studio")
  const [siteDescription, setSiteDescription] = useState("")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>Configure o nome e descrição do seu site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Nome do Site</Label>
            <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Descrição</Label>
            <Textarea
              id="site-description"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Descreva seu studio de sobrancelhas..."
              rows={4}
            />
          </div>
          <Button>Salvar Informações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo e Imagens
          </CardTitle>
          <CardDescription>Faça upload da logo e imagens do site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo Principal</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Clique ou arraste para fazer upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG (máx. 2MB)</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Imagem de Fundo Hero</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Clique ou arraste para fazer upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG ou JPG (máx. 5MB)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Cores do Site
          </CardTitle>
          <CardDescription>Personalize a paleta de cores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Cor Principal</Label>
              <div className="flex gap-2">
                <Input id="primary-color" type="color" defaultValue="#8B6F47" className="w-20 h-10" />
                <Input defaultValue="#8B6F47" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent-color">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input id="accent-color" type="color" defaultValue="#D4A574" className="w-20 h-10" />
                <Input defaultValue="#D4A574" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="background-color">Cor de Fundo</Label>
              <div className="flex gap-2">
                <Input id="background-color" type="color" defaultValue="#FFFBF5" className="w-20 h-10" />
                <Input defaultValue="#FFFBF5" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-color">Cor do Texto</Label>
              <div className="flex gap-2">
                <Input id="text-color" type="color" defaultValue="#2C2420" className="w-20 h-10" />
                <Input defaultValue="#2C2420" className="flex-1" />
              </div>
            </div>
          </div>
          <Button>Aplicar Cores</Button>
        </CardContent>
      </Card>
    </div>
  )
}
