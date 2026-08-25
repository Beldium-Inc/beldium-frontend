"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, Skeleton, Drawer, Empty, Card, Button, Modal, Form, Input, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  BarChartOutlined,
  InboxOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  AlertOutlined,
  WarningOutlined,
  CompassOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  getMiningSites,
  getMiningSiteSourceProfile,
  updateMiningSiteCoordinates,
  getMiningOrganisations,
  createMiningSite,
  createMiningOrganisation,
  MiningSite,
} from "@/src/features/miner/sites/api";
import { MineLocationPicker, MineLocationResult } from "@/src/features/onboard/component/MineLocationPicker";
import { showToast } from "@/src/store/toast.store";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  virgin: { bg: "bg-gray-100", text: "text-gray-600", label: "Virgin Site" },
  active: { bg: "bg-green-50", text: "text-green-700", label: "Active" },
  developing: { bg: "bg-blue-50", text: "text-blue-700", label: "Developing" },
  temporarily_inactive: { bg: "bg-orange-50", text: "text-orange-700", label: "Temporarily Inactive" },
  suspended: { bg: "bg-red-50", text: "text-red-700", label: "Suspended" },
  decommissioned: { bg: "bg-gray-100", text: "text-gray-500", label: "Decommissioned" },
};

function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || { bg: "bg-gray-100", text: "text-gray-600", label: status };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function siteInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

const SITE_AVATAR_COLORS = [
  "bg-indigo-50 text-indigo-600",
  "bg-teal-50 text-teal-600",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-600",
  "bg-violet-50 text-violet-600",
];

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return SITE_AVATAR_COLORS[hash % SITE_AVATAR_COLORS.length];
}

const MINING_METHOD_OPTIONS = [
  { value: "open_pit", label: "Open Pit" },
  { value: "shaft_or_underground", label: "Shaft / Underground" },
  { value: "exploration", label: "Exploration" },
];

