// Drafts (draft: true) are kept in the repo and the CMS but never published.
export default {
  layout: "article.njk",
  eleventyComputed: {
    permalink: (data) => (data.draft ? false : `/articles/${data.url_slug || data.page.fileSlug}/`),
    eleventyExcludeFromCollections: (data) => !!data.draft,
  },
};
