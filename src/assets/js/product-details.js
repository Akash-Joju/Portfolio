/* ============================================================
   PRODUCT DETAILS — renders one product by ?product= query param.
   Static demo content (no CMS/backend), same pattern as
   service-details.js: swap PRODUCTS with real data or a fetch()
   call when this is wired up to one.
   ============================================================ */

(() => {
  const PRODUCTS = {
    'evom': {
      tag: 'Smart Retail',
      title: 'Evom',
      icon: 'EV',
      category: 'Smart Retail Platform',
      tagline: 'Grocery shopping, reimagined',
      link: 'https://xerxes.ie/products/evom-smart-gadgets',
      image: 'https://picsum.photos/seed/xerxes-product-evom/1400/760',
      paragraphs: [
        "Evom is a smart grocery-shopping platform built to make browsing, ordering and checkout fast, easy and genuinely enjoyable for customers — from the first product search to the moment an order lands at the door.",
        "It brings catalog browsing, cart management and delivery tracking together in one clean interface, so shoppers aren't juggling separate apps or tabs to get a weekly order done.",
      ],
      quote: "Grocery shopping shouldn't feel like work. Evom exists to remove every unnecessary step between 'I need this' and 'it's on the way.'",
      paragraphs2: [
        'Store owners get a single dashboard for inventory, pricing and order fulfilment, with real-time stock sync so a sold-out item never makes it to a customer\u2019s cart.',
        'The platform is built to scale from a single storefront to a multi-branch operation without a re-platform — the same system just grows with the business.',
      ],
      features: [
        'Fast product search and smart category browsing',
        'Real-time inventory sync across every branch',
        'One-tap reordering from purchase history',
        'Live order and delivery tracking for customers',
        'A single dashboard for stock, pricing and fulfilment',
      ],
      steps: [
        { title: 'Onboard', body: 'We import your catalog and connect existing inventory and payment systems.' },
        { title: 'Configure', body: 'Branches, delivery zones and pricing rules are set up around how you already operate.' },
        { title: 'Go live', body: 'Customers start ordering through a branded storefront, web or app.' },
        { title: 'Support', body: 'Our team monitors uptime and ships improvements as your catalog grows.' },
      ],
    },
    'ziv': {
      tag: 'Point of Sale',
      title: 'Ziv',
      icon: 'ZV',
      category: 'Point of Sale Platform',
      tagline: 'Billing built for speed at the counter',
      link: 'https://xerxes.ie/products/ziv',
      image: 'https://picsum.photos/seed/xerxes-product-ziv/1400/760',
      paragraphs: [
        "Ziv is a simple, effective POS billing solution built for retail stores and small-to-mid-sized companies that need speed at the counter without a bloated, hard-to-train system behind it.",
        "Every screen is designed around the person actually ringing up the sale — fewer taps, clearer totals and a layout that a new hire can learn in an afternoon.",
      ],
      quote: "The best POS system is the one your staff forget they're using. Ziv is built to disappear into the transaction.",
      paragraphs2: [
        'Sales, stock and staff activity all report back to one place, so end-of-day reconciliation is a glance at a dashboard instead of a spreadsheet exercise.',
        'Ziv works fine on an unreliable connection too — transactions queue locally and sync the moment the network is back, so a bad signal never stops a sale.',
      ],
      features: [
        'Fast, minimal-tap billing screen built for the counter',
        'Works offline and syncs automatically when reconnected',
        'Live stock levels tied directly to every sale',
        'Staff activity and shift reporting built in',
        'End-of-day reconciliation from a single dashboard',
      ],
      steps: [
        { title: 'Onboard', body: 'We set up your product list, pricing and tax rules from day one.' },
        { title: 'Configure', body: 'Registers, staff logins and receipt branding are tailored to your store.' },
        { title: 'Go live', body: 'Staff start billing at the counter with minimal training required.' },
        { title: 'Support', body: 'We monitor for issues and roll out updates without disrupting trading hours.' },
      ],
    },
    'hnd': {
      tag: 'Navigation Hardware',
      title: 'HnD',
      icon: 'HD',
      category: 'Handheld Navigation Device',
      tagline: 'Hardware and hosting, kept in sync',
      link: 'https://xerxes.ie/products/handheld-navigator-device',
      image: 'https://picsum.photos/seed/xerxes-product-hnd/1400/760',
      paragraphs: [
        "HnD is a handheld navigator device paired with reliable, affordable hosting infrastructure — so the hardware in the field and the platform behind it stay in sync without separate vendors to manage.",
        "It's built for teams that need dependable positioning and routing in the field, backed by a hosting layer that keeps maps, routes and firmware updates current without manual intervention.",
      ],
      quote: "Hardware is only as good as the platform behind it. HnD ships both, built to work as one system rather than two.",
      paragraphs2: [
        'Firmware and map data update over the air, so devices in the field stay current without a physical collection-and-reflash cycle.',
        'Fleet status, battery health and last-known location are all visible from a central dashboard, so a lost or low-battery device is caught early.',
      ],
      features: [
        'Reliable positioning and routing built for field use',
        'Over-the-air firmware and map updates',
        'Hosting infrastructure bundled with the hardware',
        'Central dashboard for fleet status and battery health',
        'Built for rugged, everyday field conditions',
      ],
      steps: [
        { title: 'Onboard', body: 'We provision your devices and connect them to your hosted environment.' },
        { title: 'Configure', body: 'Routes, geofences and update schedules are set for your fleet.' },
        { title: 'Go live', body: 'Devices deploy into the field with monitoring active from day one.' },
        { title: 'Support', body: 'We track fleet health and push firmware updates as needed.' },
      ],
    },
    'xde': {
      tag: 'Cloud Integration',
      title: 'XDE',
      icon: 'XD',
      category: 'SaaS Integration Platform',
      tagline: 'Your SaaS stack, connected',
      link: 'https://xerxes.ie/products/Saas-based-integration-tool',
      image: 'https://picsum.photos/seed/xerxes-product-xde/1400/760',
      paragraphs: [
        "XDE is a SaaS-based integration tool that helps businesses move to the cloud, connecting your favourite SaaS applications into one platform instead of leaving data scattered across disconnected tools.",
        "It's built for the reality most businesses live in: a handful of best-in-class apps that were never designed to talk to each other, and a team that shouldn't have to re-enter the same data three times.",
      ],
      quote: "The value in your SaaS stack isn't any single app. It's what happens when they all share the same data, in real time.",
      paragraphs2: [
        'Pre-built connectors cover the most common business tools, with a general-purpose API layer for anything custom your team already runs.',
        'Every sync is logged and monitored, so a broken integration surfaces as an alert — not as missing data someone discovers weeks later.',
      ],
      features: [
        'Pre-built connectors for common SaaS tools',
        'General-purpose API layer for custom integrations',
        'Real-time, two-way data sync across connected apps',
        'Sync monitoring with alerts on failures',
        'A single control panel for every integration',
      ],
      steps: [
        { title: 'Onboard', body: 'We map the tools in your stack and the data that needs to move between them.' },
        { title: 'Configure', body: 'Connectors are set up and sync rules are matched to your workflows.' },
        { title: 'Go live', body: 'Data starts flowing between your apps automatically, in real time.' },
        { title: 'Support', body: 'We monitor every sync and resolve issues before they affect your team.' },
      ],
    },
  };

  const ORDER = ['evom', 'ziv', 'hnd', 'xde'];

  function getProductSlug() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('product');
    return PRODUCTS[slug] ? slug : ORDER[0];
  }

  function render() {
    const slug = getProductSlug();
    const p = PRODUCTS[slug];

    document.title = `${p.title} — XERXES Products`;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('productTag', p.tag);
    setText('productTitle', p.title);
    setText('productIconBadge', p.icon);
    setText('productCategory', p.category);
    setText('productTagline', p.tagline);

    const extLink = document.getElementById('productExternalLink');
    if (extLink) extLink.href = p.link;

    const img = document.getElementById('productImg');
    if (img) {
      img.src = p.image;
      img.alt = p.title;
    }

    const body = document.getElementById('productBody');
    if (body) {
      const firstHalf = p.paragraphs.map((para) => `<p>${para}</p>`).join('');
      const secondHalf = p.paragraphs2.map((para) => `<p>${para}</p>`).join('');
      body.innerHTML = `
        ${firstHalf}
        <blockquote class="article-body__quote">${p.quote}</blockquote>
        ${secondHalf}
      `;
    }

    const featuresList = document.getElementById('productFeatures');
    if (featuresList) {
      featuresList.innerHTML = p.features
        .map((f) => `
          <li class="detail-features__item">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5 10 17 19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>${f}</span>
          </li>
        `)
        .join('');
    }

    const stepsList = document.getElementById('productSteps');
    if (stepsList) {
      stepsList.innerHTML = p.steps
        .map((s, i) => `
          <li class="svc-step">
            <span class="svc-step__index">0${i + 1}</span>
            <span class="svc-step__body">
              <h3>${s.title}</h3>
              <p>${s.body}</p>
            </span>
          </li>
        `)
        .join('');
    }

    const relatedList = document.getElementById('relatedProductsList');
    if (relatedList) {
      relatedList.innerHTML = ORDER
        .filter((s) => s !== slug)
        .slice(0, 4)
        .map((s) => {
          const p2 = PRODUCTS[s];
          return `
            <a class="sidebar-card__item" href="product-details.html?product=${s}">
              <span class="sidebar-card__thumb sidebar-card__thumb--icon" aria-hidden="true">${p2.icon}</span>
              <span class="sidebar-card__item-body">
                <span class="sidebar-card__item-tag">${p2.tag}</span>
                <span class="sidebar-card__item-title">${p2.title}</span>
              </span>
            </a>
          `;
        })
        .join('');
    }
  }

  render();
})();
