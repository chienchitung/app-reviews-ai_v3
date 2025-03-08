export interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  stripePriceId?: string;
} 