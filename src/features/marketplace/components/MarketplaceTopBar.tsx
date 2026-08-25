import Link from "next/link";

export default function MarketplaceTopBar() {
  return (
    <div className="bg-[#2B2B2B] text-white text-xs md:text-sm">
      {/* <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5">
        <span className="text-center sm:text-left">
          We noticed you haven&apos;t registered yet, signup/login to connect with 17,000+ miners/buyers globally
        </span>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Link href="/marketplace/register" className="hover:underline">
            Buyer
          </Link>
          <span className="text-white/40">|</span>
          <Link href="/marketplace/register" className="hover:underline">
            OEM
          </Link>
          <span className="text-white/40">|</span>
          <Link href="/marketplace/register" className="hover:underline">
            Off-taker
          </Link>
        </div>
      </div> */}
    </div>
  );
}
