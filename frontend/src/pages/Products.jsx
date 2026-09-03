import React, { useEffect, useState } from "react";

function Products() {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("products");

    if (savedProducts) {
      try {
        return JSON.parse(savedProducts);
      } catch (error) {
        console.error("Products loading error:", error);
      }
    }

    return [
      {
        id: 1,
        name: "Rice",
        price: 65,
        unit: "kg",
      },
      {
        id: 2,
        name: "Sugar",
        price: 50,
        unit: "kg",
      },
      {
        id: 3,
        name: "Salt",
        price: 30,
        unit: "packet",
      },
      {
        id: 4,
        name: "Wheat",
        price: 55,
        unit: "kg",
      },
    ];
  });

  const [showForm, setShowForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    unit: "piece",
  });

  // ==========================================
  // SAVE PRODUCTS TO LOCAL STORAGE
  // ==========================================
  useEffect(() => {
    localStorage.setItem(
      "products",
      JSON.stringify(products)
    );
  }, [products]);

  // ==========================================
  // ADD PRODUCT
  // ==========================================
  const addProduct = () => {
    if (
      !newProduct.name.trim() ||
      !newProduct.price
    ) {
      alert(
        "Please enter product name and price."
      );
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      price: Number(newProduct.price),
      unit: newProduct.unit,
    };

    setProducts((prev) => [
      ...prev,
      product,
    ]);

    setNewProduct({
      name: "",
      price: "",
      unit: "piece",
    });

    setShowForm(false);
  };

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================
  const removeProduct = (id) => {
    setProducts((prev) =>
      prev.filter(
        (product) => product.id !== id
      )
    );
  };

  return (
    <div className="min-h-full bg-slate-100 p-6">

      {/* HEADER */}

      <div className="mb-6">

        <p className="text-sm font-semibold text-blue-600">
          RETAIL OPERATIONS
        </p>

        <div className="mt-1 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Products
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage products used for billing.
            </p>
          </div>

          <button
            onClick={() =>
              setShowForm(!showForm)
            }
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            + Add Product
          </button>

        </div>

      </div>

      {/* ADD PRODUCT FORM */}

      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Add Product
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Product Name
              </label>

              <input
                type="text"
                placeholder="e.g. Rice"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* PRICE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Price
              </label>

              <input
                type="number"
                min="0"
                placeholder="e.g. 65"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* UNIT */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Unit
              </label>

              <select
                value={newProduct.unit}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    unit: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="kg">
                  kg
                </option>

                <option value="gram">
                  gram
                </option>

                <option value="litre">
                  litre
                </option>

                <option value="packet">
                  packet
                </option>

                <option value="piece">
                  piece
                </option>

                <option value="box">
                  box
                </option>
              </select>
            </div>

          </div>

          {/* BUTTONS */}

          <div className="mt-5 flex gap-3">

            <button
              onClick={addProduct}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Add Product
            </button>

            <button
              onClick={() =>
                setShowForm(false)
              }
              className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* PRODUCTS */}

      <div className="space-y-4">

        {products.map((product) => (

          <div
            key={product.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >

            <div className="flex items-center justify-between">

              {/* PRODUCT INFO */}

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  🛒
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    {product.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    ₹{product.price} /{" "}
                    {product.unit}
                  </p>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex items-center gap-3">

                <button
                  className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    removeProduct(product.id)
                  }
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Remove
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* EMPTY */}

      {products.length === 0 && (

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

          <div className="text-5xl">
            🛒
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No Products Added
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Click "Add Product" to add your first product.
          </p>

        </div>
      )}

    </div>
  );
}

export default Products;