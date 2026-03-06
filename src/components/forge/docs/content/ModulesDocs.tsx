import {
  H1,
  H2,
  H3,
  P,
  List,
  ListItem,
  InlineCode,
  Warning,
  Tip,
  Danger,
  CodeBlock,
} from "../DocsContentRenderer";

export function DashboardDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Módulos
      </span>
      <H1>Dashboard</H1>
      <P>
        El Dashboard es tu centro de comando diario. Ha sido diseñado para darte{" "}
        <strong>"Situation Awareness"</strong> absoluta en 5 segundos. Desde
        aquí diriges todo el esfuerzo comercial.
      </P>

      <H2>Tarjetas de Métricas (KPIs)</H2>
      <P>
        Existen 4 macro-métricas esenciales siempre fijas en la parte superior:
      </P>
      <List>
        <ListItem>
          <strong>Leads Este Mes:</strong> Compara la captación actual contra el
          mismo periodo del mes anterior.
        </ListItem>
        <ListItem>
          <strong>Propuestas Activas:</strong> El total de facturación (MXN) que
          se encuentra actualmente "En la calle" (Propuestas con estado Enviada
          o Vista).
        </ListItem>
        <ListItem>
          <strong>Proyectos En Curso:</strong> Proyectos activos de tu equipo de
          delivery (estado que no sea finalizado/cancelado). Pasa el mouse sobre
          esta tarjeta para ver el desglose rápido.
        </ListItem>
        <ListItem>
          <strong>Forecast de Ingresos:</strong> Proyección ponderada financiera
          ("¿Cuánto de lo que está en nuestro pipeline cerrará este mes
          matemáticamente?").
        </ListItem>
      </List>

      <H3>Sparklines Hashing</H3>
      <P>
        Las líneas visuales de tendencia (Sparklines) dentro de las tarjetas KPI
        grafican los últimos 7 días de actividad de esa vertical para demostrar
        volatilidad o salud. El "Forecast" muestra tendencias a futuro (30
        días).
      </P>

      <H2>Alertas Condicionales</H2>
      <P>
        Las Alertas que aparecen arriba de los KPIs funcionan mediante reglas
        condicionales estáticas y se dividen en prioridades:
      </P>
      <Warning>
        <strong>Rojo (Crítico):</strong> Leads ignorados por demasiados días y
        acciones de seguimiento que ya han vencido. Un CRM sano siempre limpia
        primero sus balas rojas.
      </Warning>
      <Tip>
        <strong>Naranja/Amarillo (Atenciones):</strong> Propuestas listas para
        firmar perdidas en el limbo, propuestas caducándose, contratos
        pendientes de contra-firma.
      </Tip>
    </div>
  );
}

export function LeadsDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Módulos
      </span>
      <H1>Leads</H1>
      <P>
        El módulo de Leads centraliza toda la captura top-of-funnel (Formularios
        Web, Referidos, Cold Ads).
      </P>

      <H2>Clientes vs. Leads</H2>
      <P>Es fundamental entender la filosofía de segmentación de Noctra:</P>
      <List>
        <ListItem>
          <strong>LEADS:</strong> Son prospectos, personas o empresas que
          mostraron interés pero <em>no</em> han firmado un contrato de
          servicio. Viven transitoriamente en el Pipeline.
        </ListItem>
        <ListItem>
          <strong>CLIENTES:</strong> Un Lead se "transforma" en Cliente la
          primera vez que se firma un contrato o inicia un enganche monetario.
          Un Cliente ya posee documentación legal y proyectos operativos activos
          registrados.
        </ListItem>
      </List>

      <Danger>
        Nunca intentes "Eliminar" a un lead por que canceló o rechazó. En su
        lugar, usa el estado de Pipeline <InlineCode>PERDIDO</InlineCode>.
        Mantener el historial (Log) de qué hablamos con ellos nos dota de
        insights si regresan en 12 meses.
      </Danger>
    </div>
  );
}

export function ClientesDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Módulos
      </span>
      <H1>Clientes</H1>
      <P>
        Aquí administras la base de datos oficial de la empresa: aquellos con
        los que se tiene o se ha tenido relación comercial y legal viva.
      </P>
      <H2>Directorio Activo</H2>
      <P>Dentro de un Perfil de Cliente observarás:</P>
      <List>
        <ListItem>Datos Fiscales para facturación futura.</ListItem>
        <ListItem>
          El listado indexado de{" "}
          <strong>TODAS sus propuestas y contratos</strong> a lo largo del
          historial del universo CRM.
        </ListItem>
        <ListItem>Sus Proyectos Operativos.</ListItem>
      </List>
    </div>
  );
}

