import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const dataFile = join(projectRoot, "data", "menu-week.json");
const imageDirectory = join(projectRoot, "images", "dishes");
const userAgent = "uzh-map-menu-updater/2.0 (https://github.com/eeeease/uzh_map)";

const venues = [
  {id:"eth-arch", school:"ETH", campus:"Zentrum", name:"Archimedes", facilityId:8, services:["lunch"]},
  {id:"eth-clausius", school:"ETH", campus:"Zentrum", name:"Clausiusbar", facilityId:3, services:["lunch"]},
  {id:"eth-doz", school:"ETH", campus:"Zentrum", name:"Dozentenfoyer", facilityId:5, services:["lunch"]},
  {id:"eth-foodlab", school:"ETH", campus:"Zentrum", name:"food&lab", facilityId:7, services:["lunch"]},
  {id:"eth-poly", school:"ETH", campus:"Zentrum", name:"Mensa Polyterrasse", facilityId:9, services:["lunch","dinner"]},
  {id:"eth-polysnack", school:"ETH", campus:"Zentrum", name:"Polysnack", facilityId:10, services:["lunch"]},
  {id:"eth-tannen", school:"ETH", campus:"Zentrum", name:"Tannenbar", facilityId:11, services:["lunch"]},
  {id:"eth-alumni", school:"ETH", campus:"Hönggerberg", name:"Alumni quattro Lounge", facilityId:14, services:["lunch","dinner"]},
  {id:"eth-mendo", school:"ETH", campus:"Hönggerberg", name:"Mendokoro", facilityId:16, services:["lunch"]},
  {id:"eth-foodmarket", school:"ETH", campus:"Hönggerberg", name:"food market", facilityId:19, services:["lunch"]},
  {id:"eth-fusion", school:"ETH", campus:"Hönggerberg", name:"FUSION meal", facilityId:20, services:["lunch"]},
  {id:"eth-riceup", school:"ETH", campus:"Hönggerberg", name:"Rice Up!", facilityId:22, services:["lunch"]},
  {id:"eth-octavo", school:"ETH", campus:"Oerlikon", name:"Octavo", facilityId:23, services:["lunch"]}
];

const uzhMenus = [
  {id:"uzh-lower", campus:"Zentrum", name:"Untere Mensa", service:"lunch", path:"universitat-zurich,campus-zentrum/untere-mensa/mittagsverpflegung/menu/weekly"},
  {id:"uzh-lower", campus:"Zentrum", name:"Untere Mensa", service:"dinner", path:"universitat-zurich,campus-zentrum/untere-mensa/abendverpflegung/menu/weekly"},
  {id:"uzh-upper", campus:"Zentrum", name:"Obere Mensa", service:"lunch", path:"universitat-zurich,campus-zentrum/obere-mensa/mittagsverpflegung/menu/weekly"},
  {id:"uzh-lichthof", campus:"Zentrum", name:"Lichthof", service:"lunch", path:"universitat-zurich,campus-zentrum/lichthof/mittagsverpflegung/menu/weekly"},
  {id:"uzh-raemi59", campus:"Zentrum", name:"Rämi59", service:"lunch", path:"universitat-zurich,rami-59/rami-59/mittagsverpflegung/menu/weekly"},
  {id:"uzh-platte14", campus:"Zentrum", name:"Platte 14", service:"lunch", path:"universitat-zurich,platte-14/platte-14/mittagsverpflegung/menu/weekly"},
  {id:"uzh-zzm", campus:"Zentrum", name:"ZZM Mensa", service:"lunch", path:"universitat-zurich,zentrum-fur-zahnmedizin/zzm/mittagsverpflegung/menu/weekly"},
  {id:"uzh-irchel", campus:"Irchel", name:"Mensa Irchel", service:"lunch", path:"universitat-zurich,campus-irchel/mensa/mittagsverpflegung/menu/weekly"},
  {id:"uzh-green", campus:"Irchel", name:"Green Kitchen Lab", service:"lunch", path:"universitat-zurich,campus-irchel/green-kitchen-lab/mittagsverpflegung/menu/weekly"},
  {id:"uzh-seerose", campus:"Irchel", name:"Seerose", service:"lunch", path:"universitat-zurich,campus-irchel/seerose/mittag/menu/weekly"},
  {id:"uzh-seerose", campus:"Irchel", name:"Seerose", service:"dinner", path:"universitat-zurich,campus-irchel/seerose/abend/menu/weekly"},
  {id:"uzh-binz", campus:"Oerlikon", name:"Mensa Binzmühle", service:"lunch", path:"universitat-zurich,campus-oerlikon/mensa-binzmuhle/mittagsverpflegung/menu/weekly"},
  {id:"uzh-cityport", campus:"Oerlikon", name:"Cityport", service:"lunch", path:"universitat-zurich,cityport/cityport/mittagsverpflegung/menu/weekly"},
  {id:"uzh-tierspital", campus:"Irchel", name:"Tierspital", service:"lunch", path:"universitat-zurich,tierspital-1/tierspital/mittagsverpflegung/menu/weekly"},
  {id:"uzh-bot", campus:"Botanischer Garten", name:"Botanischer Garten", service:"lunch", path:"universitat-zurich,botanischer-garten/botanischer-garten/mittagsverpflegung/menu/weekly"}
];

