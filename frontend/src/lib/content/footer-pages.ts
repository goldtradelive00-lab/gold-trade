export interface FooterPage {
  slug: string;
  title: string;
  kicker: string;
  paragraphs: string[];
}

export const productPages: Record<string, FooterPage> = {
  portfolio: {
    slug: "portfolio",
    title: "Portfolio",
    kicker: "Product",
    paragraphs: [
      "GoldTrade's portfolio command center aggregates every holding you own — public equities, fixed income, real estate, private equity, and digital assets — into a single, high-fidelity view.",
      "Rather than logging into a dozen custodians and brokerages, private clients see a unified statement of net worth, updated continuously as prices move and transactions settle.",
      "Every position carries full cost-basis history, so gains, losses, and concentration risk are always visible at a glance, without needing to reconcile spreadsheets.",
    ],
  },
  "yield-optimization": {
    slug: "yield-optimization",
    title: "Yield Optimization",
    kicker: "Product",
    paragraphs: [
      "Idle cash is the most common source of quiet underperformance in a private portfolio. GoldTrade's Vault Sweep program continuously moves uninvested cash into short-duration instruments earning institutional money-market rates.",
      "Sweeps are fully liquid — funds are available same-day for withdrawal or reinvestment — and are rebalanced automatically as your cash position changes.",
      "Clients set a target cash reserve; anything above that threshold is put to work without requiring a single instruction.",
    ],
  },
  "tax-efficiency": {
    slug: "tax-efficiency",
    title: "Tax Efficiency",
    kicker: "Product",
    paragraphs: [
      "GoldTrade's tax-aware engine runs continuous tax-loss harvesting across taxable accounts, systematically realizing losses to offset gains elsewhere in the portfolio without altering your target allocation.",
      "Asset location is optimized automatically — tax-inefficient holdings are placed in tax-advantaged accounts where possible, while tax-efficient holdings remain in taxable accounts.",
      "A year-end tax summary is prepared for your accountant, consolidating realized gains, losses, and harvested amounts across every account on the platform.",
    ],
  },
  "security-architecture": {
    slug: "security-architecture",
    title: "Security Architecture",
    kicker: "Product",
    paragraphs: [
      "Client assets are held with regulated, SECP-licensed custodial partners under multi-signature, cold-storage protocols. GoldTrade never takes custody of client funds directly.",
      "All data in transit and at rest is protected with 256-bit AES encryption. Authentication is enforced through hardware-backed multi-factor verification for every login and withdrawal request.",
      "The platform undergoes annual SOC 2 Type II audits and quarterly third-party penetration testing, with summary reports available to members on request.",
    ],
  },
};

export const companyPages: Record<string, FooterPage> = {
  "about-us": {
    slug: "about-us",
    title: "About Us",
    kicker: "Company",
    paragraphs: [
      "GoldTrade was founded on a simple premise: private wealth management should feel like a vault, not a marketplace. No noise, no upsells — just precision, discretion, and quiet performance.",
      "Our team draws from institutional asset management, custodial banking, and financial engineering, brought together to build a platform disciplined enough to be trusted with a family's legacy.",
      "Today GoldTrade serves private clients globally, with Rs 14.2B in assets managed under a single operating principle: the platform should be as unobtrusive and as reliable as the vault it's named for.",
    ],
  },
  ethics: {
    slug: "ethics",
    title: "Ethics",
    kicker: "Company",
    paragraphs: [
      "GoldTrade Advisors (Private) Limited acts as a fiduciary for every client, at all times. That means every recommendation is legally and ethically bound to serve your interests ahead of our own.",
      "We do not accept payment for order flow, we do not sell client data, and we do not push proprietary products where a lower-cost alternative better serves the client.",
      "Our compliance and ethics program is overseen independently of the investment team, with a direct reporting line to the board.",
    ],
  },
  careers: {
    slug: "careers",
    title: "Careers",
    kicker: "Company",
    paragraphs: [
      "We're a small, deliberately selective team building infrastructure for private wealth — engineers, quants, and client advisors who prefer precision over speed-to-market.",
      "We hire slowly and rarely. If you'd like to be considered for a future opening in engineering, compliance, or client advisory, reach out with a short note about what you'd bring.",
      "There are no open roles publicly posted at this time. Check back, or write to careers@goldtrade.example with your background.",
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy",
    kicker: "Company",
    paragraphs: [
      "GoldTrade collects only the information required to open, service, and secure your account — identity verification data, account activity, and communications you send us directly.",
      "We do not sell client data to third parties, and we do not use client financial data for advertising of any kind, on or off the platform.",
      "Data is shared only with regulated custodial and banking partners strictly as needed to execute your instructions, and with regulators where legally required.",
    ],
  },
};

export const legalPages: Record<string, FooterPage> = {
  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    kicker: "Legal",
    paragraphs: [
      "By accessing or using the GoldTrade platform, you agree to be bound by these Terms of Service and by the advisory agreement executed with GoldTrade Advisors (Private) Limited upon account opening.",
      "GoldTrade (dba Vault) is a financial technology company, not a bank. Banking services are provided by partner banks regulated by the State Bank of Pakistan. Brokerage and custodial services are provided by independent, SECP-regulated third parties.",
      "Limitation of Liability — Platform Development: The developer(s) and technology providers who design, build, and maintain the GoldTrade software platform bear no responsibility or liability whatsoever for any act, omission, error, negligence, misconduct, fraud, corruption, unauthorized transaction, manipulation of account data, or any other wrongdoing committed by a GoldTrade administrator, employee, or authorized staff member. This limitation applies without exception, regardless of whether such conduct was negligent, reckless, or intentional, and regardless of the resulting harm. The developer's role is strictly limited to the design, coding, and technical maintenance of the software; all operational, custodial, administrative, and financial decisions — including account approvals, withdrawal approvals, and fund handling — are made exclusively by GoldTrade Wealth Management (Private) Limited and its designated administrators, who bear sole and exclusive responsibility for such decisions and their consequences.",
      "By creating an account, you irrevocably waive any claim, demand, or legal action against the developer arising directly or indirectly from administrator conduct of any kind, and you agree to indemnify and hold the developer fully harmless from any resulting loss, damage, cost, or liability, including legal fees.",
      "These terms may be updated from time to time. Material changes will be communicated to members in advance of taking effect.",
    ],
  },
  disclosures: {
    slug: "disclosures",
    title: "Disclosures",
    kicker: "Legal",
    paragraphs: [
      "Investment advisory services are offered through GoldTrade Advisors (Private) Limited, an SECP-licensed investment adviser. Licensing does not imply a certain level of skill or training.",
      "All investing involves risk, including the possible loss of principal. Performance data shown on this site represents past performance and is not a guarantee of future results.",
      "Brokerage accounts are provided by third-party custodians and held in segregated accounts as required by SECP regulations. Segregation does not protect against loss of market value.",
    ],
  },
  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie Policy",
    kicker: "Legal",
    paragraphs: [
      "GoldTrade uses strictly necessary cookies to keep you securely signed in and to remember basic preferences such as theme.",
      "We do not use third-party advertising or tracking cookies. A small number of privacy-preserving analytics cookies are used to understand aggregate usage of the platform, never at the individual level.",
      "You can control cookie behavior through your browser settings at any time; disabling strictly necessary cookies may prevent you from staying signed in.",
    ],
  },
};
