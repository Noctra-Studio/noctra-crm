"use client";

import { ListTodo, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const MOCK_TASKS = {
  todo: [
    {
      id: 1,
      title: "Review brand guidelines",
      priority: "high",
      assignee: "Client",
    },
    {
      id: 2,
      title: "Provide product images",
      priority: "medium",
      assignee: "Client",
    },
  ],
  inProgress: [
    {
      id: 3,
      title: "Homepage hero animation",
      priority: "high",
      assignee: "Manu",
    },
    {
      id: 4,
      title: "Mobile responsive fixes",
      priority: "medium",
      assignee: "Manu",
    },
    { id: 5, title: "SEO meta tags", priority: "low", assignee: "Manu" },
  ],
  review: [
    {
      id: 6,
      title: "Contact form design",
      priority: "medium",
      assignee: "Client",
    },
    { id: 7, title: "About page copy", priority: "low", assignee: "Client" },
  ],
};

const priorityColors = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  low: "text-neutral-400 bg-neutral-500/10 border-neutral-500/20",
};

interface TaskColumnProps {
  title: string;
  tasks: typeof MOCK_TASKS.todo;
  icon: React.ReactNode;
  color: string;
}

function TaskColumn({ title, tasks, icon, color }: TaskColumnProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${color}`}>
        {icon}
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="ml-auto text-sm text-neutral-300">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer group">
            <p className="text-sm font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">
              {task.title}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded border ${
                  priorityColors[task.priority as keyof typeof priorityColors]
                }`}>
                {task.priority}
              </span>
              <span className="text-xs text-neutral-300">
                • {task.assignee}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TasksView() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
          </div>
          <p className="text-neutral-300">
            Track and manage project deliverables
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            title="To Do"
            tasks={MOCK_TASKS.todo}
            icon={<Clock className="w-4 h-4 text-neutral-400" />}
            color="border-neutral-700"
          />
          <TaskColumn
            title="In Progress"
            tasks={MOCK_TASKS.inProgress}
            icon={<AlertCircle className="w-4 h-4 text-blue-400" />}
            color="border-blue-500/30"
          />
          <TaskColumn
            title="Review"
            tasks={MOCK_TASKS.review}
            icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
            color="border-green-500/30"
          />
        </div>
      </div>
    </div>
  );
}
