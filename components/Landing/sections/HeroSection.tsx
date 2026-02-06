'use client'

import { ScrambleText } from '@/components/shared/ScrambleText'
import PanafricanButton from '@/components/shared/PanafricanButton'

export function HeroSection() {
    return (
        <section className="relative min-h-screen w-full bg-[url(/landing/g.webp)] bg-cover bg-center bg-no-repeat bg-fixed">
            {/* Three-panel overlay - clips one continuous bg from parent */}
            <div className="flex min-h-screen items-stretch">
                {/* Left panel - transparent, shows parent bg through */}
                <div className="flex-1" />

                {/* Gap - Pan-African stripes (bg-fixed to match parent) */}
                <div className="w-2 md:w-2 bg- bg-fixed  bg-[image:var(--bg-pan-african-stripes)]" />

                {/* Center panel - frosted glass over parent bg */}
                <div className="w-full max-w-6xl z-10 font-bungee- relative  backdrop-sepia backdrop-blur-md bg-black/50 flex flex-col justify-between px-4 py-20">
                    <div className="flex-1 flex    justify-center  items-center gap-8">
                        <div className="max-w-2xl  mx-auto text-center flex flex-col items-center gap-6">
                            <h1 className="text-4xl sm:text-5xl leading-tight md:text-6xl font-semibold text-sepia-100 dark:text-white mb-6 animate-fade-in">
                                <span className='text-primary-500'>Create</span>,<span className='text-secondary-500'>Manage</span>  <span className=' '>&</span> <span className='text-tertiary-500'>Grow</span> Events with <span className="">Real-Time Power</span>
                            </h1>
                            <p className="text-base text-sepia-200 mb-8 max-w-xl mx-auto">
                                Empower your events with live voting, seamless ticket sales, and powerful analytics. From community polls to sold-out conferences, PanEvent makes it effortless.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 ">
                                <PanafricanButton

                                    dashArray="0 0"
                                    animated={false}
                                    animateOnHover={false}
                                    strokeWidth={1.5}
                                    borderRadius={0}
                                    animationDuration={2}
                                    className="bg-black rounded-none hover:bg-black/80 text-sepia-100 hover:text-sepia-200"

                                    variant="ghost"
                                > Create Events
                                </PanafricanButton>
                            </div>
                        </div>
                        {/* <div className="md:mx-auto flex flex-col items-center gap-4 mt-12 text-center">

                        </div> */}

                    </div>
                    <div className="md:mx-auto flex flex-col items-center gap-4 mt-12 text-center">
                        <ScrambleText
                            text="*133*3#"
                            className="text-6xl  font-bold mx-auto block"
                            colors={["#ef4444", "#facc15", "#16a34a"]}
                            scrambleSpeed={150}
                            duration={1200}
                            characters="*#0123456789"
                        />
                        <p className='text-sepia-100 text-base items-center'>You can simply dial the shortcode to vote offline</p>
                    </div>

                    {/* Hero image with split effect - grayscale left, color right */}
                    <div className="hidden md:block absolute  -right-48 bottom-0 h-96">
                        {/* The actual image */}
                        <img className="h-96 w-auto" src="/landing/hero-womam-1.webp" alt="Hero" />
                        {/* grayscale overlay - covers left portion */}
                        <div className="absolute inset-0 right-48 " />
                        {/* Color overlay - covers right w-48, no filter */}
                        <div className="absolute inset-0 left-auto backdrop-sepia w-48" />
                    </div>
                </div>

                {/* Gap - Pan-African stripes (bg-fixed to match parent) */}
                <div className="w-2 md:w-2 bg-fixed bg-[image:var(--bg-pan-african-stripes)]" />

                {/* Right panel - transparent to show colored overflow */}
                <div className="flex-1 backdrop- z-0 bg-amber-100/5" />
            </div>
        </section>
    )
}