import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft, User, Info } from "lucide-react";

import AuctionService from "@/services/AuctionService";
import ObjectItemService from "@/services/ObjectItemService";
import { CustomInputField } from "../ui/custom/custom-input-field";
import { CustomSelect } from "../ui/custom/custom-select";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { LoadingGrid } from "../ui/custom/LoadingGrid";

// ─── Variable lógica simulada ────────────────────────────────
const SIMULATED_SELLER = { id: 1, full_name: "Carlos Vendedor" };
// ─────────────────────────────────────────────────────────────

const auctionSchema = yup.object({
    object_id: yup
        .number()
        .typeError("Debe seleccionar un objeto activo")
        .required("El objeto es requerido"),
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

export function CreateAuction() {
    const navigate = useNavigate();

    const [dataObjects, setDataObjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            object_id: "",
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
                const res = await ObjectItemService.getObjects();
                const activos = (res.data.data || []).filter((o) => o.status_id == 1);
                setDataObjects(activos);
            } catch (err) {
                setError("No se pudieron cargar los objetos disponibles");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (dataForm) => {
        setSubmitting(true);
        try {
            const response = await AuctionService.create({
                object_id: dataForm.object_id,
                start_at: dataForm.start_at,
                end_at: dataForm.end_at,
                base_price: dataForm.base_price,
                min_increment: dataForm.min_increment,
                seller_id: SIMULATED_SELLER.id,
            });

            if (response.data?.error) {
                toast.error(response.data.error, { duration: 5000 });
                return;
            }

            toast.success("Subasta creada como borrador. Podes publicarla cuando estes listo.", {
                duration: 4000,
            });
            navigate("/auction");
        } catch (err) {
            toast.error("Error al crear la subasta. Intenta de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar datos" message={error} />;

    return (
        <Card className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Crear Subasta</h2>
            <p className="text-sm text-muted-foreground mb-6">
                La subasta se guardara como <strong>borrador</strong>. Podras editarla y publicarla desde el listado.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Vendedor asignado */}
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Vendedor asignado</p>
                        <p className="text-sm font-medium">{SIMULATED_SELLER.full_name}</p>
                    </div>
                </div>

                {/* Estado inicial */}
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <div>
                        <p className="text-xs text-muted-foreground">Estado inicial</p>
                        <Badge variant="outline" className="mt-1 border-yellow-500 text-yellow-600">
                            Borrador
                        </Badge>
                    </div>
                </div>

                {/* Objeto */}
                <div>
                    <Label className="block mb-1 text-sm font-medium">Objeto a subastar</Label>
                    {dataObjects.length === 0 ? (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Info className="h-4 w-4 text-yellow-600 shrink-0" />
                            <p className="text-sm text-yellow-700">
                                No tenes objetos activos disponibles. Crea un objeto primero.
                            </p>
                        </div>
                    ) : (
                        <Controller
                            name="object_id"
                            control={control}
                            render={({ field }) => (
                                <CustomSelect
                                    field={field}
                                    data={dataObjects}
                                    label="Objeto"
                                    getOptionLabel={(o) => o.title}
                                    getOptionValue={(o) => o.id}
                                    error={errors.object_id?.message}
                                />
                            )}
                        />
                    )}
                    {errors.object_id && (
                        <p className="text-sm text-red-500 mt-1">{errors.object_id.message}</p>
                    )}
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
                        La subasta se guarda como borrador. Para que sea visible a los compradores, debes publicarla desde el listado.
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
                        disabled={submitting || dataObjects.length === 0}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {submitting ? "Guardando..." : "Guardar borrador"}
                    </Button>
                </div>

            </form>
        </Card>
    );
}