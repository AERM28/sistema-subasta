import Header from "./Header";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import UserProvider from "@/context/UserProvider";
 
export function Layout() {
  return (
    <UserProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pt-16 pb-16">
          <Toaster position="top-right" />
          <Outlet />
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
}