import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import UserService from "@/services/UserService";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

export default function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        full_name: "",
        email: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await UserService.getUserById(id);
                const result = response.data;
                if (result.success) {
                    setUser(result.data);
                    setForm({
                        full_name: result.data.full_name,
                        email: result.data.email,
                    });
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

    const validate = () => {
        const newErrors = {};
        if (!form.full_name.trim()) {
            newErrors.full_name = "El nombre completo es requerido.";
        } else if (form.full_name.trim().length < 3) {
            newErrors.full_name = "El nombre debe tener al menos 3 caracteres.";
        } else if (form.full_name.trim().length > 150) {
            newErrors.full_name = "El nombre no puede superar 150 caracteres.";
        }

        if (!form.email.trim()) {
            newErrors.email = "El correo electrónico es requerido.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "El correo electrónico no tiene un formato válido.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo al escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        setSaveError(null);
        try {
            await UserService.updateUser(id, form);
            navigate(`/user/${id}`);
        } catch (err) {
            setSaveError(err.message || "Error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar usuario" message={error} />;

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Editar Usuario</h1>

            {saveError && (
                <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
                    {saveError}
                </div>
            )}

            {/* Campos editables */}
            <div className="rounded-md border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Información editable</h2>
                <div className="flex flex-col gap-4">

                    {/* Nombre completo */}
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="full_name">Nombre completo</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="Nombre completo"
                            className={errors.full_name ? "border-destructive" : ""}
                        />
                        {errors.full_name && (
                            <p className="text-sm text-destructive">{errors.full_name}</p>
                        )}
                    </div>

                    {/* Correo */}
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
                            className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Campos de solo lectura */}
            <div className="rounded-md border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Información no editable</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Rol</p>
                        <p className="font-medium capitalize">{user.role_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant={user.status_name === "activo" ? "default" : "destructive"}>
                            {user.status_name}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de registro</p>
                        <p className="font-medium">
                            {user.date_created
                                ? new Date(user.date_created.replace(" ", "T")).toLocaleDateString("es-CR")
                                : "Sin fecha"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
                <Button asChild variant="outline" className="flex items-center gap-2">
                    <Link to="/user">
                        <ArrowLeft className="w-4 h-4" />
                        Cancelar
                    </Link>
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
            </div>
        </div>
    );
}