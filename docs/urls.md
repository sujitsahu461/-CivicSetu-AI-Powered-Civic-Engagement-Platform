# CivicSetu — Complete URL & API Endpoint Directory

This document details all client-side routes, REST API endpoints, documentation URLs, and external assets in the **CivicSetu** platform.

---

## 1. Local Base Hosts & Ports

| Service | Address | Notes |
| :--- | :--- | :--- |
| **Integrated Platform (Django)** | `http://127.0.0.1:8000` | Serves API, Admin, Swagger docs, and built React SPA |
| **Vite Dev Server (Frontend)** | `http://127.0.0.1:5173` | React development server with Hot Module Replacement (HMR) |

---

## 2. Frontend Web Application URLs (React SPA)

### Public & Authentication Routes
| Route | Component | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/` | `Landing` | Public | CivicSetu portal landing page |
| `/login` | `LoginRedirect` | Public | Role-aware login redirector |
| `/login/citizen` | `CitizenLogin` | Public | Citizen sign-in portal |
| `/login/authority` | `AuthorityLogin` | Public | Municipal authority officer sign-in |
| `/login/superadmin` | `SuperAdminLogin` | Public | Super Admin sign-in |
| `/login/admin` | `SuperAdminLogin` | Public | Super Admin alias |
| `/login/unified` | `Login` | Public | Unified login interface |
| `/signup` | `SignupRedirect` | Public | Role-aware signup redirector |
| `/signup/citizen` | `CitizenSignup` | Public | Public citizen registration |
| `/signup/authority` | `AuthoritySignup` | Public | Authority officer registration |
| `/signup/superadmin` | `SuperAdminSignup` | Public | Super Admin account creation |
| `/signup/admin` | `SuperAdminSignup` | Public | Super Admin registration alias |
| `/signup/unified` | `Signup` | Public | Unified registration page |
| `/reset-password` | `ResetPassword` | Public | Password reset confirmation page |
| `/forgot-password` | `ResetPassword` | Public | Password recovery request page |

### Public Grievance & Tracking
| Route | Component | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/track` | `TrackComplaint` | Public | Track complaint by code (e.g. `CMP-YYYYMMDD-XXXX`) |
| `/citizen/tracking` | `TrackComplaint` | Public | Public tracking alias |
| `/citizen/submit` | `SubmitComplaint` | Public / Citizen | Lodge grievance with AI categorization & photo upload |
| `/citizen/complaints/new` | `SubmitComplaint` | Public / Citizen | Submission alias |
| `/map` | `MapView` | Public | Interactive GIS municipal incident map |

### Citizen Protected Module (`CITIZEN`, `SUPER_ADMIN`)
| Route | Component | Description |
| :--- | :--- | :--- |
| `/citizen/dashboard` | `CitizenDashboard` | Citizen overview, active complaints count, quick actions |
| `/citizen/complaints` | `ComplaintHistory` | History of all filed grievances with status timeline |
| `/citizen/profile` | `CitizenProfile` | Citizen account information, address, and contact details |
| `/citizen/notifications` | `CitizenNotifications` | Real-time status update notifications |

### Authority Protected Module (`AUTHORITY`, `SUPER_ADMIN`)
| Route | Component | Description |
| :--- | :--- | :--- |
| `/authority/dashboard` | `AuthorityDashboard` | Department grievance queue, triage metrics, recent complaints |
| `/authority/complaints` | `ComplaintManagement` | Manage complaints, update status, add resolution notes & photos |
| `/authority/analytics` | `AuthorityAnalytics` | SLA turnaround metrics, category distribution, resolution rates |
| `/authority/notifications` | `AuthorityNotifications` | Officer-specific alerts, reassignments, priority changes |
| `/authority/profile` | `AuthorityProfile` | Authority officer profile and department assignment details |

