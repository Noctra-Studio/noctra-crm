import {
  H1,
  H2,
  H3,
  P,
  List,
  ListItem,
  InlineCode,
  Tip,
  CodeBlock,
} from "../DocsContentRenderer";

export default function GettingStartedDoc() {
  return (
    <div className="animate-in fade-in duration-300 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Primeros Pasos
      </span>
      <H1>Guía de Inicio Rápido</H1>
      <P>
        Bienvenido a Noctra CRM (Forge). Este no es un CRM tradicional donde
        solo almacenas datos muertos. Hemos construido una plataforma{" "}
        <strong>AI-Native</strong> diseñada para operar a la velocidad de la
        luz, eliminando la fricción de WhatsApp y consolidando toda tu operación
        comercial y de entrega en un solo flujo maestro.
      </P>

      <H2>El Enfoque AI-Native</H2>
      <P>
        La mayoría de los CRMs requieren que ingreses datos manualmente y luego
        te dejan la carga mental de recordar qué hacer después. Noctra Forge
        utiliza a <strong>NOCTRA AI</strong> no como un chatbot ("chat con IA"),
        sino como un <InlineCode>Action Engine</InlineCode> o motor de acciones.
      </P>
      <P>
        El sistema analiza en segundo plano todos los eventos de tu base de
        datos (cuándo llegó un lead, cuánto tiempo lleva una propuesta sin
        firmar, qué hitos están vencidos) y empuja acciones concretas hacia ti y
        tu equipo en tiempo real a través del panel inteligente del Dashboard.
      </P>

      <H2>Tour de 15 Minutos: "Zero to Pipeline"</H2>
      <P>
        Sigue estos pasos para dominar el flujo principal del CRM en menos de 15
        minutos:
      </P>

      <H3>1. Revisa tu Dashboard Principal</H3>
      <List>
        <ListItem>
          Abre el sistema. Tu mirada debe ir siempre primero a la franja
          superior de alertas.
        </ListItem>
        <ListItem>
          Cualquier alerta en rojo (ej. leads sin contactar mayor a 3 días o
          acciones vencidas) exige tu atención antes del mediodía.
        </ListItem>
        <ListItem>
          Observa el panel de <strong>NOCTRA AI</strong>. Aquí verás los
          insights de oro (ej. si un cliente leyó tu propuesta 3 veces anoche).
        </ListItem>
      </List>

      <H3>2. Mueve un Lead</H3>
      <List>
        <ListItem>
          Ve a tu vista Kanban en <strong>Pipeline</strong>.
        </ListItem>
        <ListItem>
          En la columna <InlineCode>NUEVO</InlineCode>, abre cualquier tarjeta.
        </ListItem>
        <ListItem>
          Lee el problema del cliente, lánzale un WhatsApp y al terminar,
          simplemente arrastra su tarjeta hacia{" "}
          <InlineCode>CONTACTADO</InlineCode>.
        </ListItem>
      </List>

      <Tip>
        Un lead contactado en menos de 1 hora tiene una probabilidad de cierre 7
        veces mayor. Usa las alertas del Header para no dejar escapar ninguno.
      </Tip>

      <H3>3. Envía tu primera Propuesta</H3>
      <List>
        <ListItem>
          Navega a la sección <strong>Propuestas</strong> y haz clic en{" "}
          <InlineCode>+ Nueva Propuesta</InlineCode>.
        </ListItem>
        <ListItem>
          El sistema genera un folio automático (ej.{" "}
          <InlineCode>NOC-P-0294</InlineCode>).
        </ListItem>
        <ListItem>
          Selecciona el cliente del dropdown, autocompleta con un par de clics
          los entregables, y pon un <strong>Valid Until</strong> (Plazo).
          Envíalo con copiar y pegar el link al cliente.
        </ListItem>
      </List>

      <H2>Siguientes Pasos</H2>
      <P>
        Una vez familiarizado con el Pipeline y la creación de Propuestas, te
        recomendamos configurar tu seguridad antes de manejar información fiscal
        de los clientes.
      </P>
      <P>
        Presiona <InlineCode>⌘ K</InlineCode> globalmente en cualquier momento
        para abrir el Command Bar y navegar ultra-rápido hacia "Seguridad" o
        cualquier otro módulo.
      </P>
    </div>
  );
}
