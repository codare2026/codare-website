// Hidden articles (draft: true) and scheduled ones (date still in the future)
// stay in the repo and the CMS but get no page. The deploy workflow rebuilds
// the site every hour, so scheduled articles go live on their own. They stay in
// the "articlesAll" collection so the admin dashboard can list them.
const isHidden = (data) => !!data.draft || new Date(data.page.date) > new Date();

export default {
  layout: "article.njk",
  eleventyComputed: {
    permalink: (data) => (isHidden(data) ? false : `/articles/${data.url_slug || data.page.fileSlug}/`),
  },
};
