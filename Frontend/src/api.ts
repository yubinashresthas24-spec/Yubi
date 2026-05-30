import { API_URL } from './config';
import { User, Inventory, Category, Item, DashboardStats, ItemCreate, ItemUpdate } from './types';

const TOKEN_KEY = 'inventrack_token';

// Helper to make API requests with automatic auth token injection and error/401 handling
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('inventrack_user');
    window.location.href = '/login';
    // Throw an error to halt execution flow in the calling components
    throw new Error('Unauthorized. Redirecting to login...');
  }

  if (!response.ok) {
    let detail = 'An error occurred';
    try {
      const errorData = await response.json();
      detail = errorData.detail || detail;
    } catch {
      // Ignore JSON parsing errors
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export async function register(email: string, password: string, name?: string): Promise<{ access_token: string; token_type: string }> {
  return request<{ access_token: string; token_type: string }>('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  return request<{ access_token: string; token_type: string }>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
}

export async function getMe(): Promise<User> {
  return request<User>('/auth/me');
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/dashboard/stats');
}

export async function getInventories(): Promise<Inventory[]> {
  return request<Inventory[]>('/inventories');
}

export async function createInventory(name: string, description?: string): Promise<Inventory> {
  return request<Inventory>('/inventories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });
}

export async function updateInventory(id: string, name: string, description?: string): Promise<Inventory> {
  return request<Inventory>(`/inventories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteInventory(id: string): Promise<void> {
  return request<void>(`/inventories/${id}`, {
    method: 'DELETE',
  });
}

export async function getInventory(id: string): Promise<Inventory> {
  return request<Inventory>(`/inventories/${id}`);
}

export async function getCategories(invId: string): Promise<Category[]> {
  return request<Category[]>(`/inventories/${invId}/categories`);
}

export async function createCategory(invId: string, name: string, description?: string): Promise<Category> {
  return request<Category>(`/inventories/${invId}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });
}

export async function updateCategory(invId: string, catId: string, name: string, description?: string): Promise<Category> {
  return request<Category>(`/inventories/${invId}/categories/${catId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteCategory(invId: string, catId: string): Promise<void> {
  return request<void>(`/inventories/${invId}/categories/${catId}`, {
    method: 'DELETE',
  });
}

export async function getItems(params?: { cat_id?: string; inv_id?: string }): Promise<Item[]> {
  let path = '/items';
  if (params) {
    const query = new URLSearchParams();
    if (params.cat_id) query.append('cat_id', params.cat_id);
    if (params.inv_id) query.append('inv_id', params.inv_id);
    const queryString = query.toString();
    if (queryString) {
      path += `?${queryString}`;
    }
  }
  return request<Item[]>(path);
}

export async function createItem(data: ItemCreate): Promise<Item> {
  return request<Item>('/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function updateItem(id: string, data: ItemUpdate): Promise<Item> {
  return request<Item>(`/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function deleteItem(id: string): Promise<void> {
  return request<void>(`/items/${id}`, {
    method: 'DELETE',
  });
}

export async function getItem(id: string): Promise<Item> {
  return request<Item>(`/items/${id}`);
}
