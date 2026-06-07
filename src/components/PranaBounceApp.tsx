import React, { useState, useEffect, useRef } from "react";
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Music, 
  Sliders, 
  Sparkles, 
  Palette, 
  Play, 
  Pause,
  Compass,
  Check,
  Heart,
  HelpCircle,
  X
} from "lucide-react";

// Track Definition
interface AmbientTrack {
  id: string;
  name: string;
  category: "Nature" | "Meditation" | "Focus Frequencies" | "Music";
  description: string;
  frequencyLabel?: string;
  nodeType: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

const AMBIENT_TRACKS: AmbientTrack[] = [
  // NATURE (5 Tracks)
  { id: "rain", name: "Autumn Rain", category: "Nature", description: "Soft wind gusts and gentle random water drips", nodeType: "rain" },
  { id: "waves", name: "Ocean Waves", category: "Nature", description: "LFO-modulated deep physical shore tides", nodeType: "waves" },
  { id: "stream", name: "Mountain Stream", category: "Nature", description: "Continuous bubbling water stream & droplets", nodeType: "stream" },
  { id: "pines", name: "Whispering Pines", category: "Nature", description: "Ethereal breeze blowing through high pine trees", nodeType: "pines" },
  { id: "meadow", name: "Summer Meadow", category: "Nature", description: "Warm grassland drone & rare evening crickets", nodeType: "meadow" },

  // MEDITATION (5 Tracks)
  { id: "bowl", name: "Tibetan Bowl", category: "Meditation", description: "Harmonic singing bowl resonance with rich overtones", nodeType: "bowl" },
  { id: "flute", name: "Japanese Flute", category: "Meditation", description: "Meditative shakuhachi wood flute scale fragments", nodeType: "flute" },
  { id: "chant", name: "Chanting Monks", category: "Meditation", description: "Detuned vocal hum resonant formant drone", nodeType: "chant" },
  { id: "bell", name: "Zen Temple Chime", category: "Meditation", description: "Mellow bronze chime decaying over several seconds", nodeType: "bell" },
  { id: "windchime", name: "Bamboo Windchimes", category: "Meditation", description: "Glass/bamboo rods sparkling on breeze triggers", nodeType: "windchime" },

  // FOCUS FREQUENCIES (5 Tracks)
  { id: "theta", name: "432Hz Theta Waves", category: "Focus Frequencies", description: "Binaural delta/theta beat for mental relief", frequencyLabel: "432Hz + 438Hz", nodeType: "theta" },
  { id: "solfeggio", name: "528Hz Solfeggio", category: "Focus Frequencies", description: "Continuous ancient cellular transformation code", frequencyLabel: "528Hz", nodeType: "solfeggio" },
  { id: "delta", name: "Deep Sleep Delta", category: "Focus Frequencies", description: "Low frequency binaural wave supporting slow sleep", frequencyLabel: "100Hz + 102.5Hz", nodeType: "delta" },
  { id: "pink", name: "Warm Pink Noise", category: "Focus Frequencies", description: "Continuous analog pink safety frequency filter", nodeType: "pink" },
  { id: "cradle", name: "Cosmic Cradle", category: "Focus Frequencies", description: "Extremely deep sub-bass ambient gravity sweep", nodeType: "cradle" },

  // MUSIC (5 Tracks)
  { id: "lofi", name: "Lo-Fi Ambient", category: "Music", description: "Dusty crackling tape vinyl, chill kick drum", nodeType: "lofi" },
  { id: "piano", name: "Soft Piano", category: "Music", description: "Generative random pentatonic hammer strikes", nodeType: "piano" },
  { id: "harps", name: "Celestial Harps", category: "Music", description: "Cascading major seventh arpeggio plucks", nodeType: "harps" },
  { id: "midnight", name: "Velvet Midnight", category: "Music", description: "Warm analog synthesizer pads fading in/out", nodeType: "midnight" },
  { id: "guitar", name: "Warm Acoustic", category: "Music", description: "Dreamy organic physical folk guitar string pluck", nodeType: "guitar" }
];

const SOOTHING_AFFIRMATIONS = [
  "Take a deep breath...",
  "Release the tension in your shoulders...",
  "You are safe and present right here.",
  "Let your thoughts drift away like clouds.",
  "Inhale calming peace, exhale heavy worry.",
  "Quiet the noise. Follow the bounce.",
  "You are doing perfectly fine.",
  "With each return, find your quiet center.",
  "Soften your gaze and slow down...",
  "Feel the support of the ground beneath you.",
  "This moment is yours to rest.",
  "Allow yourself to simply exist.",
  "There is nothing you need to solve right now.",
  "Let your body breathe itself."
];

export default function PranaBounceApp() {
  // Theme & Model View Selector
  const [selectedTheme, setSelectedTheme] = useState<"cosmic_slate" | "mint_radiance" | "gentle_twilight">("cosmic_slate");
  const [selectedAvatar, setSelectedAvatar] = useState<"glow_orb" | "zen_pebble" | "pulsar" | "aura_quark" | "lotus_core" | "singularity">("glow_orb");
  const [activeTab, setActiveTab] = useState<"sliders" | "avatars" | "themes" | "mixer">("sliders");

  // Custom Physics Inputs
  const [breathCycleSeconds, setBreathCycleSeconds] = useState<number>(6.0); // Bouncing time in seconds (3s to 15s)
  const [breathPace, setBreathPace] = useState<number>(0.65); // speed controller: 0.1 to 1.5
  const [gravityStrength, setGravityStrength] = useState<number>(0.35); // gravity strength slider
  const [asmrVolume, setAsmrVolume] = useState<number>(0.7); // ASMR soft thud effect
  const [masterAmbientVolume, setMasterAmbientVolume] = useState<number>(0.6); // Ambient volume

  // Audio Tracks State
  const [activeTracks, setActiveTracks] = useState<Record<string, boolean>>({});
  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>(
    AMBIENT_TRACKS.reduce((acc, t) => ({ ...acc, [t.id]: 0.5 }), {})
  );
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false);

  // Statistics / Milestones
  const [bounceCount, setBounceCount] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [currentAffirmation, setCurrentAffirmation] = useState<string>("Breathe in as the ball ascends. Breathe out as it descends.");
  const [showAffirmationAlert, setShowAffirmationAlert] = useState<boolean>(true);

