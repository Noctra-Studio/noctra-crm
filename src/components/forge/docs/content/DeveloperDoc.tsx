import {
  H1,
  H2,
  H3,
  P,
  List,
  ListItem,
  Warning,
  CodeBlock,
  InlineCode,
} from "../DocsContentRenderer";

export default function DeveloperDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Desarrolladores
      </span>
      <H1>Stack y Arquitectura Técnica</H1>
      <P>
        Noctra Forge no es un no-code wrapper. Es una aplicación Node
        server-first ultra optimizada para latencias nulas y ejecución en Edge.
      </P>

      <H2>Topología del Stack</H2>
      <List>
        <ListItem>
          <strong>Framework Core:</strong> Next.js 14+ (App Router). Rendering
          híbrido dominado por RSC (React Server Components).
        </ListItem>
        <ListItem>
          <strong>Data Layer & Auth:</strong> Supabase (PostgreSQL). Utilizamos
          Row Level Security (RLS) extensivamente para aislar Workspaces en la
          versión Multi-tenant.
        </ListItem>
        <ListItem>
          <strong>Styling Engine:</strong> Tailwind CSS V3 compilado al vuelo
          (JIT). Sin dependencias pesadas visuales, sistema de UI propietario y
          "Native Feel".
        </ListItem>
        <ListItem>
          <strong>AI Layer:</strong> Anthropic API (Claude 3.5 Sonnet) para el
          razonamiento autónomo sin pre-entrenamiento estático.
        </ListItem>
        <ListItem>
          <strong>Storage Engine:</strong> Supabase S3 Buckets privados para los
          contratos, PDFs autogenerados y assets de clientes.
        </ListItem>
      </List>

      <H2>Environment Variables</H2>
      <P>
        El proyecto colapsará si el engine Edge de Next no hidrata estos
        secretos:
      </P>
      <CodeBlock>
        # Supabase{`\n`}
        NEXT_PUBLIC_SUPABASE_URL=xxxxxxx{`\n`}
        NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxx{`\n`}
        SUPABASE_SERVICE_ROLE_KEY=xxxxxxx{`\n\n`}# AI Engine{`\n`}
        ANTHROPIC_API_KEY=sk-xxxx...{`\n\n`}# Auth Config{`\n`}
        NEXT_PUBLIC_SITE_URL=http://localhost:3000
      </CodeBlock>
      <Warning>
        Cuidar que la clave <InlineCode>SUPABASE_SERVICE_ROLE_KEY</InlineCode>{" "}
        jamás penetre a componentes cliente (que no inicie con{" "}
        <InlineCode>NEXT_PUBLIC_</InlineCode>). Esta se emplea únicamente en
        Actiones seguras de API Routes para bypassear el RLS durante inyecciones
        de máquina.
      </Warning>

      <H2>Supabase Schema Abstraction</H2>
      <P>
        Las tablas principales giran alrededor del ID del tenant y el foreign
        key en cascada.
      </P>
      <H3>
        <InlineCode>clients</InlineCode>
      </H3>
      <P>
        Campos vitales: <InlineCode>id (UUID)</InlineCode>,{" "}
        <InlineCode>company_name</InlineCode>, <InlineCode>rfc</InlineCode>,{" "}
        <InlineCode>workspace_id</InlineCode>.
      </P>

      <H3>
        <InlineCode>leads</InlineCode>
      </H3>
      <P>
        Campos vitales: <InlineCode>id (UUID)</InlineCode>,{" "}
        <InlineCode>name</InlineCode>, <InlineCode>pipeline_status</InlineCode>,{" "}
        <InlineCode>next_action_date</InlineCode>,{" "}
        <InlineCode>score</InlineCode>.
      </P>

      <H3>
        <InlineCode>proposals</InlineCode>
      </H3>
      <P>
        Conectada al <InlineCode>client_id</InlineCode> (opcional si es lead).
        Campos: <InlineCode>proposal_number</InlineCode>,{" "}
        <InlineCode>status</InlineCode> (draft, sent, viewed, accepted,
        rejected), <InlineCode>total_price</InlineCode>.
      </P>

      <H3>
        <InlineCode>projects</InlineCode>
      </H3>
      <P>
        La entidad de ejecución. Status control: (not_started, active, paused,
        completed, cancelled).
      </P>

      <H2>Patrón de Integración RLS (Row Level Security)</H2>
      <P>
        Todas las tablas tienen protección estricta a nivel de Base de Datos.
        Una llamada en el frontend con el cliente `supabase` solo devolverá
        filas donde <InlineCode>auth.uid() = workspace_id_owner</InlineCode>.
        Nadie puede solicitar o alterar leads de otro workspace sin importar si
        adivina las URLs.
      </P>
    </div>
  );
}
