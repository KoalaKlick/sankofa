import Image from "next/image"
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-poppins">
      {/* Left hero / brand side */}
      <div className="relative w-full lg:w-1/2 h-65 lg:h-auto overflow-hidden">
        <Image
          src="/landing/g.webp"
          alt="People enjoying an event"
          fill
          priority
          className="object-cover"
        />

        {/* Gradient overlay to keep content readable */}
        <div className="absolute inset-0 bg-linear-to-t h-1/2 top-1/2 from-background/95 via-backfrom-background/55 to-backfrom-background/5" />


        {/* Hero copy (matches AfroTix-style layout) */}
        <div className="absolute bottom-8 left-6 right-6 md:space-y-6 max-w-xl mx-auto">
          <Image
            src="/logo.png"
            alt="Sankofa logo"
            width={40}
            height={40}
            className="bg-black h-10 w-auto border border-sepia-50 px-2 "
          />

          <p className="mt-2 text-xl  sm:text-xl font-medium ">
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

