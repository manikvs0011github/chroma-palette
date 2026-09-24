import { Link, useRouterState } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Picker" },
  { to: "/palettes", label: "Palettes" },
  { to: "/converter", label: "Converter" },
] as const;

export function NavBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg shadow"
            style={{
              background: "conic-gradient(from 0deg, #ff5b5b, #ffd24a, #4ade80, #38bdf8, #a78bfa, #ff5b5b)",
            }}
          />
          <span className="font-display text-lg font-semibold tracking-tight">
            Chroma
          </span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 text-sm">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors sm:px-4 ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
