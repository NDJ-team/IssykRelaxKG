import { Helmet } from "react-helmet-async";
import { organizationSchema, websiteSchema } from "../lib/schemas";

const BASE_URL = "https://issykrelax.kg";

export function LayoutSEO() {
  return (
    <Helmet>
      <html lang="ru" />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="IssykRelax" />
      <meta property="og:locale" content="ru_RU" />

      <meta name="twitter:card" content="summary_large_image" />

      <link rel="icon" type="image/png" href="/logo.png" />
      <link rel="alternate" hrefLang="ru" href={BASE_URL} />

      <script type="application/ld+json">
        {JSON.stringify(organizationSchema())}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema())}
      </script>
    </Helmet>
  );
}
