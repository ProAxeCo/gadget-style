# Drafts Review — 32 products awaiting price + promote

Generated: 2026-05-05

## How to use this

1. For each product below, click the **Amazon URL** to verify it's a real listing.
2. Note the **current price** on Amazon.
3. Edit `scripts/draft-prices.json` (template at end of this doc), pasting your prices in this format:

   ```json
   {
     "271": 19.99,
     "272": 8.50,
     ...
   }
   ```

4. Run: `pnpm tsx scripts/promote-drafts-bulk.ts`
   That script:
   - Sets each product's price from the JSON
   - Removes the `isDraft: true,` line
   - Updates dateAdded to today
   - Runs validator to confirm clean state
5. Commit + push.

## Special cases

- **#127, #132, #153 (GF-era)** — these have placeholder ASINs (`B000000000`) and thin descriptions. They are pre-launch products that don't have real Amazon listings yet. **Recommended: remove from data.ts via `pnpm tsx scripts/remove-products.ts 127 132 153`** unless you have a specific plan to publish them.
- **#277 "Eagle Creek"** — title is just the brand, no product model. Either rename the title in data.ts, or remove.

## The drafts

### #127 — GoPro MISSION 1 PRO Series Cinema Cameras

- **ASIN:** `B000000000` ⚠️ PLACEHOLDER
- **Amazon:** https://www.amazon.com/dp/B000000000?tag=gadgetstyle01-20
- **External URL:** https://gopro.com/en/us/news/gopro-announces-three-cameras-mission-1-2026?clickref=1100lCf3XjuX&utm_source=partnerize&utm_medium=affiliate&utm_campaign=33257X910903X09a989f403abfb28c682a07e1922cb32&clickId=1100lCf3XjuX&utm_content=0&click_country=IN
- **Image:** /images/mirrored/GoPro-Mission-1-Series-01.jpg
- **Description:** 20 chars ⚠️ THIN
- **Tags:** Photographer's Paradise, Action Cameras
- **Current price:** — set price

### #132 — Huawei Pura X Max Foldable Phone

- **ASIN:** `B000000000` ⚠️ PLACEHOLDER
- **Amazon:** https://www.amazon.com/dp/B000000000?tag=gadgetstyle01-20
- **External URL:** https://www.huaweicentral.com/huawei-pura-x-max-foldable-enters-pre-order-mode/#google_vignette
- **Image:** /images/mirrored/Huawei-Pura-X-Max-02.jpg
- **Description:** 20 chars ⚠️ THIN
- **Tags:** Coming Soon
- **Current price:** — set price

### #153 — Amazon Ember Artline 55″ QLED Fire TV

- **ASIN:** `B000000000` ⚠️ PLACEHOLDER
- **Amazon:** https://www.amazon.com/dp/B000000000?tag=gadgetstyle01-20
- **External URL:** https://www.amazon.com/Amazon-Ember-Artline-55-inches-with-Fire-TV/dp/B0G4XJ6TQ3?th=1
- **Image:** /images/mirrored/Amazon-Ember-Artline-01.jpeg
- **Description:** 20 chars ⚠️ THIN
- **Tags:** Amazon Alexa Gadgets
- **Current price:** — set price

### #271 — CREATIVE ART MATERIALS Caran D'ache Ballpoint Pen Metal Fluor Orange (849.030)

- **ASIN:** `B004DW471O`
- **Amazon:** https://www.amazon.com/dp/B004DW471O?tag=gadgetstyle01-20
- **Image:** /images/mirrored/51GPbQMFLIL._AC_SL1200_.jpg
- **Description:** 3370 chars
- **Tags:** Caran d'Ache, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #272 — Field Notes: Expedition 3-Pack Waterproof Notebook with Dot-Graph Paper - 3.5" x 5.5"

- **ASIN:** `B07K4XY6PT`
- **Amazon:** https://www.amazon.com/dp/B07K4XY6PT?tag=gadgetstyle01-20
- **Image:** /images/mirrored/71rK-wvahQL._AC_SL1500_.jpg
- **Description:** 3181 chars
- **Tags:** Field Notes, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #273 — Le Creuset PG90433A-002 Stoneware Mug, Set of 4, 14-Ounce, Flame

- **ASIN:** `B082LJN89H`
- **Amazon:** https://www.amazon.com/dp/B082LJN89H?tag=gadgetstyle01-20
- **Image:** /images/mirrored/61EYvBsQ59L._AC_SL1500_.jpg
- **Description:** 3154 chars
- **Tags:** Le Creuset, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #274 — Le Creuset Enameled Cast Iron Signature Round Dutch Oven, 5.5 qt., Flame

