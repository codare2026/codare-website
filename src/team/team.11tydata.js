export default {
  layout: "member.njk",
  eleventyComputed: {
    permalink: (data) => `/team/${data.id}/`,
    title: (data) => data.name,
    excerpt: (data) => `${data.name}｜口袋營養獅營養師團隊`,
  },
};
