import { Link } from "react-router-dom";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, ArrowLeft, Pencil, Lock, Unlock } from "lucide-react";
import UserService from "@/services/UserService";
import { useEffect, useState } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";

const userColumns = [
    { key: "full_name", label: "Nombre completo" },
    { key: "role_name", label: "Rol" },
    { key: "status_name", label: "Estado" },
    { key: "actions", label: "Acciones" },
];

export default function TableUsers() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await UserService.getUsers();
                const result = response.data;
                if (result.success) {
                    setUsers(result.data || []);
                } else {
                    setError(result.message || "Error desconocido");
                }
            } catch (err) {
                setError(err.message || "Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleStatus = async (user) => {
        const newStatusId = user.status_name === "activo" ? 2 : 1;
        try {
            await UserService.toggleStatus(user.id, newStatusId);
            setUsers(prev => prev.map(u =>
                u.id === user.id
                    ? { ...u, status_id: newStatusId, status_name: newStatusId === 1 ? "activo" : "bloqueado" }
                    : u
            ));
        } catch (err) {
            console.error("Error al cambiar estado:", err);
        }
    };

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar usuarios" message={error} />;
    if (!users || users.length === 0)
        return <EmptyState message="No se encontraron usuarios en el sistema." />;

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    Listado de Usuarios
                </h1>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-primary/50">
                        <TableRow>
                            {userColumns.map((col) => (
                                <TableHead key={col.key} className="text-left font-semibold">
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.full_name}</TableCell>
                                <TableCell>{user.role_name}</TableCell>
                                <TableCell>
                                    <Badge variant={user.status_name === "activo" ? "default" : "destructive"}>
                                        {user.status_name}
                                    </Badge>
                                </TableCell>
                                <TableCell className="flex justify-start items-center gap-1">

                                    {/* Ver detalle */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link to={`/user/${user.id}`}>
                                                        <Eye className="h-4 w-4 text-primary" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Ver detalles</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Editar */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link to={`/user/${user.id}/edit`}>
                                                        <Pencil className="h-4 w-4 text-blue-400" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Editar usuario</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Bloquear / Activar */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    {user.status_name === "activo"
                                                        ? <Lock className="h-4 w-4 text-destructive" />
                                                        : <Unlock className="h-4 w-4 text-green-400" />
                                                    }
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {user.status_name === "activo" ? "Bloquear usuario" : "Activar usuario"}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Button
                type="button"
                className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}