const categoryRules = [
  ["rice", /\b(rice|reis\w*|risotto|biryani|paella|basmati|jasmine|jasmin\w*)\b/i],
  ["noodles", /\b(noodle|noodles|\w*nudeln?|ramen|udon|pho|pad thai|pancit|mah meh)\b/i],
  ["pasta", /\b(pasta|spaghetti|penne|rigatoni|fusilli|macaroni|maccaroni|maggronen|gnocchi|tortellini|tagliatelle|ravioli|hörnli)\b/i],
  ["potato", /\b(potato|potatoes|\w*kartoffel\w*|rösti|wedges|pommes|fries)\b/i],
  ["bread", /\b(bread|brot|bun|focaccia|naan|flatbread|fladenbrot|paratha|baguette)\b/i],
  ["chicken", /\b(chicken|poulet|huhn|hähnchen|turkey|truthahn|tori)\b/i],
  ["beef", /\b(beef|veal|rind|kalb|brisket|meatball|meatballs|köfte|hackfleisch|bolognaise|bolognese|goulash|gulasch)\b/i],
  ["pork", /\b(pork|schwein\w*|bacon|speck|ham|\w*schinken\w*|prosciutto|sausage|\w*wurst\w*|cordon.?bleu|schnitzel)\b/i],
  ["fish", /\b(fish|salmon|lachs\w*|cod|dorsch|kabeljau|tuna|thunfisch|forelle|trout)\b/i],
  ["seafood", /\b(seafood|shrimp|shrimps|prawn|prawns|crevette|garnele|garnelen|mussel|mussels)\b/i],
  ["egg", /\b(egg|eggs|ei|eier|omelette|omelet)\b/i],
  ["tofu", /\b(tofu|seitan|planted|soya (?:mince|protein|chunks|strips)|soy (?:mince|protein|chunks|strips)|soja(?:hack|geschnetzel|protein|stück|streifen)\w*)\b/i],
  ["curry", /\b(curry|rendang|tikka|vindaloo|dal|daal|dhal|korma|masala|casimir|gaeng|palak paneer)\b/i],
  ["soup", /\b(soup|suppe|bouillon|consomm[eé])\b/i],
  ["salad", /\b(salad|salat|coleslaw)\b/i],
  ["burger", /\b(burger|hamburger|sandwich)\b/i],
  ["pizza", /\b(pizza|flammkuchen)\b/i],
  ["dumpling", /\b(dumpling|dumplings|knödel|mandu|gyoza|momo)\b/i],
  ["dessert", /\b(dessert|cake|kuchen|mousse|tiramisu|pudding|brownie|flan|chiacotta|panna cotta|raspberry cream|mascarpone cream)\b/i],
  ["vegetarian", /\b(vegetarian|vegetarisch|veggie|vegi|plant.?based|pflanzenhack)\b/i],
  ["vegan", /\b(vegan|plant.?based|pflanzenhack)\b/i]
];

