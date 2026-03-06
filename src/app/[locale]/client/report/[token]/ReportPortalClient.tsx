"use client";

import {
  Printer,
  CheckCircle2,
  Circle,
  Clock,
  Check,
  ExternalLink,
} from "lucide-react";

export default function ReportPortalClient({ data }: { data: any }) {
  const { project, tasks, deliverables } = data;
  const workspace = project.workspace;
  const primaryColor = workspace?.primary_color || "#000000";
  const config = project.report_config || {
    include_tasks: true,
    include_deliverables: true,
  };

  const phases = ["discovery", "design", "development", "launch", "completed"];
  const currentPhaseIndex = phases.indexOf(project.status);

  // Group tasks by phase
  const tasksByPhase = tasks.reduce((acc: any, task: any) => {
    if (!acc[task.phase]) acc[task.phase] = [];
    acc[task.phase].push(task);
    return acc;
  }, {});

  // Only show tasks for current or previous phases
  const visiblePhases = phases.filter((p, index) => index <= currentPhaseIndex);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.completed).length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans print:p-0">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>

      {/* FIXED PRINT BUTTON */}
      <button
        onClick={handlePrint}
        className="no-print fixed bottom-8 right-8 bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
        <Printer className="w-4 h-4" />
        Imprimir / PDF
      </button>

      {/* 1. HEADER */}
      <header className="border-b-4 border-black py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-6">
            {workspace?.logo_url ? (
              <img
                src={workspace.logo_url}
                alt={workspace.name}
                className="h-6 w-auto"
              />
            ) : (
              <span className="text-2xl font-black tracking-tighter">
                ◆ {workspace?.name?.toUpperCase() || "NOCTRA STUDIO"}
              </span>
            )}
            <div className="space-y-1">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">
                Reporte de Avance
              </h1>
              <p className="text-xl font-light text-neutral-500">
                Proyecto:{" "}
                <span
                  className="font-bold text-black"
                  style={{
                    color: primaryColor === "#000000" ? "black" : primaryColor,
                  }}>
                  {project.name}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right space-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            <div>
              Al{" "}
              {new Date().toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {project.client_name && (
              <div>
                Cliente:{" "}
                <span className="text-black">{project.client_name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 space-y-32">
        {/* 2. MENSAJE DEL EQUIPO */}
        {config.custom_message && (
          <section className="space-y-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300 border-b border-neutral-100 pb-4">
              Mensaje del equipo
            </h2>
            <div className="text-2xl font-light leading-relaxed text-neutral-600 italic border-l-4 border-neutral-100 pl-8">
              "{config.custom_message}"
            </div>
          </section>
        )}

        {/* 3. ESTADO ACTUAL & TIMELINE */}
        <section className="space-y-12 print-break-inside-avoid">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">
              Estado del proyecto
            </h2>
            <div
              className="text-white px-6 py-2 text-xs font-black uppercase tracking-[0.2em]"
              style={{ backgroundColor: primaryColor }}>
              Fase Actual: {project.status.replace("_", " ")}
            </div>
          </div>

          <div className="relative pt-8">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-neutral-100 -translate-y-1/2 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
              {phases.map((p, idx) => {
                const isCompleted = idx < currentPhaseIndex;
                const isCurrent = idx === currentPhaseIndex;
                return (
                  <div
                    key={p}
                    className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors mb-2`}
                      style={
                        isCompleted
                          ? { backgroundColor: primaryColor, color: "white" }
                          : isCurrent
                            ? {
                                border: `2px solid ${primaryColor}`,
                                color: primaryColor,
                                backgroundColor: "white",
                              }
                            : {
                                backgroundColor: "#f9fafb",
                                color: "#d1d5db",
                                border: "1px solid #f3f4f6",
                              }
                      }>
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`text-[10px] font-bold uppercase tracking-widest ${isCurrent ? "text-black" : "text-neutral-400"}`}>
                        {p.replace("_", " ")}
                      </div>
                      <div className="text-[9px] text-neutral-300 font-mono uppercase">
                        {isCompleted
                          ? "Completado"
                          : isCurrent
                            ? "En curso"
                            : "Próximamente"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. PROGRESO DE TAREAS */}
        {config.include_tasks && (
          <section className="space-y-12">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">
                  Progreso de tareas
                </h2>
                <div className="text-3xl font-black">{progressPercentage}%</div>
              </div>
              <div className="w-full h-4 bg-neutral-100 rounded-none overflow-hidden">
                <div
                  className="h-full transition-all duration-1000"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: primaryColor,
                  }}
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest text-right">
                {completedTasks} de {totalTasks} tareas completadas
              </p>
            </div>

            <div className="grid grid-cols-1 gap-16">
              {visiblePhases.map((phase) => {
                const phaseTasks = tasksByPhase[phase] || [];
                if (phaseTasks.length === 0) return null;
                return (
                  <div
                    key={phase}
                    className="space-y-6 print-break-inside-avoid">
                    <h3
                      className="text-xs font-black uppercase tracking-widest pb-2 inline-block border-b-2"
                      style={{ borderBottomColor: primaryColor }}>
                      {phase.replace("_", " ")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                      {phaseTasks.map((task: any) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-4 py-2 border-b border-neutral-50">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-200 shrink-0" />
                          )}
                          <span
                            className={`text-sm ${task.completed ? "text-neutral-400 line-through" : "text-neutral-700 font-medium"}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. ENTREGABLES */}
        {config.include_deliverables && deliverables.length > 0 && (
          <section className="space-y-12 print-break-inside-avoid">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">
              Entregables & Documentos
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {deliverables.map((d: any) => (
                <div
                  key={d.id}
                  className="group border border-neutral-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors hover:border-black"
                  style={
                    { "--hover-border": primaryColor } as React.CSSProperties
                  }>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-black uppercase tracking-tight">
                        {d.title}
                      </h4>
                      {d.status === "approved" && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Aprobado
                        </span>
                      )}
                    </div>
                    {d.description && (
                      <p className="text-sm text-neutral-500 leading-relaxed font-light">
                        {d.description}
                      </p>
                    )}
                  </div>
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all no-print hover:grayscale-0"
                    style={
                      { "--hover-bg": primaryColor } as React.CSSProperties
                    }>
                    Ver Archivo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. PRÓXIMOS PASOS */}
        {currentPhaseIndex < phases.length - 1 && (
          <section className="bg-neutral-50 p-12 space-y-8 print-break-inside-avoid">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              Qué viene después
            </h2>
            <div className="space-y-4">
              <h3 className="text-4xl font-black tracking-tight uppercase">
                {phases[currentPhaseIndex + 1].replace("_", " ")}
              </h3>
              <p className="text-xl text-neutral-500 font-light max-w-2xl leading-relaxed">
                Estamos preparándonos para iniciar la siguiente etapa. Nos
                enfocaríamos en asegurar que la transición sea fluida y
                transparente para {workspace?.name || "el equipo"}.
              </p>
            </div>
            {project.deadline && (
              <div className="pt-4 flex items-center gap-2 text-neutral-400">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest">
                  Fecha estimada de cierre:{" "}
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-neutral-100 py-20 px-6 mt-32 bg-neutral-50/30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-2">
            <span className="text-xl font-black tracking-tighter">
              ◆ {workspace?.name?.toUpperCase() || "NOCTRA STUDIO"}
            </span>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
              {workspace?.tagline || "Design & Strategy Excellence"}
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-medium text-neutral-500">
              ¿Tienes dudas sobre los avances?
            </p>
            <a
              href={`mailto:${workspace?.email || "hola@noctra.studio"}`}
              className="inline-block text-lg font-black tracking-tight border-b-2 border-black pb-1 hover:text-neutral-600 transition-colors"
              style={{ borderBottomColor: primaryColor }}>
              {workspace?.email || "hola@noctra.studio"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
