import { SiteHeader } from "@/components/landing/site-header"
import { Hero } from "@/components/landing/hero"
// import { RequestTypes } from "@/components/landing/request-types"
// import { Features } from "@/components/landing/features"
// import { HowItWorks } from "@/components/landing/how-it-works"
// import { CtaFooter } from "@/components/landing/cta-footer"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        {/* <RequestTypes /> */}
        {/* <Features /> */}
        {/* <HowItWorks /> */}
        {/* <CtaFooter /> */}
      </main>
    </div>
  )
}
