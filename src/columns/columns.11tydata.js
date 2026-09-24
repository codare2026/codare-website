export default {
  layout: "column.njk",
  eleventyComputed: {
    permalink: (data) => `/columns/${data.id}/`,
    title: (data) => `《${data.name}》`,
    excerpt: (data) => data.description,
  },
};
