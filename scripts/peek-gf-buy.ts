/** Dig for video markers on a GF product page. */
const url = process.argv[2] ?? "https://thegadgetflow.com/product/tessan-205w-travel-charger/";
const res = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" },
});
const html = await res.text();
console.log("html length:", html.length);
console.log();

// Video markers to search for
const probes: [string, RegExp][] = [
  ["<video> tag", /<video[^>]*>/gi],
  ["<source> tag", /<source[^>]*>/gi],
  ["YouTube iframe", /<iframe[^>]+(?:youtube\.com|youtu\.be|youtube-nocookie)/gi],
  ["Vimeo iframe", /<iframe[^>]+vimeo\.com/gi],
  [".mp4 url", /https?:\/\/[^\s"'<>]+\.mp4/gi],
  [".webm url", /https?:\/\/[^\s"'<>]+\.webm/gi],
  [".mov url", /https?:\/\/[^\s"'<>]+\.mov/gi],
  ["youtube embed", /youtube\.com\/embed\//gi],
  ["vimeo embed", /vimeo\.com\/(?:video\/|embed\/)?\d+/gi],
  ["video id attr", /data-video-id=["']([^"']+)/gi],
  ["data-youtube", /data-youtube=["']([^"']+)/gi],
  ["wistia", /fast\.wistia\.(?:com|net)/gi],
  ["jwplayer", /jwplayer/gi],
  ["slide type video", /gfl-single-slide-video|swiper-slide.+video/gi],
];
for (const [name, re] of probes) {
  const matches = [...html.matchAll(re)];
  const unique = [...new Set(matches.map((m) => m[0]))];
  if (unique.length > 0) {
    console.log(`${name}: ${unique.length} matches`);
    for (const u of unique.slice(0, 3)) console.log("  " + u.slice(0, 200));
  }
}

// Zoom on the video-slide region
console.log("\n--- 1500 chars around 'gfl-single-slide-video' ---");
const idx = html.indexOf("gfl-single-slide-video");
if (idx >= 0) {
  console.log(html.slice(Math.max(0, idx - 200), idx + 1500));
}
