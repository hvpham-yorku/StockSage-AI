"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Portfolio, PortfolioPerformance } from "@/lib/api";

export default function PortfolioListPage() {
    const router = useRouter();

    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [latestPortfolio, setLatestPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolios = async () => {
            try {
                const allPortfolios = await api.portfolios.getAll();
                setPortfolios(allPortfolios);

                if (allPortfolios.length > 0) {
                    const sorted = [...allPortfolios].sort(
                        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
                    );
                    setLatestPortfolio(sorted[0]);
                }
            } catch (e) {
                console.error("Failed to fetch portfolios", e);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolios();
    }, []);

    const handleCreate = () => {
        router.push("/portfolio/create");
    };

    const handleSelect = (id: string) => {
        router.push(`/portfolio/${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this portfolio?");
        if (!confirmed) return;

        try {
            await api.portfolios.delete(id);
            setPortfolios((prev) => prev.filter((p) => p.id !== id));
            if (latestPortfolio?.id === id) setLatestPortfolio(null);
        } catch (e) {
            console.error("Failed to delete portfolio", e);
            alert("Failed to delete portfolio. Please try again.");
        }
    };

    if (loading) return <div className="p-6 text-center">Loading portfolios...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Your Portfolios</h1>
                <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded">
                    + Create Portfolio
                </button>
            </div>

            {latestPortfolio && (
                <div className="border rounded-lg p-4 shadow-md bg-muted/20">
                    <h2 className="text-xl font-semibold mb-1">{latestPortfolio.name}</h2>
                    <p className="text-sm text-muted-foreground">
                        Started: {new Date(latestPortfolio.start_date).toLocaleDateString()} | Initial Balance: $
                        {latestPortfolio.initial_balance.toFixed(2)}
                    </p>
                    <button
                        onClick={() => handleSelect(latestPortfolio.id)}
                        className="mt-3 text-blue-500 underline"
                    >
                        View Latest Portfolio →
                    </button>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold mb-2">All Portfolios</h3>
                {portfolios.length === 0 ? (
                    <p className="text-muted-foreground">You haven&#39;t created any portfolios yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {portfolios.map((p) => (
                            <li
                                key={p.id}
                                className="p-3 border rounded hover:bg-muted/30 cursor-pointer flex justify-between items-center"
                            >
                                <div onClick={() => handleSelect(p.id)} className="flex-1">
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Start Date: {new Date(p.start_date).toLocaleDateString()} | Balance: ${p.initial_balance.toFixed(2)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(p.id)}
                                    className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}

                    </ul>
                )}
            </div>
        </div>
    );


}



