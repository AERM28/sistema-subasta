import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UserService from "@/services/UserService";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

export default function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await UserService.getUserDetail(id);
                console.log(response);
                const result = response.data;
                console.log(result);
                setUser(result.data);
            } catch (err) {
                setError(err.message || "Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar usuario" message={error} />;
    if (!user) return <ErrorAlert title="Usuario no encontrado" message="El usuario solicitado no existe." />;

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight mb-6">
                Detalle de Usuario
            </h1>

            {/* Información básica */}
            <div className="rounded-md border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Información del perfil</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Nombre completo</p>
                        <p className="font-medium">{user.full_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Correo electrónico</p>
                        <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Rol</p>
                        <p className="font-medium">{user.role_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge
                            variant={user.status_name === "activo" ? "default" : "destructive"}
                        >
                            {user.status_name}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de registro</p>
                        <p className="font-medium">
                            {user.date_created
                                ? new Date(user.date_created.replace(" ", "T")).toLocaleDateString("es-CR")
                                : "Sin fecha"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Campos calculados */}
            <div className="rounded-md border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Historial</h2>
                <div className="grid grid-cols-2 gap-4">
                    {/* Solo muestra subastas creadas si es vendedor o administrador */}
                    {(user.role_name === "vendedor" || user.role_name === "administrador") && (
                        <div>
                            <p className="text-sm text-muted-foreground">Subastas creadas</p>
                            <p className="text-2xl font-bold">{user.total_auctions_created}</p>
                        </div>
                    )}
                    {/* Solo muestra pujas realizadas si es comprador */}
                    {user.role_name === "comprador" && (
                        <div>
                            <p className="text-sm text-muted-foreground">Pujas realizadas</p>
                            <p className="text-2xl font-bold">{user.total_bids_placed}</p>
                        </div>
                    )}
                </div>
            </div>

            <Button asChild className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90">
                <Link to="/user">
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Link>
            </Button>
        </div>
    );
}