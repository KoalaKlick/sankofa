import { HeroSection } from '@/components/Landing/sections/HeroSection'
import { FeaturesSection } from '@/components/Landing/sections/FeaturesSection' 
import { HowItWorksSection } from '@/components/Landing/sections/HowItWorksSection'
import { TestimonialsSection } from '@/components/Landing/sections/TestimonialsSection'
import { PricingSection } from '@/components/Landing/sections/PricingSection'
import { FAQSection } from '@/components/Landing/sections/FAQSection'
import { FinalCTASection } from '@/components/Landing/sections/FinalCTASection'
import { FooterSection } from '@/components/Landing/sections/FooterSection'
import { Navbar } from '@/components/Landing/nav/NavBar'
import { EventsSection } from '@/components/Landing/sections/events'
import {PanAfricanDivider} from '@/components/shared/PanAficDivider'

// Pan-African divider component


const page = () => {
  return (
    <div className="flex font-monoton flex-col max-w-svw overflow-x-clip min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      
      {/* Rest of sections wrapped with dividers */}
      <div className="flex flex-col">
        <PanAfricanDivider />
        <FeaturesSection />
        <PanAfricanDivider />
        <HowItWorksSection />
        <PanAfricanDivider />
        <EventsSection />
        <PanAfricanDivider />
        <TestimonialsSection />
        <PanAfricanDivider />
        <PricingSection />
        <PanAfricanDivider />
        <FAQSection />
        <PanAfricanDivider />
        <FinalCTASection />
        <PanAfricanDivider />
        <FooterSection />
      </div>
    </div>
  )
}

export default page