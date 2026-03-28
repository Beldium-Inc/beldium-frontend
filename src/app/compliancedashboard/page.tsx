import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

type NavItem = {
  label: string;
  icon: ReactNode;
  active?: boolean;
};

type StatCardProps = {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  value: string;
  helper?: string;
  note?: string;
  footer?: ReactNode;
};

type QueueRow = {
  minerId: string;
  company: string;
  location: string;
  waitTime: string;
  waitTimeClassName?: string;
  highlighted?: boolean;
};

type ActiveQueueCard = {
  tag: string;
  tagClassName: string;
  progress: number;
  progressClassName: string;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <AppstoreOutlined />,
    active: true,
  },
  {
    label: "Open Task Pool",
    icon: <FolderOpenOutlined />,
  },
  {
    label: "Reviews",
    icon: <FileSearchOutlined />,
  },
  {
    label: "Regulatory Alerts",
    icon: <BellOutlined />,
  },
];

const queueRows: QueueRow[] = [
  {
    minerId: "BLD-01120",
    company: "Oke Ayo Minerals Ltd",
    location: "Kwara/Ilorin",
    waitTime: "30m",
  },
  {
    minerId: "BLD-00126",
    company: "Zamfara Gold Works",
    location: "Zamfara / Anka",
    waitTime: "25m",
  },
  {
    minerId: "BLD-00127",
    company: "GreenRock Resour...",
    location: "Nasarawa / Lafia",
    waitTime: "1h 13m",
    waitTimeClassName: "text-[#e17c00]",
    highlighted: true,
  },
  {
    minerId: "BLD-00126",
    company: "Oke Ayo Minerals Ltd",
    location: "Kwara/Ilorin",
    waitTime: "12m",
  },
  {
    minerId: "BLD-00128",
    company: "Northern Ridge Min...",
    location: "Zamfara / Anka",
    waitTime: "18m",
  },
  {
    minerId: "BLD-00140",
    company: "Oke Ayo Minerals Ltd",
    location: "Kwara/Ilorin",
    waitTime: "40m",
    waitTimeClassName: "text-[#e17c00]",
    highlighted: true,
  },
];

const activeQueueCards: ActiveQueueCard[] = [
  {
    tag: "CRITICAL",
    tagClassName: "border border-[#f5c98d] bg-[#fff3df] text-[#bf6d00]",
    progress: 97,
    progressClassName: "bg-[#1bb529]",
  },
  {
    tag: "STANDARD",
    tagClassName: "border border-[#e6e7ec] bg-[#f9fafb] text-[#9498a3]",
    progress: 30,
    progressClassName: "bg-[#ff1d1d]",
  },
  {
    tag: "CRITICAL",
    tagClassName: "border border-[#f5c98d] bg-[#fff3df] text-[#bf6d00]",
    progress: 60,
    progressClassName: "bg-[#ff9f0a]",
  },
];

function SidebarItem({ label, icon, active = false }: NavItem) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-r-[18px] border-r-4 px-4 py-4 text-left text-[15px] font-medium transition-colors ${
        active
          ? "border-r-[#101e3d] bg-[#d9e8ff] text-[#101e3d]"
          : "border-r-transparent text-[#3b4253] hover:bg-white hover:text-[#101e3d]"
      }`}
    >
      <span
        className={`text-[18px] ${active ? "text-[#0e4fb6]" : "text-[#222938]"}`}
      >
        {icon}
      </span>
      <span>{label}</span>
      {label === "Regulatory Alerts" ? (
        <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#ff4726]" />
      ) : null}
    </button>
  );
}

function StatCard({
  icon,
  iconClassName,
  title,
  value,
  helper,
  note,
  footer,
}: StatCardProps) {
  return (
    <div className="rounded-[24px] border border-[#e8ebf2] bg-white p-5 shadow-[0_18px_44px_-30px_rgba(16,30,61,0.45)]">
      <div className="flex items-center gap-4">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full text-[18px] ${iconClassName}`}
        >
          {icon}
        </span>
        <span className="text-[15px] font-medium text-[#3a3e48]">{title}</span>
      </div>

      <div className="mt-7 flex items-end justify-between gap-4">
        <div>
          <div className="text-[50px] font-semibold leading-none tracking-[-0.04em] text-[#272b33]">
            {value}
          </div>
          {helper ? (
            <div className="mt-4 text-[13px] font-medium text-[#16a34a]">
              <span className="mr-1">↗</span>
              {helper}
            </div>
          ) : null}
          {note ? (
            <div className="mt-3 text-[13px] text-[#9aa1af]">{note}</div>
          ) : null}
        </div>

        {footer}
      </div>
    </div>
  );
}

