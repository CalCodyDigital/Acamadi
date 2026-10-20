/* Acamadi CMS preview: safely render editorial content from Pages CMS.
   Design, navigation, links, postcode checker and verified reviews remain intact. */
(async () => {
  const paths = ["home", "services", "about", "areas"];
  try {
    const responses = await Promise.all(paths.map(name =>
      fetch("/content/" + name + ".json", { cache: "no-cache" })
    ));
    if (responses.some(response => !response.ok)) throw new Error("Missing CMS content");
    const data = Object.assign({}, ...(await Promise.all(responses.map(r => r.json()))));
    const el = (selector, within = document) => within?.querySelector(selector);
    const set = (selector, key, within = document) => {
      const element = el(selector, within);
      if (element && typeof data[key] === "string") element.textContent = data[key];
    };
    const hero = el(".hero");
    set(".eyebrow", "hero_eyebrow", hero);
    set(".hero-copy", "hero_intro", hero);
    // Two independent content fields preserve the original coloured design.
    const heading = el("h1", hero);
    if (heading && (typeof data.hero_heading_white === "string" || typeof data.hero_heading_yellow === "string")) {
      const first = data.hero_heading_white || "";
      const second = data.hero_heading_yellow || "";
      heading.replaceChildren(document.createTextNode(first));
      if (second) {
        heading.append(document.createElement("br"));
        const accent = document.createElement("span");
        accent.textContent = second;
        heading.append(accent);
      }
    }
    const services = el("#services");
    set(".section-head .eyebrow", "services_eyebrow", services);
    set(".section-head h2", "services_heading", services);
    set(".section-head > p", "services_intro", services);
    services?.querySelectorAll(".service-card").forEach((card, index) => {
      const n = index + 1;
      set("h3", "service_" + n + "_title", card);
      set("p", "service_" + n + "_description", card);
    });
    const about = el("#about");
    set(".eyebrow", "about_eyebrow", about);
    set("h2", "about_heading", about);
    about?.querySelectorAll(".intro-copy > p").forEach((p, index) => {
      const key = "about_paragraph_" + (index + 1);
      if (typeof data[key] === "string") p.textContent = data[key];
    });
    const showcase = el(".split-showcase");
    set(".showcase-copy .eyebrow", "showcase_eyebrow", showcase);
    set(".showcase-copy h2", "showcase_heading", showcase);
    set(".showcase-copy > p:not(.eyebrow)", "showcase_text", showcase);
    const areas = el("#areas");
    set(".areas-copy h2", "area_heading", areas);
    set(".areas-copy > p:not(.eyebrow)", "area_text", areas);
    const cta = el(".contact-strip");
    set("h2", "cta_heading", cta);
    set(".contact-strip-inner > div:first-child > p:not(.eyebrow)", "cta_text", cta);

    // CMS image paths must be local to the repository.
    const safeImage = value => typeof value === "string" &&
      value.startsWith("/images/cms/") &&
      !value.includes("..") &&
      /^[a-zA-Z0-9_./%-]+$/.test(value);
    const heroImage = data.hero_photo;
    if (safeImage(heroImage)) {
      const img = heroImage;
      const heroBg = el(".hero-bg");
      if (heroBg) heroBg.style.backgroundImage =
        "linear-gradient(90deg, rgba(31,45,103,.96),rgba(31,45,103,.28)),url(" + JSON.stringify(img) + ")";
    }
    const showcaseImage = data.showcase_photo;
    if (safeImage(showcaseImage)) {
      const img = showcaseImage;
      const target = el(".showcase-image");
      if (target) target.style.backgroundImage =
        "linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.18)),url(" + JSON.stringify(img) + ")";
    }
  } catch (error) {
    console.warn("CMS content could not be loaded; original page remains visible.", error);
  }
})();
