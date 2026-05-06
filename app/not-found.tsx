import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">404 - Not Found</h2>
      <p className="text-muted-foreground mb-8">The page you are looking for does not exist.</p>
      <Link 
        href="/"
        className="px-8 py-3 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-all"
      >
        Go Home
      </Link>
    </div>
  );
}
