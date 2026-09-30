import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedNames } from "../hooks/useLocalizedNames";
import { authFetch } from "../api";

function Customers() {
  const { i18n, t } = useTranslation();

  const [customers, setCustomers] = useState([]);
  const localizedCustomerNames = useLocalizedNames(
    customers.map((customer) => customer.name),
    "person"
  );
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingPhone, setEditingPhone] = useState(null); // null = adding, else = editing this customer's original phone
  const [formData, setFormData] = useState({ name: "", phone: "" });

  // =========================
  // LOAD CUSTOMERS (real API)
  // =========================
  const loadCustomers = async () => {
    try {
      const [customersRes, billsRes] = await Promise.all([
        authFetch("/customers"),
        authFetch("/billing"),
      ]);
      const customersData = await customersRes.json();
      const billsData = await billsRes.json();

      const formatted = customersData.map((c) => {
        const customerBills = billsData.filter(
          (b) => b.customer_phone && b.customer_phone === c.phone
        );

        const totalSpent = customerBills.reduce(
          (sum, b) => sum + (b.grand_total || 0), 0
        );

        const lastPurchase = customerBills.length
          ? customerBills.reduce((latest, b) =>
            new Date(b.created_at) > new Date(latest.created_at) ? b : latest
          ).created_at
          : null;

        return {
          id: c._id,
          name: c.name,
          phone: c.phone,
          bills: customerBills.length,
          purchases: customerBills.length,
          totalSpent,
          lastPurchase,
          history: customerBills.map((b) => ({
            id: b._id,
            invoice: b._id,
            date: b.created_at,
            total: b.grand_total,
          })),
        };
      });

      setCustomers(formatted);
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomers([]);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // =========================
  // ADD / EDIT FORM HANDLERS
  // =========================

  const resetForm = () => {
    setFormData({ name: "", phone: "" });
    setEditingPhone(null);
    setShowForm(false);
  };

  const startAdding = () => {
    setFormData({ name: "", phone: "" });
    setEditingPhone(null);
    setShowForm(true);
  };

  const startEditing = (customer) => {
    setFormData({ name: customer.name, phone: customer.phone });
    setEditingPhone(customer.phone);
    setShowForm(true);
    setSelectedCustomer(null); // close view modal if open
  };

  const saveCustomer = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert(t("customers.namePhoneRequired"));
      return;
    }

    try {
      if (editingPhone) {
        // EDIT existing customer
        await authFetch(`/customers/${encodeURIComponent(editingPhone)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
          }),
        });
      } else {
        // ADD new customer
        await authFetch("/add-customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
          }),
        });
      }

      await loadCustomers();
      resetForm();
    } catch (error) {
      console.error("Failed to save customer:", error);
      alert(t("common.saveFailed"));
    }
  };

  const deleteCustomer = async (phone) => {
    if (!window.confirm(t("customers.deleteConfirm"))) return;

    try {
      await authFetch(`/customers/${encodeURIComponent(phone)}`, { method: "DELETE" });
      await loadCustomers();
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  // =========================
  // INITIAL LETTER
  // =========================
  const getInitial = (name) => {
    if (!name) return "?";
    const cleanName = String(name).trim();
    if (!cleanName) return "?";
    return cleanName.charAt(0).toUpperCase();
  };

  // =========================
  // SEARCH
  // =========================
  const normalizedSearch = search.toLocaleLowerCase();
  const filteredCustomers = customers.filter((customer) =>
    [customer?.name, localizedCustomerNames[customer?.name]]
      .some((name) => String(name || "").toLocaleLowerCase().includes(normalizedSearch))
  );

  // =========================
  // DATE / NUMBER HELPERS
  // =========================
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
    return d.toLocaleDateString(
      locale,
      { day: "2-digit", month: "short", year: "numeric" }
    );
  };

  const safeNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="w-full px-4 pb-10 pt-8 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Smart Retail POS
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("customers.title")}</h1>
            <p className="mt-2 text-slate-500">{t("customers.subtitle")}</p>
          </div>

          <button
            onClick={startAdding}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            + {t("customers.addCustomer")}
          </button>
        </div>

        {/* ADD / EDIT FORM */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              {editingPhone ? t("customers.editCustomer") : t("customers.addCustomer")}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("common.name")}</label>
                <input
                  type="text"
                  placeholder={t("customers.enterName")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("common.phone")}</label>
                <input
                  type="text"
                  placeholder={t("customers.enterPhone")}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={saveCustomer}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                {editingPhone ? t("common.save") : t("customers.addCustomer")}
              </button>

              <button
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        )}

        {/* SEARCH */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("customers.search")}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* CUSTOMER LIST */}
        {filteredCustomers.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-4xl">👥</div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">{t("customers.noCustomers")}</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">{t("customers.noCustomersDesc")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id || customer.phone}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                      {getInitial(localizedCustomerNames[customer.name] || customer.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-slate-900">
                        {localizedCustomerNames[customer.name] || customer.name || t("customers.unknownCustomer")}
                      </h2>
                      {customer.phone && (
                        <p className="mt-1 text-sm text-slate-500">📞 {customer.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <InfoBox label={t("customers.purchases")} value={safeNumber(customer.purchases)} />
                    <InfoBox label={t("customers.bills")} value={safeNumber(customer.bills)} />
                    <InfoBox label={t("customers.totalSpent")} value={`₹${safeNumber(customer.totalSpent)}`} />
                    <InfoBox label={t("customers.lastPurchase")} value={formatDate(customer.lastPurchase)} />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                    >
                      {t("customers.viewDetails")}
                    </button>

                    <button
                      onClick={() => startEditing(customer)}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      {t("common.edit")}
                    </button>

                    <button
                      onClick={() => deleteCustomer(customer.phone)}
                      className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                  {getInitial(localizedCustomerNames[selectedCustomer.name] || selectedCustomer.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-600">{t("customers.customerDetails")}</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {localizedCustomerNames[selectedCustomer.name] || selectedCustomer.name}
                  </h2>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-slate-500">📞 {selectedCustomer.phone}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="grid shrink-0 gap-4 border-b bg-slate-50 p-6 sm:grid-cols-3">
              <InfoBox label={t("customers.bills")} value={safeNumber(selectedCustomer.bills)} />
              <InfoBox label={t("customers.purchases")} value={safeNumber(selectedCustomer.purchases)} />
              <InfoBox label={t("customers.totalSpent")} value={`₹${safeNumber(selectedCustomer.totalSpent)}`} />
            </div>

            <div className="overflow-y-auto p-6">
              <h3 className="mb-4 text-lg font-bold text-slate-900">{t("customers.purchaseHistory")}</h3>

              {!selectedCustomer.history || selectedCustomer.history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  {t("customers.noHistory")}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCustomer.history.slice().reverse().map((bill, index) => (
                    <div key={bill.id || index} className="rounded-xl border border-slate-200 p-4">
                      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                          <p className="font-bold text-slate-900">
                            {t("customers.invoice")}: {bill.invoice || `INV-${index + 1}`}
                          </p>
                          <p className="text-sm text-slate-500">{formatDate(bill.date)}</p>
                        </div>
                        <p className="text-lg font-bold text-blue-600">₹{safeNumber(bill.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-slate-200 p-5">
              <div className="flex gap-3">
                <button
                  onClick={() => startEditing(selectedCustomer)}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 font-medium text-blue-600 hover:bg-blue-100"
                >
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => deleteCustomer(selectedCustomer.phone)}
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 font-medium text-red-600 hover:bg-red-100"
                >
                  {t("common.delete")}
                </button>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="min-w-[100px] rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default Customers;