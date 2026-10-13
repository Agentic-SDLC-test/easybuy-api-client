export const UserType = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export const OrderStatus = {
  PENDING: "pending",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
} as const;

export const PaymentType = {
  COD: "cod",
  ONLINE: "online",
} as const;

export const paths = {
  register: "/register",
  login: "/login",
  resetPassword: "/reset-password",
  deleteUser: "/delete-user",
  products: "/products",
  product: "/product",
  updateProduct: "/update-product",
  deleteProduct: "/delete-product",
  categories: "/categories",
  category: "/category",
  updateCategory: "/update-category",
  deleteCategory: "/delete-category",
  checkout: "/checkout",
  orders: "/orders",
  adminOrders: "/admin/orders",
  orderStatus: "/admin/order-status",
  wishlist: "/wishlist",
  addToWishlist: "/add-to-wishlist",
  removeFromWishlist: "/remove-from-wishlist",
  dashboard: "/dashboard",
  users: "/admin/users",
  upload: "/photos/upload",
  productReviews: "/product-reviews",
  myReview: "/my-review",
  review: "/review",
  adminReviews: "/admin/reviews",
  reviewVisibility: "/admin/review-visibility",
  deleteReview: "/admin/delete-review",
} as const;

export const ReviewRules = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  COMMENT_MAX_LENGTH: 500,
} as const;

export function validateLogin(input: { email: string; password: string }): string | null {
  const { email, password } = input;
  if (email == "") return "Please enter your email";
  if (password == "") return "Please enter your password";
  if (!email.includes("@")) return "Email is not valid";
  if (email.length < 6) return "Email is too short";
  if (password.length < 6) return "Password must be 6 characters long";
  return null;
}

export function validateSignup(input: {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}): string | null {
  const { email, name, password, confirmPassword } = input;
  if (email == "") return "Please enter your email";
  if (name == "") return "Please enter your name";
  if (password == "") return "Please enter your password";
  if (!email.includes("@")) return "Email is not valid";
  if (email.length < 6) return "Email is too short";
  if (password.length < 6) return "Password must be 6 characters long";
  if (password != confirmPassword) return "password does not match";
  return null;
}

export function validateProduct(input: {
  title: string;
  price: any;
  quantity: any;
  image: any;
}): string | null {
  const { title, price, quantity, image } = input;
  if (title == "") return "Please enter the product title";
  if (price == 0) return "Please enter the product price";
  if (quantity <= 0) return "Quantity must be greater then 1";
  if (image == null) return "Please upload the product image";
  return null;
}

export function validateCategory(input: {
  title: string;
  description: string;
  image: any;
}): string | null {
  const { title, description, image } = input;
  if (title == "") return "Please enter the product title";
  if (description == "") return "Please upload the product image";
  if (image == null) return "Please upload the Catergory image";
  return null;
}

export function validateReview(input: { rating: number; comment?: string }): string | null {
  const { rating, comment } = input;
  if (
    !Number.isInteger(rating) ||
    rating < ReviewRules.MIN_RATING ||
    rating > ReviewRules.MAX_RATING
  ) {
    return "Please select a star rating";
  }
  if ((comment ?? "").trim().length > ReviewRules.COMMENT_MAX_LENGTH) {
    return "Review must be 500 characters or fewer";
  }
  return null;
}
