import { MigrationHistoryTable } from "@/components/migration/MigrationHistoryTable";
import { getWorkspace } from "@/lib/workspace";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Database } from "lucide-react";

export default async function MigrationHistoryPage() {
  const ctx = await getWorkspace();
  if (!ctx) redirect("/forge/login");

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">Migraciones</h1>
          </div>
          <p className="text-neutral-400">
            Gestiona y monitorea el historial de importaciones de tu espacio de
            trabajo.
          </p>
        </div>

        <Link
          href="/forge/migration/new"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10">
          <Plus className="w-4 h-4" />
          Nueva Migración
        </Link>
      </div>

      <MigrationHistoryTable workspaceId={ctx.workspaceId} />
    </div>
  );
}
