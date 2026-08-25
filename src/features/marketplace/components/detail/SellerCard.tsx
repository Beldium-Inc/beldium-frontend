import { CheckCircleFilled, UserOutlined } from "@ant-design/icons";
import type { PublicListingDetail } from "@/src/features/marketplace/public-api";

export default function SellerCard({ listing }: { listing: PublicListingDetail }) {
  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
            {listing.seller.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.seller.avatar}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <UserOutlined />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-medium text-gray-900 text-sm">
              {listing.seller.company_name ?? listing.miner_company_name}
              {listing.seller.is_verified && (
                <CheckCircleFilled className="text-blue-500 text-xs" />
              )}
            </div>
            <div className="text-xs text-gray-500">{listing.mine_state}, NIG</div>
          </div>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">View profile →</span>
      </div>

      {listing.is_verified && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
            <CheckCircleFilled /> Verified material
          </div>
          <p className="text-xs text-green-700/80 mt-1">
            Material information and supporting documentation have been reviewed by Beldium
          </p>
          <ul className="mt-2 space-y-1 text-xs text-green-700">
            <li className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-[10px]" /> Assay reports available
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-[10px]" /> COA available
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
