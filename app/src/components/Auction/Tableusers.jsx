import { Link, useNavigate } from "react-router-dom";
import {
    Table, TableHeader, TableBody,
    TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip, TooltipContent,
    TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, ArrowLeft, Pencil, Lock, Unlock } from "lucide-react";
import UserService from "@/services/UserService";
import { useEffect, useState, useCallback } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import toast from "react-hot-toast";

function StatusBadge({ statusName }) {
    if (statusName === "activo")
        return <Badge className="bg-green-600 text-white">Activo</Badge>;
    return <Badge variant="destructive">Bloqueado</Badge>;
}

export default function TableUsers() {
    const navigate = useNavigate();

    const [users, setUsers]     = useState([]);
    const [error, setError]     = useState(null);
    const [loading, setLoading] = useState(true);

    const [dialog, setDialog] = useState({
        open: false, title: "", message: "", onConfirm: null,
    });

    const openDialog = (title, message, onConfirm) =>
        setDialog({ open: true, title, message, onConfirm });

    const closeDialog = () =>
        setDialog({ open: false, title: "", message: "", onConfirm: null });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await UserService.getUsers();
            setUsers(response.data.data || []);
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleToggleStatus = (user) => {
        const accion = user.status_name === "activo" ? "bloquear" : "activar";
        openDialog(
            `${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario`,
            `¿Deseas ${accion} a "${user.full_name}"? ${
                accion === "bloquear"
                    ? "El usuario no podrá acceder al sistema mientras esté bloqueado."
                    : "El usuario podrá volver a acceder al sistema."
            }`,
            async () => {
                const newStatusId = user.status_name === "activo" ? 2 : 1;
                try {
                    await UserService.toggleStatus(user.id, newStatusId);
                    toast.success(
                        `Usuario ${accion === "activar" ? "activado" : "bloqueado"} correctamente`
                    );
                    fetchData();
                } catch (err) {
                    toast.error("Error al cambiar el estado: " + err.message);
                }
            }
        );
    };

    if (loading) return <LoadingGrid type="grid" />;
    if (error)   return <ErrorAlert title="Error al cargar usuarios" message={error} />;

    return (
        <div className="container mx-auto py-8">

            <AlertDialog open={dialog.open} onOpenChange={closeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>{dialog.message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDialog}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                closeDialog();
                                dialog.onConfirm?.();
                            }}
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
            </div>

            {users.length === 0 ? (
                <EmptyState message="No se encontraron usuarios en el sistema." />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-primary/50">
                            <TableRow>
                                <TableHead className="font-semibold">Nombre completo</TableHead>
                                <TableHead className="font-semibold">Rol</TableHead>
                                <TableHead className="font-semibold">Estado</TableHead>
                                <TableHead className="font-semibold">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.full_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {user.role_name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge statusName={user.status_name} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">

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
                                                    <TooltipContent>Ver detalle</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            {/* Editar */}
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to={`/user/${user.id}/edit`}>
                                                                <Pencil className="h-4 w-4 text-yellow-500" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Editar</TooltipContent>
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
                                                                ? <Lock className="h-4 w-4 text-red-500" />
                                                                : <Unlock className="h-4 w-4 text-green-500" />
                                                            }
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {user.status_name === "activo" ? "Bloquear" : "Activar"}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 mt-6"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}