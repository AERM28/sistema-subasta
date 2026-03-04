import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowLeft, Package, Gavel, Trophy } from "lucide-react";
import AuctionService from "@/services/AuctionService";
import { useEffect, useState } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import PropTypes from 'prop-types';

// PropTypes de ActiveCard
ActiveCard.propTypes = {
    auction: PropTypes.shape({
        id: PropTypes.number.isRequired,
        object_title: PropTypes.string.isRequired,
        base_price: PropTypes.number.isRequired,
        total_bids: PropTypes.number.isRequired,
        start_at: PropTypes.string,
        end_at: PropTypes.string,
        main_image: PropTypes.string,
    }).isRequired
};

// PropTypes de FinalizedCard
FinalizedCard.propTypes = {
    auction: PropTypes.shape({
        id: PropTypes.number.isRequired,
        object_title: PropTypes.string.isRequired,
        end_at: PropTypes.string.isRequired,
        status_name: PropTypes.string.isRequired,
        total_bids: PropTypes.number.isRequired,
        base_price: PropTypes.number.isRequired,
    }).isRequired
};

const BASE_IMG = import.meta.env.VITE_BASE_URL + "uploads";

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

// --- Tarjeta subasta activa ---
function ActiveCard({ auction }) {
    return (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col">
            {/* Imagen */}
            <div className="h-44 bg-muted flex items-center justify-center overflow-hidden">
                {auction.main_image ? (
                    <img
                        src={BASE_IMG + auction.main_image}
                        alt={auction.object_title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                )}
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1">
                {/* Nombre objeto */}
                <h2 className="font-semibold text-lg leading-tight">{auction.object_title}</h2>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div>
                        <p className="text-muted-foreground">Inicio</p>
                        <p className="font-medium">{formatDate(auction.start_at)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Cierre</p>
                        <p className="font-medium">{formatDate(auction.end_at)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Precio base</p>
                        <p className="font-medium">{formatPrice(auction.base_price)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Pujas</p>
                        <p className="font-bold text-primary">{auction.total_bids}</p>
                    </div>
                </div>

                <div className="mt-auto pt-3">
                    <Button asChild variant="outline" size="sm" className="w-full flex items-center gap-2">
                        <Link to={`/auction/${auction.id}`}>
                            <Eye className="h-4 w-4" />
                            Ver detalle
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

// --- Tarjeta subasta finalizada ---
function FinalizedCard({ auction }) {
    return (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg leading-tight">{auction.object_title}</h2>
                    <Badge variant={auction.status_name === "finalizada" ? "secondary" : "destructive"}>
                        {auction.status_name}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                    <div>
                        <p className="text-muted-foreground">Fecha de cierre</p>
                        <p className="font-medium">{formatDate(auction.end_at)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Pujas recibidas</p>
                        <p className="font-bold">{auction.total_bids}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Precio base</p>
                        <p className="font-medium">{formatPrice(auction.base_price)}</p>
                    </div>
                </div>

                <div className="mt-auto pt-3">
                    <Button asChild variant="outline" size="sm" className="w-full flex items-center gap-2">
                        <Link to={`/auction/${auction.id}`}>
                            <Eye className="h-4 w-4" />
                            Ver detalle
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

// --- Componente principal ---
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
                console.log(resActive, resFinalized);
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

    const current = tab === "active" ? active : finalized;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Subastas</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={tab === "active" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTab("active")}
                >
                    <Gavel className="h-4 w-4" />
                    Activas ({active.length})
                </Button>
                <Button
                    variant={tab === "finalized" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTab("finalized")}
                >
                    <Trophy className="h-4 w-4" />
                    Finalizadas ({finalized.length})
                </Button>
            </div>

            {/* Listado */}
            {current.length === 0 ? (
                <EmptyState message="No hay subastas en esta categoría." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tab === "active"
                        ? current.map((a) => <ActiveCard key={a.id} auction={a} />)
                        : current.map((a) => <FinalizedCard key={a.id} auction={a} />)
                    }
                </div>
            )}

            <Button
                type="button"
                className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}