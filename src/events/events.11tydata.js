export default {
  layout: "event.njk",
  eleventyComputed: {
    permalink: (data) => (data.draft ? false : `/events/${data.page.fileSlug}/`),
    eleventyExcludeFromCollections: (data) => !!data.draft,
  },
};
