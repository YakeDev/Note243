import Link from "next/link";
import { auth } from "@/auth";
import { HeaderNav } from "./HeaderNav";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-primary">
          Note243
        </Link>
        <HeaderNav user={user as any} />
      </div>
    </header>
  );
}

