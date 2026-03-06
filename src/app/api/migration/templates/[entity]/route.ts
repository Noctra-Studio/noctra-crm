
import { NextRequest, NextResponse } from "next/server";

const TEMPLATES: Record<string, string[]> = {
  contacts: ["nombre", "apellido", "email", "telefono", "empresa", "puesto", "notas"],
  companies: ["nombre", "dominio", "industria", "pais", "notas"],
  deals: ["titulo", "monto", "etapa", "fecha_cierre", "descripcion"],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  const headers = TEMPLATES[entity];

  if (!headers) {
    return NextResponse.json({ error: "Entidad no encontrada" }, { status: 404 });
  }

  // Generate CSV content
  const csvContent = headers.join(",") + "\n" + 
    headers.map(h => `Ejemplo ${h}`).join(",");

  const response = new NextResponse(csvContent);
  response.headers.set("Content-Type", "text/csv");
  response.headers.set(
    "Content-Disposition",
    `attachment; filename=template_${entity}.csv`
  );

  return response;
}
