import api from "./api";

export interface SiteSettings {
  logoUrl: string | null;
  logoText: string;
}

export const siteSettingService = {
  async getPublicSettings(): Promise<SiteSettings> {
    const res = await api.get<{ data: SiteSettings }>("/site-settings/public");
    return res.data.data;
  },
};
