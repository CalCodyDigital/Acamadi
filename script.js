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
  const serviceSelect=enquiryForm.querySelector('[name="service"]');
  const cameraField=document.getElementById('camera-field');
  const cameraInput=enquiryForm.querySelector('[name="camera_model"]');
  if(service&&serviceSelect){const opt=[...serviceSelect.options].find(o=>o.value===service);if(opt)serviceSelect.value=service;}
  if(camera&&cameraInput&&cameraField){cameraInput.value=camera;cameraField.hidden=false;if(serviceSelect)serviceSelect.value='Dash Cam Supply & Installation';}
}
