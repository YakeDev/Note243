import { redirect } from "next/navigation";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Cette page sert juste de pont lisible ; si un token est présent, on redirige vers l'API.
  // Sinon, on affiche un message d'erreur simple.
  return (
    <AsyncVerify searchParamsPromise={searchParams} />
  );
}

async function AsyncVerify({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParamsPromise;
  const token = typeof params.token === "string" ? params.token : undefined;

  if (token) {
    redirect(`/api/auth/verify?token=${encodeURIComponent(token)}`);
  }

  // Pas de token => message simple
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Lien de vérification invalide</h1>
        <p className="mt-2 text-sm text-slate-600">
          Le lien de vérification est manquant ou invalide. Veuillez vérifier l’email reçu ou
          demander un nouvel envoi.
        </p>
        <div className="mt-4">
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
}