const categoryQueries = {
  rice:{query:"cooked rice bowl food", required:["rice"]},
  noodles:{query:"noodle bowl food", required:["noodle","ramen"]},
  pasta:{query:"pasta dish plate", required:["pasta","spaghetti","penne","fusilli","gnocchi"]},
  potato:{query:"potato dish plate", required:["potato"]},
  bread:{query:"bread basket food", required:["bread"]},
  chicken:{query:"chicken dish plate", required:["chicken"]},
  beef:{query:"beef dish plate", required:["beef"]},
  pork:{query:"pork dish plate", required:["pork"]},
  fish:{query:"fish fillet dish", required:["fish"]},
  seafood:{query:"shrimp seafood dish", required:["shrimp","seafood","prawn"]},
  egg:{query:"egg dish plate", required:["egg"]},
  tofu:{query:"vegan tofu dish", required:["tofu"]},
  curry:{query:"curry dish rice", required:["curry"]},
  soup:{query:"vegetable soup bowl", required:["soup"]},
  salad:{query:"mixed salad bowl", required:["salad"]},
  burger:{query:"hamburger food plate", required:["burger","hamburger"]},
  pizza:{query:"pizza margherita", required:["pizza"]},
  dumpling:{query:"dumplings food plate", required:["dumpling","dumplings"]},
  dessert:{query:"dessert plate", required:["dessert","cake","pudding","mousse"]},
  vegetarian:{query:"vegetable meal plate", required:["vegetable","vegetarian"]},
  vegan:{query:"vegan meal plate", required:["vegan"]}
};
const imagePriority = ["pizza","burger","dumpling","soup","dessert","curry","noodles","pasta","fish","seafood","chicken","beef","pork","tofu","rice","potato","bread","salad","egg","vegetarian","vegan"];
const reviewedImageFallbacks = {vegetarian:"vegan", seafood:"fish"};
const badImageWords = /\b(hotel|restaurant|building|sign|logo|map|menu|street|store|shop|diagram|raw|uncooked)\b/i;
const visionReviewedTitles = new Set([
  "Pasta plate II - Flickr - rhodes.jpg", "Vegan meal (2).jpg",
  "Pure Indian dish containing Tandoori Rooti, rice, vegetables curry and others.jpg",
  "Pesto crusted chicken with corn dish.jpg", "Tofu curry with rice.jpg",
  "Faro de Fuencaliente, La Palma, pork dish and red wine.jpg", "Dumplings on a blue plate.jpg",
  "Thai beef dish at Yim Thai Yeronga, Queensland.jpg",
  "Liat Portal for Foodie Disorder - Mixed vegetable salad with fresh herbs.jpg",
  "Ceramic bowl full of white rice.jpg", "Noodle soups in Asia Bowl 2025-07-26.jpg",
  "Pizza-napoletana.jpg", "Piece of chocolate cake on a white plate decorated with chocolate sauce.jpg",
  "Hamburger on a plate.jpg", "Lunch dish (pumpkin sauce, potatoes and chicken steak).jpg",
  "Traditional Vegetable Soup from Argentina.jpg", "Bread basket.jpg",
  "Fried egg surrounded by French fries on a white plate.jpg", "Fishcake on salad.jpg"
]);

function isoDateInZurich(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {timeZone:"Europe/Zurich", year:"numeric", month:"2-digit", day:"2-digit"}).format(date);
}
function addDays(iso, days) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
function mondayOf(iso) {
  const date = new Date(`${iso}T12:00:00Z`);
  return addDays(iso, 1 - (date.getUTCDay() || 7));
}
function decodeHtml(value = "") {
  return String(value)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}
function stripHtml(value = "") {
  return decodeHtml(String(value).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}
function isPlaceholder(value) {
  return ["", "novalue", "-", "none", "n/a"].includes(String(value ?? "").trim().toLowerCase());
}
async function fetchWithRetry(url, options = {}, attempts = 4) {
  let response;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    response = await fetch(url, options);
    if (response.status !== 429 && response.status < 500) return response;
    if (attempt === attempts - 1) return response;
    const retryAfter = Number(response.headers.get("retry-after"));
    await new Promise(resolve => setTimeout(resolve, Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (2 ** attempt)));
  }
  return response;
}
async function fetchJson(url) {
  const response = await fetchWithRetry(url, {headers:{"user-agent":userAgent, accept:"application/json"}});
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}
async function fetchText(url) {
  const response = await fetchWithRetry(url, {headers:{"user-agent":userAgent, accept:"text/html"}});
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}
function classifyDish(name, description, vegetarian = false, vegan = false) {
  const haystack = `${name || ""} ${description || ""}`;
  let categories = categoryRules.filter(([, pattern]) => pattern.test(haystack)).map(([id]) => id);
  const inferredVegan = vegan || categories.includes("vegan");
  if (inferredVegan) categories = categories.filter(category => !["chicken","beef","pork","fish","seafood"].includes(category));
  if (vegetarian && !categories.includes("vegetarian")) categories.push("vegetarian");
  if (vegan && !categories.includes("vegan")) categories.push("vegan");
  if (inferredVegan && !categories.includes("vegetarian")) categories.push("vegetarian");
  return categories;
}

