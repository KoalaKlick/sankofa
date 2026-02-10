import { Card, CardContent } from '@/components/ui/card'
import { Section } from '@/components/Landing/shared/Section'
import { Star } from 'lucide-react'

export function TestimonialsSection() {



    return (
        <Section as="section" contentClassName="py-20" className="">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">Trusted by Event Creators</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">"AfroTix made organizing our community conference seamless. The real-time features kept everyone engaged!"</p>
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">JD</div>
                            <div>
                                <p className="font-semibold">Jane Doe</p>
                                <p className="text-sm text-neutral-500">Community Manager</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">"The analytics dashboard is incredible. We saw a 40% increase in ticket sales compared to our previous events."</p>
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">MS</div>
                            <div>
                                <p className="font-semibold">Mike Smith</p>
                                <p className="text-sm text-neutral-500">Event Organizer</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center mb-4">
                            {Array(5).map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">"Live polling during our webinar increased participation by 300%. AfroTix is a game-changer."</p>
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">AL</div>
                            <div>
                                <p className="font-semibold">Alice Lee</p>
                                <p className="text-sm text-neutral-500">Marketing Director</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Section>
    )
}