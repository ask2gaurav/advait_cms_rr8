import {
  Bot,
  BrainCircuit,
  Boxes,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Database,
  DollarSign,
  GitBranch,
  Layers,
  LifeBuoy,
  Network,
  Package,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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
  checkCircle: CheckCircle2,
  clock: Clock,
  code: Code2,
  cpu: Cpu,
  database: Database,
  dollarSign: DollarSign,
  branch: GitBranch,
  layers: Layers,
  lifebuoy: LifeBuoy,
  network: Network,
  package: Package,
  scroll: ScrollText,
  shield: ShieldCheck,
  sparkles: Sparkles,
  trendingUp: TrendingUp,
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
