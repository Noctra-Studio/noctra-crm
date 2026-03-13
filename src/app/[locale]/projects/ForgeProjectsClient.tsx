"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Project } from "@/lib/projects";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  Trash2,
  Plus,
  CheckCircle2,
  Save,
  X,
  Clock,
  DollarSign,
  TrendingUp,
  Briefcase,
  ExternalLink,
  Copy,
  Link as LinkIcon,
  FileText,
  Send,
  Loader2,
} from "lucide-react";
import { ForgeSidebar } from "@/components/forge/ForgeSidebar";
import {
  generateReportAction,
  sendReportEmailAction,
} from "@/app/actions/reports";
import {
  getProjectDeliverablesAction,
  addDeliverableAction,
  updateDeliverableStatusInternalAction,
} from "@/app/actions/deliverables";
import {
  deleteProjectAction,
  revalidatePublicProjectContentAction,
} from "@/app/actions/projects";
import type { Deliverable } from "@/app/actions/deliverables";
import { populateProjectTasks } from "@/lib/populate-tasks";
import { AIProfitabilityDashboard } from "@/components/forge/projects/AIProfitabilityDashboard";

type StatusHistory = {
  id: string;
  project_id: string;
  status: string;
  created_at: string;
};

type TimeLog = {
  id: string;
  project_id: string;
  description: string;
  hours: number;
  created_at: string;
};

type Expense = {
  id: string;
  project_id: string;
  concept: string;
  amount: number;
  expense_date: string;
  created_at: string;
};

export type ProjectTask = {
  id: string;
  project_id: string;
  phase: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
};