  // Dynamic Guide and Immersive views
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false); // Starts closed/minimized with sticky icons revealable
  const [isEnginePlaying, setIsEnginePlaying] = useState<boolean>(false); // Starts out false, waiting for session play
  const [isSessionStarted, setIsSessionStarted] = useState<boolean>(false); // Tracks whether player started the breathing loop
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Physics Loop Synchronizer Refs
  const breathPaceRef = useRef<number>(breathPace);
  const gravityRef = useRef<number>(gravityStrength);
  const avatarRef = useRef<string>(selectedAvatar);
  const themeRef = useRef<string>(selectedTheme);
  const isPlayingRef = useRef<boolean>(isEnginePlaying);
  const isSessionStartedRef = useRef<boolean>(isSessionStarted);
  const asmrVolumeRef = useRef<number>(asmrVolume);
  const breathCycleSecondsRef = useRef<number>(breathCycleSeconds);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const synthNodesRef = useRef<Record<string, {
    gainNode: GainNode;
    sources: any[];
    updater?: (time: number) => void;
  }>>({});
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // Particle tracking
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);

  // Update refs in real-time
  useEffect(() => {
    // Synchronize breathCycleSeconds with the physics loop breath pace speed multiplier
    const targetPace = 3.9 / breathCycleSeconds;
    setBreathPace(targetPace);
  }, [breathCycleSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isEnginePlaying) {
      interval = setInterval(() => {
        setTotalSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isEnginePlaying]);

  useEffect(() => { breathPaceRef.current = breathPace; }, [breathPace]);
  useEffect(() => { gravityRef.current = gravityStrength; }, [gravityStrength]);
  useEffect(() => { avatarRef.current = selectedAvatar; }, [selectedAvatar]);
  useEffect(() => { themeRef.current = selectedTheme; }, [selectedTheme]);
  useEffect(() => { isPlayingRef.current = isEnginePlaying; }, [isEnginePlaying]);
  useEffect(() => { isSessionStartedRef.current = isSessionStarted; }, [isSessionStarted]);
  useEffect(() => { asmrVolumeRef.current = asmrVolume; }, [asmrVolume]);
  useEffect(() => { breathCycleSecondsRef.current = breathCycleSeconds; }, [breathCycleSeconds]);

  // Collapse the details panel on clicking outside the menu panel and the sticky dock
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!isPanelOpen) return;
      const clickedDock = (e.target as HTMLElement).closest("#sticky-cockpit-dock");
      const clickedPanel = (e.target as HTMLElement).closest("#menu-details-panel");
      if (!clickedDock && !clickedPanel) {
        setIsPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isPanelOpen]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(masterAmbientVolume, audioCtxRef.current.currentTime, 0.15);
    }
  }, [masterAmbientVolume]);

  useEffect(() => {
    if (!isAudioInitialized || !audioCtxRef.current) return;
    Object.keys(trackVolumes).forEach(trackId => {
      const activeObj = synthNodesRef.current[trackId];
      if (activeObj && activeObj.gainNode) {
        activeObj.gainNode.gain.setTargetAtTime(
          activeTracks[trackId] ? trackVolumes[trackId] : 0, 
          audioCtxRef.current!.currentTime, 
          0.1
        );
      }
    });
  }, [trackVolumes, activeTracks, isAudioInitialized]);

  const getThemeColors = () => {
    switch (selectedTheme) {
      case "mint_radiance":
        return {
          bg: "from-stone-950 via-neutral-900 to-stone-900",
          cardBg: "bg-stone-900/90 border-stone-800",
          accentText: "text-emerald-400",
          accentBg: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
          glowColor: "rgba(16, 185, 129, 0.45)",
          ballColor: "#a7f3d0",
          particleColors: ["#a7f3d0", "#10b981", "#34d399", "#d1fae5"],
          canvasBg: "#141514"
        };
      case "gentle_twilight":
        return {
          bg: "from-neutral-950 via-zinc-950 to-neutral-900",
          cardBg: "bg-zinc-900/90 border-zinc-800",
          accentText: "text-pink-400",
          accentBg: "bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20",
          glowColor: "rgba(236, 72, 153, 0.45)",
          ballColor: "#fbcfe8",
          particleColors: ["#fbcfe8", "#ec4899", "#d946ef", "#f472b6"],
          canvasBg: "#110e16"
        };
      case "cosmic_slate":
      default:
        return {
          bg: "from-slate-950 via-slate-900 to-indigo-950/20",
          cardBg: "bg-slate-900/95 border-slate-800",
          accentText: "text-indigo-400",
          accentBg: "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
          glowColor: "rgba(99, 102, 241, 0.45)",
          ballColor: "#c7d2fe",
          particleColors: ["#c7d2fe", "#6366f1", "#06b6d4", "#38bdf8"],
          canvasBg: "#0f111a"
        };
    }
  };

  const themeColors = getThemeColors();

  // Lazy Initialize Web Audio API on click
  const lazyInitAudio = () => {
    if (isAudioInitialized) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(masterAmbientVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Noise Buffer creation (looping 1.8s)
      const secBuffer = ctx.sampleRate * 2.0;
      const buffer = ctx.createBuffer(1, secBuffer, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < secBuffer; i++) {
        data[i] = Math.random() * 2.0 - 1.0;
      }
      noiseBufferRef.current = buffer;

      setIsAudioInitialized(true);
      console.log("Relaxation synthesizer engine ready.");
    } catch (err) {
      console.warn("Autoplay block or missing browser support for Audio API.", err);
    }
  };

  // ASMR Impact Thud Synthesizer
  const triggerASMRThud = (impactScale: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const vol = asmrVolumeRef.current * Math.min(1.0, Math.max(0.2, impactScale / 5.5));
    if (vol <= 0.001) return;

    // Soft Exponential Low Swipe (sine wave)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const lowpass = ctx.createBiquadFilter();

    osc.type = "sine";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.16);

    gainNode.gain.setValueAtTime(vol * 0.42, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(190, now);

    osc.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);

    // Complementary crystal water sparkle
    if (Math.random() > 0.45) {
      const topOsc = ctx.createOscillator();
      const topGain = ctx.createGain();
      topOsc.type = "sine";
      topOsc.frequency.setValueAtTime(1800, now);
      topOsc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);
      topGain.gain.setValueAtTime(vol * 0.05, now);
      topGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.04);
      topOsc.connect(topGain).connect(ctx.destination);
      topOsc.start(now);
      topOsc.stop(now + 0.045);
    }
  };

  // Turn on/off or scale procedural track synthesis
  const toggleAmbientTrack = (track: AmbientTrack) => {
    lazyInitAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const wasActive = !!activeTracks[track.id];
    const turnsActive = !wasActive;

    if (turnsActive) {
      // Force exclusive audio selection: deactivate all currently playing tracks first
      Object.keys(synthNodesRef.current).forEach(existingId => {
        const activeObj = synthNodesRef.current[existingId];
        if (activeObj) {
          const now = ctx.currentTime;
          activeObj.gainNode.gain.setValueAtTime(activeObj.gainNode.gain.value, now);
          activeObj.gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

          setTimeout(() => {
            activeObj.sources.forEach(src => {
              try { src.stop(); } catch {}
              try { src.disconnect(); } catch {}
            });
            try { activeObj.gainNode.disconnect(); } catch {}
            delete synthNodesRef.current[existingId];
          }, 180);
        }
      });

      // Update state: only this newly clicked track is true
      setActiveTracks({ [track.id]: true });

      const trackGain = ctx.createGain();
      trackGain.gain.setValueAtTime(0, ctx.currentTime);
      trackGain.connect(masterGainRef.current!);

      const currentSec = ctx.currentTime;
      const activeSources: any[] = [];
      let periodicUpdater: ((time: number) => void) | undefined;
      const noise = noiseBufferRef.current;

      // Build synthesis graphs based on category key
      switch (track.nodeType) {
        case "rain": {
          if (noise) {
            const bufSrc = ctx.createBufferSource();
            bufSrc.buffer = noise;
            bufSrc.loop = true;

            const band = ctx.createBiquadFilter();
            band.type = "bandpass";
            band.frequency.setValueAtTime(1300, currentSec);
            band.Q.setValueAtTime(0.65, currentSec);

            bufSrc.connect(band).connect(trackGain);
            bufSrc.start();
            activeSources.push(bufSrc);

            // Occasional drips
            let lastDrip = 0;
            periodicUpdater = (t) => {
              if (t - lastDrip > 0.18 + Math.random() * 0.35) {
                lastDrip = t;
                const oscDrip = ctx.createOscillator();
                const gainD = ctx.createGain();
                oscDrip.type = "sine";
                oscDrip.frequency.setValueAtTime(1400 + Math.random() * 700, ctx.currentTime);
                oscDrip.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);
                gainD.gain.setValueAtTime(0.012, ctx.currentTime);
                gainD.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.04);
                oscDrip.connect(gainD).connect(trackGain);
                oscDrip.start();
                oscDrip.stop(ctx.currentTime + 0.05);
              }
            };
          }
          break;
        }

        case "waves": {
          if (noise) {
            const bufSrc = ctx.createBufferSource();
            bufSrc.buffer = noise;
            bufSrc.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(320, currentSec);

            // Modulating wave sweeps (LFO)
            const lfo = ctx.createOscillator();
            const lGain = ctx.createGain();
            lfo.type = "sine";
            lfo.frequency.setValueAtTime(0.082, currentSec); // wave comes every 12 seconds
            lGain.gain.setValueAtTime(140, currentSec);

            lfo.connect(lGain).connect(filter.frequency);
            bufSrc.connect(filter).connect(trackGain);

            lfo.start();
            bufSrc.start();
            activeSources.push(bufSrc, lfo);
          }
          break;
        }

        case "stream": {
          if (noise) {
            const streamSrc = ctx.createBufferSource();
            streamSrc.buffer = noise;
            streamSrc.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(2600, currentSec);
            filter.Q.setValueAtTime(1.1, currentSec);

            streamSrc.connect(filter).connect(trackGain);
            streamSrc.start();
            activeSources.push(streamSrc);

            let lastBub = 0;
            periodicUpdater = (t) => {
              if (t - lastBub > 0.09 + Math.random() * 0.15) {
                lastBub = t;
                const bub = ctx.createOscillator();
                const bG = ctx.createGain();
                bub.type = "sine";
                bub.frequency.setValueAtTime(2100 + Math.random() * 800, ctx.currentTime);
                bub.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.035);
                bG.gain.setValueAtTime(0.008, ctx.currentTime);
                bG.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.035);
                bub.connect(bG).connect(trackGain);
                bub.start();
                bub.stop(ctx.currentTime + 0.04);
              }
            };
          }
          break;
        }

        case "pines": {
          if (noise) {
            const windSrc = ctx.createBufferSource();
            windSrc.buffer = noise;
            windSrc.loop = true;

            const bp = ctx.createBiquadFilter();
            bp.type = "bandpass";
            bp.frequency.value = 290;
            bp.Q.value = 0.5;

            const lfo = ctx.createOscillator();
            const lg = ctx.createGain();
            lfo.type = "sine";
            lfo.frequency.value = 0.06; // sweeping slowly
            lg.gain.value = 85;

            lfo.connect(lg).connect(bp.frequency);
            windSrc.connect(bp).connect(trackGain);

            lfo.start();
            windSrc.start();
            activeSources.push(windSrc, lfo);
          }
          break;
        }

        case "meadow": {
          const drone = ctx.createOscillator();
          drone.type = "sine";
          drone.frequency.value = 115;
          const dg = ctx.createGain();
          dg.gain.value = 0.18;
          drone.connect(dg).connect(trackGain);
          drone.start();
          activeSources.push(drone);

          let lastGridChirp = 0;
          periodicUpdater = (t) => {
            if (t - lastGridChirp > 3.0 + Math.random() * 4.0) {
              lastGridChirp = t;
              const starNow = ctx.currentTime;
              for (let i = 0; i < 4; i++) {
                const triggerPoint = starNow + i * 0.065;
                const osc_c = ctx.createOscillator();
                const gain_c = ctx.createGain();
                osc_c.type = "sine";
                osc_c.frequency.setValueAtTime(4580 + Math.random() * 150, triggerPoint);
                gain_c.gain.setValueAtTime(0.012, triggerPoint);
                gain_c.gain.exponentialRampToValueAtTime(0.0001, triggerPoint + 0.04);
                osc_c.connect(gain_c).connect(trackGain);
                osc_c.start(triggerPoint);
                osc_c.stop(triggerPoint + 0.045);
              }
            }
          };
          break;
        }

        case "bowl": {
          const root = 144; // root key
          const components = [1.0, 1.41, 1.99, 2.72];
          components.forEach((multiplier, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = root * multiplier + (index * 0.4); // slightly detuned for beat frequencies

            const pulseLfo = ctx.createOscillator();
            pulseLfo.type = "sine";
            pulseLfo.frequency.value = 0.065 + index * 0.02;

            const lGain = ctx.createGain();
            lGain.gain.value = 0.09;

            pulseLfo.connect(lGain).connect(gain.gain);

            osc.connect(gain).connect(trackGain);
            pulseLfo.start();
            osc.start();
            activeSources.push(osc, pulseLfo);
          });
          break;
        }

        case "flute": {
          const steps = [293.6, 349.2, 392.0, 440.0, 523.2, 587.3]; // minor pentatonic
          let lastPhrasing = 0;
          periodicUpdater = (t) => {
            if (t - lastPhrasing > 4.5 + Math.random() * 4.0) {
              lastPhrasing = t;
              const pitch = steps[Math.floor(Math.random() * steps.length)];
              const nowMs = ctx.currentTime;

              const osc = ctx.createOscillator();
              const gain_fl = ctx.createGain();
              const bp = ctx.createBiquadFilter();

              osc.type = "triangle";
              osc.frequency.setValueAtTime(pitch, nowMs);

              const vibrato = ctx.createOscillator();
              const vibG = ctx.createGain();
              vibrato.frequency.setValueAtTime(5.8, nowMs);
              vibG.gain.setValueAtTime(3.5, nowMs);
              vibrato.connect(vibG).connect(osc.frequency);
              vibrato.start();

              bp.type = "bandpass";
              bp.frequency.setValueAtTime(pitch * 1.5, nowMs);
              bp.Q.setValueAtTime(1.2, nowMs);

              gain_fl.gain.setValueAtTime(0, nowMs);
              gain_fl.gain.linearRampToValueAtTime(0.08, nowMs + 1.2);
              gain_fl.gain.setTargetAtTime(0.03, nowMs + 1.5, 0.4);
              gain_fl.gain.exponentialRampToValueAtTime(0.0001, nowMs + 4.2);

              osc.connect(bp).connect(gain_fl).connect(trackGain);
              osc.start(nowMs);
              osc.stop(nowMs + 4.3);
              activeSources.push(osc, vibrato);
            }
          };
          break;
        }

        case "chant": {
          const pitches = [65.4, 65.7, 130.8]; // C monks choir formant detunings
          pitches.forEach((freq) => {
            const saw = ctx.createOscillator();
            saw.type = "sawtooth";
            saw.frequency.setValueAtTime(freq, currentSec);

            const vocalFormant = ctx.createBiquadFilter();
            vocalFormant.type = "bandpass";
            vocalFormant.frequency.value = 390; // "oohm" format
            vocalFormant.Q.value = 4.2;

            const sawGain = ctx.createGain();
            sawGain.gain.value = 0.14;

            saw.connect(vocalFormant).connect(sawGain).connect(trackGain);
            saw.start();
            activeSources.push(saw);
          });
          break;
        }

        case "bell": {
          let lastBellTime = 0;
          periodicUpdater = (t) => {
            if (t - lastBellTime > 9.0) {
              lastBellTime = t;
              const now = ctx.currentTime;
              const listArr = [520, 780, 1040];
              listArr.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now);
                const decaySec = 6.0 / (idx + 1);
                gain.gain.setValueAtTime(0.12 / (idx + 1), now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + decaySec);
                osc.connect(gain).connect(trackGain);
                osc.start(now);
                osc.stop(now + decaySec + 0.1);
              });
            }
          };
          break;
        }

        case "windchime": {
          let lastGlassChime = 0;
          periodicUpdater = (t) => {
            if (t - lastGlassChime > 2.2 + Math.random() * 4.0) {
              lastGlassChime = t;
              const steps = 3 + Math.floor(Math.random() * 3);
              for (let i = 0; i < steps; i++) {
                const delay = i * 0.12;
                const trigTime = ctx.currentTime + delay;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(2200 + Math.random() * 1900, trigTime);
                gain.gain.setValueAtTime(0.015, trigTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, trigTime + 0.4);
                osc.connect(gain).connect(trackGain);
                osc.start(trigTime);
                osc.stop(trigTime + 0.45);
              }
            }
          };
          break;
        }

        case "theta": {
          const lOsc = ctx.createOscillator();
          const rOsc = ctx.createOscillator();
          lOsc.type = "sine";
          lOsc.frequency.value = 432;
          rOsc.type = "sine";
          rOsc.frequency.value = 438; // 6Hz Theta drift

          const lGain = ctx.createGain();
          const rGain = ctx.createGain();
          lGain.gain.value = 0.5;
          rGain.gain.value = 0.5;

          const lp = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          const rp = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

          if (lp && rp) {
            lp.pan.value = -1.0;
            rp.pan.value = 1.0;
            lOsc.connect(lGain).connect(lp).connect(trackGain);
            rOsc.connect(rGain).connect(rp).connect(trackGain);
          } else {
            lOsc.connect(lGain).connect(trackGain);
            rOsc.connect(rGain).connect(trackGain);
          }

          lOsc.start();
          rOsc.start();
          activeSources.push(lOsc, rOsc);
          break;
        }

        case "solfeggio": {
          const sol = ctx.createOscillator();
          sol.type = "sine";
          sol.frequency.value = 528;
          const sg = ctx.createGain();
          sg.gain.value = 0.45;
          sol.connect(sg).connect(trackGain);
          sol.start();
          activeSources.push(sol);
          break;
        }

        case "delta": {
          const lOsc = ctx.createOscillator();
          const rOsc = ctx.createOscillator();
          lOsc.type = "sine";
          lOsc.frequency.value = 100;
          rOsc.type = "sine";
          rOsc.frequency.value = 102.5; // 2.5Hz Delta beat

          const lg = ctx.createGain();
          const rg = ctx.createGain();
          lg.gain.value = 0.6;
          rg.gain.value = 0.6;

          const lP = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          const rP = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

          if (lP && rP) {
            lP.pan.value = -1.0;
            rP.pan.value = 1.0;
            lOsc.connect(lg).connect(lP).connect(trackGain);
            rOsc.connect(rg).connect(rP).connect(trackGain);
          } else {
            lOsc.connect(lg).connect(trackGain);
            rOsc.connect(rg).connect(trackGain);
          }

          lOsc.start();
          rOsc.start();
          activeSources.push(lOsc, rOsc);
          break;
        }

        case "pink": {
          if (noise) {
            const pinkSrc = ctx.createBufferSource();
            pinkSrc.buffer = noise;
            pinkSrc.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 240; // Soft continuous background

            pinkSrc.connect(filter).connect(trackGain);
            pinkSrc.start();
            activeSources.push(pinkSrc);
          }
          break;
        }

        case "cradle": {
          const low = ctx.createOscillator();
          low.type = "triangle";
          low.frequency.value = 95;

          const lowpass = ctx.createBiquadFilter();
          lowpass.type = "lowpass";
          lowpass.frequency.value = 110;

          low.connect(lowpass).connect(trackGain);
          low.start();
          activeSources.push(low);
          break;
        }

        case "lofi": {
          let lastBeat = 0;
          periodicUpdater = (t) => {
            if (t - lastBeat > 2.0) { // 60 BPM lofi soft beat
              lastBeat = t;
              const now = ctx.currentTime;
              
              const kick = ctx.createOscillator();
              const kGain = ctx.createGain();
              kick.type = "sine";
              kick.frequency.setValueAtTime(54, now);
              kick.frequency.exponentialRampToValueAtTime(28, now + 0.12);
              kGain.gain.setValueAtTime(0.2, now);
              kGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
              kick.connect(kGain).connect(trackGain);
              kick.start();
              kick.stop(now + 0.14);
            }
          };

          if (noise) {
            const crackle = ctx.createBufferSource();
            crackle.buffer = noise;
            crackle.loop = true;
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.value = 3200;
            filter.Q.value = 1.3;
            const cg = ctx.createGain();
            cg.gain.value = 0.04;
            crackle.connect(filter).connect(cg).connect(trackGain);
            crackle.start();
            activeSources.push(crackle);
          }
          break;
        }

        case "piano": {
          const scale = [220.0, 246.9, 293.6, 329.6, 392.0, 440.0]; // pentatonic
          let lastPianoNote = 0;
          periodicUpdater = (t) => {
            if (t - lastPianoNote > 3.0 + Math.random() * 3.5) {
              lastPianoNote = t;
              const note = scale[Math.floor(Math.random() * scale.length)];
              const now = ctx.currentTime;

              const osc = ctx.createOscillator();
              const topHarmonic = ctx.createOscillator();
              const gain = ctx.createGain();

              osc.type = "sine";
              osc.frequency.setValueAtTime(note, now);

              topHarmonic.type = "sine";
              topHarmonic.frequency.setValueAtTime(note * 2.0, now);

              gain.gain.setValueAtTime(0.09, now);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

              osc.connect(gain);
              topHarmonic.connect(gain);
              gain.connect(trackGain);

              osc.start(now);
              topHarmonic.start(now);
              osc.stop(now + 2.6);
              topHarmonic.stop(now + 2.6);
            }
          };
          break;
        }

        case "harps": {
          const chord = [196.0, 246.9, 293.6, 392.0, 493.8, 587.3]; // G major arpeggios
          let lastPluck = 0;
          periodicUpdater = (t) => {
            if (t - lastPluck > 6.0) {
              lastPluck = t;
              const now = ctx.currentTime;
              chord.forEach((note, idx) => {
                const noteDelay = idx * 0.15;
                const trigTime = now + noteDelay;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(note, trigTime);
                gain.gain.setValueAtTime(0.038, trigTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, trigTime + 1.4);
                osc.connect(gain).connect(trackGain);
                osc.start(trigTime);
                osc.stop(trigTime + 1.5);
              });
            }
          };
          break;
        }

        case "midnight": {
          const padArr = [110.0, 130.8, 164.8, 196.0]; // slow sweep pads
          padArr.forEach((note) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = note;
            
            const envelope = ctx.createGain();
            envelope.gain.setValueAtTime(0.12, currentSec);

            osc.connect(envelope).connect(trackGain);
            osc.start();
            activeSources.push(osc);
          });
          break;
        }

        case "guitar": {
          const frets = [146.8, 196.0, 220.0, 293.6];
          let lastStringPluck = 0;
          periodicUpdater = (t) => {
            if (t - lastStringPluck > 3.5 + Math.random() * 2.8) {
              lastStringPluck = t;
              const note = frets[Math.floor(Math.random() * frets.length)];
              const now = ctx.currentTime;

              const osc = ctx.createOscillator();
              const filter = ctx.createBiquadFilter();
              const gain = ctx.createGain();

              osc.type = "triangle";
              osc.frequency.setValueAtTime(note, now);

              filter.type = "lowpass";
              filter.frequency.setValueAtTime(500, now);
              filter.frequency.exponentialRampToValueAtTime(120, now + 0.4);

              gain.gain.setValueAtTime(0.08, now);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

              osc.connect(filter).connect(gain).connect(trackGain);
              osc.start(now);
              osc.stop(now + 2.0);
            }
          };
          break;
        }

        default:
          break;
      }

      // Smooth fade-in to prevent clicks
      trackGain.gain.setValueAtTime(0, ctx.currentTime);
      trackGain.gain.linearRampToValueAtTime(trackVolumes[track.id], ctx.currentTime + 0.8);

      synthNodesRef.current[track.id] = {
        gainNode: trackGain,
        sources: activeSources,
        updater: periodicUpdater
      };

    } else {
      setActiveTracks({});
      const activeObj = synthNodesRef.current[track.id];
      if (activeObj) {
        const now = ctx.currentTime;
        activeObj.gainNode.gain.setValueAtTime(activeObj.gainNode.gain.value, now);
        activeObj.gainNode.gain.linearRampToValueAtTime(0, now + 0.45);

        setTimeout(() => {
          activeObj.sources.forEach(src => {
            try { src.stop(); } catch {}
            try { src.disconnect(); } catch {}
          });
          try { activeObj.gainNode.disconnect(); } catch {}
          delete synthNodesRef.current[track.id];
        }, 500);
      }
    }
  };

  const updatePeriodicAudioSynths = (elapsedSec: number) => {
    Object.keys(synthNodesRef.current).forEach(trackId => {
      const activeObj = synthNodesRef.current[trackId];
      if (activeObj && activeObj.updater) {
        activeObj.updater(elapsedSec);
      }
    });
  };

  // Pure Canvas Rendering and Physics Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const rob = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) {
      rob.observe(containerRef.current);
    }

    // Interactive Ball Physics Variables
    let ball = {
      x: window.innerWidth / 2 || 250,
      y: 110,
      vx: 0,
      vy: 1.0,
      radius: 20
    };

    let trail: { x: number; y: number; time: number }[] = [];
    let animationFrameId: number;
    let startTime = performance.now();
    let sessionElapsedTime = 0;
    let prevElapsed = 0;
    let lastFrameTime = 0;

    const render = (timeMs: number) => {
      animationFrameId = requestAnimationFrame(render);
      const elapsedMs = timeMs - startTime;
      const elapsedSec = timeMs / 1000;
      const dynamicColors = getThemeColors();

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.fillStyle = dynamicColors.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Web Audio clock ticker update
      updatePeriodicAudioSynths(elapsedSec);

      // Rendering background ripples
      ripplesRef.current.forEach(r => {
        r.radius += 1.8;
        r.alpha -= 0.015;
        if (r.alpha > 0) {
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ripplesRef.current = ripplesRef.current.filter(r => r.alpha > 0);

      // Collision particles drawing
      particlesRef.current.forEach(p => {
        p.x += p.vx * breathPaceRef.current;
        p.y += p.vy * breathPaceRef.current;
        p.alpha -= 1 / p.maxLife;
        p.radius -= p.radius / p.maxLife;
        if (p.alpha > 0 && p.radius > 0.1) {
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw central physical breathing helper ring that expands and shrinks with gravity or pace
      ctx.save();
      const pulseScalar = 1 + Math.sin(timeMs / 1300) * 0.22;
      const ringRadius = Math.min(width, height) * 0.15 * pulseScalar;

      const radialGrad = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.45, centerX, centerY, ringRadius);
      radialGrad.addColorStop(0, "rgba(255,255,255,0)");
      radialGrad.addColorStop(0.35, "rgba(255,255,255,0.01)");
      radialGrad.addColorStop(1, dynamicColors.glowColor.replace("0.45", "0.08"));

      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = dynamicColors.glowColor.replace("0.45", "0.15");
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Breathing alignment label text
      ctx.save();
      ctx.font = "14px 'Space Grotesk', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const ballAscending = ball.vy < 0;
      ctx.fillStyle = "rgba(255,255,255,0.24)";
      ctx.fillText(ballAscending ? "INHALE" : "EXHALE", centerX, centerY - 8);

      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.11)";
      ctx.fillText(ballAscending ? "expansion as the ball ascends" : "release as the ball descends", centerX, centerY + 12);
      ctx.restore();

      // Draw a subtle serene visual ground line above the menu bar
      const groundY = height - 120;
      ctx.save();
      const groundGrad = ctx.createLinearGradient(0, groundY, width, groundY);
      groundGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      groundGrad.addColorStop(0.2, dynamicColors.glowColor.replace("0.45", "0.22"));
      groundGrad.addColorStop(0.8, dynamicColors.glowColor.replace("0.45", "0.22"));
      groundGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = groundGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();
      ctx.restore();

      // PHYSICS SIMULATION OF BALL (Strict Centered Vertical Bouncing Loop - Parametric & Frame-rate independent)
      ball.x = centerX;
      ball.vx = 0;

      if (!isSessionStartedRef.current) {
        ball.y = groundY - ball.radius;
        ball.vy = 0;
        trail = [];
        sessionElapsedTime = 0;
        prevElapsed = 0;
        lastFrameTime = 0;
      } else if (isPlayingRef.current) {
        let elapsedMsSinceLastFrame = 0;
        if (lastFrameTime > 0) {
          elapsedMsSinceLastFrame = timeMs - lastFrameTime;
          // Guard against tab suspension jump glitches
          if (elapsedMsSinceLastFrame > 1000) {
            elapsedMsSinceLastFrame = 16.67;
          }
        } else {
          elapsedMsSinceLastFrame = 16.67;
        }
        lastFrameTime = timeMs;
        sessionElapsedTime += elapsedMsSinceLastFrame / 1000;

        const elapsed = sessionElapsedTime;
        const T = breathCycleSecondsRef.current;
        const cycleProgress = (elapsed % T) / T;

        const maxUsableRange = groundY - ball.radius * 2;
        const targetBounceHeight = Math.max(80, maxUsableRange * 0.75);

        // Parabolic trajectory: precise mathematical loop (inhale ascent, exhale descent)
        const h = 4 * targetBounceHeight * cycleProgress * (1 - cycleProgress);
        ball.y = groundY - ball.radius - h;

        // Perfect physical velocity representation matching the analytical derivative of parabola
        ball.vy = (4 * targetBounceHeight / T) * (2 * cycleProgress - 1);

        // Check for complete cycle bounce
        const prevCycleIndex = Math.floor(prevElapsed / T);
        const currentCycleIndex = Math.floor(elapsed / T);

        if (currentCycleIndex > prevCycleIndex) {
          // Bounce triggered exactly at ground level
          const speed = (4 * targetBounceHeight / T);
          triggerASMRThud(speed * 0.85);

          setBounceCount(prev => {
            const next = prev + 1;
            if (next > 0 && next % 10 === 0) {
              const rIdx = Math.floor(Math.random() * SOOTHING_AFFIRMATIONS.length);
              setCurrentAffirmation(SOOTHING_AFFIRMATIONS[rIdx]);
              setShowAffirmationAlert(true);
            }
            return next;
          });

          // Draw collision splash particles as an upward fountain of pure light
          for (let i = 0; i < 12; i++) {
            const angle = -Math.PI / 2 + (Math.random() * 0.8 - 0.4);
            const velocityPower = 2.0 + Math.random() * 4.5;
            particlesRef.current.push({
              x: ball.x,
              y: groundY,
              vx: Math.cos(angle) * velocityPower,
              vy: Math.sin(angle) * velocityPower,
              radius: 1.5 + Math.random() * 2.5,
              color: dynamicColors.particleColors[Math.floor(Math.random() * dynamicColors.particleColors.length)],
              alpha: 1.0,
              life: 0,
              maxLife: 40 + Math.floor(Math.random() * 30)
            });
          }

          // Ambient circular shockwave ripples expanding from impact point
          ripplesRef.current.push({
            x: ball.x,
            y: groundY,
            radius: 4,
            maxRadius: 38,
            color: dynamicColors.glowColor.replace("0.45", "0.3"),
            alpha: 0.5
          });
        }

        prevElapsed = elapsed;

        // Push trailing frame coordinates
        trail.push({ x: ball.x, y: ball.y, time: elapsedMs });
        if (trail.length > 20) {
          trail.shift();
        }
      } else {
        // Paused but session has started: hold lastFrameTime so when we play there is no huge kinematic jump
        lastFrameTime = 0;
      }

      // Drawing ball trail background glows
      ctx.save();
      trail.forEach((pt, index) => {
        const ratio = index / trail.length;
        ctx.globalAlpha = ratio * 0.26;
        const relativeSize = ball.radius * (0.4 + ratio * 0.6);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, relativeSize, 0, Math.PI * 2);

        if (avatarRef.current === "pulsar") {
          ctx.fillStyle = dynamicColors.accentText.includes("pink") ? "rgba(217, 70, 239, 0.4)" : (dynamicColors.accentText.includes("emerald") ? "rgba(52, 211, 153, 0.4)" : "rgba(129, 140, 248, 0.4)");
        } else if (avatarRef.current === "zen_pebble") {
          ctx.fillStyle = "rgba(100, 116, 139, 0.25)";
        } else if (avatarRef.current === "aura_quark") {
          ctx.fillStyle = "rgba(34, 211, 238, 0.25)";
        } else if (avatarRef.current === "lotus_core") {
          ctx.fillStyle = "rgba(252, 211, 77, 0.25)";
        } else if (avatarRef.current === "singularity") {
          ctx.fillStyle = "rgba(129, 140, 248, 0.2)";
        } else {
          ctx.fillStyle = dynamicColors.ballColor;
        }
        ctx.fill();
      });
      ctx.restore();

      // Drawing ball core models
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = dynamicColors.glowColor;

      const currentAvatar = avatarRef.current;

      if (currentAvatar === "glow_orb") {
        const radial = ctx.createRadialGradient(
          ball.x - ball.radius * 0.25, 
          ball.y - ball.radius * 0.25, 
          ball.radius * 0.08, 
          ball.x, 
          ball.y, 
          ball.radius
        );
        radial.addColorStop(0, "#ffffff");
        radial.addColorStop(0.35, dynamicColors.ballColor);
        radial.addColorStop(1, "rgba(255,255,255,0.55)");

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius * 0.35, ball.y - ball.radius * 0.35, ball.radius * 0.12, 0, Math.PI * 2);
        ctx.fill();

      } else if (currentAvatar === "zen_pebble") {
        ctx.shadowColor = "rgba(0,0,0,0.52)";
        ctx.shadowBlur = 8;

        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 1.03, 0, Math.PI * 2);
        ctx.fill();

        const grad = ctx.createLinearGradient(ball.x - ball.radius, ball.y - ball.radius, ball.x + ball.radius, ball.y + ball.radius);
        grad.addColorStop(0, "#94a3b8");
        grad.addColorStop(1, "#334155");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ball.x + 2, ball.y + 1, ball.radius * 0.55, 0, Math.PI * 2);
        ctx.stroke();

      } else if (currentAvatar === "pulsar") {
        const bouncePulse = 1 + Math.sin(timeMs / 160) * 0.14;
        const outerRad = ball.radius * bouncePulse;

        const pulsGrad = ctx.createRadialGradient(ball.x, ball.y, ball.radius * 0.4, ball.x, ball.y, outerRad * 1.2);
        pulsGrad.addColorStop(0, dynamicColors.ballColor);
        pulsGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
        pulsGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = pulsGrad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, outerRad * 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

      } else if (currentAvatar === "aura_quark") {
        const microOffset = Math.sin(timeMs / 45) * 1.5;
        ctx.shadowColor = dynamicColors.ballColor;
        ctx.shadowBlur = 20;

        for (let i = 2; i > 0; i--) {
          ctx.strokeStyle = dynamicColors.glowColor.replace("0.45", (0.15 * i).toString());
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius * (1.1 + i * 0.25) + microOffset, 0, Math.PI * 2);
          ctx.stroke();
        }

        const radGrad = ctx.createRadialGradient(ball.x, ball.y, 2, ball.x, ball.y, ball.radius);
        radGrad.addColorStop(0, "#ffffff");
        radGrad.addColorStop(0.5, dynamicColors.ballColor);
        radGrad.addColorStop(1, "#151726");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

      } else if (currentAvatar === "lotus_core") {
        ctx.shadowColor = dynamicColors.ballColor;
        ctx.shadowBlur = 12;

        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = dynamicColors.ballColor;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.35, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = dynamicColors.glowColor;
        ctx.lineWidth = 0.8;
        for (let j = 0; j < 8; j++) {
          const rotationAngle = (j * Math.PI) / 4 + timeMs / 4000;
          ctx.beginPath();
          ctx.ellipse(ball.x, ball.y, ball.radius, ball.radius * 0.35, rotationAngle, 0, Math.PI * 2);
          ctx.stroke();
        }

      } else if (currentAvatar === "singularity") {
        ctx.shadowColor = dynamicColors.ballColor;
        ctx.shadowBlur = 24;

        const discPulse = 1.2 + Math.sin(timeMs / 300) * 0.15;
        ctx.strokeStyle = dynamicColors.ballColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * discPulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Pause message rendering inside loop
      if (!isPlayingRef.current && isSessionStartedRef.current) {
        ctx.save();
        ctx.fillStyle = "rgba(10,10,12,0.4)";
        ctx.fillRect(0, 0, width, height);

        ctx.font = "600 16px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", centerX, centerY - 25);

        ctx.font = "12px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText("Tap anywhere on the canvas to resume peace & flow", centerX, centerY + 8);
        ctx.restore();
      }
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
      rob.disconnect();
    };
  }, [selectedTheme]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    lazyInitAudio();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const r = canvas.getBoundingClientRect();
    const clickX = e.clientX - r.left;
    const clickY = e.clientY - r.top;

    ripplesRef.current.push({
      x: clickX,
      y: clickY,
      radius: 4,
      maxRadius: 105,
      color: themeColors.glowColor.replace("0.45", "0.55"),
      alpha: 1.0
    });

    if (!isSessionStarted) {
      setIsSessionStarted(true);
      setIsEnginePlaying(true);
    } else {
      setIsEnginePlaying(prev => !prev);
    }

    // Adding gentle tactile momentum ripples
    for (let i = 0; i < 8; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      particlesRef.current.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(pAngle) * 3,
        vy: Math.sin(pAngle) * 3,
        radius: 1.5 + Math.random() * 2.5,
        color: themeColors.ballColor,
        alpha: 0.9,
        life: 0,
        maxLife: 35
      });
    }
  };

  const handleTabClick = (tabId: "sliders" | "avatars" | "themes" | "mixer") => {
    lazyInitAudio();
    setIsEnginePlaying(false); // Stop the ball physics when click any menu tab

    if (activeTab === tabId) {
      setIsPanelOpen(!isPanelOpen);
    } else {
      setActiveTab(tabId);
      setIsPanelOpen(true);
    }
  };

  const resetCycle = () => {
    setBounceCount(0);
    setTotalSeconds(0);
    setIsSessionStarted(false);
    setIsEnginePlaying(false);
    setCurrentAffirmation("Breathe in... Breathe out. Relax with the peaceful rhythm.");
    setShowAffirmationAlert(true);
    if (audioCtxRef.current) {
      triggerASMRThud(4.5);
    }
  };

  return (
    <div 
      ref={containerRef}
      id="prana-bounce-app-main-wrapper"
      className={`relative w-full h-screen overflow-hidden bg-gradient-to-b ${themeColors.bg} transition-all duration-1000 select-none font-sans text-neutral-200`}
    >
      {/* 100% Immersive Full-Screen Canvas */}
      <main className="absolute inset-0 w-full h-full z-0">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer"
        />
      </main>

      {/* MINIMALIST CORNER WIDGETS (Symmetric HUD in clean corners) */}
      
      {/* Top Left: Immersive Focus Toggle */}
      <button
        onClick={() => setIsFocusMode(!isFocusMode)}
        title={isFocusMode ? "Show Controls Menu" : "Immersive Focus Mode (Hide controls)"}
        className="absolute top-5 left-5 z-30 flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-md text-xs font-medium tracking-wide transition-all shadow-md cursor-pointer active:scale-95"
      >
        {isFocusMode ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
        <span>{isFocusMode ? "Controls" : "Focus Mode"}</span>
      </button>

      {/* Top Right: Quiet corner Guide Button */}
      <button
        onClick={() => setIsGuideOpen(true)}
        title="Open Instructions Guide"
        className="absolute top-5 right-5 z-30 flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-md text-xs font-medium tracking-wide transition-all shadow-md cursor-pointer active:scale-95"
      >
        <HelpCircle className="w-3.5 h-3.5 text-indigo-300 animate-pulse-slow" />
        <span>Guide</span>
      </button>

      {/* DETAILS PANEL: Now a gorgeous, card-molded popup hovering above the sticky dock */}
      {!isFocusMode && isPanelOpen && (
        <div 
          id="menu-details-panel"
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-2xl backdrop-blur-2xl rounded-3xl p-5 shadow-2.5xl transition-all duration-300 transform scale-100 ease-out border border-white/10 ${themeColors.cardBg} max-h-[50vh] overflow-y-auto`}
        >
          <div className="max-w-full flex flex-col space-y-4">
            
            {/* Header Row of Panel */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs uppercase font-bold tracking-widest font-display text-white flex items-center space-x-2">
                {activeTab === "sliders" && (
                  <>
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Breath & Physics Settings</span>
                  </>
                )}
                {activeTab === "avatars" && (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>Interactive Avatar Styles</span>
                  </>
                )}
                {activeTab === "themes" && (
                  <>
                    <Palette className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Visual Atmosphere Themes</span>
                  </>
                )}
                {activeTab === "mixer" && (
                  <>
                    <Music className="w-3.5 h-3.5 text-sky-400 animate-pulse-slow" />
                    <span>Ambient Audio Synthesizer Mixer</span>
                  </>
                )}
              </h3>

              <div className="flex items-center">
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  title="Minimize details"
                  className="p-1 px-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-404 hover:text-white text-[10px] font-mono select-none"
                >
                  ✕ CLOSE
                </button>
              </div>
            </div>

            {/* TAB SECTIONS CONTENT: Neatly budgeted height */}
            <div className="min-h-[140px] max-h-[185px] overflow-y-auto pr-1">
              
              {/* TAB 1: SLIDERS & SETTINGS */}
              {activeTab === "sliders" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
                  {/* Breath Cycle Duration Controller (seconds) */}
                  <div className="flex flex-col space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-300 font-medium font-display">Breath Cycle Duration</span>
                      <span className="text-indigo-300 font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded shadow">
                        {breathCycleSeconds.toFixed(1)} Seconds
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="15.0"
                      step="0.5"
                      value={breathCycleSeconds}
                      onChange={(e) => setBreathCycleSeconds(parseFloat(e.target.value))}
                      className="w-full h-1 bg-neutral-800 accent-indigo-400 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono">
                      <span>3.0s cycle (energize)</span>
                      <span>15.0s cycle (deep calm)</span>
                    </div>
                  </div>

                  {/* ASMR Impact Thud Settings */}
                  <div className="flex flex-col space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-300 font-medium font-display">Grounding ASMR Thud Volume</span>
                      <span className="text-neutral-400 font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                        {Math.round(asmrVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max="1.00"
                      step="0.05"
                      value={asmrVolume}
                      onChange={(e) => setAsmrVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-neutral-800 accent-indigo-455 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono">
                      <span>Muted</span>
                      <span>Gentle procedural thud on bottom contact</span>
                    </div>
                  </div>

                  {/* Gravity physics constant selector */}
                  <div className="flex flex-col space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-300 font-medium font-display">Breath Depth (Height Gravity)</span>
                      <span className="text-neutral-400 font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                        {gravityStrength.toFixed(2)} accel
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.15"
                      max="0.80"
                      step="0.05"
                      value={gravityStrength}
                      onChange={(e) => setGravityStrength(parseFloat(e.target.value))}
                      className="w-full h-1 bg-neutral-800 accent-indigo-455 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono">
                      <span>Tall floating state</span>
                      <span>Brisk cyclical timing</span>
                    </div>
                  </div>

                  {/* Master Ambient Audio Volume */}
                  <div className="flex flex-col space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-300 font-medium font-display">Master Synthesizer Level</span>
                      <span className="text-neutral-400 font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                        {Math.round(masterAmbientVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max="1.00"
                      step="0.05"
                      value={masterAmbientVolume}
                      onChange={(e) => setMasterAmbientVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-neutral-800 accent-indigo-455 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono flex-row">
                      <span className="flex items-center space-x-1">
                        <VolumeX className="w-3 h-3" />
                        <span>Mute</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Volume2 className="w-3 h-3" />
                        <span>Ambient Max</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AVATAR STYLES */}
              {activeTab === "avatars" && (
                <div className="py-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <button
                      onClick={() => setSelectedAvatar("glow_orb")}
                      className={`flex flex-col justify-between p-3 rounded-2xl border transition-all text-left group cursor-pointer ${
                        selectedAvatar === "glow_orb" 
                          ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-xl" 
                          : "border-white/5 bg-black/10 hover:bg-white/5 text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-sky-450 to-indigo-400 shadow-lg group-hover:scale-110 transition-transform"></span>
                        {selectedAvatar === "glow_orb" && <Check className="w-3 h-3 text-indigo-400" />}
                      </div>
                      <span className="text-xs font-semibold text-white leading-none font-display">Glowing Orb</span>
                      <span className="text-[9px] text-neutral-500 font-mono mt-1 mt-auto leading-none">Soft light aura</span>
                    </button>

                    <button
                      onClick={() => setSelectedAvatar("zen_pebble")}
                      className={`flex flex-col justify-between p-3 rounded-2xl border transition-all text-left group cursor-pointer ${
                        selectedAvatar === "zen_pebble" 
                          ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-xl" 
                          : "border-white/5 bg-black/10 hover:bg-white/5 text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-5 h-4 rounded-full bg-slate-550 border border-slate-600 shadow animate-pulse-slow"></span>
                        {selectedAvatar === "zen_pebble" && <Check className="w-3 h-3 text-indigo-400" />}
                      </div>
                      <span className="text-xs font-semibold text-white leading-none font-display">Zen Pebble</span>
                      <span className="text-[9px] text-neutral-500 font-mono mt-1 mt-auto leading-none">Balanced stone</span>
                    </button>

                    <button
                      onClick={() => setSelectedAvatar("pulsar")}
                      className={`flex flex-col justify-between p-3 rounded-2xl border transition-all text-left group cursor-pointer ${
                        selectedAvatar === "pulsar" 
                          ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-xl" 
                          : "border-white/5 bg-black/10 hover:bg-white/5 text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-4 h-4 rounded-full bg-white border border-indigo-400 flex items-center justify-center animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        </span>
                        {selectedAvatar === "pulsar" && <Check className="w-3 h-3 text-indigo-400" />}
                      </div>
                      <span className="text-xs font-semibold text-white leading-none font-display">Cosmic Pulsar</span>
                      <span className="text-[9px] text-neutral-500 font-mono mt-1 mt-auto leading-none">Breathing pulsar</span>
                    </button>

                    <button
                      onClick={() => setSelectedAvatar("aura_quark")}
                      className={`flex flex-col justify-between p-3 rounded-2xl border transition-all text-left group cursor-pointer ${
                        selectedAvatar === "aura_quark" 
                          ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-xl" 
                          : "border-white/5 bg-black/10 hover:bg-white/5 text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)] border border-cyan-300"></span>
                        {selectedAvatar === "aura_quark" && <Check className="w-3 h-3 text-indigo-400" />}
                      </div>
                      <span className="text-xs font-semibold text-white leading-none font-display">Aura Quark</span>
                      <span className="text-[9px] text-neutral-500 font-mono mt-1 mt-auto leading-none">Vibrant quantum state</span>
                    </button>

                    <button
                      onClick={() => setSelectedAvatar("lotus_core")}
                      className={`flex flex-col justify-between p-3 rounded-2xl border transition-all text-left group cursor-pointer ${
                        selectedAvatar === "lotus_core" 
                          ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-xl" 
                          : "border-white/5 bg-black/10 hover:bg-white/5 text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-4 h-4 rounded-full border border-amber-300 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        </div>
                        {selectedAvatar === "lotus_core" && <Check className="w-3 h-3 text-indigo-400" />}
                      </div>
                      <span className="text-xs font-semibold text-white leading-none font-display">Lotus Core</span>
                      <span className="text-[9px] text-neutral-500 font-mono mt-1 mt-auto leading-none">Sacred geometry</span>
                    </button>

                    <button
                      onClick={() => setSelectedAvatar("singularity")}
                      className={`flex flex-col justify-between p-3 rounded-2xl border transition-all text-left group cursor-pointer ${
                        selectedAvatar === "singularity" 
                          ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-xl" 
                          : "border-white/5 bg-black/10 hover:bg-white/5 text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 bg-neutral-950 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                        </div>
                        {selectedAvatar === "singularity" && <Check className="w-3 h-3 text-indigo-400" />}
                      </div>
                      <span className="text-xs font-semibold text-white leading-none font-display">Singularity</span>
                      <span className="text-[9px] text-neutral-500 font-mono mt-1 mt-auto leading-none">Event horizon ring</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: THEMES */}
              {activeTab === "themes" && (
                <div className="py-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedTheme("cosmic_slate")}
                      className={`p-3 rounded-2xl border transition-all text-left flex justify-between items-center cursor-pointer group ${
                        selectedTheme === "cosmic_slate"
                          ? "border-indigo-500 bg-indigo-500/10 text-white"
                          : "border-white/5 bg-black/10 hover:bg-white/5 text-neutral-400"
                      }`}
                    >
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-xs font-bold font-display text-white">Cosmic Slate</span>
                        <span className="text-[10px] text-neutral-400">Deep obsidian indigo space, elegant blue</span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <div className="flex space-x-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                        </div>
                        {selectedTheme === "cosmic_slate" && <Check className="w-3 h-3 text-indigo-400" />}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedTheme("mint_radiance")}
                      className={`p-3 rounded-2xl border transition-all text-left flex justify-between items-center cursor-pointer group ${
                        selectedTheme === "mint_radiance"
                          ? "border-emerald-500 bg-emerald-500/10 text-white"
                          : "border-white/5 bg-black/10 hover:bg-white/5 text-neutral-400"
                      }`}
                    >
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-xs font-bold font-display text-white">Mint Radiance</span>
                        <span className="text-[10px] text-neutral-400">Fresh herbal organic and clean earth stone tones</span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <div className="flex space-x-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-850"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-450 border border-emerald-400/20"></span>
                        </div>
                        {selectedTheme === "mint_radiance" && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedTheme("gentle_twilight")}
                      className={`p-3 rounded-2xl border transition-all text-left flex justify-between items-center cursor-pointer group ${
                        selectedTheme === "gentle_twilight"
                          ? "border-pink-500 bg-pink-500/10 text-white"
                          : "border-white/5 bg-black/10 hover:bg-white/5 text-neutral-400"
                      }`}
                    >
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-xs font-bold font-display text-white">Gentle Twilight</span>
                        <span className="text-[10px] text-neutral-400">Safe lavender sky twilight purple settings</span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <div className="flex space-x-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#110e16] border border-neutral-805"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 border border-pink-400/20"></span>
                        </div>
                        {selectedTheme === "gentle_twilight" && <Check className="w-3 h-3 text-pink-400" />}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: MIXER LIST (20 Active synthesis nodes) */}
              {activeTab === "mixer" && (
                <div className="py-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {["Nature", "Meditation", "Focus Frequencies", "Music"].map((category) => {
                      const categoryTracks = AMBIENT_TRACKS.filter(t => t.category === category);
                      return (
                        <div key={category} className="flex flex-col space-y-1.5 bg-black/20 p-2.5 rounded-2xl border border-white/5">
                          <h4 className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-widest border-b border-white/5 pb-1 mb-1 font-mono">
                            {category}
                          </h4>
                          <div className="flex flex-col space-y-1 max-h-[140px] overflow-y-auto">
                            {categoryTracks.map((track) => {
                              const active = !!activeTracks[track.id];
                              return (
                                <div 
                                  key={track.id}
                                  className={`flex flex-col p-1.5 rounded-xl border transition-all text-left ${
                                    active
                                      ? "bg-indigo-500/15 border-indigo-500/30 text-white"
                                      : "bg-transparent border-transparent text-neutral-400 hover:bg-white/5 hover:text-neutral-250 cursor-pointer"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <button
                                      onClick={() => toggleAmbientTrack(track)}
                                      className="flex-grow flex items-center space-x-2 text-[11px] font-medium text-left cursor-pointer"
                                    >
                                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${
                                        active ? "bg-indigo-500 text-white" : "border border-neutral-700 bg-neutral-900"
                                      }`}>
                                        {active && <Check className="w-2.5 h-2.5 font-bold" />}
                                      </div>
                                      <span className="truncate leading-none">{track.name}</span>
                                    </button>

                                    {track.frequencyLabel && (
                                      <span className="text-[7px] font-mono shrink-0 px-1 py-0.5 rounded bg-black/40 text-indigo-300">
                                        {track.frequencyLabel}
                                      </span>
                                    )}
                                  </div>

                                  {active && (
                                    <div className="flex items-center space-x-1.5 mt-1">
                                      <Volume2 className="w-2.5 h-2.5 text-neutral-400" />
                                      <input
                                        type="range"
                                        min="0.1" 
                                        max="1.0"
                                        step="0.05"
                                        value={trackVolumes[track.id]}
                                        onChange={(e) => {
                                          const volumeVal = parseFloat(e.target.value);
                                          setTrackVolumes(prev => ({ ...prev, [track.id]: volumeVal }));
                                        }}
                                        className="h-0.5 flex-1 bg-neutral-800 accent-indigo-400 appearance-none cursor-pointer"
                                      />
                                      <span className="text-[8px] font-mono text-neutral-400">
                                        {Math.round(trackVolumes[track.id] * 100)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Steady Calm Footer credit aligned exactly as requested */}
            <div className="pt-2 border-t border-white/5 text-center">
              <p className="text-[9.5px] tracking-widest text-neutral-550 font-mono uppercase">
                Crafted with Serenity by Ojas Mind © 2026
              </p>
            </div>

          </div>
        </div>
      )}

      {/* COCKPIT DOCK STICKY NAVIGATION BAR */}
      <footer 
        id="sticky-cockpit-dock"
        className={`fixed left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-sm transition-all duration-500 ease-out ${
          isFocusMode ? "bottom-[-100px] opacity-0 pointer-events-none" : "bottom-6 opacity-100"
        }`}
      >
        <div className={`p-2 px-4 rounded-full border border-white/10 backdrop-blur-2xl shadow-2.5xl flex items-center justify-between ${themeColors.cardBg}`}>
          {/* Left Portion: Sticky Interactive Navigation Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleTabClick("sliders")}
              title="Breath & Physics Settings"
              className={`p-2 rounded-full transition-all duration-200 cursor-pointer relative group ${
                isPanelOpen && activeTab === "sliders" 
                  ? "bg-indigo-500/25 text-indigo-300 border border-white/10" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleTabClick("avatars")}
              title="Interactive Avatars"
              className={`p-2 rounded-full transition-all duration-200 cursor-pointer relative group ${
                isPanelOpen && activeTab === "avatars" 
                  ? "bg-indigo-500/25 text-indigo-300 border border-white/10" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
            </button>

            <button
              onClick={() => handleTabClick("themes")}
              title="Aura Themes"
              className={`p-2 rounded-full transition-all duration-200 cursor-pointer relative group ${
                isPanelOpen && activeTab === "themes" 
                  ? "bg-indigo-500/25 text-indigo-300 border border-white/10" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Palette className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleTabClick("mixer")}
              title="Ambient Frequencies Mixer"
              className={`p-2 rounded-full transition-all duration-200 cursor-pointer relative group ${
                isPanelOpen && activeTab === "mixer" 
                  ? "bg-indigo-500/25 text-indigo-350 border border-white/10" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Music className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-white/15 mx-1 shrink-0" />

          {/* Right Portion: Playback & Action Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                lazyInitAudio();
                setIsEnginePlaying(!isEnginePlaying);
              }}
              title={isEnginePlaying ? "Pause breathing loop" : "Resume breathing loop"}
              className={`p-2 rounded-full border transition-all active:scale-95 cursor-pointer hover:shadow-lg ${
                isEnginePlaying 
                  ? "bg-indigo-500/20 border-indigo-505/30 text-indigo-300 hover:bg-indigo-500/30" 
                  : "bg-emerald-500/20 border-emerald-505/30 text-emerald-300 hover:bg-emerald-500/30 animate-pulse"
              }`}
            >
              {isEnginePlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>

            <button
              onClick={resetCycle}
              title="Restart session stats"
              className="p-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>

      {/* Quiet top-center time and loop count widget (rendered at all times at the top of the screen) */}
      <div id="focus-mode-timer-bubble" className="absolute top-5 left-1/2 -translate-x-1/2 z-35 flex items-center space-x-4 px-4 py-1.5 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/5 shadow-lg text-neutral-300 text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow shrink-0"></span>
          <span className="text-white font-semibold tracking-wide">
            {Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:{Math.floor(totalSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <span className="text-neutral-500 font-sans select-none">|</span>
        <span className="text-[11px] font-sans text-neutral-400 tracking-wide font-normal">
          {bounceCount} loops
        </span>
      </div>

      {/* GLOWING CENTER START BUTTON OVERLAY */}
      {!isSessionStarted && (
        <div id="start-session-screen-overlay" className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
          <div className="text-center space-y-4 max-w-sm px-6 py-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl pointer-events-auto transition-transform hover:scale-101">
            <h2 className="text-base font-extrabold uppercase tracking-widest text-indigo-300 font-display">Prana Breath Bounce</h2>
            <p className="text-xs text-neutral-300 leading-relaxed font-light font-sans">
              Rest your gaze on the focal avatar at the base. Sync your breath as it ascends and releases.
            </p>
            <button
              id="start-session-btn"
              onClick={() => {
                lazyInitAudio();
                setIsSessionStarted(true);
                setIsEnginePlaying(true);
              }}
              className="mt-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-650 hover:from-indigo-400 hover:to-indigo-550 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-550/20 active:scale-95 cursor-pointer transition-all hover:shadow-indigo-550/40 flex items-center space-x-2 mx-auto justify-center"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Begin Practice</span>
            </button>
          </div>
        </div>
      )}

      {/* MINIMALIST BACKDROP BLURRED INSTRUCTIONS OVERLAY DIALOG */}
      {isGuideOpen && (
        <div 
          id="guide-modal-overlay"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-fade-in"
        >
          {/* Modal Card content container */}
          <div className="bg-neutral-900/95 border border-white/10 max-w-md w-full rounded-3xl p-6 shadow-2xl relative backdrop-blur-xl overflow-hidden text-neutral-200">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            
            {/* Absolute Close button */}
            <button 
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all active:scale-95 cursor-pointer border border-transparent hover:border-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Guide Header */}
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-white font-display">Prana Bounce Guide</h3>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-sm leading-relaxed">
              <p className="text-neutral-300 font-light text-xs">
                Welcome to <span className="text-white font-medium">Prana Bounce</span>, an immersive, distraction-free sanity tool featuring a rigid vertical breath-pace loop matched to beautiful synthesized frequencies.
              </p>

              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3">
                <h4 className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest font-mono">Mindfulness Practice</h4>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-550/20 text-indigo-300 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <p className="text-xs text-neutral-300">
                    <strong className="text-white">Inhale</strong> as the ball rises upward. Let your lungs fill deep and steady.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-550/20 text-indigo-300 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <p className="text-xs text-neutral-300">
                    <strong className="text-white">Exhale</strong> as the ball descends. Release muscles and let go of thought lines.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-550/20 text-indigo-300 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <p className="text-xs text-neutral-300">
                    <strong className="text-white">ASMR Grounding</strong>: The soft wood mallet tone triggers strictly at gravity's floor contact as a heartbeat warning to refocus.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-400">
                <p>• Set your comfort timing with the <strong className="text-neutral-300">Breath Pace</strong> speed slider. Slower pace stretches the physical loop higher and deeper.</p>
                <p>• Build your customized garden of tranquility using the <strong className="text-neutral-300">20 ambient synthesizer tracks</strong> in the bottom mixer.</p>
                <p>• Click or tap anywhere directly on the space to instantly freeze/unfreeze simulation movement.</p>
              </div>
            </div>

            <button
              onClick={() => setIsGuideOpen(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 font-display active:scale-98 cursor-pointer"
            >
              Enter Serenity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