### Super Admin Protected Module (`SUPER_ADMIN`)
| Route | Component | Description |
| :--- | :--- | :--- |
| `/superadmin/dashboard` | `SuperAdminDashboard` | High-level system health, total complaints, active officers |
| `/superadmin/departments` | `DepartmentManagement` | Create/edit municipal departments, manage authority mapping |
| `/superadmin/authorities` | `AuthorityManagement` | Manage authority officers, assignments, and credentials |
| `/superadmin/users` | `UserManagement` | User directory, role management, activations/deactivations |
| `/superadmin/complaints` | `SystemComplaintManagement` | City-wide grievance master list across all departments |
| `/superadmin/analytics` | `SystemAnalytics` | Cross-department efficiency, AI model performance metrics |

---

## 3. Backend REST API Endpoints (`/api/v1/`)

### Authentication & Sessions (`/api/v1/auth/`)
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/v1/auth/captcha/` | Generates mathematical CAPTCHA challenge |
| `POST` | `/api/v1/auth/register/` | Register citizen or authority user |
| `POST` | `/api/v1/auth/login/` | Obtain JWT access and refresh tokens |
| `POST` | `/api/v1/auth/logout/` | Blacklist refresh token & terminate session |
| `POST` | `/api/v1/auth/refresh/` | Refresh expired JWT access token |
| `POST` | `/api/v1/auth/verify/` | Validate token integrity |
| `GET` | `/api/v1/auth/me/` | Fetch current authenticated user's profile |
| `POST` | `/api/v1/auth/forgot-password/` | Send password reset request email/token |
| `POST` | `/api/v1/auth/reset-password/` | Set new password using reset token |

### Complaints Lifecycle (`/api/v1/complaints/`)
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/v1/complaints/` | List and filter complaints |
| `POST` | `/api/v1/complaints/create/` | File new grievance (triggers AI categorization & priority) |
| `GET` | `/api/v1/complaints/track/{tracking_code}/` | Public lookup by tracking code (no login required) |
| `GET` | `/api/v1/complaints/{public_id}/` | Detailed grievance record |
| `POST` | `/api/v1/complaints/{public_id}/status/` | Transition state (`PENDING` -> `IN_PROGRESS` -> `RESOLVED`) |
| `POST` | `/api/v1/complaints/{public_id}/assign/` | Assign complaint to specific officer/department |
| `POST` | `/api/v1/complaints/{public_id}/images/` | Upload evidence photos (JPEG, PNG, WebP <= 5MB) |
| `GET` | `/api/v1/complaints/{public_id}/timeline/` | Retrieve chronological audit history and transitions |

