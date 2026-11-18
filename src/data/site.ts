/**
 * Single source of truth for everything the site says.
 * Edit this file to update the portfolio — no markup changes needed.
 *
 * The content mirrors the CV served at `profile.resumeUrl`; when the CV
 * changes, replace the PDF in /public and update this file to match.
 */

export interface SocialLink {
  label: string;
  href: string;
  icon: 'github' | 'linkedin' | 'mail';
  handle: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Project {
  title: string;
  /** What kind of product it is, shown next to the employer. */
  kind: string;
  /** Who it was built for. */
  org: string;
  summary: string;
  /**
   * Featured project only: short labelled paragraphs shown under the summary,
   * case-study style — e.g. 'Front end', 'Financial close', 'Outcome'.
   */
  story?: { label: string; text: string }[];
  highlights?: string[];
  /**
   * How the system fits together, in order. The featured project draws it as a
   * tiered diagram (one box per technology); the others as a single line.
   */
  flow: { layer: string; tech: string[] }[];
  featured?: boolean;
  /** Optional public links. Leave undefined for private/employer work. */
  liveUrl?: string;
  repoUrl?: string;
}

export interface Role {
  title: string;
  company: string;
  /** Machine-readable start/end (YYYY-MM) for <time> elements. */
  start: string;
  end?: string;
  period: string;
  points: string[];
  stack: string[];
}

export interface SkillGroup {
  name: string;
  /** Optional: `core: true` puts an accent dot on a skill (and shows the legend). */
  skills: { name: string; core?: boolean }[];
}

export interface Education {
  title: string;
  institution: string;
  period: string;
  description?: string;
}

export const profile = {
  name: 'Moshiur Rahman',
  role: 'Software Engineer',
  employer: 'Celloscope Ltd.',
  location: 'Dhaka, Bangladesh',
  timezone: 'GMT+6',
  email: 'moshiur251@gmail.com',
  /** The CV in /public. Shows the “Download CV” buttons; set to undefined to hide them. */
  resumeUrl: '/moshiur-rahman-cv.pdf' as string | undefined,
  /** First month of professional experience — drives the "years" stat at build time. */
  careerStart: '2022-12',
} as const;

export const seo = {
  title: 'Moshiur Rahman — Software Engineer',
  description:
    'Software engineer in Dhaka building full-stack products for fintech, e-commerce and logistics, including IMS, a microfinance platform rolling out to 600+ institutions in Bangladesh. Angular, TypeScript, Node.js and PostgreSQL.',
} as const;

export const hero = {
  eyebrow: 'Software Engineer · Dhaka, Bangladesh',
  /** The middle part is highlighted. Keep it to 12 words in total. */
  headline: {
    before: 'I turn complex workflows into software that ',
    highlight: 'businesses use every day',
    after: '.',
  },
  lede: 'I’m Moshiur — a software engineer at Celloscope Ltd. I build Angular and React front ends and Node.js APIs for products in fintech, e-commerce and logistics, and set up the tests and pipelines that keep releases predictable.',
} as const;

function yearsSince(yyyyMm: string): number {
  const [year = 0, month = 1] = yyyyMm.split('-').map(Number);
  const now = new Date();
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  return Math.max(0, Math.floor(months / 12));
}

/** Years of experience as stated on the CV; the figure only ever grows from here. */
const CV_YEARS = 4;

/** The hero "summary report" card: one row per figure, shown as a passing check. */
export const stats: Stat[] = [
  { value: '4', label: 'Products built with teams, from fintech to logistics' },
  {
    value: '600+',
    label: 'Microfinance institutions in the rollout of IMS, the platform I work on',
  },
  {
    value: `${Math.max(CV_YEARS, yearsSince(profile.careerStart))}+ yrs`,
    label: 'Building production software professionally',
  },
];

export const projects: Project[] = [
  {
    title: 'IMS',
    kind: 'Integrated Microfinance Solution',
    org: 'Celloscope Ltd.',
    featured: true,
    summary:
      'A national fintech platform for microfinance: live at 10+ institutions serving 3,000+ members, and rolling out to all 600+ MFIs in Bangladesh.',
    // Add more entries as you can share them — e.g. { label: 'Outcome', … } with
    // a concrete result. They lay out side by side.
    story: [
      {
        label: 'Front end',
        text: 'I built the core Angular front end, with TypeScript and RxJS, that MFI staff use daily to open accounts, collect repayments and deposits, and process withdrawals.',
      },
      {
        label: 'Financial close',
        text: 'I implemented the day-end and month-end close — staging data, MIS/AIS day-end, day-forward, month-end processing and interest posting — so each institution can close its books daily and monthly.',
      },
    ],
    flow: [
      { layer: 'Client', tech: ['Angular'] },
      { layer: 'Services', tech: ['Node.js', 'Java Spring Boot'] },
      { layer: 'Data', tech: ['PostgreSQL', 'Oracle'] },
    ],
    liveUrl: 'https://ims.mra.gov.bd/',
  },
  {
    title: 'Boi Jatra',
    kind: 'E-commerce bookstore platform',
    org: 'Celloscope Ltd.',
    summary:
      'I develop the back-office portal and REST API, giving the client’s team one bilingual system to manage its book catalog.',
    highlights: ['Back-office portal', 'REST API', 'Bangla / English'],
    flow: [
      { layer: 'Client', tech: ['Next.js', 'React'] },
      { layer: 'Services', tech: ['Node.js', 'Hapi.js'] },
      { layer: 'Data', tech: ['PostgreSQL'] },
    ],
    liveUrl: 'https://boijatra-dev.celloscope.net/',
  },
  {
    title: 'D-Courier',
    kind: 'Last-mile logistics platform',
    org: 'Doer Services PLC',
    summary:
      'I built the user and merchant portal, showing deliveries, fees, parcel details and schedules on one screen with integrated fee payment.',
    highlights: ['Dashboards with charts', 'Mobile view in the browser', 'Fee payment'],
    flow: [
      { layer: 'Client', tech: ['Angular'] },
      { layer: 'Services', tech: ['Node.js', 'Hapi.js'] },
      { layer: 'Data', tech: ['PostgreSQL'] },
    ],
    liveUrl: 'https://dcourier.celloscope.net/',
  },
  {
    title: 'dPass',
    kind: 'Visitor management system',
    org: 'Doer Services PLC',
    summary:
      'Built end to end: created in-house to secure the company’s data center, later developed into a commercial product with client, operations, receptionist and admin portals.',
    highlights: [
      'QR self-registration',
      'NID scan + photo',
      'OTP verification',
      'SMS + email alerts',
    ],
    flow: [
      { layer: 'Client', tech: ['Angular'] },
      { layer: 'Services', tech: ['Node.js', 'Express'] },
      { layer: 'Data', tech: ['PostgreSQL'] },
    ],
  },
];

/**
 * Kept to the role: what each project involved in detail is told once, on its
 * card under Selected work.
 */
export const experience: Role[] = [
  {
    title: 'Software Engineer',
    company: 'Celloscope Ltd.',
    start: '2025-02',
    period: 'Feb 2025 — Present',
    points: [
      'Develop enterprise applications with clean, maintainable architecture and industry-standard practices: IMS, a national microfinance platform, and Boi Jatra, an e-commerce bookstore.',
      'Handle client communication and code reviews to keep releases aligned with client requirements; mentored 2 junior developers.',
      'Automated UI and API testing with Cypress and Jest, replacing repetitive manual checks before each release with automated JSON/HTML reports.',
      'Defined API conventions and a reusable table-configuration system, and introduced Husky pre-commit hooks, so new screens follow one pattern and every commit is formatted automatically.',
      'Configured GitLab CI pipelines for automatic deployment to dev servers, and supported server upkeep with Docker and Bash cron jobs for backups, log cleanup and reports.',
    ],
    stack: [
      'Angular',
      'TypeScript',
      'RxJS',
      'Next.js',
      'Node.js',
      'Hapi.js',
      'PostgreSQL',
      'Oracle',
      'Cypress',
      'Jest',
      'GitLab CI',
      'Docker',
    ],
  },
  {
    title: 'Junior Software Engineer',
    company: 'Doer Services PLC',
    start: '2022-12',
    end: '2025-01',
    period: 'Dec 2022 — Jan 2025',
    points: [
      'Delivered full-stack features across two products, D-Courier and dPass, building REST APIs with Node.js (Hapi.js and Express) and production UI in Angular and TypeScript.',
      'Built the D-Courier user and merchant portal in Angular with Hapi.js REST APIs on PostgreSQL.',
      'Built dPass, a visitor management system, end to end — from an in-house tool to a commercial product.',
    ],
    stack: ['Angular', 'TypeScript', 'Node.js', 'Hapi.js', 'Express', 'PostgreSQL'],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    name: 'Front end',
    skills: [
      { name: 'Angular' },
      { name: 'TypeScript' },
      { name: 'JavaScript' },
      { name: 'RxJS' },
      { name: 'Angular Material' },
      { name: 'NG-ZORRO' },
      { name: 'Next.js (React)' },
      { name: 'Tailwind CSS' },
    ],
  },
  {
    name: 'Back end & databases',
    skills: [
      { name: 'Node.js' },
      { name: 'Hapi.js' },
      { name: 'Express' },
      { name: 'PostgreSQL' },
      { name: 'Oracle Database' },
      { name: 'SQL' },
    ],
  },
  {
    name: 'Testing & tools',
    skills: [
      { name: 'Cypress' },
      { name: 'Jest' },
      { name: 'Git' },
      { name: 'Husky' },
      { name: 'ESLint' },
      { name: 'Prettier' },
    ],
  },
  {
    name: 'Familiar with',
    skills: [
      { name: 'Java' },
      { name: 'Spring Boot (microservices)' },
      { name: 'GitLab CI/CD' },
      { name: 'Docker' },
      { name: 'Linux' },
      { name: 'Bash scripting' },
    ],
  },
  {
    name: 'Practices',
    skills: [
      { name: 'REST API design' },
      { name: 'Code review' },
      { name: 'Mentoring' },
      { name: 'Internationalization (i18n)' },
      { name: 'Agile' },
      { name: 'Remote collaboration' },
    ],
  },
];

export const about = {
  paragraphs: [
    'I’m a software engineer based in Dhaka. I started at Doer Services, where I built a courier platform and a visitor management system across the stack, and I now work at Celloscope on IMS, the microfinance platform rolling out across Bangladesh.',
    'I care about how a team ships as much as what it ships. I review code, handle client communication and have mentored two junior developers, and I set up the conventions, pre-commit hooks, automated tests and CI pipelines that keep releases predictable.',
  ],
  languages: [
    { name: 'Bengali', level: 'Native' },
    { name: 'English', level: 'Professional · IELTS 6.5' },
  ],
} as const;

export const education: Education[] = [
  {
    title: 'B.Sc. in Computer Science & Engineering',
    institution: 'Daffodil Institute of IT',
    period: '2021',
  },
];

/**
 * Shown as chips under Education when there are any. Add `url` (the
 * credential/verification link) to each one you hold.
 */
export const certifications: { name: string; url?: string }[] = [];

export const socials: SocialLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/moshiur745/',
    icon: 'linkedin',
    handle: 'in/moshiur745',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Robin745',
    icon: 'github',
    handle: 'Robin745',
  },
  {
    label: 'Email',
    href: `mailto:${profile.email}`,
    icon: 'mail',
    handle: profile.email,
  },
];

export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
] as const;
