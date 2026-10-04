const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

document.getElementById('year').textContent = new Date().getFullYear();


/* Dash cam catalogue tabs */

const cameraTabs = document.querySelectorAll('[data-camera-tab]');

if (cameraTabs.length) {
  cameraTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-camera-tab');

      cameraTabs.forEach(item => {
        const isActive = item === tab;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      document.querySelectorAll('.camera-panel').forEach(panel => {
        const isActive = panel.id === targetId;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });
    });
  });
}


/* Contact enquiry prefill */
const enquiryForm=document.querySelector('[data-enquiry-form]');
if(enquiryForm){
  const params=new URLSearchParams(window.location.search);
  const service=params.get('service');
  const camera=params.get('camera');
  const postcode=params.get('postcode');
  const serviceSelect=enquiryForm.querySelector('[name="service"]');
  const cameraField=document.getElementById('camera-field');
  const cameraInput=enquiryForm.querySelector('[name="camera_model"]');
  const postcodeInput=enquiryForm.querySelector('[name="postcode"]');
  if(service&&serviceSelect){const opt=[...serviceSelect.options].find(o=>o.value===service);if(opt)serviceSelect.value=service;}
  if(camera&&cameraInput&&cameraField){cameraInput.value=camera;cameraField.hidden=false;if(serviceSelect)serviceSelect.value='Dash Cam Supply & Installation';}
  if(postcode&&postcodeInput){postcodeInput.value=postcode;}
}


/* Postcode service area checker */

const postcodeForm = document.querySelector('[data-postcode-form]');
const postcodeResult = document.querySelector('[data-postcode-result]');

