"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Select, Switch, Tooltip, Skeleton } from "antd";
import {
  BankOutlined,
  LockOutlined,
  BellOutlined,
  CreditCardOutlined,
  SafetyOutlined,
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

  const [notifyNewOrderRequests, setNotifyNewOrderRequests] = useState(true);
  const [notifyPaymentUpdates, setNotifyPaymentUpdates] = useState(true);
  const [notifyComplianceReminders, setNotifyComplianceReminders] = useState(true);
  const [savingNotificationKey, setSavingNotificationKey] = useState<string | null>(null);

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
    setNotifyNewOrderRequests(user.profile?.notify_new_order_requests ?? true);
    setNotifyPaymentUpdates(user.profile?.notify_payment_updates ?? true);
    setNotifyComplianceReminders(user.profile?.notify_compliance_reminders ?? true);
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

  const NOTIFICATION_TOGGLES = {
    new_order_requests: {
      label: "New order requests",
      value: notifyNewOrderRequests,
      setValue: setNotifyNewOrderRequests,
      payloadKey: "notify_new_order_requests" as const,
    },
    payment_updates: {
      label: "Payment updates",
      value: notifyPaymentUpdates,
      setValue: setNotifyPaymentUpdates,
      payloadKey: "notify_payment_updates" as const,
    },
    compliance_reminders: {
      label: "Compliance reminders",
      value: notifyComplianceReminders,
      setValue: setNotifyComplianceReminders,
      payloadKey: "notify_compliance_reminders" as const,
    },
  };

  const handleToggleNotification = async (key: keyof typeof NOTIFICATION_TOGGLES, checked: boolean) => {
    if (!profileId) return;
    const toggle = NOTIFICATION_TOGGLES[key];
    const previous = toggle.value;
    toggle.setValue(checked);
    try {
      setSavingNotificationKey(key);
      await updateMinerProfile(profileId, { [toggle.payloadKey]: checked });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    } catch (err: unknown) {
      toggle.setValue(previous);
      showToast(errorMessage(err, "Failed to update notification preference"), "error");
    } finally {
      setSavingNotificationKey(null);
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

  const [activeSection, setActiveSection] = useState(NAV_ITEMS[0].key);
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.key)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    isClickScrolling.current = true;
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      isClickScrolling.current = false;
    }, 700);
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
          <Button
            loading={saving}
            onClick={handleSaveProfile}
            className="!bg-[#14244a] !text-white !border-none hover:!bg-[#1c3363]"
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left nav */}
        <div className="lg:col-span-1">
          <div className="bg-none flex flex-col gap-2 p-2 lg:sticky lg:top-6">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => scrollTo(item.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm text-left transition-colors ${
                    isActive
                      ? "bg-gray-300 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
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
            <div className="space-y-4 max-w-5xl">
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
              <Button
                loading={changingPassword}
                onClick={handleUpdatePassword}
                className="!bg-[#14244a] !text-white !border-none hover:!bg-[#1c3363]"
              >
                Update Password
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account.</p>
                </div>
                <Switch
                  checked={twoFa}
                  loading={savingTwoFa}
                  onChange={handleToggleTwoFa}
                  style={twoFa ? { backgroundColor: "#14244a" } : undefined}
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-900 mb-3">Login Activity</p>
              {loadingActivity ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : loginActivity.length === 0 ? (
                <p className="text-xs text-gray-400">No login activity recorded yet.</p>
              ) : (
                <div className="space-y-1 text-sm text-gray-700">
                  <div>
                    Last login: {dayjs(loginActivity[0].created_at).format("MMMM D, YYYY [at] h:mm A")}
                  </div>
                  <div>Device: {loginActivity[0].device || "Unknown device"}</div>
                  {loginActivity[0].location ? <div>Location: {loginActivity[0].location}</div> : null}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard id="notifications" title="Notifications" subtitle="Choose what you want to be notified about.">
            <div className="space-y-3 mt-3">
              {(Object.keys(NOTIFICATION_TOGGLES) as Array<keyof typeof NOTIFICATION_TOGGLES>).map((key) => {
                const toggle = NOTIFICATION_TOGGLES[key];
                return (
                  <div key={key} className="flex items-center justify-between max-w-5xl">
                    <span className="text-sm text-gray-700">{toggle.label}</span>
                    <Switch
                      checked={toggle.value}
                      loading={savingNotificationKey === key}
                      onChange={(checked) => handleToggleNotification(key, checked)}
                      style={toggle.value ? { backgroundColor: "#14244a" } : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard id="bank" title="Bank & Payment Details" subtitle="Manage your payout and transaction information.">
            <div className="flex items-center justify-between gap-2 text-sm text-gray-700 mb-4 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
              <span className="flex items-center gap-2">
                <LockOutlined className="text-gray-400" />
                Verification Status
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  user?.profile?.bank_detail?.verification_status === "verified"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {user?.profile?.bank_detail?.verification_status || "Unverified"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
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
                  suffix={<LockOutlined className="text-gray-300" />}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Account Name</label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  suffix={<LockOutlined className="text-gray-300" />}
                />
              </div>
            </div>
            <div className="mt-4 max-w-5xl flex items-center gap-2 text-xs text-gray-500 bg-[#f3f7f8] border border-gray-100 rounded-lg px-3 py-2.5">
              <span>🔒</span>
              Your information is securely stored and encrypted.
            </div>
            <Button
              loading={savingBank}
              onClick={handleSaveBank}
              className="mt-4 !bg-[#14244a] !mt-4 !text-white !border-none hover:!bg-[#1c3363]"
            >
              Save Bank Details
            </Button>
          </SectionCard>

          <SectionCard id="compliance" title="Compliance Preferences" subtitle="Configure how you manage compliance requirements.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Preferred Contact Method</label>
                <Select
                  className="w-full"
                  value={contactMethod}
                  onChange={setContactMethod}
                  options={[{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }]}
                />
                <p className="text-xs text-gray-400 mt-1.5">How you prefer to be contacted regarding compliance matters</p>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Assigned Compliance Partner</label>
                <Tooltip title="Assigned by your compliance team, not editable here">
                  <Input placeholder="Jane Okafor" value={user?.profile?.assigned_compliance_partner_name || ""} disabled />
                </Tooltip>
                <p className="text-xs text-gray-400 mt-1.5">Your dedicated compliance officer for document reviews</p>
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
                <p className="text-xs text-gray-400 mt-1.5">How often you want to receive reminders for expiring documents</p>
              </div>
            </div>
            <Button
              loading={savingCompliance}
              onClick={handleSaveCompliance}
              className="mt-4 !bg-[#14244a] !mt-5 !text-white !border-none hover:!bg-[#1c3363]"
            >
              Save Preferences
            </Button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
