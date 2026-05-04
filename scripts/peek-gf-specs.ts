/** Quick: dump raw HTML around the specs section of a GF product page. */
const url = process.argv[2] ?? "https://thegadgetflow.com/product/amazon-echo-show-8-4th-generation-2025/specs/";
const res = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; GadgetStyleScraper/1.0)" },
});
const html = await res.text();

// Find the product-tag region — look for breadcrumbs and tag containers
const probes = [
  /<nav[^>]*breadcrumb[\s\S]{0,2000}<\/nav>/i,
  /<div[^>]*breadcrumb[\s\S]{0,2000}<\/div>/i,
  /class="[^"]*tag[s]?[^"]*"[\s\S]{0,2000}/i,
  /class="[^"]*meta[^"]*"[\s\S]{0,2000}/i,
];
for (const p of probes) {
  const m = html.match(p);
  if (m) {
    console.log(`--- match for ${p.source.slice(0, 50)} ---`);
    console.log(m[0].slice(0, 1500));
    console.log("---\n");
  }
}
