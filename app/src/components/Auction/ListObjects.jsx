import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowLeft, Package } from "lucide-react";
import ObjectItemService from "@/services/ObjectItemService";
import { useEffect, useState } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";

const BASE_IMG = import.meta.env.VITE_BASE_URL + "uploads";

export default function ObjectList() {
    const [objects, setObjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ObjectItemService.getObjects();
                console.log(response);
                const result = response.data;
                console.log(result);
                if (result.success) {
                    setObjects(result.data || []);
                    console.log("imagen[0]:", objects[0]?.imagen?.[0]);
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
    }, []);

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar objetos" message={error} />;
    if (!objects || objects.length === 0)
        return <EmptyState message="No se encontraron objetos registrados." />;

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    Objetos Subastables
                </h1>
            </div>

            {/* Tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {objects.map((obj) => (
                    <div key={obj.id} className="rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col">

                        {/* Imagen */}
                        <div className="aspect-[4/3] bg-white overflow-hidden">
                            <img
                                src={`${BASE_IMG}/${obj.imagen[0].image}`}
                                alt={obj.title}
                                className="w-full h-full object-contain object-center"
                            />
                        </div>

                        {/* Contenido */}
                        <div className="p-4 flex flex-col gap-2 flex-1">

                            {/* Nombre */}
                            <h2 className="font-semibold text-lg leading-tight">{obj.title}</h2>

                            {/* Categorías */}
                            <div className="flex flex-wrap gap-1">
                                {obj.categoria && obj.categoria.length > 0
                                    ? obj.categoria.map((cat) => (
                                        <Badge key={cat.id} variant="secondary" className="text-xs">
                                            {cat.name} {/* ajusta el campo según tu modelo */}
                                        </Badge>
                                    ))
                                    : <span className="text-xs text-muted-foreground">Sin categoría</span>
                                }
                            </div>

                            {/* Dueño */}
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Vendedor: </span>
                                {obj.seller_name}
                            </p>

                            {/* Botón detalle */}
                            <div className="mt-auto pt-3">
                                <Button asChild variant="outline" size="sm" className="w-full flex items-center gap-2">
                                    <Link to={`/object/${obj.id}`}>
                                        <Eye className="h-4 w-4" />
                                        Ver detalle
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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