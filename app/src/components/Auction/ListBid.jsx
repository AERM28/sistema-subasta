import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BidService from "@/services/BidService";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import {
    Table, TableHeader, TableBody,
    TableRow, TableHead, TableCell,
} from "@/components/ui/table";

function formatDate(dateStr) {
    if (!dateStr) return "Sin fecha";
    return new Date(dateStr.replace(" ", "T")).toLocaleString("es-CR");
}

function formatPrice(price) {
    return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 0,
    }).format(price);
}

export default function BidList() {
    const { id } = useParams();
    const [bids, setBids] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await BidService.getByAuction(id);
                console.log(response);
                const result = response.data;
                console.log(result);
                if (result.success) {
                    setBids(result.data || []);
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
    if (error) return <ErrorAlert title="Error al cargar pujas" message={error} />;
    if (!bids || bids.length === 0)
        return (
            <div className="container mx-auto py-8 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight mb-6">Historial de Pujas</h1>
                <EmptyState message="Esta subasta no tiene pujas registradas." />
                <Button asChild className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6">
                    <Link to={`/auction/${id}`}>
                        <ArrowLeft className="w-4 h-4" />
                        Regresar
                    </Link>
                </Button>
            </div>
        );

    return (
        <div className="container mx-auto py-8 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Historial de Pujas</h1>
            <p className="text-muted-foreground mb-6">
                Subasta #{id} — {bids.length} puja{bids.length !== 1 ? "s" : ""} registrada{bids.length !== 1 ? "s" : ""}
            </p>

            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-primary/50">
                        <TableRow>
                            <TableHead className="text-left font-semibold">#</TableHead>
                            <TableHead className="text-left font-semibold">Postor</TableHead>
                            <TableHead className="text-left font-semibold">Monto</TableHead>
                            <TableHead className="text-left font-semibold">Fecha y hora</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bids.map((bid, index) => (
                            <TableRow key={bid.id}>
                                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                <TableCell className="font-medium">{bid.bidder_name}</TableCell>
                                <TableCell className="font-bold text-primary">{formatPrice(bid.amount)}</TableCell>
                                <TableCell>{formatDate(bid.created_at)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Button asChild className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6">
                <Link to={`/auction/${id}`}>
                    <ArrowLeft className="w-4 h-4" />
                    Regresar al detalle
                </Link>
            </Button>
        </div>
    );
}