export enum Role {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: number;
  role: Role;
  text: string;
  image?: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}

export interface FarmDetails {
  crop: string;
  soil: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export type LanguageCode = 'en' | 'hi' | 'pa' | 'bn' | 'mr' | 'gu' | 'te' | 'kn' | 'rwr' | 'bgc' | 'bho';

export interface Language {
  code: LanguageCode;
  name: string; // e.g., "English"
  nativeName: string; // e.g., "English" or "हिन्दी"
}


export interface User {
  fullName: string;
  username: string;
  phone?: string;
  password?: string; // Password is used for creation, but should not be passed around.
  gender?: string;
  dob?: string;
  address?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export enum Crop {
    Rice = "Rice",
    Wheat = "Wheat",
    Maize = "Maize",
    Sugarcane = "Sugarcane",
    Cotton = "Cotton",
    Soybean = "Soybean",
    Potato = "Potato",
    Tomato = "Tomato",
    Onion = "Onion",
    Mustard = "Mustard"
}

export enum SoilType {
    Alluvial = "Alluvial Soil",
    Black = "Black Soil",
    Red = "Red and Yellow Soil",
    Laterite = "Laterite Soil",
    Arid = "Arid Soil",
    Saline = "Saline Soil",
    Peaty = "Peaty and Marshy Soil",
    Forest = "Forest Soil",
}


// E-commerce types
export enum ProductCategory {
  Seeds = "Seeds & Saplings",
  Fertilizers = "Fertilizers & Pesticides",
  Tools = "Farming Tools",
  Irrigation = "Irrigation Systems",
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  keywords: string[];
}

// Admin Panel Types
export type AdminPageType = 'dashboard' | 'users' | 'translations' | 'playground' | 'codeEditor';