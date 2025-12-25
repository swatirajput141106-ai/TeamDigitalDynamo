import { Link, useLocation } from "wouter";
import { Activity, ShieldCheck, LayoutDashboard } from "lucide-react";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-tight text-foreground">SmartQueue</span>
            <span className="text-xs text-muted-foreground font-medium">Citizen Services</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/">
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
              ${location === '/' 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'}
            `}>
              <ShieldCheck className="w-4 h-4" />
              <span>Services</span>
            </div>
          </Link>
          <Link href="/admin">
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
              ${location.startsWith('/admin') 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'}
            `}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin</span>
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}