function ProgressBar({
  progress,
  progressClassName,
}: {
  progress: number;
  progressClassName: string;
}) {
  return (
    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#e9ebf1]">
      <div
        className={`h-full rounded-full ${progressClassName}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function ComplianceDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#202534]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[236px] flex-col border-r border-[#e7eaf2] bg-white xl:flex">
          <div className="flex h-[92px] items-center gap-3 px-8">
            <Image
              src="/assets/images/logo.png"
              alt="Beldium"
              width={32}
              height={32}
            />
            <span className="text-[28px] font-semibold tracking-[-0.04em] text-[#1e2636]">
              Beldium
            </span>
          </div>

          <nav className="mt-16 flex flex-1 flex-col gap-6 pr-3">
            {navItems.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </nav>

          <div className="px-6 pb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-[15px] font-medium text-[#ff2d2f] transition-colors hover:text-[#e11d22]"
            >
              <LogoutOutlined className="text-[18px]" />
              Logout
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[#e7eaf2] bg-white/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3 xl:hidden">
                <Image
                  src="/assets/images/logo.png"
                  alt="Beldium"
                  width={28}
                  height={28}
                />
                <span className="text-xl font-semibold text-[#1e2636]">
                  Beldium
                </span>
              </div>

              <div className="relative w-full max-w-[330px]">
                <SearchOutlined className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-[#7f8796]" />
                <input
                  type="text"
                  placeholder="Search miner"
                  className="h-12 w-full rounded-full border border-[#dbe0ea] bg-white pl-14 pr-5 text-[15px] text-[#293041] outline-none transition-shadow placeholder:text-[#8b93a1] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.07)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6">
                <div className="flex items-center gap-3 rounded-full bg-white px-2 py-1">
                  <span className="text-[15px] text-[#707785]">Status</span>
                  <span className="inline-flex h-7 items-center rounded-full bg-[#11bb42] px-3 shadow-inner">
                    <span className="text-[11px] font-semibold tracking-[0.12em] text-white">
                      ONLINE
                    </span>
                  </span>
                </div>

                <span className="inline-flex h-12 items-center rounded-[14px] border border-[#b8e3bf] bg-[#f1fff3] px-5 text-[15px] font-medium text-[#13a236]">
                  Pilot Phase
                </span>

                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#eceef4] bg-[#f9fafc] text-[20px] text-[#2a3142] transition-colors hover:bg-white"
                >
                  <SettingOutlined />
                </button>

                <button
                  type="button"
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#eceef4] bg-[#f9fafc] text-[20px] text-[#2a3142] transition-colors hover:bg-white"
                >
                  <BellOutlined />
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#ff4726]" />
                </button>

                <div className="hidden h-12 w-px bg-[#e4e7ee] lg:block" />

                <div className="flex items-center gap-3 rounded-full bg-[#f5f7fb] px-3 py-2">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
                    <Image
                      src="/assets/images/get-started.jpg"
                      alt="David Obi"
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[16px] font-semibold text-[#1f2635]">
                      David Obi
                    </div>
                    <div className="mt-1 text-[14px] text-[#7a8291]">
                      Regulator
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1400px]">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h1 className="text-[34px] font-semibold tracking-[-0.05em] text-[#2a2f39]">
                      Dashboard
                    </h1>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-h-[86px] items-center gap-4 rounded-[18px] border border-[#dfe5ef] bg-white pl-4 pr-4 shadow-[0_20px_44px_-34px_rgba(16,30,61,0.45)] sm:min-w-[430px]">
                      <div className="h-14 w-1 rounded-full bg-gradient-to-b from-[#ff6a3d] to-[#ff3d19]" />
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef8ff] text-[18px] text-[#4b8fe8]">
                        <UsergroupAddOutlined />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[24px] font-semibold tracking-[-0.03em] text-[#252a34]">
                          New Miner Onboarded
                        </div>
                        <div className="mt-1 text-[15px] text-[#8b92a0]">
                          [Miner ID: 124] - Ready for Review.
                        </div>
                      </div>
                      <button
                        type="button"
                        className="h-11 rounded-[12px] border border-[#dfe3eb] bg-white px-4 text-[15px] font-medium text-[#404655] shadow-sm transition-colors hover:bg-[#f9fafc]"
                      >
                        Claim Task
                      </button>
                    </div>

                    <button
                      type="button"
                      className="relative inline-flex h-[56px] items-center justify-center gap-3 rounded-[14px] bg-[#101e3d] px-8 text-[15px] font-medium text-white shadow-[0_18px_32px_-22px_rgba(16,30,61,0.8)] transition-transform hover:-translate-y-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      Open Queue
                      <ArrowRightOutlined />
                      <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#ff4726]" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
                  <StatCard
                    icon={<UsergroupAddOutlined />}
                    iconClassName="bg-[#e9f0ff] text-[#4a80ff]"
                    title="Active tasks"
                    value="24"
                    helper="+15% last month"
                    footer={
                      <button
                        type="button"
                        className="mt-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef1f6] text-[18px] text-[#687081] transition-colors hover:bg-[#e7ebf2]"
                      >
                        <ArrowRightOutlined className="-rotate-45" />
                      </button>
                    }
                  />

                  <StatCard
                    icon={<ClockCircleOutlined />}
                    iconClassName="bg-[#fff0e5] text-[#ff8739]"
                    title="Avg. review time"
                    value="20m"
                    helper="+15% last month"
                    footer={
                      <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full border-[6px] border-[#14b248] border-l-[#e5edf0] border-b-[#e5edf0] text-[11px] font-semibold tracking-[0.12em] text-[#6b7280]">
                        FAST
                      </div>
                    }
                  />

                  <div className="rounded-[24px] border border-[#e8ebf2] bg-white p-5 shadow-[0_18px_44px_-30px_rgba(16,30,61,0.45)]">
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8fbf6] text-[18px] text-[#1bc4a3]">
                        <CheckCircleOutlined />
                      </span>
                      <span className="text-[15px] font-medium text-[#3a3e48]">
                        Quality score
                      </span>
                    </div>

                    <div className="mt-8 text-[50px] font-semibold leading-none tracking-[-0.04em] text-[#272b33]">
                      97%
                    </div>
                    <ProgressBar
                      progress={97}
                      progressClassName="bg-[#18b829]"
                    />
                  </div>

                  <StatCard
                    icon={<UserOutlined />}
                    iconClassName="bg-[#ffeaf4] text-[#ff5e98]"
                    title="Queue load"
                    value="30"
                    note="Pending global claims"
                    footer={
                      <button
                        type="button"
                        className="mt-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef1f6] text-[18px] text-[#687081] transition-colors hover:bg-[#e7ebf2]"
                      >
                        <ArrowRightOutlined className="-rotate-45" />
                      </button>
                    }
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.96fr)]">
                  <section className="min-w-0">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[24px] text-[#2569da]">☰</span>
                        <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-[#2c313c]">
                          Open Queue
                        </h2>
                      </div>

                      <div className="hidden items-center gap-2 lg:flex">
                        <div className="relative flex h-[64px] w-[120px] items-center justify-center rounded-full bg-[#161718] shadow-[0_18px_22px_-12px_rgba(0,0,0,0.55)]">
                          <div className="absolute left-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-white">
                            <Image
                              src="/assets/images/get-started.jpg"
                              alt="Queue owner"
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#7c3aed] text-[28px] font-semibold text-white">
                            O
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mb-5 rounded-full border border-[#d7dce6] bg-white px-4 py-2 text-[13px] font-medium text-[#7c8495] shadow-sm"
                    >
                      Sort by time
                    </button>

                    <div className="overflow-hidden rounded-[22px] border border-[#d7dce6] bg-white">
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-0 text-left">
                          <thead>
                            <tr className="bg-[#fbfcfe] text-[15px] font-medium text-[#353b47]">
                              <th className="border-b border-[#dfe4ec] px-4 py-5">
                                Miner ID
                              </th>
                              <th className="border-b border-[#dfe4ec] px-4 py-5">
                                Name / Company
                              </th>
                              <th className="border-b border-[#dfe4ec] px-4 py-5">
                                State / LGA
                              </th>
                              <th className="border-b border-[#dfe4ec] px-4 py-5">
                                Wait time
                              </th>
                              <th className="border-b border-[#dfe4ec] px-4 py-5">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {queueRows.map((row) => (
                              <tr
                                key={`${row.minerId}-${row.waitTime}`}
                                className="relative text-[15px] text-[#4b5260]"
                              >
                                <td
                                  className={`border-b border-[#edf1f7] px-4 py-6 ${
                                    row.highlighted
                                      ? "border-l-[3px] border-l-[#f1c232]"
                                      : ""
                                  }`}
                                >
                                  {row.minerId}
                                </td>
                                <td className="border-b border-[#edf1f7] px-4 py-6">
                                  {row.company}
                                </td>
                                <td className="border-b border-[#edf1f7] px-4 py-6">
                                  {row.location}
                                </td>
                                <td
                                  className={`border-b border-[#edf1f7] px-4 py-6 font-medium text-[#5d6370] ${
                                    row.waitTimeClassName ?? ""
                                  }`}
                                >
                                  {row.waitTime}
                                </td>
                                <td className="border-b border-[#edf1f7] px-4 py-6">
                                  <button
                                    type="button"
                                    className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#101e3d] px-4 text-[14px] font-medium text-white shadow-[0_14px_24px_-18px_rgba(16,30,61,0.8)] transition-colors hover:bg-[#16284f]"
                                    style={{ color: "#ffffff" }}
                                  >
                                    <UserOutlined />
                                    Claim
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-center border-t border-[#edf1f7] px-4 py-4">
                        <button
                          type="button"
                          className="inline-flex items-center gap-3 rounded-[10px] border border-[#e1e5ee] bg-[#f7f8fb] px-4 py-2.5 text-[14px] font-medium text-[#5f6675]"
                        >
                          View full queue
                          <ArrowRightOutlined />
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="min-w-0">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-[24px] text-[#2569da]">
                        <UsergroupAddOutlined />
                      </span>
                      <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-[#2c313c]">
                        My Active Queue
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {activeQueueCards.map((card, index) => (
                        <div
                          key={`${card.tag}-${index}`}
                          className="rounded-[22px] border border-[#d7dce6] bg-white p-6 shadow-[0_18px_44px_-36px_rgba(16,30,61,0.55)]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[16px] text-[#454c5d]">
                                Miner ID{" "}
                                <span className="font-semibold text-[#1368db]">
                                  #BLD - 10024
                                </span>
                              </div>
                              <div className="mt-2 text-[15px] text-[#8a92a1]">
                                Oke Mineral Miners{" "}
                                <span className="mx-1">•</span> Kano/Kano
                              </div>
                            </div>

                            <span
                              className={`inline-flex rounded-[6px] px-3 py-1 text-[12px] font-medium ${card.tagClassName}`}
                            >
                              {card.tag}
                            </span>
                          </div>

                          <div className="mt-6 flex items-center justify-between text-[13px] font-medium uppercase tracking-[0.06em] text-[#666d7b]">
                            <span>Verification Progress</span>
                            <span>{card.progress}%</span>
                          </div>

                          <div className="mt-2">
                            <ProgressBar
                              progress={card.progress}
                              progressClassName={card.progressClassName}
                            />
                          </div>

                          <div className="pt-6">
                            <button
                              type="button"
                              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-[12px] bg-[#101e3d] px-5 text-[16px] font-medium text-white shadow-[0_18px_30px_-22px_rgba(16,30,61,0.85)] transition-colors hover:bg-[#16284f]"
                              style={{ color: "#ffffff" }}
                            >
                              Resume verification
                              <ArrowRightOutlined />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
