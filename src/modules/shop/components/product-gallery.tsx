"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductMediaItem } from "@/modules/shop/queries";
import { cn } from "@/lib/utils";
import { PlayCircle, Music } from "lucide-react";

interface ProductGalleryProps {
  media: ProductMediaItem[];
}

export function ProductGallery({ media }: ProductGalleryProps) {
  // Alapértelmezésben az első képet mutatjuk, vagy egy fallback-et
  const [activeMedia, setActiveMedia] = useState<ProductMediaItem | null>(
    media.length > 0 ? media[0] : null
  );

  if (!media || media.length === 0) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center rounded-xl overflow-hidden">
        <span className="text-muted-foreground text-sm font-medium">Nincs kép feltöltve</span>
      </div>
    );
  }

  // YouTube URL-t konvertál az iframe beágyazáshoz
  const getEmbeddedYoutubeUrl = (url: string) => {
    try {
      if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
        const videoId = url.includes("youtu.be/") 
          ? url.split("youtu.be/")[1]?.split("?")[0]
          : new URL(url).searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Fő megjelenítő terület (Nagy kép vagy Videó vagy Audio) */}
      <div className="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-muted border flex items-center justify-center shadow-sm">
        {activeMedia?.type === "IMAGE" && (
          <Image
            src={activeMedia.url}
            alt="Termék fotó"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}

        {activeMedia?.type === "YOUTUBE" && (
          <iframe
            src={getEmbeddedYoutubeUrl(activeMedia.url)}
            title="Video bemutató"
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {activeMedia?.type === "AUDIO" && (
          <div className="flex flex-col items-center justify-center p-6 w-full gap-6 bg-slate-900 h-full text-slate-100">
            <Music className="w-20 h-20 text-indigo-400 opacity-80" />
            <h3 className="font-semibold text-xl tracking-tight">Hangminta lejátszása</h3>
            <audio controls className="w-[80%] max-w-sm mt-4 custom-audio-player">
              <source src={activeMedia.url} type="audio/mpeg" />
              A böngésződ nem támogatja a beépített hanglejátszót.
            </audio>
          </div>
        )}
      </div>

      {/* Miniatűr navigáló sáv (Thumbnails) */}
      {media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {media.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMedia(item)}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer snap-start bg-muted",
                activeMedia?.id === item.id
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-transparent hover:border-muted-foreground/50 opacity-70 hover:opacity-100"
              )}
            >
              {item.type === "IMAGE" && (
                <Image
                  src={item.url}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              )}
              {item.type === "YOUTUBE" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <PlayCircle className="w-8 h-8 text-white" />
                </div>
              )}
              {item.type === "AUDIO" && (
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/80">
                  <Music className="w-8 h-8 text-indigo-300" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