### Municipal Authority Command (`/api/v1/authority/`)
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/v1/authority/dashboard/summary/` | Metric counters (Pending, In Progress, Resolved, Overdue) |
| `GET` | `/api/v1/authority/dashboard/recent/` | List most recent departmental complaints |
| `GET` | `/api/v1/authority/complaints/` | Department-scoped complaints queue |
| `GET` | `/api/v1/authority/complaints/{public_id}/` | Department complaint details |
| `POST` | `/api/v1/authority/complaints/{public_id}/status/` | Update status with required justification |
| `POST` | `/api/v1/authority/complaints/{public_id}/notes/` | Add internal or citizen-facing resolution notes |
| `POST` | `/api/v1/authority/complaints/{public_id}/resolution-image/` | Upload proof of work image |
| `POST` | `/api/v1/authority/complaints/{public_id}/priority/` | Escalate or override priority level |
| `GET` | `/api/v1/authority/analytics/stats/` | Department resolution statistics |
| `GET` | `/api/v1/authority/analytics/department/` | Department SLA and response time performance |
| `GET` | `/api/v1/authority/analytics/priority/` | Distribution across Low, Medium, High, and Urgent |
| `GET` | `/api/v1/authority/notifications/` | Authority notification feed |
| `GET` | `/api/v1/authority/notifications/unread-count/` | Unread notifications badge counter |
| `POST` | `/api/v1/authority/notifications/mark-read/` | Mark single notification as read |
| `POST` | `/api/v1/authority/notifications/mark-all-read/` | Mark entire notification queue as read |

### AI & Machine Learning Triage (`/api/v1/ai/`)
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `POST` | `/api/v1/ai/classify/` | Real-time TF-IDF & classifier category & priority prediction |
| `POST` | `/api/v1/ai/detect-duplicates/` | Semantic similarity check against existing complaints |
| `GET` | `/api/v1/ai/city-insights/` | Aggregated geospatial and municipal hotspot analysis |
| `GET` | `/api/v1/ai/complaint/{complaint_public_id}/prediction/` | Retrieve AI inference log for specific complaint |

### Citizen Feedback & Redressal Validation (`/api/v1/feedback/`)
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `POST` | `/api/v1/feedback/submit/` | Submit 1–5 star rating and review on resolved complaint |
| `GET` | `/api/v1/feedback/my-feedbacks/` | List all feedbacks submitted by current citizen |
| `GET` | `/api/v1/feedback/complaint/{complaint_public_id}/` | Retrieve feedback associated with specific complaint |
| `GET` | `/api/v1/feedback/department/{category}/stats/` | Public satisfaction score for category/department |
| `GET` | `/api/v1/feedback/authority/stats/` | Satisfaction rating for logged-in authority's department |
| `GET` | `/api/v1/feedback/authority/feedbacks/` | List reviews submitted on authority's resolved complaints |

### Department Management (`/api/v1/departments/`)
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/v1/departments/` | List all municipal departments |
| `POST` | `/api/v1/departments/create/` | Create department (Admin only) |
| `GET` | `/api/v1/departments/{public_id}/` | Department details |
| `PUT/PATCH` | `/api/v1/departments/{public_id}/update/` | Modify department attributes |
| `POST` | `/api/v1/departments/{public_id}/deactivate/` | Deactivate department |
| `GET` | `/api/v1/departments/{public_id}/authorities/` | List assigned officers |
| `POST` | `/api/v1/departments/{public_id}/authorities/assign/` | Assign officer to department |
| `DELETE` | `/api/v1/departments/{public_id}/authorities/{user_id}/` | Detach officer from department |
| `PATCH` | `/api/v1/departments/{public_id}/authorities/{user_id}/update/` | Modify officer departmental role |
| `GET` | `/api/v1/departments/{public_id}/statistics/` | Departmental resolution metrics |

### User Management & Profiles (`/api/v1/users/`)
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/v1/users/profile/citizen/` | Citizen profile data |
| `GET` | `/api/v1/users/profile/authority/` | Authority officer profile data |
| `GET` | `/api/v1/users/profile/admin/` | Admin profile data |
| `PATCH` | `/api/v1/users/profile/update/` | Update profile info (phone, address, bio) |
| `POST` | `/api/v1/users/profile/upload-image/` | Upload profile avatar |
| `POST` | `/api/v1/users/change-password/` | Change password for authenticated session |
| `GET` | `/api/v1/users/search/` | Search users by name, email, or role (Admin) |
| `POST` | `/api/v1/users/create/` | Administrative creation of authority/admin accounts |
| `GET/PATCH/DEL` | `/api/v1/users/{public_id}/` | User detail, update, or soft-delete |

### Security & Compliance Audit Logs (`/api/v1/audit-logs/`)
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/v1/audit-logs/` | Filterable list of security audit log events |
| `GET` | `/api/v1/audit-logs/summary/` | Event count breakdown by action and severity |
| `GET` | `/api/v1/audit-logs/{public_id}/` | Detailed audit record with IP, actor, payload, and timestamp |

### In-App Notifications (`/api/v1/notifications/`)
| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/v1/notifications/` | List citizen in-app notifications |
| `POST` | `/api/v1/notifications/mark-all-read/` | Mark all notifications as read |
| `POST` | `/api/v1/notifications/{public_id}/mark-read/` | Mark specific notification as read |

---

## 4. Documentation, Admin & Assets

| Path | URL | Description |
| :--- | :--- | :--- |
| `/api/docs/` | `http://127.0.0.1:8000/api/docs/` | Interactive Swagger UI API Documentation |
| `/api/schema/` | `http://127.0.0.1:8000/api/schema/` | OpenAPI 3.0 JSON/YAML specification download |
| `/admin/` | `http://127.0.0.1:8000/admin/` | Django Super Admin administration panel |
| `/media/` | `http://127.0.0.1:8000/media/` | Uploaded complaint and resolution evidence images |
| `/static/` | `http://127.0.0.1:8000/static/` | Static compiled stylesheets, scripts, and logos |

