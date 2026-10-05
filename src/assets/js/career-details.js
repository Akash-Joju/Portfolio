/* ============================================================
   CAREER DETAILS — renders one open role by ?job= query param.
   Static demo content (no CMS/backend), same pattern as
   service-details.js / product-details.js: swap JOBS with real
   data or a fetch() call when this is wired up to one.
   ============================================================ */

(() => {
  const JOBS = {
    'sdet': {
      tag: 'Engineering',
      title: 'Software Developer in Test',
      icon: 'SD',
      type: 'Full-time',
      location: 'Hybrid \u00b7 Ireland',
      mailSubject: 'Application%3A%20Software%20Developer%20in%20Test',
      image: 'https://picsum.photos/seed/xerxes-job-sdet/1400/760',
      paragraphs: [
        "We're looking for a Software Developer in Test to work closely with the software engineering team, building quality into every stage of the development process rather than checking for it at the end.",
        "You'll design and maintain automated test suites across our web and mobile products, and work directly with engineers to catch issues before they ever reach a release.",
      ],
      quote: "Quality isn't a phase at the end of a sprint. It's a habit built into every commit — that's the mindset this role exists to protect.",
      paragraphs2: [
        'You will own test strategy for the products you cover, from unit tests through to end-to-end automation, and report clearly on coverage and risk to the wider team.',
        'This is a hands-on, full-time role based around a team that reviews each other\u2019s work and genuinely backs each other up.',
      ],
      responsibilities: [
        'Design and maintain automated test suites across web and mobile',
        'Work with engineers to embed testing into the development workflow',
        'Investigate, reproduce and clearly document reported bugs',
        'Own test strategy and coverage reporting for your products',
        'Review pull requests with an eye for edge cases and regressions',
      ],
      requirements: [
        'Experience with automated testing frameworks (e.g. Playwright, Cypress, Selenium)',
        'Comfortable reading and writing code, not just executing test plans',
        'Understanding of CI/CD pipelines and how testing fits into them',
        'Clear written communication for bug reports and test documentation',
        'A methodical, detail-oriented approach to problem solving',
      ],
    },
    'marketing-executive': {
      tag: 'Marketing',
      title: 'Marketing Executive',
      icon: 'ME',
      type: 'Full-time',
      location: 'Hybrid \u00b7 Ireland',
      mailSubject: 'Application%3A%20Marketing%20Executive',
      image: 'https://picsum.photos/seed/xerxes-job-marketing/1400/760',
      paragraphs: [
        "We're looking for a Marketing Executive to spearhead ambitious marketing campaigns, from planning through execution, to help grow the Xerxes brand across new markets.",
        "You'll work across social, email and content, coordinating with design and product to make sure every campaign lands with a consistent voice and a clear goal.",
      ],
      quote: "A campaign is only as strong as the plan behind it. This role exists to make sure every campaign has one.",
      paragraphs2: [
        'You will track performance across channels and adjust course based on what the numbers actually say, not just what looks good on a dashboard.',
        'This is a full-time role with real ownership — you\u2019ll shape campaigns end to end rather than executing someone else\u2019s brief.',
      ],
      responsibilities: [
        'Plan and execute marketing campaigns across multiple channels',
        'Coordinate with design and product on campaign assets and messaging',
        'Manage social media presence and content calendars',
        'Track and report on campaign performance against goals',
        'Support brand growth into new markets and audiences',
      ],
      requirements: [
        'Experience running marketing campaigns end to end',
        'Comfortable with analytics tools and reading performance data',
        'Strong written communication and brand-voice consistency',
        'Familiarity with social media and email marketing platforms',
        'Organised, deadline-driven and comfortable owning a campaign',
      ],
    },
    'admin-assistant': {
      tag: 'Operations',
      title: 'Administrative Assistant',
      icon: 'AA',
      type: 'Full-time',
      location: 'Office \u00b7 Ireland',
      mailSubject: 'Application%3A%20Administrative%20Assistant',
      image: 'https://picsum.photos/seed/xerxes-job-admin/1400/760',
      paragraphs: [
        "We're looking for an Administrative Assistant to manage the office, support upper management and keep day-to-day operations running smoothly across the team.",
        "You'll be the person who keeps schedules, records and correspondence organised, so the rest of the team can focus on their own work without operational friction.",
      ],
      quote: "A well-run office is invisible when it's working. This role is what makes that possible, every single day.",
      paragraphs2: [
        'You will coordinate meetings, manage correspondence and maintain accurate records across departments.',
        'This is a full-time, office-based role for someone who takes pride in getting the details right.',
      ],
      responsibilities: [
        'Manage day-to-day office administration and correspondence',
        'Coordinate schedules, meetings and travel for upper management',
        'Maintain accurate records and documentation across departments',
        'Support onboarding and general HR administrative tasks',
        'Act as a first point of contact for office-related queries',
      ],
      requirements: [
        'Prior experience in an administrative or office support role',
        'Strong organisational skills and attention to detail',
        'Comfortable with common office software (calendars, docs, spreadsheets)',
        'Clear, professional written and verbal communication',
        'Able to manage multiple priorities in a fast-moving office',
      ],
    },
    'software-developer': {
      tag: 'Engineering',
      title: 'Software Developer',
      icon: 'SW',
      type: 'Full-time',
      location: 'Hybrid \u00b7 Ireland',
      mailSubject: 'Application%3A%20Software%20Developer',
      image: 'https://picsum.photos/seed/xerxes-job-swdev/1400/760',
      paragraphs: [
        "We're looking for a Software Developer to play a key role in designing and building next-generation digital products and services for a global Xerxes audience.",
        "You'll work across the stack on real client and product work, alongside a team that reviews code seriously and ships often.",
      ],
      quote: "Good software is built by people who care about the details nobody else notices. That's who we're looking for.",
      paragraphs2: [
        'You will collaborate with designers, QA and other developers from planning through to deployment, and take ownership of the features you build.',
        'This is a full-time role with room to grow into deeper technical ownership as you settle in.',
      ],
      responsibilities: [
        'Design, build and maintain features across our web and product platforms',
        'Collaborate with designers and QA from planning through deployment',
        'Write clean, tested, maintainable code and review others\u2019 pull requests',
        'Debug and resolve issues across the stack',
        'Contribute to technical decisions on architecture and tooling',
      ],
      requirements: [
        'Solid experience with a modern JavaScript/TypeScript stack',
        'Comfortable working across front-end and back-end code',
        'Understanding of REST APIs, databases and version control (Git)',
        'A track record of shipping and maintaining production software',
        'Good communication and comfort working in a small, collaborative team',
      ],
    },
  };

  const ORDER = ['sdet', 'marketing-executive', 'admin-assistant', 'software-developer'];

  function getJobSlug() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('job');
    return JOBS[slug] ? slug : ORDER[0];
  }

  function render() {
    const slug = getJobSlug();
    const job = JOBS[slug];
    const mailHref = `mailto:mail@xerxes.ie?subject=${job.mailSubject}`;

    document.title = `${job.title} — XERXES Careers`;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('jobTag', job.tag);
    setText('jobTitle', job.title);
    setText('jobIconBadge', job.icon);
    setText('jobType', job.type);
    setText('jobLocation', job.location);

    const applyLink = document.getElementById('jobApplyLink');
    if (applyLink) {
      applyLink.href = mailHref;
      applyLink.dataset.jobTitle = job.title;
    }

    const applyCta = document.getElementById('jobApplyCta');
    if (applyCta) {
      applyCta.href = mailHref;
      applyCta.dataset.jobTitle = job.title;
    }

    const img = document.getElementById('jobImg');
    if (img) {
      img.src = job.image;
      img.alt = job.title;
    }

    const body = document.getElementById('jobBody');
    if (body) {
      const firstHalf = job.paragraphs.map((p) => `<p>${p}</p>`).join('');
      const secondHalf = job.paragraphs2.map((p) => `<p>${p}</p>`).join('');
      body.innerHTML = `
        ${firstHalf}
        <blockquote class="article-body__quote">${job.quote}</blockquote>
        ${secondHalf}
      `;
    }

    const renderList = (id, items) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = items
        .map((item) => `
          <li class="detail-features__item">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5 10 17 19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>${item}</span>
          </li>
        `)
        .join('');
    };

    renderList('jobResponsibilities', job.responsibilities);
    renderList('jobRequirements', job.requirements);

    const relatedList = document.getElementById('relatedJobsList');
    if (relatedList) {
      relatedList.innerHTML = ORDER
        .filter((s) => s !== slug)
        .slice(0, 4)
        .map((s) => {
          const job2 = JOBS[s];
          return `
            <a class="sidebar-card__item" href="career-details.html?job=${s}">
              <span class="sidebar-card__thumb sidebar-card__thumb--icon" aria-hidden="true">${job2.icon}</span>
              <span class="sidebar-card__item-body">
                <span class="sidebar-card__item-tag">${job2.tag}</span>
                <span class="sidebar-card__item-title">${job2.title}</span>
              </span>
            </a>
          `;
        })
        .join('');
    }
  }

  render();
})();
