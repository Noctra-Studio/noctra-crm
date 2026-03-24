"use client";

import { useState } from "react";
import { SourceSelection } from "@/components/migration/SourceSelection";
import { AuthOrUpload } from "@/components/migration/AuthOrUpload";
import { FieldMapping } from "@/components/migration/FieldMapping";
import { PreviewValidation } from "@/components/migration/PreviewValidation";
import { FinalReview } from "@/components/migration/FinalReview";

export type MigrationStep = 1 | 2 | 3 | 4 | 5;

export function MigrationWizard({ workspaceId }: { workspaceId: string }) {
  const [step, setStep] = useState<MigrationStep>(1);
  const [migrationData, setMigrationData] = useState({
    source: null,
    credentials: {},
    file: null,
    mapping: {},
    strategy: "ignore",
    incremental: false,
  });

  const nextStep = () => setStep((prev) => (prev + 1) as MigrationStep);
  const prevStep = () => setStep((prev) => (prev - 1) as MigrationStep);

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-hidden">
      {/* Wizard Progress Header */}
      <div className="border-b border-white/5 bg-white/[0.02] px-8 py-4">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s
                    ? "bg-emerald-500 text-black"
                    : "bg-neutral-800 text-neutral-500"
                }`}>
                {s}
              </div>
              <span
                className={`text-xs uppercase tracking-widest font-mono hidden md:inline ${
                  step === s ? "text-white" : "text-neutral-600"
                }`}>
                {s === 1 && "Origen"}
                {s === 2 && "Conexión"}
                {s === 3 && "Mapeo"}
                {s === 4 && "Validación"}
                {s === 5 && "Confirmar"}
              </span>
              {s < 5 && (
                <div className="hidden lg:block w-12 h-px bg-neutral-800 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-8">
        {step === 1 && (
          <SourceSelection
            onSelect={(source: string) => {
              setMigrationData({ ...migrationData, source: source as any });
              nextStep();
            }}
          />
        )}
        {step === 2 && (
          <AuthOrUpload
            source={migrationData.source || ""}
            onComplete={(credsOrFile: any) => {
              setMigrationData({ ...migrationData, ...credsOrFile });
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        {step === 3 && (
          <FieldMapping
            onComplete={(mapping: Record<string, string>) => {
              setMigrationData({ ...migrationData, mapping });
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        {step === 4 && (
          <PreviewValidation onComplete={() => nextStep()} onBack={prevStep} />
        )}
        {step === 5 && <FinalReview data={migrationData} onBack={prevStep} />}
      </div>
    </div>
  );
}
