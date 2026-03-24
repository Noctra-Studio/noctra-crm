export type DashboardData = {
  profile: {
    company_name: string;
    full_name: string;
  };
  project: {
    id: string;
    name: string;
    total_budget: number;
  };
  services: {
    name: string;
    budget_allocated: number;
    budget_spent: number;
    progress_percentage: number;
  }[];
  activeWorker: {
    worker_name: string;
    current_status: 'coding' | 'meeting' | 'online';
    current_task: string;
  };
  deliverable: {
    id: string;
    title: string;
    tags: string[];
    preview_image_url: string;
    version_updates: { task: string; done: boolean }[]; // JSONB mapped
  };
};
