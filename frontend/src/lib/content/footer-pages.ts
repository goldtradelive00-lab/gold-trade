export interface FooterPageSection {
  heading: string;
  paragraphs: string[];
}

export interface FooterPage {
  slug: string;
  title: string;
  kicker: string;
  intro?: string[];
  sections: FooterPageSection[];
}

export const howItWorksPage: FooterPage = {
  slug: "how-it-works",
  title: "How GoldTrade Works",
  kicker: "Platform",
  intro: [
    "From opening an account to watching your first daily profit land, here is exactly what happens at each step, including how to read your dashboard once you're in.",
  ],
  sections: [
    {
      heading: "1. Open an Account",
      paragraphs: [
        "Sign up with your name, email, and phone number. You'll receive a verification email, click the link to confirm your address, and your account is ready to use.",
      ],
    },
    {
      heading: "2. Make a Deposit",
      paragraphs: [
        "From your dashboard, submit a deposit request and send the funds using any major Pakistani bank, JazzCash, Easypaisa, NayaPay, or SadaPay. Confirm your payment receipt over WhatsApp so our team can match it to your request.",
        "Our team manually verifies every receipt before crediting an account, which typically takes up to 24 hours. Once approved, the amount is added to both your cash balance and your principal balance.",
      ],
    },
    {
      heading: "3. Read Your Dashboard",
      paragraphs: [
        "Your dashboard shows two numbers: cash balance, the amount you can withdraw right now, and principal balance, the deposited amount that earns your daily profit. A live Pakistan gold rate chart sits above them, and a running transaction list below shows every deposit, withdrawal, referral bonus, and profit credit as it happens.",
        "Nothing on the dashboard is delayed or hidden: what you see is what you can withdraw, subject to admin review on pending requests.",
      ],
    },
    {
      heading: "4. Earn Daily Profit",
      paragraphs: [
        "Once your deposit is approved, your principal balance starts earning a flat 1% profit every day, credited straight to your cash balance. The 1% is always calculated on your principal, not your accumulated profit, so it stays simple and predictable rather than compounding.",
      ],
    },
    {
      heading: "5. Refer & Earn 5%",
      paragraphs: [
        "Share your personal referral link or code from the Referral page. When someone signs up through it and their deposit is approved, you automatically earn a 5% bonus on that deposit, credited to your cash balance, with no extra step required.",
      ],
    },
    {
      heading: "6. Withdraw Anytime",
      paragraphs: [
        "Submit a withdrawal request for any amount up to your cash balance, along with the bank or wallet account you want it sent to. Once an admin reviews and approves it, funds are on their way; if a request is rejected, the amount simply stays in your account with no change.",
      ],
    },
  ],
};

