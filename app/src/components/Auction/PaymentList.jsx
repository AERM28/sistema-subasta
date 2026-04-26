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
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, ArrowLeft, CreditCard } from "lucide-react";
import PaymentService from "@/services/PaymentService";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import toast from "react-hot-toast";

function formatPrice(price) {
    return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 }).format(price);
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

function EmptyPayments({ isAdmin }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center border rounded-md">
            <CreditCard className="h-12 w-12 text-muted-foreground opacity-40" />
            <div>
                <p className="font-semibold text-lg">
                    {isAdmin ? "No hay pagos registrados" : "Aún no tenés pagos registrados"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    {isAdmin
                        ? "Cuando un comprador gane una subasta, su pago aparecerá aquí."
                        : "Cuando ganes una subasta, tu pago pendiente aparecerá aquí."}
                </p>
            </div>
        </div>
    );
}

export default function PaymentList() {
    const navigate = useNavigate();
    const { user, authorize } = useUser();
    const isAdmin = authorize(["administrador"]);

    const [payments, setPayments] = useState([]);
    const [error, setError]       = useState(null);
    const [loading, setLoading]   = useState(true);
    const [dialog, setDialog]     = useState({ open: false, title: "", message: "", onConfirm: null });

    const openDialog  = (title, message, onConfirm) => setDialog({ open: true, title, message, onConfirm });
    const closeDialog = () => setDialog({ open: false, title: "", message: "", onConfirm: null });

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = isAdmin
                ? await PaymentService.getPayments()
                : await PaymentService.getByPayer(user.id);
            setPayments(response.data.data ?? []);
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    }, [user?.id, isAdmin]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleConfirm = (payment) => openDialog(
        "Confirmar pago",
        `¿Deseas confirmar el pago de ${formatPrice(payment.amount)} realizado por "${payment.payer_name}"?`,
        async () => {
            try { await PaymentService.confirm(payment.id); toast.success("Pago confirmado correctamente"); fetchData(); }
            catch (err) { toast.error("Error al confirmar el pago: " + err.message); }
        }
    );

    const handlePay = (payment) => openDialog(
        "Realizar pago",
        `¿Deseas realizar el pago de ${formatPrice(payment.amount)} para la subasta #${payment.auction_id}?`,
        async () => {
            try { await PaymentService.confirm(payment.id); toast.success("Pago realizado correctamente"); fetchData(); }
            catch (err) { toast.error("Error al realizar el pago: " + err.message); }
        }
    );

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
                        <AlertDialogAction onClick={() => { closeDialog(); dialog.onConfirm?.(); }}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">{isAdmin ? "Todos los pagos" : "Mis pagos"}</h1>
            </div>

            {payments.length === 0 ? <EmptyPayments isAdmin={isAdmin} /> : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-primary/50">
                            <TableRow>
                                <TableHead className="font-semibold">Subasta</TableHead>
                                {isAdmin && <TableHead className="font-semibold">Comprador</TableHead>}
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
                                    {isAdmin && <TableCell>{payment.payer_name}</TableCell>}
                                    <TableCell>{formatPrice(payment.amount)}</TableCell>
                                    <TableCell>{formatDate(payment.created_at)}</TableCell>
                                    <TableCell><StatusBadge statusName={payment.status_name} /></TableCell>
                                    <TableCell>
                                        {isAdmin && payment.status_name === "pendiente" && (
                                            <TooltipProvider><Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handleConfirm(payment)}>
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Confirmar pago</TooltipContent>
                                            </Tooltip></TooltipProvider>
                                        )}
                                        {!isAdmin && payment.status_name === "pendiente" && (
                                            <TooltipProvider><Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handlePay(payment)}>
                                                        <CreditCard className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Pagar</TooltipContent>
                                            </Tooltip></TooltipProvider>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Button type="button" variant="outline" className="flex items-center gap-2 mt-6" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" /> Regresar
            </Button>
        </div>
    );
}