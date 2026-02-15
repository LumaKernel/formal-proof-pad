import { useTranslations } from "next-intl";
import styles from "./page.module.css";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </main>
    </div>
  );
}
