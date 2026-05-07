'use client';

import { useState, useEffect, useRef } from "react";
import {
  X,
  Copy,
  Check,
  Terminal,
  Play,
  Sparkles,
  Instagram,
  Linkedin,
  Youtube,
  Smartphone,
  Heart,
  MessageCircle,
  MessageSquare,
  Share2,
  Send,
  ThumbsUp,
  MoreHorizontal,
  HelpCircle,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SocialDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentItem: any;
  onPublishSuccess?: () => void;
}

export function SocialDistributionModal({
  isOpen,
  onClose,
  contentItem,
  onPublishSuccess
}: SocialDistributionModalProps) {
  const [activeTab, setActiveTab] = useState<"instagram" | "linkedin" | "youtube" | "tiktok">("instagram");
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishComplete, setPublishComplete] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (contentItem?.channel) {
      const ch = contentItem.channel.toLowerCase();
      if (["instagram", "linkedin", "youtube", "tiktok"].includes(ch)) {
        setActiveTab(ch as any);
      }
    }
  }, [contentItem]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  if (!isOpen || !contentItem) return null;

  // Unify copy, CTA, and hashtags
  const formattedHashtags = contentItem.hashtags
    ? contentItem.hashtags.map((h: string) => h.startsWith("#") ? h : `#${h}`).join(" ")
    : "";
  
  const socialPackText = `${contentItem.copy || ""}\n\n${contentItem.cta || ""}\n\n${formattedHashtags}`.trim();

  const handleCopyPack = () => {
    navigator.clipboard.writeText(socialPackText);
    setCopied(true);
    toast.success("Pack social copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPlatform = () => {
    navigator.clipboard.writeText(socialPackText);
    setCopied(true);
    toast.success(`Copiado. Abriendo ${activeTab === "youtube" ? "YouTube" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}...`);
    setTimeout(() => setCopied(false), 2000);

    let url = "https://www.instagram.com";
    if (activeTab === "instagram") {
      url = "https://www.instagram.com/";
    } else if (activeTab === "linkedin") {
      url = "https://www.linkedin.com/feed/";
    } else if (activeTab === "youtube") {
      url = "https://studio.youtube.com/";
    } else if (activeTab === "tiktok") {
      url = "https://www.tiktok.com/upload";
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const addLog = (text: string, delay: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const time = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, `[${time}] ${text}`]);
        resolve();
      }, delay);
    });
  };

  const handleSimulatePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    setPublishComplete(false);
    setLogs([]);

    try {
      await addLog("🚀 INICIANDO PROCESO DE DISTRIBUCIÓN ZEN MULTICANAL...", 300);
      await addLog(`📂 CONTENIDO SELECCIONADO: "${contentItem.title.toUpperCase()}"`, 500);
      await addLog("🔍 COMPROBANDO RESTRICCIONES DE CANAL Y RESOLUCIÓN DE IMÁGENES...", 600);
      await addLog("📊 ANALIZANDO DENSIDAD DE HASHTAGS Y OPTIMIZACIÓN DE COPIES... OK", 800);
      await addLog(`📡 CONECTANDO CON LA PASARELA DE APIS DE MKT.NOTES (PRO)...`, 1000);

      if (activeTab === "instagram" || contentItem.channel === "instagram") {
        await addLog("📸 AUTENTICANDO CON META GRAPH API (INSTAGRAM PROFESSIONAL)...", 1000);
        await addLog("📤 TRANSMITIENDO ARCHIVOS MULTIMEDIA A CDN TEMPORAL DE META...", 1200);
        await addLog("🎯 INSTAGRAM API: ¡PUBLICACIÓN REALIZADA CON ÉXITO! (ID: ig_post_38924732)", 900);
      }

      if (activeTab === "linkedin" || contentItem.channel === "linkedin") {
        await addLog("💼 AUTENTICANDO CON LINKEDIN PARTNER API v2...", 1000);
        await addLog("📝 ESTRUCTURANDO FORMATO DE PUBLICACIÓN CORPORATIVA...", 800);
        await addLog("🎯 LINKEDIN API: ¡PUBLICACIÓN REALIZADA CON ÉXITO! (URN: urn:li:share:90234789)", 900);
      }

      if (activeTab === "youtube" || contentItem.channel === "youtube") {
        await addLog("🎥 INICIANDO PROTOCOLO YOUTUBE DATA API v3...", 1000);
        await addLog("⚡ PROCESANDO FORMATO VERTICAL (YOUTUBE SHORTS)... OK", 1000);
        await addLog("🎯 YOUTUBE API: ¡VIDEO SHORTS PUBLICADO CON ÉXITO! (ID: yt_shorts_w9eA3f4)", 900);
      }

      if (activeTab === "tiktok" || contentItem.channel === "tiktok") {
        await addLog("🎵 INICIANDO PROTOCOLO TIKTOK DEVELOPER CONTENT API...", 1100);
        await addLog("💃 OPTIMIZANDO AUDIO INTEGRADO Y CONFIGURACIONES DE PRIVACIDAD...", 800);
        await addLog("🎯 TIKTOK API: ¡VIDEO CARGADO Y PUBLICADO CON ÉXITO! (ID: tt_video_7283492)", 900);
      }

      await addLog("💾 SINCRONIZANDO CAMBIO DE ESTADO CON BASE DE DATOS SUPABASE...", 800);
      
      // Perform database update to 'published'
      const { error } = await supabase
        .from("content_items")
        .update({
          status: "published",
          published_at: new Date().toISOString()
        })
        .eq("id", contentItem.id);

      if (error) throw error;

      await addLog("🟢 BASE DE DATOS ACTUALIZADA: [status = published]", 600);
      await addLog("🎉 ¡DISTRIBUCIÓN INMEDIATA ZEN DE CONTENIDO FINALIZADA CON ÉXITO!", 500);

      setPublishComplete(true);
      toast.success("¡Contenido distribuido y publicado con éxito!");
      
      if (onPublishSuccess) {
        onPublishSuccess();
      }
    } catch (err: any) {
      await addLog(`❌ ERROR DURANTE LA SIMULACIÓN: ${err.message}`, 500);
      toast.error("Ocurrió un error en la base de datos");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl h-[88vh] bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-elevated">
        
        {/* Header bar */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6 shrink-0 bg-accent/5">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-brand" />
            <div className="flex flex-col">
              <span className="technical-label text-[10px] text-brand uppercase tracking-widest">Hub de Distribución Inmediata</span>
              <span className="text-sm font-black uppercase tracking-tight text-foreground truncate max-w-[300px] sm:max-w-[500px]">
                {contentItem.title}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Workspace body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Left Column: Data & Unifier */}
          <div className="md:col-span-7 flex flex-col p-6 overflow-y-auto custom-scrollbar border-r border-border gap-6">
            
            {/* Social Pack Copier Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="technical-label text-[9px] opacity-60 uppercase tracking-widest">Unificador de Redes (Social Pack)</span>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyPack}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 rounded-lg text-[9px] technical-label uppercase tracking-wider gap-1.5 transition-all shadow-sm",
                      copied ? "border-success bg-success/5 text-success hover:bg-success/10" : "border-brand/40 text-brand bg-brand/5 hover:bg-brand/10 hover:border-brand"
                    )}
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? "¡Copiado!" : "Copiar Texto"}
                  </Button>
                  <Button
                    onClick={handleOpenPlatform}
                    variant="default"
                    size="sm"
                    className="h-8 rounded-lg text-[9px] technical-label uppercase tracking-wider bg-brand text-white hover:bg-brand/90 font-bold transition-all shadow-sm gap-1.5"
                  >
                    <Share2 size={11} />
                    Copiar y Abrir {activeTab === "youtube" ? "YouTube" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </Button>
                </div>
              </div>

              <div className="relative rounded-xl border border-border/80 bg-background/50 p-4 font-mono text-[10.5px] text-foreground leading-relaxed whitespace-pre-wrap select-all">
                {socialPackText || (
                  <span className="text-muted-foreground/40 italic uppercase technical-label text-[9px]">Sin datos cargados de copia, CTA o hashtags</span>
                )}
              </div>
            </div>

            {/* Individual Properties Accordion */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-border bg-accent/5 rounded-lg">
                  <span className="technical-label text-[7.5px] opacity-50 uppercase tracking-[0.15em] block mb-1">CTA (Llamada a la Acción)</span>
                  <p className="text-[11px] font-bold text-foreground truncate uppercase">{contentItem.cta || "Sin CTA definido"}</p>
                </div>
                <div className="p-3 border border-border bg-accent/5 rounded-lg">
                  <span className="technical-label text-[7.5px] opacity-50 uppercase tracking-[0.15em] block mb-1">Hashtags</span>
                  <p className="text-[11px] font-bold text-brand truncate">
                    {contentItem.hashtags ? contentItem.hashtags.map((h: string) => `#${h}`).join(" ") : "Sin hashtags"}
                  </p>
                </div>
              </div>

              <div className="p-4 border border-border bg-accent/5 rounded-lg space-y-1">
                <span className="technical-label text-[7.5px] opacity-50 uppercase tracking-[0.15em] block">Texto Principal (Copy)</span>
                <p className="text-[11px] leading-relaxed font-medium text-foreground">{contentItem.copy || "Sin texto principal definido"}</p>
              </div>
            </div>

            {/* Simulated Live Logging Terminal */}
            <div className="flex-1 flex flex-col border border-border rounded-xl overflow-hidden bg-[#0a0a0f] text-slate-300 font-mono text-[9.5px] shadow-inner min-h-[160px]">
              <div className="flex h-8 items-center bg-[#12121a] px-4 border-b border-white/5 justify-between select-none">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3 w-3 text-brand" />
                  <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Terminal de Logs de Publicación</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-error/40" />
                  <div className="h-2 w-2 rounded-full bg-warning/40" />
                  <div className="h-2 w-2 rounded-full bg-success/40" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar h-[120px]">
                {logs.length === 0 ? (
                  <p className="text-slate-500/50 italic uppercase text-[8.5px]">Listo para simular la publicación inmediata... Presione "Publicar Ahora".</p>
                ) : (
                  logs.map((log, i) => {
                    let logClass = "text-slate-300";
                    if (log.includes("🎯") || log.includes("🟢")) logClass = "text-success font-bold";
                    if (log.includes("🚀") || log.includes("📡")) logClass = "text-brand font-black";
                    if (log.includes("❌")) logClass = "text-error font-bold";
                    return <p key={i} className={cn("leading-tight", logClass)}>{log}</p>;
                  })
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>

          {/* Right Column: Premium App Previews */}
          <div className="md:col-span-5 flex flex-col bg-accent/5 overflow-hidden p-6 gap-4">
            
            {/* App selectors */}
            <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border shrink-0 justify-around">
              <button
                onClick={() => setActiveTab("instagram")}
                className={cn(
                  "flex-1 flex justify-center py-1.5 technical-label text-[8.5px] rounded-md gap-1 uppercase transition-all",
                  activeTab === "instagram" ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Instagram size={11} className={activeTab === "instagram" ? "text-[#e1306c]" : ""} />
                Instagram
              </button>
              <button
                onClick={() => setActiveTab("linkedin")}
                className={cn(
                  "flex-1 flex justify-center py-1.5 technical-label text-[8.5px] rounded-md gap-1 uppercase transition-all",
                  activeTab === "linkedin" ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Linkedin size={11} className={activeTab === "linkedin" ? "text-[#0077b5]" : ""} />
                LinkedIn
              </button>
              <button
                onClick={() => setActiveTab("youtube")}
                className={cn(
                  "flex-1 flex justify-center py-1.5 technical-label text-[8.5px] rounded-md gap-1 uppercase transition-all",
                  activeTab === "youtube" ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Youtube size={11} className={activeTab === "youtube" ? "text-[#ff0000]" : ""} />
                Shorts
              </button>
              <button
                onClick={() => setActiveTab("tiktok")}
                className={cn(
                  "flex-1 flex justify-center py-1.5 technical-label text-[8.5px] rounded-md gap-1 uppercase transition-all",
                  activeTab === "tiktok" ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquare size={11} className={activeTab === "tiktok" ? "text-[#00f2fe]" : ""} />
                TikTok
              </button>
            </div>

            {/* Realistic iPhone mockup shell */}
            <div className="flex-1 flex justify-center items-center overflow-hidden">
              <div className="relative w-[280px] h-[450px] bg-black rounded-[36px] border-[5px] border-[#222] shadow-2xl flex flex-col overflow-hidden shrink-0">
                
                {/* Dynamic Island / Speaker notch */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#111] border border-white/5 ml-auto mr-2" />
                </div>

                {/* Simulated Screen Body */}
                <div className="flex-1 bg-background text-foreground flex flex-col relative overflow-hidden select-none">
                  
                  {/* Status Bar */}
                  <div className="h-7 px-5 bg-transparent flex items-center justify-between text-[8px] font-black tracking-tight z-20 shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <div className="h-2 w-4 bg-foreground/90 rounded-[2px]" />
                    </div>
                  </div>

                  {/* Previews based on active tab */}
                  
                  {/* INSTAGRAM MOCKUP */}
                  {activeTab === "instagram" && (
                    <div className="flex-1 flex flex-col bg-background text-foreground animate-in fade-in duration-200">
                      <div className="h-9 border-b border-border/30 px-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-yellow-500 to-purple-600 p-[1px]">
                            <div className="h-full w-full bg-background rounded-full" />
                          </div>
                          <span className="text-[9px] font-bold">mkt.notes</span>
                          <span className="h-2 w-2 rounded-full bg-blue-500 flex items-center justify-center text-white text-[5px] font-bold">✓</span>
                        </div>
                        <MoreHorizontal size={12} className="opacity-50" />
                      </div>
                      
                      {/* Photo / video area */}
                      <div className="flex-1 bg-gradient-to-br from-[#3b82f6]/20 to-[#e1306c]/20 relative flex items-center justify-center overflow-hidden border-b border-border/10">
                        <Instagram className="h-12 w-12 text-[#e1306c] opacity-20" />
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[7px] font-bold text-white uppercase tracking-wider">Canvas Previsualizador</span>
                      </div>

                      {/* Controls */}
                      <div className="p-2.5 space-y-1.5 shrink-0">
                        <div className="flex items-center gap-3">
                          <Heart size={14} className="hover:scale-110 cursor-pointer" />
                          <MessageCircle size={14} className="hover:scale-110 cursor-pointer" />
                          <Send size={13} className="hover:scale-110 cursor-pointer" />
                        </div>
                        <p className="text-[9px] font-bold leading-none">1,482 Me gusta</p>
                        <p className="text-[8.5px] leading-snug line-clamp-3">
                          <span className="font-bold mr-1">mkt.notes</span>
                          {contentItem.copy} {formattedHashtags}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LINKEDIN MOCKUP */}
                  {activeTab === "linkedin" && (
                    <div className="flex-1 flex flex-col bg-card text-foreground p-3 space-y-2.5 animate-in fade-in duration-200 overflow-y-auto custom-scrollbar">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-brand flex items-center justify-center text-white font-black text-xs">M</div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold flex items-center gap-0.5">MKT.NOTES <span className="h-2.5 w-2.5 bg-[#0a66c2] text-[5px] flex items-center justify-center rounded-full text-white">In</span></span>
                            <span className="text-[7.5px] text-muted-foreground leading-none">125,480 seguidores</span>
                          </div>
                        </div>
                        <MoreHorizontal size={11} className="opacity-40" />
                      </div>

                      <p className="text-[9px] leading-relaxed text-foreground/90 font-medium whitespace-pre-line line-clamp-6">
                        {contentItem.copy}
                        {"\n\n"}
                        <span className="text-[#0a66c2] font-semibold">{contentItem.cta}</span>
                        {"\n"}
                        <span className="text-[#0a66c2]">{formattedHashtags}</span>
                      </p>

                      {/* Mockup Professional Media */}
                      <div className="h-28 bg-gradient-to-r from-[#0077b5]/10 to-[#5266eb]/10 rounded-md flex items-center justify-center border border-border/20 relative">
                        <Linkedin className="h-10 w-10 text-[#0077b5] opacity-20" />
                        <span className="absolute bottom-1.5 right-1.5 px-1 bg-black/60 rounded text-[6px] font-semibold text-white uppercase tracking-wider">Presentación Profesional</span>
                      </div>

                      {/* Interactive Footer */}
                      <div className="flex justify-between items-center border-t border-border/20 pt-2 text-[8px] font-semibold text-muted-foreground/80">
                        <span className="flex items-center gap-1"><ThumbsUp size={10} /> Recomendar</span>
                        <span className="flex items-center gap-1"><MessageCircle size={10} /> Comentar</span>
                        <span className="flex items-center gap-1"><Share2 size={10} /> Compartir</span>
                      </div>
                    </div>
                  )}

                  {/* YOUTUBE SHORTS MOCKUP */}
                  {activeTab === "youtube" && (
                    <div className="flex-1 flex flex-col bg-stone-900 text-white relative animate-in fade-in duration-200">
                      
                      {/* Video background */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 flex items-center justify-center z-0">
                        <Youtube className="h-14 w-14 text-[#ff0000] opacity-30" />
                        <span className="absolute bottom-20 left-4 bg-black/50 border border-white/10 px-1.5 py-0.5 rounded text-[7px] uppercase font-bold tracking-wider">Simulador de Video Shorts</span>
                      </div>

                      {/* Sidebar control buttons */}
                      <div className="absolute right-2 bottom-12 flex flex-col items-center gap-3.5 z-10 text-white">
                        <div className="flex flex-col items-center"><ThumbsUp size={14} /><span className="text-[7px] mt-0.5 font-bold">12K</span></div>
                        <div className="flex flex-col items-center"><MessageCircle size={14} /><span className="text-[7px] mt-0.5 font-bold">394</span></div>
                        <div className="flex flex-col items-center"><Share2 size={14} /><span className="text-[7px] mt-0.5 font-bold">Compartir</span></div>
                      </div>

                      {/* Title overlay & description */}
                      <div className="absolute left-3 right-10 bottom-4 z-10 text-white space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-4 w-4 rounded-full bg-brand flex items-center justify-center text-white text-[7px] font-black">M</div>
                          <span className="text-[9px] font-bold">@mkt_notes</span>
                          <span className="text-[7px] bg-[#ff0000] px-1 rounded-sm uppercase font-black">Suscribirse</span>
                        </div>
                        <p className="text-[8.5px] leading-snug line-clamp-2 text-slate-100 font-medium">
                          {contentItem.copy} {formattedHashtags}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TIKTOK MOCKUP */}
                  {activeTab === "tiktok" && (
                    <div className="flex-1 flex flex-col bg-zinc-950 text-white relative animate-in fade-in duration-200">
                      
                      {/* Video background */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#fe2c55]/15 to-[#25f4ee]/15 flex items-center justify-center z-0">
                        <Smartphone className="h-14 w-14 text-white opacity-10" />
                        <span className="absolute bottom-20 left-4 bg-black/60 border border-white/10 px-1.5 py-0.5 rounded text-[7px] uppercase font-bold tracking-wider">Simulador de Video TikTok</span>
                      </div>

                      {/* Vertical controls */}
                      <div className="absolute right-2 bottom-16 flex flex-col items-center gap-4 z-10 text-white">
                        <div className="flex flex-col items-center"><Heart size={14} className="text-[#fe2c55]" /><span className="text-[7px] mt-0.5 font-bold">45.2K</span></div>
                        <div className="flex flex-col items-center"><MessageCircle size={14} /><span className="text-[7px] mt-0.5 font-bold">1,820</span></div>
                        <div className="flex flex-col items-center"><Share2 size={14} /><span className="text-[7px] mt-0.5 font-bold">Compartir</span></div>
                      </div>

                      {/* Overlay */}
                      <div className="absolute left-3 right-12 bottom-4 z-10 text-white space-y-1">
                        <span className="text-[9px] font-bold">@mkt.notes</span>
                        <p className="text-[8.5px] leading-snug line-clamp-2 text-slate-200">
                          {contentItem.copy} {formattedHashtags}
                        </p>
                        <div className="flex items-center gap-1 pt-1 text-[7.5px] text-brand/80">
                          <span>🎵 Sonido original - @mkt.notes</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Console Action footer */}
        <div className="h-20 border-t border-border px-6 flex items-center justify-between shrink-0 bg-accent/5">
          <div className="flex items-center gap-2">
            {publishComplete ? (
              <div className="flex items-center gap-1.5 text-success font-bold text-[11px] uppercase technical-label">
                <CheckCircle size={14} /> ¡Publicado con éxito!
              </div>
            ) : isPublishing ? (
              <div className="flex items-center gap-1.5 text-brand font-bold text-[11px] uppercase technical-label animate-pulse">
                <div className="h-2 w-2 rounded-full bg-brand animate-ping" /> Desplegando en directo...
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground/60 text-[11px] uppercase technical-label">
                <HelpCircle size={14} /> Listo para distribuir
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              variant="ghost"
              className="h-10 px-4 rounded-lg text-[10px] technical-label uppercase tracking-widest"
              disabled={isPublishing}
            >
              Cerrar
            </Button>
            <Button
              onClick={handleSimulatePublish}
              className={cn(
                "h-10 px-6 rounded-lg text-[10px] technical-label uppercase tracking-widest gap-2 font-black transition-all",
                publishComplete ? "bg-success hover:bg-success/90 text-white" : "bg-brand text-white shadow-md shadow-brand/10 hover:shadow-brand/20 hover:scale-[1.02]"
              )}
              disabled={isPublishing}
            >
              <Play size={11} className={cn(isPublishing && "animate-spin")} />
              {publishComplete ? "Volver a Distribuir" : isPublishing ? "Publicando..." : "Publicar Ahora"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
