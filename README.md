# WildVault

WildVault is a campus resource-sharing system that lets users register, log in, manage their profile, list lendable items, request to borrow items, approve or reject incoming requests, track returned items, and view upcoming due dates.

## Main Structure

```text
WildVault-main/
├── backend/
├── frontend/
├── .vscode/
│   └── settings.json
├── README.md
└── package-lock.json
```

## Integrated BorrowingHub Functionality

BorrowingHub was used only as a functionality reference. The final base remains WildVault-main.

Integrated features:

- Item listing through the Vault Ledger
- Add, edit, delete, and view item records
- Item search and status filtering
- Item categories, quantity, description, contact number, and optional image upload
- Borrow request submission with due date and purpose
- Incoming request approval and rejection
- Borrower return action
- Borrower extension action
- Request history and activity records
- Due-date calendar view
- Dashboard item statistics

Excluded from BorrowingHub:

- H2 database configuration
- Session-based authentication
- BorrowingHub frontend theme and layout
- BorrowingHub duplicate login/register pages
- Local filesystem image storage as the primary storage method

## Backend

The backend remains a Java Spring Boot project using WildVault's original Supabase/PostgreSQL database connection.

Run from `backend/`:

```bash
./mvnw spring-boot:run
```

The existing Supabase connection is read from `backend/src/main/resources/application.properties` and may be overridden through environment variables.

## Frontend

The frontend remains a React/Vite project using the original WildVault visual design.

Run from `frontend/`:

```bash
npm install
npm run dev
```

The frontend expects the backend at:

```text
http://localhost:8080
```

## API Summary

Authentication/profile APIs preserved from WildVault:

- `POST /api/register`
- `POST /api/login`
- `GET /users/profile`
- `PUT /users/profile`
- `PUT /users/profile/password`
- `POST /users/profile/photo`
- `GET /users/profile/photo`

Integrated item APIs:

- `GET /api/items/dashboard`
- `GET /api/items`
- `POST /api/items`
- `GET /api/items/mine`
- `GET /api/items/{id}`
- `PUT /api/items/{id}`
- `DELETE /api/items/{id}`

Integrated request APIs:

- `POST /api/requests/create/{itemId}`
- `POST /api/requests/manage/{requestId}/{action}`
- `GET /api/requests/history`
- `GET /api/requests/calendar`
