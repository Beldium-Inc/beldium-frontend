"use client";

import { Form, Input, Select, Switch, Upload, Button, Card } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useState } from "react";
import { createListing, CreateListingPayload } from "@/src/features/miner/listings/api";
import { showToast } from "@/src/store/toast.store";
import type { UploadFile } from "antd/es/upload/interface";

export default function CreateListingView() {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

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
    payment_term?: string;
    inspection_allowed?: boolean;
    sample_available?: boolean;
    additional_notes?: string;
    media?: UploadFile[];
  };

  const onFinish = async (values: FormValues) => {
    try {
      setUploading(true);
      const files: File[] = (values.media || []).map((f) => f.originFileObj as File).filter(Boolean);
      const mediaBase64 = await Promise.all(files.map((f) => toBase64(f)));

      const assayFile = (values.assay_report_file || [])[0]?.originFileObj as File | undefined;
      const assayB64 = assayFile ? await toBase64(assayFile) : "";

      const payload: CreateListingPayload = {
        mineral_type: values.mineral_type || "",
        mineral_form: values.mineral_form || "ore",
        grade: String(values.grade || ""),
        verification_type: values.verification_type || "independent_lab",
        description: values.description || "",
        assay_report: assayB64,
        chemical_specs: (values.chemical_specs || []).map((s) => ({
          component_name: s?.component_name || "",
          percentage: String(s?.percentage || ""),
        })),
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
          payment_term: values.payment_term || "lc",
          inspection_allowed: Boolean(values.inspection_allowed),
          sample_available: Boolean(values.sample_available),
          additional_notes: values.additional_notes || "",
        },
        media: mediaBase64.map((b64) => ({ file: b64 })),
      };

      await createListing(payload);
      showToast("Listing created successfully", "success");
      form.resetFields();
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-sm md:text-base text-gray-500">Provide mineral specifications and commercial terms</p>
        </div>
      </div>

      <Card className="rounded-xl">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Product Identity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Mineral Type" name="mineral_type" rules={[{ required: true, message: "Mineral type is required" }]}>
              <Input placeholder="Mineral type" />
            </Form.Item>
            <Form.Item label="Grade (%)" name="grade" rules={[{ required: true, message: "Grade is required" }]}>
              <Input placeholder="e.g. 68.97" />
            </Form.Item>
            <Form.Item label="Mineral Form" name="mineral_form" initialValue="ore">
              <Select options={[{ value: "ore", label: "Ore" }, { value: "powder", label: "Powder" }, { value: "concentrate", label: "Concentrate" }, { value: "ingot", label: "Ingot" }]} />
            </Form.Item>
          </div>

          {/* Chemical Specification */}
          <Form.List name="chemical_specs">
            {(fields: Array<{ key: number; name: number }>, helpers: { add: (initial?: { component_name?: string; percentage?: string }) => void; remove: (name: number) => void }) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-700">Chemical Specification</p>
                  <Button type="link" onClick={() => helpers.add({ component_name: "", percentage: "" })}>Add Component</Button>
                </div>
                {fields.map((field) => (
                  <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item {...field} name={[field.name, "component_name"]} label="Component Name" rules={[{ required: true, message: "Component name is required" }]}>
                      <Input placeholder="Fe, Cu, etc." />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, "percentage"]} label="Percentage" rules={[{ required: true, message: "Percentage is required" }]}>
                      <Input placeholder="e.g. 45.10" />
                    </Form.Item>
                    <div className="md:col-span-2">
                      <Button danger type="link" onClick={() => helpers.remove(field.name)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form.List>

          {/* Quantity & Supply */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Form.Item label="Available Quantity (MT)" name="quantity_available" rules={[{ required: true, message: "Required" }]}>
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item label="Monthly Capacity (MT)" name="monthly_capacity" rules={[{ required: true, message: "Required" }]}>
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item label="Min Order Quantity (MT)" name="min_order_quantity" rules={[{ required: true, message: "Required" }]}>
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item label="Repeat Supply Capability" name="repeat_supply_capability" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          {/* Location & Delivery */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Mine State" name="mine_state" rules={[{ required: true, message: "Required" }]}>
              <Select options={[{ value: "Kwara", label: "Kwara" }, { value: "Oyo", label: "Oyo" }, { value: "Zamfara", label: "Zamfara" }, { value: "Osun", label: "Osun" }]} />
            </Form.Item>
            <Form.Item label="Mine LGA" name="mine_lga" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="Local Government Area" />
            </Form.Item>
            <Form.Item label="Delivery Basis" name="delivery_basis">
              <Select options={[{ value: "FOB", label: "FOB" }, { value: "CIF", label: "CIF" }, { value: "EXW", label: "EXW" }]} />
            </Form.Item>
            <Form.Item label="Packaging Type" name="packaging_type" className="md:col-span-2">
              <Input placeholder="e.g. 50kg bags" />
            </Form.Item>
            <Form.Item label="Estimated Lead Time (days)" name="estimated_lead_time_days">
              <Input type="number" min={0} />
            </Form.Item>
          </div>

          {/* Pricing */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Pricing Method" name="pricing_method" initialValue="fixed">
              <Select options={[{ value: "fixed", label: "Fixed" }, { value: "negotiable", label: "Negotiable" }]} />
            </Form.Item>
            <Form.Item label="Asking Price per MT" name="asking_price_per_mt" rules={[{ required: true, message: "Required" }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item label="Currency" name="currency" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="e.g. NGN, USD" />
            </Form.Item>
          </div>

          {/* Commercial Terms */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Payment Term" name="payment_term" initialValue="lc">
              <Select options={[{ value: "lc", label: "LC" }, { value: "sbLC", label: "SBLC" }, { value: "advance", label: "Advance" }, { value: "negotiable", label: "Negotiable" }]} />
            </Form.Item>
            <Form.Item label="Inspection Allowed" name="inspection_allowed" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Sample Available" name="sample_available" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Additional Notes" name="additional_notes" className="md:col-span-3">
              <Input.TextArea rows={3} placeholder="Further commercial details" />
            </Form.Item>
          </div>

          {/* Description */}
          <Form.Item label="Description" name="description" className="mt-6">
            <Input.TextArea rows={3} placeholder="Describe the listing details, provenance, etc." />
          </Form.Item>

          {/* Assay Report Upload */}
          <Form.Item
            label="Assay Report (PDF/Image)"
            name="assay_report_file"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload.Dragger accept=".pdf,.jpg,.jpeg,.png" maxCount={1} beforeUpload={() => false}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="text-sm">Drop assay certificate (PDF/Image) or click to upload</p>
            </Upload.Dragger>
          </Form.Item>

          {/* Verification */}
          <Form.Item label="Verification Type" name="verification_type" initialValue="independent_lab">
            <Select options={[{ value: "independent_lab", label: "Independent Lab" }, { value: "self", label: "Seller Verified Only" }]} />
          </Form.Item>

          {/* Media Upload */}
          <Form.Item
            label="Media Uploads"
            name="media"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            className="mt-2"
          >
            <Upload.Dragger multiple accept=".jpg,.jpeg,.png,.pdf" beforeUpload={() => false} maxCount={8}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="text-sm">Choose files or drag & drop here</p>
              <p className="text-xs">JPEG, PNG, and PDF formats, up to 20 MB.</p>
            </Upload.Dragger>
          </Form.Item>

          <div className="flex flex-col md:flex-row gap-3 justify-end mt-6">
            <Button htmlType="submit" type="primary" size="large" className="min-h-11" loading={uploading}>
              Submit Listing
            </Button>
            <Button size="large" className="min-h-11">Save & Exit</Button>
            <Button size="large" danger className="min-h-11">Discard</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
