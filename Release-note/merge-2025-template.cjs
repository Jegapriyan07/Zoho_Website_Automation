/**
 * Merges 2025 template content from CSV into analytics-new.json
 * Run: node merge-2025-template.js
 */
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../../What\'s New - Template_Sheet1.csv');
const JSON_PATH = path.join(__dirname, 'analytics-new.json');

// Template data from CSV (parsed manually to handle multiline)
const templateByMonth = {
  '12': { // Dec 2025
    title: "What's New - December 2025",
    deskLink: 'https://help.zoho.com/portal/en/community/topic/what%E2%80%99s-new-in-zoho-analytics-%E2%80%93-december-2025',
    intro: "December is a special time of the year to celebrate progress, reflect on what we have achieved, and prepare for what's ahead! As we wrap up the year, this month's updates focus on refining experiences, strengthening analytics workflows, and setting the stage for a smarter start to the new year. Here's what's new this month!",
    updates: [
      'Auto Analysis now supports multiple related tables (Star Schema) for generating reports and dashboards with combined data.',
      'Export, Share, and Schedule actions are now supported with Zoho LLM.',
      'Embedding support for GenAI skills is now available in US, EU, and IN data centers without requiring OpenAI credentials.',
      'Dashboard PDF exports now preserve images, image customizations, and report card opacity.',
      'New integrations added for FreshBooks, Zoho Voice, and Zoho Shifts, along with new Zoho Inventory modules.',
      'Zoho Analytics MCP Server can now be installed via NPM for easier deployment.',
      'Live Connect now supports Databricks (Local & Cloud) and ClickHouse (Local).'
    ]
  },
  '11': { // Nov 2025
    title: "What's New - November 2025",
    deskLink: 'https://help.zoho.com/portal/en/community/topic/whats-new-in-zoho-analytics-november-2025',
    intro: "We're thrilled to announce a significant update focused on expanding your data connectivity, enhancing visualization capabilities, and delivering a more powerful, intuitive, and performant analytics experience. Here's a look at what's new.",
    updates: [
      'New Accessibility settings allow users to customize links, cursor size, font size, color contrast, and keyboard shortcuts for improved usability.',
      'New native connectors added for Qntrl, Asana, and Zoho Community Spaces, along with new modules for Zoho Finance.',
      'Incremental fetch now supports data from other workspaces and custom queries for more efficient data sync.',
      'Zoho Analytics SDK now supports Ruby, and JS API enables programmatic tab switching in embedded dashboards.',
      'Map layering now supports drill-through, unresolved location fixes, dashboard filtering, and improved tooltips.',
      'Drill-through is now supported in Public and Embedded views for deeper report exploration.',
      'Widgets now support tooltips and info icons to display additional metric context.',
      'Enhanced anomaly detection supports dimensional analysis with multiple detection modes.',
      'New Sort across Group option allows sorting the entire pivot table across groups.',
      'Columns can now be frozen to stay visible while scrolling across wide reports.',
      'Define fiscal year start month at the report level for accurate time-based analysis.',
      'Thresholds can now use variables and adjust dynamically based on user filters.',
      'User Filters now show only variables matching the filter datatype to avoid configuration errors.',
      'AutoML now runs on 128GB servers in the US data center for faster training on larger datasets.',
      'Users can customize Zia Insights by selecting metrics, dimensions, and insight types.',
      'Diagnostic insights now support multiple time-series analyses such as anomalies and period comparisons.',
      'Administrative actions in the White Label console are now tracked in Audit Logs.',
      'Zoho Analytics now supports 29 additional international languages and 11 Indian languages, improving accessibility for users worldwide.'
    ]
  },
  '10': { // Oct 2025
    title: "What's New - October 2025",
    deskLink: 'https://help.zoho.com/portal/en/community/topic/whats-new-in-zoho-analytics-october-2025',
    intro: "Hello Users! We're are back with a fresh set of updates and enhancements to make data analysis faster and more insightful. Take a quick look at what's new and see how these updates can power up your reports and dashboards.",
    updates: [
      'Detects outliers in key drivers that significantly impact the target metric, helping identify abnormal spikes, drops, and performance deviations.',
      'Tabular views can now include data from multiple tables linked through lookup columns.',
      'Apply conditional formatting to data bars to dynamically highlight trends, targets, and outliers.',
      'New spatial functions such as ST Distance, ST Buffer, and ST Area enable advanced location-based analysis.',
      'Dashboards can now be exported as CSV files to access and analyze underlying data outside Zoho Analytics.',
      'Import data directly from Azure Managed SQL Instance into Zoho Analytics.',
      'Query Tables are now supported for Google BigQuery Live Connect to enable advanced transformations on live data.'
    ]
  },
  '9': { // Sep 2025
    title: "What's New - September 2025",
    deskLink: 'https://help.zoho.com/portal/en/community/topic/what%e2%80%99s-new-in-zoho-analytics-september-2025',
    intro: "Hello Users!! In this month's update, we're raising the bar across multiple touchpoints, from how you bring in data, plan and track projects to how you design and brand your dashboards.",
    updates: [
      'Track project tasks, monitor progress, and identify delays using customizable Gantt charts.',
      'Cloud Sync Failure Notifications: Configure alerts when a specified number of table imports fail during synchronization.',
      'Private Key and OAuth authentication methods are now supported for Snowflake connections.',
      'Import modern data formats such as Parquet and Avro.',
      'Upload files larger than 100MB for formats like Excel, JSON, XML, HTML, and statistical files via Zoho Databridge.',
      'Users must now accept invitations before gaining access to the organization or shared content.',
      'Adjust brightness, contrast, transparency, and flip options for dashboard background images.',
      'Zoho Analytics now recommends potential lookup relationships based on table metadata.',
      'The latest Zoho Analytics UI is now available for White Label deployments.',
      'A dedicated guide is now available to help configure and manage White Label deployments.',
      'Access log tracking is now supported for the Zoho Analytics Mobile BI app.',
      'Import data from Cassandra, and connect to cloud-hosted SAP HANA and ClickHouse databases for seamless analysis.'
    ]
  },
  '7': { // Jul 2025
    title: "What's New - July 2025",
    deskLink: 'https://help.zoho.com/portal/en/community/topic/announcing-agentic-ai-capabilities-in-ask-zia',
    intro: "We are delighted to roll out the new agentic AI capabilities in Ask Zia, where every stage of the BI workflow is assisted by AI. With a human-in-the-loop approach, Ask Zia ensures that you're in command of the decision, while AI handles the complexity. Upholding our commitment to the motto – Analytics for All, Ask Zia, the AI agent (powered by LLMs), empowers users of different personas, such as data engineers, data analysts, and business users, to build and automate data pipelines and get intelligent recommendations and contextual suggestions through natural language prompts.",
    updates: []
  },
  '6': { // Jun 2025
    title: "What's New - June 2025",
    deskLink: 'https://help.zoho.com/portal/en/community/topic/whats-new-in-zoho-analytics-june-2025',
    intro: "Hello Users, We're delighted to bring you new features and enhancements designed to make your analytics experience smarter and more powerful than ever.",
    updates: [
      'Retrain multiple models at once and bulk delete outdated models for more efficient model management.',
      'Test different scenarios by adjusting input variables to see how predictions change with What if analysis in AutoML.',
      'Premium and Bundle users can now schedule business app data syncs every hour.',
      'Diagnostic Time Series analysis now supports Target vs Previous comparisons.',
      'Conditional formatting in Pivot Tables now offers a unified interface for icons and color bands.',
      'Zoho Analytics Version-2 API now supports JDBC Driver connectivity.',
      'A new UI for the KPI Widget Editor enables faster and easier customization.'
    ]
  },
  '3': { // Mar 2025
    title: "What's New - March 2025",
    deskLink: 'https://help.zoho.com/portal/en/community/topic/whats-new-in-zoho-analytics-march-2025',
    intro: "Hello Users, We're back with the latest set of enhancements and improvements aimed at improving your analytics experience.",
    updates: [
      'Query Tables now support Common Table Expressions (CTE) for writing and managing complex queries more efficiently.',
      'Tables from different schedules can now be moved together to a single common schedule.',
      'You can now specify the dataset location when importing data from Google BigQuery.',
      'Added overlapped display option and improved Pivot Settings pane with real-time updates.',
      'KPI widgets now support associated images and URLs for richer visual context.',
      'Zoho Analytics API collection is now available in Postman for easier API testing and integration.'
    ]
  }
  // Jan 2025 has no content in template - leave existing entry as is
};

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function buildDescription(intro, updates) {
  const introHtml = '<p>' + escapeHtml(intro) + '</p>';
  const listItems = updates.map(u => '<li>' + escapeHtml(u) + '</li>').join('');
  const listHtml = updates.length ? '<ul>' + listItems + '</ul>' : '';
  return introHtml + listHtml;
}

const json = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const year2025 = json.release_notes[0].yearLists.find(y => y.yearName === '2025');
if (!year2025) {
  console.error('2025 year not found');
  process.exit(1);
}

for (const month of year2025.monthLists) {
  const t = templateByMonth[month.monthNo];
  if (!t) continue; // Jan 2025 - no template, skip
  const detail = month.DetailsList[0];
  if (!detail) continue;
  detail.Title = t.title;
  detail.Description = buildDescription(t.intro, t.updates);
  detail.read_moreTxt = 'Read more';
  detail.Readmore_link = t.deskLink;
}

fs.writeFileSync(JSON_PATH, JSON.stringify(json, null, 2), 'utf8');
console.log('Updated 2025 template in analytics-new.json');
