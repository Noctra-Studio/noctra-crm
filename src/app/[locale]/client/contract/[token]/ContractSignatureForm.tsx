"use client";

import { useRef, useState, useEffect } from "react";
import { Eraser, Check, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function ContractSignatureForm({
  contractId,
  clientToken,
  expectedName,
}: {
  contractId: string;
  clientToken: string;
  expectedName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Resize for high DPI
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const generateHash = async (signatureData: string) => {
    const timestamp = new Date().toISOString();
    const message = `${contractId}:${expectedName}:${signatureData}:${timestamp}`;
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleSign = async () => {
    if (!name.trim()) {
      alert("Por favor ingresa tu nombre completo.");
      return;
    }

    // Normalize names for comparison if needed, but the user says validation name not empty.
    // The previous implementation had a strict check, let's keep it user-friendly but safe.
    if (name.trim().toLowerCase() !== expectedName.trim().toLowerCase()) {
      alert(`Por favor escribe tu nombre exactamente como: "${expectedName}"`);
      return;
    }

    if (isEmpty) {
      alert("Por favor firma en el recuadro para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const signatureData = canvasRef.current?.toDataURL("image/png") || "";
      const signatureHash = await generateHash(signatureData);

      const response = await fetch("/api/contracts/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: clientToken,
          signed_name: name,
          signature_data: signatureData,
          signature_hash: signatureHash,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error || "Error al procesar la firma del contrato",
        );
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Hubo un problema al procesar la firma.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !ctx) return;
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !ctx) return;
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  return (
    <div className="space-y-12 bg-neutral-50 p-8 md:p-12 border border-neutral-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-widest">
            Ejecución del Contrato
          </h3>
          <p className="text-[12px] text-neutral-300 leading-relaxed font-serif italic">
            Al firmar este documento, aceptas los términos legales y el alcance
            del proyecto descrito anteriormente. Tu firma será registrada con un
            sello de tiempo y dirección IP para validez legal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block font-sans">
            Nombre Completo del Firmante
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={expectedName}
            className="w-full bg-white border border-neutral-200 px-6 py-4 text-lg font-black focus:outline-none focus:border-neutral-900 transition-all uppercase placeholder:text-neutral-200"
          />
          <p className="text-[9px] font-mono text-neutral-400 uppercase italic">
            Escribe exactamente: {expectedName}
          </p>
        </div>

        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block font-sans">
              Dibuja tu firma aquí
            </label>
            <button
              onClick={clear}
              className="text-[9px] font-mono text-neutral-400 hover:text-red-500 uppercase flex items-center gap-1.5 transition-colors">
              <Eraser className="w-3 h-3" /> Limpiar Recuadro
            </button>
          </div>
          <div className="flex-1 bg-white border-2 border-neutral-200 min-h-[300px] relative touch-none group hover:border-neutral-300 transition-colors">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={() => setIsDrawing(false)}
              onMouseOut={() => setIsDrawing(false)}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={() => setIsDrawing(false)}
              className="w-full h-full cursor-crosshair"
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                <p className="text-[10px] font-mono uppercase tracking-[0.6em] font-black">
                  Área de Firma
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSign}
        disabled={isSubmitting || !name.trim() || isEmpty}
        className="w-full bg-neutral-900 text-white py-6 text-sm font-black uppercase tracking-[0.4em] hover:bg-black transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-xl active:scale-[0.99] font-sans">
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-5 h-5" />
        )}
        ACEPTAR Y FIRMAR CONTRATO
      </button>

      <p className="text-[9px] text-neutral-400 text-center uppercase tracking-widest font-mono italic">
        Electronic Signature Standard SHA-256 Audit Trail Compliance
      </p>
    </div>
  );
}
