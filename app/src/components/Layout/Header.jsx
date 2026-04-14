import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers, Gavel, Users, Package,
  Menu, X, ChevronDown, Trophy,
  User, LayoutList, CreditCard,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";
import {
  Menubar, MenubarMenu, MenubarTrigger,
  MenubarContent, MenubarItem,
} from "@/components/ui/menubar";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useUser } from "@/hooks/useUser";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, clearUser, authorize } = useUser();
  const userEmail = user?.email || "Invitado";

  // ─── Menú Explorar (comprador) ───────────────────────────
  const navItems = [
    { title: "Subastas activas", href: "/explorar", icon: <Gavel className="h-4 w-4" /> },
    { title: "Subastas finalizadas", href: "/auction/finalized", icon: <Trophy className="h-4 w-4" /> },
  ];

  // ─── Menú Mantenimientos (admin/vendedor) ─────────────────
  const mantItems = [
    { title: "Usuarios", href: "/user", icon: <Users className="h-4 w-4" /> },
    { title: "Objetos", href: "/object", icon: <Package className="h-4 w-4" /> },
    { title: "Subastas", href: "/auction", icon: <LayoutList className="h-4 w-4" /> },
    { title: "Pagos", href: "/payment", icon: <CreditCard className="h-4 w-4" /> },
  ];

  const userItems = [
    {
      title: "Login",
      href: "/user/login",
      icon: <LogIn className="h-4 w-4" />,
      show: !isAuthenticated, // solo visible si NO está autenticado
    },
    {
      title: "Registrarse",
      href: "/user/create",
      icon: <UserPlus className="h-4 w-4" />,
      show: !isAuthenticated,
    },
    {
      title: "Logout",
      href: "#login",
      icon: <LogOut className="h-4 w-4" />,
      show: isAuthenticated,
      action: clearUser,
    },
  ];

  return (
    <header className="w-full fixed top-0 left-0 z-50 backdrop-blur-xl bg-gradient-to-r from-primary/90 via-primary/70 to-primary/90 border-b border-white/10 shadow-lg">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1280px] mx-auto text-white">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-wide hover:opacity-90 transition">
          <Gavel className="h-6 w-6" />
          <span className="hidden sm:inline">SubastaSeries</span>
        </Link>

        {/* Menú escritorio */}
        <div className="hidden md:flex flex-1 justify-center">
          <Menubar className="w-auto bg-transparent border-none shadow-none space-x-6">

            {/* Explorar */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-secondary transition">
                <Gavel className="h-4 w-4" /> Explorar <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/80 backdrop-blur-xl border border-white/20 shadow-xl [&_*]:text-white">
                {navItems.map((item) => (
                  <MenubarItem key={item.href} asChild className="focus:bg-white/10 focus:text-white">
                    <Link to={item.href} className="flex items-center gap-2 py-2 px-3 rounded-md text-sm text-white hover:bg-white/10 transition">
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            {/* Mantenimientos */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-secondary transition">
                <Layers className="h-4 w-4" /> Mantenimientos <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/80 backdrop-blur-xl border border-white/20 shadow-xl [&_*]:text-white">
                {mantItems.map((item) => (
                  <MenubarItem key={item.href} asChild className="focus:bg-white/10 focus:text-white">
                    <Link to={item.href} className="flex items-center gap-2 py-2 px-3 rounded-md text-sm text-white hover:bg-white/10 transition">
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            {/* Usuario */}
            <MenubarMenu>
              <MenubarTrigger className="text-white font-medium flex items-center gap-1 hover:text-secondary transition">
                <User className="h-4 w-4" /> {userEmail}
                <ChevronDown className="h-3 w-3" />
              </MenubarTrigger>
              <MenubarContent className="bg-primary/0 backdrop-blur-md border-white/10">
                {userItems.filter(i => i.show).map(item => (
                  <MenubarItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      onClick={() => item.action && item.action()}
                      className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-accent/10 transition"
                    >
                      {item.icon} {item.title}
                    </Link>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* Menú móvil */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-primary/95 backdrop-blur-lg text-white w-72">
            <nav className="mt-8 px-4 space-y-6">
              <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                <Gavel /> SubastaSeries
              </Link>
              <div>
                <h4 className="mb-2 text-lg font-semibold flex items-center gap-2"><Gavel /> Explorar</h4>
                {navItems.map((item) => (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-md text-white/90 hover:bg-white/10 transition">
                    {item.icon} {item.title}
                  </Link>
                ))}
              </div>
              <div>
                <h4 className="mb-2 text-lg font-semibold flex items-center gap-2"><Layers /> Mantenimientos</h4>
                {mantItems.map((item) => (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-md text-white/90 hover:bg-white/10 transition">
                    {item.icon} {item.title}
                  </Link>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  );
}