export const productPages: Record<string, FooterPage> = {
  dashboard: {
    slug: "dashboard",
    title: "Dashboard",
    kicker: "Product",
    intro: [
      "Your GoldTrade dashboard shows exactly where your money stands: your cash balance, your deposited principal, and the live Pakistan gold rate, all in one screen.",
    ],
    sections: [
      {
        heading: "What You'll See",
        paragraphs: [
          "The top of your dashboard shows two numbers: your cash balance (what you can withdraw right now) and your principal balance (the deposited amount that earns your daily 1% profit). Below that is a live chart of the Pakistan gold rate, refreshed automatically throughout the day.",
          "Underneath, a running list of recent transactions shows every deposit, withdrawal, referral bonus, and daily profit credit as it happens, each with a date, description, and amount, so you never have to guess what changed your balance.",
        ],
      },
      {
        heading: "How Balances Update",
        paragraphs: [
          "A deposit only appears in your cash balance after our team manually verifies your payment receipt and approves the request; it typically takes up to 24 hours. Once approved, the deposit amount is added to both your cash balance and your principal.",
          "A withdrawal request temporarily shows as pending and does not leave your cash balance until an admin approves it. If a request is rejected, the amount simply stays in your account with no change.",
          "Daily profit is credited automatically once a day to every account with a positive principal balance. If it's ever missed because of scheduled maintenance, it's caught up the next time the platform starts.",
        ],
      },
      {
        heading: "No Hidden Positions",
        paragraphs: [
          "There are no hidden positions or delayed updates: what you see on the dashboard is what you can withdraw, subject to admin review. GoldTrade does not hold funds in any product, instrument, or position you can't see directly on this screen.",
        ],
      },
    ],
  },
  "daily-profit": {
    slug: "daily-profit",
    title: "Daily Profit",
    kicker: "Product",
    intro: [
      "Once a deposit is approved, its amount becomes part of your principal balance, the base that earns your daily profit. Every day, your principal earns a flat 1% profit, credited straight to your cash balance.",
    ],
    sections: [
      {
        heading: "How the 1% Is Calculated",
        paragraphs: [
          "This profit does not compound: the 1% is always calculated on your principal, not on your accumulated profit, so the calculation stays simple and predictable rather than escalating over time.",
          "For example, if your principal balance is Rs 100,000, you earn Rs 1,000 in profit that day, credited to your cash balance. The next day, the calculation still starts from the Rs 100,000 principal, not Rs 101,000, so your daily profit stays flat unless you deposit more or withdraw part of your principal.",
        ],
      },
      {
        heading: "What Counts as Principal",
        paragraphs: [
          "Approved deposits are the only thing that increases your principal balance. Withdrawing part of your deposit reduces the principal that earns future profit accordingly.",
          "Referral bonuses are credited to your cash balance but never count toward principal, so they don't themselves earn daily profit. The same is true of profit you've already earned: once credited to cash, it doesn't get added back into the principal calculation, which is what keeps the growth linear instead of compounding.",
        ],
      },
      {
        heading: "When Profit Is Credited",
        paragraphs: [
          "Daily profit runs once every 24 hours across every account with a positive principal balance, and each account is only credited once per calendar day, even if the process runs more than once.",
        ],
      },
      {
        heading: "Limits & Changes",
        paragraphs: [
          "Daily profit rates are set by GoldTrade and may change or be paused at any time; past profit credits are not a promise of future payouts. Any rate change is reflected immediately in your transaction history, so there's never a gap between what's advertised and what's actually credited to your account.",
        ],
      },
    ],
  },
  "referral-program": {
    slug: "referral-program",
    title: "Referral Program",
    kicker: "Product",
    intro: [
      "Every member gets a unique referral code and a personal invite link, both available on the Referral page of your dashboard.",
    ],
    sections: [
      {
        heading: "How to Share",
        paragraphs: [
          "Your referral link and code are generated automatically when you join and never expire. Share either one with a friend or family member; when they sign up through your link, they're permanently linked to your account as the person who referred them.",
        ],
      },
      {
        heading: "How Commissions Are Calculated",
        paragraphs: [
          "When someone signs up using your link and their first deposit is approved, you automatically earn a 5% bonus on that deposit amount, credited straight to your cash balance. For example, if the person you referred deposits Rs 20,000 and it's approved, you receive Rs 1,000 the moment that approval happens, with no extra step on your end.",
          "This 5% applies to every approved deposit the referred member makes, not just their first one, for as long as they remain a member and continue depositing.",
        ],
      },
      {
        heading: "Tracking Your Referrals",
        paragraphs: [
          "There's no cap on how many people you can refer, and every referral bonus you've earned, along with which member it came from, stays visible on your Referral page. You can see the full list of people you've referred, when they joined, and a running total of what you've earned from each one.",
        ],
      },
    ],
  },
  "security-architecture": {
    slug: "security-architecture",
    title: "Security & Verification",
    kicker: "Product",
    intro: [
      "Passwords are never stored in plain text: GoldTrade hashes every password before it's saved, and every login issues a signed session token rather than storing your credentials in the browser.",
    ],
    sections: [
      {
        heading: "Account Security",
        paragraphs: [
          "Every login is protected by a short-lived access token paired with a separate, longer-lived refresh token; the access token expires quickly on its own, so a leaked token is only useful for a few minutes rather than days or weeks.",
          "Logging out, changing your password, or resetting a forgotten password all immediately invalidate your active sessions, so a device you've logged out of can't silently keep working in the background.",
        ],
      },
      {
        heading: "Manual Verification",
        paragraphs: [
          "Deposits are never credited automatically. Every deposit request is manually checked by our team against the payment receipt you send over WhatsApp before your account is credited, and every withdrawal is manually reviewed before funds are sent.",
          "This manual step is deliberate: it means a mistaken or fraudulent transaction has a real person checking it before money moves, rather than relying entirely on an automated system that can't catch context an automated check would miss.",
        ],
      },
      {
        heading: "Your Controls",
        paragraphs: [
          "You can change your password at any time from your account settings, and every deposit, withdrawal, and bonus you've ever received stays visible in your own transaction history, so you always have a complete, self-serve record without needing to ask support for it.",
        ],
      },
    ],
  },
};

