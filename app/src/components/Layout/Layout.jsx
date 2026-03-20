import Header from "./Header";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="top-right" />
      <Header />
      <main className="flex-1 pt-16 pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}