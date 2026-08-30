import {
  Bot,
  BrainCircuit,
  Boxes,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Layers,
  LifeBuoy,
  Network,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

/** Named icons referenced by `site-content.ts` (keeps content as plain data). */
const ICONS = {
  bot: Bot,
  brain: BrainCircuit,
  boxes: Boxes,
  code: Code2,
  cpu: Cpu,
  database: Database,
  branch: GitBranch,
  layers: Layers,
  lifebuoy: LifeBuoy,
  network: Network,
  scroll: ScrollText,
  shield: ShieldCheck,
  sparkles: Sparkles,
  userCheck: UserCheck,
  workflow: Workflow,
  wrench: Wrench,
  zap: Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp className={cn("h-5 w-5", className)} aria-hidden />;
}
