"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { motion, useMotionValueEvent, useScroll } from "motion/react"
import { Button } from "@/components/ui/button"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { defaultNavigationLinks, type NavbarNavLink } from "@/lib/const/landing"
import { Logo } from "@/components/shared/icon"
import { Menu } from "lucide-react"
import {PanAfricanDivider} from '@/components/shared/PanAficDivider'
import Image from "next/image"

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    logo?: React.ReactNode
    logoHref?: string
    navigationLinks?: NavbarNavLink[]
    signInText?: string
    signInHref?: string
    ctaText?: string
    ctaHref?: string
    onSignInClick?: () => void
    onCtaClick?: () => void
}

// Default navigation links


export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
    (
        {
            className,
            logo = <Logo />,
            logoHref = "#",
            navigationLinks = defaultNavigationLinks,
            signInText = "Sign In",
            signInHref = "#signin",
            ctaText = "Get Started",
            ctaHref = "#get-started",
            onSignInClick,
            onCtaClick,
            ...props
        },
        ref,
    ) => {
        const [isMobile, setIsMobile] = useState(false)
        const [activeHref, setActiveHref] = useState("#")
        const [hidden, setHidden] = useState(false)
        const [scrolled, setScrolled] = useState(false)
        const containerRef = useRef<HTMLElement>(null)
        const { scrollY } = useScroll()

        useEffect(() => {
            const checkWidth = () => {
                if (containerRef.current) {
                    const width = containerRef.current.offsetWidth
                    setIsMobile(width < 768) // 768px is md breakpoint
                }
            }

            checkWidth()

            const resizeObserver = new ResizeObserver(checkWidth)
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current)
            }

            return () => {
                resizeObserver.disconnect()
            }
        }, [])

        useEffect(() => {
            const updateActiveHref = () => {
                const hash = globalThis.location.hash || "#"
                setActiveHref(hash)
            }

            updateActiveHref()
            globalThis.addEventListener("hashchange", updateActiveHref)

            return () => {
                globalThis.removeEventListener("hashchange", updateActiveHref)
            }
        }, [])

        useEffect(() => {
            const sectionLinks = navigationLinks
                .map((link) => link.href)
                .filter((href) => href.startsWith("#") && href.length > 1)

            const sections = sectionLinks
                .map((href) => ({ href, el: document.querySelector(href) }))
                .filter((item): item is { href: string; el: Element } => Boolean(item.el))

            if (!sections.length) return

            const observer = new IntersectionObserver(
                (entries) => {
                    const visible = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

                    if (visible.length > 0) {
                        const match = sections.find((s) => s.el === visible[0].target)
                        if (match) {
                            setActiveHref(match.href)
                        }
                    } else if (globalThis.scrollY < 100) {
                        setActiveHref("#")
                    }
                },
                {
                    root: null,
                    rootMargin: "-80px 0px -60% 0px",
                    threshold: [0.1, 0.25, 0.5, 0.75, 1],
                },
            )

            for (const section of sections) {
                observer.observe(section.el)
            }
            return () => {
                observer.disconnect()
            }
        }, [navigationLinks])

        useMotionValueEvent(scrollY, "change", (current) => {
            const previous = scrollY.getPrevious() ?? 0
            if (current > previous && current > 150) {
                setHidden(true)
            } else {
                setHidden(false)
            }
            // Set scrolled state - true when past 100vh
            const viewportHeight = globalThis.innerHeight || 0
            setScrolled(current > viewportHeight)
        })

        // Combine refs
        const combinedRef = React.useCallback(
            (node: HTMLElement | null) => {
                containerRef.current = node
                if (typeof ref === "function") {
                    ref(node)
                } else if (ref) {
                    ref.current = node
                }
            },
            [ref],
        )

        return (
            <motion.header
                className={cn(
                    "fixed top-0 z-50 w-full px-4 md:px-6 transition-all delay-100 duration-300",
                    scrolled ? "bg-white/95 backdrop-blur" : "bg-black/95 backdrop-blur",
                    className,
                )}
                ref={combinedRef}
                {...(props as any)}
                animate={{ y: hidden ? -96 : 0, opacity: hidden ? 0 : 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between gap-4">
                    {/* Left side */}
                    <div className="flex items-center gap-2">
                        {/* Mobile menu trigger */}
                        {isMobile && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-48 p-2">
                                    <NavigationMenu className="max-w-none">
                                        <NavigationMenuList className="flex-col items-start gap-1">
                                            {navigationLinks.map((link) => (
                                                <NavigationMenuItem className="w-full" key={link.href}>
                                                    <a
                                                        href={link.href}
                                                        onClick={() => setActiveHref(link.href)}
                                                        className={cn(
                                                            "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer no-underline",
                                                            activeHref === link.href
                                                                ? "bg-accent text-accent-foreground"
                                                                : "text-foreground/80",
                                                        )}
                                                    >
                                                        {link.label}
                                                    </a>
                                                </NavigationMenuItem>
                                            ))}
                                        </NavigationMenuList>
                                    </NavigationMenu>
                                </PopoverContent>
                            </Popover>
                        )}
                        {/* Main nav */}
                        <div className="flex items-center gap-6">
                            <a
                                href={logoHref}
                                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
                            >
                                <Image src="/logo.png" className="h-10 bg-black px-2" alt="logo" width={124.2} height={38.1}/>

                            </a>
                            {/* Navigation menu */}
                            {!isMobile && (
                                <NavigationMenu className="flex">
                                    <NavigationMenuList className="gap-10">
                                        {navigationLinks.map((link) => (
                                            <NavigationMenuItem key={link.href}>
                                                <a
                                                    href={link.href}
                                                    onClick={() => setActiveHref(link.href)}
                                                    className={cn(
                                                        "group relative inline-flex w-max items-left justify-center rounded-md text-sm font-medium transition-colors focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer no-underline",
                                                        activeHref === link.href
                                                            ? scrolled ? " text-sepia" : "bg-primary text-white"
                                                            : scrolled ? "text-gray-700 hover:text-primary" : "text-gray-300 hover:text-white",
                                                    )}
                                                >
                                                    {link.label}
                                                    <PanAfricanDivider className={cn("absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 ease-out transform ", 
                                                        activeHref === link.href 
                                                            ? "w-full opacity-100" 
                                                            : "group-hover:w-full group-hover:opacity-50"
                                                    )} />
                                                </a>
                                            </NavigationMenuItem>
                                        ))}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            )}
                        </div>
                    </div>
                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <Button
                            className="text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            onClick={e => {
                                e.preventDefault()
                                if (onSignInClick) {
                                    onSignInClick()
                                }
                            }}
                            size="sm"
                            variant="ghost"
                        >
                            {signInText}
                        </Button>
                        <Button
                            className="text-sm font-medium px-4 h-9 rounded-md shadow-sm"
                            onClick={e => {
                                e.preventDefault()
                                if (onCtaClick) {
                                    onCtaClick()
                                }
                            }}
                            size="sm"
                        >
                            {ctaText}
                        </Button>
                    </div>
                </div>
            </motion.header>
        )
    },
)

Navbar.displayName = "Navbar"