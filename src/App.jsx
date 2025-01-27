import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import { DashboardPage } from "./components/DashboardPage";
import useStore from "./store/useStore";

function App() {
  const { isAuthenticated } = useStore();

  return (
    <Routes>
      <Route
        path="/"
        element={!isAuthenticated ? <LoginPage /> : <DashboardPage />}
      />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
