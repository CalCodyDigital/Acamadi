/* ACAMADI CMS camera catalogue. Preserve the original cards as a fallback. */
(async () => {
  const grids = {
    "front-rear": document.querySelector("#dual-cameras .camera-grid"),
    "front-only": document.querySelector("#front-cameras .camera-grid")
  };
  if (!grids["front-rear"] || !grids["front-only"]) return;
  try {
    const response = await fetch("/content/dashcams.json", {cache:"no-cache"});
    if (!response.ok) throw new Error("Dash cam catalogue unavailable");
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error("Invalid catalogue");
    const brands = new Set(["blackvue","thinkware","finevu"]);
    const grouped = {"front-rear":[], "front-only":[]};
    const make = (tag, className, value) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (value != null) node.textContent = String(value);
      return node;
    };
    for (const item of items) {
      if (!item || item.enabled === false || !grouped[item.setup]) continue;
      const brand = String(item.brand || "").toLowerCase();
      const model = String(item.model || "").trim();
      const price = Number(item.price);
      if (!brands.has(brand) || !model || !Number.isFinite(price) || price < 0) continue;
      const article = make("article","camera-card");
      article.dataset.cameraBrand = brand;
      const imageWrap = make("div","camera-card-image");
      const imagePath = String(item.image || "");
      if ((imagePath.startsWith("images/") || imagePath.startsWith("/images/")) &&
          !imagePath.includes("..") && /^[a-zA-Z0-9_./%-]+$/.test(imagePath)) {
        const img = document.createElement("img");
        img.src = imagePath.startsWith("/") ? imagePath : "/" + imagePath;
        img.alt = String(item.enquiry_model || item.brand + " " + model) + " dash cam";
        img.loading = "lazy";
        imageWrap.append(img);
      }
      const top = make("div","camera-card-top");
      top.append(make("span","camera-brand",item.brand), make("span","camera-type",item.type||""));
      const priceWrap = make("div","camera-price");
      priceWrap.append(make("strong","", "£" + price.toLocaleString("en-GB")), make("span","","+ fitting"));
      const enquiry = document.createElement("a");
      const modelName = String(item.enquiry_model || item.brand + " " + model + " " + (item.type||"")).trim();
      enquiry.href = "/contact.html?service=" + encodeURIComponent("Dash Cam Supply & Installation") +
                     "&camera=" + encodeURIComponent(modelName);
      enquiry.append(document.createTextNode("Enquire about this camera "));
      enquiry.append(make("span","","→"));
      article.append(imageWrap, top, make("h3","",model), priceWrap, enquiry);
      grouped[item.setup].push({price,article});
    }
    for (const [setup, grid] of Object.entries(grids)) {
      const list = grouped[setup].sort((a,b)=>b.price-a.price);
      grid.replaceChildren(...list.map(x=>x.article));
    }
    document.querySelectorAll("[data-camera-tab]").forEach(tab => {
      const setup = tab.dataset.cameraTab === "dual-cameras" ? "front-rear" : "front-only";
      const badge = tab.querySelector("span");
      if (badge) badge.textContent = grouped[setup].length + " options";
    });
    // Reapply the original existing brand-filter handler after updating the cards.
    document.querySelector(".camera-brand-button[aria-pressed='true']")?.click();
  } catch (error) {
    console.warn("Keeping existing dash cam catalogue:",error);
  }
})();
