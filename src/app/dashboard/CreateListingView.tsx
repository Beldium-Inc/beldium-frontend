"use client";

import { Form, Input, Select, Switch, Upload, Button, Radio, Checkbox, Skeleton, DatePicker } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { createListing, updateListing, getListingDetail, CreateListingPayload } from "@/src/features/miner/listings/api";
import { showToast } from "@/src/store/toast.store";
import type { UploadFile } from "antd/es/upload/interface";

const MINERAL_FORMS = [
  { value: "powder", label: "Powder", desc: "Fine particles" },
  { value: "ore", label: "Ore", desc: "Raw mineral" },
  { value: "concentrate", label: "Concentrate", desc: "Refined concentrate" },
  { value: "ingot", label: "Ingot", desc: "Solid bars" },
];

const PAYMENT_TERMS = [
  { value: "lc", label: "Letter of Credit (LC)" },
  { value: "sbLC", label: "SBLC" },
  { value: "advance", label: "30% Advance / 70% BL" },
  { value: "cad", label: "Cash Against Documents" },
  { value: "negotiable", label: "Negotiable" },
];

const SAMPLE_TYPES = [
  { value: "borehole_core", label: "Borehole Core" },
  { value: "grab_sample", label: "Grab Sample" },
  { value: "channel_sample", label: "Channel Sample" },
  { value: "composite_sample", label: "Composite Sample" },
];

const STEPS = [
  { key: "product_identity", label: "Product Identity" },
  { key: "lab_report", label: "Lab Report & Chemical Specification" },
  { key: "quantity_location", label: "Quantity & Location" },
  { key: "other_information", label: "Other Information" },
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px]">●</span>
      <h2 className="text-base font-semibold text-gray-900">{children}</h2>
    </div>
  );
}

