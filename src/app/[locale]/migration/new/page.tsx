import { MigrationWizard } from "@/components/forge/migration/MigrationWizard";
import { getWorkspace } from "@/lib/workspace";
import { redirect } from "next/navigation";

export default async function NewMigrationPage() {
  const ctx = await getWorkspace();
  if (!ctx) redirect("/login");

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