if (postcodeForm && postcodeResult) {
  const postcodeInput = postcodeForm.querySelector('[name="postcode"]');
  const submitButton = postcodeForm.querySelector('button[type="submit"]');

  const standardOutcodes = new Set([
    // Hertfordshire / nearby listed towns
    'EN10','EN11','EN7','EN8','EN9','EN6','EN4','EN5',
    'SG1','SG2','SG9','SG12','SG13','SG14',
    'CM21','CM23','CM24',
    'AL1','AL2','AL3','AL4','AL9','AL10',
    'WD6','WD17','WD18','WD19','WD24','WD25',

    // Essex listed towns
    'CM5','CM6','CM13','CM14','CM15','CM16','CM17','CM18','CM19','CM20',
    'CB10','CB11',
    'IG7','IG9','IG10',

    // North London listed areas
    'EN1','EN2','EN3',
    'N2','N3','N8','N10','N11','N12','N13','N14','N15','N17','N20','N21','N22',

    // East London listed areas
    'E4','E11','E18',
    'IG4','IG8'
  ]);

  const listedAreaNames = [
    'hoddesdon','ware','broxbourne','nazeing','cheshunt','hertford','hertford heath',
    'waterford','stapleford','stanstead abbotts','stanstead abbots','stansted',
    'bishops stortford','bishop s stortford','waltham cross','waltham abbey',
    'watton at stone','stevenage','buntingford','sawbridgeworth','st albans',
    'saint albans','hatfield','watford',
    'harlow','saffron walden','ongar','epping','dunmow','great dunmow','brentwood',
    'loughton','chigwell','buckhurst hill','theydon','theydon bois',
    'enfield','wood green','tottenham','potters bar','barnet','finchley','muswell hill',
    'crouch end','winchmore hill','bush hill park','borehamwood',
    'wanstead','redbridge','chingford','south woodford'
  ];

  const formatPostcode = value => {
    const clean = value.toUpperCase().replace(/\s+/g, '');
    return clean.length > 3
      ? clean.slice(0, -3) + ' ' + clean.slice(-3)
      : clean;
  };

  const normalise = value =>
    (value || '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const showPostcodeResult = (status, title, message, postcode) => {
    const encoded = encodeURIComponent(postcode || '');
    const buttonLabel = status === 'covered' ? 'Request a quote' : 'Ask about your area';

    postcodeResult.className = 'postcode-result is-visible ' + status;
    postcodeResult.innerHTML =
      '<div class="postcode-result-icon" aria-hidden="true">' +
        (status === 'covered' ? '✓' : status === 'outside' ? '→' : '!') +
      '</div>' +
      '<div class="postcode-result-copy">' +
        '<strong>' + title + '</strong>' +
        '<p>' + message + '</p>' +
        (postcode
          ? '<a class="postcode-result-link" href="contact.html?postcode=' + encoded + '">' +
              buttonLabel + ' <span>→</span></a>'
          : '') +
      '</div>';
  };

  postcodeForm.addEventListener('submit', async event => {
    event.preventDefault();

    const postcode = formatPostcode(postcodeInput.value.trim());
    postcodeInput.value = postcode;

    if (!postcode) {
      showPostcodeResult('error', 'Enter a postcode', 'Add your UK postcode and try again.', '');
      postcodeInput.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Checking...';
    postcodeResult.className = 'postcode-result is-visible checking';
    postcodeResult.innerHTML =
      '<div class="postcode-result-copy"><strong>Checking your postcode...</strong><p>This should only take a moment.</p></div>';

    try {
      const response = await fetch('https://api.postcodes.io/postcodes/' + encodeURIComponent(postcode));

      if (!response.ok) {
        throw new Error('Postcode not found');
      }

      const data = await response.json();
      const result = data.result || {};
      const canonicalPostcode = result.postcode || postcode;
      const outcode = (result.outcode || canonicalPostcode.split(' ')[0] || '').toUpperCase();

      const locationText = normalise([
        result.parish,
        result.admin_ward,
        result.admin_district,
        result.admin_county,
        result.region,
        result.pfa
      ].filter(Boolean).join(' '));

      const matchesListedName = listedAreaNames.some(name =>
        locationText.includes(normalise(name))
      );

      const covered = matchesListedName || standardOutcodes.has(outcode);

      if (covered) {
        showPostcodeResult(
          'covered',
          "You're in our standard service area.",
          'This postcode falls within one of the areas ACAMADI normally covers. Final availability depends on the service and appointment date.',
          canonicalPostcode
        );
      } else {
        showPostcodeResult(
          'outside',
          'This postcode is outside our standard area.',
          'ACAMADI may still be able to help depending on the service and location. Send us the details and we can confirm.',
          canonicalPostcode
        );
      }
    } catch (error) {
      showPostcodeResult(
        'error',
        "We couldn't check that postcode.",
        'Please check the postcode and try again, or send it to us with your enquiry.',
        postcode
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Check coverage';
    }
  });
}


// Verified Google review selection (from client-supplied review screenshots).
// A random set of three is displayed on each page load. Update this list manually as needed.
(() => {
  const googleReviews = [
  {
    "name": "Suzannah Weinfass",
    "stars": 5,
    "body": "ACAMADI did a superb job valeting my car. Took a lot of time with great attention to detail, leaving my car looking like new. Would have no hesitation to recommend!"
  },
  {
    "name": "Joanne Kellam",
    "stars": 5,
    "body": "I cannot recommend this company highly enough ! Austin is very professional throughout - our car has never looked so good, the attention to detail and hard work is truly shown in the end product ! 10/10 service !"
  },
  {
    "name": "Martin C",
    "stars": 5,
    "body": "Having a bought my car second hand I have never been completely happy with the paint work quality. After a recommendation from a friend Acamadi stepped in to provide a Paint Enhancement service to remove the small swirls in the paint work. The results are excellent and above what I expected. A very friendly and professional service which I will definitely use again when my cars need valeting. Recommended!"
  },
  {
    "name": "Francesca",
    "stars": 5,
    "body": "Austin arrived on time and quickly fitted my front and rear dashcam. Even taking the time to explain how it works and how to use the app. The wiring is undetectable. Top class."
  },
  {
    "name": "Danny Pope",
    "stars": 5,
    "body": "Brilliant service, such a nice and polite guy aswell"
  },
  {
    "name": "G P",
    "stars": 5,
    "body": "I cannot recommend Austion enough. His work is flawless. Like many, I hadn’t cleaned my car for months. It was embarrassing. However, once Austin had performed his magic, both inside and out, it looked like it had just come off the production line. What’s more, he’s an absolutely lovely chap. Punctual, polite, respectful, helpful and hardworking. I shan’t hesitate to use his services, again, and have no hesitation in highly recommending him."
  },
  {
    "name": "Valentina Mihova",
    "stars": 5,
    "body": "Excellent service!"
  }
];
  const grids = document.querySelectorAll('[data-google-review-grid]');
  if (!grids.length) return;
  const eligible = googleReviews.filter(review => review.stars >= 4);
  const chosen = [...eligible];
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }
  grids.forEach(grid => {
    const count = Math.min(Number(grid.dataset.googleReviewCount) || 3, chosen.length);
    const cards = chosen.slice(0, count).map(review => {
      const card = document.createElement('blockquote');
      card.className = 'review-card';
      const stars = document.createElement('div');
      stars.className = 'stars';
      stars.setAttribute('aria-label', review.stars + ' out of 5 stars');
      stars.textContent = '★'.repeat(review.stars);
      const quote = document.createElement('p');
      quote.textContent = '“' + review.body + '”';
      const footer = document.createElement('footer');
      footer.textContent = review.name;
      const source = document.createElement('span');
      const googleIcon = document.createElement('img');
      googleIcon.src = 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png';
      googleIcon.className = 'google-g-logo google-g-logo-small';
      googleIcon.alt = '';
      googleIcon.width = 16;
      googleIcon.height = 16;
      googleIcon.loading = 'lazy';
      source.append(googleIcon, document.createTextNode('Google review'));
      footer.appendChild(source);
      card.append(stars, quote, footer);
      return card;
    });
    grid.replaceChildren(...cards);
  });
})();
