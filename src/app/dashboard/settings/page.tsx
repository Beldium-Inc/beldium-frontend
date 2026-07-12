"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Select, Switch, Tooltip, Skeleton } from "antd";
import {
  BankOutlined,
  LockOutlined,
  BellOutlined,
  CreditCardOutlined,
  SafetyOutlined,
  LockFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getUser,
  updateUser,
  updateMinerProfile,
  updateBankDetail,
  changePassword,
  getLoginActivity,
} from "@/src/features/miner/settings/api";
import { showToast } from "@/src/store/toast.store";

const NAV_ITEMS = [
  { key: "profile", label: "Organizational Profile", icon: BankOutlined },
  { key: "security", label: "Account & Security", icon: LockOutlined },
  { key: "notifications", label: "Notifications", icon: BellOutlined },
  { key: "bank", label: "Bank & Payment Details", icon: CreditCardOutlined },
  { key: "compliance", label: "Compliance Preferences", icon: SafetyOutlined },
];

const STATES = ["Kwara", "Oyo", "Zamfara", "Osun", "Plateau", "Kaduna", "Lagos"];
const BANKS = [
  "First Bank of Nigeria", "GTBank", "Access Bank", "Zenith Bank",
  "UBA", "Fidelity Bank", "Union Bank", "Stanbic IBTC",
];

