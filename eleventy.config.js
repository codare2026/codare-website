import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // GitHub Pages project sites live under /<repo>/ — the HTML base plugin
  // rewrites every root-relative URL with this prefix at build time.
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy("src/assets");
  // Decap CMS editor is copied as-is; the dashboard at /admin/ is a template
  eleventyConfig.addPassthroughCopy("src/admin/edit");
  eleventyConfig.ignores.add("src/admin/edit/**");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  // Custom domain for GitHub Pages
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // Content collections (newest first). Drafts stay out of the public site.
  // Articles dated in the future are scheduled and wait until that time.
  const published = (item) => !item.data.draft;
  const byNewest = (a, b) => b.date - a.date;
  eleventyConfig.addCollection("articlesAll", (api) =>
    api.getFilteredByGlob("src/articles/*.md").sort(byNewest)
  );
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/articles/*.md").filter((item) => published(item) && item.date <= new Date()).sort(byNewest)
  );
  eleventyConfig.addCollection("events", (api) =>
    api.getFilteredByGlob("src/events/*.md").filter(published).sort(byNewest)
  );
  eleventyConfig.addCollection("team", (api) =>
    api.getFilteredByGlob("src/team/*.md").sort((a, b) => (a.data.order || 99) - (b.data.order || 99))
  );

  eleventyConfig.addGlobalData("year", new Date().getFullYear());

  // Filters
  // Dates are shown in Taiwan time, whatever timezone the build runs in
  const taipeiFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" });
  const taipeiDay = (d) => taipeiFormat.format(new Date(d));
  eleventyConfig.addFilter("dateDot", (d) => taipeiDay(d).replaceAll("-", "."));
  eleventyConfig.addFilter("dateIso", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("where", (arr = [], key, value) =>
    arr.filter((item) => (item.data ? item.data[key] : item[key]) === value)
  );
  eleventyConfig.addFilter("findBy", (arr = [], key, value) =>
    arr.find((item) => (item.data ? item.data[key] : item[key]) === value)
  );
  eleventyConfig.addFilter("exclude", (arr = [], url) => arr.filter((item) => item.url !== url));
  eleventyConfig.addFilter("limit", (arr = [], n) => arr.slice(0, n));
  eleventyConfig.addFilter("readingMinutes", (html = "") => {
    const text = String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, "");
    return Math.max(1, Math.round(text.length / 400));
  });
  eleventyConfig.addFilter("plain", (html = "") => String(html).replace(/<[^>]+>/g, "").trim());
  eleventyConfig.addFilter("jsonify", (v) => JSON.stringify(v));

  // Admin dashboard: plain summaries of content, embedded as JSON in /admin/
  eleventyConfig.addFilter("adminEntries", (items = []) =>
    items.map((i) => ({
      slug: i.page.fileSlug,
      title: i.data.title || i.data.name,
      date: i.date,
      url: i.url || null,
      draft: !!i.data.draft,
      featured: !!i.data.featured,
      cover: !!i.data.cover,
      seo: !!i.data.seo_description,
      placeholder: /待補/.test(i.rawInput || ""),
    }))
  );
  eleventyConfig.addFilter("scriptJson", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
