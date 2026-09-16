import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import SavedItemsProvider from "./context/SavedItemsContext";

import Navbar from "./components/Navbar";
import AuthHeader from "./components/AuthHeader";
import SmoothScroll from "./components/SmoothScroll";

import Home from "./pages/Home";
import Movies from "./pages/Movies";
import WebSeries from "./pages/WebSeries";
import Anime from "./pages/Anime";

import Favorites from "./pages/Favorites";
import Watchlist from "./pages/Watchlist";

import Details from "./pages/Details";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";

import Search from "./pages/Search";

const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
];

function AppShell() {
  const location = useLocation();

  const isAuthPage = AUTH_PATHS.includes(
    location.pathname
  );

  const routesElement = (
    <Routes>

      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* MOVIES */}
      <Route path="/movies" element={<Movies />} />

      {/* WEB SERIES */}
      <Route path="/webseries" element={<WebSeries />} />

      {/* ANIME */}
      <Route path="/anime" element={<Anime />} />

      {/* FAVORITES */}
      <Route path="/favorites" element={<Favorites />} />

      {/* WATCHLIST */}
      <Route path="/watchlist" element={<Watchlist />} />

      {/* TV / ANIME DETAILS */}
      <Route path="/tv/:id" element={<Details />} />

      {/* TEMPORARY MOVIE DETAILS */}
      <Route path="/movie/:id" element={<Details />} />

      {/* SEARCH */}
      <Route path="/search" element={<Search />} />

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* REGISTER */}
      <Route path="/register" element={<Register />} />

      {/* SUPABASE AUTH (parallel; Flask login still active) */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

    </Routes>
  );

  return (
    <>
      {isAuthPage ? <AuthHeader /> : <Navbar />}

      {isAuthPage ? (
        routesElement
      ) : (
        <SmoothScroll>{routesElement}</SmoothScroll>
      )}
    </>
  );
}

function App() {
  return (
    <SavedItemsProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </SavedItemsProvider>
  );
}

export default App;