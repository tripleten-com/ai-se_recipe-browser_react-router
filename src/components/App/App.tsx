import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import type { Recipe } from "../../types";
import { allRecipes } from "../../data/recipes";
import HomePage from "../../pages/HomePage";
import FavoritesPage from "../../pages/FavoritesPage";
import Header from "../Header/Header";
import "./App.css";

function App() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const favoritesJSON = JSON.stringify([...favorites]);
    localStorage.setItem("favorites", favoritesJSON);
  }, [favorites]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRecipes(allRecipes);
      setIsLoading(false);

      return () => clearTimeout(timeoutId);
    }, 500);
  }, []);

  if (isLoading) {
    return <p className="app__loading">Loading...</p>;
  }

  function handleToggleFavorite(tag: string) {
    const newSet = new Set(favorites);
    if (newSet.has(tag)) {
      newSet.delete(tag);
    } else {
      newSet.add(tag);
    }
    setFavorites(newSet);
  }

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                recipes={recipes}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          <Route
            path="/favorites"
            element={
              <FavoritesPage
                recipes={recipes}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
