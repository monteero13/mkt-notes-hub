import { AppSidebar, MobileNav } from "./AppSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileNav />
      <main className="md:ml-60 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
