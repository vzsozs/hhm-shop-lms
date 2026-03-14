
import React from "react";
import Image from "next/image";
import { ProductDetailSubComponentProps } from "./product-detail-types";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "./product-detail-utils";

interface ProductGalleryProps extends ProductDetailSubComponentProps {
  activeImageId: string | undefined;
  setActiveImageId: (id: string) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ 
  product, 
  lang, 
  t, 
  activeImageId, 
  setActiveImageId 
}) => {
  const visualMedia = product.media.filter(m => m.type !== "AUDIO");
  const activeImage = product.media.find(m => m.id === activeImageId) || product.media[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-square bg-[#ffffff] rounded-2xl overflow-hidden relative border border-brand-bronze/10">
        {activeImage?.url ? (
          activeImage.type === "YOUTUBE" ? (
            <iframe 
              src={getYouTubeEmbedUrl(activeImage.url) || ""}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Product Video"
            />
          ) : (
            <Image 
              src={activeImage.url} 
              alt={product.name[lang] || product.name["hu"] || t.noImage} 
              fill 
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-brand-black/40 font-montserrat">
            {t.noImage}
          </div>
        )}
      </div>
      
      {visualMedia.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {visualMedia.map(media => (
            <button 
              key={media.id}
              onClick={() => setActiveImageId(media.id)}
              className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImageId === media.id ? 'border-brand-bronze shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <Image 
                src={media.type === "YOUTUBE" ? getYouTubeThumbnail(media.url) || media.url : media.url} 
                alt="Thumbnail" 
                fill 
                className="object-contain" 
              />
              {media.type === "YOUTUBE" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-brand-black ml-1"></div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
