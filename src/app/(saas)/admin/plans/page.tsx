import AdminShell from "@/components/saas/admin-shell";
import { AdminPlanEdit, AdminPlanForm, AdminPlanToggle } from "@/components/saas/admin-plan-actions";
import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/server-auth";

export default async function AdminPlansPage() {
  await requirePageAdmin();
  const plans = await prisma.plan.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <AdminShell>
      <h1 className="mb-5 text-2xl font-semibold">Plans</h1>
      <AdminPlanForm />
      <div className="mt-5 overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Credits</th>
              <th className="p-3">Sort</th>
              <th className="p-3">Active</th>
              <th className="p-3">Action</th>
              <th className="p-3">Edit</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-t">
                <td className="p-3">{plan.name}</td>
                <td className="p-3">{plan.currency} {Number(plan.price).toFixed(2)}</td>
                <td className="p-3">{plan.credits}</td>
                <td className="p-3">{plan.sortOrder}</td>
                <td className="p-3">{plan.isActive ? "Yes" : "No"}</td>
                <td className="p-3"><AdminPlanToggle id={plan.id} isActive={plan.isActive} /></td>
                <td className="p-3">
                  <AdminPlanEdit
                    id={plan.id}
                    price={Number(plan.price)}
                    credits={plan.credits}
                    sortOrder={plan.sortOrder}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
