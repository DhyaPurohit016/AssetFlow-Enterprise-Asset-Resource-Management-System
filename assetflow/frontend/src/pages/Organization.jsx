import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { EmptyState } from "../components/States";

const TABS = ["Departments", "Categories", "Employee Directory"];

export default function Organization() {
  const [tab, setTab] = useState("Departments");
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = () => {
    api.get("/org/departments").then((r) => setDepartments(r.data));
    api.get("/org/categories").then((r) => setCategories(r.data));
    api.get("/org/employees").then((r) => setEmployees(r.data));
  };

  useEffect(load, []);

  const onSubmitDept = async (values) => {
    try {
      await api.post("/org/departments", values);
      toast.success("Department added");
      reset(); setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const onSubmitCategory = async (values) => {
    try {
      await api.post("/org/categories", values);
      toast.success("Category added");
      reset(); setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const changeRole = async (id, role) => {
    try {
      await api.put(`/org/employees/${id}`, { role });
      toast.success("Role updated");
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-surface-800 border border-surface-700 rounded-lg p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setShowForm(false); }}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                tab === t ? "bg-sage-500 text-surface-950 font-medium" : "text-ink-400 hover:text-ink-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab !== "Employee Directory" && (
          <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      {tab === "Departments" && (
        <>
          {showForm && (
            <form onSubmit={handleSubmit(onSubmitDept)} className="card p-5 flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="label">Department Name</label>
                <input className="input" placeholder="Engineering" {...register("name", { required: true })} />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary">Save</button>
            </form>
          )}
          <div className="card overflow-hidden">
            {departments.length === 0 ? <EmptyState title="No departments yet" /> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700 text-left text-ink-400">
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Head</th>
                    <th className="px-5 py-3 font-medium">Parent Dept</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d._id} className="border-b border-surface-800 last:border-0">
                      <td className="px-5 py-3 text-ink-50">{d.name}</td>
                      <td className="px-5 py-3 text-ink-200">{d.head?.name || "—"}</td>
                      <td className="px-5 py-3 text-ink-400">{d.parentDepartment?.name || "—"}</td>
                      <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === "Categories" && (
        <>
          {showForm && (
            <form onSubmit={handleSubmit(onSubmitCategory)} className="card p-5 flex gap-3 items-end flex-wrap">
              <div className="min-w-[180px]">
                <label className="label">Category Name</label>
                <input className="input" placeholder="Laptop" {...register("name", { required: true })} />
              </div>
              <div className="min-w-[100px]">
                <label className="label">Tag Prefix</label>
                <input className="input" placeholder="LT" {...register("prefix", { required: true })} />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary">Save</button>
            </form>
          )}
          <div className="card overflow-hidden">
            {categories.length === 0 ? <EmptyState title="No categories yet" /> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700 text-left text-ink-400">
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Prefix</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c._id} className="border-b border-surface-800 last:border-0">
                      <td className="px-5 py-3 text-ink-50">{c.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-sage-400">{c.prefix}</td>
                      <td className="px-5 py-3 text-ink-400">{c.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === "Employee Directory" && (
        <div className="card overflow-hidden">
          {employees.length === 0 ? <EmptyState title="No employees yet" /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700 text-left text-ink-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e._id} className="border-b border-surface-800 last:border-0">
                    <td className="px-5 py-3 text-ink-50">{e.name}</td>
                    <td className="px-5 py-3 text-ink-400">{e.email}</td>
                    <td className="px-5 py-3 text-ink-200">{e.department?.name || "—"}</td>
                    <td className="px-5 py-3">
                      <select
                        className="input py-1 text-xs w-auto"
                        value={e.role}
                        onChange={(ev) => changeRole(e._id, ev.target.value)}
                      >
                        <option>Admin</option>
                        <option>Asset Manager</option>
                        <option>Department Head</option>
                        <option>Employee</option>
                      </select>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
