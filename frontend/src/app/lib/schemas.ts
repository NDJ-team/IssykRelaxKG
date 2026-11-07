const BASE_URL = "https://issykrelax.kg";
const IMAGE_URL = `${BASE_URL}/logo.png`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IssykRelax",
    description: "Крупнейший маркетплейс отдыха на Иссык-Куле. Бронирование жилья, отелей, коттеджей, туров и ресторанов.",
    url: BASE_URL,
    logo: IMAGE_URL,
    image: IMAGE_URL,
    sameAs: [
      "https://issykrelax.kg",
    ],
    address: {
      "@type": "PostalAddress",
      addressRegion: "Issyk-Kul",
      addressCountry: "KG",
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: BASE_URL,
    name: "IssykRelax",
    description: "Крупнейший маркетплейс отдыха на Иссык-Куле. Бронирование жилья, отелей, коттеджей, туров и ресторанов.",
    inLanguage: "ru",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "IssykRelax",
    description: "Крупнейший маркетплейс отдыха на Иссык-Куле. Бронирование жилья, отелей, коттеджей, туров и ресторанов.",
    url: BASE_URL,
    image: IMAGE_URL,
    telephone: "+996XXXXXXXXX",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Issyk-Kul",
      addressCountry: "KG",
    },
    areaServed: {
      "@type": "State",
      name: "Issyk-Kul Region",
    },
    priceRange: "$$",
  };
}

export function vacationRentalSchema(property: {
  id: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  city?: string;
  rating?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: property.title,
    description: property.description,
    url: `${BASE_URL}/property/${property.id}`,
    image: property.image || IMAGE_URL,
    priceRange: `${property.price} KGS`,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city || "Иссык-Куль",
      addressCountry: "KG",
    },
    ...(property.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: property.rating,
            bestRating: 5,
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function searchActionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
