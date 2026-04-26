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
import { Eye, ArrowLeft, Gavel, Trophy, Clock, Pencil, Send, XCircle, Plus } from "lucide-react";
import AuctionService from "@/services/AuctionService";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import toast from "react-hot-toast";

function formatDate(dateStr) {
    if (!dateStr) return "Sin fecha";
    return new Date(dateStr.replace(" ", "T")).toLocaleDateString("es-CR");
}
function formatPrice(price) {
    return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 }).format(price);
}
function StatusBadge({ statusId }) {
    if (statusId == 1) return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Borrador</Badge>;
    if (statusId == 2) return <Badge variant="outline" className="border-blue-500 text-blue-600">Programada</Badge>;
    return null;
}

function EmptyAuctions({ tab, isAdmin }) {
    const messages = {
        pending: {
            title: isAdmin ? "No hay subastas pendientes" : "No tenés subastas pendientes",
            desc:  isAdmin ? "Las subastas en borrador o programadas aparecerán aquí." : "Creá una subasta para empezar.",
            cta: true,
        },
        active: {
            title: "No hay subastas activas",
            desc:  "Cuando una subasta publicada llegue a su fecha de inicio, aparecerá aquí.",
            cta: false,
        },
        finalized: {
            title: "No hay subastas finalizadas",
            desc:  "Las subastas cerradas o canceladas aparecerán aquí.",
            cta: false,
        },
    };
    const m = messages[tab];
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center border rounded-md">
            <Gavel className="h-12 w-12 text-muted-foreground opacity-40" />
            <div>
                <p className="font-semibold text-lg">{m.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
            </div>
            {m.cta && (
                <Button asChild className="mt-2">
                    <Link to="/auction/create"><Plus className="h-4 w-4 mr-2" />Crear subasta</Link>
                </Button>
            )}
        </div>
    );
}

