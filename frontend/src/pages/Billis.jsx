import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedNames } from "../hooks/useLocalizedNames";
import { authFetch } from "../api";

function Bills() {
    const { i18n, t } = useTranslation();
    const [bills, setBills] = useState([]);
    const localizedProductNames = useLocalizedNames(
        bills.flatMap((bill) => (bill.items || []).map((item) => item.name)),
        "product"
    );
    const localizedCustomerNames = useLocalizedNames(
        bills.map((bill) => bill.customer_name || bill.customer),
        "person"
    );
    const [loading, setLoading] = useState(true);
    const [editingBill, setEditingBill] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadBills = async () => {
        try {
            const response = await authFetch("/billing");
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

    const startEditing = (bill) => {
        setEditingBill({
            id: bill._id,
            customer: bill.customer_name || bill.customer || "",
            items: (bill.items || []).map((item) => ({
                name: item.name,
                quantity: item.quantity,
            })),
        });
    };

    const updateQuantity = (index, quantity) => {
        setEditingBill((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, quantity } : item
            ),
        }));
    };

    const saveBill = async () => {
        const items = editingBill.items
            .map((item) => ({ name: item.name, quantity: Number(item.quantity) }))
            .filter((item) => item.quantity > 0);

        if (!items.length) {
            alert(t("bills.mustHaveItem"));
            return;
        }

        setSaving(true);
        try {
            const response = await authFetch(`/billing/${encodeURIComponent(editingBill.id)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer: editingBill.customer.trim() || null,
                    items,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.detail || "Failed to update bill.");
            }
            setEditingBill(null);
            await loadBills();
        } catch (error) {
            console.error("Failed to update bill:", error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteBill = async (billId) => {
        if (!window.confirm(t("common.deleteConfirm"))) return;

        try {
            const response = await authFetch(`/billing/${encodeURIComponent(billId)}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.detail || "Failed to delete bill.");
            }
            setBills((current) => current.filter((bill) => bill._id !== billId));
        } catch (error) {
            console.error("Failed to delete bill:", error);
            alert(error.message);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return "-";
        const locale = {
            en: "en-IN",
            hi: "hi-IN",
            mr: "mr-IN",
            ta: "ta-IN",
            bn: "bn-IN",
            te: "te-IN",
        }[i18n.resolvedLanguage] || "en-IN";
        return d.toLocaleString(locale, {
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
                    {t("nav.operations")}
                </p>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">{t("bills.title")}</h1>
                <p className="mt-1 text-sm text-slate-500">{t("bills.subtitle")}</p>
            </div>

            {loading ? (
                <p className="text-slate-500">{t("common.loading")}</p>
            ) : bills.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <div className="text-5xl">🧾</div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">{t("bills.noBills")}</h2>
                </div>
            ) : (
                <div className="space-y-4">
                    {bills.slice().reverse().map((bill) => (
                        <div
                            key={bill._id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <p className="font-semibold text-slate-800">
                                        {localizedCustomerNames[bill.customer_name || bill.customer] ||
                                            bill.customer_name || bill.customer || t("bills.walkIn")}
                                    </p>
                                    <span className="text-sm text-slate-500">{formatDate(bill.created_at)}</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">
                                    ₹{Number(bill.grand_total ?? bill.total ?? 0).toFixed(2)}
                                </span>
                            </div>

                            <div className="mt-3 space-y-2">
                                {(bill.items || []).map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-slate-700">
                                            {localizedProductNames[item.name] || item.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            ₹{Number(item.total ?? 0).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                                <button
                                    type="button"
                                    onClick={() => startEditing(bill)}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    {t("common.edit")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteBill(bill._id)}
                                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                >
                                    {t("common.delete")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">{t("bills.editBill")}</h2>
                            <button
                                type="button"
                                onClick={() => setEditingBill(null)}
                                className="text-2xl text-slate-500 hover:text-slate-900"
                                aria-label="Close edit bill dialog"
                            >
                                ×
                            </button>
                        </div>

                        <label className="mt-5 block text-sm font-semibold text-slate-700">
                            {t("common.customer")}
                            <input
                                value={editingBill.customer}
                                onChange={(event) =>
                                    setEditingBill((current) => ({
                                        ...current,
                                        customer: event.target.value,
                                    }))
                                }
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500"
                            />
                        </label>

                        <div className="mt-4 space-y-3">
                            {editingBill.items.map((item, index) => (
                                <div key={`${item.name}-${index}`} className="flex items-center gap-3">
                                    <span className="flex-1 text-sm text-slate-700">{item.name}</span>
                                    <input
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        value={item.quantity}
                                        onChange={(event) => updateQuantity(index, event.target.value)}
                                        className="w-28 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setEditingBill(null)}
                                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={saveBill}
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? t("common.loading") : t("common.save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Bills;