#!/usr/bin/env python3
"""Generate 3 Writer-format DOCX files that pass z_workflow validate:brief archetypes.

1) Finance dashboard examples → dashboard-examples-landing-finance
2) Cloud analytics comparison guide → comparison-guide (required phrases preserved)
3) Client dashboard software → client-dashboard-software-landing
"""

from pathlib import Path

from docx import Document
from docx.shared import Pt

OUT_DIR = Path(r"c:\Users\jegap\Downloads")
BRIEF_DIR = Path(__file__).resolve().parents[1] / "briefs"


def add(doc, text, blank=False):
    doc.add_paragraph(text)
    if blank:
        doc.add_paragraph("")


def new_doc():
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)
    return doc


def save_pair(doc, slug):
    """Save DOCX to Downloads and plain-text brief for local validate:brief."""
    docx_path = OUT_DIR / f"{slug}.docx"
    txt_path = BRIEF_DIR / f"{slug}.txt"
    doc.save(str(docx_path))
    lines = [p.text for p in doc.paragraphs]
    txt_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return docx_path, txt_path


# ---------------------------------------------------------------------------
# 1) Finance dashboard examples (landing format like testing.docx)
# ---------------------------------------------------------------------------
def build_finance_landing():
    doc = new_doc()

    add(doc, "Finance dashboard examples - Landing page")
    add(doc, "Explore 50+ Finance Dashboard Examples & Templates")
    add(
        doc,
        "Browse real-world finance dashboard examples built for CFOs, finance teams, "
        "and controllers. From cash flow tracking to subscription revenue, find a "
        "template that fits your data and get started in minutes.",
    )
    add(doc, "Explore Examples", blank=True)

    add(doc, "Section reference")
    add(doc, "Finance Dashboard Examples by Type")
    add(
        doc,
        "Explore ready-to-use finance dashboard templates for every use case, from "
        "P&L overview to receivables aging. Each type includes multiple examples you "
        "can customize.",
    )

    types = [
        (
            "Finance Overview Dashboard",
            "Get a complete picture of financial health in one screen. Track assets, "
            "liabilities, revenue, and expenses with month-over-month comparisons.",
            [
                "Total assets",
                "Total liabilities",
                "Revenue",
                "Expenses",
                "Accounts receivable",
                "Accounts payable",
            ],
        ),
        (
            "Cash Flow Dashboard",
            "Monitor cash inflows and outflows so leadership never waits on a Friday "
            "spreadsheet to know runway and burn.",
            [
                "Opening cash",
                "Cash in",
                "Cash out",
                "Net cash flow",
                "Burn rate",
                "Projected runway",
            ],
        ),
        (
            "P&L Performance Dashboard",
            "Compare revenue and expense lines across periods. Spot margin pressure "
            "early without exporting from your accounting tool.",
            [
                "Gross revenue",
                "COGS",
                "Gross margin",
                "Operating expenses",
                "Net profit",
                "YoY variance",
            ],
        ),
        (
            "Accounts Receivable Dashboard",
            "Track invoiced revenue, collections, and overdue accounts in one place.",
            [
                "Total AR",
                "Invoices generated",
                "Paid invoices",
                "Overdue balance",
                "Average days to pay",
                "Aging buckets",
            ],
        ),
        (
            "Accounts Payable Dashboard",
            "Monitor vendor bills, outstanding balances, and discount utilization.",
            [
                "Total AP",
                "Bills generated",
                "Outstanding balances",
                "Discount %",
                "Bills by status",
                "Vendor spend trend",
            ],
        ),
        (
            "Subscription Revenue Dashboard",
            "Keep a pulse on MRR, new logos, cancellations, and churn for recurring businesses.",
            [
                "MRR",
                "ARR",
                "New subscriptions",
                "Cancellations",
                "Churn rate",
                "ARPU",
            ],
        ),
        (
            "Budget vs Actual Dashboard",
            "Compare planned budgets to actual spend by cost center and period.",
            [
                "Budget amount",
                "Actual spend",
                "Variance $",
                "Variance %",
                "Top overruns",
                "Forecast vs plan",
            ],
        ),
        (
            "Executive Finance Dashboard",
            "A high-level view for leadership combining revenue, cash, margin, and runway.",
            [
                "Total revenue",
                "Net profit",
                "Cash position",
                "Gross margin",
                "Working capital",
                "Monthly trend",
            ],
        ),
    ]
    for title, desc, kpis in types:
        add(doc, title)
        add(doc, desc)
        add(doc, "Key KPIs")
        for k in kpis:
            add(doc, k)

    add(doc, "")
    add(doc, "Section reference")
    add(doc, "Create these dashboards in one-click")
    add(
        doc,
        "Simply authenticate your finance tools, and Zoho Analytics will automatically "
        "generate a set of professional dashboards with all the essential metrics and KPIs.",
    )
    add(doc, "Build Finance Dashboards Now")
    add(
        doc,
        "★ Takes only a few minutes   ★ Automated data sync   ★ Completely customizable",
        blank=True,
    )

    add(doc, "Section reference")
    add(doc, "Connect popular finance tools you already use")
    add(
        doc,
        "Zoho Analytics integrates with the platforms your finance team relies on every "
        "day. Get these finance dashboards generated prebuilt for you as soon as you "
        "connect your tools.",
    )
    for name, desc in [
        (
            "Zoho Books",
            "Pull Zoho Books accounting data into Zoho Analytics and build finance "
            "dashboards without any manual exports. The integration syncs automatically.",
        ),
        (
            "QuickBooks",
            "Connect QuickBooks to Zoho Analytics and get deeper reporting than native "
            "QuickBooks dashboards allow across P&L, AR, and cash.",
        ),
        (
            "Xero",
            "Bring your Xero data into Zoho Analytics to analyze cash flow, expenses, "
            "and period comparisons in one place.",
        ),
        (
            "Stripe",
            "Sync Stripe payments and subscription data with Zoho Analytics to track "
            "MRR, failures, and revenue trends.",
        ),
        (
            "PayPal",
            "Import PayPal transaction data to monitor collections, refunds, and "
            "payment patterns.",
        ),
        (
            "FreshBooks",
            "Connect FreshBooks invoices and expenses to turn client billing data into "
            "clear finance dashboards.",
        ),
    ]:
        add(doc, "logo")
        add(doc, name)
        add(doc, desc)

    add(doc, "")
    add(doc, "Section reference")
    add(doc, "How to create finance dashboards using Zoho Analytics")
    add(doc, "Connect your data once. Your finance dashboards stay updated automatically.")
    add(doc, "STEP 1")
    add(doc, "Connect your accounting and finance tools")
    add(
        doc,
        "Link Zoho Books, QuickBooks, Xero, Stripe, or any other finance tool you use. "
        "Data syncs automatically, so your dashboards always reflect current numbers.",
    )
    add(doc, "STEP 2")
    add(doc, "Access prebuilt finance dashboards")
    add(
        doc,
        "Get instant access to ready-made dashboards for cash flow, P&L, receivables, "
        "subscriptions, and more. Just connect your data and the dashboards populate "
        "on their own.",
    )
    add(doc, "STEP 3")
    add(doc, "Build custom dashboards your way")
    add(
        doc,
        "Drag and drop charts, KPI widgets, and tables to build dashboards that match "
        "exactly what your finance team tracks. Filter by account, period, or cost "
        "center without writing a single query.",
    )
    add(doc, "STEP 4")
    add(doc, "Share dashboards with your team securely")
    add(
        doc,
        "Share live dashboards with CFOs, controllers, or board members. Control who "
        "can view, edit, or export, so the right people see the right data.",
        blank=True,
    )

    add(doc, "Ready to build your finance dashboard?")
    add(
        doc,
        "Start with a prebuilt template or build from scratch. Connect your accounting "
        "stack, set up your key metrics, and share live dashboards with your team, "
        "all in one place.",
    )
    add(doc, "START FOR FREE", blank=True)

    add(doc, "FAQs")
    for q, a in [
        (
            "What is a finance dashboard?",
            "A finance dashboard is a visual report that pulls accounting and billing "
            "data into one screen. It tracks metrics like revenue, expenses, cash flow, "
            "and receivables in real time.",
        ),
        (
            "What should a finance dashboard include?",
            "At minimum: revenue, expenses, cash position, receivables, and payables. "
            "Many teams also add budget vs actual, margin, and subscription metrics.",
        ),
        (
            "Can I build a finance dashboard without knowing SQL or coding?",
            "Yes. Zoho Analytics lets you connect your finance tools and build "
            "dashboards using drag-and-drop and Ask Zia. You do not need to write queries.",
        ),
        (
            "Can I share my finance dashboard with people outside finance?",
            "Yes. You can share dashboards with specific users via email, embed them in "
            "portals, or schedule report emails. You control permissions for each share.",
        ),
        (
            "Which finance tools can I connect?",
            "Zoho Analytics connects popular finance tools including Zoho Books, "
            "QuickBooks, Xero, Stripe, PayPal, and more under Connect popular finance tools.",
        ),
    ]:
        add(doc, q)
        add(doc, a)

    return save_pair(doc, "writer-test-finance-dashboard-examples")


