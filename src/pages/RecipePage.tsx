import { useParams } from "react-router-dom";

import type { Recipe } from "../types";

type Props = {
  recipes: Recipe[];
};

function RecipePage({ recipes }: Props) {
  const { id } = useParams();

  const recipe = recipes.find((p) => p.id === id);

  if (!recipe) {
    return <p className="app__message">Recipe not found.</p>;
  }

  return (
    <article className="app__container">
      <div className="recipe-detail">
        <span>{recipe.category}</span>
        <h1>{recipe.title}</h1>
        <p>{recipe.description}</p>
        <div>{recipe.content}</div>
      </div>
    </article>
  );
}

export default RecipePage;