function SectionCard({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="bg-white rounded-xl border border-gray-100 p-6 scroll-mt-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function ComingSoonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mt-3">
      <LockFilled className="mt-0.5 text-gray-400" />
      <span>{children}</span>
    </div>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["userProfile"], queryFn: getUser });
  const user = data?.data;
  const profileId = user?.profile?.id;

  const { data: loginActivityRes, isLoading: loadingActivity } = useQuery({
    queryKey: ["loginActivity"],
    queryFn: getLoginActivity,
  });
  const loginActivity = loginActivityRes?.data || [];

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<string | undefined>(undefined);
  const [lga, setLga] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [twoFa, setTwoFa] = useState(false);
  const [savingTwoFa, setSavingTwoFa] = useState(false);

  const [bankName, setBankName] = useState<string | undefined>(undefined);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [savingBank, setSavingBank] = useState(false);

  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [reminderFrequency, setReminderFrequency] = useState<"weekly" | "monthly" | "quarterly">("monthly");
  const [savingCompliance, setSavingCompliance] = useState(false);

  useEffect(() => {
    if (!user) return;
    setCompanyName(user.company_name || "");
    setRole(user.profile?.business_role || "");
    setPhone(user.phone_number || "");
    setState(user.profile?.state_of_operation || undefined);
    setLga(user.profile?.local_government_area || "");
    setTwoFa(user.profile?.require_two_factor_authentication || false);
    setBankName(user.profile?.bank_detail?.bank_name || undefined);
    setAccountNumber(user.profile?.bank_detail?.account_number || "");
    setAccountName(user.profile?.bank_detail?.account_name || "");
    setContactMethod(user.profile?.preferred_contact_method || "email");
    setReminderFrequency(user.profile?.reminder_frequency || "monthly");
  }, [user]);

  const errorMessage = (err: unknown, fallback: string) => {
    const e = err as { response?: { data?: { message?: unknown } } };
    const msg = e?.response?.data?.message;
    return typeof msg === "string" ? msg : fallback;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await updateUser(user.id, { company_name: companyName, phone_number: phone });
      if (profileId) {
        await updateMinerProfile(profileId, {
          business_role: role,
          state_of_operation: state,
          local_government_area: lga,
        });
      }
      showToast("Profile updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    } catch (err: unknown) {
      showToast(errorMessage(err, "Failed to update profile"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      showToast("New password and confirmation must match", "error");
      return;
    }
    try {
      setChangingPassword(true);
      await changePassword({ old_password: currentPassword, new_password: newPassword });
      showToast("Password updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      showToast(errorMessage(err, "Failed to update password"), "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggleTwoFa = async (checked: boolean) => {
    if (!profileId) return;
    const previous = twoFa;
    setTwoFa(checked);
    try {
      setSavingTwoFa(true);
      await updateMinerProfile(profileId, { require_two_factor_authentication: checked });
      showToast(checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled", "success");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    } catch (err: unknown) {
      setTwoFa(previous);
      showToast(errorMessage(err, "Failed to update 2FA setting"), "error");
    } finally {
      setSavingTwoFa(false);
    }
  };

  const handleSaveBank = async () => {
    if (!profileId) return;
    try {
      setSavingBank(true);
      await updateBankDetail(profileId, {
        bank_name: bankName,
        account_number: accountNumber || undefined,
        account_name: accountName || undefined,
      });
      showToast("Bank details updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setAccountNumber("");
    } catch (err: unknown) {
      showToast(errorMessage(err, "Failed to update bank details"), "error");
    } finally {
      setSavingBank(false);
    }
  };

  const handleSaveCompliance = async () => {
    if (!profileId) return;
    try {
      setSavingCompliance(true);
      await updateMinerProfile(profileId, {
        preferred_contact_method: contactMethod,
        reminder_frequency: reminderFrequency,
      });
      showToast("Compliance preferences updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    } catch (err: unknown) {
      showToast(errorMessage(err, "Failed to update compliance preferences"), "error");
    } finally {
      setSavingCompliance(false);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="px-4 md:px-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm md:text-base text-gray-500">Manage your account, security, and operational preferences.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()}>Cancel</Button>
          <Button type="primary" loading={saving} onClick={handleSaveProfile}>Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left nav */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-2 lg:sticky lg:top-6">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => scrollTo(item.key)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="text-sm" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sections */}
        <div className="lg:col-span-3 space-y-6">
          <SectionCard id="profile" title="Organizational Profile" subtitle="Basic details about your mining operation.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Company / Full Name</label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={isLoading} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Role</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Mine Operator" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Email Address</label>
                <Tooltip title="Email cannot be changed">
                  <Input value={user?.email || ""} disabled />
                </Tooltip>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">State</label>
                <Select
                  value={state}
                  onChange={setState}
                  className="w-full"
                  options={STATES.map((s) => ({ value: s, label: s }))}
                  placeholder="Select state"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">LGA</label>
                <Input value={lga} onChange={(e) => setLga(e.target.value)} placeholder="e.g. Jos North" />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="security" title="Account & Security" subtitle="Manage your password and authentication settings.">
            <div className="space-y-4 max-w-md">
              <p className="text-sm font-medium text-gray-700">Password</p>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Current Password</label>
                <Input.Password value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">New Password</label>
                <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Confirm Password</label>
                <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button type="primary" loading={changingPassword} onClick={handleUpdatePassword}>
                Update Password
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account.</p>
                </div>
                <Switch checked={twoFa} loading={savingTwoFa} onChange={handleToggleTwoFa} />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-900 mb-3">Login Activity</p>
              {loadingActivity ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : loginActivity.length === 0 ? (
                <p className="text-xs text-gray-400">No login activity recorded yet.</p>
              ) : (
                <div className="space-y-3 max-w-md">
                  {loginActivity.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                      <div>
                        <div className="text-gray-900 font-medium">{entry.device || "Unknown device"}</div>
                        <div className="text-gray-400">{entry.ip_address}{entry.location ? ` · ${entry.location}` : ""}</div>
                      </div>
                      <div className="text-gray-400">{dayjs(entry.created_at).format("MMM DD, YYYY h:mm A")}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard id="notifications" title="Notifications" subtitle="Choose what you want to be notified about.">
            <ComingSoonNote>
              Notification preferences are not yet persisted by the backend, toggles here won&apos;t save until that&apos;s built.
            </ComingSoonNote>
            <div className="space-y-3 mt-3 opacity-50 pointer-events-none">
              {["New order requests", "Payment updates", "Compliance reminders"].map((label) => (
                <div key={label} className="flex items-center justify-between max-w-md">
                  <span className="text-sm text-gray-700">{label}</span>
                  <Switch disabled defaultChecked />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard id="bank" title="Bank & Payment Details" subtitle="Manage your payout and transaction information.">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <span>Verification Status</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs capitalize ${
                  user?.profile?.bank_detail?.verification_status === "verified"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {user?.profile?.bank_detail?.verification_status || "Unverified"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1.5">Bank Name</label>
                <Select
                  className="w-full"
                  placeholder="Select bank"
                  value={bankName}
                  onChange={setBankName}
                  options={BANKS.map((b) => ({ value: b, label: b }))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Account Number</label>
                <Input
                  placeholder={user?.profile?.bank_detail?.account_number || "Enter account number"}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Account Name</label>
                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </div>
            </div>
            <Button type="primary" className="mt-4" loading={savingBank} onClick={handleSaveBank}>
              Save Bank Details
            </Button>
          </SectionCard>

          <SectionCard id="compliance" title="Compliance Preferences" subtitle="Configure how you manage compliance requirements.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Preferred Contact Method</label>
                <Select
                  className="w-full"
                  value={contactMethod}
                  onChange={setContactMethod}
                  options={[{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }]}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Assigned Compliance Partner</label>
                <Tooltip title="Assigned by your compliance team, not editable here">
                  <Input value={user?.profile?.assigned_compliance_partner_name || "Not assigned yet"} disabled />
                </Tooltip>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Reminder Frequency</label>
                <Select
                  className="w-full"
                  value={reminderFrequency}
                  onChange={setReminderFrequency}
                  options={[
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                  ]}
                />
              </div>
            </div>
            <Button type="primary" className="mt-4" loading={savingCompliance} onClick={handleSaveCompliance}>
              Save Preferences
            </Button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
