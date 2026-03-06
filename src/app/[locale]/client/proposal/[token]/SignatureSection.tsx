"use client";

import { useRef, useState, useEffect } from "react";
import { Eraser, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SignatureFormProps {
  proposalId: string;
  clientToken: string;
  expectedName: string;
  onSuccess: () => void;
}

export function SignatureForm({
  proposalId,
  clientToken,
  expectedName,
  onSuccess,
}: SignatureFormProps) {
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
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
  }, []);

  const generateHash = async (signatureData: string) => {
    const timestamp = new Date().toISOString();
    const message = `${proposalId}:${expectedName}:${signatureData}:${timestamp}`;
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleSign = async () => {
    if (name.trim().toUpperCase() !== expectedName.trim().toUpperCase()) {
      alert(
        `Por favor escribe exactamente "${expectedName}" (mayúsculas o minúsculas) para validar.`,
      );
      return;
    }
    if (isEmpty) {
      alert("Por favor firma en el recuadro.");
      return;
    }

    setIsSubmitting(true);
    try {
      const signatureData = canvasRef.current?.toDataURL("image/png") || "";
      const signatureHash = await generateHash(signatureData);

      const response = await fetch("/api/proposals/sign", {
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
        throw new Error(errData.error || "Error al firmar");
      }

      onSuccess();
      router.refresh(); // Refresh to show signed state
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error al procesar la firma.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.beginPath();
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
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

  const isNameCorrect =
    name.trim().toUpperCase() === expectedName.trim().toUpperCase();

  return (
    <div className="space-y-12 py-16 print:hidden">
      <div className="space-y-4">
        <h3 className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.4em] font-black">
          ACEPTACIÓN Y FIRMA
        </h3>
        <p className="text-sm text-neutral-300 leading-relaxed max-w-xl">
          Al completar los campos y firmar en el recuadro, confirmas tu
          intención de proceder con el proyecto bajo los términos detallados en
          este documento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
              Validar con tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={expectedName}
              className={`w-full border-b-2 py-4 text-xl font-black focus:outline-none transition-all uppercase placeholder:text-neutral-100 ${isNameCorrect ? "border-emerald-500 text-emerald-600" : "border-neutral-100 focus:border-neutral-900"}`}
            />
          </div>
          {isNameCorrect && (
            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-mono font-bold animate-in fade-in duration-500">
              <Check className="w-3.5 h-3.5" /> IDENTIDAD VERIFICADA
            </div>
          )}
        </div>

        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
              Dibujar firma electrónica
            </label>
            <button
              onClick={clear}
              className="text-[9px] font-mono text-neutral-400 hover:text-red-500 uppercase flex items-center gap-1.5 transition-colors">
              <Eraser className="w-3 h-3" /> Limpiar
            </button>
          </div>
          <div className="flex-1 bg-white border-2 border-neutral-100 min-h-[200px] rounded-sm relative touch-none hover:border-neutral-200 transition-colors group">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />
            {isEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                <p className="text-[10px] font-mono uppercase tracking-[0.5em]">
                  Firma aquí
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSign}
        disabled={isSubmitting || !isNameCorrect || isEmpty}
        className="w-full bg-neutral-900 text-white py-6 text-xs font-black uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-2xl active:scale-[0.99]">
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        FIRMAR Y ACEPTAR PROPUESTA
      </button>

      <p className="text-[9px] text-neutral-400 text-center uppercase tracking-widest opacity-50">
        Cumple con los estándares de firma electrónica avanzada (Audit-Trail
        Hashing)
      </p>
    </div>
  );
}
