import type { ReactNode } from "react"
import AfricaMap from "../components/auth/AfricaMap"

export default function AuthLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-poppins">
      {/* Left hero / brand side */}

      <div className="relative w-full lg:w-1/2 h-65 lg:h-screen overflow-hidden bg-green-900">
        <AfricaMap
          images={["/landing/g.webp", "/landing/a.webp", "/landing/i.webp"]}
          interval={12000}
          showHoverColor={false}
          showTransitionColor={false}
        />

        {/* Hero copy (matches AfroTix-style layout) */}
        <div className="absolute bottom-8 left-6 right-6 md:space-y-6 max-w-xl mx-auto pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tight">Sankofa</span>
          </div>

          <p className="mt-2 text-xl sm:text-2xl font-medium text-foreground/80">
            Discover and book the hottest events across the continent.
          </p>
        </div>
      </div>

      {/* Right auth content */}
      <div className="flex-1 flex items-center   justify-center px-4 py-10 lg:px-16">
        <div className="w-full max-w-md  h-full flex flex-col justify-between">
          {children}
        </div>
      </div>
    </div>
  )
}

