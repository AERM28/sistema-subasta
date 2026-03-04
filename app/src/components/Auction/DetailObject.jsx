import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import ObjectItemService from "@/services/ObjectItemService";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

const BASE_IMG = import.meta.env.VITE_BASE_URL + "uploads";

export default function DetailObject() {
    const { id } = useParams();
    const [object, setObject] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ObjectItemService.getObjectDetail(id);
                console.log(response);
                const result = response.data;
                console.log(result);
                if (result.success) {
                    setObject(result.data);
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
    if (error) return <ErrorAlert title="Error al cargar objeto" message={error} />;
    if (!object) return <ErrorAlert title="Objeto no encontrado" message="El objeto solicitado no existe." />;

    return (
        <div className="container mx-auto py-8 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Detalle del Objeto</h1>

            {/* Imágenes */}
            <div className="rounded-md border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Imágenes</h2>
                <div className="flex flex-wrap gap-4">
                    {object.images && object.images.length > 0 ? (
                        object.images.map((img) => (
                            <div key={img.id} className="aspect-[4/3] bg-white overflow-hidden rounded-md border">
                                <img
                                    src={`${BASE_IMG}/${img.image}`}
                                    alt={object.title}
                                    className="w-full h-full object-contain object-center"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="h-48 w-48 bg-muted rounded-md flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>

            {/* Información del objeto */}
            <div className="rounded-md border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Información del objeto</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="font-medium">{object.title}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Descripción</p>
                        <p className="font-medium">{object.description}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Categorías</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {object.categories && object.categories.length > 0 ? (
                                object.categories.map((cat) => (
                                    <Badge key={cat.id} variant="secondary">{cat.name}</Badge>
                                ))
                            ) : (
                                <span className="text-sm">Sin categoría</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Condición</p>
                        <p className="font-medium capitalize">{object.item_condition}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant={object.status_name === "activo" ? "default" : "destructive"}>
                            {object.status_name}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de registro</p>
                        <p className="font-medium">
                            {object.date_created
                                ? new Date(object.date_created.replace(" ", "T")).toLocaleDateString("es-CR")
                                : "Sin fecha"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Propietario</p>
                        <p className="font-medium">{object.seller_name}</p>
                    </div>
                </div>
            </div>

            {/* Historial de subastas */}
            <div className="rounded-md border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Historial de subastas</h2>
                {object.auction_history && object.auction_history.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 font-semibold">ID</th>
                                <th className="text-left py-2 font-semibold">Fecha inicio</th>
                                <th className="text-left py-2 font-semibold">Fecha cierre</th>
                                <th className="text-left py-2 font-semibold">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {object.auction_history.map((auction) => (
                                <tr key={auction.id} className="border-b last:border-0">
                                    <td className="py-2">#{auction.id}</td>
                                    <td className="py-2">
                                        {new Date(auction.start_at.replace(" ", "T")).toLocaleDateString("es-CR")}
                                    </td>
                                    <td className="py-2">
                                        {new Date(auction.end_at.replace(" ", "T")).toLocaleDateString("es-CR")}
                                    </td>
                                    <td className="py-2">
                                        <Badge
                                            variant={
                                                auction.status_name === "activa" ? "default" :
                                                    auction.status_name === "finalizada" ? "secondary" :
                                                        "destructive"
                                            }
                                        >
                                            {auction.status_name}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-muted-foreground">Este objeto no ha participado en subastas.</p>
                )}
            </div>

            <Button asChild className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90">
                <Link to="/object">
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Link>
            </Button>
        </div>
    );
}