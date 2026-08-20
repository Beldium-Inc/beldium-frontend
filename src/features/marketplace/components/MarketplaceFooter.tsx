import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Features", href: "/#features" },
      { label: "For Miners", href: "/register?persona=miner" },
      { label: "For Buyers", href: "/register?persona=buyer" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Governance", href: "/governance" },
      { label: "Partnerships", href: "/partnerships" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
];

export default function MarketplaceFooter() {
  return (
    <footer className="bg-[#0B0F1A] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Image src="/assets/images/logo-white.svg" alt="Beldium" width={28} height={28} />
            <span className="font-semibold text-lg">Beldium</span>
          </div>
          <p className="text-white/60 text-sm mt-4 max-w-xs">
            Africa&apos;s trusted lithium supply chain infrastructure. Digitizing
            mining, trade, compliance &amp; logistics for the continent&apos;s
            mineral future
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold mb-3">{col.title}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>davidobi@beldium.com</li>
            <li>+234-901-6649-0224</li>
            <li>No 6 Akesan road Igando, Lagos. NIG</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/50">
          <span>© {new Date().getFullYear()} Beldium Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="https://linkedin.com" className="hover:text-white">
              LinkedIn
            </Link>
            <Link href="https://twitter.com" className="hover:text-white">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
