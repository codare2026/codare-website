import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // GitHub Pages project sites live under /<repo>/ — the HTML base plugin
  // rewrites every root-relative URL with this prefix at build time.
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // Content collections (newest first). Drafts stay out of the public site.
  const published = (item) => !item.data.draft;
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/articles/*.md").filter(published).sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("events", (api) =>
    api.getFilteredByGlob("src/events/*.md").filter(published).sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("team", (api) =>
    api.getFilteredByGlob("src/team/*.md").sort((a, b) => (a.data.order || 99) - (b.data.order || 99))
  );
  eleventyConfig.addCollection("columns", (api) => api.getFilteredByGlob("src/columns/*.md"));

  eleventyConfig.addGlobalData("year", new Date().getFullYear());

  // Filters
  eleventyConfig.addFilter("dateDot", (d) => {
    const date = new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
  });
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

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
