import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://blog.harrisonhemstreet.com", // replace this with your deployed domain
  author: "Harrison Hemstreet",
  desc: "Harrison Hemstreet's blog on computer science and general interests.",
  title: "Harrison Hemstreet",
  ogImage: "https://i.imgur.com/6aveDNY.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/harrisonhemstreet",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/harrisonhemstreet/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:harrisonhemstreet@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@HarrisonHemstreet",
    linkTitle: `${SITE.title} on YouTube`,
    active: true,
  },
];
