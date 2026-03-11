import { MigrationWizard } from "@/components/forge/migration/MigrationWizard";
import { getRequiredWorkspace } from "@/lib/workspace";

export default async function NewMigrationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const ctx = await getRequiredWorkspace(locale);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Nueva Migración</h1>
        <p className="text-neutral-400">
          Importa tus datos desde otras plataformas de forma segura y
          automatizada.
        </p>
      </div>

      <MigrationWizard workspaceId={ctx.workspaceId} />
    </div>
  );
}
