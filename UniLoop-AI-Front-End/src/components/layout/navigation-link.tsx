"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { NavigationItem } from "@/config/navigation";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

type NavigationLinkProps = {
  item: NavigationItem;
  onNavigate?: () => void;
  activeOverride?: boolean;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function itemIsActive(pathname: string, item: NavigationItem) {
  return (
    isActivePath(pathname, item.href) ||
    Boolean(item.children?.some((child) => isActivePath(pathname, child.href)))
  );
}

function mostSpecificActiveHref(
  pathname: string,
  children: readonly NavigationItem[],
) {
  return children
    .filter((child) => isActivePath(pathname, child.href))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;
}

export function NavigationLink({
  item,
  onNavigate,
  activeOverride,
}: NavigationLinkProps) {
  const pathname = usePathname();
  const active = activeOverride ?? itemIsActive(pathname, item);
  const Icon = item.icon;
  const [open, setOpen] = useState(false);
  const expanded = open || active;

  if (item.children?.length) {
    const activeChildHref = mostSpecificActiveHref(pathname, item.children);
    return (
      <div>
        <button
          aria-expanded={expanded}
          className={cn(
            "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <Icon aria-hidden="true" className="size-4" />
          <span className="flex-1">{t(item.label)}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
        {expanded ? (
          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
            {item.children.map((child) => (
              <NavigationLink
                activeOverride={activeChildHref === child.href}
                item={child}
                key={child.href}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span>{t(item.label)}</span>
    </Link>
  );
}
