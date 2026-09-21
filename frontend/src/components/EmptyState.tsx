export function EmptyState() {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Todavia no hay consultas</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Busca una ciudad arriba y apareceran aqui su temperatura y sus comentarios.
      </p>
    </section>
  )
}
