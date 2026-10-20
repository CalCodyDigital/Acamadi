/* CMS-managed copy for ACAMADI individual service pages. */
(async()=>{
  const slug=location.pathname.split('/').pop().replace(/\\.html$/,'');
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
    const intro=one('.service-intro-grid');
    if(intro){
      set('.eyebrow','intro_label',intro);
      set('h2','intro_heading',intro);
      intro.querySelectorAll('.service-intro-copy p').forEach((p,i)=>{const k='intro_paragraph_'+(i+1);if(typeof data[k]==='string'&&data[k])p.textContent=data[k]});
    }
  }catch(error){console.warn('Service page CMS content unavailable',error)}
})();
