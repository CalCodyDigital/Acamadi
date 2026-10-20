/* Verified customer reviews, editable in Pages CMS. */
(async () => {
  const grids = document.querySelectorAll("[data-google-review-grid]");
  if (!grids.length) return;
  try {
    const response = await fetch("/content/reviews.json", {cache:"no-cache"});
    if (!response.ok) return;
    const reviews = await response.json();
    if (!Array.isArray(reviews)) return;
    const eligible = reviews.filter(review => typeof review.name === "string" &&
      typeof review.body === "string" && Number(review.stars) >= 4 && Number(review.stars) <= 5);
    if (!eligible.length) return;
    for(let i=eligible.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [eligible[i],eligible[j]]=[eligible[j],eligible[i]];
    }
    grids.forEach(grid=>{
      const n=Math.min(Number(grid.dataset.googleReviewCount)||3,eligible.length);
      const cards=eligible.slice(0,n).map(review=>{
        const card=document.createElement("blockquote");
        card.className="review-card";
        const stars=document.createElement("div");
        stars.className="stars";
        stars.setAttribute("aria-label",review.stars+" out of 5 stars");
        stars.textContent="★".repeat(Number(review.stars));
        const p=document.createElement("p");
        p.textContent="“"+review.body+"”";
        const footer=document.createElement("footer");
        footer.append(document.createTextNode(review.name+" "));
        const source=document.createElement("span");
        const logo=document.createElement("img");
        logo.className="google-g-logo google-g-logo-small";
        logo.src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png";
        logo.alt="";
        logo.width=16;
        logo.height=16;
        logo.loading="lazy";
        source.append(logo,document.createTextNode("Google review"));
        footer.append(source);
        card.append(stars,p,footer);
        return card;
      });
      grid.replaceChildren(...cards);
    });
  } catch(e){ console.warn("CMS reviews unavailable; using existing reviews",e); }
})();
