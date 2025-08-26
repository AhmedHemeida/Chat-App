# Responsive Dashboard with Next.js, Redux Toolkit, Tailwind CSS

This project is a responsive dashboard built using:

- **Next.js** 
- **Redux Toolkit** for global state management
- **Tailwind CSS** for styling
- **Recharts** for data visualization

---

## 🎥 Demo Video

📺 [Watch the Demo](https://screenapp.io/app/#/shared/O7B0SH-nxs)





## 🚀 Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AhmedHemeida/your-repo-name.git](https://github.com/AhmedHemeida/MyTask.git
   cd MyTask
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Visit in your browser:**

   ```
   http://localhost:3000
   ```

---

## 🔐 Login Feature

- Simple login form (no password).
- User state saved using Redux.
- If not logged in, user is redirected to `/login`.

---

## 📊 Dashboard Features

- Table displays data from `utils/mockData`.
- Responsive line chart using `recharts`.
- Redux used to manage both `auth` and `data` slices.

---

## 🧠 Implementation Approach

- Used **App Router** and `use client` for interactivity.
- Created a global `store` and provided it using a `<Provider>` component.
- Used `useSelector` to access data and user state.
- Handled route protection using `useRouter` and `useEffect`.
- Tailwind used for clean, responsive layout.

---

## 📦 Dependencies

- `next`
- `react`
- `react-dom`
- `@reduxjs/toolkit`
- `react-redux`
- `recharts`
- `tailwindcss` + `postcss` + `autoprefixer`

---


