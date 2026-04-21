import { customFetch } from "./api-client";

export interface CustomDomain {
  id: string;
  companyId: string;
  domain: string;
  status: "PENDING" | "ACTIVE";
  verificationData: { type: string; value: string; domain: string }[];
  createdAt: string;
  updatedAt: string;
}

export const dnsService = {
  async getDomain() {
    const response = await customFetch("/api/dns");

    return response.json() as Promise<{ domain: CustomDomain }>;
  },

  async addDomain(name: string) {
    const response = await customFetch("/api/dns", {
      method: "POST",

      body: JSON.stringify({ name }),
    });
    return response.json() as Promise<CustomDomain>;
  },

  async removeDomain(domain: string) {
    const response = await customFetch(`/api/dns/${domain}`, {
      method: "DELETE",
    });
    return response.json();
  },
};
