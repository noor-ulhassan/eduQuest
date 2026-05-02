import { LoaderOne } from "@/components/ui/loader";

export default function PageLoader({ message = "Loading…" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black/90">
      <LoaderOne />
      {message && <p className="mt-5 text-metallic text-2xl">{message}</p>}
    </div>
  );
}
