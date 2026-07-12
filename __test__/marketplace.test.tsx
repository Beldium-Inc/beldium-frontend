import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MarketplacePage from "@/src/app/marketplace/page";
import { getMinerProfiles } from "@/src/features/marketplace/api";
import { getMinerComplianceDetail } from "@/src/features/marketplace/detail-api";
import type { MinerProfileListItem } from "@/src/features/marketplace/api";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/src/features/marketplace/api", () => ({
  getMinerProfiles: jest.fn(),
}));

jest.mock("@/src/features/marketplace/detail-api", () => ({
  getMinerComplianceDetail: jest.fn(),
}));

const mockedGetMinerProfiles = getMinerProfiles as jest.MockedFunction<typeof getMinerProfiles>;
const mockedGetMinerComplianceDetail = getMinerComplianceDetail as jest.MockedFunction<
  typeof getMinerComplianceDetail
>;

function buildMiner(overrides: Partial<MinerProfileListItem>): MinerProfileListItem {
  return {
    id: "miner-1",
    user: "user-1",
    user_email: "miner1@yopmail.com",
    country: "Nigeria",
    state_of_operation: "Kwara",
    local_government_area: "Ilorin",
    business_role: "Licensed Miner",
    mineral_type: "Lithium",
    mining_method: "open_pit",
    operational_status: "active",
    mining_title_status: "valid_mining_license",
    license_number: "LIC-001",
    license_issue_date: "2025-01-01",
    estimated_monthly_output: "50 MT",
    miner_code: "BLD-00001",
    miner_number: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function buildListResponse(results: MinerProfileListItem[]) {
  return {
    status: "success",
    message: null,
    data: {
      next: null,
      previous: null,
      count: results.length,
      total_pages: 1,
      page_number: 1,
      per_page: 10,
      from: 1,
      to: results.length,
      results,
    },
  };
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Marketplace search/filter interaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetMinerComplianceDetail.mockResolvedValue({
      status: "success",
      message: null,
      data: {
        miner: buildMiner({}),
        compliance_review: { id: "r1", status: "approved", risk_level: "low", compliance_score: 80, notes: null, assigned_to: null, claimed_at: null, reviewed_at: null },
        licenses: [],
        documents: [],
        esg_reviews: [],
        support_requests: [],
        activity_logs: [],
      },
    });
  });

  it("loads the first page of miners on mount", async () => {
    mockedGetMinerProfiles.mockResolvedValue(
      buildListResponse([buildMiner({ id: "miner-1", user_email: "miner1@yopmail.com" })]),
    );

    renderWithClient(<MarketplacePage />);

    await waitFor(() => {
      expect(mockedGetMinerProfiles).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, page_size: 10 }),
      );
    });

    expect(await screen.findByText("miner1@yopmail.com")).toBeInTheDocument();
  });

  it("refetches with the search term when the user types in the search bar", async () => {
    mockedGetMinerProfiles.mockResolvedValue(buildListResponse([buildMiner({})]));

    renderWithClient(<MarketplacePage />);
    await waitFor(() => expect(mockedGetMinerProfiles).toHaveBeenCalled());

    await userEvent.type(
      screen.getByPlaceholderText(/search by miner name, miner code, or license number/i),
      "BLD-00001",
    );

    await waitFor(() => {
      expect(mockedGetMinerProfiles).toHaveBeenCalledWith(
        expect.objectContaining({ search: "BLD-00001", page: 1 }),
      );
    });
  });

  it("refetches with the mining method filter when changed", async () => {
    mockedGetMinerProfiles.mockResolvedValue(buildListResponse([buildMiner({})]));

    renderWithClient(<MarketplacePage />);
    await waitFor(() => expect(mockedGetMinerProfiles).toHaveBeenCalled());

    const methodSelectRoot = screen.getByText("All methods").closest(".ant-select") as HTMLElement;
    await userEvent.click(methodSelectRoot.querySelector('input[role="combobox"]')!);
    await userEvent.click(await screen.findByText("Open Pit"));

    await waitFor(() => {
      expect(mockedGetMinerProfiles).toHaveBeenCalledWith(
        expect.objectContaining({ mining_method: "open_pit", page: 1 }),
      );
    });
  });

  it("shows an empty state when no miners match the filters", async () => {
    mockedGetMinerProfiles.mockResolvedValue(buildListResponse([]));

    renderWithClient(<MarketplacePage />);

    expect(await screen.findByText(/no miners match your filters/i)).toBeInTheDocument();
  });

  it("shows an error message instead of crashing when the request fails", async () => {
    mockedGetMinerProfiles.mockRejectedValue(new Error("network error"));

    renderWithClient(<MarketplacePage />);

    expect(
      await screen.findByText(/unable to load miners right now/i),
    ).toBeInTheDocument();
  });
});