export default function AuctionList() {
    const navigate = useNavigate();
    const { user, authorize } = useUser();
    const isAdmin = authorize(["administrador"]);

    const [pending, setPending]     = useState([]);
    const [active, setActive]       = useState([]);
    const [finalized, setFinalized] = useState([]);
    const [tab, setTab]             = useState("pending");
    const [error, setError]         = useState(null);
    const [loading, setLoading]     = useState(true);
    const [dialog, setDialog]       = useState({ open: false, title: "", message: "", onConfirm: null });

    const openDialog  = (title, message, onConfirm) => setDialog({ open: true, title, message, onConfirm });
    const closeDialog = () => setDialog({ open: false, title: "", message: "", onConfirm: null });

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const [resDraft, resScheduled, resActive, resFinalized] = await Promise.allSettled([
                    AuctionService.getDraft(),
                    AuctionService.getScheduled(),
                    AuctionService.getActive(),
                    AuctionService.getFinalized(),
                ]);
                const drafts    = resDraft.status     === "fulfilled" ? resDraft.value.data.data     ?? [] : [];
                const scheduled = resScheduled.status === "fulfilled" ? resScheduled.value.data.data ?? [] : [];
                setPending([...drafts, ...scheduled]);
                setActive(resActive.status       === "fulfilled" ? resActive.value.data.data     ?? [] : []);
                setFinalized(resFinalized.status === "fulfilled" ? resFinalized.value.data.data  ?? [] : []);
            } else {
                const res = await AuctionService.getBySeller(user.id);
                const all = res.data.data ?? [];
                setPending(all.filter(a => a.status_id == 1 || a.status_id == 2));
                setActive(all.filter(a => a.status_id == 3));
                setFinalized(all.filter(a => a.status_id == 4 || a.status_id == 5));
            }
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    }, [user?.id, isAdmin]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handlePublish = (id) => openDialog(
        "Publicar subasta",
        "La subasta quedará programada y visible. ¿Deseas continuar?",
        async () => {
            try { await AuctionService.publish(id); toast.success("Subasta publicada correctamente"); fetchData(); }
            catch (err) { toast.error("Error al publicar: " + err.message); }
        }
    );

    const handleCancel = (id) => openDialog(
        "Cancelar subasta",
        "Esta acción cambiará el estado de la subasta a cancelada. ¿Deseas continuar?",
        async () => {
            try { await AuctionService.cancel(id); toast.success("Subasta cancelada correctamente"); fetchData(); }
            catch (err) { toast.error("Error al cancelar: " + err.message); }
        }
    );

    if (loading) return <LoadingGrid type="grid" />;
    if (error)   return <ErrorAlert title="Error al cargar subastas" message={error} />;

    const tabs = [
        { key: "pending",   label: "Pendientes",  icon: <Clock  className="h-4 w-4" />, count: pending.length },
        { key: "active",    label: "Activas",      icon: <Gavel  className="h-4 w-4" />, count: active.length },
        { key: "finalized", label: "Finalizadas",  icon: <Trophy className="h-4 w-4" />, count: finalized.length },
    ];

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
                <h1 className="text-3xl font-bold tracking-tight">{isAdmin ? "Todas las subastas" : "Mis subastas"}</h1>
                <Button asChild><Link to="/auction/create">Nueva subasta</Link></Button>
            </div>

            <div className="flex gap-2 mb-6">
                {tabs.map(({ key, label, icon, count }) => (
                    <Button key={key} variant={tab === key ? "default" : "outline"} className="flex items-center gap-2" onClick={() => setTab(key)}>
                        {icon} {label}
                        <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === key ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>{count}</span>
                    </Button>
                ))}
            </div>

            {/* Tab Pendientes */}
            {tab === "pending" && (
                pending.length === 0 ? <EmptyAuctions tab="pending" isAdmin={isAdmin} /> : (
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
                                        <TableCell><StatusBadge statusId={auction.status_id} /></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <TooltipProvider><Tooltip>
                                                    <TooltipTrigger asChild><Button variant="ghost" size="icon" asChild><Link to={`/auction/${auction.id}`}><Eye className="h-4 w-4 text-primary" /></Link></Button></TooltipTrigger>
                                                    <TooltipContent>Ver detalle</TooltipContent>
                                                </Tooltip></TooltipProvider>
                                                <TooltipProvider><Tooltip>
                                                    <TooltipTrigger asChild><Button variant="ghost" size="icon" asChild><Link to={`/auction/${auction.id}/edit`}><Pencil className="h-4 w-4 text-yellow-500" /></Link></Button></TooltipTrigger>
                                                    <TooltipContent>Editar</TooltipContent>
                                                </Tooltip></TooltipProvider>
                                                {auction.status_id == 1 && (
                                                    <TooltipProvider><Tooltip>
                                                        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handlePublish(auction.id)}><Send className="h-4 w-4 text-blue-500" /></Button></TooltipTrigger>
                                                        <TooltipContent>Publicar</TooltipContent>
                                                    </Tooltip></TooltipProvider>
                                                )}
                                                <TooltipProvider><Tooltip>
                                                    <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleCancel(auction.id)}><XCircle className="h-4 w-4 text-red-500" /></Button></TooltipTrigger>
                                                    <TooltipContent>Cancelar</TooltipContent>
                                                </Tooltip></TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )
            )}

            {/* Tab Activas */}
            {tab === "active" && (
                active.length === 0 ? <EmptyAuctions tab="active" isAdmin={isAdmin} /> : (
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
                                        <TableCell className="text-center"><span className="font-bold text-primary text-lg">{auction.total_bids}</span></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <TooltipProvider><Tooltip>
                                                    <TooltipTrigger asChild><Button variant="ghost" size="icon" asChild><Link to={`/auction/${auction.id}`}><Eye className="h-4 w-4 text-primary" /></Link></Button></TooltipTrigger>
                                                    <TooltipContent>Ver detalle</TooltipContent>
                                                </Tooltip></TooltipProvider>
                                                {auction.total_bids == 0 && (
                                                    <TooltipProvider><Tooltip>
                                                        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleCancel(auction.id)}><XCircle className="h-4 w-4 text-red-500" /></Button></TooltipTrigger>
                                                        <TooltipContent>Cancelar</TooltipContent>
                                                    </Tooltip></TooltipProvider>
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

            {/* Tab Finalizadas */}
            {tab === "finalized" && (
                finalized.length === 0 ? <EmptyAuctions tab="finalized" isAdmin={isAdmin} /> : (
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
                                        <TableCell className="text-center"><span className="font-bold text-lg">{auction.total_bids}</span></TableCell>
                                        <TableCell>
                                            <Badge variant={auction.status_name === "finalizada" ? "secondary" : "destructive"}>{auction.status_name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <TooltipProvider><Tooltip>
                                                <TooltipTrigger asChild><Button variant="ghost" size="icon" asChild><Link to={`/auction/${auction.id}`}><Eye className="h-4 w-4 text-primary" /></Link></Button></TooltipTrigger>
                                                <TooltipContent>Ver detalle</TooltipContent>
                                            </Tooltip></TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )
            )}

            <Button type="button" variant="outline" className="flex items-center gap-2 mt-6" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" /> Regresar
            </Button>
        </div>
    );
}