export interface AppInfo {
  platform: string;
  app_name: string;
  category: string;
  developer: string;
  rating: string;
  rating_count: string;
  price: string;
  icon_url: string;
  version: string;
  update_date: string;
  ios_similar_app: string | null;
  similarity: string | null;
}

export interface SearchResult {
  id: string;
  name: string;
  selected: boolean;
  appStoreUrl?: string;
  playStoreUrl?: string;
  isLoading?: boolean;
  error?: string;
  appInfo?: {
    ios?: AppInfo;
    android?: AppInfo;
  };
} 