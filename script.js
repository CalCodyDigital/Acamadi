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
