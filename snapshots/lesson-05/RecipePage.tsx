import { useParams } from "react-router-dom";

import type { Recipe } from "../types";

type Props = {
  recipes: Recipe[];
};

function RecipePage({ recipes }: Props) {
  const { id } = useParams();
  const currentRecipe = recipes.find((recipe) => recipe.id === id);

  if (!currentRecipe) {
    return <p>Recipe not found</p>;
  }

  return (
    <article className="app__container">
      <div className="recipe-detail">
        <span>{currentRecipe.category}</span>
        <h1>{currentRecipe.title}</h1>
        <p>{currentRecipe.description}</p>
        <div>{currentRecipe.content}</div>
      </div>
    </article>
  );
}

export default RecipePage;
