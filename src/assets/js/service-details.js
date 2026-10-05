/* ============================================================
   SERVICE DETAILS — renders one service by ?service= query param.
   Static demo content (no CMS/backend), same pattern as
   blog-details.js: swap SERVICES with real data or a fetch()
   call when this is wired up to one.
   ============================================================ */

(() => {
  const SERVICES = {
    'web-development': {
      tag: 'Web Development',
      title: 'Web Development',
      icon: 'WD',
      timeline: '4–8 weeks',
      engagement: 'Fixed-scope build',
      image: 'https://picsum.photos/seed/xerxes-svc-web-dev/1400/760',
      paragraphs: [
        "A website is usually the first real interaction someone has with your business, and it's carrying more weight than most teams give it credit for — page speed, mobile layout and basic clarity all show up in whether someone sticks around or bounces to a competitor.",
        "We build on modern stacks chosen for the project rather than a default template, with a component system your team can extend without waiting on an agency retainer for every content change.",
      ],
      quote: "The best website isn't the one that wins an award. It's the one that loads fast, ranks well and converts the visitor who actually showed up.",
      paragraphs2: [
        'Every build ships with Core Web Vitals tuned before launch, not patched afterward, and a CMS wired in so your team can publish new pages without touching code.',
        'Analytics and conversion tracking are part of the handover, not an afterthought — so the first report after launch tells you something useful, not just traffic totals.',
      ],
      features: [
        'Custom design system, not a theme',
        'Built on modern stacks for performance and SEO',
        'Core Web Vitals tuned before launch, not after',
        'CMS wired in so your team can publish without a dev',
        'Analytics and conversion tracking set up from day one',
      ],
    },
    'ecommerce-development': {
      tag: 'Ecommerce Development',
      title: 'Ecommerce Development',
      icon: 'ED',
      timeline: '6–10 weeks',
      engagement: 'Fixed-scope build',
      image: 'https://picsum.photos/seed/xerxes-svc-ecommerce/1400/760',
      paragraphs: [
        "A storefront has one job that matters more than any other: turn a visitor into a completed order without friction. That means checkout, catalog and payments need to work together under real traffic, not just in a demo environment.",
        'We build catalog and inventory systems that connect to what you already run, so launch day doesn\u2019t mean re-entering your product data by hand or maintaining two sources of truth.',
      ],
      quote: "The storefronts that convert best aren't the flashiest. They're the ones where nothing gets between the customer and 'buy'.",
      paragraphs2: [
        "Every build is load-tested against your expected traffic before launch, so a sale day or a press mention doesn't take the site down at the worst possible moment.",
        'Abandoned-cart flows, re-engagement emails and a clear migration path off your current platform are all part of the engagement, not a separate line item.',
      ],
      features: [
        'Secure checkout with your preferred payment providers',
        'Catalog and inventory wired to your existing systems',
        'Built to handle traffic spikes on launch and sale days',
        'Abandoned-cart and re-engagement flows included',
        'Migration path from your current platform, if any',
      ],
    },
    'mobile-app-development': {
      tag: 'Mobile App Development',
      title: 'Mobile App Development',
      icon: 'MA',
      timeline: '8–14 weeks',
      engagement: 'iOS & Android',
      image: 'https://picsum.photos/seed/xerxes-svc-mobile/1400/760',
      paragraphs: [
        'Cross-platform frameworks have closed most of the performance gap with native apps, but the feel gap — the small motion and interaction details — still separates an app that feels premium from one that feels bolted together.',
        "We design and build for iOS and Android as first-class platforms, respecting each one's own interaction conventions rather than forcing a single design to fit both.",
      ],
      quote: "Users rarely say the animation curve felt off. They say the app feels cheap. It's the same complaint, and it's avoidable.",
      paragraphs2: [
        'App-store submission and review are handled end-to-end, along with push notifications, deep linking and crash reporting wired in before launch — not added in a rushed v1.1.',
        'A post-launch support window is included, so the first round of real-user bug reports gets a fast turnaround instead of sitting in a backlog.',
      ],
      features: [
        'Native-feel interactions on both iOS and Android',
        'App-store submission and review handled end-to-end',
        'Push notifications and deep linking set up from day one',
        'Crash reporting and analytics wired in before launch',
        'Post-launch support window included',
      ],
    },
    'digital-marketing': {
      tag: 'Digital Marketing',
      title: 'Digital Marketing',
      icon: 'DM',
      timeline: 'Ongoing, monthly',
      engagement: 'Retainer',
      image: 'https://picsum.photos/seed/xerxes-svc-marketing/1400/760',
      paragraphs: [
        'Most marketing retainers optimize for activity — more posts, more emails, more campaigns — instead of the outcomes those campaigns are supposed to drive. We start from the revenue number you actually care about and work backward.',
        "That means a technical SEO pass that fixes what's actually suppressing rankings, paid social tuned against real conversion data instead of platform-reported clicks, and email flows built around how your customers actually buy.",
      ],
      quote: "A campaign that gets a lot of engagement and doesn't move revenue isn't a marketing win. It's a vanity metric with a nice chart.",
      paragraphs2: [
        "Reporting is monthly and tied to the numbers that matter to the business, not impressions and likes dressed up as results.",
        "A quarterly strategy review is built into the retainer, so the plan adjusts as your product, market or budget changes — instead of running the same playbook regardless of what's working.",
      ],
      features: [
        'SEO audit and technical fixes prioritized by impact',
        'Paid social campaigns tuned against real conversion data',
        "Email flows built around your actual customer lifecycle",
        'Monthly reporting tied to revenue, not vanity metrics',
        'Quarterly strategy review baked into the retainer',
      ],
    },
    'artificial-intelligence': {
      tag: 'Artificial Intelligence',
      title: 'Artificial Intelligence',
      icon: 'AI',
      timeline: '4–8 week pilot',
      engagement: 'Pilot to production',
      image: 'https://picsum.photos/seed/xerxes-svc-ai/1400/760',
      paragraphs: [
        "The AI features earning their budget in 2026 aren't the ones announced with the loudest launch — they're the ones embedded quietly inside a workflow your team already uses, doing one job reliably.",
        'We build custom models and retrieval pipelines trained on your own data, wired into the tools you already run, rather than asking your team to adopt a new standalone product.',
      ],
      quote: 'The best AI feature is the one your team never has to think of as "the AI feature." It just makes the existing tool faster.',
      paragraphs2: [
        "Every build includes human-in-the-loop checkpoints for anything irreversible, along with usage and cost monitoring from day one — so a pilot doesn't turn into a surprise bill.",
        'We scope a clear path from pilot to production up front, with a measurable before/after, instead of leaving a promising demo to stall out after the first quarter.',
      ],
      features: [
        'Custom models or chat layered onto your own data',
        'Retrieval pipelines wired into your existing tools',
        'Human-in-the-loop checkpoints for anything irreversible',
        'Usage and cost monitoring from day one',
        'A clear path from pilot to production, not just a demo',
      ],
    },
    'domain-hosting': {
      tag: 'Domain Registration & Hosting',
      title: 'Domain Registration & Hosting',
      icon: 'DH',
      timeline: '1–2 weeks setup',
      engagement: 'Managed hosting',
      image: 'https://picsum.photos/seed/xerxes-svc-hosting/1400/760',
      paragraphs: [
        "Domains, SSL and hosting are the kind of infrastructure nobody thinks about until it breaks — and by then it's an outage, not a maintenance task. We set it up once, correctly, so it stays invisible.",
        'That includes domain registration and DNS configuration, SSL certificates that renew automatically, and managed hosting with backups running on a schedule your team doesn\u2019t have to remember.',
      ],
      quote: 'Good hosting is the infrastructure you never have to think about. That\u2019s the whole point.',
      paragraphs2: [
        "Uptime monitoring with real alerting means a problem gets caught before a customer notices, not after a support ticket comes in.",
        'Deploys are zero-downtime as standard — a rolling release behind health checks, not a maintenance window that takes the site offline.',
      ],
      features: [
        'Domain registration and DNS handled for you',
        'SSL certificates issued and auto-renewed',
        'Managed hosting with automated backups',
        'Uptime monitoring with alerting',
        'Zero-downtime deploys as standard',
      ],
    },
    'brand-management': {
      tag: 'Brand Management',
      title: 'Brand Management',
      icon: 'BM',
      timeline: '3–6 weeks',
      engagement: 'System + guidelines',
      image: 'https://picsum.photos/seed/xerxes-svc-brand/1400/760',
      paragraphs: [
        'A rebrand usually starts with a new logo and ends up touching every surface a company owns. The projects that go smoothly are the ones where a system existed before the refresh, not just a style guide nobody opens.',
        'We build identity systems on reusable design tokens — color, type and spacing defined once and referenced everywhere — so a visual update propagates instead of requiring a redo of every asset by hand.',
      ],
      quote: 'A rebrand should change the surface, not the plumbing. If it breaks everything underneath, it was never really a system.',
      paragraphs2: [
        'Voice and tone guidelines are written for your whole team to use, not just the design department, along with templates for decks, social and email — not just a logo file.',
        'The system is built to flex for a new product line, a regional variant or a seasonal campaign without touching the underlying rules, and we support rollout across every channel you own.',
      ],
      features: [
        'Identity system built on reusable design tokens',
        'Voice and tone guidelines your whole team can use',
        'Templates for decks, social and email, not just a logo',
        'Guidelines built to flex for new products or regions',
        'Rollout support across every channel you own',
      ],
    },
  };

  const ORDER = [
    'web-development',
    'ecommerce-development',
    'mobile-app-development',
    'digital-marketing',
    'artificial-intelligence',
    'domain-hosting',
    'brand-management',
  ];

  function getServiceSlug() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('service');
    return SERVICES[slug] ? slug : ORDER[0];
  }

  function render() {
    const slug = getServiceSlug();
    const svc = SERVICES[slug];

    document.title = `${svc.title} — XERXES Services`;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('serviceTag', svc.tag);
    setText('serviceTitle', svc.title);
    setText('serviceIconBadge', svc.icon);
    setText('serviceEngagement', svc.engagement);
    setText('serviceTimeline', `Typical timeline \u00b7 ${svc.timeline}`);

    const img = document.getElementById('serviceImg');
    if (img) {
      img.src = svc.image;
      img.alt = svc.title;
    }

    const body = document.getElementById('serviceBody');
    if (body) {
      const firstHalf = svc.paragraphs.map((p) => `<p>${p}</p>`).join('');
      const secondHalf = svc.paragraphs2.map((p) => `<p>${p}</p>`).join('');
      body.innerHTML = `
        ${firstHalf}
        <blockquote class="article-body__quote">${svc.quote}</blockquote>
        ${secondHalf}
      `;
    }

    const featuresList = document.getElementById('serviceFeatures');
    if (featuresList) {
      featuresList.innerHTML = svc.features
        .map((f) => `
          <li class="detail-features__item">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5 10 17 19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>${f}</span>
          </li>
        `)
        .join('');
    }

    const relatedList = document.getElementById('relatedServicesList');
    if (relatedList) {
      relatedList.innerHTML = ORDER
        .filter((s) => s !== slug)
        .slice(0, 4)
        .map((s) => {
          const svc2 = SERVICES[s];
          return `
            <a class="sidebar-card__item" href="service-details.html?service=${s}">
              <span class="sidebar-card__thumb sidebar-card__thumb--icon" aria-hidden="true">${svc2.icon}</span>
              <span class="sidebar-card__item-body">
                <span class="sidebar-card__item-tag">${svc2.engagement}</span>
                <span class="sidebar-card__item-title">${svc2.title}</span>
              </span>
            </a>
          `;
        })
        .join('');
    }
  }

  render();
})();
