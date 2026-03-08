import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Gavel } from "lucide-react";
import AuctionService from "@/services/AuctionService";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

const BASE_IMG = import.meta.env.VITE_BASE_URL + "uploads/";

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

export default function DetailAuction() {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await AuctionService.getAuctionDetail(id);
                console.log(response);
                const result = response.data;
                console.log(result);
                if (result.success) {
                    setAuction(result.data);
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
    }, [id]);

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar subasta" message={error} />;
    if (!auction) return <ErrorAlert title="Subasta no encontrada" message="La subasta solicitada no existe." />;

    const obj = auction.object;

    return (
        <div className="container mx-auto py-8 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Detalle de Subasta</h1>

            {/* Objeto asociado */}
            <div className="rounded-md border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Objeto subastado</h2>
                <div className="flex gap-6">
                    {/* Imagen */}
                    <div className="h-48 w-48 shrink-0 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
                        {obj?.images && obj.images.length > 0 ? (
                            <img
                                src={`${BASE_IMG}/${obj.images[0].image}`}
                                alt={obj?.title}
                                className="w-full h-full object-contain object-center"
                            />
                        ) : (
                            <Package className="h-12 w-12 text-muted-foreground" />
                        )}
                    </div>
                    {/* Info objeto */}
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="font-semibold text-lg">{obj?.title}</p>

                        <p className="text-sm text-muted-foreground">Categorías</p>
                        <div className="flex flex-wrap gap-1">
                            {obj?.categories && obj.categories.length > 0 ? (
                                obj.categories.map((cat) => (
                                    <Badge key={cat.id} variant="secondary">{cat.name}</Badge>
                                ))
                            ) : (
                                <span className="text-sm">Sin categoría</span>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground">Condición</p>
                        <p className="font-medium capitalize">{obj?.item_condition}</p>

                        <p className="text-sm text-muted-foreground">Vendedor</p>
                        <p className="font-medium">{auction.seller_name}</p>
                    </div>
                </div>
            </div>

            {/* Datos de la subasta */}
            <div className="rounded-md border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Información de la subasta</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant={
                            auction.status_name === "activa" ? "default" :
                                auction.status_name === "finalizada" ? "secondary" :
                                    "destructive"
                        }>
                            {auction.status_name}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total de pujas</p>
                        <p className="text-2xl font-bold text-primary">{auction.total_bids}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                        <p className="font-medium">{formatDate(auction.start_at)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de cierre</p>
                        <p className="font-medium">{formatDate(auction.end_at)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Precio base</p>
                        <p className="font-medium">{formatPrice(auction.base_price)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Incremento mínimo</p>
                        <p className="font-medium">{formatPrice(auction.min_increment)}</p>
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
                <Button asChild className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90">
                    <Link to="/auction">
                        <ArrowLeft className="w-4 h-4" />
                        Regresar
                    </Link>
                </Button>
                <Button asChild className="flex items-center gap-2">
                    <Link to={`/auction/${id}/bids`}>
                        <Gavel className="w-4 h-4" />
                        Ver pujas
                    </Link>
                </Button>
            </div>
        </div>
    );
}