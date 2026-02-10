// components/AfroTixLogoModern.tsx
export function AfroTixLogo({ className = "bg-red-400 h-auto" }: { readonly className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 600 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>AfroTix Logo</title>
            <defs>


                <filter id="modernShadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
                </filter>
            </defs>

            {/* Main text with custom styling */}
            <g filter="url(#modernShadow)">
                <text
                    x="300"
                    y="130"
                    fontFamily="'Poppins', 'Arial', sans-serif"
                    fontSize="100"
                    fontWeight="800"
                    letterSpacing="-2"
                    textAnchor="middle"
                >
                    <tspan fill="#C41E3A">Afro</tspan>
                    <tspan fill="#FFB800">Ti</tspan>
                    <tspan fill="none">x</tspan>
                    <tspan fill="#228B22">.</tspan>
                </text>
                
                {/* Jubilating man as "x" - X-shaped pose */}
                <g transform="translate(430, 45) scale(0.7)" fill="#FFB800">
                    {/* Head - small at top center */}
                    <circle cx="30" cy="5" r="10" fill="#228B22" />
                    {/* Core/center body - where limbs cross */}
                    <circle cx="30" cy="55" r="12" />
                    {/* Left arm - diagonal up-left */}
                    <path d="M22 48 L-5 10" stroke="#FFB800" strokeWidth="10" strokeLinecap="round" />
                    {/* Right arm - diagonal up-right */}
                    <path d="M38 48 L65 10" stroke="#FFB800" strokeWidth="10" strokeLinecap="round" />
                    {/* Left leg - diagonal down-left */}
                    <path d="M22 62 L-5 100" stroke="#FFB800" strokeWidth="10" strokeLinecap="round" />
                    {/* Right leg - diagonal down-right */}
                    <path d="M38 62 L65 100" stroke="#FFB800" strokeWidth="10" strokeLinecap="round" />
                </g>
            </g>


        </svg>
    )
}