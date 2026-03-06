import {
  H1,
  H2,
  H3,
  P,
  List,
  ListItem,
  Tip,
  InlineCode,
} from "../DocsContentRenderer";
import { ModelOrchestratorExplainer } from "@/components/forge/ModelOrchestratorExplainer";

export default function NoctraAiDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Inteligencia Artificial
      </span>
      <H1>NOCTRA AI Engine</H1>
      <P>
        Es clave desmitificar a NOCTRA AI: <strong>No es un Chatbot.</strong> No
        le escribes preguntas para que te devuelva texto. Esa filosofía de "chat
        boxes en todas partes" rompe los flujos de productividad.
      </P>

      <H2>¿Qué es un Motor de Acciones (Action Engine)?</H2>
      <P>
        A diferencia de los asistentes pasivos que esperan tus comandos, NOCTRA
        AI opera alrededor del concepto de <em>AI Agency</em>. Se ejecuta en
        segundo plano como un operador en la sombra, leyendo el Delta/Cambio de
        la base de datos de
        <InlineCode>Supabase</InlineCode>.
      </P>

      <H3>Cómo Evalúa Contextos</H3>
      <P>
        El motor detecta anomalías. Ejemplos de las reglas duras que inyectan
        contexto a la red LLM (Anthropic) para producir insights humanos:
      </P>
      <List>
        <ListItem>
          <strong>Dormición Comercial:</strong> Propuestas que han estado en
          estado "Enviada" por más de 72 horas sin transición de estado.
        </ListItem>
        <ListItem>
          <strong>Calidad de Datos:</strong> Proyectos activos donde la relación
          horas-ingreso está cayendo y el margen se está evaporando en tiempo
          real.
        </ListItem>
        <ListItem>
          <strong>Oportunidades Golden:</strong> Clientes existentes (que
          compraron hace &gt; 6 meses) pero que no tienen ningún lead/proyecto
          actual en el pipeline (ideal para cross-selling).
        </ListItem>
      </List>

      <Tip>
        El algoritmo de Noctra está diseñado para "Ignorarse de forma segura".
        Si lees un insight sobre un lead al que ya le hablaste en persona,
        simplemente haz clic en <strong>Ignorar</strong> y el LLM asumirá que el
        contexto externo no requiere rescate en el DOM.
      </Tip>

      <H2>Cerebro Central (Model Orchestrator)</H2>
      <P>
        Para maximizar el retorno de inversión y la velocidad de respuesta,
        Noctra utiliza una capa de orquestación inteligente que decide el modelo
        adecuado para cada tarea.
      </P>
      <div className="mt-8">
        <ModelOrchestratorExplainer />
      </div>
    </div>
  );
}
