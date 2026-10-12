// Structured data (schema.org JSON-LD) for every page, built from the same
// content the CMS edits. One @graph per page: the brand (Organization) and
// site (WebSite) everywhere, plus what the page is — an Article with its
// dietitian author, a dietitian's ProfilePage, an FAQPage, or a plain WebPage.

const plain = (s = "") => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const iso = (d) => new Date(d).toISOString();
const compact = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length)));

export function buildSchema(ctx, site, pages, topics, team) {
  const base = site.url;
  const abs = (path) => (!path ? undefined : /^https?:/.test(path) ? path : base + encodeURI(decodeURI(path)));
  const url = abs(ctx.url);
  const orgId = base + "/#organization";
  const siteId = base + "/#website";
  const personId = (id) => `${base}/team/${id}/#person`;

  const org = compact({
    "@type": "Organization",
    "@id": orgId,
    name: site.name,
    alternateName: ["Co-Dare", `${site.name} Co-Dare`],
    url: base + "/",
    logo: { "@type": "ImageObject", url: base + "/assets/img/logo.png" },
    description: plain(site.description),
    email: site.email,
    sameAs: [site.social?.instagram_url, ...(site.social?.podcast_links || []).map((l) => l.url)].filter(Boolean),
  });
  const website = {
    "@type": "WebSite",
    "@id": siteId,
    url: base + "/",
    name: site.name,
    inLanguage: "zh-TW",
    publisher: { "@id": orgId },
  };
  const graph = [org, website];

  const description = plain(ctx.seo_description || ctx.excerpt || site.description);
  const pageName = plain(ctx.seo_title || ctx.title || site.name);

  const person = (m) =>
    compact({
      "@type": "Person",
      "@id": personId(m.data.id),
      name: m.data.name,
      jobTitle: m.data.role || "營養師",
      url: abs(m.url),
      image: abs(m.data.avatar),
      worksFor: { "@id": orgId },
      knowsAbout: m.data.specialty ? m.data.specialty.split("、").map((s) => s.trim()).filter(Boolean) : undefined,
    });

  if (ctx.layout === "article.njk") {
    const topic = topics.find((t) => t.slug === ctx.topic);
    const author = team.find((m) => m.data.id === ctx.author);
    graph.push(compact({
      "@type": "Article",
      "@id": url + "#article",
      headline: plain(ctx.title),
      description,
      image: [abs(ctx.cover) || base + "/assets/img/logo.png"],
      datePublished: iso(ctx.date),
      dateModified: iso(Math.max(new Date(ctx.updated || 0), new Date(ctx.date))),
      author: author ? { "@id": personId(author.data.id) } : { "@id": orgId },
      publisher: { "@id": orgId },
      mainEntityOfPage: url,
      isPartOf: { "@id": siteId },
      inLanguage: "zh-TW",
      articleSection: topic?.name,
      keywords: ctx.keywords || undefined,
    }));
    if (author) graph.push(person(author));
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "首頁", item: base + "/" },
        { name: pages.layout.nav.articles, item: base + "/articles/" },
        ...(topic ? [{ name: topic.name, item: `${base}/topics/${topic.slug}/` }] : []),
        { name: plain(ctx.title), item: url },
      ].map((b, i) => ({ "@type": "ListItem", position: i + 1, ...b })),
    });
  } else if (ctx.layout === "member.njk") {
    const m = team.find((t) => t.data.id === ctx.id);
    graph.push({
      "@type": "ProfilePage",
      "@id": url,
      url,
      name: pageName,
      isPartOf: { "@id": siteId },
      inLanguage: "zh-TW",
      mainEntity: { "@id": personId(ctx.id) },
    });
    if (m) graph.push(person(m));
  } else if (ctx.url === "/run-with-you/") {
    graph.push({
      "@type": "FAQPage",
      "@id": url,
      url,
      name: pageName,
      isPartOf: { "@id": siteId },
      inLanguage: "zh-TW",
      mainEntity: (pages.runwith.faq.items || []).map((f) => ({
        "@type": "Question",
        name: plain(f.q),
        acceptedAnswer: { "@type": "Answer", text: plain(f.a) },
      })),
    });
  } else {
    graph.push(compact({
      "@type": ctx.url === "/articles/" || ctx.url?.startsWith("/topics/") ? "CollectionPage" : "WebPage",
      "@id": url,
      url,
      name: pageName,
      description,
      isPartOf: { "@id": siteId },
      about: ctx.url === "/" || ctx.url === "/about/" ? { "@id": orgId } : undefined,
      inLanguage: "zh-TW",
    }));
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/</g, "\\u003c");
}
