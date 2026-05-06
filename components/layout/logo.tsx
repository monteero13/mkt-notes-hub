import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ size = "md", onDark = false }: { size?: "sm" | "md" | "lg"; onDark?: boolean }) {
  const imageSize = size === "sm" ? 64 : size === "lg" ? 180 : 120;

  return (
    <Link href="/" className="flex items-center justify-center">
      {/* Añadimos padding vertical p-1 y overflow-visible para asegurar que el halo/drop-shadow no se recorte nunca por arriba o abajo */}
      <div className="relative flex items-center justify-center p-1.5 overflow-visible">
        <Image
          src="/mktlogo.png"
          alt="MKT.NOTES Logo"
          width={imageSize}
          height={imageSize}
          className="object-contain overflow-visible"
          style={onDark ? {
            // Un fino e impecable halo blanco de alta definición de 1px que sigue exactamente los bordes del logo
            filter: "drop-shadow(1px 0px 0px rgba(255, 255, 255, 0.98)) drop-shadow(-1px 0px 0px rgba(255, 255, 255, 0.98)) drop-shadow(0px 1px 0px rgba(255, 255, 255, 0.98)) drop-shadow(0px -1px 0px rgba(255, 255, 255, 0.98)) drop-shadow(0 0 1px rgba(255,255,255,0.8))",
          } : undefined}
          priority
        />
      </div>
    </Link>
  );
}