export const companyPages: Record<string, FooterPage> = {
  "about-us": {
    slug: "about-us",
    title: "About Us",
    kicker: "Company",
    intro: [
      "GoldTrade is a straightforward gold-linked savings and referral platform, built for everyday investors in Pakistan who want a simple way to deposit, earn daily profit, and refer friends.",
    ],
    sections: [
      {
        heading: "Our Approach",
        paragraphs: [
          "We keep the mechanics deliberately simple: deposit through a bank or mobile wallet you already use, get manually verified, and watch your daily profit and referral bonuses build up in one dashboard.",
          "No jargon, no hidden fees, no complicated products, just a transparent record of what you put in, what you've earned, and what you can withdraw.",
        ],
      },
      {
        heading: "Who We Serve",
        paragraphs: [
          "GoldTrade was built for people who want a savings option that's easy to understand without needing a background in finance or investing. We priced our fees, rates, and processes to be readable in one sitting, and we intend to keep it that way as the platform grows.",
        ],
      },
    ],
  },
  ethics: {
    slug: "ethics",
    title: "Ethics",
    kicker: "Company",
    intro: [
      "Every deposit and withdrawal is reviewed by a person, not an automated black box, so mistakes can be caught and corrected before money moves.",
    ],
    sections: [
      {
        heading: "Manual Review, Always",
        paragraphs: [
          "We chose manual review over full automation because it gives a real person the chance to catch a fraudulent transaction, a typo in an account number, or a suspicious pattern before funds ever move, rather than after the fact.",
        ],
      },
      {
        heading: "Data & Privacy Commitments",
        paragraphs: [
          "We do not sell member data, and we do not use financial activity for advertising of any kind, on or off the platform. The information you give us to open and service your account is used for exactly that purpose and nothing else.",
        ],
      },
      {
        heading: "Transparent Rates",
        paragraphs: [
          "Daily profit and referral bonus rates are published clearly in-app and in these pages; if either ever changes, members are able to see the update reflected directly in their transaction history, rather than discovering it only when a smaller credit shows up unexplained.",
        ],
      },
    ],
  },
  careers: {
    slug: "careers",
    title: "Careers",
    kicker: "Company",
    intro: [
      "We're a small, focused team building a straightforward savings and referral platform: engineers and operations staff who care about getting the details of manual verification right.",
    ],
    sections: [
      {
        heading: "How We Work",
        paragraphs: [
          "Our team is intentionally small. Everyone who works on GoldTrade touches the parts of the product that matter most to members: the accuracy of the ledger, the speed of manual review, and making sure the dashboard always reflects what's actually true about an account.",
        ],
      },
      {
        heading: "Get In Touch",
        paragraphs: [
          "We hire slowly and rarely. If you'd like to be considered for a future opening, reach out with a short note about what you'd bring.",
          "There are no open roles publicly posted at this time.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy",
    kicker: "Company",
    intro: [
      "GoldTrade collects only what's needed to open and service your account: your name, email, phone number, and the bank or wallet account details you provide for deposits and withdrawals.",
    ],
    sections: [
      {
        heading: "What We Collect",
        paragraphs: [
          "When you open an account, we collect your full name, email address, and phone number. When you submit a deposit or withdrawal request, we collect the bank or mobile wallet name, account title, and account number or IBAN needed to process it, along with the WhatsApp number you use to send your payment receipt.",
        ],
      },
      {
        heading: "How We Use It",
        paragraphs: [
          "Your contact details are used to verify your identity, send account-related emails such as verification and password reset links, and, if needed, reach you about a deposit or withdrawal request. Your bank or wallet details are used solely to process the specific deposit or withdrawal you submitted them for.",
        ],
      },
      {
        heading: "Who We Share It With",
        paragraphs: [
          "We do not sell member data to third parties, and we do not use your financial activity for advertising of any kind.",
          "Deposit and withdrawal details you submit are shared only with our internal review team to verify and process your request, never with outside parties, except where required by law.",
        ],
      },
      {
        heading: "Your Choices",
        paragraphs: [
          "You can update your name at any time from your account settings. Your email address is fixed to your account and can't be changed directly; contact a super admin if you need it updated. You can request the closure of your account at any time by contacting support.",
        ],
      },
    ],
  },
};

export const legalPages: Record<string, FooterPage> = {
  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    kicker: "Legal",
    intro: [
      "By creating a GoldTrade account, you agree to be bound by these Terms of Service.",
    ],
    sections: [
      {
        heading: "The Platform",
        paragraphs: [
          "GoldTrade is a deposit, daily-profit, and referral-bonus platform. Deposits are made by bank transfer or mobile wallet and are credited to your account only after manual verification against the payment receipt you provide. Withdrawals are processed to the bank or wallet account you specify, after manual admin review. Daily profit (currently 1% of your deposited principal per day) and referral bonuses (currently 5% of a referred member's approved deposit) are set by GoldTrade and may be changed, paused, or discontinued at any time without prior notice.",
        ],
      },
      {
        heading: "Eligibility & Account Responsibilities",
        paragraphs: [
          "You must provide accurate and complete information when opening your account and when submitting any deposit or withdrawal request. You are responsible for keeping your password confidential and for all activity that occurs under your account once you've logged in.",
          "Account and payment details you provide, including bank or wallet account numbers, must belong to you or be authorized for your use. GoldTrade may decline, delay, or reverse a deposit or withdrawal request if the details provided cannot be verified.",
        ],
      },
      {
        heading: "Prohibited Use",
        paragraphs: [
          "You may not use GoldTrade for any unlawful purpose, to submit fraudulent payment receipts or account details, or to attempt to interfere with the platform's normal operation. GoldTrade reserves the right to suspend or close an account where such conduct is reasonably suspected.",
        ],
      },
      {
        heading: "Limitation of Liability (Platform Development)",
        paragraphs: [
          "The developer(s) and technology providers who design, build, and maintain the GoldTrade software platform bear no responsibility or liability whatsoever for any act, omission, error, negligence, misconduct, fraud, corruption, unauthorized transaction, manipulation of account data, or any other wrongdoing committed by a GoldTrade administrator, employee, or authorized staff member. This limitation applies without exception, regardless of whether such conduct was negligent, reckless, or intentional, and regardless of the resulting harm. The developer's role is strictly limited to the design, coding, and technical maintenance of the software; all operational, administrative, and financial decisions, including account approvals, deposit approvals, withdrawal approvals, and fund handling, are made exclusively by GoldTrade's administrators, who bear sole and exclusive responsibility for such decisions and their consequences.",
        ],
      },
      {
        heading: "Waiver & Indemnity",
        paragraphs: [
          "By creating an account, you irrevocably waive any claim, demand, or legal action against the developer arising directly or indirectly from administrator conduct of any kind, and you agree to indemnify and hold the developer fully harmless from any resulting loss, damage, cost, or liability, including legal fees.",
        ],
      },
      {
        heading: "Termination",
        paragraphs: [
          "You may stop using GoldTrade at any time by contacting support to close your account. GoldTrade may suspend or terminate an account for suspected fraud, a violation of these terms, or where required by law, and will make reasonable efforts to settle any verified balance owed to you upon closure.",
        ],
      },
      {
        heading: "Changes to These Terms",
        paragraphs: [
          "These terms may be updated from time to time. Material changes will be communicated to members in advance of taking effect.",
        ],
      },
    ],
  },
  disclosures: {
    slug: "disclosures",
    title: "Disclosures",
    kicker: "Legal",
    intro: [
      "GoldTrade is a deposit and referral rewards platform. It is not a bank, brokerage, or licensed investment adviser, and nothing on this platform constitutes investment, legal, or tax advice.",
    ],
    sections: [
      {
        heading: "No Investment Advice",
        paragraphs: [
          "Nothing displayed on GoldTrade, including gold rate information, daily profit figures, or referral bonus totals, should be interpreted as a recommendation to deposit, withdraw, or otherwise manage your finances in any particular way. You should make your own decisions about whether GoldTrade fits your personal financial situation.",
        ],
      },
      {
        heading: "Rates Are Not Guaranteed",
        paragraphs: [
          "Daily profit and referral bonus rates are set by GoldTrade, are not guaranteed, and may be changed, paused, or discontinued at any time. Past profit credits are not a promise of future payouts.",
        ],
      },
      {
        heading: "Processing & Verification",
        paragraphs: [
          "Deposits and withdrawals are manually reviewed and are subject to the account and payment details you provide being accurate and verifiable. Processing times may vary depending on request volume and the completeness of the information submitted.",
        ],
      },
      {
        heading: "Regulatory Status",
        paragraphs: [
          "GoldTrade is not a licensed bank, brokerage, deposit-taking institution, or investment adviser in any jurisdiction. Use of the platform does not create a banking or fiduciary relationship between you and GoldTrade.",
        ],
      },
    ],
  },
  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie Policy",
    kicker: "Legal",
    intro: [
      "GoldTrade uses strictly necessary cookies to keep you securely signed in and to remember basic preferences such as theme.",
    ],
    sections: [
      {
        heading: "Types of Cookies We Use",
        paragraphs: [
          "Strictly necessary cookies keep your session active while you're signed in and are required for the platform to function; without them, you would be logged out on every page load.",
          "We do not use third-party advertising or tracking cookies. A small number of privacy-preserving analytics cookies may be used to understand aggregate usage of the platform, never at the individual level.",
        ],
      },
      {
        heading: "Managing Cookies",
        paragraphs: [
          "You can control cookie behavior through your browser settings at any time; disabling strictly necessary cookies may prevent you from staying signed in. Most browsers let you clear cookies for a single site without affecting others, which is the simplest way to reset your GoldTrade session if you ever need to.",
        ],
      },
    ],
  },
};
