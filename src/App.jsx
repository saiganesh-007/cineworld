import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Movies from "./pages/Movies";
import WebSeries from "./pages/WebSeries";
import Anime from "./pages/Anime";

import Favorites from "./pages/Favorites";
import Watchlist from "./pages/Watchlist";

import Details from "./pages/Details";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Search from "./pages/Search";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

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

      </Routes>
    </BrowserRouter>
  );
}

export default App;