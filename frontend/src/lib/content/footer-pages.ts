export interface FooterPage {
  slug: string;
  title: string;
  kicker: string;
  paragraphs: string[];
}

export const productPages: Record<string, FooterPage> = {
  dashboard: {
    slug: "dashboard",
    title: "Dashboard",
    kicker: "Product",
    paragraphs: [
      "Your GoldTrade dashboard shows exactly where your money stands: your cash balance, your deposited principal, and the live Pakistan gold rate, all in one screen.",
      "Every deposit, withdrawal, referral bonus, and daily profit credit is logged as a transaction the moment it's approved, so your recent activity always reflects what actually happened to your account.",
      "There are no hidden positions or delayed updates: what you see on the dashboard is what you can withdraw, subject to admin review.",
    ],
  },
  "daily-profit": {
    slug: "daily-profit",
    title: "Daily Profit",
    kicker: "Product",
    paragraphs: [
      "Once a deposit is approved, its amount becomes part of your principal balance, the base that earns your daily profit. Every day, your principal earns a flat 1% profit, credited straight to your cash balance.",
      "This profit does not compound: the 1% is always calculated on your principal, not on your accumulated profit, so the calculation stays simple and predictable rather than escalating over time.",
      "Withdrawing part of your deposit reduces the principal that earns future profit accordingly. Referral bonuses are credited to your cash balance but never count toward principal, so they don't themselves earn daily profit.",
      "Daily profit rates are set by GoldTrade and may change or be paused at any time; past profit credits are not a promise of future payouts.",
    ],
  },
  "referral-program": {
    slug: "referral-program",
    title: "Referral Program",
    kicker: "Product",
    paragraphs: [
      "Every member gets a unique referral code and a personal invite link, both available on the Referral page of your dashboard.",
      "When someone signs up using your link and their first deposit is approved, you automatically earn a 5% bonus on that deposit amount, credited straight to your cash balance.",
      "There's no cap on how many people you can refer, and every referral bonus you've earned, along with which member it came from, stays visible on your Referral page.",
    ],
  },
  "security-architecture": {
    slug: "security-architecture",
    title: "Security & Verification",
    kicker: "Product",
    paragraphs: [
      "Passwords are never stored in plain text: GoldTrade hashes every password before it's saved, and every login issues a signed session token rather than storing your credentials in the browser.",
      "Deposits are never credited automatically. Every deposit request is manually checked by our team against the payment receipt you send over WhatsApp before your account is credited, and every withdrawal is manually reviewed before funds are sent.",
      "You can change your password at any time from your account settings, and every deposit, withdrawal, and bonus you've ever received stays visible in your own transaction history.",
    ],
  },
};

export const companyPages: Record<string, FooterPage> = {
  "about-us": {
    slug: "about-us",
    title: "About Us",
    kicker: "Company",
    paragraphs: [
      "GoldTrade is a straightforward gold-linked savings and referral platform, built for everyday investors in Pakistan who want a simple way to deposit, earn daily profit, and refer friends.",
      "We keep the mechanics deliberately simple: deposit through a bank or mobile wallet you already use, get manually verified, and watch your daily profit and referral bonuses build up in one dashboard.",
      "No jargon, no hidden fees, no complicated products, just a transparent record of what you put in, what you've earned, and what you can withdraw.",
    ],
  },
  ethics: {
    slug: "ethics",
    title: "Ethics",
    kicker: "Company",
    paragraphs: [
      "Every deposit and withdrawal is reviewed by a person, not an automated black box, so mistakes can be caught and corrected before money moves.",
      "We do not sell member data, and we do not use financial activity for advertising of any kind, on or off the platform.",
      "Daily profit and referral bonus rates are published clearly in-app and in these pages; if either ever changes, members are able to see the update reflected directly in their transaction history.",
    ],
  },
  careers: {
    slug: "careers",
    title: "Careers",
    kicker: "Company",
    paragraphs: [
      "We're a small, focused team building a straightforward savings and referral platform: engineers and operations staff who care about getting the details of manual verification right.",
      "We hire slowly and rarely. If you'd like to be considered for a future opening, reach out with a short note about what you'd bring.",
      "There are no open roles publicly posted at this time.",
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy",
    kicker: "Company",
    paragraphs: [
      "GoldTrade collects only what's needed to open and service your account: your name, email, phone number, and the bank or wallet account details you provide for deposits and withdrawals.",
      "We do not sell member data to third parties, and we do not use your financial activity for advertising of any kind.",
      "Deposit and withdrawal details you submit are shared only with our internal review team to verify and process your request, never with outside parties, except where required by law.",
    ],
  },
};

export const legalPages: Record<string, FooterPage> = {
  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    kicker: "Legal",
    paragraphs: [
      "By creating a GoldTrade account, you agree to be bound by these Terms of Service.",
      "GoldTrade is a deposit, daily-profit, and referral-bonus platform. Deposits are made by bank transfer or mobile wallet and are credited to your account only after manual verification against the payment receipt you provide. Withdrawals are processed to the bank or wallet account you specify, after manual admin review. Daily profit (currently 1% of your deposited principal per day) and referral bonuses (currently 5% of a referred member's approved deposit) are set by GoldTrade and may be changed, paused, or discontinued at any time without prior notice.",
      "Limitation of Liability (Platform Development): The developer(s) and technology providers who design, build, and maintain the GoldTrade software platform bear no responsibility or liability whatsoever for any act, omission, error, negligence, misconduct, fraud, corruption, unauthorized transaction, manipulation of account data, or any other wrongdoing committed by a GoldTrade administrator, employee, or authorized staff member. This limitation applies without exception, regardless of whether such conduct was negligent, reckless, or intentional, and regardless of the resulting harm. The developer's role is strictly limited to the design, coding, and technical maintenance of the software; all operational, administrative, and financial decisions, including account approvals, deposit approvals, withdrawal approvals, and fund handling, are made exclusively by GoldTrade's administrators, who bear sole and exclusive responsibility for such decisions and their consequences.",
      "By creating an account, you irrevocably waive any claim, demand, or legal action against the developer arising directly or indirectly from administrator conduct of any kind, and you agree to indemnify and hold the developer fully harmless from any resulting loss, damage, cost, or liability, including legal fees.",
      "These terms may be updated from time to time. Material changes will be communicated to members in advance of taking effect.",
    ],
  },
  disclosures: {
    slug: "disclosures",
    title: "Disclosures",
    kicker: "Legal",
    paragraphs: [
      "GoldTrade is a deposit and referral rewards platform. It is not a bank, brokerage, or licensed investment adviser, and nothing on this platform constitutes investment, legal, or tax advice.",
      "Daily profit and referral bonus rates are set by GoldTrade, are not guaranteed, and may be changed, paused, or discontinued at any time. Past profit credits are not a promise of future payouts.",
      "Deposits and withdrawals are manually reviewed and are subject to the account and payment details you provide being accurate and verifiable. Processing times may vary.",
    ],
  },
  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie Policy",
    kicker: "Legal",
    paragraphs: [
      "GoldTrade uses strictly necessary cookies to keep you securely signed in and to remember basic preferences such as theme.",
      "We do not use third-party advertising or tracking cookies. A small number of privacy-preserving analytics cookies may be used to understand aggregate usage of the platform, never at the individual level.",
      "You can control cookie behavior through your browser settings at any time; disabling strictly necessary cookies may prevent you from staying signed in.",
    ],
  },
};
