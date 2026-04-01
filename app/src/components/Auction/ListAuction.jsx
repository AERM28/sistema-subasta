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
    Eye, ArrowLeft, Gavel, Trophy,
    Clock, Pencil, Send, XCircle,
} from "lucide-react";
import AuctionService from "@/services/AuctionService";
import { useEffect, useState, useCallback } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import toast from "react-hot-toast";

function formatDate(dateStr) {
    if (!dateStr) return "Sin fecha";
    return new Date(dateStr.replace(" ", "T")).toLocaleDateString("es-CR");
}

function formatPrice(price) {
    return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 0,
    }).format(price);
}

function StatusBadge({ statusId }) {
    if (statusId == 1)
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Borrador</Badge>;
    if (statusId == 2)
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Programada</Badge>;
    return null;
}

export default function AuctionList() {
    const navigate = useNavigate();

    const [pending, setPending] = useState([]);
    const [active, setActive] = useState([]);
    const [finalized, setFinalized] = useState([]);
    const [tab, setTab] = useState("pending");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado para el diálogo de confirmación
    const [dialog, setDialog] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    // Cargar datos
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [resDraft, resScheduled, resActive, resFinalized] = await Promise.allSettled([
                AuctionService.getDraft(),
                AuctionService.getScheduled(),
                AuctionService.getActive(),
                AuctionService.getFinalized(),
            ]);

            const drafts = resDraft.status === "fulfilled" ? resDraft.value.data.data || [] : [];
            const scheduled = resScheduled.status === "fulfilled" ? resScheduled.value.data.data || [] : [];
            setPending([...drafts, ...scheduled]);

            setActive(resActive.status === "fulfilled" ? resActive.value.data.data || [] : []);
            setFinalized(resFinalized.status === "fulfilled" ? resFinalized.value.data.data || [] : []);
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    //Confirmación genérica 
    const openDialog = (title, message, onConfirm) => {
        setDialog({ open: true, title, message, onConfirm });
    };

    const closeDialog = () => {
        setDialog({ open: false, title: "", message: "", onConfirm: null });
    };

    //Publicar
    const handlePublish = (id) => {
        openDialog(
            "Publicar subasta",
            "La subasta quedará programada y visible. ¿Deseas continuar?",
            async () => {
                try {
                    await AuctionService.publish(id);
                    toast.success("Subasta publicada correctamente");
                    fetchData();
                } catch (err) {
                    toast.error("Error al publicar: " + err.message);
                }
            }
        );
    };

    //Cancelar
    const handleCancel = (id) => {
        openDialog(
            "Cancelar subasta",
            "Esta acción cambiará el estado de la subasta a cancelada. ¿Deseas continuar?",
            async () => {
                try {
                    await AuctionService.cancel(id);
                    toast.success("Subasta cancelada correctamente");
                    fetchData();
                } catch (err) {
                    toast.error("Error al cancelar: " + err.message);
                }
            }
        );
    };

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar subastas" message={error} />;

    return (
        <div className="container mx-auto py-8">

            {/* Diálogo de confirmación*/}
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
                <h1 className="text-3xl font-bold tracking-tight">Subastas</h1>
                <Button asChild>
                    <Link to="/auction/create">Nueva subasta</Link>
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={tab === "pending" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTab("pending")}
                >
                    <Clock className="h-4 w-4" />
                    Pendientes
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === "pending" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                        {pending.length}
                    </span>
                </Button>
                <Button
                    variant={tab === "active" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTab("active")}
                >
                    <Gavel className="h-4 w-4" />
                    Activas
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === "active" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                        {active.length}
                    </span>
                </Button>
                <Button
                    variant={tab === "finalized" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTab("finalized")}
                >
                    <Trophy className="h-4 w-4" />
                    Finalizadas
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === "finalized" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                        {finalized.length}
                    </span>
                </Button>
            </div>

            {/* Tab Pendientes*/}
            {tab === "pending" && (
                pending.length === 0 ? (
                    <EmptyState message="No hay subastas pendientes." />
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-primary/50">
                                <TableRow>
                                    <TableHead className="font-semibold">Objeto</TableHead>
                                    <TableHead className="font-semibold">Precio base</TableHead>
                                    <TableHead className="font-semibold">Fecha inicio</TableHead>
                                    <TableHead className="font-semibold">Fecha cierre</TableHead>
                                    <TableHead className="font-semibold">Estado</TableHead>
                                    <TableHead className="font-semibold">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pending.map((auction) => (
                                    <TableRow key={auction.id}>
                                        <TableCell className="font-medium">{auction.object_title}</TableCell>
                                        <TableCell>{formatPrice(auction.base_price)}</TableCell>
                                        <TableCell>{formatDate(auction.start_at)}</TableCell>
                                        <TableCell>{formatDate(auction.end_at)}</TableCell>
                                        <TableCell>
                                            <StatusBadge statusId={auction.status_id} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {/* Ver */}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link to={`/auction/${auction.id}`}>
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
                                                                <Link to={`/auction/${auction.id}/edit`}>
                                                                    <Pencil className="h-4 w-4 text-yellow-500" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Editar</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {/* Publicar*/}
                                                {auction.status_id == 1 && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => handlePublish(auction.id)}>
                                                                    <Send className="h-4 w-4 text-blue-500" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Publicar</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}

                                                {/* Cancelar */}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => handleCancel(auction.id)}>
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Cancelar</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )
            )}

            {/*Tab Activas*/}
            {tab === "active" && (
                active.length === 0 ? (
                    <EmptyState message="No hay subastas activas en este momento." />
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-primary/50">
                                <TableRow>
                                    <TableHead className="font-semibold">Objeto</TableHead>
                                    <TableHead className="font-semibold">Precio base</TableHead>
                                    <TableHead className="font-semibold">Fecha inicio</TableHead>
                                    <TableHead className="font-semibold">Fecha cierre</TableHead>
                                    <TableHead className="font-semibold text-center">Pujas</TableHead>
                                    <TableHead className="font-semibold">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {active.map((auction) => (
                                    <TableRow key={auction.id}>
                                        <TableCell className="font-medium">{auction.object_title}</TableCell>
                                        <TableCell>{formatPrice(auction.base_price)}</TableCell>
                                        <TableCell>{formatDate(auction.start_at)}</TableCell>
                                        <TableCell>{formatDate(auction.end_at)}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="font-bold text-primary text-lg">{auction.total_bids}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {/* Ver */}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link to={`/auction/${auction.id}`}>
                                                                    <Eye className="h-4 w-4 text-primary" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Ver detalle</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {/* Cancelar */}
                                                {auction.total_bids == 0 && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => handleCancel(auction.id)}>
                                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Cancelar</TooltipContent>
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
                )
            )}

            {/*Tab Finalizadas*/}
            {tab === "finalized" && (
                finalized.length === 0 ? (
                    <EmptyState message="No hay subastas finalizadas." />
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-primary/50">
                                <TableRow>
                                    <TableHead className="font-semibold">Objeto</TableHead>
                                    <TableHead className="font-semibold">Precio base</TableHead>
                                    <TableHead className="font-semibold">Fecha inicio</TableHead>
                                    <TableHead className="font-semibold">Fecha cierre</TableHead>
                                    <TableHead className="font-semibold text-center">Pujas</TableHead>
                                    <TableHead className="font-semibold">Estado</TableHead>
                                    <TableHead className="font-semibold">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {finalized.map((auction) => (
                                    <TableRow key={auction.id}>
                                        <TableCell className="font-medium">{auction.object_title}</TableCell>
                                        <TableCell>{formatPrice(auction.base_price)}</TableCell>
                                        <TableCell>{formatDate(auction.start_at)}</TableCell>
                                        <TableCell>{formatDate(auction.end_at)}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="font-bold text-lg">{auction.total_bids}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={auction.status_name === "finalizada" ? "secondary" : "destructive"}>
                                                {auction.status_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to={`/auction/${auction.id}`}>
                                                                <Eye className="h-4 w-4 text-primary" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Ver detalle</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )
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