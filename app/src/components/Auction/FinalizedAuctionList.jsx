import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Package, AlertTriangle } from "lucide-react";
import AuctionService from "@/services/AuctionService";
import { useUser } from "@/hooks/useUser";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";

const BASE_IMG = import.meta.env.VITE_BASE_URL + "uploads/";

function formatPrice(price) {
    return new Intl.NumberFormat("es-CR", {
        style: "currency", currency: "CRC", minimumFractionDigits: 0,
    }).format(price);
}

function formatDateTime(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr.replace(" ", "T")).toLocaleString("es-CR");
}

export default function FinalizedAuctionList() {
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();

    const [countdown, setCountdown] = useState(5);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Guard 
    useEffect(() => {
        if (!isAuthenticated) {
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { clearInterval(interval); navigate("/user/login"); }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, navigate]);

    // ── Carga de subastas finalizadas ─────────────────────────
    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchData = async () => {
            try {
                const res = await AuctionService.getOnlyFinalized();
                setAuctions(res.data.data || []);
            } catch (err) {
                setError(err.message || "Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto py-24 flex flex-col items-center gap-6 text-center">
                <div className="flex flex-col items-center gap-3 p-8 bg-muted/40 border rounded-xl max-w-sm w-full">
                    <AlertTriangle className="h-10 w-10 text-orange-500" />
                    <h2 className="text-xl font-semibold">Acceso restringido</h2>
                    <p className="text-sm text-muted-foreground">
                        Necesitás iniciar sesión para ver las subastas.
                        Serás redirigido al login en{" "}
                        <span className="font-bold text-foreground">{countdown}</span> segundos.
                    </p>
                    <Button asChild className="w-full mt-2">
                        <Link to="/user/login">Ir al login ahora</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar subastas" message={error} />;

    return (
        <div className="container mx-auto py-8 pb-16">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subastas Finalizadas</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {auctions.length} {auctions.length === 1 ? "subasta finalizada" : "subastas finalizadas"}
                    </p>
                </div>
            </div>

            {auctions.length === 0 ? (
                <EmptyState message="No hay subastas finalizadas aún." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {auctions.map((auction) => (
                        <Card key={auction.id} className="flex flex-col overflow-hidden">

                            {/* Imagen */}
                            <div className="w-full h-44 bg-black flex items-center justify-center border-b overflow-hidden">
                                {auction.first_image ? (
                                    <img
                                        src={BASE_IMG + auction.first_image}
                                        alt={auction.object_title}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <Package className="h-12 w-12 text-muted-foreground opacity-40" />
                                )}
                            </div>

                            <div className="flex flex-col flex-1 p-4 gap-3">

                                {/* Título y vendedor */}
                                <div>
                                    <h2 className="font-semibold text-base leading-tight truncate">
                                        {auction.object_title}
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        Vendedor: {auction.seller_name}
                                    </p>
                                </div>

                                {/* Precio base y estado */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Precio base</p>
                                        <p className="font-semibold text-primary text-lg">
                                            {formatPrice(auction.base_price)}
                                        </p>
                                    </div>
                                    <Badge variant={auction.status_name === "finalizada" ? "secondary" : "destructive"}>
                                        {auction.status_name}
                                    </Badge>
                                </div>

                                {/* Total pujas y fecha cierre */}
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-1.5 p-2 bg-muted/40 rounded-lg">
                                        <Trophy className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground leading-none">Pujas</p>
                                            <p className="font-semibold">{auction.total_bids}</p>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-muted/40 rounded-lg">
                                        <p className="text-xs text-muted-foreground leading-none">Cierre</p>
                                        <p className="font-semibold text-xs tabular-nums">
                                            {formatDateTime(auction.end_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Botón */}
                                <Button asChild variant="outline" className="w-full mt-auto flex items-center gap-2">
                                    <Link to={`/auction/detail/${auction.id}`}>
                                        <Trophy className="h-4 w-4 text-yellow-500" />
                                        Ver resultado
                                    </Link>
                                </Button>

                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}