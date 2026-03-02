import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props extends NavLinkProps {
  activeClassName?: string;
}

export function NavLink({ className, activeClassName = "bg-muted text-primary font-medium", ...props }: Props) {
  return (
    <RouterNavLink
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50",
          className,
          isActive && activeClassName
        )
      }
      {...props}
    />
  );
}
