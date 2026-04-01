import { useNavigate } from "react-router-dom";
import {
    Table, TableHeader, TableBody,
    TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip, TooltipContent,
    TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, ArrowLeft } from "lucide-react";
import PaymentService from "@/services/PaymentService";
import { useEffect, useState, useCallback } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import toast from "react-hot-toast";

function formatPrice(price) {
    return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 0,
    }).format(price);
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr.replace(" ", "T")).toLocaleDateString("es-CR");
}

function StatusBadge({ statusName }) {
    if (statusName === "confirmado")
        return <Badge className="bg-green-600 text-white">Confirmado</Badge>;
    return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pendiente</Badge>;
}

export default function PaymentList() {
    const navigate = useNavigate();

    const [payments, setPayments] = useState([]);
    const [error, setError]       = useState(null);
    const [loading, setLoading]   = useState(true);

    const [dialog, setDialog] = useState({
        open: false, title: "", message: "", onConfirm: null,
    });

    const openDialog = (title, message, onConfirm) =>
        setDialog({ open: true, title, message, onConfirm });

    const closeDialog = () =>
        setDialog({ open: false, title: "", message: "", onConfirm: null });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await PaymentService.getPayments();
            setPayments(response.data.data || []);
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleConfirm = (payment) => {
        openDialog(
            "Confirmar pago",
            `¿Deseas confirmar el pago de ${formatPrice(payment.amount)} realizado por "${payment.payer_name}"?`,
            async () => {
                try {
                    await PaymentService.confirm(payment.id);
                    toast.success("Pago confirmado correctamente");
                    fetchData();
                } catch (err) {
                    toast.error("Error al confirmar el pago: " + err.message);
                }
            }
        );
    };

    if (loading) return <LoadingGrid type="grid" />;
    if (error)   return <ErrorAlert title="Error al cargar pagos" message={error} />;

    return (
        <div className="container mx-auto py-8">

            <AlertDialog open={dialog.open} onOpenChange={closeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>{dialog.message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDialog}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                closeDialog();
                                dialog.onConfirm?.();
                            }}
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
            </div>

            {payments.length === 0 ? (
                <EmptyState message="No se encontraron pagos registrados." />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-primary/50">
                            <TableRow>
                                <TableHead className="font-semibold">Subasta</TableHead>
                                <TableHead className="font-semibold">Comprador</TableHead>
                                <TableHead className="font-semibold">Monto</TableHead>
                                <TableHead className="font-semibold">Fecha</TableHead>
                                <TableHead className="font-semibold">Estado</TableHead>
                                <TableHead className="font-semibold">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">#{payment.auction_id}</TableCell>
                                    <TableCell>{payment.payer_name}</TableCell>
                                    <TableCell>{formatPrice(payment.amount)}</TableCell>
                                    <TableCell>{formatDate(payment.created_at)}</TableCell>
                                    <TableCell>
                                        <StatusBadge statusName={payment.status_name} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {payment.status_name === "pendiente" && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleConfirm(payment)}
                                                            >
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Confirmar pago</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 mt-6"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}