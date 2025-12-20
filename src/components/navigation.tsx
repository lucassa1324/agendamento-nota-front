"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/galeria", label: "Galeria" },
    { href: "/sobre", label: "Sobre Nós" },
    { href: "/agendamento", label: "Agendar" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-serif text-2xl font-bold text-primary">
            Brow Studio
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Acesse sua conta
            </Link>
            <Button asChild className="bg-accent hover:bg-accent/90">
              <Link href="/agendamento">Agende Agora</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Acesse sua conta
              </Link>
              <Button asChild className="bg-accent hover:bg-accent/90 w-full">
                <Link href="/agendamento" onClick={() => setMobileMenuOpen(false)}>
                  Agende Agora
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
