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

  const formatPostcode = value => {
    const clean = value.toUpperCase().replace(/\s+/g, '');
    return clean.length > 3
      ? clean.slice(0, -3) + ' ' + clean.slice(-3)
      : clean;
  };

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
      const county = result.admin_county || '';
      const district = result.admin_district || '';
      const region = result.region || '';
      const canonicalPostcode = result.postcode || postcode;

      const covered =
        region === 'London' ||
        county === 'Hertfordshire' ||
        county === 'Essex' ||
        district === 'Thurrock' ||
        district === 'Southend-on-Sea';

      if (covered) {
        showPostcodeResult(
          'covered',
          "You're in our usual service area.",
          'We can normally provide mobile services at your location. Final availability depends on the service and appointment date.',
          canonicalPostcode
        );
      } else {
        showPostcodeResult(
          'outside',
          'Your postcode is outside our usual area.',
          'We may still be able to help depending on the service and location. Send us the details and we can confirm.',
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
