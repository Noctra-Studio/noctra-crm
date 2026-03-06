"use client";

import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

type Item = {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
};

export function ProposalItemsList({
  items,
  onChange,
}: {
  items: Item[];
  onChange: (items: Item[]) => void;
}) {
  const addItem = () => {
    onChange([
      ...items,
      { name: "", description: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="py-12 border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center gap-3 bg-white/[0.01]">
          <FileText className="w-5 h-5 text-neutral-600 stroke-[1.5]" />
          <p className="text-xs font-light text-neutral-500 tracking-wide">
            Sin servicios agregados aún
          </p>
        </div>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          className="group p-4 bg-white/[0.02] border border-white/5 rounded-sm space-y-4 hover:border-white/10 transition-colors">
          <div className="flex items-start gap-4">
            <div className="mt-2 text-neutral-700 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8 space-y-2">
                  <label className="text-[8px] font-mono text-neutral-400 uppercase">
                    Nombre del Servicio
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    placeholder="Ej. Desarrollo de Landing Page"
                    className="w-full bg-transparent border-b border-white/10 py-1 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors font-bold"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[8px] font-mono text-neutral-400 uppercase">
                    Cant.
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full bg-transparent border-b border-white/10 py-1 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                  />
                </div>
                <div className="col-span-2 space-y-2 text-right">
                  <label className="text-[8px] font-mono text-neutral-400 uppercase">
                    Precio Unit.
                  </label>
                  <div className="relative">
                    <span className="absolute left-0 top-1 text-neutral-400 text-[10px]">
                      $
                    </span>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unit_price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full bg-transparent border-b border-white/10 py-1 pl-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-right"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-mono text-neutral-400 uppercase">
                  Descripción / Detalles
                </label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  placeholder="Detalla qué incluye este servicio..."
                  className="w-full bg-black/20 border border-white/5 p-2 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors resize-none text-neutral-400"
                />
              </div>
            </div>

            <button
              onClick={() => removeItem(index)}
              className="mt-2 p-2 hover:bg-black text-neutral-700 hover:text-red-500 transition-all rounded-md">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addItem}
        className="w-full py-4 border border-dashed border-white/5 hover:border-white/20 hover:bg-white/[0.02] flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-300 transition-all">
        <Plus className="w-3.5 h-3.5" />
        Agregar Item de Servicio
      </button>
    </div>
  );
}
