import { cn, quoteStatusLabel } from "@/lib/utils";

const styles: Record<string, string> = {
  new: "bg-lime text-ink",
  contacted: "bg-sky-400/15 text-sky-300 border border-sky-400/30",
  in_progress: "bg-amber-400/15 text-amber-300 border border-amber-400/30",
  completed: "bg-white/10 text-white/70 border border-white/15",
  pending: "bg-amber-400/15 text-amber-300 border border-amber-400/30",
  approved: "bg-lime/15 text-lime border border-lime/30",
  rejected: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn("inline-block whitespace-nowrap px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em]", styles[status])}>
      {label ?? quoteStatusLabel(status)}
    </span>
  );
}
