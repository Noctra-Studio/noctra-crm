import {
  H1,
  H2,
  H3,
  P,
  List,
  ListItem,
  InlineCode,
  Tip,
} from "../DocsContentRenderer";

export default function ReferenceDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Referencias
      </span>
      <H1>Teclado y Atajos</H1>
      <P>
        Un usuario <em>Power User</em> no debería levantar las manos del teclado
        para mover un deal en el CRM.
      </P>

      <H2>Búsqueda Global (Command Bar)</H2>
      <P>
        El <InlineCode>Command Bar</InlineCode> flota encima de toda la UI del
        CRM de forma invisible esperando ser convocado. Soporta búsqueda difusa
        (fuzzy search) permitiendo tipeos rápidos y errores de dedo sin romper
        las consultas.
      </P>

      <List>
        <ListItem>
          <strong>Abrir Command Bar:</strong> Presiona{" "}
          <InlineCode>⌘</InlineCode> + <InlineCode>K</InlineCode> en macOS o{" "}
          <InlineCode>Ctrl</InlineCode> + <InlineCode>K</InlineCode> en
          Windows/Linux.
        </ListItem>
        <ListItem>
          <strong>Navegación Vertical:</strong> Flechas{" "}
          <InlineCode>Arriba</InlineCode> / <InlineCode>Abajo</InlineCode> o
          también <InlineCode>Tab</InlineCode>.
        </ListItem>
        <ListItem>
          <strong>Seleccionar / Ejecutar:</strong> Tecla{" "}
          <InlineCode>Enter</InlineCode>.
        </ListItem>
        <ListItem>
          <strong>Cerrar:</strong> Tecla <InlineCode>Escape</InlineCode>.
        </ListItem>
      </List>

      <Tip>
        ¿Recuerdas solo el nombre de la empresa pero no de la persona del Lead?
        Búscalo en la barra, el motor indexa ambas celdas.
      </Tip>

      <H2>Glosario Corto</H2>
      <List>
        <ListItem>
          <strong>Lead:</strong> Prospecto pre-firma.
        </ListItem>
        <ListItem>
          <strong>Cliente:</strong> Entidad post-firma.
        </ListItem>
        <ListItem>
          <strong>Proposal View:</strong> Tracker invisible que avisa si el
          cliente abrió el PDF interactivo o lo dejó en "visto".
        </ListItem>
        <ListItem>
          <strong>Hash SLA:</strong> Sello criptográfico inyectado en el PDF
          para validez legal.
        </ListItem>
      </List>

      <H2>Preguntas Frecuentes (FAQ)</H2>
      <H3>¿Puedo borrar leads que sé que son basura?</H3>
      <P>
        No los elimines físicamente. Muévelos al estado de Pipeline{" "}
        <InlineCode>Perdido</InlineCode>. Las estadísticas comerciales te
        agradecerán contar también el ratio de abandono real.
      </P>
      <H3>¿Cada cuánto calcula la IA mis estadísticas de rentabilidad?</H3>
      <P>
        Depende de que el equipo técnico cargue sus hojas de tiempo (Timesheets)
        en la pestaña RENTABILIDAD del Proyecto activo. La IA jala la data cada
        minuto.
      </P>
    </div>
  );
}
