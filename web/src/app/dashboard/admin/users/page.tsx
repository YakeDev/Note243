import { prisma } from "@/lib/prisma";
import { UserActions } from "./UserActions";

export const dynamic = "force-dynamic";

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { reviews: true, reports: true } },
    },
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Utilisateurs</p>
        <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
        <p className="text-sm text-slate-600">
          Consultez l’activité, suspendez ou réactivez les comptes en cas d’abus.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Avis</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{user.name ?? "Utilisateur"}</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.role}</td>
                <td className="px-4 py-3 text-slate-600">{user.status}</td>
                <td className="px-4 py-3 text-slate-600">{user._count?.reviews ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <UserActions id={user.id} status={user.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-600">
            Aucun utilisateur pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
