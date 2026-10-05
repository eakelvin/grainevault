import type { AdminIdea } from "@/lib/admin";

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminIdeasView({ ideas }: { ideas: AdminIdea[] }) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Admin</h1>
        <p className="mt-1 text-slate-400">
          {ideas.length} idea{ideas.length === 1 ? "" : "s"} across all accounts
        </p>
      </div>

      {ideas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-700/60 px-6 py-16 text-center text-sm text-slate-400">
          No ideas yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-800/40">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-slate-700/60 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Idea</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <tr
                  key={idea.id}
                  className="border-b border-slate-800/80 last:border-0"
                >
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-white">{idea.title}</p>
                    {idea.archivedAt ? (
                      <p className="mt-0.5 text-xs text-slate-500">Archived</p>
                    ) : null}
                  </td>
                  <td className="max-w-md px-4 py-3 align-top text-slate-400">
                    {idea.description || "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-300">
                    {idea.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-slate-400">
                    {formatWhen(idea.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
