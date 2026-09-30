import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedNames } from "../hooks/useLocalizedNames";
import { authFetch } from "../api";

function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const localizedProductNames = useLocalizedNames(
    products.map((product) => product.name),
    "product"
  );
  const [showForm, setShowForm] = useState(false);
  const [editingName, setEditingName] = useState(null); // null = adding, else = editing this product's original name

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "piece",
  });

  const loadProducts = async () => {
    try {
      const response = await authFetch("/products");
      const data = await response.json();
      setProducts(data.map((p) => ({ ...p, id: p._id })));
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", price: "", unit: "piece" });
    setEditingName(null);
    setShowForm(false);
  };

  const startAdding = () => {
    setFormData({ name: "", price: "", unit: "piece" });
    setEditingName(null);
    setShowForm(true);
  };

  const startEditing = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      unit: product.unit || "piece",
    });
    setEditingName(product.name);
    setShowForm(true);
  };

  const saveProduct = async () => {
    if (!formData.name.trim() || !formData.price) {
      alert(t("products.requiredFields"));
      return;
    }

    try {
      if (editingName) {
        // EDIT existing product
        const response = await authFetch(`/products/${encodeURIComponent(editingName)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            price: Number(formData.price),
            unit: formData.unit,
            tax: 0,
          }),
        });
        if (!response.ok) throw new Error("Product update failed");
      } else {
        // ADD new product
        await authFetch("/add-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            price: Number(formData.price),
            unit: formData.unit,
            tax: 0,
          }),
        });
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(t("common.saveFailed"));
    }
  };

  const removeProduct = async (name) => {
    if (!window.confirm(t("products.deleteProductConfirm", { name }))) return;

    try {
      await authFetch(`/products/${encodeURIComponent(name)}`, { method: "DELETE" });
      await loadProducts();
    } catch (error) {
      console.error("Failed to remove product:", error);
    }
  };

  return (
    <div className="min-h-full bg-slate-100 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-600">{t("nav.operations")}</p>

        <div className="mt-1 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t("products.title")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("products.subtitle")}</p>
          </div>

          <button
            onClick={startAdding}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            + {t("products.addProduct")}
          </button>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT FORM */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            {editingName ? `${t("products.editProduct")}: ${editingName}` : t("products.addProduct")}
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t("products.productName")}
              </label>
              <input
                type="text"
                placeholder={t("products.exampleRice")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{t("common.price")}</label>
              <input
                type="number"
                min="0"
                placeholder={t("products.examplePrice")}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{t("common.unit")}</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="kg">kg</option>
                <option value="gram">gram</option>
                <option value="litre">litre</option>
                <option value="packet">packet</option>
                <option value="piece">piece</option>
                <option value="box">box</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={saveProduct}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              {editingName ? t("products.saveChanges") : t("products.addProduct")}
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

      {/* PRODUCTS LIST */}
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  🛒
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {localizedProductNames[product.name] || product.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    ₹{product.price} / {product.unit || "piece"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => startEditing(product)}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  {t("common.edit")}
                </button>

                <button
                  onClick={() => removeProduct(product.name)}
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="text-5xl">🛒</div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">{t("products.noProducts")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("products.firstProduct")}
          </p>
        </div>
      )}
    </div>
  );
}

export default Products;