- **ASIN:** `B0076NOHG2`
- **Amazon:** https://www.amazon.com/dp/B0076NOHG2?tag=gadgetstyle01-20
- **Image:** /images/mirrored/51VRmkcdlzL._AC_SL1000_.jpg
- **Description:** 3185 chars
- **Tags:** Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #275 — OXWALLEN Packs Stretchy Bands

- **ASIN:** `B08N5WR4HG`
- **Amazon:** https://www.amazon.com/dp/B08N5WR4HG?tag=gadgetstyle01-20
- **Image:** /images/mirrored/71YYGOi5rmS._AC_SL1500_.jpg
- **Description:** 3066 chars
- **Tags:** OXWALLEN, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #276 — Recycled Firefighter Sergeant Slim Wallet for Men & Women – Minimalist Front Pocket Wallet w/Elastic Money Clip – Card Holder for 4-8 Cards – Travel Essentials Orange/Black

- **ASIN:** `B0C7HK93QS`
- **Amazon:** https://www.amazon.com/dp/B0C7HK93QS?tag=gadgetstyle01-20
- **Image:** /images/mirrored/IMG_5287.jpeg
- **Description:** 3287 chars
- **Tags:** Recycled Firefighter, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #277 — Eagle Creek

- **ASIN:** `B08TZJS4QY`
- **Amazon:** https://www.amazon.com/dp/B08TZJS4QY?tag=gadgetstyle01-20
- **Image:** /images/mirrored/719c49klv_L._AC_SL1200_.jpg
- **Description:** 1144 chars
- **Tags:** Eagle Creek, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #278 — S.O.L. Survive Outdoors Longer Fire Lite Fuel Free Rechargeable Lighter

- **ASIN:** `B08KWQX3LK`
- **Amazon:** https://www.amazon.com/dp/B08KWQX3LK?tag=gadgetstyle01-20
- **Image:** /images/mirrored/81dP8KTn1cL._AC_SL1500_.jpg
- **Description:** 3245 chars
- **Tags:** S.O.L. Survive Outdoors Longer, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #279 — Arborwear Men's Double Thick Pullover Sweatshirt

- **ASIN:** `B00ZIADJSW`
- **Amazon:** https://www.amazon.com/dp/B00ZIADJSW?tag=gadgetstyle01-20
- **Image:** /images/mirrored/61En3RvWYdL._AC_SL1500_.jpg
- **Description:** 3280 chars
- **Tags:** Arborwear, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #280 — Pelican 1150 Camera Case

- **ASIN:** `B00013J89A`
- **Amazon:** https://www.amazon.com/dp/B00013J89A?tag=gadgetstyle01-20
- **Image:** /images/mirrored/81Fq4rZ-ewL._AC_SL1500_.jpg
- **Description:** 3143 chars
- **Tags:** Pelican, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #281 — Pelican Products Inc #1151 Replacement Foam 3 Piece Set for 1150 Protector Case, Grey, 1150-400-000

- **ASIN:** `B0000DYV7B`
- **Amazon:** https://www.amazon.com/dp/B0000DYV7B?tag=gadgetstyle01-20
- **Image:** /images/mirrored/51Wipa5IIuL._AC_SL1200_.jpg
- **Description:** 3198 chars
- **Tags:** Pelican, Orange Vibes — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #282 — Aulumu A16 for iPhone 16 Pro Magnetic Thermal Case | Updated Camera Control | IMD Technology | Compatible with Magsafe | Complete Wrap-Around | Touch Translucent Gray

- **ASIN:** `B0BXH3CK3G`
- **Amazon:** https://www.amazon.com/dp/B0BXH3CK3G?tag=gadgetstyle01-20
- **Image:** /images/mirrored/61OH4vCnSHL._AC_SL1500_.jpg
- **Description:** 3453 chars
- **Tags:** Aulumu, Cyberpunk — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #283 — WC PadZ - The Ultimate Upgraded Earpads by Wicked Cushions - Compatible with Audio Technica, HyperX, SteelSeries Arctis & More - Extra Thick - Bigger Opening - Softer Memory Foam | (Speed Racer)

- **ASIN:** `B08FCTVLT2`
- **Amazon:** https://www.amazon.com/dp/B08FCTVLT2?tag=gadgetstyle01-20
- **Image:** /images/mirrored/91qb6Bth4nL._AC_SL1500_.jpg
- **Description:** 3644 chars
- **Tags:** WC, Cyberpunk — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #284 — TG Plasma Lighter Windproof Waterproof USB Rechargeable Flameless Dual Arc for EDC Camping Survival Tactical