export function PipelineDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Módulos
      </span>
      <H1>Pipeline (Kanban)</H1>
      <P>
        El tablero Kanban es donde controlas exactamente dónde te encuentras en
        cada negociación. Arrastra y suelta para actualizar estados
        inmediatamente.
      </P>

      <H2>Cálculo de Forecast Ponderado</H2>
      <P>
        La magia del Forecast financiero depende directamente del orden en este
        Pipeline, aplicando probabilidades de cierre al volumen (ej. ¿cuánto
        dinero significa la etapa "En Negociación"?).
      </P>
      <List>
        <ListItem>
          <strong>Nuevo (0%):</strong> Volumen financiero ignorado.
        </ListItem>
        <ListItem>
          <strong>Contactado (15%):</strong> Interés calificado bruto.
        </ListItem>
        <ListItem>
          <strong>Propuesta Enviada (25%):</strong> La oferta está en sus manos.
        </ListItem>
        <ListItem>
          <strong>Negociación / Propuesta Vista (60%):</strong> Interés
          explícito. Si alguien lee tu propuesta y contra-oferta, estamos cerca
          de cerrar.
        </ListItem>
        <ListItem>
          <strong>Firmado (100%):</strong> Ingreso seguro sumado al Cashflow
          real.
        </ListItem>
      </List>
    </div>
  );
}

export function PropuestasDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Módulos
      </span>
      <H1>Propuestas Comerciales</H1>
      <P>
        Creación automática de enlaces mágicos para enviar propuestas a clientes
        con el branding de Noctra.
      </P>

      <H2>El Sistema de Folios (NOC-P)</H2>
      <P>
        Para dar seriedad al esfuerzo de venta, cada propuesta genera un
        identificador inmutable con el formato{" "}
        <InlineCode>NOC-P-XXXX</InlineCode>. Nunca se reciclan folios,
        asegurando la auditoría si un folio es rechazado o manipulado
        internamente.
      </P>

      <H2>Urgencia Artificial: Valid Until</H2>
      <P>
        <strong>Toda propuesta DEBE llevar una fecha de validez.</strong> Al
        omitir fechas de caducidad envías el mensaje subconsciente de que "tu
        tiempo es gratis".
      </P>
      <Tip>
        La regla de oro es establecer una validez estándar de{" "}
        <strong>15 a 30 días</strong> máximo. Después de la fecha, la UI del
        cliente le prohibe legalmente aceptar el presupuesto obligando un nuevo
        presupuesto.
      </Tip>
    </div>
  );
}

export function ContratosDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Módulos
      </span>
      <H1>Contratos</H1>
      <P>Convierte a los Leads en Clientes legalmente.</P>
      <H2>Firma Electrónica Nativa</H2>
      <P>
        Atrás quedaron las impresiones y PDFs en WhatsApp. El flujo de Noctra
        manda un enlace mágico al prospecto donde este revisa el Service Level
        Agreement.
      </P>
      <P>
        Una vez firmado por ambos, el CRM plasma el nombre, la IP y un{" "}
        <strong>Hash criptográfico (SHA)</strong> garantizando que el texto
        sellado es legal e inmutable vinculando la aprobación electrónica de
        ambos.
      </P>
    </div>
  );
}

export function ProyectosDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Módulos
      </span>
      <H1>Gestión de Proyectos</H1>
      <P>El módulo de Delivery para el equipo técnico.</P>
      <H2>Arquitectura Relacional</H2>
      <P>
        Todo nace de la base comercial. La estructura técnica detrás de Noctra
        sigue la cadena de valor pura:
      </P>
      <CodeBlock>
        Lead (Persona) ──&gt; Propuesta (Monto/Scope) ──&gt; Contrato (Acuerdo
        Legal) ──&gt; Cliente (Titular) ──&gt; Proyecto (La Ejecución)
      </CodeBlock>
      <P>
        Un Proyecto siempre asocia el ID del cliente, y opcionalmente el ID de
        la propuesta firmada (para tener el scope of work a la mano y evitar{" "}
        <InlineCode>scope-creep</InlineCode>). Acá se revisan y aprueban
        tickets.
      </P>
    </div>
  );
}

export function MetricsDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Módulos
      </span>
      <H1>Métricas y Reporting</H1>
      <P>
        El módulo Metrics concentra todo el output del motor CRM hacia gráficas
        de retención, Close Rate General, Ticket Promedio por Lead y márgenes
        temporales de proyecto.
      </P>
      <P>
        El reporte usa agregación en SQL para sacar fotos en caliente del ciclo
        de venta, eliminando la necesidad de exportar CSVs a Excel.
      </P>
    </div>
  );
}
