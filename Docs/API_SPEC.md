# Authentication & User API Specification

이 문서는 프론트엔드 개발 시 참고할 수 있는 백엔드 API 명세서입니다. 
본 API는 FastAPI로 작성되었으며, Swagger UI를 통해 `http://localhost:8000/docs`에서도 동일한 내용을 테스트해 볼 수 있습니다.

---

## 🔐 1. 회원가입 (Sign Up)

새로운 유저를 생성합니다.

- **URL:** `/api/v1/users/signup`
- **Method:** `POST`
- **Content-Type:** `application/json`

### Request Body (JSON)
```json
{
  "user_login_id": "test_user123",  // 필수: 아이디 (String)
  "password": "strongPassword1!"    // 필수: 비밀번호 (String)
}
```

### Response (201 Created)
성공 시 서버 측에서 생성된 깃허브 레포지토리 주소(`github_url`)가 포함되어 반환됩니다.
```json
{
  "user_login_id": "test_user123",
  "github_url": "https://github.com/PixelAI/test_user123-workspace", //아직 할당로직없음 임시주소로 들어감
  "id": "123e4567-e89b-12d3-a456-426614174000", // UUID 문자열
  "user_hash_id": "abcdef1234567890", // 해시값 문자열
  "created_at": "2026-03-14T14:48:00.000Z"
}
```
- 실패 시 (400 Bad Request): `{"detail": "The user with this login ID already exists in the system."}`

---

## 🔑 2. 로그인 (Login & Access Token)

아이디와 비밀번호로 로그인하여 JWT Access Token을 발급받습니다. OAuth2 스펙에 맞춰 데이터를 `form-data` 형식으로 전송해야 합니다.

- **URL:** `/api/v1/auth/login/access-token`
- **Method:** `POST`
- **Content-Type:** `application/x-www-form-urlencoded`

### Request Body (Form Data)
| Key | Type | Description |
|---|---|---|
| `username` | string | 유저의 `user_login_id` |
| `password` | string | 평문 비밀번호 |

### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1... (매우 긴 토큰 문자열)",
  "token_type": "bearer"
}
```
- 실패 시 (400 Bad Request): `{"detail": "Incorrect login ID or password"}`

> **⚠️ 프론트엔드 주의사항**
> 발급받은 `access_token`은 브라우저의 localStorage나 쿠키에 저장하여, 이후 **인증이 필요한 모든 API 요청 시 Header에 포함**시켜야 합니다.
> ```http
> Authorization: Bearer {access_token}
> ```

---

## 👤 3. 내 정보 조회 (Get Current User)

현재 로그인한 유저(토큰의 주인) 정보를 가져옵니다. **(인증 필요)**

- **URL:** `/api/v1/users/me`
- **Method:** `GET`
- **Headers:** 
  - `Authorization: Bearer <access_token>`

### Response (200 OK)
```json
{
  "user_login_id": "test_user123",
  "github_url": "https://github.com/example",
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_hash_id": "abcdef1234567890",
  "created_at": "2026-03-14T14:48:00.000Z"
}
```
- 실패 시 만료되거나 잘못된 토큰 (403 Forbidden): `{"detail": "Could not validate credentials"}`

---

## 🔍 4. 유저 식별자로 정보 조회 (Get User by ID)

특정 식별자(UUID)를 가진 유저의 공개 정보를 가져옵니다.

- **URL:** `/api/v1/users/{user_id}`
- **Method:** `GET`
- **Path Parameter:**
  - `user_id`: 조회할 대상의 고유 ID (ex: 123e4567-...)

### Response (200 OK)
성공 시 `users/me`와 동일한 포맷의 정보가 반환됩니다.

- 실패 시 없는 유저 조회 (404 Not Found): `{"detail": "can't find user"}`
