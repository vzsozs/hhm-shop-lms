
import React from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { ProductDetailSubComponentProps } from "./product-detail-types";

interface ProductAudioPlayerProps extends ProductDetailSubComponentProps {
  audioMedia: any;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  setIsPlaying: (p: boolean) => void;
  formatTime: (time: number) => string;
}

export const ProductAudioPlayer: React.FC<ProductAudioPlayerProps> = ({
  t,
  audioMedia,
  audioRef,
  isPlaying,
  togglePlay,
  currentTime,
  duration,
  handleSeek,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  onTimeUpdate,
  onLoadedMetadata,
  setIsPlaying,
  formatTime
}) => {
  if (!audioMedia) return null;

  return (
    <div className="mt-4 p-4 bg-white/60 backdrop-blur-md rounded-xl border border-brand-bronze/10 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button 
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-brand-bronze text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-brand-bronze uppercase tracking-widest">{t.listenAudio}</span>
          <input 
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-brand-bronze/20 rounded-lg appearance-none cursor-pointer accent-brand-bronze"
          />
          <div className="flex justify-between text-[9px] font-medium text-brand-black/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-brand-bronze/10">
          <button onClick={() => setIsMuted(!isMuted)} className="text-brand-brown/60 hover:text-brand-brown">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-12 h-1 bg-brand-bronze/20 rounded-lg appearance-none cursor-pointer accent-brand-bronze hidden sm:block"
          />
        </div>
      </div>
      
      <audio 
        ref={audioRef}
        src={audioMedia.url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
        autoPlay={false}
        className="hidden"
      />
    </div>
  );
};
