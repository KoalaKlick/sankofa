import type { ReactNode } from "react"
import AfricaMap from "../../components/auth/AfricaMap"

import { AfroTixLogo } from "@/components/shared/AfroTixLogo"

export default function AuthLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-poppins">
      {/* Left hero / brand side */}

      <div className="relative w-full lg:w-1/2 h-65 lg:h-screen overflow-hidden shadow bg-secondary-50 ">
        <AfricaMap
          images={["/landing/g.webp", "/landing/b.webp", "/landing/h.webp"]}
          interval={12000}
          showHoverColor={true}
          showTransitionColor={false}
        />

        {/* Hero copy (matches AfroTix-style layout) */}
        <div className="absolute top-1/2 left-6 right-6 lg:space-y-6 max-w-[12rem] sm:max-w-[15rem] md:max-w-xs pointer-events-none">
          <div className="flex items-center gap-2">
            {/* <Image height={40} width={40} src="/logo.png" alt="Sankofa Logo" className="bg-black h-20 w-auto" /> */}
            <AfroTixLogo className="w-32 sm:w-38 md:w-40 lg:w-48 h-auto border border-black" />
          </div>
          <span className="mt-2 text-sm sm:text-base md:text-lg inline-block bg-secondary-50 font-medium text-foreground/80 ">
            Discover and book the hottest events across the continent.
          </span>
        </div>
      </div>
      {/* <PanAfricanDivider className="my-4 rotate-90 absolute top-0   w-svh" /> */}

      {/* Right auth content */}
      <div className="flex-1 flex items-center   justify-center px-4 py-10 lg:px-16">
        <div className="w-full max-w-md  h-full flex flex-col justify-between">
          {children}
        </div>
      </div>
    </div>
  )
}

