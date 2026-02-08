export interface User {
  id: number;
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface LandingPage {
  id: number;
  name: string;
  path: string;
  isActive: boolean;
  createdAt: string;
}

export interface Lead {
  id: number;
  landingPageId: number;
  email: string;
  name: string;
  createdAt: string;
  notes?: string;
}