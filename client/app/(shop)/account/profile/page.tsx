import Link from "next/link";

export default function ProfilePage() {
  return (
    <section className="page-stack rounded-2xl border border-slate-200 bg-white p-5">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="text-sm text-slate-600">Profile information is managed under Settings.</p>
      <div>
        <Link href="/account/settings" className="inline-flex rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">
          Open Settings
        </Link>
      </div>
    </section>
  );
}
