/* ============================================================
   BLOG DETAILS — renders one article by ?post= query param.
   Static demo content (no CMS/backend) — swap POSTS with real
   data or a fetch() call when this is wired up to one.
   ============================================================ */

(() => {
  const POSTS = {
    'ai-trends': {
      tag: 'AI & Automation',
      title: "5 AI Trends Reshaping Enterprise Software",
      author: 'Aarvin M Sasidharan',
      date: '12 Jun 2026',
      read: '6 min read',
      image: 'https://picsum.photos/seed/xerxes-ai-trends/1400/760',
      paragraphs: [
        'Enterprise software teams spent the last two years experimenting with AI. This year, the experiments are turning into line items — copilots embedded in internal tools, retrieval pipelines wired into support desks, and agents that can complete multi-step tasks without a human clicking through every screen.',
        'The shift that matters most is not model quality, it is integration depth. The products winning budget in 2026 are the ones that sit inside an existing workflow rather than asking teams to open a new tab. That means AI features live inside the CRM, the ticketing system, the IDE — wherever the work already happens.',
      ],
      quote: 'The best AI feature is the one your team never has to think of as “the AI feature.” It just makes the existing tool faster.',
      paragraphs2: [
        'Autonomous agents are the most hyped category and the least evenly distributed in practice. They work well for bounded, well-instrumented tasks — triaging tickets, drafting first-pass code reviews, summarizing long threads — and still need a human checkpoint for anything irreversible.',
        'For teams evaluating where to invest next, the practical filter is simple: does this reduce a step your team repeats weekly, and can you measure the before/after? If both are true, it is worth a pilot. If either is unclear, it is worth waiting one more quarter.',
      ],
    },
    'headless-commerce': {
      tag: 'Ecommerce',
      title: "Why Headless Commerce Is Winning the Stack",
      author: 'XERXES Editorial',
      date: '27 May 2026',
      read: '5 min read',
      image: 'https://picsum.photos/seed/xerxes-headless-commerce/1400/760',
      paragraphs: [
        'Monolithic storefronts made sense when a single template could serve every customer touchpoint. That assumption broke a while ago — shoppers now move between app, web, marketplace and in-store kiosk, and a tightly coupled front end slows every one of those surfaces down.',
        'Headless commerce decouples the storefront from the commerce engine, so the team building the checkout experience is not blocked on a platform release cycle. The API layer becomes the contract, and every channel — web, app, voice, POS — consumes it independently.',
      ],
      quote: 'Decoupling is not a performance trick. It is an organizational one — it lets design and platform teams ship on different clocks.',
      paragraphs2: [
        'The migration path that works in practice is incremental: start with the highest-traffic template, prove the API contract under real load, then peel off the rest of the storefront section by section. Rewriting everything at once is where most headless migrations stall.',
        'Done well, teams see the biggest wins in Core Web Vitals and in how quickly a new landing page or promotion can ship — often the difference between a campaign that makes a launch date and one that misses it.',
      ],
    },
    'native-feel-apps': {
      tag: 'Mobile',
      title: "Designing Apps That Feel Native, Not Bolted On",
      author: 'XERXES Editorial',
      date: '03 May 2026',
      read: '4 min read',
      image: 'https://picsum.photos/seed/xerxes-native-apps/1400/760',
      paragraphs: [
        'Cross-platform frameworks have closed most of the performance gap with fully native apps. What they have not closed automatically is the feel gap — the small motion and interaction details that tell a user\'s hand this app belongs on this phone.',
        'That feel comes from dozens of small decisions: how a sheet resists before it dismisses, whether haptics land on the actual state change or just on the tap, and how list scrolling handles momentum at the edges.',
      ],
      quote: 'Users rarely say “the animation curve felt off.” They say “this app feels cheap.” It is the same complaint.',
      paragraphs2: [
        'The teams that get this right treat platform conventions as a constraint worth respecting rather than a limitation to route around — iOS and Android both ship well-tested interaction patterns, and fighting them usually costs more than it earns in brand distinctiveness.',
        'Budget for a dedicated interaction-polish pass late in the build, after core flows are stable. It is a small percentage of total build time that accounts for most of what separates a good app store review from a great one.',
      ],
    },
    'seo-that-scales': {
      tag: 'Digital Marketing',
      title: "SEO That Scales Past the First 10 Pages",
      author: 'XERXES Editorial',
      date: '18 Apr 2026',
      read: '5 min read',
      image: 'https://picsum.photos/seed/xerxes-seo-scale/1400/760',
      paragraphs: [
        "Most SEO advice tops out around the first ten pages of a site — title tags, meta descriptions, a sitemap. That's necessary, but it's also the easy ten percent. The hard part starts when a catalog crosses a few thousand URLs and templates start fighting each other for the same keywords.",
        "Programmatic pages are where scale either compounds or collapses. A category template that generates thin, near-duplicate pages will get quietly deprioritized by search engines long before anyone notices in the analytics dashboard — the traffic just never shows up.",
      ],
      quote: "Technical SEO isn't a checklist you run once. It's a constraint you design the templates around from day one.",
      paragraphs2: [
        'The fix is almost always structural rather than content-level: consolidate near-duplicate templates, make internal linking reflect actual topical hierarchy, and treat crawl budget as a finite resource on any catalog over a few thousand pages.',
        'Once the structure is sound, the content work compounds instead of fighting itself — new pages inherit authority from the category instead of starting from zero every time.',
      ],
    },
    'brand-systems': {
      tag: 'Branding',
      title: "Building a Brand System That Survives a Rebrand",
      author: 'XERXES Editorial',
      date: '02 Apr 2026',
      read: '4 min read',
      image: 'https://picsum.photos/seed/xerxes-brand-systems/1400/760',
      paragraphs: [
        'A brand refresh usually starts with a new logo and ends up touching every surface a company owns — the deck template, the email signature, the packaging, the app icon. The projects that go smoothly are the ones where a system existed before the refresh, not just a style guide.',
        'The difference between a style guide and a system is enforcement. A PDF of approved colors gets ignored under deadline pressure. Tokens wired into the design files and the codebase get inherited automatically, whether or not anyone remembers the guide exists.',
      ],
      quote: 'A rebrand should change the surface, not the plumbing. If it breaks everything underneath, the system was never really a system.',
      paragraphs2: [
        'Teams that invest in a token-based system up front — color, type, spacing defined once and referenced everywhere — can usually execute a full visual refresh in weeks instead of quarters, because the update happens in one place and propagates.',
        'The payoff shows up the next time the brand needs to flex: a new product line, a regional variant, a seasonal campaign. None of it requires touching the underlying system, only the values it points to.',
      ],
    },
    'zero-downtime-hosting': {
      tag: 'Infrastructure',
      title: "Zero-Downtime Hosting: What It Actually Takes",
      author: 'Aarvin M Sasidharan',
      date: '20 Mar 2026',
      read: '6 min read',
      image: 'https://picsum.photos/seed/xerxes-zero-downtime/1400/760',
      paragraphs: [
        '"Zero downtime" gets used loosely in hosting pitches, but the real version is specific: no dropped requests during a deploy, a failover, or a traffic spike, verified by monitoring rather than assumed from an uptime badge.',
        "Most of the risk isn't the server — it's the deploy. A rolling release that swaps instances behind a load balancer, with health checks gating traffic, removes the single biggest source of self-inflicted outages: shipping code that isn't ready yet.",
      ],
      quote: 'Uptime is a monitoring number. Zero downtime is an engineering practice. The two are related, not the same thing.',
      paragraphs2: [
        'The pieces that matter in practice are boring on purpose: automated health checks, a rollback path that takes seconds not minutes, and database migrations designed to be backward-compatible for at least one release.',
        'None of it requires exotic infrastructure. It requires treating deploys as a first-class engineering problem instead of an afterthought bolted on after the feature is done.',
      ],
    },
  };

  const ORDER = ['ai-trends', 'headless-commerce', 'native-feel-apps', 'seo-that-scales', 'brand-systems', 'zero-downtime-hosting'];

  function getPostSlug() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('post');
    return POSTS[slug] ? slug : ORDER[0];
  }

  function initials(name) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function render() {
    const slug = getPostSlug();
    const post = POSTS[slug];

    document.title = `${post.title} — XERXES Blog`;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('articleTag', post.tag);
    setText('articleTitle', post.title);
    setText('articleAuthor', post.author);
    setText('articleDate', post.date);
    setText('articleRead', post.read);
    setText('articleAuthorBadge', initials(post.author));

    const img = document.getElementById('articleImg');
    if (img) {
      img.src = post.image;
      img.alt = post.title;
    }

    const body = document.getElementById('articleBody');
    if (body) {
      const firstHalf = post.paragraphs.map((p) => `<p>${p}</p>`).join('');
      const secondHalf = post.paragraphs2.map((p) => `<p>${p}</p>`).join('');
      body.innerHTML = `
        ${firstHalf}
        <blockquote class="article-body__quote">${post.quote}</blockquote>
        ${secondHalf}
      `;
    }

    const relatedList = document.getElementById('relatedList');
    if (relatedList) {
      relatedList.innerHTML = ORDER
        .filter((s) => s !== slug)
        .slice(0, 3)
        .map((s) => {
          const p = POSTS[s];
          return `
            <a class="sidebar-card__item" href="blog-details.html?post=${s}">
              <img class="sidebar-card__thumb" src="${p.image.replace('1400/760', '160/160')}" alt="" loading="lazy" />
              <span class="sidebar-card__item-body">
                <span class="sidebar-card__item-tag">${p.tag}</span>
                <span class="sidebar-card__item-title">${p.title}</span>
              </span>
            </a>
          `;
        })
        .join('');
    }
  }

  render();
})();
