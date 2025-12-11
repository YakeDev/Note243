interface BusinessPageProps {
  params: { id: string };
}

export default function BusinessPage({ params }: BusinessPageProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900">Fiche établissement</h1>
      <p className="mt-3 text-slate-700">
        ID : <span className="font-mono text-slate-900">{params.id}</span>
      </p>
      <p className="mt-2 text-slate-700">
        À compléter avec les détails, photos, carte et avis.
      </p>
    </div>
  );
}
