import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface Breed {
  id: string;
  name: string;
  species: 'Cattle' | 'Buffalo';
  origin: string;
  features: string[];
  avgWeight: string;
  milkYield: string;
  characteristics: string[];
}

export interface IdentificationResult {
  id: string;
  breed: string;
  confidence: number;
  species: string;
  origin: string;
  avgWeight: string;
  milkYield: string;
  features: string[];
  characteristics: string[];
  description: string;
}

export interface Animal {
  id: string;
  name?: string;
  breedId: string;
  species: 'Cattle' | 'Buffalo';
  age?: number;
  gender: 'Male' | 'Female';
  weight?: number;
  color?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    village?: string;
    district?: string;
    state?: string;
  };
  owner?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  health?: {
    status: 'Healthy' | 'Sick' | 'Under Treatment';
    vaccinations?: string[];
    lastCheckup?: Date;
  };
  images?: string[];
  notes?: string;
  registeredBy: string;
  registeredAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'flw' | 'admin' | 'expert';
  region?: string;
  state?: string;
  district?: string;
  lastLogin?: Date;
}

export interface DashboardOverview {
  currentMonth: {
    animalsRegistered: number;
    identificationsCompleted: number;
    accuracyRate: number;
    activeUsers: number;
  };
  growth: {
    animals: number;
    identifications: number;
    accuracy: number;
  };
  topBreeds: string[];
  regionalDistribution: Record<string, { animals: number; identifications: number }>;
  lastUpdated: string;
}

