import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <h1>404</h1>
        <h2>This quest does not exist</h2>
        <p>You seem to have wandered into deep space</p>

        <Link to="/" className="home-btn">
          Return to Base
        </Link>
      </div>
    </div>
  );
};

export default NotFound;