export default function ForgeProjectsClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "detalles" | "rentabilidad" | "tareas" | "entregables"
  >("detalles");
  const [isCreating, setIsCreating] = useState(false);
  const [unsavedIds, setUnsavedIds] = useState<Set<string>>(new Set());
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [histories, setHistories] = useState<Record<string, StatusHistory[]>>(
    {},
  );

  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: "",
    slug: "",
    industry: "",
    service_type: "web_presence",
    status: "discovery",
    launch_date: "",
    start_date: "",
  });

  const [tasks, setTasks] = useState<Record<string, ProjectTask[]>>({});

  const [timeLogs, setTimeLogs] = useState<Record<string, TimeLog[]>>({});
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>({});

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    custom_message: "",
    include_tasks: true,
    include_deliverables: true,
  });
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [newLog, setNewLog] = useState({ description: "", hours: "" });
  const [newExpense, setNewExpense] = useState({
    concept: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const [deliverables, setDeliverables] = useState<
    Record<string, Deliverable[]>
  >({});
  const [newDeliverable, setNewDeliverable] = useState({
    title: "",
    description: "",
    file_url: "",
  });

  const router = useRouter();
  const supabase = createClient();

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const markUnsaved = (id: string) => {
    setUnsavedIds((prev) => new Set(prev).add(id));
  };

  const markSaved = (id: string) => {
    setUnsavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const updateLocal = (id: string, field: keyof Project, value: any) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
    markUnsaved(id);
  };

  const fetchHistory = async (id: string) => {
    const { data } = await supabase
      .from("project_status_history")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });
    if (data) setHistories((prev) => ({ ...prev, [id]: data }));
  };

  useEffect(() => {
    if (selectedId && !histories[selectedId]) {
      fetchHistory(selectedId);
    }
    if (selectedId && !timeLogs[selectedId]) {
      fetchProfitabilityData(selectedId);
      fetchTasks(selectedId);
      // Reset forms
      setNewLog({ description: "", hours: "" });
      setNewExpense({
        concept: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
      });
      fetchDeliverables(selectedId);

      const project = projects.find((p) => p.id === selectedId);
      if (project?.report_config) {
        setReportConfig(project.report_config);
      } else {
        setReportConfig({
          custom_message: "",
          include_tasks: true,
          include_deliverables: true,
        });
      }
      setReportUrl(null);
    }
  }, [selectedId]);

  const fetchDeliverables = async (id: string) => {
    try {
      const data = await getProjectDeliverablesAction(id);
      setDeliverables((prev) => ({ ...prev, [id]: data }));
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const fetchTasks = async (id: string) => {
    const { data } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (data) setTasks((prev) => ({ ...prev, [id]: data }));
  };

  const fetchProfitabilityData = async (id: string) => {
    const [{ data: logs }, { data: exp }] = await Promise.all([
      supabase
        .from("project_time_logs")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("project_expenses")
        .select("*")
        .eq("project_id", id)
        .order("expense_date", { ascending: false }),
    ]);
    if (logs) setTimeLogs((prev) => ({ ...prev, [id]: logs }));
    if (exp) setExpenses((prev) => ({ ...prev, [id]: exp }));
  };

  const handleStatusChange = async (project: Project, newStatus: string) => {
    if (project.status === newStatus) return;

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, status: newStatus as any } : p,
      ),
    );

    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", project.id);
      if (error) throw error;

      await supabase
        .from("project_status_history")
        .insert({ project_id: project.id, status: newStatus });

      showToast(`Status updated to ${newStatus}`);
      fetchHistory(project.id);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleNotesBlur = async (project: Project, notes: string) => {
    if (!unsavedIds.has(project.id)) return; // No change if not marked

    try {
      const { error } = await supabase
        .from("projects")
        .update({ internal_notes: notes })
        .eq("id", project.id);
      if (error) throw error;
      showToast("Notes auto-saved");
      markSaved(project.id);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveAllFields = async (project: Project) => {
    setSavingGlobal(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: project.name,
          slug: project.slug,
          tagline: project.tagline,
          industry: project.industry,
          visible: project.visible,
          start_date: project.start_date,
          launch_date: project.launch_date,
          deadline: project.deadline,
          has_ai_form: project.has_ai_form,
          form_description: project.form_description,
          case_study_enabled: project.case_study_enabled,
          challenge: project.challenge,
          solution: project.solution,
          results: project.results,
          metrics: project.metrics,
          gallery: project.gallery,
          budget: project.budget,
          hourly_rate: project.hourly_rate,
          total_hours: project.total_hours,
          total_expenses: project.total_expenses,
        })
        .eq("id", project.id);

      if (error) throw error;

      const revalidation = await revalidatePublicProjectContentAction(
        project.slug,
      );

      showToast(
        revalidation.success
          ? "Changes saved successfully"
          : "Changes saved in CRM, but the public site cache could not be refreshed.",
        revalidation.success ? "success" : "error",
      );
      markSaved(project.id);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteProjectAction(id);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedId === id) setSelectedId(null);
      showToast(
        result.warning
          ? "Project deleted, but the public site cache could not be refreshed."
          : "Project deleted",
        result.warning ? "error" : "success",
      );
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.slug)
      return showToast("Name and slug required", "error");

    setSavingGlobal(true);
    try {
      const sort_order =
        projects.length > 0
          ? Math.max(...projects.map((p) => p.sort_order || 0)) + 10
          : 10;

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: newProject.name,
          slug: newProject.slug,
          industry: newProject.industry,
          status: newProject.status,
          start_date: newProject.start_date,
          launch_date: newProject.launch_date,
          sort_order,
          visible: true,
          has_ai_form: false,
          case_study_enabled: false,
          metrics: [],
          gallery: [],
          budget: 0,
          hourly_rate: 800,
          total_hours: 0,
          total_expenses: 0,
          service_type: newProject.service_type || "web_presence",
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-populate tasks
      await populateProjectTasks(
        supabase,
        data.id,
        newProject.service_type || "web_presence",
      );

      await supabase
        .from("project_status_history")
        .insert({ project_id: data.id, status: data.status });

      setProjects((prev) =>
        [...prev, data as Project].sort((a, b) => a.sort_order - b.sort_order),
      );
      const revalidation = await revalidatePublicProjectContentAction(data.slug);
      showToast(
        revalidation.success
          ? "Project created"
          : "Project created in CRM, but the public site cache could not be refreshed.",
        revalidation.success ? "success" : "error",
      );
      setIsCreating(false);
      setSelectedId(data.id);
      setNewProject({
        name: "",
        slug: "",
        industry: "",
        service_type: "web_presence",
        status: "discovery",
        launch_date: "",
        start_date: "",
      });
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSavingGlobal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "discovery":
        return "bg-neutral-500";
      case "design":
        return "bg-blue-500";
      case "development":
        return "bg-amber-500";
      case "launch":
        return "bg-orange-500";
      case "completed":
        return "bg-emerald-500";
      default:
        return "bg-neutral-500";
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedId);

  return (
    <div className="flex min-h-full min-w-0 flex-col md:flex-row">
      {/* Toast */}
      {toast && (
        <div
          style={{
            bottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
            right: "calc(env(safe-area-inset-right) + 1rem)",
            left: "calc(env(safe-area-inset-left) + 1rem)",
          }}
          className={`fixed z-50 px-4 py-3 rounded-none border text-sm font-mono tracking-widest uppercase transition-all sm:left-auto ${toast.type === "success" ? "bg-black border-emerald-500/50 text-emerald-400" : "bg-black border-red-500/50 text-red-400"}`}>
          {toast.message}
        </div>
      )}

      {/* Projects Secondary Sidebar */}
      <aside className="w-full md:w-[280px] bg-[#0a0a0a] border-r border-neutral-900 flex flex-col shrink-0 flex-none z-10">
        <div className="p-6 pb-2">
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
            Projects
          </h2>
        </div>

        <div className="px-4 space-y-1">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left p-3 rounded-md transition-all flex flex-col gap-1 border-l-2 ${
                selectedId === p.id
                  ? "bg-white/[0.03] border-emerald-500"
                  : "border-transparent hover:bg-white/[0.02]"
              }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-neutral-200 truncate pr-2 flex items-center gap-2">
                  {p.name}
                  {unsavedIds.has(p.id) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(p.status)}`}
                  />
                </div>
              </div>
              {p.start_date && (
                <div className="text-[10px] text-neutral-300 font-mono uppercase tracking-wider">
                  {p.start_date}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-neutral-900 space-y-4">
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 bg-white border border-white text-black text-[10px] font-mono uppercase tracking-widest hover:bg-transparent hover:text-white transition-colors">
            + New Project
          </button>
        </div>
      </aside>

      {/* Main Detail Panel */}
      <div className="relative flex min-w-0 flex-1 flex-col pb-24 outline-none md:pb-0">
        {!selectedProject ? (
          <div className="flex-1 flex items-center justify-center text-neutral-400 font-mono text-xs uppercase tracking-widest">
            Select a project
          </div>
        ) : (
          <div className="mobile-safe-x w-full max-w-3xl mx-auto space-y-16 py-8 pb-32 md:px-12 md:py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={`px-2 py-0.5 rounded-none border text-[10px] font-mono uppercase tracking-widest ${getStatusColor(selectedProject.status)}/10 border-${getStatusColor(selectedProject.status)}/20 text-${getStatusColor(selectedProject.status).replace("bg-", "")}`}>
                    {selectedProject.status}
                  </div>
                  {!selectedProject.visible && (
                    <div className="px-2 py-0.5 border border-neutral-800 text-neutral-300 text-[10px] font-mono uppercase tracking-widest">
                      Hidden
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 items-center gap-4">
                  <input
                    type="text"
                    value={selectedProject.name}
                    onChange={(e) =>
                      updateLocal(selectedProject.id, "name", e.target.value)
                    }
                    className="text-4xl md:text-5xl font-bold bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full placeholder-neutral-800"
                    placeholder="Project Name"
                  />
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-mono uppercase tracking-widest hover:text-white hover:bg-neutral-800 transition-colors shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                    Generar Reporte
                  </button>
                </div>
              </div>

              {deleteConfirmId === selectedProject.id ? (
                <div className="flex flex-wrap items-center gap-3 bg-red-500/10 p-3 border border-red-500/20">
                  <span className="text-xs text-red-500 font-mono">
                    Are you sure?
                  </span>
                  <button
                    onClick={() => handleDelete(selectedProject.id)}
                    className="text-xs font-bold text-red-400 hover:text-red-300">
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="text-xs text-neutral-400 hover:text-white">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(selectedProject.id)}
                  className="text-neutral-400 hover:text-red-400 transition-colors p-2 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* TABS */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-neutral-900 pb-3">
              <button
                onClick={() => setActiveTab("detalles")}
                className={`pb-2 md:pb-4 text-[10px] font-mono uppercase tracking-widest transition-colors border-b-2 ${activeTab === "detalles" ? "border-emerald-500 text-emerald-400" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}>
                Detalles
              </button>
              <button
                onClick={() => setActiveTab("rentabilidad")}
                className={`pb-2 md:pb-4 text-[10px] font-mono uppercase tracking-widest transition-colors border-b-2 ${activeTab === "rentabilidad" ? "border-emerald-500 text-emerald-400" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}>
                Rentabilidad
              </button>
              <button
                onClick={() => setActiveTab("tareas")}
                className={`pb-2 md:pb-4 text-[10px] font-mono uppercase tracking-widest transition-colors border-b-2 ${activeTab === "tareas" ? "border-emerald-500 text-emerald-400" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}>
                Tareas
              </button>
              <button
                onClick={() => setActiveTab("entregables")}
                className={`pb-2 md:pb-4 text-[10px] font-mono uppercase tracking-widest transition-colors border-b-2 ${activeTab === "entregables" ? "border-emerald-500 text-emerald-400" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}>
                Entregables
              </button>
            </div>

            {activeTab === "tareas" && (
              <TareasTab
                project={selectedProject}
                tasks={tasks[selectedProject.id] || []}
                setTasks={(newTasks: any) =>
                  setTasks((prev) => ({
                    ...prev,
                    [selectedProject.id]: newTasks,
                  }))
                }
                supabase={supabase}
                showToast={showToast}
              />
            )}

            {activeTab === "entregables" && (
              <EntregablesTab
                project={selectedProject}
                deliverables={deliverables[selectedProject.id] || []}
                setDeliverables={(data: any) =>
                  setDeliverables((prev) => ({
                    ...prev,
                    [selectedProject.id]: data,
                  }))
                }
                showToast={showToast}
                newDeliverable={newDeliverable}
                setNewDeliverable={setNewDeliverable}
              />
            )}

            {activeTab === "rentabilidad" && (
              <RentabilidadTab
                project={selectedProject}
                updateLocal={updateLocal}
                setSavingGlobal={setSavingGlobal}
                supabase={supabase}
                showToast={showToast}
                timeLogs={timeLogs[selectedProject.id] || []}
                setTimeLogs={(logs: any) =>
                  setTimeLogs((prev) => ({
                    ...prev,
                    [selectedProject.id]: logs,
                  }))
                }
                expenses={expenses[selectedProject.id] || []}
                setExpenses={(exp: any) =>
                  setExpenses((prev) => ({
                    ...prev,
                    [selectedProject.id]: exp,
                  }))
                }
                newLog={newLog}
                setNewLog={setNewLog}
                newExpense={newExpense}
                setNewExpense={setNewExpense}
                projects={projects}
              />
            )}

            <ReportGeneratorModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              project={selectedProject}
              config={reportConfig}
              setConfig={setReportConfig}
              reportUrl={reportUrl}
              setReportUrl={setReportUrl}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              isSendingEmail={isSendingEmail}
              setIsSendingEmail={setIsSendingEmail}
              showToast={showToast}
            />

            {activeTab === "detalles" && (
              <div className="space-y-16">
                {/* SECTION 1: GENERAL */}
                <section className="space-y-8">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 border-b border-neutral-900 pb-2">
                    1. General
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={selectedProject.slug}
                        onChange={(e) =>
                          updateLocal(
                            selectedProject.id,
                            "slug",
                            e.target.value,
                          )
                        }
                        className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={selectedProject.industry}
                        onChange={(e) =>
                          updateLocal(
                            selectedProject.id,
                            "industry",
                            e.target.value,
                          )
                        }
                        className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={selectedProject.tagline}
                        onChange={(e) =>
                          updateLocal(
                            selectedProject.id,
                            "tagline",
                            e.target.value,
                          )
                        }
                        className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-wrap items-start gap-4">
                      <button
                        onClick={() =>
                          updateLocal(
                            selectedProject.id,
                            "visible",
                            !selectedProject.visible,
                          )
                        }
                        className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${selectedProject.visible ? "bg-emerald-500" : "bg-neutral-800"}`}>
                        <div
                          className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${selectedProject.visible ? "left-7" : "left-1"}`}
                        />
                      </button>
                      <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                        Visible on Public Work Page
                      </span>
                    </div>
                  </div>
                </section>

                {/* SECTION 2: TIMELINE */}
                <section className="space-y-8">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 border-b border-neutral-900 pb-2">
                    2. Timeline
                  </h3>

                  <div className="space-y-4">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                      Phase
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "discovery",
                        "design",
                        "development",
                        "launch",
                        "completed",
                      ].map((phase) => (
                        <button
                          key={phase}
                          onClick={() =>
                            handleStatusChange(selectedProject, phase)
                          }
                          className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest border transition-all ${selectedProject.status === phase ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-transparent border-neutral-800 text-neutral-300 hover:border-neutral-600"}`}>
                          {phase}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={selectedProject.start_date || ""}
                        onChange={(e) =>
                          updateLocal(
                            selectedProject.id,
                            "start_date",
                            e.target.value,
                          )
                        }
                        className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors text-sm [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                        Launch Date
                      </label>
                      <input
                        type="text"
                        value={selectedProject.launch_date || ""}
                        onChange={(e) =>
                          updateLocal(
                            selectedProject.id,
                            "launch_date",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. End of Q1 2026"
                        className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={selectedProject.deadline || ""}
                        onChange={(e) =>
                          updateLocal(
                            selectedProject.id,
                            "deadline",
                            e.target.value,
                          )
                        }
                        className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors text-sm [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </section>

                {/* SECTION 3: INTERNAL NOTES */}
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-900 pb-2">
                    <div>
                      <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                        3. Internal Notes
                      </h3>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Only visible to you. Never shown on the website.
                        Auto-saves on blur.
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={selectedProject.internal_notes || ""}
                    onChange={(e) =>
                      updateLocal(
                        selectedProject.id,
                        "internal_notes",
                        e.target.value,
                      )
                    }
                    onBlur={(e) =>
                      handleNotesBlur(selectedProject, e.target.value)
                    }
                    rows={4}
                    className="w-full bg-neutral-900/30 border border-neutral-800 p-4 text-sm text-neutral-300 focus:outline-none focus:border-white transition-colors resize-y"
                    placeholder="Write private notes, links, contacts here..."
                  />
                </section>

                {/* SECTION 4: SPECIAL FEATURES */}
                <section className="space-y-8">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 border-b border-neutral-900 pb-2">
                    4. Special Features
                  </h3>
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-start gap-4">
                      <button
                        onClick={() =>
                          updateLocal(
                            selectedProject.id,
                            "has_ai_form",
                            !selectedProject.has_ai_form,
                          )
                        }
                        className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${selectedProject.has_ai_form ? "bg-emerald-500" : "bg-neutral-800"}`}>
                        <div
                          className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${selectedProject.has_ai_form ? "left-7" : "left-1"}`}
                        />
                      </button>
                      <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                        AI-Powered Form
                      </span>
                    </div>
                    {selectedProject.has_ai_form && (
                      <div className="space-y-2 sm:pl-16">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                          Form Description
                        </label>
                        <textarea
                          value={selectedProject.form_description || ""}
                          onChange={(e) =>
                            updateLocal(
                              selectedProject.id,
                              "form_description",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors text-sm"
                          placeholder="e.g. Analyzes documents automatically..."
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* SECTION 5: CASE STUDY */}
                {selectedProject.status === "completed" && (
                  <section className="space-y-8">
                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 border-b border-neutral-900 pb-2">
                      5. Case Study
                    </h3>
                    <div className="mb-6 flex flex-wrap items-start gap-4">
                      <button
                        onClick={() =>
                          updateLocal(
                            selectedProject.id,
                            "case_study_enabled",
                            !selectedProject.case_study_enabled,
                          )
                        }
                        className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${selectedProject.case_study_enabled ? "bg-emerald-500" : "bg-neutral-800"}`}>
                        <div
                          className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${selectedProject.case_study_enabled ? "left-7" : "left-1"}`}
                        />
                      </button>
                      <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                        Publish Case Study (/work/{selectedProject.slug})
                      </span>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                          The Challenge
                        </label>
                        <textarea
                          value={selectedProject.challenge || ""}
                          onChange={(e) =>
                            updateLocal(
                              selectedProject.id,
                              "challenge",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                          Our Solution
                        </label>
                        <textarea
                          value={selectedProject.solution || ""}
                          onChange={(e) =>
                            updateLocal(
                              selectedProject.id,
                              "solution",
                              e.target.value,
                            )
                          }
                          rows={4}
                          className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                          The Results
                        </label>
                        <textarea
                          value={selectedProject.results || ""}
                          onChange={(e) =>
                            updateLocal(
                              selectedProject.id,
                              "results",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white transition-colors text-sm"
                        />
                      </div>
                    </div>

                    {selectedProject.case_study_enabled && (
                      <>
                        <div className="space-y-4 pt-6">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                              Metrics
                            </label>
                            <button
                              onClick={() =>
                                updateLocal(selectedProject.id, "metrics", [
                                  ...(selectedProject.metrics || []),
                                  { label: "", value: "", delta: "" },
                                ])
                              }
                              className="text-[10px] font-mono uppercase text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Add Metric
                            </button>
                          </div>
                          <div className="space-y-3">
                            {selectedProject.metrics?.map((m, i) => (
                              <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                                <input
                                  value={m.label}
                                  onChange={(e) => {
                                    const newM = [...selectedProject.metrics];
                                    newM[i].label = e.target.value;
                                    updateLocal(
                                      selectedProject.id,
                                      "metrics",
                                      newM,
                                    );
                                  }}
                                  placeholder="Label"
                                  className="flex-1 bg-transparent border-b border-neutral-800 py-2 text-sm text-white focus:border-white focus:outline-none"
                                />
                                <input
                                  value={m.value}
                                  onChange={(e) => {
                                    const newM = [...selectedProject.metrics];
                                    newM[i].value = e.target.value;
                                    updateLocal(
                                      selectedProject.id,
                                      "metrics",
                                      newM,
                                    );
                                  }}
                                  placeholder="Value"
                                  className="w-full sm:w-32 bg-transparent border-b border-neutral-800 py-2 text-sm text-white font-bold focus:border-white focus:outline-none"
                                />
                                <input
                                  value={m.delta || ""}
                                  onChange={(e) => {
                                    const newM = [...selectedProject.metrics];
                                    newM[i].delta = e.target.value;
                                    updateLocal(
                                      selectedProject.id,
                                      "metrics",
                                      newM,
                                    );
                                  }}
                                  placeholder="Delta"
                                  className="w-full sm:w-24 bg-transparent border-b border-neutral-800 py-2 text-sm text-emerald-400 focus:border-emerald-500 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const newM = selectedProject.metrics.filter(
                                      (_, idx) => idx !== i,
                                    );
                                    updateLocal(
                                      selectedProject.id,
                                      "metrics",
                                      newM,
                                    );
                                  }}
                                  className="p-2 mt-1 text-red-500/50 hover:text-red-400">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4 pt-6">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                              Gallery
                            </label>
                            <button
                              onClick={() =>
                                updateLocal(selectedProject.id, "gallery", [
                                  ...(selectedProject.gallery || []),
                                  { url: "", caption: "" },
                                ])
                              }
                              className="text-[10px] font-mono uppercase text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Add Image
                            </button>
                          </div>
                          <div className="space-y-3">
                            {selectedProject.gallery?.map((g, i) => (
                              <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                                <input
                                  value={g.url}
                                  onChange={(e) => {
                                    const newG = [...selectedProject.gallery];
                                    newG[i].url = e.target.value;
                                    updateLocal(
                                      selectedProject.id,
                                      "gallery",
                                      newG,
                                    );
                                  }}
                                  placeholder="URL (/images/...)"
                                  className="flex-1 bg-transparent border-b border-neutral-800 py-2 text-sm text-white focus:border-white focus:outline-none"
                                />
                                <input
                                  value={g.caption}
                                  onChange={(e) => {
                                    const newG = [...selectedProject.gallery];
                                    newG[i].caption = e.target.value;
                                    updateLocal(
                                      selectedProject.id,
                                      "gallery",
                                      newG,
                                    );
                                  }}
                                  placeholder="Caption"
                                  className="flex-1 bg-transparent border-b border-neutral-800 py-2 text-sm text-white focus:border-white focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const newG = selectedProject.gallery.filter(
                                      (_, idx) => idx !== i,
                                    );
                                    updateLocal(
                                      selectedProject.id,
                                      "gallery",
                                      newG,
                                    );
                                  }}
                                  className="p-2 mt-1 text-red-500/50 hover:text-red-400">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </section>
                )}

                {/* SECTION 6: STATUS HISTORY */}
                <section className="space-y-4 pt-12">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 border-b border-neutral-900 pb-2">
                    6. Status History
                  </h3>
                  <div className="space-y-3 pl-2 border-l border-neutral-900">
                    {(histories[selectedProject.id] || []).map((h) => (
                      <div
                        key={h.id}
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono">
                        <span
                          className={`uppercase tracking-widest w-24 ${getStatusColor(h.status).replace("bg-", "text-")}`}>
                          {h.status}
                        </span>
                        <span className="text-neutral-400">→</span>
                        <span className="text-neutral-300">
                          {new Date(h.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* Floating Save Button */}
        {selectedProject && unsavedIds.has(selectedProject.id) && (
          <div
            style={{ bottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
            className="absolute left-1/2 z-50 -translate-x-1/2">
            <button
              onClick={() => handleSaveAllFields(selectedProject)}
              disabled={savingGlobal}
              className="px-5 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-200 transition-colors shadow-2xl disabled:opacity-50 whitespace-nowrap">
              {savingGlobal ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-8 space-y-8">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-neutral-300">
                New Project
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-neutral-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                  Name *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newProject.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                    setNewProject({ ...newProject, name, slug });
                  }}
                  className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                  Slug *
                </label>
                <input
                  type="text"
                  value={newProject.slug}
                  onChange={(e) =>
                    setNewProject({ ...newProject, slug: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                  Industry
                </label>
                <input
                  type="text"
                  value={newProject.industry}
                  onChange={(e) =>
                    setNewProject({ ...newProject, industry: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                  Tipo de Servicio
                </label>
                <select
                  value={newProject.service_type || "web_presence"}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      service_type: e.target.value as any,
                    })
                  }
                  className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white text-sm">
                  <option value="web_presence" className="bg-[#111]">
                    Web Presence
                  </option>
                  <option value="ecommerce" className="bg-[#111]">
                    E-commerce
                  </option>
                  <option value="custom_system" className="bg-[#111]">
                    Custom System
                  </option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newProject.start_date || ""}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white text-sm [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                    Launch Date
                  </label>
                  <input
                    type="text"
                    value={newProject.launch_date}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        launch_date: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 text-white focus:outline-none focus:border-white text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button
                disabled={savingGlobal}
                onClick={handleCreateProject}
                className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50">
                {savingGlobal ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------------
// RENTABILIDAD TAB
// ----------------------------------------------------------------------------------
function RentabilidadTab({
  project,
  updateLocal,
  setSavingGlobal,
  supabase,
  showToast,
  timeLogs,
  setTimeLogs,
  expenses,
  setExpenses,
  newLog,
  setNewLog,
  newExpense,
  setNewExpense,
  projects,
}: any) {
  const totalCosto =
    project.total_hours * project.hourly_rate + project.total_expenses;
  const margenBruto = project.budget - totalCosto;
  const pctMargen =
    project.budget > 0 ? (margenBruto / project.budget) * 100 : 0;

  const tarifaEfectiva =
    project.total_hours > 0 ? project.budget / project.total_hours : 0;

  let marginColor = "text-emerald-400";
  if (pctMargen < 20) marginColor = "text-red-400";
  else if (pctMargen < 40) marginColor = "text-orange-400";

  let costColor = "text-emerald-400";
  if (project.budget > 0) {
    if (totalCosto > project.budget * 0.8) costColor = "text-red-400";
  }

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const saveConfig = async () => {
    setSavingGlobal(true);
    try {
      await supabase
        .from("projects")
        .update({
          budget: project.budget,
          hourly_rate: project.hourly_rate,
        })
        .eq("id", project.id);
      showToast("Configuración guardada");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleAddTimeLog = async () => {
    if (!newLog.description || !newLog.hours)
      return showToast("Faltan campos", "error");
    const hrs = parseFloat(newLog.hours);
    if (isNaN(hrs) || hrs <= 0) return showToast("Horas inválidas", "error");

    setSavingGlobal(true);
    try {
      const { data, error } = await supabase
        .from("project_time_logs")
        .insert({
          project_id: project.id,
          description: newLog.description,
          hours: hrs,
        })
        .select()
        .single();
      if (error) throw error;

      setTimeLogs([data, ...timeLogs]);

      const newTotal = (project.total_hours || 0) + hrs;
      updateLocal(project.id, "total_hours", newTotal);
      await supabase
        .from("projects")
        .update({ total_hours: newTotal })
        .eq("id", project.id);

      setNewLog({ description: "", hours: "" });
      showToast("Horas registradas");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleDeleteTimeLog = async (logId: string, hrs: number) => {
    try {
      await supabase.from("project_time_logs").delete().eq("id", logId);
      setTimeLogs(timeLogs.filter((l: any) => l.id !== logId));

      const newTotal = Math.max(0, (project.total_hours || 0) - hrs);
      updateLocal(project.id, "total_hours", newTotal);
      await supabase
        .from("projects")
        .update({ total_hours: newTotal })
        .eq("id", project.id);
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.concept || !newExpense.amount)
      return showToast("Faltan campos", "error");
    const amt = parseFloat(newExpense.amount);
    if (isNaN(amt) || amt <= 0) return showToast("Monto inválido", "error");

    setSavingGlobal(true);
    try {
      const { data, error } = await supabase
        .from("project_expenses")
        .insert({
          project_id: project.id,
          concept: newExpense.concept,
          amount: amt,
          expense_date: newExpense.expense_date,
        })
        .select()
        .single();
      if (error) throw error;

      setExpenses(
        [data, ...expenses].sort(
          (a: any, b: any) =>
            new Date(b.expense_date).getTime() -
            new Date(a.expense_date).getTime(),
        ),
      );

      const newTotal = (project.total_expenses || 0) + amt;
      updateLocal(project.id, "total_expenses", newTotal);
      await supabase
        .from("projects")
        .update({ total_expenses: newTotal })
        .eq("id", project.id);

      setNewExpense({
        concept: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
      });
      showToast("Gasto registrado");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleDeleteExpense = async (expId: string, amt: number) => {
    try {
      await supabase.from("project_expenses").delete().eq("id", expId);
      setExpenses(expenses.filter((e: any) => e.id !== expId));

      const newTotal = Math.max(0, (project.total_expenses || 0) - amt);
      updateLocal(project.id, "total_expenses", newTotal);
      await supabase
        .from("projects")
        .update({ total_expenses: newTotal })
        .eq("id", project.id);
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="space-y-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-neutral-900 p-6 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
            Precio del Proyecto
          </span>
          <div className="text-3xl font-black text-white">
            {formatMXN(project.budget)}
          </div>
        </div>
        <div className="bg-[#111111] border border-neutral-900 p-6 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
            Costo Total
          </span>
          <div className={`text-3xl font-black ${costColor}`}>
            {formatMXN(totalCosto)}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-2">
            Horas ({formatMXN(project.total_hours * project.hourly_rate)}) +
            Gastos
          </span>
        </div>
        <div className="bg-[#111111] border border-neutral-900 p-6 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
            Margen Bruto
          </span>
          <div className={`text-3xl font-black ${marginColor}`}>
            {formatMXN(margenBruto)}
          </div>
          <span
            className={`text-[10px] font-mono uppercase tracking-widest mt-2 ${marginColor}`}>
            {pctMargen.toFixed(1)}% (
            {project.budget > 0 ? "sobre precio" : "N/A"})
          </span>
        </div>
        <div className="bg-[#111111] border border-neutral-900 p-6 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
            Tarifa Efectiva / Hr
          </span>
          <div className="text-3xl font-black text-white">
            {formatMXN(tarifaEfectiva)}
          </div>
          <span
            className={`text-[10px] font-mono uppercase tracking-widest mt-2 ${tarifaEfectiva >= project.hourly_rate ? "text-emerald-400" : "text-red-400"}`}>
            {tarifaEfectiva >= project.hourly_rate
              ? "▲ Por encima del obj."
              : "▼ Por debajo del obj."}
          </span>
        </div>
      </div>

      {/* HORAS TRABAJADAS */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 border-b border-neutral-900 pb-2">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
            Horas Trabajadas
          </h3>
          <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5">
            {project.total_hours} hrs
          </span>
        </div>

        {/* Quick Add Form */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="¿Qué hiciste? Ej: Diseño UI / Frontend"
            value={newLog.description}
            onChange={(e) =>
              setNewLog({ ...newLog, description: e.target.value })
            }
            className="flex-1 bg-transparent border-b border-neutral-800 px-0 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Horas (ej: 2.5)"
            value={newLog.hours}
            onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
            className="w-full md:w-32 bg-transparent border-b border-neutral-800 px-0 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleAddTimeLog}
            className="px-6 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-mono uppercase tracking-widest transition-colors border border-emerald-500/20 shrink-0">
            + Registrar
          </button>
        </div>

        {/* Log Table */}
        <div className="bg-[#0a0a0a] border border-neutral-900 overflow-hidden w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-900 text-[9px] font-mono uppercase tracking-widest text-neutral-500">
                <th className="p-4 font-normal">Fecha</th>
                <th className="p-4 font-normal w-full">Descripción</th>
                <th className="p-4 font-normal text-right">Horas</th>
                <th className="p-4 font-normal text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {timeLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-xs font-mono text-neutral-600 text-center">
                    No hay horas registradas
                  </td>
                </tr>
              ) : (
                timeLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-xs font-mono text-neutral-400">
                      {new Date(log.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-neutral-200 truncate max-w-[200px] md:max-w-md">
                      {log.description}
                    </td>
                    <td className="p-4 text-right font-mono text-emerald-400">
                      {log.hours}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteTimeLog(log.id, log.hours)}
                        className="text-neutral-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* GASTOS DEL PROYECTO */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 border-b border-neutral-900 pb-2">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
            Gastos
          </h3>
          <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5">
            {formatMXN(project.total_expenses)}
          </span>
        </div>

        {/* Quick Add Form */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Concepto Ej: Vercel, Dominio"
            value={newExpense.concept}
            onChange={(e) =>
              setNewExpense({ ...newExpense, concept: e.target.value })
            }
            className="flex-1 bg-transparent border-b border-neutral-800 px-0 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            placeholder="Monto (MXN)"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
            className="w-full md:w-32 bg-transparent border-b border-neutral-800 px-0 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <input
            type="date"
            value={newExpense.expense_date}
            onChange={(e) =>
              setNewExpense({ ...newExpense, expense_date: e.target.value })
            }
            className="w-full md:w-36 bg-transparent border-b border-neutral-800 px-0 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
          />
          <button
            onClick={handleAddExpense}
            className="px-6 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-mono uppercase tracking-widest transition-colors border border-emerald-500/20 shrink-0">
            + Agregar
          </button>
        </div>

        {/* Expense Table */}
        <div className="bg-[#0a0a0a] border border-neutral-900 overflow-hidden w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-900 text-[9px] font-mono uppercase tracking-widest text-neutral-500">
                <th className="p-4 font-normal">Fecha</th>
                <th className="p-4 font-normal w-full">Concepto</th>
                <th className="p-4 font-normal text-right">Monto</th>
                <th className="p-4 font-normal text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-xs font-mono text-neutral-600 text-center">
                    No hay gastos registrados
                  </td>
                </tr>
              ) : (
                expenses.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-xs font-mono text-neutral-400">
                      {exp.expense_date}
                    </td>
                    <td className="p-4 text-neutral-200 truncate max-w-[200px] md:max-w-md">
                      {exp.concept}
                    </td>
                    <td className="p-4 text-right font-mono text-red-400">
                      {formatMXN(exp.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.amount)}
                        className="text-neutral-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CONFIGURACIÓN */}
      <section className="space-y-6 pt-8 border-t border-neutral-900">
        <div className="flex items-center gap-4 pb-2">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Configuración Financiera
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Presupuesto del Proyecto (MXN)
            </label>
            <input
              type="number"
              value={project.budget}
              onChange={(e) =>
                updateLocal(
                  project.id,
                  "budget",
                  parseFloat(e.target.value) || 0,
                )
              }
              className="w-full bg-[#0a0a0a] border border-neutral-800 p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Tarifa Objetivo (MXN/Hr)
            </label>
            <input
              type="number"
              value={project.hourly_rate}
              onChange={(e) =>
                updateLocal(
                  project.id,
                  "hourly_rate",
                  parseFloat(e.target.value) || 0,
                )
              }
              className="w-full bg-[#0a0a0a] border border-neutral-800 p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        <button
          onClick={saveConfig}
          className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">
          Guardar Configuración
        </button>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------------------------
// TAREAS TAB
// ----------------------------------------------------------------------------------
function TareasTab({ project, tasks, setTasks, supabase, showToast }: any) {
  const [newTasks, setNewTasks] = useState<Record<string, string>>({});
  const [newPhase, setNewPhase] = useState("");

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.completed).length;
  const overallPct =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const tasksByPhase = tasks.reduce((acc: any, t: any) => {
    if (!acc[t.phase]) acc[t.phase] = [];
    acc[t.phase].push(t);
    return acc;
  }, {});

  // Identify the order of phases based on earliest sort_order per phase
  const phaseOrder = Object.keys(tasksByPhase).sort((a, b) => {
    const minA = Math.min(...tasksByPhase[a].map((t: any) => t.sort_order));
    const minB = Math.min(...tasksByPhase[b].map((t: any) => t.sort_order));
    return minA - minB;
  });

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    const newStatus = !currentCompleted;
    const completedAt = newStatus ? new Date().toISOString() : null;

    setTasks(
      tasks.map((t: any) =>
        t.id === taskId
          ? { ...t, completed: newStatus, completed_at: completedAt }
          : t,
      ),
    );

    try {
      const { error } = await supabase
        .from("project_tasks")
        .update({ completed: newStatus, completed_at: completedAt })
        .eq("id", taskId);
      if (error) throw error;
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(tasks.filter((t: any) => t.id !== taskId));
    try {
      await supabase.from("project_tasks").delete().eq("id", taskId);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleAddTask = async (phase: string) => {
    const title = newTasks[phase];
    if (!title) return;

    const phaseTasks = tasksByPhase[phase] || [];
    const maxSort =
      phaseTasks.length > 0
        ? Math.max(...phaseTasks.map((t: any) => t.sort_order))
        : 0;

    setNewTasks({ ...newTasks, [phase]: "" });

    try {
      const { data, error } = await supabase
        .from("project_tasks")
        .insert({
          project_id: project.id,
          phase,
          title,
          sort_order: maxSort + 10,
        })
        .select()
        .single();

      if (error) throw error;
      setTasks([...tasks, data]);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleAddPhase = async () => {
    if (!newPhase) return;
    try {
      const { data, error } = await supabase
        .from("project_tasks")
        .insert({
          project_id: project.id,
          phase: newPhase,
          title: "Nueva tarea inicial",
          sort_order:
            tasks.length > 0
              ? Math.max(...tasks.map((t: any) => t.sort_order)) + 100
              : 10,
        })
        .select()
        .single();

      if (error) throw error;
      setTasks([...tasks, data]);
      setNewPhase("");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-12">
      {/* OVERALL PROGRESS */}
      {totalTasks === 0 ? (
        <div className="bg-[#111111] border border-neutral-900 p-8 sm:p-12 flex flex-col items-center justify-center gap-6 text-center">
          <div className="space-y-2">
            <p className="text-neutral-500 text-sm font-mono uppercase tracking-widest">
              No hay tareas en este proyecto
            </p>
            <p className="text-neutral-700 text-[10px] font-mono uppercase tracking-widest">
              ¿Deseas cargar la plantilla estándar para {project.service_type}?
            </p>
          </div>
          <button
            onClick={async () => {
              await populateProjectTasks(
                supabase,
                project.id,
                project.service_type,
              );
              // Simple way to refresh: call parent's fetchTasks or just use the local state update
              // Since we are in TareasTab, we'd need to re-fetch.
              // We'll pass fetchTasks as a prop or just let the user re-select the project for now.
              // Actually, better to pass fetchTasks.
              // But looking at the code, it's safer to just trigger a re-mount or similar.
              window.location.reload(); // Quick fix for now to ensure data sync
            }}
            className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors">
            Cargar tareas del proyecto
          </button>
        </div>
      ) : (
        <div className="bg-[#111111] border border-neutral-900 p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest text-neutral-300">
            <span>
              Progreso general: {completedTasks}/{totalTasks} tareas
            </span>
            <span className="text-emerald-400">{overallPct}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* PHASES */}
      <div className="space-y-12">
        {phaseOrder.map((phase) => {
          const phaseTasks = tasksByPhase[phase];

          // Sort tasks: uncompleted first, completed last
          const sortedTasks = [...phaseTasks].sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return a.sort_order - b.sort_order;
          });

          const pTotal = phaseTasks.length;
          const pComp = phaseTasks.filter((t: any) => t.completed).length;
          const pPct = pTotal > 0 ? Math.round((pComp / pTotal) * 100) : 0;

          return (
            <div key={phase} className="space-y-4">
              {/* Phase Header */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-900 pb-2">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-white">
                    {phase}{" "}
                    <span className="text-neutral-500 ml-2">
                      — {pComp}/{pTotal}
                    </span>
                  </h3>
                </div>
                {/* Phase Progress Bar */}
                <div className="w-full h-1 bg-neutral-900 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500/50 transition-all duration-500 ease-out"
                    style={{ width: `${pPct}%` }}
                  />
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-1">
                {sortedTasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 hover:bg-white/[0.02] border border-transparent hover:border-neutral-900 transition-colors">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleTask(t.id, t.completed)}
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                          t.completed
                            ? "bg-emerald-500 border-emerald-500 text-black"
                            : "bg-transparent border-neutral-700 hover:border-neutral-500"
                        }`}>
                        {t.completed && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm ${
                            t.completed
                              ? "text-neutral-500 line-through"
                              : "text-neutral-200"
                          }`}>
                          {t.title}
                        </span>
                        {t.completed && t.completed_at && (
                          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest mt-1">
                            Completado el{" "}
                            {new Date(t.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Delete Task */}
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-2 shrink-0 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Inline Add Task */}
                <div className="flex flex-wrap items-center gap-3 p-3">
                  <div className="w-5 h-5 border border-dashed border-neutral-800 rounded flex items-center justify-center shrink-0" />
                  <input
                    type="text"
                    placeholder="+ Agregar tarea..."
                    value={newTasks[phase] || ""}
                    onChange={(e) =>
                      setNewTasks({ ...newTasks, [phase]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTask(phase);
                    }}
                    className="flex-1 bg-transparent text-sm text-neutral-400 focus:text-white placeholder-neutral-600 focus:outline-none"
                  />
                  {newTasks[phase] && (
                    <button
                      onClick={() => handleAddTask(phase)}
                      className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 hover:text-emerald-300">
                      Guardar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Phase */}
      <div className="pt-8 border-t border-neutral-900">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Nombre de la nueva fase..."
            value={newPhase}
            onChange={(e) => setNewPhase(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddPhase();
            }}
            className="w-full sm:max-w-[240px] bg-transparent border-b border-neutral-800 px-0 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleAddPhase}
            disabled={!newPhase}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-mono uppercase tracking-widest hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50">
            + Fase
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------------
// ENTREGABLES TAB
// ----------------------------------------------------------------------------------
function EntregablesTab({
  project,
  deliverables,
  setDeliverables,
  showToast,
  newDeliverable,
  setNewDeliverable,
}: any) {
  const handleAdd = async () => {
    if (!newDeliverable.title || !newDeliverable.file_url) {
      return showToast("Faltan campos obligatorios", "error");
    }

    try {
      const data = await addDeliverableAction({
        project_id: project.id,
        ...newDeliverable,
      });
      setDeliverables([data, ...deliverables]);
      setNewDeliverable({ title: "", description: "", file_url: "" });
      showToast("Entregable agregado");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const copyClientLink = (token: string) => {
    const url = `${window.location.origin}/client/deliverables/${token}`;
    navigator.clipboard.writeText(url);
    showToast("Link copiado al portapapeles");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-neutral-500/10 border-neutral-500/20 text-neutral-400";
      case "in_review":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "approved":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "rejected":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-neutral-500/10 border-neutral-500/20 text-neutral-400";
    }
  };

  return (
    <div className="space-y-12">
      {/* ADD FORM */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 border-b border-neutral-900 pb-2">
          Agregar nuevo entregable
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0a0a0a] p-5 sm:p-6 border border-neutral-900">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
                Nombre del entregable *
              </label>
              <input
                type="text"
                placeholder="Ej: Mockups de Diseño v1"
                value={newDeliverable.title}
                onChange={(e) =>
                  setNewDeliverable({
                    ...newDeliverable,
                    title: e.target.value,
                  })
                }
                className="w-full bg-transparent border-b border-neutral-800 py-2 text-sm focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
                URL del archivo * (Drive, Figma, Vercel)
              </label>
              <div className="flex min-w-0 items-center gap-2 border-b border-neutral-800 py-2">
                <LinkIcon className="w-3 h-3 text-neutral-600" />
                <input
                  type="text"
                  placeholder="https://..."
                  value={newDeliverable.file_url}
                  onChange={(e) =>
                    setNewDeliverable({
                      ...newDeliverable,
                      file_url: e.target.value,
                    })
                  }
                  className="flex-1 bg-transparent text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
                Instrucciones para el cliente
              </label>
              <textarea
                placeholder="Ej: Favor de revisar el flujo de checkout..."
                value={newDeliverable.description}
                onChange={(e) =>
                  setNewDeliverable({
                    ...newDeliverable,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full bg-neutral-900/50 border border-neutral-800 p-3 text-sm focus:outline-none focus:border-neutral-700 transition-colors"
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">
              + Agregar entregable
            </button>
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 border-b border-neutral-900 pb-2">
          Entregables actuales
        </h3>
        <div className="space-y-4">
          {deliverables.length === 0 ? (
            <p className="text-xs font-mono text-neutral-600 text-center py-12 italic">
              No hay entregables registrados para este proyecto.
            </p>
          ) : (
            deliverables.map((d: any) => (
              <div
                key={d.id}
                className="bg-[#0a0a0a] border border-neutral-900 p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-neutral-700 transition-all">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-2 py-0.5 border text-[9px] font-mono uppercase tracking-widest ${getStatusBadge(d.status)}`}>
                      {d.status.replace("_", " ")}
                    </span>
                    <h4 className="text-sm font-bold text-white">{d.title}</h4>
                  </div>
                  {d.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {d.description}
                    </p>
                  )}
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest">
                    <ExternalLink className="w-3 h-3" />
                    Ver Archivo Original
                  </a>
                </div>

                <div className="flex flex-col justify-between items-start gap-4 shrink-0 md:items-end">
                  <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
                    <button
                      onClick={() => copyClientLink(d.client_token)}
                      className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 text-[9px] font-mono uppercase tracking-widest text-neutral-400 hover:text-white hover:border-neutral-700 transition-all">
                      <Copy className="w-3 h-3" />
                      Copiar link cliente
                    </button>
                  </div>
                  {d.reviewed_at && (
                    <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                      Revisado: {new Date(d.reviewed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {d.client_comment && (
                  <div className="md:col-span-2 mt-2 p-4 bg-red-500/5 border-l-2 border-red-500/20">
                    <span className="text-[9px] font-mono uppercase text-red-400 block mb-1">
                      Comentario del cliente:
                    </span>
                    <p className="text-xs text-neutral-300 italic">
                      "{d.client_comment}"
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------------------------
// REPORT GENERATOR MODAL
// ----------------------------------------------------------------------------------
function ReportGeneratorModal({
  isOpen,
  onClose,
  project,
  config,
  setConfig,
  reportUrl,
  setReportUrl,
  isGenerating,
  setIsGenerating,
  isSendingEmail,
  setIsSendingEmail,
  showToast,
}: any) {
  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateReportAction(project.id, config);
      setReportUrl(result.url);
      showToast("Reporte generado con éxito");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = () => {
    if (reportUrl) {
      navigator.clipboard.writeText(reportUrl);
      showToast("Link copiado");
    }
  };

  const handleSendEmail = async () => {
    if (!project.client_email) {
      return showToast(
        "Falta email del cliente en los detalles del proyecto",
        "error",
      );
    }
    setIsSendingEmail(true);
    try {
      const res = await sendReportEmailAction(
        project.id,
        project.client_email,
        reportUrl!,
      );
      if (res.success) {
        showToast("Email enviado al cliente");
      } else {
        throw new Error(res.error as string);
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-neutral-900 w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-900 p-6">
          <div className="min-w-0 space-y-1">
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">
              Configurar Reporte de Avance
            </h2>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Proyecto: {project.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-8">
          {/* OPTIONS */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                Mensaje personalizado (Introducción)
              </label>
              <textarea
                value={config.custom_message}
                onChange={(e) =>
                  setConfig({ ...config, custom_message: e.target.value })
                }
                className="w-full bg-neutral-900/50 border border-neutral-800 p-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-neutral-700"
                rows={4}
                placeholder="Ej: Hola! Te compartimos los avances de esta semana..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={config.include_tasks}
                  onChange={(e) =>
                    setConfig({ ...config, include_tasks: e.target.checked })
                  }
                  className="w-4 h-4 rounded-none border-neutral-800 bg-neutral-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">
                  Incluir Tareas
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={config.include_deliverables}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      include_deliverables: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded-none border-neutral-800 bg-neutral-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">
                  Incluir Entregables
                </span>
              </label>
            </div>
          </div>

          {!reportUrl ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {isGenerating ? "Generando..." : "Generar link de reporte"}
            </button>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-center">
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">
                  ¡Link de reporte listo!
                </p>
                <p className="text-xs text-neutral-300 break-all">
                  {reportUrl}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={copyLink}
                  className="py-3 bg-neutral-900 border border-neutral-800 text-white text-[9px] font-mono uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                  <Copy className="w-3 h-3" />
                  Copiar Link
                </button>
                <a
                  href={reportUrl}
                  target="_blank"
                  className="py-3 bg-neutral-900 border border-neutral-800 text-white text-[9px] font-mono uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                  <ExternalLink className="w-3 h-3" />
                  Preview
                </a>
              </div>

              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="w-full py-4 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isSendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {isSendingEmail
                  ? "Enviando..."
                  : "Enviar por correo al cliente"}
              </button>

              <button
                onClick={() => setReportUrl(null)}
                className="w-full text-[9px] font-mono text-neutral-600 uppercase tracking-widest hover:text-neutral-400 transition-colors">
                Actualizar configuración
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