// API client
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ success: boolean; data: { token: string; user: User } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'flw' | 'admin' | 'expert';
    region?: string;
    state?: string;
    district?: string;
  }) {
    const response = await this.request<{ success: boolean; data: { token: string; user: User } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request<{ success: boolean; data: User }>('/auth/profile');
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // ML/Breed identification endpoints
  async identifyBreed(imageFile: File, options?: { topK?: number; confidenceThreshold?: number }) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (options?.topK) formData.append('topK', options.topK.toString());
    if (options?.confidenceThreshold) formData.append('confidenceThreshold', options.confidenceThreshold.toString());

    return this.request<{ success: boolean; data: { results: IdentificationResult[]; processingTime: number; modelVersion: string } }>('/ml/identify', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }

  async getBreeds(species?: string) {
    const params = species ? `?species=${species}` : '';
    return this.request<{ success: boolean; data: Record<string, Breed>; count: number }>(`/ml/breeds${params}`);
  }

  async getBreedInfo(breedId: string) {
    return this.request<{ success: boolean; data: Breed }>(`/ml/breeds/${breedId}`);
  }

  async getModelInfo() {
    return this.request<{ success: boolean; data: any }>('/ml/model-info');
  }

  // Animal endpoints
  async getAnimals(params?: {
    species?: string;
    breed?: string;
    gender?: string;
    health?: string;
    owner?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    
    const queryString = searchParams.toString();
    const url = `/animals${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ success: boolean; data: { animals: Animal[]; pagination: any } }>(url);
  }

  async getAnimal(animalId: string) {
    return this.request<{ success: boolean; data: Animal }>(`/animals/${animalId}`);
  }

  async createAnimal(animalData: Omit<Animal, 'id' | 'registeredBy' | 'registeredAt' | 'updatedAt'>) {
    return this.request<{ success: boolean; data: Animal }>('/animals', {
      method: 'POST',
      body: JSON.stringify(animalData),
    });
  }

  async updateAnimal(animalId: string, animalData: Partial<Animal>) {
    return this.request<{ success: boolean; data: Animal }>(`/animals/${animalId}`, {
      method: 'PUT',
      body: JSON.stringify(animalData),
    });
  }

  async deleteAnimal(animalId: string) {
    return this.request<{ success: boolean; message: string; data: Animal }>(`/animals/${animalId}`, {
      method: 'DELETE',
    });
  }

  // Identification history endpoints
  async getIdentifications(params?: {
    userId?: string;
    status?: string;
    breed?: string;
    species?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    
    const queryString = searchParams.toString();
    const url = `/identify${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ success: boolean; data: { identifications: any[]; pagination: any } }>(url);
  }

  async getIdentification(identificationId: string) {
    return this.request<{ success: boolean; data: any }>(`/identify/${identificationId}`);
  }

  // Dashboard endpoints
  async getDashboardOverview() {
    return this.request<{ success: boolean; data: DashboardOverview }>('/dashboard/overview');
  }

  async getMonthlyPerformance(params?: { startDate?: string; endDate?: string; period?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    
    const queryString = searchParams.toString();
    const url = `/dashboard/monthly${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ success: boolean; data: any }>(url);
  }

  async getWeeklyPerformance(params?: { startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    
    const queryString = searchParams.toString();
    const url = `/dashboard/weekly${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ success: boolean; data: any }>(url);
  }

  async getDailyPerformance(params?: { startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    
    const queryString = searchParams.toString();
    const url = `/dashboard/daily${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ success: boolean; data: any }>(url);
  }

  async getRegionalPerformance() {
    return this.request<{ success: boolean; data: any }>('/dashboard/regional');
  }

  async getBreedPerformance() {
    return this.request<{ success: boolean; data: any }>('/dashboard/breeds');
  }

  async getUserActivity() {
    return this.request<{ success: boolean; data: any }>('/dashboard/user-activity');
  }

  async getSystemPerformance() {
    return this.request<{ success: boolean; data: any }>('/dashboard/system-performance');
  }

  async getRecentActivity(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<{ success: boolean; data: any }>(`/dashboard/recent-activity${params}`);
  }

  // Sync endpoints
  async getSyncStatus() {
    return this.request<{ success: boolean; data: any }>('/sync/status');
  }

  async uploadSyncData(data: { type: string; data: any[]; lastSyncTimestamp?: string; deviceInfo?: any }) {
    return this.request<{ success: boolean; data: any }>('/sync/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async downloadSyncData(type?: string, lastSyncTimestamp?: string) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (lastSyncTimestamp) params.append('lastSyncTimestamp', lastSyncTimestamp);
    
    const queryString = params.toString();
    const url = `/sync/download${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ success: boolean; data: any }>(url);
  }

  async getSyncHistory(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `/sync/history${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ success: boolean; data: any }>(url);
  }

  async getSyncStats() {
    return this.request<{ success: boolean; data: any }>('/sync/stats');
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// React Query hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: Parameters<typeof apiClient.register>[0]) =>
      apiClient.register(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => apiClient.getProfile(),
    enabled: !!apiClient.token,
  });
};

export const useBreeds = (species?: string) => {
  return useQuery({
    queryKey: ['breeds', species],
    queryFn: () => apiClient.getBreeds(species),
  });
};

export const useBreedInfo = (breedId: string) => {
  return useQuery({
    queryKey: ['breeds', breedId],
    queryFn: () => apiClient.getBreedInfo(breedId),
    enabled: !!breedId,
  });
};

export const useIdentifyBreed = () => {
  return useMutation({
    mutationFn: ({ imageFile, options }: { imageFile: File; options?: { topK?: number; confidenceThreshold?: number } }) =>
      apiClient.identifyBreed(imageFile, options),
  });
};

export const useAnimals = (params?: Parameters<typeof apiClient.getAnimals>[0]) => {
  return useQuery({
    queryKey: ['animals', params],
    queryFn: () => apiClient.getAnimals(params),
  });
};

export const useAnimal = (animalId: string) => {
  return useQuery({
    queryKey: ['animals', animalId],
    queryFn: () => apiClient.getAnimal(animalId),
    enabled: !!animalId,
  });
};

export const useCreateAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animalData: Parameters<typeof apiClient.createAnimal>[0]) =>
      apiClient.createAnimal(animalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
};

export const useUpdateAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animalId, animalData }: { animalId: string; animalData: Parameters<typeof apiClient.updateAnimal>[1] }) =>
      apiClient.updateAnimal(animalId, animalData),
    onSuccess: (_, { animalId }) => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animals', animalId] });
    },
  });
};

export const useDeleteAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animalId: string) => apiClient.deleteAnimal(animalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
};

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => apiClient.getDashboardOverview(),
  });
};

export const useMonthlyPerformance = (params?: Parameters<typeof apiClient.getMonthlyPerformance>[0]) => {
  return useQuery({
    queryKey: ['dashboard', 'monthly', params],
    queryFn: () => apiClient.getMonthlyPerformance(params),
  });
};

export const useWeeklyPerformance = (params?: Parameters<typeof apiClient.getWeeklyPerformance>[0]) => {
  return useQuery({
    queryKey: ['dashboard', 'weekly', params],
    queryFn: () => apiClient.getWeeklyPerformance(params),
  });
};

export const useDailyPerformance = (params?: Parameters<typeof apiClient.getDailyPerformance>[0]) => {
  return useQuery({
    queryKey: ['dashboard', 'daily', params],
    queryFn: () => apiClient.getDailyPerformance(params),
  });
};

export const useRegionalPerformance = () => {
  return useQuery({
    queryKey: ['dashboard', 'regional'],
    queryFn: () => apiClient.getRegionalPerformance(),
  });
};

export const useBreedPerformance = () => {
  return useQuery({
    queryKey: ['dashboard', 'breeds'],
    queryFn: () => apiClient.getBreedPerformance(),
  });
};

export const useUserActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'user-activity'],
    queryFn: () => apiClient.getUserActivity(),
  });
};

export const useSystemPerformance = () => {
  return useQuery({
    queryKey: ['dashboard', 'system-performance'],
    queryFn: () => apiClient.getSystemPerformance(),
  });
};

export const useRecentActivity = (limit?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: () => apiClient.getRecentActivity(limit),
  });
};

export const useSyncStatus = () => {
  return useQuery({
    queryKey: ['sync', 'status'],
    queryFn: () => apiClient.getSyncStatus(),
  });
};

export const useSyncHistory = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['sync', 'history', page, limit],
    queryFn: () => apiClient.getSyncHistory(page, limit),
  });
};

export const useSyncStats = () => {
  return useQuery({
    queryKey: ['sync', 'stats'],
    queryFn: () => apiClient.getSyncStats(),
  });
};

export default apiClient;
