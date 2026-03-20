import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft, User, AlertCircle, Info } from "lucide-react";

import AuctionService from "@/services/AuctionService";
import { CustomInputField } from "../ui/custom/custom-input-field";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { LoadingGrid } from "../ui/custom/LoadingGrid";

const auctionSchema = yup.object({
    start_at: yup
        .string()
        .required("La fecha de inicio es requerida")
        .test("start-future", "La fecha de inicio debe ser futura", (value) => {
            if (!value) return true;
            return new Date(value) > new Date();
        }),
    end_at: yup
        .string()
        .required("La fecha de cierre es requerida")
        .test("end-after-start", "La fecha de cierre debe ser posterior a la de inicio", function (value) {
            const { start_at } = this.parent;
            if (!start_at || !value) return true;
            return new Date(value) > new Date(start_at);
        }),
    base_price: yup
        .number()
        .typeError("El precio base debe ser un numero")
        .required("El precio base es requerido")
        .moreThan(0, "El precio base debe ser mayor a 0"),
    min_increment: yup
        .number()
        .typeError("El incremento minimo debe ser un numero")
        .required("El incremento minimo es requerido")
        .moreThan(0, "El incremento minimo debe ser mayor a 0"),
});

function toDatetimeLocal(dateStr) {
    if (!dateStr) return "";
    return dateStr.replace(" ", "T").slice(0, 16);
}

export function EditAuction() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [blockedByStart, setBlockedByStart] = useState(false);
    const [blockedByBids, setBlockedByBids] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            start_at: "",
            end_at: "",
            base_price: "",
            min_increment: "",
        },
        resolver: yupResolver(auctionSchema),
    });

    const watchStart = watch("start_at");
    const watchEnd = watch("end_at");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await AuctionService.getAuctionDetail(id);
                const data = res.data.data;
                setAuction(data);

                setBlockedByStart(new Date(data.start_at) <= new Date());
                setBlockedByBids(data.bids && data.bids.length > 0);

                reset({
                    start_at: toDatetimeLocal(data.start_at),
                    end_at: toDatetimeLocal(data.end_at),
                    base_price: data.base_price,
                    min_increment: data.min_increment,
                });
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, reset]);

    const onSubmit = async (dataForm) => {
        setSubmitting(true);
        try {
            const response = await AuctionService.update(id, {
                start_at: dataForm.start_at,
                end_at: dataForm.end_at,
                base_price: dataForm.base_price,
                min_increment: dataForm.min_increment,
            });

            if (response.data?.error) {
                toast.error(response.data.error, { duration: 5000 });
                return;
            }

            toast.success("Subasta actualizada correctamente", { duration: 3000 });
            navigate("/auction");
        } catch (err) {
            toast.error("Error al actualizar la subasta. Intenta de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar la subasta" message={error} />;

    // Bloqueado por inicio
    if (blockedByStart) return (
        <Card className="p-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="rounded-full bg-destructive/10 p-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">No se puede editar esta subasta</h2>
                <p className="text-muted-foreground">
                    Esta subasta ya inicio el <strong>{new Date(auction.start_at).toLocaleString("es-CR")}</strong>.
                    Una vez iniciada no puede modificarse.
                </p>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 mt-2"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Button>
            </div>
        </Card>
    );

    // Bloqueado por pujas
    if (blockedByBids) return (
        <Card className="p-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="rounded-full bg-destructive/10 p-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">No se puede editar esta subasta</h2>
                <p className="text-muted-foreground">
                    Esta subasta ya tiene <strong>{auction.bids.length} puja(s)</strong> registradas.
                    No es posible modificarla una vez que hay pujas activas.
                </p>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 mt-2"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Button>
            </div>
        </Card>
    );

    return (
        <Card className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Editar Subasta</h2>
            <p className="text-sm text-muted-foreground mb-6">
                Solo podes modificar las fechas, el precio base y el incremento minimo.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Vendedor*/}
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Vendedor</p>
                        <p className="text-sm font-medium">{auction?.seller_name || "—"}</p>
                    </div>
                </div>

                {/* Objeto*/}
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <div>
                        <p className="text-xs text-muted-foreground">Objeto subastado</p>
                        <p className="text-sm font-medium">{auction?.object_title || "—"}</p>
                    </div>
                </div>

                {/* Estado actual*/}
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <div>
                        <p className="text-xs text-muted-foreground">Estado actual</p>
                        <Badge
                            variant="outline"
                            className={`mt-1 ${auction?.status_id == 1
                                ? "border-yellow-500 text-yellow-600"
                                : "border-blue-500 text-blue-600"
                                }`}
                        >
                            {auction?.status_name || "—"}
                        </Badge>
                    </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Controller
                            name="start_at"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Fecha y hora de inicio"
                                    type="datetime-local"
                                    error={errors.start_at?.message}
                                />
                            )}
                        />
                    </div>
                    <div>
                        <Controller
                            name="end_at"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Fecha y hora de cierre"
                                    type="datetime-local"
                                    error={errors.end_at?.message}
                                />
                            )}
                        />
                        {watchStart && watchEnd && new Date(watchEnd) <= new Date(watchStart) && !errors.end_at && (
                            <p className="text-sm text-red-500 mt-1">
                                La fecha de cierre debe ser posterior a la de inicio
                            </p>
                        )}
                    </div>
                </div>

                {/* Precio e incremento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Controller
                            name="base_price"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Precio base"
                                    type="number"
                                    min="1"
                                    placeholder="Ej: 50000"
                                    error={errors.base_price?.message}
                                />
                            )}
                        />
                    </div>
                    <div>
                        <Controller
                            name="min_increment"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Incremento minimo"
                                    type="number"
                                    min="1"
                                    placeholder="Ej: 5000"
                                    error={errors.min_increment?.message}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Nota informativa */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                        El objeto y el vendedor no pueden modificarse. Si necesitas cambiarlos, cancela esta subasta y crea una nueva.
                    </p>
                </div>

                {/* Acciones */}
                <div className="flex justify-between gap-4 mt-6">
                    <Button
                        type="button"
                        variant="default"
                        className="flex items-center gap-2 bg-accent text-white"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Regresar
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={submitting}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {submitting ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>

            </form>
        </Card>
    );
}