- **ASIN:** `B07SNVZZCF`
- **Amazon:** https://www.amazon.com/dp/B07SNVZZCF?tag=gadgetstyle01-20
- **Image:** /images/mirrored/51doE2w5TQL._AC_SL1001_.jpg
- **Description:** 3200 chars
- **Tags:** TG, Cyberpunk — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #285 — SPIGEN Ultra Hybrid Zero One (MagFit) Case Designed for Apple AirPods Pro 2 (2022) MagSafe Compatible Hook Cover - Zero One

- **ASIN:** `B0BN2SDTS5`
- **Amazon:** https://www.amazon.com/dp/B0BN2SDTS5?tag=gadgetstyle01-20
- **Image:** /images/mirrored/61caHkf5i6L._AC_SL1200_.jpg
- **Description:** 3271 chars
- **Tags:** Spigen, Cyberpunk — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #286 — Arlo (VMC3040-100NAS) Q – Wired, 1080p HD Security Camera | Night Vision, Indoor Only, 2-Way Audio | Cloud Storage Included | Works with Alexa (VMC3040), White

- **ASIN:** `B017B2043W`
- **Amazon:** https://www.amazon.com/dp/B017B2043W?tag=gadgetstyle01-20
- **Image:** /images/mirrored/61i7_0qC23L._AC_SL1350_.jpg
- **Description:** 3058 chars
- **Tags:** Arlo, A Few Great Sales — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #287 — NETGEAR Nighthawk Smart Wi-Fi Router, R6700 - AC1750 Wireless Speed Up to 1750 Mbps | Up to 1500 Sq Ft Coverage & 25 Devices | 4 x 1G Ethernet and 1 x 3.0 USB Ports | Armor Security

- **ASIN:** `B00R2AZLD2`
- **Amazon:** https://www.amazon.com/dp/B00R2AZLD2?tag=gadgetstyle01-20
- **Image:** /images/mirrored/61JBRBWL91L._AC_SL1500_.jpg
- **Description:** 3105 chars
- **Tags:** NETGEAR, A Few Great Sales — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #288 — Refurbished Roku Premiere+ Streaming Player

- **ASIN:** `B06XS33WDQ`
- **Amazon:** https://www.amazon.com/dp/B06XS33WDQ?tag=gadgetstyle01-20
- **Image:** /images/mirrored/51dzwByjK-L._SL1500_.jpg
- **Description:** 3269 chars
- **Tags:** A Few Great Sales — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #289 — uni-ball Jetstream Retractable Ball Point Pens,0.7mm, Black Ink, 3-Count

- **ASIN:** `B002FSZP5A`
- **Amazon:** https://www.amazon.com/dp/B002FSZP5A?tag=gadgetstyle01-20
- **Image:** /images/mirrored/71v7K5RdcnL._AC_SL1500_.jpg
- **Description:** 3142 chars
- **Tags:** Uni-Ball, A Few Great Sales — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #290 — Twelve South HiRise 2 for iPhone/iPad, Black | Adjustable Charging Stand, Requires Apple Lightning Cable (not Included)

- **ASIN:** `B01LD85JIK`
- **Amazon:** https://www.amazon.com/dp/B01LD85JIK?tag=gadgetstyle01-20
- **Image:** /images/mirrored/51xmUnX9MSL._AC_SL1000_.jpg
- **Description:** 3093 chars
- **Tags:** Twelve South, A Few Great Sales — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #291 — Jackery Bolt 6000 mAh Battery

- **ASIN:** `B01A6L85CC`
- **Amazon:** https://www.amazon.com/dp/B01A6L85CC?tag=gadgetstyle01-20
- **Image:** /images/mirrored/81ChuoC13ZL._SL1500_.jpg
- **Description:** 2952 chars
- **Tags:** A Few Great Sales — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #292 — LG C7 65-inch OLED TV

- **ASIN:** `B01NAYM1TP`
- **Amazon:** https://www.amazon.com/dp/B01NAYM1TP?tag=gadgetstyle01-20
- **Image:** /images/mirrored/81ChuoC13ZL._SL1500_.jpg
- **Description:** 2938 chars
- **Tags:** A Few Great Sales — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #293 — LG C7 55-inch OLED TV

