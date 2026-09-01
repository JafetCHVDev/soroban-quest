import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { ReactElement } from "react";

/**
 * NotFound page
 * Displays a 404 error page when a route is not found
 *
 * @returns {ReactElement} 404 page with link to home
 */
const NotFound = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div id="main-content" className="notfound-container">
      <div className="notfound-card">
        <h1>404</h1>
        <h2>{t("notFound.title")}</h2>
        <p>{t("notFound.body")}</p>

        <Link to="/" className="home-btn">
          {t("notFound.back")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