function StepStepper({ current, onChange }: { current: number; onChange: (i: number) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-2">
      {STEPS.map((s, i) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onChange(i)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
            i === current
              ? "bg-indigo-50 text-indigo-600"
              : i < current
              ? "text-indigo-500"
              : "text-gray-400"
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              i === current ? "bg-indigo-600 text-white" : i < current ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"
            }`}
          >
            {i + 1}
          </span>
          {s.label}
        </button>
      ))}
    </div>
  );
}

export default function CreateListingView() {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(0);
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const { data: existingListing, isLoading: loadingExisting } = useQuery({
    queryKey: ["listingDetail", editId],
    queryFn: () => getListingDetail(editId as string),
    enabled: !!editId,
  });

  useEffect(() => {
    if (!existingListing?.data) return;
    const l = existingListing.data;
    form.setFieldsValue({
      mineral_type: l.mineral_type,
      grade: l.grade,
      mineral_form: l.mineral_form,
      chemical_specs: l.chemical_specs?.map((s) => ({ component_name: s.component_name, percentage: s.percentage })),
      verification_type: l.verification_type,
      quantity_available: l.quantity_supply?.quantity_available,
      monthly_capacity: l.quantity_supply?.monthly_capacity,
      min_order_quantity: l.quantity_supply?.min_order_quantity,
      repeat_supply_capability: l.quantity_supply?.repeat_supply_capability,
      mine_state: l.location_delivery?.mine_state,
      mine_lga: l.location_delivery?.mine_lga,
      delivery_basis: l.location_delivery?.delivery_basis,
      packaging_type: l.location_delivery?.packaging_type,
      estimated_lead_time_days: l.location_delivery?.estimated_lead_time_days,
      pricing_method: l.pricing?.pricing_method,
      asking_price_per_mt: l.pricing?.asking_price_per_mt,
      currency: l.pricing?.currency,
      payment_terms: (l.commercial_terms?.payment_term || "").split(",").filter(Boolean),
      inspection_allowed: l.commercial_terms?.inspection_allowed,
      sample_available: l.commercial_terms?.sample_available,
      additional_notes: l.commercial_terms?.additional_notes,
      description: l.description,
      collection_date: l.sample_identity?.collection_date ? dayjs(l.sample_identity.collection_date) : undefined,
      sample_type: l.sample_identity?.sample_type,
      depth_from: l.sample_identity?.depth_from,
      depth_to: l.sample_identity?.depth_to,
      sample_location_description: l.sample_identity?.sample_location_description,
      lab_reference_number: l.lab_report?.lab_reference_number,
      testing_laboratory: l.lab_report?.testing_laboratory,
      lab_testing_date: l.lab_report?.lab_testing_date ? dayjs(l.lab_report.lab_testing_date) : undefined,
    });
  }, [existingListing, form]);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (error) => reject(error);
    });

  type FormValues = {
    mineral_type?: string;
    mineral_form?: string;
    grade?: string | number;
    verification_type?: string;
    description?: string;
    assay_report_file?: UploadFile[];
    chemical_specs?: Array<{ component_name?: string; percentage?: string | number }>;
    quantity_available?: number | string;
    monthly_capacity?: number | string;
    min_order_quantity?: number | string;
    repeat_supply_capability?: boolean;
    mine_state?: string;
    mine_lga?: string;
    delivery_basis?: string;
    packaging_type?: string;
    estimated_lead_time_days?: number | string;
    pricing_method?: string;
    asking_price_per_mt?: number | string;
    currency?: string;
    payment_terms?: string[];
    inspection_allowed?: boolean;
    sample_available?: boolean;
    additional_notes?: string;
    media?: UploadFile[];
    collection_date?: dayjs.Dayjs;
    sample_type?: string;
    depth_from?: number | string;
    depth_to?: number | string;
    sample_location_description?: string;
    lab_reference_number?: string;
    testing_laboratory?: string;
    lab_testing_date?: dayjs.Dayjs;
    lab_report_file?: UploadFile[];
  };

  const submit = async (values: FormValues) => {
    try {
      setUploading(true);
      const files: File[] = (values.media || []).map((f) => f.originFileObj as File).filter(Boolean);
      const mediaBase64 = await Promise.all(files.map((f) => toBase64(f)));

      const assayFile = (values.assay_report_file || [])[0]?.originFileObj as File | undefined;
      const assayB64 = assayFile ? await toBase64(assayFile) : "";

      const labReportFile = (values.lab_report_file || [])[0]?.originFileObj as File | undefined;
      const labReportB64 = labReportFile ? await toBase64(labReportFile) : "";

      const payload: CreateListingPayload = {
        mineral_type: values.mineral_type || "",
        mineral_form: values.mineral_form || "ore",
        grade: String(values.grade || ""),
        verification_type: values.verification_type || "independent_lab",
        description: values.description || "",
        assay_report: assayB64,
        chemical_specs: (values.chemical_specs || [])
          .filter((s) => s?.component_name)
          .map((s) => ({
            component_name: s?.component_name || "",
            percentage: String(s?.percentage || ""),
          })),
        sample_identity: {
          collection_date: values.collection_date ? values.collection_date.format("YYYY-MM-DD") : "",
          sample_type: values.sample_type || "",
          depth_from: Number(values.depth_from || 0),
          depth_to: Number(values.depth_to || 0),
          sample_location_description: values.sample_location_description || "",
        },
        lab_report: {
          lab_reference_number: values.lab_reference_number || "",
          testing_laboratory: values.testing_laboratory || "",
          lab_testing_date: values.lab_testing_date ? values.lab_testing_date.format("YYYY-MM-DD") : "",
          ...(labReportB64 ? { lab_report_file: labReportB64 } : {}),
        },
        quantity_supply: {
          quantity_available: Number(values.quantity_available || 0),
          monthly_capacity: Number(values.monthly_capacity || 0),
          min_order_quantity: Number(values.min_order_quantity || 0),
          repeat_supply_capability: Boolean(values.repeat_supply_capability),
        },
        location_delivery: {
          mine_state: values.mine_state || "",
          mine_lga: values.mine_lga || "",
          delivery_basis: values.delivery_basis || "",
          packaging_type: values.packaging_type || "",
          estimated_lead_time_days: Number(values.estimated_lead_time_days || 0),
        },
        pricing: {
          pricing_method: values.pricing_method || "fixed",
          asking_price_per_mt: String(values.asking_price_per_mt || ""),
          currency: values.currency || "",
        },
        commercial_terms: {
          payment_term: (values.payment_terms || []).join(","),
          inspection_allowed: Boolean(values.inspection_allowed),
          sample_available: Boolean(values.sample_available),
          additional_notes: values.additional_notes || "",
        },
        media: mediaBase64.map((b64) => ({ file: b64 })),
      };

      if (editId) {
        // Don't overwrite existing assay/media with empty values when nothing new was uploaded
        if (!assayB64) delete (payload as Partial<CreateListingPayload>).assay_report;
        if (mediaBase64.length === 0) delete (payload as Partial<CreateListingPayload>).media;
        await updateListing(editId, payload);
        showToast("Listing updated successfully", "success");
      } else {
        await createListing(payload);
        showToast("Listing created successfully", "success");
      }
      form.resetFields();
      location.assign(editId ? `/dashboard/listings/${editId}` : '/dashboard?view=listings');
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        // @ts-expect-error narrowed runtime check
        err.response?.data?.message
          ? // @ts-expect-error runtime guard
            err.response.data.message
          : "Failed to create listing";
      showToast(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  if (editId && loadingExisting) {
    return (
      <div className="max-w-8xl mx-auto px-4 md:px-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto space-y-6 pb-24 px-4 md:px-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{editId ? "Edit Listing" : "Create New Listing"}</h1>
        <p className="text-sm md:text-base text-gray-500">
          Provide accurate technical specifications and compliance data for your mineral assets.
        </p>
      </div>

      <Form form={form} layout="vertical" onFinish={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            <StepStepper current={step} onChange={setStep} />

            {/* STEP 1: Product Identity */}
            <div className={step === 0 ? "space-y-6" : "hidden"}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Product Identity</SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Mineral type" name="mineral_type" rules={[{ required: true, message: "Mineral type is required" }]}>
                    <Input placeholder="Lithium" />
                  </Form.Item>
                  <Form.Item
                    label="Grade/Purity (%)"
                    name="grade"
                    rules={[{ required: true, message: "Grade is required" }]}
                    extra="Enter laboratory-tested lithium oxide percentage (Li2O %)"
                  >
                    <Input placeholder="e.g. 90" suffix="%" />
                  </Form.Item>
                </div>
                <Form.Item label="Mineral form" name="mineral_form" initialValue="ore" rules={[{ required: true }]}>
                  <Radio.Group className="w-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {MINERAL_FORMS.map((f) => (
                        <Radio.Button
                          key={f.value}
                          value={f.value}
                          className="!h-auto !py-3 !px-4 !rounded-lg text-left w-full [&>span:last-child]:block"
                        >
                          <span className="block font-medium text-sm">{f.label}</span>
                          <span className="block text-xs text-gray-400">{f.desc}</span>
                        </Radio.Button>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>
              </div>

              {/* Sample Identity */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Sample Identity</SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Collection Date" name="collection_date">
                    <DatePicker className="w-full" />
                  </Form.Item>
                  <Form.Item label="Sample Type" name="sample_type">
                    <Select placeholder="Select sample type" options={SAMPLE_TYPES} />
                  </Form.Item>
                  <Form.Item label="Depth From (m)" name="depth_from">
                    <Input type="number" min={0} placeholder="0" />
                  </Form.Item>
                  <Form.Item label="Depth To (m)" name="depth_to">
                    <Input type="number" min={0} placeholder="0" />
                  </Form.Item>
                </div>
                <Form.Item label="Sample Location Description" name="sample_location_description">
                  <Input.TextArea rows={3} placeholder="Describe where the sample was collected" />
                </Form.Item>
              </div>

              <div className="flex justify-end">
                <Button type="primary" size="large" onClick={() => setStep(1)}>Next</Button>
              </div>
            </div>

            {/* STEP 2: Lab Report & Chemical Specification */}
            <div className={step === 1 ? "space-y-6" : "hidden"}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Lab Report Details</SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Lab Reference Number" name="lab_reference_number">
                    <Input placeholder="e.g. LAB-2026-0012" />
                  </Form.Item>
                  <Form.Item label="Testing Laboratory" name="testing_laboratory">
                    <Input placeholder="e.g. SGS Nigeria" />
                  </Form.Item>
                  <Form.Item label="Lab Testing Date" name="lab_testing_date">
                    <DatePicker className="w-full" />
                  </Form.Item>
                </div>
                <Form.Item
                  label="Lab Report PDF"
                  name="lab_report_file"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                >
                  <Upload.Dragger accept=".pdf,.jpg,.jpeg,.png" maxCount={1} beforeUpload={() => false}>
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="text-sm">Choose file or drag and drop it here</p>
                    <p className="text-xs text-gray-400">JPEG, PNG, and PDF formats, up to 20 MB.</p>
                  </Upload.Dragger>
                </Form.Item>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Chemical Specification</SectionHeader>
                <Form.List name="chemical_specs" initialValue={[{ component_name: "Fe2O3" }, { component_name: "SiO2" }, { component_name: "Al2O3" }, { component_name: "Moisture" }]}>
                  {(fields, helpers) => (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map((field) => (
                          <div key={field.key} className="flex items-end gap-2">
                            <Form.Item
                              {...field}
                              name={[field.name, "percentage"]}
                              label={
                                <Form.Item noStyle name={[field.name, "component_name"]}>
                                  <Input variant="borderless" className="!p-0 !text-xs !text-gray-500 font-medium w-32" placeholder="Component" />
                                </Form.Item>
                              }
                              className="flex-1"
                            >
                              <Input placeholder="e.g. 90" suffix="%" />
                            </Form.Item>
                            <Button danger type="text" onClick={() => helpers.remove(field.name)}>×</Button>
                          </div>
                        ))}
                      </div>
                      <Button type="link" className="px-0" onClick={() => helpers.add({ component_name: "", percentage: "" })}>
                        + Add component
                      </Button>
                    </div>
                  )}
                </Form.List>

                <Form.Item
                  label="Assay Report (optional)"
                  name="assay_report_file"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                  className="mt-4"
                >
                  <Upload.Dragger accept=".pdf,.jpg,.jpeg,.png" maxCount={1} beforeUpload={() => false}>
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="text-sm">Choose file or drag and drop it here</p>
                    <p className="text-xs text-gray-400">JPEG, PNG, and PDF formats, up to 20 MB.</p>
                  </Upload.Dragger>
                </Form.Item>

                <Form.Item label="Verification" name="verification_type" initialValue="independent_lab" className="mt-2">
                  <Radio.Group className="flex flex-col gap-2">
                    <Radio value="independent_lab">Verified by Independent Lab</Radio>
                    <Radio value="self">Seller Declared Only</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>

              <div className="flex justify-between">
                <Button size="large" onClick={() => setStep(0)}>Back</Button>
                <Button type="primary" size="large" onClick={() => setStep(2)}>Next</Button>
              </div>
            </div>

            {/* STEP 3: Quantity & Location */}
            <div className={step === 2 ? "space-y-6" : "hidden"}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Quantity &amp; Supply</SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Available Quantity" name="quantity_available" rules={[{ required: true, message: "Required" }]}>
                    <Input type="number" min={0} placeholder="0" />
                  </Form.Item>
                  <Form.Item label="Monthly Capacity" name="monthly_capacity" rules={[{ required: true, message: "Required" }]}>
                    <Input type="number" min={0} placeholder="0" />
                  </Form.Item>
                  <Form.Item label="Min. Order Quantity (MOQ)" name="min_order_quantity" rules={[{ required: true, message: "Required" }]}>
                    <Input type="number" min={0} placeholder="e.g. 90" />
                  </Form.Item>
                  <Form.Item label="Repeat Supply Capability" name="repeat_supply_capability" valuePropName="checked" extra="Enable if this is a continuous production asset">
                    <Switch />
                  </Form.Item>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Location &amp; Delivery</SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Form.Item label="Mine State" name="mine_state" rules={[{ required: true, message: "Required" }]}>
                    <Select
                      placeholder="Select mine state"
                      options={[{ value: "Kwara", label: "Kwara" }, { value: "Oyo", label: "Oyo" }, { value: "Zamfara", label: "Zamfara" }, { value: "Osun", label: "Osun" }]}
                    />
                  </Form.Item>
                  <Form.Item label="Mine LGA" name="mine_lga" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="Local Government Area" />
                  </Form.Item>
                  <Form.Item label="Delivery Basis" name="delivery_basis">
                    <Select placeholder="Select your delivery basis" options={[{ value: "FOB", label: "FOB" }, { value: "CIF", label: "CIF" }, { value: "EXW", label: "EXW" }]} />
                  </Form.Item>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Packaging Type" name="packaging_type" rules={[{ required: true, message: "Required" }]}>
                    <Select placeholder="Select your delivery basis" options={[{ value: "jumbo_bags", label: "Jumbo Bags, Containerized" }, { value: "bulk", label: "Bulk" }]} />
                  </Form.Item>
                  <Form.Item label="Estimated Lead Time to Load" name="estimated_lead_time_days">
                    <Input type="number" min={0} placeholder="0" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex justify-between">
                <Button size="large" onClick={() => setStep(1)}>Back</Button>
                <Button type="primary" size="large" onClick={() => setStep(3)}>Next</Button>
              </div>
            </div>

            {/* STEP 4: Other Information */}
            <div className={step === 3 ? "space-y-6" : "hidden"}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Pricing</SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Form.Item label="Pricing Method" name="pricing_method" initialValue="fixed">
                    <Select options={[{ value: "fixed", label: "Fixed" }, { value: "rfq", label: "Request for Quote" }]} />
                  </Form.Item>
                  <Form.Item label="Asking Price per MT" name="asking_price_per_mt">
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item label="Currency" name="currency" initialValue="NGN">
                    <Input placeholder="e.g. NGN, USD" />
                  </Form.Item>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Commercial Terms</SectionHeader>
                <Form.Item label="Accepted Payment Terms" name="payment_terms" rules={[{ required: true, message: "Select at least one" }]}>
                  <Checkbox.Group className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {PAYMENT_TERMS.map((t) => (
                      <Checkbox key={t.value} value={t.value}>{t.label}</Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.Item>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Inspection Allowed" name="inspection_allowed" valuePropName="checked" extra="Enable verification">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="Sample Available" name="sample_available" valuePropName="checked" extra="Provide small samples for testing">
                    <Switch />
                  </Form.Item>
                </div>
                <Form.Item label="Additional Notes" name="additional_notes">
                  <Input.TextArea rows={2} placeholder="Further commercial details" />
                </Form.Item>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Description</SectionHeader>
                <Form.Item label="Add Listing Details (500 characters limit)" name="description">
                  <Input.TextArea rows={4} maxLength={500} showCount placeholder="Describe the listing details, provenance, etc." />
                </Form.Item>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <SectionHeader>Product Images</SectionHeader>
                <Form.Item
                  label="Media Uploads"
                  name="media"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                >
                  <Upload.Dragger multiple accept=".jpg,.jpeg,.png,.pdf" beforeUpload={() => false} maxCount={8}>
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="text-sm">Choose file or drag and drop it here</p>
                    <p className="text-xs text-gray-400">JPEG, PNG, and PDF formats, up to 20 MB.</p>
                  </Upload.Dragger>
                </Form.Item>
              </div>

              <div className="flex justify-between">
                <Button size="large" onClick={() => setStep(2)}>Back</Button>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Actions</h3>
              <Button htmlType="submit" type="primary" size="large" block loading={uploading}>
                {editId ? "Update Listing" : "Submit Listing"}
              </Button>
              {!editId && (
                <Button
                  size="large"
                  block
                  onClick={() => {
                    showToast("Draft saved", "success");
                  }}
                >
                  Save &amp; Exit
                </Button>
              )}
              <Button
                size="large"
                danger
                block
                onClick={() => {
                  form.resetFields();
                  location.assign(editId ? `/dashboard/listings/${editId}` : '/dashboard?view=listings');
                }}
              >
                {editId ? "Cancel" : "Discard"}
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
