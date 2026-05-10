import api from "./api";

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  sortOrder: number;
}

export const bannerService = {
  async getActive(): Promise<Banner[]> {
    const res = await api.get<{ data: Banner[] }>("/banners");
    return res.data.data.filter((b) => b.isActive);
  },
};
