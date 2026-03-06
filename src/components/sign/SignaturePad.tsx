"use client";

import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Trash2, CheckCircle2, RotateCcw } from "lucide-react";

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
}

export const SignaturePad = ({ onSave, onClear }: SignaturePadProps) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    onClear?.();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) return;
    const dataUrl = sigCanvas.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="relative bg-white rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "w-full h-64 cursor-crosshair",
          }}
        />

        {/* Placeholder text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <p className="text-black font-serif italic text-2xl">Firma aquí</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={clear}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
          <RotateCcw size={14} />
          Limpiar
        </button>

        <button
          onClick={save}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-lg">
          <CheckCircle2 size={14} />
          Aceptar Firma
        </button>
      </div>
    </div>
  );
};
