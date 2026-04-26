import { useEffect, useState } from "react";
import AuctionService from "@/services/AuctionService";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { LoadingGrid } from "../ui/custom/LoadingGrid";

export default function ReportBySeller() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await AuctionService.reportBySeller();
                if (response?.data?.data) {
                    setData(response.data.data);
                } else {
                    throw new Error("Respuesta vacía del servidor");
                }
            } catch (err) {
                toast.error("Error al cargar el reporte");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingGrid type="grid" />;

    const chartData = data.map((item) => ({
        vendedor: item.seller_name,
        subastas: parseInt(item.total_auctions),
    }));

    return (
        <div className="container mx-auto py-8 space-y-6">
            <h1 className="text-2xl font-bold">Reporte: Subastas por Vendedor</h1>

            {/* Gráfico de barras */}
            <Card>
                <CardHeader>
                    <CardTitle>Total de subastas creadas por vendedor</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer>
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="vendedor"
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend verticalAlign="top" />
                                <Bar
                                    dataKey="subastas"
                                    name="Total de subastas"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla resumen */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalle por vendedor</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-4">Vendedor</th>
                                <th className="text-right py-2 px-4">Total de subastas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, idx) => (
                                <tr key={idx} className="border-b hover:bg-muted/30">
                                    <td className="py-2 px-4">{item.seller_name}</td>
                                    <td className="py-2 px-4 text-right font-semibold">{item.total_auctions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}