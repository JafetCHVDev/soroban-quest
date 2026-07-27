import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="notfound-container">
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
