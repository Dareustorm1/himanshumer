/**
 * Global cinematic audio context shared between Hero (intro prompt)
 * and InsideHead (room sounds panel).
 */
import { createContext, useContext, useRef, useState, ReactNode, useEffect, useCallback } from 'react';

interface AudioContextType {
  audioOn: boolean;
  wantHum: boolean;
  wantRain: boolean;
  wantMusic: boolean;
  setAudioOn: (v: boolean) => void;
  setWantHum: (v: boolean) => void;
  setWantRain: (v: boolean) => void;
  setWantMusic: (v: boolean) => void;
  startSounds: () => void;
  stopSounds: () => void;
  toggleAudio: () => void;
  toggleMusic: () => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const humOscRef   = useRef<OscillatorNode | null>(null);
  const rainSrcRef  = useRef<AudioBufferSourceNode | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  const [audioOn,   setAudioOn]   = useState(false);
  const [wantHum,   setWantHum]   = useState(true);
  const [wantRain,  setWantRain]  = useState(true);
  const [wantMusic, setWantMusic] = useState(true);

  // Initialize lofi HTML5 audio stream once (using locally downloaded track)
  useEffect(() => {
    const audio = new Audio("/lofi.mp3");
    audio.loop = true;
    audio.volume = 0.04; // Soothing soft background level
    musicAudioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  const stopSounds = useCallback(() => {
    try {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
      }
    } catch (_) {}

    try {
      if (humOscRef.current) {
        humOscRef.current.stop();
        humOscRef.current = null;
      }
    } catch (_) {}
    try {
      if (rainSrcRef.current) {
        rainSrcRef.current.stop();
        rainSrcRef.current = null;
      }
    } catch (_) {}
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (_) {}
  }, []);

  const startSounds = useCallback(() => {
    // Prevent double initialization
    stopSounds();

    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;

      // 1. Projector Hum (Low 60Hz hum)
      if (wantHum) {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth'; 
        osc.frequency.value = 60;
        gain.gain.value = 0.003; // Soft background hum
        osc.connect(gain); 
        gain.connect(ctx.destination);
        osc.start(); 
        humOscRef.current = osc;
      }

      // 2. Gotham Rain Ambience (Bandpassed white noise)
      if (wantRain) {
        const buf  = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const src    = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain   = ctx.createGain();
        src.buffer = buf; 
        src.loop = true;
        filter.type = 'bandpass'; 
        filter.frequency.value = 350;
        gain.gain.value = 0.012;
        src.connect(filter); 
        filter.connect(gain); 
        gain.connect(ctx.destination);
        src.start();
        rainSrcRef.current = src;
      }

      // 3. Play Streaming Lofi Music Track
      if (wantMusic) {
        if (musicAudioRef.current) {
          musicAudioRef.current.play().catch(() => {
            // Autoplay blocked fallback
          });
        }
      }
    } catch (_) {}
  }, [wantHum, wantRain, wantMusic, stopSounds]);

  // Reactive audio state listener (runs when toggles are clicked)
  useEffect(() => {
    if (audioOn) {
      startSounds();
    } else {
      stopSounds();
    }
  }, [audioOn, wantHum, wantRain, wantMusic, startSounds, stopSounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSounds();
  }, [stopSounds]);

  const toggleAudio = useCallback(() => {
    setAudioOn(prev => {
      const next = !prev;
      if (musicAudioRef.current) {
        if (next && wantMusic) {
          musicAudioRef.current.play().catch(() => {});
        } else {
          musicAudioRef.current.pause();
        }
      }
      return next;
    });
  }, [wantMusic]);

  const toggleMusic = useCallback(() => {
    setWantMusic(prev => {
      const next = !prev;
      if (musicAudioRef.current) {
        if (next && audioOn) {
          musicAudioRef.current.play().catch(() => {});
        } else {
          musicAudioRef.current.pause();
        }
      }
      return next;
    });
  }, [audioOn]);

  return (
    <AudioCtx.Provider value={{
      audioOn,
      wantHum,
      wantRain,
      wantMusic,
      setAudioOn,
      setWantHum,
      setWantRain,
      setWantMusic,
      startSounds,
      stopSounds,
      toggleAudio,
      toggleMusic
    }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider');
  return ctx;
}
