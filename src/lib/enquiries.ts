const KEY = "aurelstone-enquiries";

export type EnquiryKind = "visit" | "quote" | "sample";

export type Enquiry = {
  id: string;
  kind: EnquiryKind;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  suburb?: string;
  date?: string;
  time?: string;
  interests: string[];
  materials?: string[];
  projectType?: string;
  message?: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function listEnquiries(): Enquiry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Enquiry[]) : [];
  } catch {
    return [];
  }
}

export function saveEnquiry(
  input: Omit<Enquiry, "id" | "createdAt">,
): Enquiry {
  const item: Enquiry = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const all = [item, ...listEnquiries()].slice(0, 40);
  if (canUseStorage()) {
    localStorage.setItem(KEY, JSON.stringify(all));
  }
  return item;
}
