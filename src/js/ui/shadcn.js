export const cn = (...c) => c.filter(Boolean).join(" ");

const buttonBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
  icon: "h-9 w-9",
};

export const button = (variant = "default", size = "default") => cn(buttonBase, buttonVariants[variant], buttonSizes[size]);

export const input =
  "flex h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const label = "text-sm font-medium leading-none";

export const card = "rounded-xl border border-border bg-card text-card-foreground shadow-sm";

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-border text-foreground",
};

export const badge = (variant = "secondary") =>
  cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", badgeVariants[variant]);
