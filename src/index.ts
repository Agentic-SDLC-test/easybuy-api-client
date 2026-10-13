import { paths } from "./domain";

export type ClientConfig = {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  onUnauthorized: () => void | Promise<void>;
};

function queryValue(value: unknown): string {
  return encodeURIComponent(String(value));
}

export function createClient(config: ClientConfig) {
  const baseUrl = config.baseUrl.replace(/\/+$/, "");

  async function request(method: string, path: string, body?: unknown): Promise<any> {
    const headers = new Headers();
    const token = await config.getToken();
    if (token) headers.append("x-auth-token", token);

    let payload: BodyInit | undefined;
    if (body != null) {
      if (typeof FormData !== "undefined" && body instanceof FormData) {
        payload = body;
      } else {
        headers.append("Content-Type", "application/json");
        payload = typeof body === "string" ? body : JSON.stringify(body);
      }
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: payload,
      redirect: "follow",
    });

    let result: any;
    try {
      result = await response.json();
    } catch (e) {
      result = {};
    }

    if (result?.err === "jwt expired") {
      await config.onUnauthorized();
    }
    return result;
  }

  return {
    imageUrl(filename: string) {
      return `${baseUrl}/uploads/${filename}`;
    },
    register: (payload: unknown) => request("POST", paths.register, payload),
    login: (email: string, password: string) =>
      request("POST", paths.login, { email, password }),
    resetPassword: (userId: unknown, body: unknown) =>
      request("POST", `${paths.resetPassword}?id=${queryValue(userId)}`, body),
    deleteUser: (userId: unknown) =>
      request("GET", `${paths.deleteUser}?id=${queryValue(userId)}`),
    getProducts: (search?: string) =>
      request(
        "GET",
        search ? `${paths.products}?search=${queryValue(search)}` : paths.products
      ),
    createProduct: (payload: unknown) => request("POST", paths.product, payload),
    updateProduct: (id: unknown, payload: unknown) =>
      request("POST", `${paths.updateProduct}?id=${queryValue(id)}`, payload),
    deleteProduct: (id: unknown) =>
      request("GET", `${paths.deleteProduct}?id=${queryValue(id)}`),
    getCategories: () => request("GET", paths.categories),
    createCategory: (payload: unknown) => request("POST", paths.category, payload),
    updateCategory: (id: unknown, payload: unknown) =>
      request("POST", `${paths.updateCategory}?id=${queryValue(id)}`, payload),
    deleteCategory: (id: unknown) =>
      request("GET", `${paths.deleteCategory}?id=${queryValue(id)}`),
    checkout: (payload: unknown) => request("POST", paths.checkout, payload),
    getOrders: () => request("GET", paths.orders),
    getAdminOrders: () => request("GET", paths.adminOrders),
    updateOrderStatus: (orderId: unknown, status: unknown) =>
      request(
        "GET",
        `${paths.orderStatus}?orderId=${queryValue(orderId)}&status=${queryValue(status)}`
      ),
    getWishlist: () => request("GET", paths.wishlist),
    addToWishlist: (productId: unknown, quantity = 1) =>
      request("POST", paths.addToWishlist, { productId, quantity }),
    removeFromWishlist: (productId: unknown) =>
      request("GET", `${paths.removeFromWishlist}?id=${queryValue(productId)}`),
    getDashboard: () => request("GET", paths.dashboard),
    getUsers: () => request("GET", paths.users),
    uploadPhoto: (formData: FormData) => request("POST", paths.upload, formData),
    getProductReviews: (productId: unknown) =>
      request("GET", `${paths.productReviews}?productId=${queryValue(productId)}`),
    getMyReview: (productId: unknown) =>
      request("GET", `${paths.myReview}?productId=${queryValue(productId)}`),
    submitReview: (productId: unknown, rating: number, comment = "") =>
      request("POST", paths.review, { productId, rating, comment }),
    getAdminReviews: () => request("GET", paths.adminReviews),
    updateReviewVisibility: (reviewId: unknown, isVisible: boolean) =>
      request("POST", paths.reviewVisibility, { reviewId, isVisible }),
    deleteReview: (reviewId: unknown) => request("POST", paths.deleteReview, { reviewId }),
  };
}
