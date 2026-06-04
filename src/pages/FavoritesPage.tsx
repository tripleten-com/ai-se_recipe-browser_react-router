import type { Recipe } from "../types";
import RecipeList from "../components/RecipeList/RecipeList";

type Props = {
  recipes: Recipe[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
};

function FavoritesPage({ recipes, favorites, onToggleFavorite }: Props) {
  const favoritedRecipes = recipes.filter((recipe) => favorites.has(recipe.id));

  return (
    <div className="app__container">
      <h1 className="app__heading">Favorites</h1>
      {favoritedRecipes.length === 0 ? (
        <p className="app__message">No favorites yet.</p>
      ) : (
        <RecipeList
          recipes={favoritedRecipes}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
}

export default FavoritesPage;
