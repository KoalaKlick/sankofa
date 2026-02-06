"use client"

import { useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import { eventItems, type EventItem } from "@/lib/const/landing"
import { EventsIntro } from "./EventsIntro"
import { EventGallery } from "./EventGallery"
import { EventsOutro } from "./EventsOutro"
import { Section } from "../../shared/Section"

interface EventsSectionProps {
    readonly title?: string
    readonly outroText?: string
    readonly items?: EventItem[]
}

export function EventsSection({
    title = "Tokyo Nights",
    outroText = "Fin",
    items = eventItems,
}: EventsSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    })

    // Transform scroll progress to horizontal movement (0% to 100%)
    // The actual pixel distance is calculated in CSS using items count
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"])

    return (
        <Section id="events" className="h-auto overflow-visible bg-primary-950 relative">
            {/* <EventsIntro title={title} /> */}
            <EventGallery items={items} x={x} scrollProgress={scrollYProgress} containerRef={containerRef} />
            {/* <EventsOutro text={outroText} /> */}
        </Section>
    )
}
