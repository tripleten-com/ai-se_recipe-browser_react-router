import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>The URL you entered doesn't match any page in this app.</p>
      <Link to="/">Back to recipes</Link>
    </main>
  );
}

export default NotFoundPage;
