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
import {
    Eye, ArrowLeft, Plus,
    Pencil, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react";
import ObjectItemService from "@/services/ObjectItemService";
import { useEffect, useState, useCallback } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import toast from "react-hot-toast";

const BASE_IMG = import.meta.env.VITE_BASE_URL + "uploads";

function StatusBadge({ statusId, statusName }) {
    if (statusId == 1)
        return <Badge variant="default" className="bg-green-600 text-white">Activo</Badge>;
    if (statusId == 2)
        return <Badge variant="outline" className="border-gray-400 text-gray-500">Inactivo</Badge>;
    if (statusId == 3)
        return <Badge variant="destructive">Eliminado</Badge>;
    return <Badge variant="secondary">{statusName}</Badge>;
}

export default function ObjectList() {
    const navigate = useNavigate();

    const [objects, setObjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Diálogo de confirmación
    const [dialog, setDialog] = useState({
        open: false, title: "", message: "", onConfirm: null,
    });

    const openDialog = (title, message, onConfirm) =>
        setDialog({ open: true, title, message, onConfirm });

    const closeDialog = () =>
        setDialog({ open: false, title: "", message: "", onConfirm: null });

    // ── Cargar objetos ────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ObjectItemService.getObjects();
            setObjects(response.data.data || []);
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Toggle activo/inactivo ────────────────────────────────
    const handleToggle = (obj) => {
        const accion = obj.status_id == 1 ? "desactivar" : "activar";
        openDialog(
            `${accion.charAt(0).toUpperCase() + accion.slice(1)} objeto`,
            `¿Deseas ${accion} "${obj.title}"?`,
            async () => {
                try {
                    await ObjectItemService.toggleStatus(obj.id);
                    toast.success(`Objeto ${accion === "activar" ? "activado" : "desactivado"} correctamente`);
                    fetchData();
                } catch (err) {
                    toast.error("Error al cambiar el estado: " + err.message);
                }
            }
        );
    };

    // ── Eliminación lógica ────────────────────────────────────
    const handleDelete = (obj) => {
        openDialog(
            "Eliminar objeto",
            `¿Estás seguro de que deseas eliminar "${obj.title}"? Esta acción no se puede deshacer y el objeto no podrá usarse en subastas.`,
            async () => {
                try {
                    const response = await ObjectItemService.delete(obj.id);
                    if (response.data?.error) {
                        toast.error(response.data.error, { duration: 5000 });
                        return;
                    }
                    toast.success("Objeto eliminado correctamente");
                    fetchData();
                } catch (err) {
                    toast.error("Error al eliminar: " + err.message);
                }
            }
        );
    };

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar objetos" message={error} />;

    return (
        <div className="container mx-auto py-8">

            {/* Diálogo de confirmación */}
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

            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Objetos Subastables</h1>
                <Button asChild className="flex items-center gap-2">
                    <Link to="/object/create">
                        <Plus className="h-4 w-4" />
                        Nuevo objeto
                    </Link>
                </Button>
            </div>

            {objects.length === 0 ? (
                <EmptyState message="No se encontraron objetos registrados." />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-primary/50">
                            <TableRow>
                                <TableHead className="font-semibold w-16">Imagen</TableHead>
                                <TableHead className="font-semibold">Nombre</TableHead>
                                <TableHead className="font-semibold">Vendedor</TableHead>
                                <TableHead className="font-semibold">Categorías</TableHead>
                                <TableHead className="font-semibold">Condición</TableHead>
                                <TableHead className="font-semibold">Estado</TableHead>
                                <TableHead className="font-semibold">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {objects.map((obj) => (
                                <TableRow
                                    key={obj.id}
                                    className={obj.status_id == 3 ? "opacity-50" : ""}
                                >
                                    {/* Imagen miniatura */}
                                    <TableCell>
                                        {obj.imagen && obj.imagen[0] ? (
                                            <img
                                                src={`${BASE_IMG}/${obj.imagen[0].image}`}
                                                alt={obj.title}
                                                className="w-12 h-12 object-contain rounded-md border"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                                Sin img
                                            </div>
                                        )}
                                    </TableCell>

                                    {/* Nombre */}
                                    <TableCell className="font-medium">{obj.title}</TableCell>

                                    {/* Vendedor */}
                                    <TableCell className="text-sm text-muted-foreground">
                                        {obj.seller_name}
                                    </TableCell>

                                    {/* Categorías */}
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {obj.categoria && obj.categoria.length > 0
                                                ? obj.categoria.map((cat) => (
                                                    <Badge key={cat.id} variant="secondary" className="text-xs">
                                                        {cat.name}
                                                    </Badge>
                                                ))
                                                : <span className="text-xs text-muted-foreground">Sin categoría</span>
                                            }
                                        </div>
                                    </TableCell>

                                    {/* Condición */}
                                    <TableCell className="capitalize text-sm">
                                        {obj.item_condition}
                                    </TableCell>

                                    {/* Estado */}
                                    <TableCell>
                                        <StatusBadge
                                            statusId={obj.status_id}
                                            statusName={obj.status_name}
                                        />
                                    </TableCell>

                                    {/* Acciones */}
                                    <TableCell>
                                        <div className="flex items-center gap-1">

                                            {/* Ver detalle — siempre */}
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to={`/object/${obj.id}`}>
                                                                <Eye className="h-4 w-4 text-primary" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Ver detalle</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            {/* Editar — solo si no está eliminado */}
                                            {obj.status_id != 3 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link to={`/object/${obj.id}/edit`}>
                                                                    <Pencil className="h-4 w-4 text-yellow-500" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Editar</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                            {/* Toggle activo/inactivo — solo si no está eliminado */}
                                            {obj.status_id != 3 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleToggle(obj)}
                                                            >
                                                                {obj.status_id == 1
                                                                    ? <ToggleRight className="h-4 w-4 text-green-500" />
                                                                    : <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                                }
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {obj.status_id == 1 ? "Desactivar" : "Activar"}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                            {/* Eliminar — solo si no está eliminado */}
                                            {obj.status_id != 3 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(obj)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Eliminar</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

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
                className="flex items-center gap-2 mt-8"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}