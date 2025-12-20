"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type GalleryImage = {
  id: number
  query: string
  title: string
  category: string
}

type ImageModalProps = {
  image: GalleryImage
  onClose: () => void
}

export function ImageModal({ image, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={`/.jpg?height=800&width=800&query=${image.query}`}
          alt={image.title}
          className="w-full h-auto rounded-lg"
        />
        <div className="mt-4 text-center">
          <h3 className="text-white text-xl font-semibold">{image.title}</h3>
        </div>
      </div>
    </div>
  )
}
