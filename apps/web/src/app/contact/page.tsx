export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Contact</h1>
      <p className="mt-4 text-slate-700">
        For support, email{" "}
        <a className="text-brand-700 hover:underline" href="mailto:support@rentora.local">
          support@rentora.local
        </a>
        .
      </p>
    </div>
  );
}
