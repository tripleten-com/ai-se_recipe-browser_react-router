import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import { categoryColors } from "../data/recipes";

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
        <span
          style={{
            backgroundColor:
              categoryColors[recipe.category.toLocaleLowerCase()],
          }}
          className="recipe-detail__category"
        >
          {recipe.category}
        </span>
        <h1>{recipe.title}</h1>
        <p>{recipe.description}</p>
        <div className="markdown">
          <ReactMarkdown>{recipe.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}

export default RecipePage;