# ---------------------------------------------------------------------------
# 2) Cloud analytics comparison guide (passes comparison-guide required strings)
#    Different narrative/tool angle from the original sample, same gate phrases.
# ---------------------------------------------------------------------------
def build_cloud_analytics_guide():
    doc = new_doc()

    add(doc, "H1: Cloud Analytics Tools Guide for 2026: Comparison Matrix")
    add(
        doc,
        "Retail ops has overnight POS exports. Finance trusts NetSuite. Marketing lives "
        "in ad platforms. When leadership asks for one weekly truth, three people show "
        "up with three different numbers — and the meeting turns into a reconciliation "
        "exercise instead of a strategy discussion.",
    )
    add(
        doc,
        "Cloud analytics tools fix the versioning problem. They connect live sources, "
        "keep metrics consistent, and let non-technical users build dashboards without "
        "filing IT tickets for every chart. The hard part is choosing a platform that "
        "fits how your team actually works.",
    )
    add(
        doc,
        "Below we've compared the most widely used cloud analytics platforms in 2026 "
        "with a sharper focus on mid-market teams: what each one does well, where each "
        "falls short, and how to pick the right cloud analytics tool without a "
        "six-month evaluation.",
    )
    add(doc, "Key Takeaways")
    add(
        doc,
        "Cloud analytics tools have replaced on-premise BI setups as the default for "
        "most teams. The real differences: deployment options, connector coverage, AI "
        "capabilities, pricing, and how much non-technical users can do alone.",
    )
    add(
        doc,
        "78% of global businesses adopted BI/analytics by 2025. Cloud adoption hit 90% "
        "across enterprises. Cloud-based analytics is now the standard. Source",
    )
    add(
        doc,
        "Cloud platforms fit different use cases. Some are built for visual "
        "storytelling, others for data modeling, a few for embedded or product analytics.",
    )
    add(
        doc,
        "The best fit depends on: data sources, team size, user technical level, and "
        "embedding needs.",
    )
    add(
        doc,
        "Zoho Analytics includes the most at the base price. 500+ connectors, built-in "
        "AI, and embedded analytics from $8/user/month.",
    )
    add(
        doc,
        "Most tools on this list offer a free trial. Testing with your actual data "
        "matters more than reading spec sheets.",
        blank=True,
    )

    add(doc, "Side bar")
    for item in [
        "What is cloud analytics?",
        "Why move analytics to the cloud?",
        "Cloud analytics tools at a glance",
        "Top 5 Cloud Analytics tools in 2026",
        "How to choose the right cloud analytics tool",
        "Key features to look for in a cloud analytics tool",
        "Why Zoho Analytics works for cloud analytics",
        "FAQs",
    ]:
        add(doc, item)
    add(doc, "")

    add(doc, "What is cloud analytics?")
    add(
        doc,
        "Cloud analytics is business intelligence software that runs on remote "
        "infrastructure and is accessed through a browser or app instead of local "
        "servers. It handles integration, processing, storage, and reporting so teams "
        "stop waiting on IT for every refresh.",
    )
    add(doc, "A cloud analytics platform:")
    for x in [
        "Connects to databases, SaaS tools, spreadsheets, and APIs on a schedule.",
        "Lets non-technical users query data with drag-and-drop or natural language.",
        "Detects anomalies and sends alerts without manual chart babysitting.",
        "Shares dashboards securely across teams, clients, or embedded products.",
    ]:
        add(doc, x)
    add(
        doc,
        "In practice: a three-region retail chain stopped reconciling Monday numbers "
        "from three analysts. After moving to a centralized cloud analytics dashboard, "
        "the same store performance report was live by 8am with zero manual joins.",
    )
    add(doc, "Ignore", blank=True)

    add(doc, "Why move analytics to the cloud?")
    add(
        doc,
        "Traditional BI broke when companies stacked 10+ SaaS tools and teams went "
        "remote. Export from Salesforce. Query the warehouse. Format in Excel. The "
        "report is already old when leadership opens it.",
    )
    add(
        doc,
        "Teams on cloud BI make decisions faster with shared live dashboards, cut "
        "routine report requests, and stop arguing about which CSV is correct. Cloud "
        "analytics replaces the export-query-format treadmill with automated insight.",
    )
    add(doc, "CTA")
    add(
        doc,
        "Teams that move to cloud analytics stop rebuilding the same report every "
        "Monday. See what that looks like with your own data",
    )
    add(doc, "Try Zoho Analytics for free today", blank=True)

    add(doc, "Cloud analytics tools at a glance")
    add(
        doc,
        "Tools | Best For | Deployment | Security | From ($/user/mo) | Ideal Size | Built-in ML?",
    )
    for row in [
        "Zoho Analytics | All business sizes | SaaS / On-Prem / Hybrid | RLS, RBAC, SOC2, GDPR, HIPAA | $8 | SMB → Enterprise | Yes – Zia AI",
        "Google Looker | GCP-native enterprises | Pure SaaS | RBAC, SOC2, HIPAA | Custom (~$65+) | Mid-Market → Enterprise | Yes – Vertex AI",
        "Microsoft Fabric | Microsoft-stack orgs | Cloud / Hybrid | RBAC, Purview, SOC2 | $0 (limited) | Enterprise | Yes – Copilot",
        "Domo | Business-user reporting | Pure SaaS | RBAC, SOC2 | Custom | SMB → Mid-Market | Partial",
        "ThoughtSpot | Search-first analytics | SaaS / Cloud | RBAC, SOC2 | Custom | Enterprise | Yes – SpotIQ",
    ]:
        add(doc, row)
    add(doc, "")

    add(doc, "The below are the best 5 cloud analytics tools in 2026")
    add(doc, "1.Zoho Analytics - Best for businesses of all sizes")
    add(doc, "2.Google Looker - Best for GCP-native enterprises")
    add(doc, "3.Microsoft Fabric - Best for Microsoft-stack organizations")
    add(doc, "4.Domo - Best for business-user reporting")
    add(doc, "5.ThoughtSpot - Best for search-first analytics", blank=True)

    add(doc, "Zoho Analytics - Best cloud analytics tool for businesses of all sizes")
    add(
        doc,
        "Zoho Analytics is a full-stack cloud analytics platform covering connection, "
        "preparation, visualization, AI analysis, and embedded analytics. Built for "
        "teams that do not want four vendors for one dashboard.",
    )
    add(doc, "What Zoho Analytics does differently")
    add(
        doc,
        "You get technical depth and a self-service interface without being locked into "
        "the Microsoft or Google ecosystem. Connectors, AI, and white-label embedding "
        "are included without enterprise-only feature walls.",
    )
    add(doc, "Key strengths")
    for x in [
        "500+ native connectors across CRM, ads, finance, DBs, and warehouses",
        "In-built data preparation without a separate ETL tax",
        "AI assistant (Zia) for natural language questions and forecasts",
        "Self-service dashboards for mixed technical and business users",
        "Flexible deployment: cloud, on-premise, or hybrid",
    ]:
        add(doc, x)
    add(doc, "CTA")
    add(
        doc,
        "500+ connectors, built-in AI, self-service BI, and more. Everything in one "
        "plan, no feature gating.",
    )
    add(doc, "View all features and pricing")
    add(doc, "Pros:")
    for x in [
        "Pricing starts at $8/user/month with connectors and AI included",
        "Widest native connector library among tools compared here",
        "Usable by non-technical teammates after short onboarding",
    ]:
        add(doc, x)
    add(doc, "Cons:")
    for x in [
        "Large-enterprise setups may need IT help at kickoff",
        "Depth can feel overwhelming in the first two weeks",
    ]:
        add(doc, x)
    add(doc, "Pricing")
    add(doc, "Plans start at $8/user/month. A 15-day free trial is available. No credit card required.")
    add(doc, "View pricing plans")
    add(doc, "Who should choose Zoho Analytics?")
    add(
        doc,
        "Businesses of all sizes, SaaS companies embedding analytics, and teams that "
        "care about total cost of ownership.",
        blank=True,
    )

    for title, blurb in [
        (
            "Google Looker - Best for GCP-native enterprises",
            "LookML delivers metric consistency on BigQuery. Strong if you are already "
            "committed to Google Cloud; steep for teams outside that stack.",
        ),
        (
            "Microsoft Fabric - Best for Microsoft-stack organizations",
            "Fabric consolidates Power BI, Synapse, and Data Factory. Lowest friction "
            "for Teams/Azure shops; costs and learning curve rise with scale.",
        ),
        (
            "Domo - Best for business-user reporting",
            "Approachable for non-technical reporters with strong mobile access. Weaker "
            "for deep transformation and predictable long-term pricing.",
        ),
        (
            "ThoughtSpot - Best for search-first analytics",
            "Search-like querying and SpotIQ pattern detection shine for enterprises. "
            "Price and services overhead put it out of reach for many SMB teams.",
        ),
    ]:
        add(doc, title)
        add(doc, blurb, blank=True)

    add(doc, "How to choose the right cloud analytics tool for your team")
    add(
        doc,
        "Most teams pick from demos. Your data is messier than the demo. Use this "
        "framework instead.",
    )
    for h, b in [
        (
            "Step 1: Map where your data actually lives",
            "List CRM, ads, finance, databases, and warehouses. Start with connector "
            "coverage, not dashboard screenshots.",
        ),
        (
            "Step 2: Be honest about who will actually use it",
            "Have a non-technical teammate build a basic report during the trial. "
            "Self-service claims fail fast in that test.",
        ),
        (
            "Step 3: Decide whether you need embedded analytics",
            "If SaaS or client portals are on the roadmap, require white-label, "
            "isolation, and APIs from day one.",
        ),
        (
            "Step 4: Calculate the total cost of ownership",
            "Add seats, connectors, AI tiers, services, and engineering time — not "
            "just the published per-user rate.",
        ),
        (
            "Step 5: Run your messiest data through the trial",
            "Connect inconsistent CSVs and duplicate CRM records. The trial reveals "
            "more than any comparison matrix.",
        ),
    ]:
        add(doc, h)
        add(doc, b)
    add(doc, "CTA")
    add(doc, "You've got the framework. Now run it against real data.")
    add(doc, "Zoho Analytics gives you 15 days to test everything for free. No credit card needed.")
    add(doc, "Start testing with your data", blank=True)

    add(doc, "Key features to look for in a cloud analytics tool")
    add(doc, "Feature | What to look for | Why it matters")
    for row in [
        "Data Connectivity | 300+ native connectors minimum | Fewer connectors means more manual exports",
        "Data Preparation | In-built cleaning and joins | Bad data in means bad reports out",
        "Self-Service Analytics | Drag-and-drop and NLP | Reduces analyst bottlenecks",
        "AI/ML Capabilities | Anomaly detection and forecasts | Reporting becomes proactive",
        "Deployment Options | Cloud, on-prem, hybrid | Needed for compliance-heavy industries",
        "Security & Governance | RLS, RBAC, SOC 2, GDPR, HIPAA | Non-negotiable for finance and healthcare",
        "Embedded Analytics | White-label and tenant isolation | Required for SaaS product analytics",
        "Pricing Transparency | All-inclusive base plan | Headline price rarely equals invoice",
    ]:
        add(doc, row)
    add(doc, "")

    add(doc, "Why Zoho Analytics works for cloud analytics?")
    add(
        doc,
        "Most platforms price enterprise features at enterprise rates. Zoho Analytics "
        "aims for enterprise capability at accessible pricing — connectors, Zia AI, and "
        "embedding without opaque upgrade gates.",
    )
    add(
        doc,
        "Start your 15-day free trial and see the pricing yourself. Get full access to "
        "all features. Upgrade anytime at a transparent price. No credit card required.",
    )
    add(doc, "Start free trial", blank=True)

    add(doc, "The complete cloud analytics platform - Zoho Analytics")
    add(
        doc,
        "The cloud analytics space has consolidated. Zoho Analytics consistently wins "
        "where teams care about connector depth, AI access, deployment flexibility, and "
        "pricing clarity at once.",
    )
    add(doc, "CTA")
    add(
        doc,
        "22,000+ businesses already run their analytics on Zoho Analytics. Takes under "
        "a day to get your first dashboard live.",
    )
    add(doc, "Join us - It's free to start", blank=True)

    add(doc, "FAQs")
    for q, a in [
        (
            "What is a cloud-based analytics tool?",
            "Software that connects to your data sources, processes data on remote "
            "infrastructure, and delivers dashboards through a browser with no local install.",
        ),
        (
            "How is cloud analytics different from traditional analytics software?",
            "Traditional BI runs on local servers and needs IT for setup and updates. "
            "Cloud analytics deploys faster, updates automatically, and supports self-service.",
        ),
        (
            "Are cloud analytics tools secure enough for financial or customer data?",
            "Leading platforms carry SOC 2 and ISO certifications plus RBAC and row-level "
            "security. Zoho Analytics also supports on-prem and hybrid deployment.",
        ),
        (
            "Which cloud analytics tools are best for small businesses?",
            "Prioritize cost, setup speed, and connector coverage. Zoho Analytics at "
            "$8/user/month covers the most ground without a dedicated data team.",
        ),
        (
            "Can I embed cloud reports and dashboards in my own application?",
            "Yes. Zoho Analytics, ThoughtSpot, and Looker offer strong embedded options. "
            "Zoho Analytics is typically the most accessible on pricing for white-label embeds.",
        ),
        (
            "Is there a cloud analytics tool with built-in machine learning features?",
            "Yes. Zoho Analytics (Zia) and ThoughtSpot (SpotIQ) are accessible for "
            "non-technical users. Fabric and Looker lean on their cloud ML ecosystems.",
        ),
    ]:
        add(doc, q)
        add(doc, a)

    return save_pair(doc, "writer-test-cloud-analytics-guide")


