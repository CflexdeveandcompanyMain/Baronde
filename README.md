# Soundprince API Documentation

This documentation provides details on the available API endpoints for the Soundprince application.

## Authentication

Most endpoints require authentication using a JSON Web Token (JWT). To obtain a token, you need to either sign up or log in. The token should be included in the `Authorization` header of your requests as a Bearer token.

`Authorization: Bearer <your_jwt_token>`

## User Endpoints

These endpoints are related to user management.

### `POST /api/users/request-admin-otp`

Requests a one-time password (OTP) for admin registration.

**Request Body:**

```json
{
  "email": "user@mail.com"
}
```

### `POST /api/users/SignUp`

Registers a new user.

**Request Body:**

```json
{
  "name": "Test User",
  "email": "user@mail.com",
  "password": "yourpassword",
  "otp": "123456"
}
```

### `POST /api/users/login`

Logs in a user and returns a JWT.

**Request Body:**

```json
{
  "email": "user@mail.com",
  "password": "yourpassword"
}
```

### `POST /api/users/request-resetpassword-otp`

Requests an OTP to reset the user's password.

**Request Body:**

```json
{
  "email": "user@mail.com"
}
```

### `POST /api/users/new-password`

Resets the user's password using the OTP.

**Request Body:**

```json
{
  "email": "user@mail.com",
  "otp": "123456",
  "password": "newpassword"
}
```

### `GET /api/users/getuser/:id`

Retrieves a user's information by their ID.

**Requires Authentication.**

### `GET /api/users/alluser`

Retrieves a list of all users. 

**Requires Admin Authentication.**

## Image Endpoints

These endpoints are related to managing images (products).

### `POST /api/images/upload`

Uploads a new product with images.

**Requires Authentication.**

**Request Body:**

```json
{
  "name": "Product Name",
  "brand": "Product Brand",
  "specs": "Product Specifications",
  "description": "Product Description",
  "price": 100,
  "categories": ["category1", "category2"],
  "keyword": ["keyword1", "keyword2"],
  "image": ["base64_encoded_image_1", "base64_encoded_image_2"]
}
```

### `GET /api/images/`

Retrieves a list of all images.

**Requires Authentication.**

### `GET /api/images/name/:name`

Searches for images by name.

**Requires Authentication.**

### `GET /api/images/categories/:categories`

Retrieves images by category.

**Requires Authentication.**

### `GET /api/images/keyword/:keyword`

Retrieves images by keyword.

**Requires Authentication.**

### `GET /api/images/product/:id`

Retrieves an image by its ID.

**Requires Authentication.**

### `PUT /api/images/product/:id`

Updates an image's data.

**Requires Authentication.**

**Request Body:** (Include only the fields you want to update)

```json
{
  "name": "New Product Name",
  "price": 150
}
```

### `DELETE /api/images/product/:id`

Deletes an image by its ID.

**Requires Authentication.**
