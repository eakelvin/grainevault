import { Idea } from "./types";

export const INITIAL_IDEAS: Idea[] = [
  {
    id: "idea-1",
    title: "AI-Powered Invoice Reconciliation",
    description:
      "A SaaS platform that uses machine learning to automatically match invoices with purchase orders and bank transactions, reducing manual accounting work by 80%. Targets mid-market companies drowning in AP/AR paperwork.",
    shortDescription:
      "ML-powered invoice matching for mid-market finance teams.",
    tags: ["#SaaS", "#FinTech", "#AI"],
    status: "ready",
    inputType: "text",
    readinessScore: 78,
    marketSize: "$4.2B",
    targetAudience: "Mid-market CFOs & Finance Ops (50–500 employees)",
    topCompetitor: { name: "Bill.com", strength: "Strong brand & integrations" },
    keyTrend: "AP automation adoption up 34% YoY",
    competitors: [
      {
        name: "Bill.com",
        strength: "Market leader with 400K+ customers",
        weakness: "Limited AI matching accuracy on complex invoices",
      },
      {
        name: "Tipalti",
        strength: "Global payment capabilities",
        weakness: "High price point for SMBs",
      },
      {
        name: "Stampli",
        strength: "Excellent AP workflow UX",
        weakness: "Narrow focus on AP only",
      },
    ],
    growthMetrics: [
      { year: "2025", value: 3.2 },
      { year: "2026", value: 4.1 },
      { year: "2027", value: 5.3 },
      { year: "2028", value: 6.8 },
    ],
    actionPlan: [
      "Interview 10 mid-market CFOs to validate pain points",
      "Build MVP with QuickBooks & Xero integrations",
      "Run paid pilot with 3 design partner companies",
    ],
    mediaPath: null,
    extractedText: "",
    createdAt: "2025-07-12T10:00:00Z",
    archivedAt: null,
  },
  {
    id: "idea-2",
    title: "Micro-Learning for Healthcare Workers",
    description:
      "Bite-sized, mobile-first training modules for nurses and clinical staff to stay compliant with evolving regulations. Gamified progress tracking and team leaderboards drive engagement.",
    shortDescription:
      "Mobile micro-learning for healthcare compliance training.",
    tags: ["#EdTech", "#HealthTech", "#Mobile"],
    status: "analyzing",
    inputType: "voice",
    readinessScore: 62,
    marketSize: "$1.8B",
    targetAudience: "Hospital HR & L&D Directors",
    topCompetitor: { name: "Relias", strength: "Deep healthcare content library" },
    keyTrend: "Healthcare worker burnout driving shift to async learning",
    competitors: [
      {
        name: "Relias",
        strength: "Comprehensive compliance catalog",
        weakness: "Dated UX, low mobile engagement",
      },
      {
        name: "HealthStream",
        strength: "Enterprise hospital relationships",
        weakness: "Slow content update cycle",
      },
      {
        name: "MedTrainer",
        strength: "Affordable for smaller clinics",
        weakness: "Limited gamification features",
      },
    ],
    growthMetrics: [
      { year: "2025", value: 1.4 },
      { year: "2026", value: 1.7 },
      { year: "2027", value: 2.1 },
      { year: "2028", value: 2.6 },
    ],
    actionPlan: [
      "Partner with 2 regional hospital networks for beta",
      "Develop 20 core compliance modules",
      "Apply for HIPAA-compliant infrastructure certification",
    ],
    mediaPath: null,
    extractedText: "",
    createdAt: "2025-08-01T14:30:00Z",
    archivedAt: null,
  },
  {
    id: "idea-3",
    title: "Carbon Credit Marketplace for SMEs",
    description:
      "A transparent marketplace where small and medium businesses can buy verified carbon offsets and track their net-zero progress with automated reporting for ESG compliance.",
    shortDescription:
      "Carbon offset marketplace tailored for SME sustainability goals.",
    tags: ["#ClimateTech", "#Marketplace", "#ESG"],
    status: "ready",
    inputType: "image",
    readinessScore: 71,
    marketSize: "$2.1B",
    targetAudience: "SME Sustainability Officers & ESG Consultants",
    topCompetitor: { name: "Patch", strength: "Developer-friendly API" },
    keyTrend: "EU CSRD mandating SME carbon reporting by 2027",
    competitors: [
      {
        name: "Patch",
        strength: "Strong API & developer ecosystem",
        weakness: "Less SME-focused onboarding",
      },
      {
        name: "Watershed",
        strength: "Enterprise-grade analytics",
        weakness: "Pricing excludes smaller companies",
      },
      {
        name: "ClimeCo",
        strength: "Direct project sourcing",
        weakness: "Limited self-serve experience",
      },
    ],
    growthMetrics: [
      { year: "2025", value: 1.6 },
      { year: "2026", value: 2.0 },
      { year: "2027", value: 2.8 },
      { year: "2028", value: 3.5 },
    ],
    actionPlan: [
      "Secure partnerships with 5 verified offset project developers",
      "Build automated ESG report generator",
      "Launch freemium tier for companies under 50 employees",
    ],
    mediaPath: null,
    extractedText: "",
    createdAt: "2025-07-28T09:15:00Z",
    archivedAt: null,
  },
  {
    id: "idea-4",
    title: "Neighborhood Tool Library App",
    description:
      "A hyperlocal sharing economy app where neighbors lend and borrow tools, appliances, and equipment. Reduces waste, builds community, and saves money on infrequently used items.",
    shortDescription:
      "Peer-to-peer tool sharing app for local communities.",
    tags: ["#SharingEconomy", "#Community", "#Mobile"],
    status: "analyzing",
    inputType: "text",
    readinessScore: 55,
    marketSize: "$890M",
    targetAudience: "Urban homeowners aged 28–45",
    topCompetitor: { name: "Neighbor", strength: "Storage-focused peer rental model" },
    keyTrend: "Cost-of-living crisis driving sharing economy growth",
    competitors: [
      {
        name: "Neighbor",
        strength: "Proven peer rental infrastructure",
        weakness: "Focused on storage, not tools",
      },
      {
        name: "Fat Llama",
        strength: "Wide item categories",
        weakness: "Limited hyperlocal focus",
      },
      {
        name: "Nextdoor",
        strength: "Massive neighborhood user base",
        weakness: "No dedicated lending workflow",
      },
    ],
    growthMetrics: [
      { year: "2025", value: 0.7 },
      { year: "2026", value: 0.9 },
      { year: "2027", value: 1.2 },
      { year: "2028", value: 1.5 },
    ],
    actionPlan: [
      "Launch pilot in 3 suburban neighborhoods",
      "Build trust & rating system with deposit escrow",
      "Partner with local hardware stores for referral incentives",
    ],
    mediaPath: null,
    extractedText: "",
    createdAt: "2025-08-05T16:45:00Z",
    archivedAt: null,
  },
];

export const TAG_POOL = [
  "#SaaS",
  "#FinTech",
  "#AI",
  "#EdTech",
  "#HealthTech",
  "#Mobile",
  "#ClimateTech",
  "#Marketplace",
  "#ESG",
  "#SharingEconomy",
  "#Community",
  "#B2B",
  "#Consumer",
  "#DeepTech",
];

export const COMPETITOR_NAMES = [
  "Acme Corp",
  "NovaTech",
  "ScaleUp Inc",
  "Vertex Labs",
  "Pulse Systems",
  "Horizon AI",
  "Summit Digital",
  "Forge Analytics",
];

export const TRENDS = [
  "AI adoption accelerating across vertical SaaS",
  "Remote-first workflows reshaping B2B buying",
  "Regulatory tailwinds driving compliance spend",
  "Gen-Z entering prime consumer spending years",
  "Platform consolidation creating integration gaps",
  "Sustainability mandates expanding to mid-market",
];

export const AUDIENCES = [
  "Mid-market operations leaders",
  "Startup founders in growth stage",
  "Enterprise IT decision makers",
  "SMB owners seeking automation",
  "Product managers at scale-ups",
  "Freelancers and solopreneurs",
];
