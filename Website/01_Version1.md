# Tanu Classes जैसी Education Website — V1 Full Development SOP

Project Type: MERN Stack Education Platform Development Approach: AI-Assisted Development Release Scope: V1 · Minimum Viable Product (MVP) Primary Objective: एक ऐसी production-ready education website बनाना, जहाँ विद्यार्थी कोर्स देख सकें, अकाउंट बना सकें, ऑनलाइन भुगतान करके कोर्स खरीद सकें और अपने Student Dashboard से वीडियो लेसन तथा PDF Notes एक्सेस कर सकें।

इस SOP में वेबसाइट का पूरा विकास चरणबद्ध तरीके से निर्धारित किया गया है। इसमें project setup, software installation, folder structure, environment configuration, database design, API development, frontend implementation, payment integration, security, testing और deployment शामिल हैं।

## 1. V1 का उद्देश्य और Scope

V1 केवल एक सामान्य coaching website नहीं होगी। यह एक working online education business system होगा, जिसमें तीन मुख्य interfaces होंगे।

[Eduverse - Modern Online Learning · Built with Blink](https://images.openai.com/static-rsc-4/Lt_vAmU2M3Ej0T5oz1EMepSOBOAE9pJ5kj2DnzxeD6Li1f0uj6fYnHraRNiWUQjU-wf1nJQwqQsRy49R9w76IXtfaEHLe2wZqewK5NeVIFrbQSH2JsDkk7bBX9J7SCtUX6KLPe5yVbg2LzbN3otGYdVyCHIojljYtPwINWQR6kA?purpose=inline)

01\. Public Website

सभी visitors के लिए

Home, About, Contact, Courses, Course Details, Pricing, FAQ, Login और Registration।

[Online Course Student Dashboard by Ronas IT | UI/UX Team on Dribbble](https://images.openai.com/static-rsc-4/VDXCxmQEe5NLnVjrgGNlmNPVXn-yLYv_Xx7HvQT8mJpT3wA30rOx_qr82g-OpR6Cetxq5e2VmkwBDSJUORJVtuFMyEXdHlfNxmk6powc8lf7Rj3fpeJX1w0xJGQ4-uMWw73T0hgCkQSG9j2tMmkrlHqCcm1cCGxsHUD6_J7I6sc?purpose=inline)

02\. Student Panel

Registered और enrolled students के लिए

Profile, My Courses, Course Player, Video Lessons, PDF Notes और basic learning progress।

[Course LMS Dashboard — Clean Admin UI Design by Md. Joinal Abden on Dribbble](https://images.openai.com/static-rsc-4/_J2kOo-p1hcbKUriGl8t83l9LUujmhwk8rB3qKlSMLmLmZ2316PIXfu-XoDyEpALv7UqITrtw9k2Bp_hGH80_b_d-v7yqLHMawynS8V-8gbzFEi2sz_Dm5TbdPoB8YUr0Pb5tDZX8OL9IC_-1ea7MGoty7jDSRBrBOAT9xVkpSE?purpose=inline)

03\. Admin Panel

Authorized administrators के लिए

Course management, sections और lessons, student records, enrollments, orders और payment status।

### V1 में क्या शामिल नहीं होगा?

इन features को V2 या V3 के लिए रखा जाएगा:

- Advanced quiz engine, assignments और certificates।
- Live classes और video conferencing।
- React Native Android/iOS app।
- Subscription billing और complex coupon campaigns।
- Multi-instructor marketplace।
- Advanced analytics और offline video downloads।

हालाँकि, V1 की architecture इन सुविधाओं को बाद में जोड़ने योग्य रखी जाएगी।

## 2. Recommended Technology Stack

| Layer           | Technology                                   | मुख्य उपयोग                   |
| --------------- | -------------------------------------------- | ----------------------------- |
| Frontend        | React + Vite + TypeScript                    | Website और dashboards         |
| Styling         | Tailwind CSS                                 | Responsive UI                 |
| Routing         | React Router                                 | Pages और protected routes     |
| API State       | TanStack Query                               | API requests और caching       |
| Forms           | React Hook Form + Zod                        | Forms और validation           |
| Backend         | Node.js + Express + TypeScript               | REST API और business logic    |
| Database        | MongoDB Atlas + Mongoose                     | Users, courses, orders        |
| Authentication  | Secure cookie/session strategy               | Login और session management   |
| Payments        | Razorpay या अन्य उपयुक्त gateway             | Course purchases              |
| Video           | Dedicated video hosting या approved provider | Course playback               |
| Testing         | Vitest, Supertest और Postman                 | Functional और API testing     |
| Version Control | Git + GitHub                                 | Code history और collaboration |
| Deployment      | Static frontend hosting + Node hosting       | Production website            |

Architecture principle: Website frontend, Backend API और Database अलग layers में होंगे। Payment verification, authorization और course access जैसे संवेदनशील निर्णय Backend पर ही होंगे, केवल browser में नहीं।

## 3. Software Installation और Development Environment

सबसे पहले अपने Windows computer पर ये tools install करें।

| Software           | उद्देश्य                  | Official website                                                               |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------ |
| Node.js LTS        | JavaScript runtime और npm | [nodejs.org](https://nodejs.org/?utm_source=chatgpt.com)                       |
| Visual Studio Code | Code editor               | [code.visualstudio.com](https://code.visualstudio.com/?utm_source=chatgpt.com) |
| Git                | Version control           | [git-scm.com](https://git-scm.com/downloads?utm_source=chatgpt.com)            |
| Postman            | API testing               | [postman.com](https://www.postman.com/downloads/?utm_source=chatgpt.com)       |
| MongoDB Atlas      | Cloud database            | [mongodb.com/atlas](https://www.mongodb.com/atlas?utm_source=chatgpt.com)      |

Installation के बाद VS Code terminal या PowerShell में चलाएँ:

```
node -v
npm -v
git --version
```

तीनों commands पर version दिखाई देना चाहिए। यदि command नहीं चलती, तो installation और PATH configuration जाँचें।

### MongoDB Atlas setup

1. MongoDB Atlas में project बनाएँ।
2. Development database cluster बनाएँ।
3. Database user और मजबूत password सेट करें।
4. Network Access में केवल अपने development IP को allow करें।
5. Connection string प्राप्त करें।
6. Production और development के लिए अलग database credentials रखें।

Database password को source code, GitHub repository या frontend environment variables में न रखें।

## 4. Project Initialization

हम एक monorepo structure रखेंगे। इससे website, backend और documentation एक repository में व्यवस्थित रहेंगे।

PowerShell में:

```
mkdir tanu-education-platform
cd tanu-education-platform

git init
npm init -y

mkdir apps
mkdir server
mkdir docs

npm create vite@latest apps/web -- --template react-ts

cd apps/web
npm install
npm install react-router-dom @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
cd ../..
```

अब Backend setup करें:

```
cd server
npm init -y

npm install express mongoose cors helmet dotenv cookie-parser zod
npm install express-rate-limit

npm install -D typescript tsx @types/node @types/express
npm install -D @types/cors @types/cookie-parser

npx tsc --init
cd ..
```

इसके बाद `server/package.json` में निम्न scripts configure करें। मौजूदा `scripts` object को replace या merge करें:

```
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

`server/tsconfig.json` में कम-से-कम ये compiler settings रखें:

```
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

> ध्यान दें: `NodeNext` configuration में local TypeScript imports में अक्सर `.js` extension लिखना पड़ता है, जैसे `import app from "./app.js"`. Build को हर milestone पर जाँचें।

## 5. Complete Project Folder Structure

V1 के लिए यह recommended structure अपनाएँ। आवश्यकता से अधिक abstraction न बनाएँ, लेकिन route handlers, business logic और database models को एक ही file में भी न रखें।

```

tanu-education-platform/
├── apps/
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── router.tsx
│       │   │   └── providers.tsx
│       │   ├── assets/
│       │   ├── components/
│       │   │   ├── common/
│       │   │   ├── forms/
│       │   │   └── layout/
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── courses/
│       │   │   ├── student/
│       │   │   ├── admin/
│       │   │   └── checkout/
│       │   ├── layouts/
│       │   ├── pages/
│       │   ├── lib/
│       │   │   └── api.ts
│       │   ├── types/
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── .env.example
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── REQUIREMENTS.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── SECURITY.md
│   └── DEPLOYMENT.md
├── .gitignore
└── README.md

```

### Folder responsibilities

- `models/`: Mongoose schemas और indexes।
- `routes/`: API endpoint definitions।
- `controllers/`: HTTP request और response handling।
- `services/`: Payment, enrollment और video access जैसे business rules।
- `middleware/`: Authentication, authorization, rate limiting और error handling।
- `validators/`: Request validation schemas।
- `features/`: Frontend के feature-specific components, hooks और API calls।
- `docs/`: Requirements, API contracts और operational instructions।

## 6. Environment Variables और Secrets

`server/.env` बनाएँ:

```
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://DB_USER:DB_PASSWORD@YOUR_CLUSTER.mongodb.net/tanu_lms

CLIENT_URL=http://localhost:5173

SESSION_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET

PAYMENT_KEY_ID=
PAYMENT_KEY_SECRET=
PAYMENT_WEBHOOK_SECRET=

VIDEO_PROVIDER=
VIDEO_PROVIDER_SECRET=
```

`apps/web/.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

इन बातों का पालन अनिवार्य है:

- `.env` को Git में commit न करें।
- `VITE_` prefix वाला variable frontend bundle में दिखाई दे सकता है। उसमें कोई secret न रखें।
- `.env.example` में केवल variable names और placeholder values रखें।
- Production secrets hosting provider के secret manager/environment settings में रखें।
- Payment keys और video provider credentials केवल Backend में इस्तेमाल करें।

Root `.gitignore` में:

```
node_modules/
dist/
.env
.env.*
!.env.example
coverage/
.DS_Store
```

Production deployment में `Secure`, `HttpOnly` और उपयुक्त `SameSite` settings वाली cookies, session expiry, CSRF protection जहाँ आवश्यक हो, और HTTPS configure करें।

## 7. Backend Foundation और Health Check

पहले ऐसा Backend बनाएँ जो शुरू हो, MongoDB से connect करे और health endpoint पर response दे।

`server/src/app.ts`:

```
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Education Platform API is running"
  });
});

export default app;
```

`server/src/server.ts`:

```
import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
```

Run करें:

```
cd server
npm run dev
```

Browser या Postman में खोलें:

`http://localhost:5000/api/health`

यदि success response मिलता है और MongoDB connection भी सफल है, तो Foundation milestone पूरा है।

Production में इसके साथ centralized error handling, request logging, graceful shutdown और database health monitoring जोड़ें।

## 8. Database Design

V1 के लिए निम्न मुख्य collections रखें।

| Collection    | मुख्य fields                                         | उपयोग                      |
| ------------- | ---------------------------------------------------- | -------------------------- |
| `users`       | name, email, passwordHash, role, isActive            | Student और Admin accounts  |
| `courses`     | title, slug, description, price, thumbnail, status   | Course catalog             |
| `sections`    | courseId, title, order                               | Course modules             |
| `lessons`     | courseId, sectionId, title, order, provider, assetId | Video lessons और resources |
| `orders`      | userId, amount, currency, status, courseId           | Purchase intent            |
| `payments`    | orderId, gateway IDs, status, verifiedAt             | Payment records            |
| `enrollments` | userId, courseId, status, enrolledAt                 | Course access              |
| `progress`    | userId, lessonId, completedAt                        | Basic lesson progress      |

### Database rules

1. Email normalized हो और unique index हो।
2. Course slug unique हो।
3. हर section और lesson का parent course reference validate हो।
4. `price` और `amount` को server-side validated integer minor units में रखना उचित है, जैसे INR के लिए paise।
5. Enrollment पर unique index रखें, ताकि एक ही विद्यार्थी और course के duplicate enrollments न बनें।
6. Payment records में gateway identifiers पर आवश्यक unique indexes रखें।
7. Course में `draft`, `published` और `archived` जैसे explicit states रखें।
8. Password कभी plaintext में store न करें। मजबूत password hashing इस्तेमाल करें।

V1 में course का access केवल `published` status और valid enrollment पर निर्भर होना चाहिए। बाद में V2/V3 के लिए expiry, batch access और subscription rules जोड़े जा सकते हैं।

## 9. Authentication और Role-Based Access

Authentication सबसे पहले implement करें, क्योंकि Student Panel, Admin Panel, purchases और lessons सभी इस पर निर्भर हैं।

### Required features

- Student registration और login।
- Logout और current user endpoint।
- Password reset flow।
- Authentication state refresh।
- Role-based authorization।
- Inactive account handling।
- Login और password reset endpoints पर rate limiting।

### API endpoints

| Method | Endpoint                    | Access               |
| ------ | --------------------------- | -------------------- |
| `POST` | `/api/auth/register`        | Public               |
| `POST` | `/api/auth/login`           | Public               |
| `POST` | `/api/auth/logout`          | Authenticated        |
| `GET`  | `/api/auth/me`              | Authenticated        |
| `POST` | `/api/auth/forgot-password` | Public, rate-limited |
| `POST` | `/api/auth/reset-password`  | Valid reset token    |

Security requirements:

- Password hashing के लिए Argon2id या उपयुक्त bcrypt configuration इस्तेमाल करें।
- Web session/token को सुरक्षित तरीके से manage करें। Browser में long-lived sensitive tokens को `localStorage` में रखने से बचें।
- Cookie-based authentication में CSRF risks को address करें।
- Admin role केवल trusted server-side provisioning से दें। Public registration form से कोई व्यक्ति Admin न बन सके।
- Frontend पर route guard UX के लिए है; वास्तविक permission check Backend पर अनिवार्य है।

## 10. Public Website और Frontend Development

Frontend को feature-wise implement करें, ताकि हर page Backend से जुड़ने के लिए तैयार रहे।

### Public pages

| Page           | Route            | मुख्य content                                   |
| -------------- | ---------------- | ----------------------------------------------- |
| Home           | `/`              | Hero section, featured courses, benefits और CTA |
| About          | `/about`         | Academy introduction और teaching approach       |
| Courses        | `/courses`       | Published courses और basic search/filter        |
| Course Details | `/courses/:slug` | Description, syllabus, price और purchase CTA    |
| Pricing        | `/pricing`       | उपलब्ध course pricing या plans                  |
| FAQ            | `/faq`           | Common questions                                |
| Contact        | `/contact`       | Contact details या validated enquiry form       |
| Login          | `/login`         | Student login                                   |
| Register       | `/register`      | Student account creation                        |
| Privacy        | `/privacy`       | Privacy policy                                  |
| Terms          | `/terms`         | Terms of service                                |
| Refund Policy  | `/refund-policy` | स्पष्ट refund/cancellation terms                |

### UI requirements

- Responsive layout: mobile, tablet और desktop।
- Loading, empty, success और error states।
- Accessible labels, keyboard navigation और उचित contrast।
- Form validation और clear error messages।
- Consistent typography, spacing, buttons और cards।
- SEO-friendly page titles, descriptions और canonical URLs।
- Public course pages पर indexable content।
- Authenticated student pages को search indexing से बाहर रखें।

React Router में public, student और admin layouts अलग रखें। लेकिन access control केवल frontend routing पर निर्भर न हो।

## 11. Course Management और Admin Panel

Admin को बिना code edit किए courses और lessons manage करने की सुविधा दें।

### Admin features

- Course create, edit, draft, publish और archive।
- Course thumbnail, description और pricing।
- Sections create, reorder और edit।
- Lessons create, reorder और publish/unpublish।
- Video asset ID और downloadable resource metadata।
- Student list और enrollment lookup।
- Orders और payment status।
- Basic operational dashboard: published courses, total students और recent orders।

### Admin API endpoints

| Method  | Endpoint                          | उद्देश्य          |
| ------- | --------------------------------- | ----------------- |
| `POST`  | `/api/admin/courses`              | Course create     |
| `PATCH` | `/api/admin/courses/:id`          | Course update     |
| `POST`  | `/api/admin/courses/:id/publish`  | Publish course    |
| `GET`   | `/api/admin/courses`              | Admin course list |
| `POST`  | `/api/admin/courses/:id/sections` | Section create    |
| `POST`  | `/api/admin/sections/:id/lessons` | Lesson create     |
| `GET`   | `/api/admin/students`             | Student listing   |
| `GET`   | `/api/admin/orders`               | Order listing     |

सभी `/api/admin/*` routes पर server-side Admin authorization अनिवार्य होगी। प्रत्येक resource पर ownership/relationship validation भी करें, ताकि गलत course या section ID देकर दूसरे resource को modify न किया जा सके।

## 12. Student Dashboard और LMS

Student login के बाद उसका मुख्य workspace `/dashboard` होगा।

### Required pages

- `/dashboard`: Welcome, recent courses और continue learning।
- `/my-courses`: Enrolled courses।
- `/learn/:courseId`: Course outline और sections।
- `/learn/:courseId/lessons/:lessonId`: Lesson player।
- `/profile`: Name, email और account details।
- `/orders`: Purchase history और order status।

### Student API endpoints

| Method | Endpoint                        | उद्देश्य                                |
| ------ | ------------------------------- | --------------------------------------- |
| `GET`  | `/api/me/courses`               | Enrolled courses                        |
| `GET`  | `/api/courses/:slug`            | Public course details                   |
| `GET`  | `/api/me/courses/:courseId`     | Enrolled course content                 |
| `GET`  | `/api/lessons/:lessonId/access` | Lesson access और playback authorization |
| `GET`  | `/api/me/orders`                | Current student के orders               |
| `GET`  | `/api/me/progress`              | Basic learning progress                 |
| `PUT`  | `/api/me/progress/:lessonId`    | Authorized progress update              |

Student केवल अपना profile, orders और progress access कर सके। Request body में भेजे गए `userId` को भरोसेमंद पहचान न मानें; authenticated user identity server-side session से लें।

## 13. Payment Gateway Integration

Payment system को अलग service layer में रखें। इससे gateway बदलने या V2 में नए business rules जोड़ने पर पूरा application बदलना नहीं पड़ेगा।

### Purchase workflow

1\. Student selects course

2\. Backend validates course and price

3\. Backend creates pending order

4\. Student completes gateway checkout

5\. Backend verifies signed webhook/payment

6\. Payment confirmed → Enrollment granted

### Payment API endpoints

| Method | Endpoint                | उद्देश्य                                                   |
| ------ | ----------------------- | ---------------------------------------------------------- |
| `POST` | `/api/checkout/orders`  | Pending order और gateway order बनाना                       |
| `POST` | `/api/payments/verify`  | Gateway response की server-side verification, जहाँ लागू हो |
| `POST` | `/api/webhooks/payment` | Gateway webhook receive करना                               |
| `GET`  | `/api/me/orders/:id`    | Order status देखना                                         |

### Payment implementation rules

- Course price browser से स्वीकार न करें। Backend database से price निकाले।
- Payment success page दिखने को payment confirmation न मानें।
- Gateway signature और webhook authenticity verify करें।
- Amount, currency और gateway order ID match करें।
- Duplicate webhook delivery को safely handle करें।
- Enrollment creation idempotent हो।
- Payment और enrollment state updates को सुरक्षित तरीके से coordinate करें।
- Failed, cancelled और pending payments को अलग-अलग status दें।
- Refund workflow को कम-से-कम स्पष्ट status और admin visibility के साथ document करें।

Gateway के official test mode में successful, failed, cancelled और delayed webhook scenarios test करने के बाद ही live keys इस्तेमाल करें।

## 14. Video Hosting और Paid Content Security

V1 में दो तरह के content रखें:

1. Free preview: Publicly accessible demo lesson या preview।
2. Paid lesson: केवल valid enrollment और published lesson के लिए authorized playback।

### Recommended approach

- Development में demo videos से player integration जाँचें।
- Paid content के लिए ऐसे video provider का चयन करें जो private playback, signed playback URLs या expiring tokens जैसी सुविधाएँ देता हो।
- Database में provider name और asset ID रखें, सीधे permanent secret playback URL को public API में न भेजें।
- Backend पहले authenticated user और enrollment verify करे।
- Provider support करे तो अल्प अवधि के playback authorization credentials जारी करें।
- PDFs के लिए भी access permissions लागू करें; protected files को public static folder में न रखें।

YouTube Unlisted videos जल्दी MVP तैयार करने के लिए उपयोगी हो सकते हैं, लेकिन URL आगे share किया जा सकता है। YouTube Private video sharing और website login अलग permission systems हैं। इसलिए paid content के लिए YouTube को पूर्ण access-control solution न मानें।

Security limitation: कोई भी web video solution screen recording या authorized user द्वारा content capture को पूरी तरह रोकने की गारंटी नहीं देता।

## 15. Frontend API Integration

Frontend में API calls के लिए एक centralized client रखें। इससे error handling, credentials और response parsing एक जगह manage होंगे।

`apps/web/src/lib/api.ts`:

```
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
```

यह शुरुआती implementation है। Production से पहले इसे निम्न सुविधाओं के साथ मजबूत करें:

- Consistent API error format।
- `204 No Content` responses का handling।
- Network timeout और retry policy।
- Request/response types।
- Authentication expiry handling।
- CSRF token handling, जहाँ cookie strategy में आवश्यक हो।
- File upload के लिए अलग request handling, जिसमें `Content-Type` manually set न करना पड़े जब browser को multipart boundary बनानी हो।

TanStack Query का उपयोग course lists, student dashboard और orders जैसी server state के लिए करें। Sensitive authorization decisions हमेशा Backend पर ही रहें।

## 16. Testing और Quality Assurance

Testing को अंतिम सप्ताह के लिए न छोड़ें। प्रत्येक feature के साथ unit tests, integration tests और manual verification करें।

| Test category     | क्या जाँचना है                                              |
| ----------------- | ----------------------------------------------------------- |
| Authentication    | Register, login, logout, expired session                    |
| Authorization     | Student द्वारा Admin endpoints access करने का प्रयास        |
| Course management | Draft, publish, archive और invalid IDs                      |
| Enrollment        | Unenrolled student का paid lesson access                    |
| Payments          | Success, failure, cancellation, duplicate webhook           |
| Video access      | Unauthorized request और expired playback authorization      |
| Database          | Duplicate email, duplicate enrollment और invalid references |
| Frontend          | Loading, error, empty state और form validation              |
| Responsive UI     | Mobile, tablet और desktop layouts                           |
| Performance       | Slow network, pagination और बड़े course catalogs            |
| Security          | Input validation, rate limits, CORS और secret exposure      |

### अनिवार्य end-to-end test

एक नए student account से शुरुआत करें:

1. Student registration करे।
2. Login करके एक published course खोले।
3. Course purchase करे।
4. Test gateway से payment पूरा करे।
5. Backend webhook verify करे।
6. Enrollment database में बने।
7. Student dashboard में course दिखाई दे।
8. Student lesson video और PDF access करे।
9. दूसरे, unenrolled account से उसी paid lesson का access असफल हो।
10. Logout के बाद protected content access न हो।

इस पूरे flow का automated integration test जहाँ संभव हो बनाएँ। Payment provider के webhook test events और test credentials का उपयोग करें।

## 17. Deployment और Production Setup

V1 के production deployment में तीन मुख्य components होंगे:

Frontend Hosting

Built React application, HTTPS और custom domain

Backend Hosting

Node.js process, production environment variables और logs

MongoDB Atlas

Production database, restricted network access और backups

### Deployment checklist

- Production frontend और API URLs configure करें।
- HTTPS और custom domain configure करें।
- CORS में केवल approved production origins allow करें।
- Production database credentials अलग रखें।
- Secure cookies और session expiry configure करें।
- Payment gateway के live keys और webhook URL configure करें।
- Video provider की production settings configure करें।
- Database backup और restore procedure test करें।
- Error logs, uptime monitoring और alerts configure करें।
- Privacy policy, terms और refund policy publish करें।
- Payment, login और lesson access के production smoke tests चलाएँ।

Frontend build के लिए:

```
cd apps/web
npm run build
```

Backend build के लिए:

```
cd server
npm run build
npm start
```

ध्यान दें: ये commands तभी सफल होंगी जब TypeScript configuration, source files और production scripts सही तरह configure किए गए हों। Hosting पर frontend और backend deployment commands provider के अनुसार बदल सकती हैं।

## 18. AI Coding Tools के साथ Development SOP

AI coding tools का उपयोग हर feature के लिए एक नियंत्रित workflow के तहत करें। पूरा प्रोजेक्ट एक ही prompt में generate कराने से बचें।

### Standard workflow

1. Plan: Feature requirements और acceptance criteria लिखें।
2. Inspect: AI से मौजूदा folder structure और relevant files inspect करवाएँ।
3. Implement: एक समय में एक feature या छोटा milestone बनवाएँ।
4. Review: Security, types, validation और architecture की समीक्षा करें।
5. Test: Tests और build commands चलाएँ; failures को fix करें।
6. Commit: काम verify होने के बाद Git commit बनाएँ।

### Prompt 1: Project architecture

Act as a senior MERN Stack architect.

I am building a production-oriented V1 education website using React, Vite, TypeScript, Node.js, Express, MongoDB Atlas and Mongoose.

The platform must support:

- Public course catalog and course details
- Student registration and authentication
- Student dashboard and course enrollment
- Admin course and lesson management
- Payment gateway integration
- Protected video lessons and PDF resources

Design the architecture for V1 while keeping V2 and V3 extensible.

Before writing code, provide:

1. Architecture and data flow
2. Folder structure
3. Database collections, relationships and indexes
4. API contracts
5. Authentication and authorization design
6. Payment and enrollment workflow
7. Video access strategy
8. Testing strategy
9. Ordered implementation milestones

Do not implement advanced features outside V1. Do not invent existing files or claim tests passed without running them. Identify security risks and assumptions explicitly.

### Prompt 2: Backend feature implementation

Act as a senior TypeScript and Express engineer.

Implement the next approved V1 milestone in my existing education platform repository.

Rules:

- Inspect the existing code and follow its conventions.
- Keep routes, controllers, services, models and validators separated appropriately.
- Use strict TypeScript and validate all untrusted input.
- Enforce authorization on the server.
- Never trust client-supplied user IDs, course prices, roles or payment status.
- Never expose database credentials, payment secrets or protected video URLs.
- Add relevant unit or integration tests.
- Run the appropriate tests and build checks if tool access permits.
- Report changed files, design decisions, test results and remaining issues.

Implement only the specified milestone. Do not rewrite unrelated working features.

### Prompt 3: Payment security review

Act as an application security engineer reviewing the V1 education website payment workflow.

Inspect the implementation of order creation, gateway checkout, payment verification, webhook processing and enrollment creation.

Check:

- Server-side pricing and currency validation
- Gateway signature verification
- Webhook authenticity
- Duplicate and out-of-order webhook events
- Idempotent payment processing
- Duplicate enrollment prevention
- Failed, cancelled and pending payments
- Unauthorized access to orders and courses
- Secret exposure and unsafe logging

Identify each issue with severity, affected files, a reproduction scenario and a recommended fix.

Do not claim that the payment system is secure merely because a checkout page works. Verify the relevant code and tests.

AI-generated code को बिना review के production में deploy न करें। विशेष रूप से authentication, payment verification और video authorization में स्वतंत्र code review और automated tests आवश्यक हैं।

## 19. V1 Development Milestones और Timeline

यह एक indicative plan है। कुछ काम parallel हो सकते हैं, लेकिन dependent milestones को क्रम में पूरा करना चाहिए।

### Week 1

Milestone 1: Foundation

Project setup, Git, MongoDB, API health check, environment setup और initial UI shell।

### Weeks 2–3

Milestone 2: Website और Authentication

Public pages, login, registration, protected routes, Admin roles और course management।

### Weeks 4–5

Milestone 3: Student LMS

Dashboard, enrollments, course sections, video lessons, PDF access और basic progress।

### Week 6

Milestone 4: Commerce

Checkout, test payments, verified webhooks, order states और enrollment automation।

### Weeks 7–8

Milestone 5: QA और Launch

Security tests, responsive fixes, production deployment, backups और end-to-end verification।

यह schedule 4–8 सप्ताह के MVP लक्ष्य को ध्यान में रखता है, लेकिन इसे guarantee नहीं मानना चाहिए। Payment onboarding, video provider setup, UI refinement और security defects के कारण अतिरिक्त समय लग सकता है।

## 20. Final V1 Launch Checklist

### Development sign-off

Launch readiness

### 0/14

Public website के सभी आवश्यक pages तैयार हैं

Student registration, login और logout सही काम करते हैं

Admin केवल authorized accounts से access होता है

Admin courses, sections और lessons manage कर सकता है

Course details और pricing सही दिखाई देते हैं

Payment gateway test scenarios सफलतापूर्वक verify हुए हैं

Verified payment के बाद enrollment अपने आप बनता है

Unauthorized student paid video और PDF access नहीं कर सकता

Student dashboard और basic progress काम करते हैं

Responsive UI, accessibility और error states जाँचे गए हैं

Production secrets, HTTPS, CORS और secure sessions configure हैं

Backups, logs और recovery procedure तैयार हैं

Privacy policy, terms और refund policy प्रकाशित हैं

Production smoke tests और end-to-end tests पास हैं

## अंतिम निर्णय

इस SOP के अनुसार development का पहला काम Foundation milestone पूरा करना है: project repository बनाना, React और Express setup करना, MongoDB connect करना और health endpoint verify करना।

इसके बाद Authentication, Course Management, Student LMS, Payment Integration, Testing और Deployment को क्रम से पूरा करें। V2 और V3 की सुविधाओं का scope अभी document करें, लेकिन V1 में तभी implement करें जब वे launch के लिए आवश्यक हों।

V1 का अंतिम लक्ष्य: एक वास्तविक विद्यार्थी वेबसाइट पर account बनाए, course खरीदे, verified enrollment प्राप्त करे और अपने account से authorized video lessons तथा PDF resources पढ़ सके। यही इस MVP की सफलता का मुख्य मापदंड होगा।