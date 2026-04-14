import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft, Package, Gavel,
    Clock, Trophy, User, AlertTriangle,
} from "lucide-react";

import AuctionService from "@/services/AuctionService";
import BidService from "@/services/BidService";
import { useAuctionRealtime } from "@/hooks/useAuctionRealtime";
import { useUser } from "@/hooks/useUser";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";

const BASE_IMG = import.meta.env.VITE_BASE_URL + "uploads/";

function formatPrice(price) {
    const val = parseFloat(price) || 0;
    return new Intl.NumberFormat("es-CR", {
        style: "currency", currency: "CRC", minimumFractionDigits: 0,
    }).format(val);
}

function formatDateTime(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr.replace(" ", "T")).toLocaleString("es-CR");
}

function getTimeLeft(endAt) {
    if (!endAt) return null;
    const diff = new Date(endAt.replace(" ", "T")) - new Date();
    if (diff <= 0) return null;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
}

function getHighestBid(bids) {
    if (!bids || bids.length === 0) return null;
    return bids.reduce((max, bid) =>
        (!max || parseFloat(bid.amount) > parseFloat(max.amount)) ? bid : max, null);
}

export default function DetailBid() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useUser();

    // Ref del ID: siempre actualizado, sin problema de closure en callbacks
    const currentUserIdRef = useRef(user?.id);
    useEffect(() => { currentUserIdRef.current = user?.id; }, [user?.id]);

    // ── Estados ───────────────────────────────────────────────
    const [countdown, setCountdown] = useState(5);
    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [amount, setAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isClosed, setIsClosed] = useState(false);
    const [winner, setWinner] = useState(null);
    const [bidSurpassed, setBidSurpassed] = useState(false);

    const timerRef = useRef(null);
    const closedRef = useRef(false);
    const surpassedRef = useRef(false);

    // ── Callbacks de Pusher ───────────────────────────────────
    // Deben definirse ANTES de useAuctionRealtime y ANTES de
    // cualquier return condicional para respetar las reglas de hooks.
    const checkIfSurpassed = useCallback((newBids) => {
        const myId = currentUserIdRef.current;
        if (!myId) return;

        const topBid = getHighestBid(newBids);
        if (!topBid) return;

        // Verificar si yo tengo al menos una puja en el historial
        const iHaveBid = newBids.some(b => parseInt(b.bidder_id) === parseInt(myId));
        if (!iHaveBid) return;

        if (parseInt(topBid.bidder_id) !== parseInt(myId)) {
            if (!surpassedRef.current) {
                surpassedRef.current = true;
                setBidSurpassed(true);
                toast.error("¡Tu puja ha sido superada!", { duration: 5000 });
            }
        } else {
            surpassedRef.current = false;
            setBidSurpassed(false);
        }
    }, []);

    const onBidCreated = useCallback((data) => {
        const newBid = data.bid;
        setBids(prev => {
            const updated = [newBid, ...prev.filter(b => b.id !== newBid.id)];
            checkIfSurpassed(updated);
            return updated;
        });
        setAuction(prev => prev ? { ...prev, highest_bid: newBid } : prev);
    }, [checkIfSurpassed]);

    const onAuctionClosed = useCallback((data) => {
        setIsClosed(true);
        closedRef.current = true;
        setTimeLeft(null);
        clearInterval(timerRef.current);
        setAuction(prev => prev ? { ...prev, status_id: 4, status_name: "finalizada" } : prev);
        const winnerData = data.winner;
        if (winnerData) {
            setWinner(winnerData);
            toast.success(`Subasta finalizada. Ganador: ${winnerData.winner_name}`, { duration: 8000 });
        } else {
            toast("Subasta finalizada sin pujas.", { duration: 5000 });
        }
    }, []);

    // ── Pusher: siempre antes de cualquier return condicional ─
    useAuctionRealtime(id, { onBidCreated, onAuctionClosed });

    // ── Guard ─────────────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated) {
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { clearInterval(interval); navigate("/user/login"); }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, navigate]);

    // ── Carga inicial ─────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchData = async () => {
            try {
                const auctionRes = await AuctionService.getAuctionDetail(id);
                const data = auctionRes.data.data;
                setAuction(data);
                setBids(data.bids || []);
                const statusId = parseInt(data.status_id);
                if (statusId === 4 || statusId === 5) {
                    setIsClosed(true);
                    closedRef.current = true;
                    if (statusId === 4) {
                        try {
                            const winnerRes = await AuctionService.getWinner(id);
                            setWinner(winnerRes.data.data);
                        } catch (_) { }
                    }
                }
            } catch (err) {
                setError(err.message || "Error al cargar la subasta");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isAuthenticated]);

    // ── Contador ──────────────────────────────────────────────
    useEffect(() => {
        if (!auction || isClosed) return;
        timerRef.current = setInterval(() => {
            const left = getTimeLeft(auction.end_at);
            setTimeLeft(left);
            if (!left && !closedRef.current) {
                closedRef.current = true;
                clearInterval(timerRef.current);
                AuctionService.close(id).catch(() => { });
            }
        }, 1000);
        setTimeLeft(getTimeLeft(auction.end_at));
        return () => clearInterval(timerRef.current);
    }, [auction, isClosed, id]);

    // ── Enviar puja ───────────────────────────────────────────
    const handleBid = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) { toast.error("Ingresá un monto válido."); return; }
        setSubmitting(true);
        try {
            const response = await BidService.create({
                auction_id: parseInt(id),
                bidder_id: currentUserIdRef.current,
                amount: numAmount,
            });
            if (response.data?.error) { toast.error(response.data.error, { duration: 5000 }); return; }
            setAmount("");
            toast.success("¡Puja registrada correctamente!", { duration: 3000 });
        } catch (err) {
            toast.error("Error al registrar la puja. Intenta de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Returns condicionales: siempre al final, después de todos los hooks ──
    if (!isAuthenticated) {
        return (
            <div className="container mx-auto py-24 flex flex-col items-center gap-6 text-center">
                <div className="flex flex-col items-center gap-3 p-8 bg-muted/40 border rounded-xl max-w-sm w-full">
                    <AlertTriangle className="h-10 w-10 text-orange-500" />
                    <h2 className="text-xl font-semibold">Acceso restringido</h2>
                    <p className="text-sm text-muted-foreground">
                        Necesitás iniciar sesión para ver esta subasta.
                        Serás redirigido al login en{" "}
                        <span className="font-bold text-foreground">{countdown}</span> segundos.
                    </p>
                    <Button asChild className="w-full mt-2">
                        <Link to="/user/login">Ir al login ahora</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar subasta" message={error} />;
    if (!auction) return <ErrorAlert title="Subasta no encontrada" message="La subasta solicitada no existe." />;

    const obj = auction.object;
    const highestBid = getHighestBid(bids);
    const auctionBasePrice = parseFloat(auction.base_price) || 0;
    const auctionMinInc = parseFloat(auction.min_increment) || 0;
    const highestAmt = highestBid ? parseFloat(highestBid.amount) : auctionBasePrice;
    const isActive = parseInt(auction.status_id) === 3;
    const isSeller = parseInt(auction.seller_id) === parseInt(currentUserIdRef.current);
    const canBid = isActive && !isSeller && !!timeLeft;
    const minRequired = highestAmt + auctionMinInc;

    return (
        <div className="container mx-auto py-8 pb-16 space-y-6">

            {bidSurpassed && isActive && (
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-300 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                    <p className="text-sm font-medium text-orange-700">
                        Tu puja ha sido superada. ¡Podés ofertar de nuevo para recuperar el liderazgo!
                    </p>
                    <Button size="sm" variant="outline" className="ml-auto border-orange-400 text-orange-600"
                        onClick={() => { setBidSurpassed(false); surpassedRef.current = false; }}>
                        Cerrar
                    </Button>
                </div>
            )}

            {isClosed && (
                <div className="flex flex-col gap-3 p-5 bg-muted/60 border rounded-lg">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold">Subasta finalizada</h2>
                        <Badge variant="secondary" className="ml-auto">Finalizada</Badge>
                    </div>
                    {winner ? (
                        <p className="text-sm text-muted-foreground">
                            Ganador: <strong className="text-foreground">{winner.winner_name}</strong>
                            {" — "}Monto final: <strong className="text-foreground">{formatPrice(winner.final_price)}</strong>
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">Esta subasta finalizó sin pujas registradas.</p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-5">
                        <h2 className="text-base font-semibold mb-3">Objeto subastado</h2>
                        <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center border mb-2">
                            {obj?.images && obj.images.length > 0 ? (
                                <img src={`${BASE_IMG}${obj.images[0].image}`} alt={obj?.title} className="w-full h-full object-contain" />
                            ) : (
                                <Package className="h-16 w-16 text-muted-foreground" />
                            )}
                        </div>
                        {obj?.images && obj.images.length > 1 && (
                            <div className="flex gap-2 mb-3 overflow-x-auto">
                                {obj.images.slice(1).map((img, idx) => (
                                    <div key={img.id || `thumb-${idx}`} className="w-16 h-16 shrink-0 rounded border overflow-hidden bg-muted">
                                        <img src={`${BASE_IMG}${img.image}`} alt={`${obj?.title} ${idx + 2}`} className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <h3 className="font-semibold text-lg">{obj?.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">{obj?.description}</p>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Condición: </span>
                                <span className="capitalize font-medium">{obj?.item_condition}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Categorías: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {obj?.categories?.map((cat, idx) => (
                                        <Badge key={cat.id || `cat-${idx}`} variant="secondary" className="text-xs">{cat.name}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1 p-2 bg-muted/40 rounded-lg border">
                                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Vendedor</p>
                                    <p className="font-medium">{auction.seller_name}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Sesión activa</p>
                            <p className="text-sm font-medium">{user?.full_name || "—"}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold">Información de la subasta</h2>
                            <Badge variant={isActive ? "default" : isClosed ? "secondary" : "outline"}>
                                {auction.status_name}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Precio base</p>
                                <p className="font-semibold">{formatPrice(auction.base_price)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Incremento mínimo</p>
                                <p className="font-semibold">{formatPrice(auction.min_increment)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total de pujas</p>
                                <p className="font-semibold">{bids.length}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <p className="text-xs text-muted-foreground">Puja más alta</p>
                                <p className="text-2xl font-bold text-primary">{formatPrice(highestAmt)}</p>
                            </div>
                            <div className="p-3 bg-muted/40 border rounded-lg">
                                <p className="text-xs text-muted-foreground">Usuario líder</p>
                                {highestBid ? (
                                    <p className="font-semibold text-base truncate">
                                        {parseInt(highestBid.bidder_id) === parseInt(currentUserIdRef.current)
                                            ? `${highestBid.bidder_name} (Tú)`
                                            : highestBid.bidder_name}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Sin pujas aún</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Tiempo restante</p>
                                {isClosed ? (
                                    <p className="font-semibold text-destructive">Subasta cerrada</p>
                                ) : timeLeft ? (
                                    <p className="font-semibold tabular-nums">{timeLeft}</p>
                                ) : (
                                    <p className="font-semibold text-orange-500">Cerrando...</p>
                                )}
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-xs text-muted-foreground">Cierre</p>
                                <p className="text-sm font-medium">{formatDateTime(auction.end_at)}</p>
                            </div>
                        </div>
                    </Card>

                    {canBid && (
                        <Card className="p-5">
                            <h2 className="text-base font-semibold mb-1">Realizar puja</h2>
                            <p className="text-xs text-muted-foreground mb-4">
                                Pujando como: <strong>{user?.full_name || "—"}</strong>
                                {" · "}Mínimo requerido: <strong>{formatPrice(minRequired)}</strong>
                            </p>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label htmlFor="bid-amount" className="text-sm">Monto de tu puja (₡)</Label>
                                    <Input
                                        id="bid-amount"
                                        type="number"
                                        min={isNaN(minRequired) ? 0 : minRequired}
                                        step={isNaN(auctionMinInc) ? 1 : auctionMinInc}
                                        placeholder={`Mín. ${formatPrice(minRequired || 0)}`}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="mt-1"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={handleBid}
                                        disabled={submitting || !amount || isNaN(parseFloat(amount))}
                                        className="flex items-center gap-2">
                                        <Gavel className="h-4 w-4" />
                                        {submitting ? "Enviando..." : "Pujar"}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {isActive && isSeller && (
                        <div className="flex items-center gap-3 p-4 bg-muted/40 border rounded-lg">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                Sos el vendedor de esta subasta. No podés realizar pujas.
                            </p>
                        </div>
                    )}

                    <Card className="p-5">
                        <h2 className="text-base font-semibold mb-4">
                            Historial de pujas
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({bids.length} {bids.length === 1 ? "puja" : "pujas"})
                            </span>
                        </h2>
                        {bids.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Gavel className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Aún no hay pujas en esta subasta.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {[...bids]
                                    .sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0))
                                    .map((bid, idx) => (
                                        <div key={bid.id || `bid-${idx}`}
                                            className={`flex items-center justify-between p-3 rounded-lg border text-sm
                                                ${idx === 0 ? "bg-primary/5 border-primary/30" : "bg-muted/20"}
                                                ${parseInt(bid.bidder_id) === parseInt(currentUserIdRef.current) ? "ring-1 ring-primary/40" : ""}
                                            `}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                {idx === 0 && <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />}
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">
                                                        {parseInt(bid.bidder_id) === parseInt(currentUserIdRef.current)
                                                            ? `${bid.bidder_name} (Tú)`
                                                            : bid.bidder_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{formatDateTime(bid.created_at)}</p>
                                                </div>
                                            </div>
                                            <p className={`font-semibold ml-4 shrink-0 ${idx === 0 ? "text-primary" : ""}`}>
                                                {formatPrice(bid.amount)}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Button asChild variant="outline" className="flex items-center gap-2 w-fit">
                <Link to="/explorar">
                    <ArrowLeft className="w-4 h-4" />
                    Regresar a subastas activas
                </Link>
            </Button>
        </div>
    );
}