function rotaMeals(root, venue, date, service) {
  const wantedDay = new Date(`${date}T12:00:00Z`).getUTCDay() || 7;
  const targetPattern = service === "dinner" ? /(dinner|abend|cena)/i : /(lunch|mittag|pranzo)/i;
  const result = [];
  for (const rota of root?.["weekly-rota-array"] || []) {
    if (Number(rota["facility-id"]) !== Number(venue.facilityId)) continue;
    if (rota["valid-from"] && date < rota["valid-from"]) continue;
    if (rota["valid-to"] && date > rota["valid-to"]) continue;
    for (const day of rota["day-of-week-array"] || []) {
      if (Number(day["day-of-week-code"]) !== wantedDay) continue;
      for (const opening of day["opening-hour-array"] || []) for (const mealTime of opening["meal-time-array"] || []) {
        if (!targetPattern.test(mealTime.name || "")) continue;
        for (const line of mealTime["line-array"] || []) {
          const meal = line.meal;
          const name = String(meal?.name || "").replace(/\s+/g, " ").trim();
          if (!meal || isPlaceholder(name)) continue;
          result.push({
            line:String(line.name || "").trim(), name,
            description:isPlaceholder(meal.description) ? "" : String(meal.description).replace(/\s+/g, " ").trim(),
            prices:(meal["meal-price-array"] || []).filter(x => x.price != null && !isPlaceholder(x.price)).map(x => ({price:Number(x.price), group:x["customer-group-desc-short"] || x["customer-group-desc"] || ""})),
            vegetarian:(meal["meal-class-array"] || []).some(x => /vegetari/i.test(x.desc || "")),
            vegan:(meal["meal-class-array"] || []).some(x => /vegan/i.test(x.desc || ""))
          });
        }
      }
    }
  }
  const seen = new Set();
  return result.filter(item => {
    const key = `${item.line}|${item.name}|${item.prices.map(x => x.price).join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

async function fetchEthWeek(weekStart) {
  const endpoint = lang => `https://idapps.ethz.ch/cookpit-pub-services/v1/weeklyrotas?client-id=ethz-wcms&lang=${lang}&rs-first=0&rs-size=150&valid-after=${weekStart}`;
  const [english, german] = await Promise.all([fetchJson(endpoint("en")), fetchJson(endpoint("de"))]);
  const dishes = [];
  for (let offset = 0; offset < 5; offset += 1) {
    const date = addDays(weekStart, offset);
    for (const venue of venues) for (const service of venue.services) {
      const enMeals = rotaMeals(english, venue, date, service);
      const deMeals = rotaMeals(german, venue, date, service);
      enMeals.forEach((meal, index) => {
        const de = deMeals.find(candidate => candidate.line === meal.line) || deMeals[index] || meal;
        dishes.push({
          date, restaurantId:venue.id, restaurantName:venue.name, school:venue.school, campus:venue.campus,
          service, line:meal.line, name:{en:meal.name, de:de.name || meal.name},
          description:{en:meal.description, de:de.description || meal.description}, prices:meal.prices,
          vegetarian:meal.vegetarian, vegan:meal.vegan,
          categories:classifyDish(`${meal.name} ${de.name || ""}`, `${meal.description} ${de.description || ""}`, meal.vegetarian, meal.vegan),
          sourceUrl:`https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/menueplaene/offerWeek.html?date=${weekStart}&id=${venue.facilityId}`
        });
      });
    }
  }
  return dishes;
}

function parseUzhWeek(html, weekStart, weekEnd) {
  const output = [];
  const pattern = /<a\b[^>]*href=["']([^"']*\/(\d{4}-\d{2}-\d{2}))["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const [, href, date, body] = match;
    if (date < weekStart || date > weekEnd) continue;
    const name = stripHtml(body.match(/<span\b[^>]*DishName__Name[^>]*>([\s\S]*?)<\/span>/i)?.[1] || "");
    if (!name) continue;
    const description = stripHtml(body.match(/<span\b[^>]*DishName__Description[^>]*>([\s\S]*?)<\/span>/i)?.[1] || "");
    const beforeDate = href.replace(/\/?\d{4}-\d{2}-\d{2}.*$/, "");
    const line = decodeURIComponent(beforeDate.split("/").pop() || "FOOD2050").split(",").pop().replace(/-/g, " ");
    output.push({date, line, name, description, vegetarian:/isVegetarian/i.test(body), vegan:/isVegan/i.test(body)});
  }
  const seen = new Set();
  return output.filter(x => {
    const key = `${x.date}|${x.line}|${x.name}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

async function fetchUzhWeek(weekStart, weekEnd) {
  const output = [];
  for (const menu of uzhMenus) {
    const url = lang => `https://app.food2050.ch/${lang}/zfv/${menu.path}`;
    const [enHtml, deHtml] = await Promise.all([fetchText(url("en")), fetchText(url("de"))]);
    const english = parseUzhWeek(enHtml, weekStart, weekEnd);
    const german = parseUzhWeek(deHtml, weekStart, weekEnd);
    const germanByKey = new Map(german.map(x => [`${x.date}|${x.line}`, x]));
    english.forEach(item => {
      const de = germanByKey.get(`${item.date}|${item.line}`) || item;
      const vegetarian = item.vegetarian || de.vegetarian;
      const vegan = item.vegan || de.vegan;
      output.push({
        date:item.date, restaurantId:menu.id, restaurantName:menu.name, school:"UZH", campus:menu.campus,
        service:menu.service, line:item.line, name:{en:item.name, de:de.name || item.name},
        description:{en:item.description, de:de.description || item.description}, prices:[], vegetarian, vegan,
        categories:classifyDish(`${item.name} ${de.name || ""}`, `${item.description} ${de.description || ""}`, vegetarian, vegan),
        sourceUrl:url("en")
      });
    });
  }
  return output;
}

function words(value) {
  return String(value || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(x => x.length > 2);
}
async function findCommonsImage(config) {
  const params = new URLSearchParams({
    action:"query", format:"json", origin:"*", generator:"search", gsrsearch:config.query,
    gsrnamespace:"6", gsrlimit:"15", prop:"imageinfo|info", inprop:"url",
    iiprop:"url|mime|extmetadata", iiurlwidth:"640"
  });
  const data = await fetchJson(`https://commons.wikimedia.org/w/api.php?${params}`);
  const pages = Object.values(data.query?.pages || {}).sort((a,b) => (a.index || 99) - (b.index || 99));
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    const title = String(page.title || "").replace(/^File:/, "");
    if (!info?.thumburl || !/^image\/(jpeg|png|webp)$/i.test(info.mime || "") || badImageWords.test(title)) continue;
    if (!visionReviewedTitles.has(title)) continue;
    const titleWords = words(title);
    if (!config.required.some(term => titleWords.includes(term) || title.toLowerCase().includes(term))) continue;
    const meta = info.extmetadata || {};
    const license = stripHtml(meta.LicenseShortName?.value || "");
    if (!license) continue;
    return {
      downloadUrl:info.thumburl, mime:info.mime, title,
      author:stripHtml(meta.Artist?.value || meta.Credit?.value || "Wikimedia Commons"), license,
      licenseUrl:meta.LicenseUrl?.value || "https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia",
      sourceUrl:page.canonicalurl || info.descriptionurl
    };
  }
  return null;
}
function extensionFor(mime, url) {
  if (/png/i.test(mime)) return ".png";
  if (/webp/i.test(mime)) return ".webp";
  const extension = extname(new URL(url).pathname).toLowerCase();
  return [".jpg",".jpeg",".png",".webp"].includes(extension) ? extension : ".jpg";
}
function primaryImageCategory(dish) {
  return imagePriority.find(category => dish.categories.includes(category)) || null;
}

async function attachImages(dishes) {
  await mkdir(imageDirectory, {recursive:true});
  const primaryNeeded = [...new Set(dishes.map(primaryImageCategory).filter(Boolean))];
  const needed = [...new Set([...primaryNeeded, ...primaryNeeded.map(category => reviewedImageFallbacks[category]).filter(Boolean)])];
  const imageByCategory = new Map();
  let previous = null;
  try { previous = JSON.parse(await readFile(dataFile, "utf8")); } catch (_) {}
  for (const dish of Object.values(previous?.days || {}).flat()) {
    const image = dish.image;
    if (!image?.path || image.matchType !== "category" || image.validation !== "vision-reviewed") continue;
    if (!needed.includes(image.category) || imageByCategory.has(image.category)) continue;
    try {
      await readFile(join(projectRoot, image.path));
      imageByCategory.set(image.category, image);
    } catch (_) {}
  }
  for (const category of needed) {
    if (imageByCategory.has(category)) continue;
    const found = await findCommonsImage(categoryQueries[category]);
    if (!found) continue;
    const extension = extensionFor(found.mime, found.downloadUrl);
    const filename = `${category}-${createHash("sha1").update(found.sourceUrl || found.downloadUrl).digest("hex").slice(0,8)}${extension}`;
    const response = await fetchWithRetry(found.downloadUrl, {headers:{"user-agent":userAgent}});
    if (!response.ok) throw new Error(`image HTTP ${response.status}: ${found.downloadUrl}`);
    await writeFile(join(imageDirectory, filename), Buffer.from(await response.arrayBuffer()));
    imageByCategory.set(category, {
      path:`images/dishes/${filename}`, category, title:found.title, author:found.author, license:found.license,
      licenseUrl:found.licenseUrl, sourceUrl:found.sourceUrl, matchType:"category",
      validation:visionReviewedTitles.has(found.title) ? "vision-reviewed" : "metadata-strict"
    });
  }
  for (const category of needed) {
    if (imageByCategory.has(category)) continue;
    const fallback = imageByCategory.get(reviewedImageFallbacks[category]);
    if (fallback) imageByCategory.set(category, {...fallback, category});
  }
  dishes.forEach(dish => {
    const category = primaryImageCategory(dish);
    dish.image = category && imageByCategory.has(category) ? {...imageByCategory.get(category)} : null;
  });
  const used = new Set(dishes.map(dish => dish.image?.path?.split("/").pop()).filter(Boolean));
  for (const filename of await readdir(imageDirectory)) if (!used.has(filename)) await unlink(join(imageDirectory, filename));
}

function validatePayload(payload) {
  const dates = Object.keys(payload.days);
  if (dates.length !== 5 || dates[0] !== payload.weekStart || dates[4] !== payload.weekEnd) throw new Error("Expected five ordered workdays");
  const dishes = Object.values(payload.days).flat();
  const schools = new Set(dishes.map(dish => dish.school));
  if (!schools.has("ETH") || !schools.has("UZH")) throw new Error("Both ETH and UZH data are required");
  if (dishes.filter(x => x.school === "ETH").length < 40) throw new Error("ETH weekly data is unexpectedly small");
  if (dishes.filter(x => x.school === "UZH").length < 20) throw new Error("UZH weekly data is unexpectedly small");
  const fakeNames = /^(garden|butcher|farm|one|two|ying|yang|global|traditional|voll anders|hit)$/i;
  for (const dish of dishes) {
    if (!dish.date || !dish.restaurantId || !dish.name?.en || fakeNames.test(dish.name.en.trim())) throw new Error(`Invalid dish: ${JSON.stringify(dish)}`);
    if (!Array.isArray(dish.categories)) throw new Error(`Missing categories: ${dish.name.en}`);
    if (dish.image && (!dish.image.path || !dish.image.sourceUrl || !dish.image.license || !dish.image.matchType || !dish.image.validation)) throw new Error(`Invalid image metadata: ${dish.name.en}`);
  }
}

async function main() {
  const today = process.env.MENU_REFERENCE_DATE || isoDateInZurich();
  const weekStart = process.env.MENU_WEEK_START || mondayOf(today);
  const weekEnd = addDays(weekStart, 4);
  await mkdir(join(projectRoot, "data"), {recursive:true});
  const [ethDishes, uzhDishes] = await Promise.all([fetchEthWeek(weekStart), fetchUzhWeek(weekStart, weekEnd)]);
  const dishes = [...ethDishes, ...uzhDishes].sort((a,b) => a.date.localeCompare(b.date) || a.school.localeCompare(b.school) || a.restaurantName.localeCompare(b.restaurantName) || a.service.localeCompare(b.service) || a.name.en.localeCompare(b.name.en));
  await attachImages(dishes);
  const days = Object.fromEntries(Array.from({length:5}, (_, i) => [addDays(weekStart, i), []]));
  dishes.forEach(dish => days[dish.date]?.push(dish));
  const payload = {
    generatedAt:new Date().toISOString(), weekStart, weekEnd, timeZone:"Europe/Zurich",
    sources:[
      {name:"ETH Cookpit", url:"https://idapps.ethz.ch/cookpit-pub-services/"},
      {name:"UZH FOOD2050", url:"https://app.food2050.ch/"},
      {name:"Wikimedia Commons", url:"https://commons.wikimedia.org/"}
    ],
    days
  };
  validatePayload(payload);
  await writeFile(dataFile, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${dishes.length} dishes (${dishes.filter(x => x.image).length} with safe images) for ${weekStart}..${weekEnd}`);
}

await main();