export default function SitesPage() {
  const queryClient = useQueryClient();
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [addSiteOpen, setAddSiteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["mining-sites"],
    queryFn: getMiningSites,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["mining-site-source-profile", selectedSiteId],
    queryFn: () => getMiningSiteSourceProfile(selectedSiteId as string),
    enabled: !!selectedSiteId,
  });

  const sites = data?.data?.results ?? [];

  const initialMapLocation: MineLocationResult | null =
    profile?.data?.latitude && profile?.data?.longitude
      ? {
          pin: { lat: Number(profile.data.latitude), lng: Number(profile.data.longitude) },
          boundary: [],
          areaHectares: 0,
          perimeterMeters: 0,
        }
      : null;

  const handleSaveLocation = async (result: MineLocationResult) => {
    if (!selectedSiteId || !result.pin) return;
    try {
      setSavingLocation(true);
      await updateMiningSiteCoordinates(selectedSiteId, {
        latitude: result.pin.lat,
        longitude: result.pin.lng,
      });
      showToast("Site location updated", "success");
      setMapOpen(false);
      queryClient.invalidateQueries({ queryKey: ["mining-site-source-profile", selectedSiteId] });
      queryClient.invalidateQueries({ queryKey: ["mining-sites"] });
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || "Failed to update location", "error");
      // Re-throw so the picker's own submit button can show an inline error
      // and stay open for a retry, instead of silently closing on failure.
      throw error;
    } finally {
      setSavingLocation(false);
    }
  };

  const stats = useMemo(() => {
    const total = sites.length;
    const active = sites.filter((s) => s.status === "active").length;
    const withCoords = sites.filter((s) => s.latitude && s.longitude).length;
    const scored = sites.filter((s) => s.compliance_score);
    const avgScore = scored.length
      ? Math.round(scored.reduce((sum, s) => sum + Number(s.compliance_score), 0) / scored.length)
      : null;
    return { total, active, withCoords, avgScore };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const columns: ColumnsType<MiningSite> = [
    {
      title: "Site",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(name)}`}
          >
            {siteInitials(name)}
          </div>
          <span className="font-medium text-gray-900">{name}</span>
        </div>
      ),
    },
    { title: "Mineral", dataIndex: "mineral_type", key: "mineral_type", render: (v: string) => v || "-" },
    {
      title: "Location",
      key: "location",
      render: (_, row) => (
        <span className="text-gray-600">
          {[row.local_government_area, row.state_of_operation, row.country]
            .filter(Boolean)
            .join(", ") || "-"}
        </span>
      ),
    },
    {
      title: "Coordinates",
      key: "coords",
      render: (_, row) =>
        row.latitude && row.longitude ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <EnvironmentOutlined /> {Number(row.latitude).toFixed(4)}, {Number(row.longitude).toFixed(4)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-400">
            <EnvironmentOutlined /> Not set
          </span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusPill status={status} />,
    },
    {
      title: "Compliance",
      dataIndex: "compliance_score",
      key: "compliance_score",
      render: (score: string | null) =>
        score ? (
          <span className="font-semibold text-gray-900">{score}%</span>
        ) : (
          <span className="text-xs text-gray-400">Not scored</span>
        ),
    },
  ];

  return (
    <div className="px-4 md:px-0">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mining Sites</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every site under your mining organisation(s), with location, status, and compliance score.
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddSiteOpen(true)}>
          Add Site
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<CompassOutlined />} label="Total Sites" value={stats.total} tone="bg-indigo-50 text-indigo-600" />
        <StatCard icon={<SafetyCertificateOutlined />} label="Active Sites" value={stats.active} tone="bg-green-50 text-green-600" />
        <StatCard icon={<EnvironmentOutlined />} label="Geo-tagged" value={stats.withCoords} tone="bg-blue-50 text-blue-600" />
        <StatCard
          icon={<BarChartOutlined />}
          label="Avg. Compliance"
          value={stats.avgScore !== null ? `${stats.avgScore}%` : "-"}
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm" styles={{ body: { padding: 0 } }}>
        {isLoading ? (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : sites.length === 0 ? (
          <div className="p-10">
            <Empty description="No mining sites yet">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddSiteOpen(true)}>
                Add your first site
              </Button>
            </Empty>
          </div>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={sites}
            pagination={false}
            scroll={{ x: "max-content" }}
            onRow={(row) => ({
              onClick: () => setSelectedSiteId(row.id),
              className: "cursor-pointer",
            })}
          />
        )}
      </Card>

      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(
                profile?.data?.name || ""
              )}`}
            >
              {profile?.data?.name ? siteInitials(profile.data.name) : ""}
            </div>
            <span className="font-semibold text-gray-900">{profile?.data?.name || "Site details"}</span>
          </div>
        }
        open={!!selectedSiteId}
        onClose={() => setSelectedSiteId(null)}
        width={520}
        styles={{ body: { background: "#F9FAFB" } }}
      >
        {profileLoading || !profile ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <div className="space-y-5">
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <StatusPill status={profile.data.status} />
                <div className="text-right">
                  <div className="text-xs text-gray-400">Compliance Score</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {profile.data.compliance_score ? `${profile.data.compliance_score}%` : "Not yet scored"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoField label="Mineral Type" value={profile.data.mineral_type} />
                <InfoField label="Mining Method" value={profile.data.mining_method} capitalize />
                <InfoField
                  label="Location"
                  value={
                    [profile.data.local_government_area, profile.data.state_of_operation, profile.data.country]
                      .filter(Boolean)
                      .join(", ") || null
                  }
                  span2
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                {profile.data.latitude && profile.data.longitude ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <EnvironmentOutlined />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Coordinates</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {Number(profile.data.latitude).toFixed(6)}°, {Number(profile.data.longitude).toFixed(6)}°
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <EnvironmentOutlined />
                    <span className="text-sm">No coordinates set for this site yet.</span>
                  </div>
                )}
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  disabled={savingLocation}
                  onClick={() => setMapOpen(true)}
                >
                  {profile.data.latitude ? "Edit" : "Set location"}
                </Button>
              </div>
            </Card>
              <br />


            <div className="grid grid-cols-2 gap-3">
              <SummaryCard icon={<SafetyCertificateOutlined />} label="Ownership" count={profile.data.ownership_records.length} tone="bg-indigo-50 text-indigo-600" />
              <SummaryCard icon={<ToolOutlined />} label="Equipment" count={profile.data.equipment.length} tone="bg-teal-50 text-teal-600" />
              <SummaryCard icon={<BarChartOutlined />} label="Production" count={profile.data.production_records.length} tone="bg-blue-50 text-blue-600" />
              <SummaryCard icon={<InboxOutlined />} label="Inventory" count={profile.data.inventory_movements.length} tone="bg-amber-50 text-amber-600" />
              <SummaryCard icon={<ExperimentOutlined />} label="Samples" count={profile.data.samples.length} tone="bg-violet-50 text-violet-600" />
              <SummaryCard icon={<FileSearchOutlined />} label="Inspections" count={profile.data.inspections.length} tone="bg-cyan-50 text-cyan-600" />
              <SummaryCard icon={<AlertOutlined />} label="Safety" count={profile.data.safety_records.length} tone="bg-rose-50 text-rose-600" />
              <SummaryCard icon={<WarningOutlined />} label="Non-conformities" count={profile.data.non_conformities.length} tone="bg-red-50 text-red-600" />
            </div>
          </div>
        )}
      </Drawer>

      <MineLocationPicker
        open={mapOpen}
        initial={initialMapLocation}
        onClose={() => setMapOpen(false)}
        onSubmit={handleSaveLocation}
      />

      <AddSiteModal open={addSiteOpen} onClose={() => setAddSiteOpen(false)} />
    </div>
  );
}

function AddSiteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [siteMapOpen, setSiteMapOpen] = useState(false);
  const [location, setLocation] = useState<MineLocationResult | null>(null);

  const { data: orgsData, isLoading: orgsLoading } = useQuery({
    queryKey: ["mining-organisations"],
    queryFn: getMiningOrganisations,
    enabled: open,
  });

  const organisations = orgsData?.data?.results ?? [];
  const hasOrganisations = organisations.length > 0;

  const handleClose = () => {
    form.resetFields();
    setLocation(null);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let organisationId = values.organisation as string | undefined;

      // A brand-new miner with zero organisations can't attach a site to
      // anything yet - create their first organisation inline instead of
      // forcing a separate trip through some other settings screen.
      if (!hasOrganisations) {
        const orgRes = await createMiningOrganisation({ name: values.organisationName });
        organisationId = orgRes?.data?.id;
      }

      if (!organisationId) {
        throw new Error("Select or create an organisation for this site.");
      }

      await createMiningSite({
        organisation: organisationId,
        name: values.name,
        country: values.country || undefined,
        state_of_operation: values.state_of_operation || undefined,
        local_government_area: values.local_government_area || undefined,
        mineral_type: values.mineral_type || undefined,
        mining_method: values.mining_method || undefined,
        depth_range: values.depth_range || undefined,
        ...(location?.pin ? { latitude: location.pin.lat, longitude: location.pin.lng } : {}),
      });

      showToast("Site added successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["mining-sites"] });
      queryClient.invalidateQueries({ queryKey: ["mining-organisations"] });
      handleClose();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errorFields" in error) return; // antd form validation error
      const e = error as { response?: { data?: { message?: string } }; message?: string };
      showToast(e?.response?.data?.message || e?.message || "Failed to add site", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add Mining Site"
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="Add Site"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="mt-4" disabled={orgsLoading}>
        <Form.Item name="name" label="Site Name" rules={[{ required: true, message: "Enter a site name" }]}>
          <Input placeholder="e.g. Kaduna Quarry" />
        </Form.Item>

        {hasOrganisations ? (
          <Form.Item
            name="organisation"
            label="Organisation"
            rules={[{ required: true, message: "Select an organisation" }]}
            initialValue={organisations.length === 1 ? organisations[0].id : undefined}
          >
            <Select
              placeholder="Select organisation"
              options={organisations.map((o) => ({ value: o.id, label: o.name }))}
              loading={orgsLoading}
            />
          </Form.Item>
        ) : (
          <Form.Item
            name="organisationName"
            label="Organisation Name"
            tooltip="You don't have a mining organisation yet - this creates your first one."
            rules={[{ required: true, message: "Enter an organisation name" }]}
          >
            <Input placeholder="e.g. Beldium Minerals Ltd" />
          </Form.Item>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="mineral_type" label="Mineral Type">
            <Input placeholder="e.g. Gold" />
          </Form.Item>
          <Form.Item name="mining_method" label="Mining Method">
            <Select placeholder="Select method" options={MINING_METHOD_OPTIONS} allowClear />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="country" label="Country">
            <Input placeholder="e.g. Nigeria" />
          </Form.Item>
          <Form.Item name="state_of_operation" label="State">
            <Input placeholder="e.g. Kaduna" />
          </Form.Item>
        </div>

        <Form.Item name="local_government_area" label="Local Government Area">
          <Input placeholder="e.g. Chikun" />
        </Form.Item>

        <Form.Item name="depth_range" label="Depth Range">
          <Input placeholder="e.g. 0-50m" />
        </Form.Item>

        <Form.Item label="Location">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
            {location?.pin ? (
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <EnvironmentOutlined className="text-blue-600" />
                {location.pin.lat.toFixed(6)}°, {location.pin.lng.toFixed(6)}°
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <EnvironmentOutlined />
                No location set
              </div>
            )}
            <Button size="small" icon={<EnvironmentOutlined />} onClick={() => setSiteMapOpen(true)}>
              {location?.pin ? "Edit" : "Set on map"}
            </Button>
          </div>
        </Form.Item>
      </Form>

      <MineLocationPicker
        open={siteMapOpen}
        initial={location}
        onClose={() => setSiteMapOpen(false)}
        onSubmit={async (result) => {
          setLocation(result);
          setSiteMapOpen(false);
        }}
      />
    </Modal>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-base ${tone}`}>{icon}</div>
        <div>
          <div className="text-xs text-gray-400">{label}</div>
          <div className="text-lg font-semibold text-gray-900">{value}</div>
        </div>
      </div>
    </Card>
  );
}

function SummaryCard({
  icon,
  label,
  count,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  tone: string;
}) {
  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm" styles={{ body: { padding: 14 } }}>
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${tone}`}>{icon}</div>
        <div className="min-w-0">
          <div className="text-xs text-gray-400 truncate">{label}</div>
          <div className="text-base font-semibold text-gray-900">{count}</div>
        </div>
      </div>
    </Card>
  );
}

function InfoField({
  label,
  value,
  span2,
  capitalize,
}: {
  label: string;
  value: string | null | undefined;
  span2?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : undefined}>
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-sm font-medium text-gray-900 mt-0.5 ${capitalize ? "capitalize" : ""}`}>
        {value ? value.toString().replace(/_/g, " ") : "-"}
      </div>
    </div>
  );
}
