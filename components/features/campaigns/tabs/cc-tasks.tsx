import { Task, TaskStatus, Profile, Campaign } from "@/types";
import { CheckCircle2, Circle, Clock, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import { NewTaskDialog } from "@/components/features/tasks/new-task-dialog";

interface Props {
  tasks: Task[];
  workspaceId: string;
  members: Profile[];
  clients: { id: string; company_name: string }[];
  campaigns: { id: string; name: string }[];
  campaign: Campaign;
}

const STATUS_ORDER: TaskStatus[] = ["in_progress", "in_review", "todo", "backlog", "done", "canceled"];

const STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: "Backlog", todo: "Por Hacer", in_progress: "En Curso",
  in_review: "En Revisión", done: "Hecho", canceled: "Cancelado",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  backlog: "text-muted-foreground/50", todo: "text-foreground",
  in_progress: "text-blue-400", in_review: "text-yellow-400",
  done: "text-brand", canceled: "text-red-400",
};

const PRIORITY_STYLE: Record<string, string> = {
  urgent: "bg-red-500/10 text-red-400 border-red-500/20",
  high:   "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low:    "bg-green-500/10 text-green-400 border-green-500/20",
};

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "Urgente", high: "Alta", medium: "Media", low: "Baja",
};

export function CcTasks({ tasks, workspaceId, members, clients, campaigns, campaign }: Props) {
  const grouped = STATUS_ORDER.reduce<Partial<Record<TaskStatus, Task[]>>>((acc, s) => {
    const list = tasks.filter((t) => t.status === s);
    if (list.length) acc[s] = list;
    return acc;
  }, {});

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-border space-y-4">
        <CheckCircle2 size={32} className="text-muted-foreground/20" />
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Sin tareas asignadas</p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Comienza a estructurar el flujo operativo de esta campaña.
          </p>
        </div>
        <NewTaskDialog
          workspaceId={workspaceId}
          members={members}
          clients={clients}
          campaigns={campaigns}
          defaultCampaignId={campaign.id}
          defaultClientId={campaign.client_id ?? undefined}
        >
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-brand rounded-sm hover:opacity-90 active:scale-95 transition-all">
            <Plus size={14} />
            Crear Tarea
          </button>
        </NewTaskDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Operaciones y Tareas</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hitos clave y entregables de la campaña</p>
        </div>
        <NewTaskDialog
          workspaceId={workspaceId}
          members={members}
          clients={clients}
          campaigns={campaigns}
          defaultCampaignId={campaign.id}
          defaultClientId={campaign.client_id ?? undefined}
        >
          <button className="flex items-center gap-2 px-3 h-8 text-[10px] font-black uppercase tracking-widest text-white bg-brand rounded-sm hover:opacity-90 active:scale-95 transition-all">
            <Plus size={12} />
            Nueva Tarea
          </button>
        </NewTaskDialog>
      </div>

      <div className="space-y-6">
        {STATUS_ORDER.filter((s) => grouped[s]).map((status) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest", STATUS_COLOR[status])}>
                {STATUS_LABEL[status]}
              </span>
              <span className="text-[10px] text-muted-foreground/40">({grouped[status]!.length})</span>
            </div>
          <div className="space-y-2">
            {grouped[status]!.map((task) => (
              <div
                key={task.id}
                className="border border-border bg-card rounded-xl p-4 flex items-start justify-between gap-4 hover:border-brand/30 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className={cn("mt-0.5 shrink-0", task.status === "done" ? "text-brand" : "text-border")}>
                    {task.status === "done" ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className={cn("text-sm font-semibold", task.status === "done" && "line-through text-muted-foreground/50")}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-sm border", PRIORITY_STYLE[task.priority])}>
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                      {task.due_date && (
                        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(task.due_date), "d MMM")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {task.assignee && (
                  <Avatar className="h-7 w-7 rounded-lg border border-border shrink-0">
                    <AvatarImage src={(task.assignee as any).avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px] font-bold rounded-lg bg-brand/10 text-brand">
                      {(task.assignee as any).full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
