"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  brandName: string | null;
  price: number;
  promotionalPrice: number | null;
}

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 60;

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  useEffect(() => {
    const controller = new AbortController();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed.slice(0, MAX_QUERY_LENGTH))}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { items: Suggestion[] };
        setSuggestions(data.items);
        setOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function submit() {
    setOpen(false);
    if (trimmed) {
      router.push(`/recherche?q=${encodeURIComponent(trimmed.slice(0, MAX_QUERY_LENGTH))}`);
    }
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const count = suggestions?.length ?? 0;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(1, count));
      setOpen(true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + Math.max(1, count)) % Math.max(1, count));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions?.[activeIndex]) {
        const s = suggestions[activeIndex];
        router.push(`/produit/${s.slug}`);
        setOpen(false);
      } else {
        submit();
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-soft">
          <SearchIcon />
        </span>
        <input
          type="search"
          role="combobox"
          aria-expanded={open && suggestions !== null && suggestions.length > 0}
          aria-controls="search-suggestions"
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
          }
          aria-label="Rechercher un produit"
          placeholder="Rechercher un produit, une marque…"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (suggestions && suggestions.length > 0) setOpen(true);
          }}
          className="h-11 w-full rounded-xl border border-line bg-white/80 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary-dark focus:outline-none"
        />
      </div>

      {open && (loading || (suggestions && suggestions.length > 0)) ? (
        <div
          id="search-suggestions"
          role="listbox"
          aria-label="Suggestions de produits"
          className="glass absolute inset-x-0 top-[calc(100%+6px)] z-50 rounded-xl p-1.5"
        >
          {loading ? (
            <div className="space-y-2 p-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <ul>
              {suggestions!.map((s, i) => (
                <li
                  key={s.id}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                >
                  <Link
                    href={`/produit/${s.slug}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                      i === activeIndex ? "bg-primary/15" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {s.name}
                      </span>
                      {s.brandName ? (
                        <span className="block text-xs text-ink-soft">
                          {s.brandName}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-primary-dark">
                      {s.promotionalPrice ?? s.price} DH
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}