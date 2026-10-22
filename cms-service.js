/* CMS-managed copy for ACAMADI individual service pages. */
(async()=>{
  const file=location.pathname.split('/').pop();
  const slug=file.endsWith('.html')?file.slice(0,-5):file;
  const valid=["detailing","ceramic-coatings","valeting","dash-cam-installation","reverse-cameras","vehicle-technology"];
  if(!valid.includes(slug))return;
  try{
    const response=await fetch('/content/pages/'+slug+'.json',{cache:'no-cache'});
    if(!response.ok)return;
    const data=await response.json();
    const one=(selector,root=document)=>root?.querySelector(selector);
    const set=(selector,key,root=document)=>{const node=one(selector,root);if(node&&typeof data[key]==='string'&&data[key])node.textContent=data[key]};
    const hero=one('.service-page-hero');
    set('.eyebrow','hero_label',hero);
    set('.service-page-intro','hero_description',hero);
    const heading=one('h1',hero);
    if(heading){
      const span=one('span',heading);
      if(typeof data.hero_white==='string'&&data.hero_white){
        const br=document.createElement('br');
        heading.replaceChildren(document.createTextNode(data.hero_white),br,span||document.createElement('span'));
      }
      if(typeof data.hero_yellow==='string'&&data.hero_yellow)set('span','hero_yellow',heading);
    }
    const prices=Array.isArray(data.prices)?data.prices:[];
    const priceNodes=[...document.querySelectorAll('.package-price strong,.valet-price strong,.dashcam-price strong,.reverse-price strong,.technology-price strong')];
    prices.forEach((entry,i)=>{
      const priceBox=priceNodes[i]?.parentElement;
      const card=priceBox?.parentElement;
      if(card){
        const h3=card.querySelector('h3');
        const description=priceBox.nextElementSibling;
        if(h3 && typeof entry.label==='string') h3.textContent=entry.label;
        if(description?.matches('p') && typeof entry.description==='string') description.textContent=entry.description;
      }
      if(card && Array.isArray(entry.bullets)) {
        const list=card.querySelector('ul');
        if(list){
          list.replaceChildren(...entry.bullets.filter(x=>typeof x==='string'&&x.trim()).map(bullet=>{
            const li=document.createElement('li'); li.textContent=bullet; return li;
          }));
        }
      }
      const amount=Number(entry?.amount);
      if(priceNodes[i]&&Number.isFinite(amount)&&amount>=0){
        const strong=priceNodes[i];
        strong.textContent='£'+amount.toLocaleString('en-GB');
        // The original Refresh/quote card has no "From" label.
        // When given a numeric CMS starting price, present it like other packages.
        if(priceBox && !priceBox.querySelector('span')){
          const prefix=document.createElement('span');
          prefix.textContent='From';
          priceBox.insertBefore(prefix,strong);
          priceBox.classList.remove('valet-price-text');
        }
      }
    });
    const intro=one('.service-intro-grid');
    if(intro){
      set('.eyebrow','intro_label',intro);
      set('h2','intro_heading',intro);
      intro.querySelectorAll('.service-intro-copy p').forEach((p,i)=>{const k='intro_paragraph_'+(i+1);if(typeof data[k]==='string'&&data[k])p.textContent=data[k]});
    }
  }catch(error){console.warn('Service page CMS content unavailable',error)}
})();
