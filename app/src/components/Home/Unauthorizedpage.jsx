// src/pages/UnauthorizedPage.jsx
import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <ShieldOff className="h-16 w-16 text-destructive opacity-70" />
      <h1 className="text-3xl font-bold">Acceso denegado</h1>
      <p className="text-muted-foreground max-w-sm">
        No tienes permisos para acceder a esta sección.
        Si crees que es un error, contacta al administrador.
      </p>
      <Link
        to="/"
        className="mt-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/80 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}