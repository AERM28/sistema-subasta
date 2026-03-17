import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { Save, ArrowLeft, User, AlertCircle } from "lucide-react";

import CategoryService from "@/services/CategoryService";
import ObjectItemService from "@/services/ObjectItemService";

import { CustomMultiSelect } from "../ui/custom/custom-multiple-select";
import { CustomInputField } from "../ui/custom/custom-input-field";
import { CustomSelect } from "../ui/custom/custom-select";

const CONDITIONS = [
    { id: "nuevo", name: "Nuevo" },
    { id: "usado", name: "Usado" },
];

const OBJECT_STATUSES = [
    { id: "1", name: "Activo" },
    { id: "2", name: "Inactivo" },
];

export function EditObject() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [dataCategories, setDataCategories] = useState([]);
    const [object, setObject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [blockedByAuction, setBlockedByAuction] = useState(false);

    const objectSchema = yup.object({
        title: yup.string()
            .required("El nombre es requerido")
            .min(3, "El nombre debe tener mínimo 3 caracteres")
            .max(120, "El nombre no puede superar 120 caracteres"),
        description: yup.string()
            .required("La descripción es requerida")
            .min(20, "La descripción debe tener al menos 20 caracteres"),
        item_condition: yup.string()
            .required("La condición es requerida"),
        status_id: yup.string()
            .required("El estado es requerido"),
        categories: yup.array()
            .min(1, "Debe seleccionar al menos una categoría"),
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            item_condition: "",
            status_id: "",
            categories: [],
        },
        resolver: yupResolver(objectSchema),
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [objectRes, categoriesRes] = await Promise.all([
                    ObjectItemService.getObjectDetail(id),
                    CategoryService.getAll(),
                ]);

                const obj = objectRes.data.data;
                setObject(obj);
                setDataCategories(categoriesRes.data.data || []);

                const tieneSubastaActiva = obj.auction_history?.some(
                    (a) => a.status_name === "activa"
                );
                setBlockedByAuction(tieneSubastaActiva);

                reset({
                    title: obj.title,
                    description: obj.description,
                    item_condition: obj.item_condition,
                    status_id: String(obj.status_id),
                    categories: obj.categories
                        ? obj.categories.map((c) => String(c.id))
                        : [],
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
        try {
            const response = await ObjectItemService.updateObjectItem({
                id: id,
                title: dataForm.title,
                description: dataForm.description,
                item_condition: dataForm.item_condition,
                status_id: dataForm.status_id,
                categories: dataForm.categories,
                seller_id: object.seller_id,
            });

            if (response.data?.error) {
                toast.error(response.data.error);
                return;
            }

            if (response.data) {
                toast.success("Objeto actualizado correctamente", { duration: 3000 });
                navigate("/object");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error al actualizar el objeto");
        }
    };

    if (loading) return <p className="text-muted-foreground p-6">Cargando...</p>;
    if (error) return <p className="text-red-600 p-6">{error}</p>;

    if (blockedByAuction) return (
        <Card className="p-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="rounded-full bg-destructive/10 p-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">No se puede editar este objeto</h2>
                <p className="text-muted-foreground">
                    Este objeto tiene una subasta activa. Solo podés editarlo cuando no esté en subasta.
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
            <h2 className="text-2xl font-bold mb-6">Editar Objeto</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Vendedor</p>
                        <p className="text-sm font-medium">{object?.seller_name || "—"}</p>
                    </div>
                </div>

                <div>
                    <Controller name="title" control={control} render={({ field }) =>
                        <CustomInputField
                            {...field}
                            label="Nombre"
                            placeholder="Nombre del objeto"
                            error={errors.title?.message}
                        />
                    } />
                </div>

                <div>
                    <Label className="block mb-1 text-sm font-medium">Descripción</Label>
                    <Controller name="description" control={control} render={({ field }) =>
                        <Textarea
                            {...field}
                            placeholder="Descripción detallada del objeto (mínimo 20 caracteres)"
                            rows={4}
                        />
                    } />
                    {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                    )}
                </div>

                <div>
                    <Label className="block mb-1 text-sm font-medium">Condición</Label>
                    <Controller name="item_condition" control={control} render={({ field }) =>
                        <CustomSelect
                            field={field}
                            data={CONDITIONS}
                            label="Condición"
                            getOptionLabel={(c) => c.name}
                            getOptionValue={(c) => c.id}
                            error={errors.item_condition?.message}
                        />
                    } />
                </div>

                <div>
                    <Label className="block mb-1 text-sm font-medium">Estado</Label>
                    <Controller name="status_id" control={control} render={({ field }) =>
                        <CustomSelect
                            field={field}
                            data={OBJECT_STATUSES}
                            label="Estado"
                            getOptionLabel={(s) => s.name}
                            getOptionValue={(s) => s.id}
                            error={errors.status_id?.message}
                        />
                    } />
                </div>

                <div>
                    <Controller name="categories" control={control} render={({ field }) =>
                        <CustomMultiSelect
                            field={field}
                            data={dataCategories}
                            label="Categorías"
                            getOptionLabel={(c) => c.name}
                            getOptionValue={(c) => c.id}
                            error={errors.categories?.message}
                        />
                    } />
                </div>

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
                    <Button type="submit" className="flex-1">
                        <Save className="w-4 h-4" />
                        Guardar cambios
                    </Button>
                </div>

            </form>
        </Card>
    );
}