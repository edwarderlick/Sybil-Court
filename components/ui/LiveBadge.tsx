import { Icon } from "./Icon";

type LiveBadgeProps = {
  label?: string;
  className?: string;
};

export function LiveBadge({
  label = "Live Public Data",
  className = "",
}: LiveBadgeProps) {
  return (
    <span
      className={`bg-primary/20 border border-primary text-primary font-label-technical text-label-technical px-2 py-1 flex items-center gap-1 uppercase ${className}`}
    >
      <Icon name="sensors" className="text-[12px]" />
      {label}
    </span>
  );
}
