import {
  Info,
  Zap,
  RefreshCw,
  Infinity,
  Calculator,
  Brain,
} from "lucide-react";

export function CreditSystemExplainer() {
  return (
    <div className="space-y-8 mt-12 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-orange-500" />
          Sistema de Créditos de IA
        </h3>
        <p className="text-sm text-neutral-400">
          Entiende cómo funciona la "gasolina" detrás de las funciones
          cognitivas de Noctra Forge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* A. Concept */}
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              ¿Qué son los Créditos?
            </h4>
            <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
              Los créditos son la unidad de medida que usamos para procesar
              inteligencia artificial. Cada vez que generas un análisis,
              redactas una propuesta o predices márgenes, consultas a nuestros
              modelos.
            </p>
            <div className="bg-black/50 rounded-lg p-3 border border-white/5">
              <div className="text-xs text-neutral-500 mb-1 uppercase tracking-widest font-bold">
                Tasa de Conversión e Interacción
              </div>
              <p className="text-xs text-neutral-400 mb-2 italic">
                Se consumen por cada ciclo de interacción: el mensaje que envías
                (input) y la respuesta que recibes (output). Esto permite que la
                IA mantenga el contexto de tu conversación.
              </p>
              <div className="text-sm font-mono text-emerald-400 mb-2">
                1 Crédito ≈ 1 Token
              </div>
              <div className="text-[11px] text-neutral-300 font-semibold border-t border-white/5 pt-2">
                Guía Visual: 1,000 tokens ≈ 750 palabras o el equivalente a 5
                correos de seguimiento detallados.
              </div>
            </div>
          </div>
        </div>

        {/* C. Consumption Examples */}
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              Ejemplos de Consumo
            </h4>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-neutral-400">Analizar un proyecto</span>
                <span className="font-mono text-white">~ 200 créditos</span>
              </li>
              <li className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-neutral-400">Generar una propuesta</span>
                <span className="font-mono text-white">~ 500 créditos</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">
                  Asistente en chat (largo)
                </span>
                <span className="font-mono text-white">~ 1,500 créditos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* B. Plans Table & Reloading */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {/* Standard */}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">Forge Standard</h4>
                <div className="text-sm text-neutral-500">Suscripción Base</div>
              </div>
              <div className="text-2xl font-mono text-white">50k</div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2">
              <li className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
                Se reinician ciclo a ciclo (Mensual)
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                Compra packs extra si te quedas sin saldo (No caducan)
              </li>
            </ul>
          </div>

          {/* Enterprise */}
          <div className="p-6 space-y-4 relative">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
                  Forge Enterprise
                </h4>
                <div className="text-sm text-neutral-500">Volumen Avanzado</div>
              </div>
              <div className="text-2xl font-mono text-orange-500 flex items-center">
                <Infinity className="w-6 h-6 mr-1" />
                <span className="text-lg text-orange-500/50">*</span>
              </div>
            </div>
            <p className="text-sm text-neutral-400">
              Ideal para agencias escalando. Generación ilimitada para uso
              estándar de equipo sin preocuparte por recargar packs.
            </p>
          </div>
        </div>
      </div>

      {/* Fair Use Policy */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 flex gap-4 items-start">
        <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-sm font-bold text-orange-400">
            * Política de Uso Justo (Enterprise)
          </h5>
          <p className="text-sm text-neutral-300 leading-relaxed text-justify">
            El plan Enterprise incluye generación ilimitada de IA para uso
            humano estándar. Para garantizar la máxima calidad técnica para
            todas las agencias en Forge, aplicamos una política de uso justo que
            nos permite prevenir abusos automatizados (bots), scraping de datos,
            reventa de nuestra API o volúmenes anómalos que superen el patrón de
            uso normal (ej. más de 500 solicitudes complejas por hora de forma
            ininterrumpida). Si nuestros sistemas detectan patrones que degraden
            la red, Noctra se reserva el derecho de limitar temporalmente la
            velocidad de procesamiento (rate limit) y contactar al propietario
            del Workspace para ajustar la arquitectura.
          </p>
        </div>
      </div>
    </div>
  );
}