- **ASIN:** `B01MZF7WCT`
- **Amazon:** https://www.amazon.com/dp/B01MZF7WCT?tag=gadgetstyle01-20
- **Image:** /images/mirrored/81ChuoC13ZL._SL1500_.jpg
- **Description:** 2771 chars
- **Tags:** A Few Great Sales — Tools and Toys, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #294 — Technivorm Moccamaster 69211 Cup One, One-Cup Coffee Maker 10 Ounce, Off-White

- **ASIN:** `B09XZ4Y1YC`
- **Amazon:** https://www.amazon.com/dp/B09XZ4Y1YC?tag=gadgetstyle01-20
- **Image:** /images/mirrored/61UpPF1zkcL._AC_SL1500_.jpg
- **Description:** 3097 chars
- **Tags:** Father’s Day 2024 Gift Guide — Tools and, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #295 — Bulova Men's Classic Sutton 4-Hand Automatic Watch, 24-Hour Sub Dial, Open Aperture, Self-Winding, Exhibition Caseback, Double Curved Mineral Crystal, Luminous Hands, 42mm

- **ASIN:** `B0C8JMMQ14`
- **Amazon:** https://www.amazon.com/dp/B0C8JMMQ14?tag=gadgetstyle01-20
- **Image:** /images/mirrored/71hjlG9JrAL._AC_SL1500_.jpg
- **Description:** 3427 chars
- **Tags:** Bulova, Father’s Day 2024 Gift Guide — Tools and, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #297 — Best Choice Products Folding Zero Gravity Outdoor Recliner Patio Lounge Chair w/Adjustable Canopy Shade, Headrest, Side Accessory Tray, Textilene Mesh - Beige

- **ASIN:** `B01BEEFOBU`
- **Amazon:** https://www.amazon.com/dp/B01BEEFOBU?tag=gadgetstyle01-20
- **Image:** /images/mirrored/81Txm1HOGkL._AC_SL1500_.jpg
- **Description:** 3196 chars
- **Tags:** Father’s Day 2024 Gift Guide — Tools and, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #298 — novium Hoverpen Interstellar Edition - Futuristic Luxury Pen Made With Aerospace Alloys, Unique Aesthetic, Free Spinning, Birthday Gifts for Men & Women (Mars Magma, Basic)

- **ASIN:** `B09DKZPRBJ`
- **Amazon:** https://www.amazon.com/dp/B09DKZPRBJ?tag=gadgetstyle01-20
- **Image:** /images/mirrored/61bLcyrITDL._AC_SL1500_.jpg
- **Description:** 3451 chars
- **Tags:** novium, Father’s Day 2024 Gift Guide — Tools and, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #299 — All-Clad 59917 Stainless Steel Measuring Cups Cookware Set, 5-Piece, Silver

- **ASIN:** `B0001ACKWU`
- **Amazon:** https://www.amazon.com/dp/B0001ACKWU?tag=gadgetstyle01-20
- **Image:** /images/mirrored/714_WlA6IXL._AC_SL1500_.jpg
- **Description:** 3115 chars
- **Tags:** All-Clad, Father’s Day 2024 Gift Guide — Tools and, Tools & Toys Pick, Price TBD
- **Current price:** — set price

### #300 — Tetris Waffle Maker - Create Deliciously Fun and Geeky Tetrimino Waffles at Home! Makes Waffles in 3-5 Minutes. Tetrimino Shaped Plates. Officially Licensed Tetris Merchandise from Fizz Creations

- **ASIN:** `B0BT54FY4N`
- **Amazon:** https://www.amazon.com/dp/B0BT54FY4N?tag=gadgetstyle01-20
- **Image:** /images/mirrored/51rgXBVoijL._AC_SL1280_.jpg
- **Description:** 3288 chars
- **Tags:** Fizz Creations, Father’s Day 2024 Gift Guide — Tools and, Tools & Toys Pick, Price TBD
- **Current price:** — set price

---

## Template: scripts/draft-prices.json

Replace the values below with the prices you find on Amazon (omit any you want to skip — those will stay as drafts):

```json
{
  "271": 0.00,
  "272": 0.00,
  "273": 0.00,
  "274": 0.00,
  "275": 0.00,
  "276": 0.00,
  "278": 0.00,
  "279": 0.00,
  "280": 0.00,
  "281": 0.00,
  "282": 0.00,
  "283": 0.00,
  "284": 0.00,
  "285": 0.00,
  "286": 0.00,
  "287": 0.00,
  "288": 0.00,
  "289": 0.00,
  "290": 0.00,
  "291": 0.00,
  "292": 0.00,
  "293": 0.00,
  "294": 0.00,
  "295": 0.00,
  "297": 0.00,
  "298": 0.00,
  "299": 0.00,
  "300": 0.00
}
```
