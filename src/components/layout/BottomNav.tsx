import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/lib/navigation";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useAdmin } from "@/hooks/useAdmin";
import { MoreHorizontal, X, Shield } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const PRIMARY_HREFS = ["/", "/routine", "/finance", "/gymrats"];
const primaryItems = navigationItems.filter(i => PRIMARY_HREFS.includes(i.href));
const moreItems = navigationItems.filter(i => !PRIMARY_HREFS.includes(i.href));

interface BottomNavProps {
  activeItem?: string;
}

const BottomNav = forwardRef<HTMLElement, BottomNavProps>(
  ({ activeItem = "/" }, ref) => {
    const { t } = usePreferences();
    const { isAdmin } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const [showMore, setShowMore] = useState(false);

    const currentPath = location.pathname;
    const isActiveHref = (href: string) => currentPath === href;
    const isMoreActive = moreItems.some((item) => isActiveHref(item.href));

    const handleNav = (href: string) => {
      navigate(href);
      setShowMore(false);
    };

    return (
      <>
        {/* Overlay menu */}
        {showMore && (
          <div className="md:hidden fixed inset-0 z-[60]" onClick={() => setShowMore(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="absolute bottom-16 left-2 right-2 bg-popover border border-border rounded-xl p-2 shadow-lg animate-in slide-in-from-bottom-4 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {moreItems.map((item) => {
                const active = isActiveHref(item.href);
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNav(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{t(item.labelKey)}</span>
                  </button>
                );
              })}
              {isAdmin && (
                <button
                  onClick={() => handleNav("/admin")}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left",
                    isActiveHref("/admin")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Painel Admin</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom nav bar */}
        <nav ref={ref} className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-pb">
          <ul className="flex items-center justify-around py-1 px-1">
            {primaryItems.map((item) => {
              const active = isActiveHref(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <button
                    onClick={() => handleNav(item.href)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-colors",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-md transition-colors", active && "bg-primary/10")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
                  </button>
                </li>
              );
            })}

            {/* More button */}
            <li>
              <button
                onClick={() => setShowMore((v) => !v)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-colors",
                  showMore || isMoreActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn("p-1.5 rounded-md transition-colors", (showMore || isMoreActive) && "bg-primary/10")}>
                  {showMore ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-medium">Mais</span>
              </button>
            </li>
          </ul>
        </nav>
      </>
    );
  }
);

BottomNav.displayName = "BottomNav";

export default BottomNav;
