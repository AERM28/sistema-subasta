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
import { Textarea } from "@/components/ui/textarea";

import { Save, ArrowLeft, User } from "lucide-react";

import CategoryService from "@/services/CategoryService";
import ObjectItemService from "@/services/ObjectItemService";
import ObjectImageService from "@/services/ObjectImageService";

import { CustomMultiSelect } from "../ui/custom/custom-multiple-select";
import { CustomInputField } from "../ui/custom/custom-input-field";
import { CustomSelect } from "../ui/custom/custom-select";

const SIMULATED_SELLER = { id: 1, full_name: "Carlos Vendedor" };

const CONDITIONS = [
    { id: "nuevo", name: "Nuevo" },
    { id: "usado", name: "Usado" },
];

export function CreateObjectItem() {
    const navigate = useNavigate();

    const [dataCategories, setDataCategories] = useState([]);
    const [file, setFile] = useState(null);
    const [fileURL, setFileURL] = useState(null);
    const [error, setError] = useState("");
    const [imageError, setImageError] = useState("");

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
        categories: yup.array()
            .min(1, "Debe seleccionar al menos una categoría"),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            item_condition: "",
            categories: [],
        },
        resolver: yupResolver(objectSchema),
    });

    const handleChangeImage = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileURL(URL.createObjectURL(selectedFile));
            setImageError("");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesRes = await CategoryService.getAll();
                setDataCategories(categoriesRes.data.data || []);
            } catch (error) {
                if (error.name !== "AbortError") setError(error.message);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (dataForm) => {
        if (!file) {
            setImageError("Debes seleccionar al menos una imagen para el objeto.");
            return;
        }

        try {
            const response = await ObjectItemService.createObjectItem({
                title: dataForm.title,
                description: dataForm.description,
                item_condition: dataForm.item_condition,
                categories: dataForm.categories,
                seller_id: SIMULATED_SELLER.id,
                status_id: 1,
            });

            if (response.data) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("object_id", response.data.data.id);
                await ObjectImageService.upload(formData);

                toast.success(
                    `Objeto creado: ${response.data.data.id} - ${response.data.data.title}`,
                    { duration: 3000 }
                );
                navigate("/object");
            } else if (response.error) {
                setError(response.error);
            }
        } catch (err) {
            console.error(err);
            setError("Error al crear el objeto");
        }
    };

    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <Card className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Crear Objeto</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Vendedor asignado</p>
                        <p className="text-sm font-medium">{SIMULATED_SELLER.full_name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <div>
                        <p className="text-xs text-muted-foreground">Estado inicial</p>
                        <Badge variant="default" className="mt-1">Activo</Badge>
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
                    <Controller name="categories" control={control} render={({ field }) =>
                        <CustomMultiSelect
                            field={field}
                            data={dataCategories}
                            label="Categorías"
                            getOptionLabel={(c) => c.name}
                            getOptionValue={(c) => c.id}
                            error={errors.categories?.message}
                            placeholder="Seleccione categorías"
                        />
                    } />
                </div>

                <div className="mb-6">
                    <Label htmlFor="object-image" className="block mb-1 text-sm font-medium">
                        Imagen
                    </Label>
                    <div
                        className={`relative w-56 h-56 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors ${imageError ? "border-destructive" : "border-muted/50"
                            }`}
                        onClick={() => document.getElementById("object-image").click()}
                    >
                        {!fileURL && (
                            <div className="text-center px-4">
                                <p className="text-sm text-muted-foreground">Haz clic o arrastra una imagen</p>
                                <p className="text-xs text-muted-foreground">(jpg, png, máximo 2MB)</p>
                            </div>
                        )}
                        {fileURL && (
                            <img
                                src={fileURL}
                                alt="preview"
                                className="w-full h-full object-contain rounded-lg shadow-sm"
                            />
                        )}
                    </div>
                    {imageError && (
                        <p className="text-sm text-destructive mt-1">{imageError}</p>
                    )}
                    <input
                        type="file"
                        id="object-image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleChangeImage}
                    />
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
                        Guardar
                    </Button>
                </div>

            </form>
        </Card>
    );
}