# ---------------------------------------------------------------------------
# 3) Client dashboard software (agency landing without Dresner)
# ---------------------------------------------------------------------------
def build_client_dashboard_landing():
    doc = new_doc()

    add(doc, "Client dashboard software - Landing page")
    add(doc, "Client dashboard software built for agencies that report to clients")
    add(
        doc,
        "Client dashboard software that makes the monthly report a thing of the past. "
        "Zoho Analytics helps agencies create dashboards with custom branding, so "
        "clients can check their own numbers whenever they want and agencies stop "
        "rebuilding the same report by hand every time for every client.",
    )
    add(doc, "Book a free demo", blank=True)

    add(doc, "Everything an agency needs to run a client's dashboard from one place")
    add(
        doc,
        "You're managing ten clients, each on a different set of platforms, each "
        "expecting a report with their name on it. Zoho Analytics is built for that "
        "load. Connect every client's tools, build their dashboard once, and let the "
        "numbers and the reports take care of themselves.",
    )

    add(doc, "Connect every client's stack")
    add(
        doc,
        "Every client runs a different mix of tools. One lives in Google Ads, another "
        "is all Meta, a third wants Search Console and email in the same view. Zoho "
        "Analytics connects to all of it and pulls the numbers in for you.",
    )
    for x in [
        "✔ Connect 30+ marketing tools including Google Analytics, Google Ads, Search Console, Meta Ads, LinkedIn Ads, Mailchimp, and HubSpot",
        "✔ Blend data across platforms into one cross-channel view no single tool can give you",
        "✔ Data syncs on a schedule you set, so you're not exporting files the night before a review",
    ]:
        add(doc, x)

    add(doc, "Spin up a new client dashboard in minutes")
    add(
        doc,
        "A new client signs up and they want to see marketing analytics from the first "
        "week. Start from a template built around the metrics agencies already track, "
        "then shape it to the account.",
    )
    for x in [
        "✔ 100+ pre-built reports and marketing dashboards across every connected tool",
        "✔ Ready-made templates for campaign performance, channel ROI, paid spend, and audience metrics",
        "✔ Customize any template to match that client's goals and the KPIs they actually care about",
    ]:
        add(doc, x)

    add(doc, "Offer AI-powered insights")
    add(
        doc,
        "Zia answers plain-English questions on top of each client dashboard, summarizes "
        "what changed, and flags anomalies so clients get context without another call.",
    )
    for x in [
        "✔ Ask Zia questions in natural language on live client data",
        "✔ Auto-generated summary narratives on key reports",
        "✔ Anomaly alerts when a KPI moves unexpectedly",
    ]:
        add(doc, x)

    add(doc, "Share branded portals with white-label control")
    add(
        doc,
        "Clients should open a report that looks like your product. Apply your agency "
        "logo, colors, and domain so every portal reinforces your brand.",
    )
    for x in [
        "✔ Apply agency logo, color palette, and custom domain",
        "✔ Keep each client's data isolated with role-based access",
        "✔ Schedule branded report emails on each client's cadence",
    ]:
        add(doc, x)
    add(doc, "")

    add(doc, "Ready to give every client a dashboard they'll actually open?")
    add(
        doc,
        "See how Zoho Analytics pulls all your client data into branded, live "
        "dashboards, automates the monthly report, and hands clients AI that feels "
        "like your own.",
    )
    add(doc, "Book a free demo")
    add(
        doc,
        "★ No commitment required   ★ 30-minute demo   ★ See it working with your data",
        blank=True,
    )

    add(doc, "FAQs")
    for q, a in [
        (
            "What is client dashboard software?",
            "Client dashboard software lets agencies pull marketing data from every "
            "channel into one live, branded dashboard each client can access instead of "
            "waiting for a monthly PDF.",
        ),
        (
            "Can I white-label dashboards with my agency's branding?",
            "Yes. Zoho Analytics lets you apply your agency's logo, colors, and domain "
            "so clients experience reporting as part of your service.",
        ),
        (
            "How many data sources can I connect?",
            "Zoho Analytics connects 500+ data sources, including 30+ marketing tools, "
            "plus databases, warehouses, and spreadsheets.",
        ),
        (
            "Can clients access their own dashboards?",
            "Yes. Each client gets secure, role-based access to a live dashboard showing "
            "only their own data.",
        ),
        (
            "Does it automate client reporting?",
            "Yes. Data syncs on a schedule and branded reports can email on each client's "
            "cadence without rebuilding packs by hand.",
        ),
        (
            "Is Zoho Analytics good for agencies managing many clients?",
            "Yes. Run separate dashboards per client, control access individually, and "
            "reuse templates as your roster grows.",
        ),
    ]:
        add(doc, q)
        add(doc, a)

    return save_pair(doc, "writer-test-client-dashboard-software")


def main():
    paths = [
        build_finance_landing(),
        build_cloud_analytics_guide(),
        build_client_dashboard_landing(),
    ]
    for docx_path, txt_path in paths:
        print(f"OK DOCX: {docx_path}")
        print(f"OK TXT : {txt_path}")


if __name__ == "__main__":
    main()
