import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

export default function RegisterAsset() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/org/categories").then((res) => setCategories(res.data)).catch(() => {});
    api.get("/org/departments").then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post("/assets", values);
      toast.success(`Asset registered as ${data.assetTag}`);
      navigate(`/assets/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not register asset");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg text-ink-50 mb-1">Register New Asset</h2>
        <p className="text-sm text-ink-400 mb-6">Asset tag is generated automatically on save (e.g. AF-0115).</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Asset Name</label>
            <input className="input" placeholder="Dell Latitude 5420" {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-xs text-maroon-400 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" {...register("category", { required: "Category is required" })}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-maroon-400 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label">Serial Number</label>
              <input className="input" placeholder="DL5420-2291" {...register("serialNumber")} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Condition</label>
              <select className="input" {...register("condition")}>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" {...register("department")}>
                <option value="">Unassigned</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Purchase Date</label>
              <input type="date" className="input" {...register("purchaseDate")} />
            </div>
            <div>
              <label className="label">Warranty Expiry</label>
              <input type="date" className="input" {...register("warrantyExpiry")} />
            </div>
          </div>

          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="Bangalore HQ, 4th Floor" {...register("location")} />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-20" placeholder="Optional notes about this asset" {...register("notes")} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? "Registering..." : "Register Asset"}
            </button>
            <button type="button" onClick={() => navigate("/assets")} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
