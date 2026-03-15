"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  User,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";

export type CrmTask = {
  id: string;
  title: string;
  due_date: string | null;
  assigned_user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

interface TasksPanelProps {
  entityType: "lead" | "client" | "project" | "proposal" | "contract";
  entityId: string;
  compact?: boolean;
}

export function TasksPanel({
  entityType,
  entityId,
  compact = false,
}: TasksPanelProps) {
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    due_date: "",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/tasks?entityType=${entityType}&entityId=${entityId}`
      );
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Error loading tasks", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, entityType]);

  const handleAdd = async () => {
    if (!newTask.title.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title.trim(),
          due_date: newTask.due_date || null,
          entity_type: entityType,
          entity_id: entityId,
        }),
      });
      if (res.ok) {
        setNewTask({ title: "", due_date: "" });
        await loadTasks();
      }
    } catch (err) {
      console.error("Error creating task", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (task: CrmTask) => {
    setTogglingId(task.id);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  completed: !t.completed,
                  completed_at: !t.completed ? new Date().toISOString() : null,
                }
              : t
          )
        );
      }
    } catch (err) {
      console.error("Error toggling task", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Error deleting task", err);
    } finally {
      setDeletingId(null);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const doneTasks = tasks.filter((t) => t.completed);

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* ADD TASK FORM */}
      <div className="bg-[#080808] border border-neutral-900 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            Nueva tarea / follow-up
          </span>
        </div>
        <div className="flex gap-3 flex-col md:flex-row">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Título de la tarea..."
            className="flex-1 bg-[#0d0d0d] border border-neutral-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <input
            type="date"
            value={newTask.due_date}
            onChange={(e) =>
              setNewTask({ ...newTask, due_date: e.target.value })
            }
            className="w-full md:w-40 bg-[#0d0d0d] border border-neutral-900 px-4 py-2.5 text-sm text-neutral-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={isSaving || !newTask.title.trim()}
          className="w-full bg-white text-black text-[10px] font-black uppercase tracking-widest py-3 hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
          {isSaving ? "Guardando..." : "Agregar Tarea"}
        </button>
      </div>

      {/* TASK LIST */}
      {isLoading ? (
        <div className="py-8 text-center text-[10px] font-mono uppercase tracking-widest text-neutral-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando tareas...
        </div>
      ) : tasks.length === 0 ? (
        <ForgeEmptyState
          icon="check-circle"
          eyebrow="Tareas"
          title="Sin tareas pendientes"
          description="Agrega tareas de seguimiento para este registro y asigna fechas límite."
          guidance={["Follow-ups", "Entregas", "Recordatorios"]}
          size="compact"
        />
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 px-1">
                Pendientes ({pendingTasks.length})
              </p>
              {pendingTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isOverdue={isOverdue(task.due_date)}
                  isToggling={togglingId === task.id}
                  isDeleting={deletingId === task.id}
                  onToggle={() => handleToggle(task)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>
          )}

          {/* Done */}
          {doneTasks.length > 0 && (
            <div className="space-y-2 opacity-50">
              <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 px-1">
                Completadas ({doneTasks.length})
              </p>
              {doneTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isOverdue={false}
                  isToggling={togglingId === task.id}
                  isDeleting={deletingId === task.id}
                  onToggle={() => handleToggle(task)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  isOverdue,
  isToggling,
  isDeleting,
  onToggle,
  onDelete,
}: {
  task: CrmTask;
  isOverdue: boolean;
  isToggling: boolean;
  isDeleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-3 bg-[#0a0a0a] border px-4 py-3 transition-all ${
        task.completed
          ? "border-white/5 opacity-60"
          : isOverdue
            ? "border-red-500/20 hover:border-red-500/40"
            : "border-white/5 hover:border-white/10"
      }`}
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        disabled={isToggling}
        className="shrink-0 text-neutral-400 hover:text-emerald-500 transition-colors"
      >
        {isToggling ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : task.completed ? (
          <CheckCircle2
            className="w-5 h-5 text-emerald-500"
            strokeWidth={1.5}
          />
        ) : (
          <Circle className="w-5 h-5" strokeWidth={1.5} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            task.completed
              ? "line-through text-neutral-500"
              : "text-neutral-200"
          }`}
        >
          {task.title}
        </p>
        {task.due_date && (
          <div className="flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 text-neutral-500" />
            <span
              className={`text-[10px] font-mono uppercase ${
                isOverdue && !task.completed
                  ? "text-red-500"
                  : "text-neutral-500"
              }`}
            >
              {format(new Date(task.due_date + "T12:00:00"), "dd MMM yyyy", {
                locale: es,
              })}
              {isOverdue && !task.completed && " · Vencida"}
            </span>
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
