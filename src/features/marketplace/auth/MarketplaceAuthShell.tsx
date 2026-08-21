import Image from "next/image";
import Link from "next/link";

export default function MarketplaceAuthShell({
  children,
  showBackLink = false,
}: {
  children: React.ReactNode;
  showBackLink?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-white border-b border-[#E9ECF2] h-16 flex items-center px-4 md:px-8">
        {showBackLink ? (
          <Link href="/marketplace" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to marketplace
          </Link>
        ) : (
          <span />
        )}
        <Link href="/marketplace" className="flex items-center gap-2 ml-auto">
          <Image src="/assets/images/logo.png" alt="Beldium" width={24} height={24} />
          <span className="font-semibold text-[#101E3D]">Beldium</span>
        </Link>
      </header>

      <div className="flex items-start justify-center px-4 py-10 md:py-16">
        <div className="bg-white border border-[#E9ECF2] rounded-2xl shadow-sm w-full max-w-lg p-8 md:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
