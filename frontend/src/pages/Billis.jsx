import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

function Bills() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBills = async () => {
        try {
            const response = await fetch(`${API_BASE}/billing`);
            const data = await response.json();
            setBills(data);
        } catch (error) {
            console.error("Failed to load bills:", error);
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBills();
    }, []);

    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen w-full bg-slate-100 p-6">
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Retail Operations
                </p>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">Bills</h1>
                <p className="mt-1 text-sm text-slate-500">All saved bills from the database.</p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading...</p>
            ) : bills.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <div className="text-5xl">🧾</div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">No bills saved yet</h2>
                </div>
            ) : (
                <div className="space-y-4">
                    {bills.slice().reverse().map((bill) => (
                        <div
                            key={bill._id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <span className="text-sm text-slate-500">{formatDate(bill.created_at)}</span>
                                <span className="text-lg font-bold text-blue-600">
                                    ₹{Number(bill.grand_total ?? bill.total ?? 0).toFixed(2)}
                                </span>
                            </div>

                            <div className="mt-3 space-y-2">
                                {(bill.items || []).map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-slate-700">
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            ₹{Number(item.total ?? 0).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Bills;