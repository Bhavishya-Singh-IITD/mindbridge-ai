import axios from "axios";

// ── Base instance ──────────────────────────────────────────────
const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,        // send cookies with every request
  headers: { "Content-Type": "application/json" },
});

// ── Attach JWT from localStorage on every request ─────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Redirect to login on 401 ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Only redirect if not already on auth page
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────────────────────────
export const authAPI = {
  register:       (data)  => api.post("/auth/register", data),
  login:          (data)  => api.post("/auth/login", data),
  logout:         ()      => api.post("/auth/logout"),
  getMe:          ()      => api.get("/auth/me"),
  updateProfile:  (data)  => api.put("/auth/update-profile", data),
  changePassword: (data)  => api.put("/auth/change-password", data),
};

// ── Products ───────────────────────────────────────────────────
export const productAPI = {
  getAll:       (params) => api.get("/products", { params }),
  getFeatured:  ()       => api.get("/products/featured"),
  getOne:       (id)     => api.get(`/products/${id}`),
  create:       (data)   => api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update:       (id, data) => api.put(`/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete:       (id)     => api.delete(`/products/${id}`),
  addReview:    (id, data) => api.post(`/products/${id}/reviews`, data),
  deleteReview: (id, reviewId) => api.delete(`/products/${id}/reviews/${reviewId}`),
};

// ── Cart ───────────────────────────────────────────────────────
export const cartAPI = {
  get:    ()              => api.get("/cart"),
  add:    (data)          => api.post("/cart", data),
  update: (itemId, data)  => api.put(`/cart/${itemId}`, data),
  remove: (itemId)        => api.delete(`/cart/${itemId}`),
  clear:  ()              => api.delete("/cart"),
};

// ── Orders ─────────────────────────────────────────────────────
export const orderAPI = {
  place:        (data) => api.post("/orders", data),
  getMy:        ()     => api.get("/orders/my"),
  getOne:       (id)   => api.get(`/orders/${id}`),
  getAll:       ()     => api.get("/orders"),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// ── Users / Wishlist ───────────────────────────────────────────
export const userAPI = {
  getWishlist:     ()    => api.get("/users/wishlist"),
  toggleWishlist:  (id)  => api.post(`/users/wishlist/${id}`),
  getAll:          ()    => api.get("/users"),
  getOne:          (id)  => api.get(`/users/${id}`),
  update:          (id, data) => api.put(`/users/${id}`, data),
  delete:          (id)  => api.delete(`/users/${id}`),
};

export default api;
