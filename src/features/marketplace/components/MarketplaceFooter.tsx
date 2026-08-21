import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

// Structurally ported from the marketing site's <Footer> (react-router,
// bg-primary text-primary-foreground, circle logo, brand/platform/company/
// legal columns, CTA reinforcement band, bottom bar). Every link below is
// prefixed with the beldium.com marketing domain, per instruction, since
// those pages (/platform, /miners, /about, etc.) don't exist inside this
// app - only the marketplace and app.beldium.com routes do.
const BELDIUM_SITE = "https://www.beldium.com";

const footerLinks = {
  platform: [
    { name: "Features", href: "/platform" },
    { name: "For Miners", href: "/miners" },
    { name: "For Buyers", href: "/buyers" },
    { name: "For Regulators", href: "/regulators" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Governance", href: "/governance" },
    { name: "Partnerships", href: "/partnerships" },
    { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Terms of Service", href: "/documents/BELDIUM_TERMS_OF_SERVICE.docx" },
    { name: "Privacy Policy", href: "/documents/BELDIUM_PRIVACY_POLICY.docx" },
  ],
};

export default function MarketplaceFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/marketplace" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#fafafa] p-1">
                <Image
                  src="/assets/images/logo.png"
                  alt="Beldium"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain rounded-full"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight">Beldium</span>
            </Link>
            <p className="text-primary-foreground/70 max-w-sm mb-6">
              Africa&apos;s trusted lithium supply chain infrastructure. Digitizing mining,
              trade, compliance &amp; logistics for the continent&apos;s mineral future.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:davidobi@beldium.com"
                className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                davidobi@beldium.com
              </a>
              <a
                href="tel:+2349016690224"
                className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Phone className="h-5 w-5" />
                +234 901 669 0224
              </a>
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <MapPin className="h-5 w-5 shrink-0" />
                No 16 Akesan Road, Igando, Lagos 102213
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={`${BELDIUM_SITE}${link.href}`}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={`${BELDIUM_SITE}${link.href}`}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={`${BELDIUM_SITE}${link.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA reinforcement */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-xl sm:text-2xl font-semibold text-primary-foreground mb-4">
            Ready to participate in Africa&apos;s structured lithium future?
          </p>
          <a
            href="https://app.beldium.com"
            className="inline-flex items-center justify-center rounded-md bg-[#fafafa] !text-[#101E3D] px-6 py-3 text-base font-medium shadow hover:bg-white transition-colors"
          >
            Create Your Account
          </a>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Beldium Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com/beldium"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://ng.linkedin.com/company/beldium-inc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
