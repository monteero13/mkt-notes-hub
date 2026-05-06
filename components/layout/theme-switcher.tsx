"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeModeSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-3 px-3 py-2", collapsed && "justify-center px-0")}>
        {!collapsed && (
          <span className="technical-label text-[10px] text-white/40 uppercase tracking-widest flex-1">
            Theme Mode
          </span>
        )}
        <div className="h-5 w-8 rounded-full bg-white/5 animate-pulse" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className={cn("flex items-center gap-3 px-3 py-2", collapsed && "justify-center px-0")}>
      {!collapsed && (
        <span className="technical-label text-[10px] text-white/40 uppercase tracking-widest flex-1">
          Theme Mode
        </span>
      )}
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        startIcon={<Sun className="h-3 w-3" />}
        endIcon={<Moon className="h-3 w-3" />}
        className={cn(
          "data-[state=checked]:bg-brand/20 data-[state=unchecked]:bg-white/5",
          collapsed && "h-4 w-7"
        )}
      />
    </div>
  );
}
