import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Select, Upload } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";
import { StepHeader } from "../component/StepHeader";
import Logo from "../component/Logo";
import MobileTimeline from "../component/MobileTimeline";
import { UploadedFilePreview } from "../component/UploadedFilePreview";
import { NIGERIA_STATES } from "../component/nigeriaStates";
import { MineLocationPicker, MineLocationResult } from "../component/MineLocationPicker";

const BUSINESS_ROLES = ["Mining Company", "Licensed Miner", "Lease Holder", "Operator / Contractor"];

export function StepOne({ data, onNext }: { data: unknown; onNext: () => void }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [govDoc, setGovDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [location, setLocation] = useState<MineLocationResult | null>(null);

  const saveStep = async (values: Record<string, unknown>) => {
    const formData = new FormData();
    formData.append("onboarding_step", "miner_identity");
    formData.append("country", "Nigeria");
    formData.append("state_of_operation", String(values.stateOperation || ""));
    formData.append("local_government_area", String(values.lga || ""));
    formData.append("business_role", String(values.businessRole || ""));
    if (location?.pin) {
      formData.append("mine_latitude", String(location.pin.lat));
      formData.append("mine_longitude", String(location.pin.lng));
      formData.append("mine_boundary", JSON.stringify(location.boundary));
    }
    formData.append("government_issue_document_type", String(values.govDocType || ""));
    if (govDoc) {
      formData.append("government_issue_document", govDoc);
    } else {
      formData.append("government_issue_document", "");
    }
    await minerOnboarding(formData);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      await saveStep(values);
      showToast("Saved miner identity", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message || "Failed to save miner identity";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      const values = await form.validateFields();
      setExiting(true);
      await saveStep(values);
      showToast("Progress saved. You can resume anytime.", "success");
      router.push("/dashboard");
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } }; errorFields?: unknown };
      if (e?.errorFields) return; // antd validation error, already shown inline
      const msg = e?.response?.data?.message || "Failed to save progress";
      showToast(msg, "error");
    } finally {
      setExiting(false);
    }
  };

  return (
    <div className="flex flex-col lg:px-20 pt-56 gap-6">
      <LoadingOverlay visible={loading} message="Saving..." />
      <Logo />
      <MobileTimeline />
      <StepHeader title="Miner identity" subtitle="Tell us who is registering this operation" />
      <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
        <Form.Item
          label="Full name / Company name"
          name="name"
          rules={[{ required: true, message: errorMsg("Full name / Company name") }]}
        >
          <Input placeholder="Oke Ayo Minerals Ltd" />
        </Form.Item>

        <Form.Item
          label="Business Role"
          name="businessRole"
          rules={[{ required: true, message: errorMsg("Please select business role") }]}
        >
          <input type="hidden" />
        <BusinessRoleGrid form= {form} />
        </Form.Item>

        <Form.Item label="Country of operation">
          <Select
            value="Nigeria"
            disabled
            options={[{ value: "Nigeria", label: "🇳🇬  Nigeria" }]}
          />
        </Form.Item>

        <Form.Item
          label="State of operation"
          name="stateOperation"
          rules={[{ required: true, message: errorMsg("Select your state of operation") }]}
        >
          <Select
            placeholder="Select your state of operation"
            showSearch
            options={NIGERIA_STATES.map((s) => ({ value: s, label: s }))}
          />
        </Form.Item>

        <Form.Item
          label="Local Government Area (LGA)"
          name="lga"
          rules={[{ required: true, message: errorMsg("Select your local government area") }]}
        >
          <Input placeholder="Select your Local Government Area" />
        </Form.Item>

        <div className="mb-6">
          <label className="block text-sm text-gray-700 mb-1.5">Place mine Location</label>
          {location?.pin ? (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">📍 Mine Pin Coordinates</span>
                <button type="button" onClick={() => setMapOpen(true)} className="text-gray-400" aria-label="Edit location">
                  ✎
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-400">LATITUDE</div>
                  <div className="text-sm font-semibold">{location.pin.lat.toFixed(6)}°</div>
                </div>
                <div>
                  <div className="text-gray-400">LONGITUDE</div>
                  <div className="text-sm font-semibold">{location.pin.lng.toFixed(6)}°</div>
                </div>
              </div>
            </div>
          ) : (
            <Button block size="large" onClick={() => setMapOpen(true)}>
              Click to place mine location
            </Button>
          )}
        </div>

        <Form.Item
          label="Government-issued ID (National ID / Passport / Driver's License)"
          name="govDocType"
          rules={[{ required: true, message: errorMsg("Select an ID type") }]}
        >
          <Select
            placeholder="Select document type"
            options={[
              { value: "passport", label: "Passport" },
              { value: "national_id", label: "National ID" },
              { value: "driver_license", label: "Driver's License" },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Upload.Dragger
            beforeUpload={(file) => {
              setGovDoc(file);
              return false;
            }}
            onRemove={() => setGovDoc(null)}
            showUploadList={false}
            multiple={false}
            accept=".pdf,.png,.jpg,.jpeg"
          >
            <p className="text-sm">Choose file or drag and drop it here</p>
            <p className="text-xs text-gray-400">JPEG, PNG, and PDF formats, up to 20 MB.</p>
          </Upload.Dragger>
          {govDoc && (
            <UploadedFilePreview
              fileName={govDoc.name}
              fileSizeKb={Math.round(govDoc.size / 1024)}
              onRemove={() => setGovDoc(null)}
            />
          )}
        </Form.Item>

        <div className="flex items-center gap-8 mt-6">
          <Form.Item className="mb-0 flex-1">
            <Button type="primary" htmlType="submit" block size="large">
              Save and continue
              <Image src="/assets/icons/arrow-white-icon.svg" height={20} width={20} alt="" />
            </Button>
          </Form.Item>
          <button
            type="button"
            onClick={handleSaveAndExit}
            disabled={exiting}
            className="text-sm whitespace-nowrap text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
          >
            {exiting ? "Saving..." : "Save and exit"}
          </button>
        </div>
      </Form>

      <MineLocationPicker
        open={mapOpen}
        initial={location}
        onClose={() => setMapOpen(false)}
        onSubmit={(result) => {
          setLocation(result);
          setMapOpen(false);
        }}
      />
    </div>
  );
}

function BusinessRoleGrid({ form }: { form: ReturnType<typeof Form.useForm>[0] }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 mb-2">
      {BUSINESS_ROLES.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => {
            setSelected(role);
            form.setFieldValue("businessRole", role);
          }}
          className="flex items-center gap-2 text-sm text-left"
        >
          <span
            className={`h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
              selected === role ? "border-[#0B1B3F]" : "border-gray-300"
            }`}
          >
            {selected === role && <span className="h-2 w-2 rounded-full bg-[#0B1B3F]" />}
          </span>
          {role}
        </button>
      ))}
    </div>
  );
}
