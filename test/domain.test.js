const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  validateLogin,
  validateSignup,
  validateProduct,
  validateCategory,
  validateReview,
  UserType,
  OrderStatus,
  PaymentType,
  ReviewRules,
} = require("../dist/domain/index.js");

const validLogin = { email: "ab@cde", password: "123456" };

test("constants match the server strings", () => {
  assert.equal(UserType.USER, "USER");
  assert.equal(UserType.ADMIN, "ADMIN");
  assert.equal(OrderStatus.PENDING, "pending");
  assert.equal(OrderStatus.SHIPPED, "shipped");
  assert.equal(OrderStatus.DELIVERED, "delivered");
  assert.equal(PaymentType.COD, "cod");
  assert.equal(PaymentType.ONLINE, "online");
});

test("validateLogin returns the first failing message", () => {
  assert.equal(validateLogin({ email: "", password: "123456" }), "Please enter your email");
  assert.equal(validateLogin({ email: "ab@cde", password: "" }), "Please enter your password");
  assert.equal(validateLogin({ email: "abcdef", password: "123456" }), "Email is not valid");
  assert.equal(validateLogin({ email: "a@b", password: "123456" }), "Email is too short");
  assert.equal(validateLogin({ email: "ab@cde", password: "12345" }), "Password must be 6 characters long");
  assert.equal(validateLogin(validLogin), null);
});

test("validateSignup returns the first failing message", () => {
  assert.equal(
    validateSignup({ email: "", name: "Ada", password: "123456", confirmPassword: "123456" }),
    "Please enter your email"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "", password: "123456", confirmPassword: "123456" }),
    "Please enter your name"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "Ada", password: "", confirmPassword: "" }),
    "Please enter your password"
  );
  assert.equal(
    validateSignup({ email: "abcdef", name: "Ada", password: "123456", confirmPassword: "123456" }),
    "Email is not valid"
  );
  assert.equal(
    validateSignup({ email: "a@b", name: "Ada", password: "123456", confirmPassword: "123456" }),
    "Email is too short"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "Ada", password: "12345", confirmPassword: "12345" }),
    "Password must be 6 characters long"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "Ada", password: "123456", confirmPassword: "654321" }),
    "password does not match"
  );
  assert.equal(
    validateSignup({ email: "ab@cde", name: "Ada", password: "123456", confirmPassword: "123456" }),
    null
  );
});

test("validateProduct returns the first failing message", () => {
  assert.equal(
    validateProduct({ title: "", price: 1, quantity: 1, image: "a.png" }),
    "Please enter the product title"
  );
  assert.equal(
    validateProduct({ title: "Hat", price: 0, quantity: 1, image: "a.png" }),
    "Please enter the product price"
  );
  assert.equal(
    validateProduct({ title: "Hat", price: 1, quantity: 0, image: "a.png" }),
    "Quantity must be greater then 1"
  );
  assert.equal(
    validateProduct({ title: "Hat", price: 1, quantity: 1, image: null }),
    "Please upload the product image"
  );
  assert.equal(validateProduct({ title: "Hat", price: 1, quantity: 1, image: "a.png" }), null);
});

test("validateCategory returns the first failing message", () => {
  assert.equal(
    validateCategory({ title: "", description: "x", image: "a.png" }),
    "Please enter the product title"
  );
  assert.equal(
    validateCategory({ title: "Hats", description: "", image: "a.png" }),
    "Please upload the product image"
  );
  assert.equal(
    validateCategory({ title: "Hats", description: "x", image: null }),
    "Please upload the Catergory image"
  );
  assert.equal(validateCategory({ title: "Hats", description: "x", image: "a.png" }), null);
});

test("ReviewRules matches the server's rating and comment limits", () => {
  assert.equal(ReviewRules.MIN_RATING, 1);
  assert.equal(ReviewRules.MAX_RATING, 5);
  assert.equal(ReviewRules.COMMENT_MAX_LENGTH, 500);
});

test("validateReview rejects an out-of-range, fractional, or missing rating", () => {
  assert.equal(validateReview({ rating: 0 }), "Please select a star rating");
  assert.equal(validateReview({ rating: 6 }), "Please select a star rating");
  assert.equal(validateReview({ rating: 2.5 }), "Please select a star rating");
  assert.equal(validateReview({ rating: undefined }), "Please select a star rating");
});

test("validateReview rejects a comment over 500 characters", () => {
  assert.equal(
    validateReview({ rating: 5, comment: "a".repeat(501) }),
    "Review must be 500 characters or fewer"
  );
});

test("validateReview accepts a valid rating with no comment, and at the boundaries", () => {
  assert.equal(validateReview({ rating: 1 }), null);
  assert.equal(validateReview({ rating: 5, comment: "a".repeat(500) }), null);
});
