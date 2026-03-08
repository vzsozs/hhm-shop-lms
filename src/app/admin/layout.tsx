import { ReactNode } from "react";
import { DesktopSidebar, AdminSidebarContent } from "@/components/admin/admin-sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { auth } from "@/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name || "Kezelő";
  return (
    <div className="fixed inset-0 flex w-full bg-admin-bg text-white overflow-hidden dark">
      <DesktopSidebar userName={userName} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header with Hamburger Menu */}
        <header className="lg:hidden flex items-center p-4 border-b border-white/5 bg-admin-bg">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 mr-4 bg-white/5 hover:bg-white/10 rounded-lg text-white">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-0 bg-admin-bg w-72">
              <SheetTitle className="sr-only">Navigációs menü</SheetTitle>
              <AdminSidebarContent userName={userName} />
            </SheetContent>
          </Sheet>
          <span className="font-bold font-mono tracking-tighter text-white">
            HHM<span className="text-brand-orange">Admin</span>
          </span>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
