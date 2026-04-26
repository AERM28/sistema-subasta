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
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, ArrowLeft, Plus, Pencil, ToggleLeft, ToggleRight, Package } from "lucide-react";
import ObjectItemService from "@/services/ObjectItemService";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import toast from "react-hot-toast";

const BASE_IMG = import.meta.env.VITE_BASE_URL + "uploads";

function StatusBadge({ statusId }) {
    if (statusId == 1) return <Badge className="bg-green-600 text-white">Activo</Badge>;
    if (statusId == 2) return <Badge variant="outline" className="border-gray-400 text-gray-500">Inactivo</Badge>;
    return <Badge variant="secondary">{statusId}</Badge>;
}

function EmptyObjects({ isAdmin }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center border rounded-md">
            <Package className="h-12 w-12 text-muted-foreground opacity-40" />
            <div>
                <p className="font-semibold text-lg">
                    {isAdmin ? "No hay objetos registrados" : "No tenés objetos disponibles"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    {isAdmin
                        ? "Cuando los vendedores creen objetos, aparecerán aquí."
                        : "Creá un objeto para poder publicar subastas."}
                </p>
            </div>
            <Button asChild className="mt-2">
                <Link to="/object/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear objeto
                </Link>
            </Button>
        </div>
    );
}

export default function ObjectList() {
    const navigate = useNavigate();
    const { user, authorize } = useUser();
    const isAdmin = authorize(["administrador"]);

    const [objects, setObjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState({ open: false, title: "", message: "", onConfirm: null });

    const openDialog = (title, message, onConfirm) => setDialog({ open: true, title, message, onConfirm });
    const closeDialog = () => setDialog({ open: false, title: "", message: "", onConfirm: null });

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = isAdmin
                ? await ObjectItemService.getObjects()
                : await ObjectItemService.getAvailableForSeller(user.id);
            setObjects(response.data.data ?? []);
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    }, [user?.id, isAdmin]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleToggle = (obj) => {
        const accion = obj.status_id == 1 ? "desactivar" : "activar";
        const mensaje = obj.status_id == 1
            ? `¿Deseas desactivar "${obj.title}"? Solo es posible si no ha sido subastado y no tiene subasta activa.`
            : `¿Deseas activar "${obj.title}"?`;

        openDialog(`${accion.charAt(0).toUpperCase() + accion.slice(1)} objeto`, mensaje, async () => {
            try {
                const response = await ObjectItemService.toggleStatus(obj.id);
                if (response.data?.data?.error) { toast.error(response.data.data.error, { duration: 5000 }); return; }
                toast.success(`Objeto ${accion === "activar" ? "activado" : "desactivado"} correctamente`);
                fetchData();
            } catch (err) {
                toast.error(err.response?.data?.message || "Error al cambiar el estado", { duration: 5000 });
            }
        });
    };

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar objetos" message={error} />;

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
                        <AlertDialogAction onClick={() => { closeDialog(); dialog.onConfirm?.(); }}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">{isAdmin ? "Todos los objetos" : "Mis objetos"}</h1>
                <Button asChild className="flex items-center gap-2">
                    <Link to="/object/create"><Plus className="h-4 w-4" /> Nuevo objeto</Link>
                </Button>
            </div>

            {objects.length === 0 ? <EmptyObjects isAdmin={isAdmin} /> : (
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
                                <TableRow key={obj.id} className={obj.status_id == 2 ? "opacity-60" : ""}>
                                    <TableCell>
                                        {obj.imagen?.[0]
                                            ? <img src={`${BASE_IMG}/${obj.imagen[0].image}`} alt={obj.title} className="w-12 h-12 object-contain rounded-md border" />
                                            : <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">Sin img</div>
                                        }
                                    </TableCell>
                                    <TableCell className="font-medium">{obj.title}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{obj.seller_name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {obj.categoria?.length > 0
                                                ? obj.categoria.map((cat) => <Badge key={cat.id} variant="secondary" className="text-xs">{cat.name}</Badge>)
                                                : <span className="text-xs text-muted-foreground">Sin categoría</span>
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize text-sm">{obj.item_condition}</TableCell>
                                    <TableCell><StatusBadge statusId={obj.status_id} /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <TooltipProvider><Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link to={`/object/${obj.id}`}><Eye className="h-4 w-4 text-primary" /></Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Ver detalle</TooltipContent>
                                            </Tooltip></TooltipProvider>

                                            {obj.status_id == 1 && (
                                                <TooltipProvider><Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to={`/object/${obj.id}/edit`}><Pencil className="h-4 w-4 text-yellow-500" /></Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Editar</TooltipContent>
                                                </Tooltip></TooltipProvider>
                                            )}

                                            <TooltipProvider><Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handleToggle(obj)}>
                                                        {obj.status_id == 1
                                                            ? <ToggleRight className="h-4 w-4 text-green-500" />
                                                            : <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                        }
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>{obj.status_id == 1 ? "Desactivar" : "Activar"}</TooltipContent>
                                            </Tooltip></TooltipProvider>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Button type="button" variant="outline" className="flex items-center gap-2 mt-8" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" /> Regresar
            </Button>
        </div>
    );
}