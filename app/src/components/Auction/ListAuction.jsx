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
import { Eye, ArrowLeft, Gavel, Trophy } from "lucide-react";
import AuctionService from "@/services/AuctionService";
import { useEffect, useState } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";

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

export default function AuctionList() {
    const [active, setActive] = useState([]);
    const [finalized, setFinalized] = useState([]);
    const [tab, setTab] = useState("active");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resActive, resFinalized] = await Promise.all([
                    AuctionService.getActive(),
                    AuctionService.getFinalized(),
                ]);
                if (resActive.data.success) setActive(resActive.data.data || []);
                if (resFinalized.data.success) setFinalized(resFinalized.data.data || []);
            } catch (err) {
                setError(err.message || "Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar subastas" message={error} />;

    return (
        <div className="container mx-auto py-8">

            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Subastas</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={tab === "active" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTab("active")}
                >
                    <Gavel className="h-4 w-4" />
                    Activas
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === "active"
                            ? "bg-white/20 text-white"
                            : "bg-primary/10 text-primary"
                        }`}>
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
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${tab === "finalized"
                            ? "bg-white/20 text-white"
                            : "bg-primary/10 text-primary"
                        }`}>
                        {finalized.length}
                    </span>
                </Button>
            </div>

            {/* Tabla Activas */}
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
                                            <span className="font-bold text-primary text-lg">
                                                {auction.total_bids}
                                            </span>
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

            {/* Tabla Finalizadas */}
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
                                            <span className="font-bold text-lg">
                                                {auction.total_bids}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                auction.status_name === "finalizada" ? "secondary" : "destructive"
                                            }>
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
                className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}