import { useState, useEffect } from "react";
import type { Recipe } from "../../types";

import { allRecipes } from "../../data/recipes";
import Header from "../Header/Header";
import RecipeList from "../RecipeList/RecipeList";
import "./App.css";

function App() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
  });
  const [query, setQuery] = useState("");
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

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(query.toLowerCase()),
  );

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
        <div className="app__container">
          <input
            className="app__search"
            type="search"
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <h1 className="app__heading">Recipes</h1>
          <RecipeList
            recipes={filteredRecipes}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
