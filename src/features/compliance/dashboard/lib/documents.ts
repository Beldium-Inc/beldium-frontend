import type {
  ReviewDocumentFile,
  ReviewDocumentKind,
} from "@/src/features/compliance/dashboard/types";
import type { ComplianceMinerDetailResponse } from "@/src/features/compliance/dashboard/api";

export function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}


export function getComplianceApiOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "");
  }

  switch (process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase()) {
    case "production":
    case "prod":
      return "https://api.beldium.com";
    case "staging":
    case "stage":
    default:
      return "https://stg-api.beldium.com";
  }
}


export function normalizeMinerDocumentUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed, `${getComplianceApiOrigin()}/`).toString();
  } catch {
    return null;
  }
}


export function getFirstStringField(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const candidate = record[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}


export function getDocumentNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").filter(Boolean).at(-1);

    return segment ? decodeURIComponent(segment) : null;
  } catch {
    return null;
  }
}


export function inferReviewDocumentKind(
  name: string,
  url: string,
  mimeType?: string | null,
): ReviewDocumentKind {
  const lowerName = name.toLowerCase();
  const lowerUrl = url.toLowerCase();
  const lowerMime = mimeType?.toLowerCase() ?? "";

  if (
    lowerMime.includes("pdf") ||
    lowerName.endsWith(".pdf") ||
    lowerUrl.endsWith(".pdf")
  ) {
    return "pdf";
  }

  if (
    lowerMime.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg|bmp|tiff?)($|\?)/i.test(lowerName) ||
    /\.(png|jpe?g|gif|webp|svg|bmp|tiff?)($|\?)/i.test(lowerUrl)
  ) {
    return "image";
  }

  return "file";
}


export function parseMinerDocumentRecord(record: Record<string, unknown>) {
  const viewUrl =
    normalizeMinerDocumentUrl(
      getFirstStringField(record, [
        "view_url",
        "file_url",
        "document_url",
        "url",
        "preview_url",
        "signed_url",
        "link",
        "href",
        "file",
        "document",
        "path",
      ]),
    ) ??
    normalizeMinerDocumentUrl(record.url) ??
    normalizeMinerDocumentUrl(record.file);

  const downloadUrl =
    normalizeMinerDocumentUrl(
      getFirstStringField(record, [
        "download_url",
        "signed_download_url",
        "download_link",
        "download",
      ]),
    ) ?? viewUrl;

  if (!viewUrl && !downloadUrl) {
    return null;
  }

  const mimeType = getFirstStringField(record, [
    "mime_type",
    "content_type",
    "file_type",
    "type",
  ]);
  const documentUrlForName = downloadUrl ?? viewUrl;
  const name =
    getFirstStringField(record, [
      "name",
      "file_name",
      "filename",
      "original_name",
      "document_name",
      "title",
      "label",
    ]) ??
    (documentUrlForName ? getDocumentNameFromUrl(documentUrlForName) : null);
  const hasDocumentShape =
    Object.keys(record).some((key) =>
      /(document|file|upload|attachment|certificate|license|report|image)/i.test(
        key,
      ),
    ) ||
    Boolean(name) ||
    Boolean(mimeType);

  if (!hasDocumentShape || !name) {
    return null;
  }

  const normalizedViewUrl = viewUrl ?? downloadUrl;
  const normalizedDownloadUrl = downloadUrl ?? viewUrl;

  if (!normalizedViewUrl || !normalizedDownloadUrl) {
    return null;
  }

  return {
    id:
      getFirstStringField(record, ["id", "uuid"]) ??
      `${name}-${normalizedDownloadUrl}`,
    name,
    type: inferReviewDocumentKind(name, normalizedDownloadUrl, mimeType),
    viewUrl: normalizedViewUrl,
    downloadUrl: normalizedDownloadUrl,
  } satisfies ReviewDocumentFile;
}


export function getMinerDetailDocuments(
  response: ComplianceMinerDetailResponse | undefined,
): ReviewDocumentFile[] {
  const documents = new Map<string, ReviewDocumentFile>();

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isObjectRecord(value)) {
      return;
    }

    const parsedDocument = parseMinerDocumentRecord(value);

    if (parsedDocument) {
      documents.set(
        `${parsedDocument.name}::${parsedDocument.downloadUrl}`,
        parsedDocument,
      );
    }

    Object.values(value).forEach(visit);
  }

  visit(response?.data);

  return [...documents.values()];
}


/**
 * Force-downloads a file instead of opening it in a new tab/viewer.
 *
 * A plain `<a download href={crossOriginUrl}>` does NOT reliably force a
 * download — the `download` attribute is only honored by browsers for
 * same-origin URLs. Our document URLs are presigned S3/Backblaze links
 * (cross-origin), so browsers were just navigating to/opening the file
 * instead of downloading it. Fetching the file as a blob and downloading
 * that local blob URL works regardless of origin.
 */
export async function downloadFile(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file (${response.status})`);
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const candidate = error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };
    const message = candidate.response?.data?.message;

    if (Array.isArray(message) && message.length > 0) {
      return message.join(", ");
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}


