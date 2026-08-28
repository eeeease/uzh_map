import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const dataFile = join(projectRoot, "data", "menu-week.json");
const imageDirectory = join(projectRoot, "images", "dishes");
const userAgent = "uzh-map-menu-updater/1.0 (https://github.com/eeeease/uzh_map)";

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
  {id:"uzh-lower", campus:"Zentrum", name:"Untere Mensa", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,campus-zentrum/untere-mensa/mittagsverpflegung/menu/daily"},
  {id:"uzh-lower", campus:"Zentrum", name:"Untere Mensa", service:"dinner", url:"https://app.food2050.ch/en/zfv/universitat-zurich,campus-zentrum/untere-mensa/abend/menu/daily"},
  {id:"uzh-upper", campus:"Zentrum", name:"Obere Mensa", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,campus-zentrum/obere-mensa/mittagsverpflegung/menu/daily"},
  {id:"uzh-lichthof", campus:"Zentrum", name:"Lichthof", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,campus-zentrum/lichthof/mittagsverpflegung/menu/daily"},
  {id:"uzh-raemi59", campus:"Zentrum", name:"Rämi59", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,rami-59/rami-59/mittagsverpflegung/menu/daily"},
  {id:"uzh-platte14", campus:"Zentrum", name:"Platte 14", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,platte-14/platte-14/mittagsverpflegung/menu/daily"},
  {id:"uzh-zzm", campus:"Zentrum", name:"ZZM Mensa", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,zentrum-fur-zahnmedizin/zzm/mittagsverpflegung/menu/daily"},
  {id:"uzh-irchel", campus:"Irchel", name:"Mensa Irchel", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,campus-irchel/mensa/mittagsverpflegung/menu/daily"},
  {id:"uzh-green", campus:"Irchel", name:"Green Kitchen Lab", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,campus-irchel/green-kitchen-lab/mittagsverpflegung/menu/daily"},
  {id:"uzh-seerose", campus:"Irchel", name:"Seerose", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,campus-irchel/seerose/mittag/menu/daily"},
  {id:"uzh-seerose", campus:"Irchel", name:"Seerose", service:"dinner", url:"https://app.food2050.ch/en/zfv/universitat-zurich,campus-irchel/seerose/abend/menu/daily"},
  {id:"uzh-binz", campus:"Oerlikon", name:"Mensa Binzmühle", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,campus-oerlikon/mensa-binzmuhle/mittagsverpflegung/menu/daily"},
  {id:"uzh-cityport", campus:"Oerlikon", name:"Cityport", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,cityport/cityport/mittagsverpflegung/menu/daily"},
  {id:"uzh-tierspital", campus:"Irchel", name:"Tierspital", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,tierspital-1/tierspital/mittagsverpflegung/menu/daily"},
  {id:"uzh-bot", campus:"Botanischer Garten", name:"Botanischer Garten", service:"lunch", url:"https://app.food2050.ch/en/zfv/universitat-zurich,botanischer-garten/botanischer-garten/mittagsverpflegung/menu/daily"}
];

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
  const day = date.getUTCDay() || 7;
  return addDays(iso, 1 - day);
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function isPlaceholder(value) {
  return ["", "novalue", "-", "none", "n/a"].includes(String(value ?? "").trim().toLowerCase());
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

async function fetchWithRetry(url, options = {}, attempts = 4) {
  let response;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    response = await fetch(url, options);
    if (response.status !== 429 && response.status < 500) return response;
    if (attempt === attempts - 1) return response;
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (2 ** attempt);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return response;
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
      for (const opening of day["opening-hour-array"] || []) {
        for (const mealTime of opening["meal-time-array"] || []) {
          if (!targetPattern.test(mealTime.name || "")) continue;
          for (const line of mealTime["line-array"] || []) {
            const meal = line.meal;
            const name = String(meal?.name || "").replace(/\s+/g, " ").trim();
            if (!meal || isPlaceholder(name)) continue;
            result.push({
              line:String(line.name || "").trim(),
              name,
              description:isPlaceholder(meal.description) ? "" : String(meal.description).replace(/\s+/g, " ").trim(),
              prices:(meal["meal-price-array"] || []).filter(item => item.price != null && !isPlaceholder(item.price)).map(item => ({
                price:Number(item.price),
                group:item["customer-group-desc-short"] || item["customer-group-desc"] || ""
              })),
              vegetarian:(meal["meal-class-array"] || []).some(item => /vegetari/i.test(item.desc || "")),
              vegan:(meal["meal-class-array"] || []).some(item => /vegan/i.test(item.desc || ""))
            });
          }
        }
      }
    }
  }
  const seen = new Set();
  return result.filter(item => {
    const key = `${item.line}|${item.name}|${item.prices.map(price => price.price).join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchEthWeek(weekStart) {
  const endpoint = language => `https://idapps.ethz.ch/cookpit-pub-services/v1/weeklyrotas?client-id=ethz-wcms&lang=${language}&rs-first=0&rs-size=150&valid-after=${weekStart}`;
  const [english, german] = await Promise.all([fetchJson(endpoint("en")), fetchJson(endpoint("de"))]);
  const dishes = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(weekStart, offset);
    for (const venue of venues) {
      for (const service of venue.services) {
        const enMeals = rotaMeals(english, venue, date, service);
        const deMeals = rotaMeals(german, venue, date, service);
        enMeals.forEach((meal, index) => {
          const de = deMeals[index] || meal;
          dishes.push({
            date,
            restaurantId:venue.id,
            restaurantName:venue.name,
            school:venue.school,
            campus:venue.campus,
            service,
            line:meal.line,
            name:{zh:meal.name, en:meal.name, de:de.name || meal.name},
            description:{zh:meal.description, en:meal.description, de:de.description || meal.description},
            prices:meal.prices,
            vegetarian:meal.vegetarian,
            vegan:meal.vegan,
            sourceUrl:`https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/menueplaene/offerWeek.html?date=${weekStart}&id=${venue.facilityId}`
          });
        });
      }
    }
  }
  return dishes;
}

async function fetchUzhToday(weekStart, weekEnd) {
  const output = [];
  await Promise.all(uzhMenus.map(async menu => {
    try {
      const html = await fetchText(menu.url);
      const date = html.match(/dateLocal\\?"?:\\?"(\d{4}-\d{2}-\d{2})/)?.[1] || isoDateInZurich();
      if (date < weekStart || date > weekEnd) return;
      const labels = [...html.matchAll(/dailyMenu__ItemLabel[^>]*>([^<]+)<\/p>/g)].map(match => stripHtml(match[1])).filter(Boolean);
      [...new Set(labels)].forEach(label => output.push({
        date,
        restaurantId:menu.id,
        restaurantName:menu.name,
        school:"UZH",
        campus:menu.campus,
        service:menu.service,
        line:"FOOD2050",
        name:{zh:label, en:label, de:label},
        description:{zh:"", en:"", de:""},
        prices:[],
        vegetarian:false,
        vegan:false,
        sourceUrl:menu.url
      }));
    } catch (error) {
      console.warn(`UZH menu skipped: ${menu.name} ${menu.service}: ${error.message}`);
    }
  }));
  return output;
}

function imageSearchPhrase(dish) {
  const raw = dish.name.en || dish.name.de || dish.restaurantName;
  const useful = raw.replace(/\b(classic|special|menu|meal|daily|homemade|with|and|und|mit)\b/gi, " ").replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim();
  if (!useful || /^(one|two|three|garden|green|daily)$/i.test(useful)) return `${dish.restaurantName} meal food`;
  return `${useful} food dish`;
}

async function findCommonsImage(dish) {
  const query = new URLSearchParams({
    action:"query",
    format:"json",
    origin:"*",
    generator:"search",
    gsrsearch:imageSearchPhrase(dish),
    gsrnamespace:"6",
    gsrlimit:"8",
    prop:"imageinfo|info",
    inprop:"url",
    iiprop:"url|mime|extmetadata",
    iiurlwidth:"480"
  });
  const data = await fetchJson(`https://commons.wikimedia.org/w/api.php?${query}`);
  const pages = Object.values(data.query?.pages || {}).sort((a, b) => (a.index || 99) - (b.index || 99));
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || !/^image\/(jpeg|png|webp)$/i.test(info.mime || "")) continue;
    const meta = info.extmetadata || {};
    const license = stripHtml(meta.LicenseShortName?.value || "");
    if (!license) continue;
    return {
      downloadUrl:info.thumburl,
      mime:info.mime,
      title:String(page.title || "").replace(/^File:/, ""),
      author:stripHtml(meta.Artist?.value || meta.Credit?.value || "Wikimedia Commons"),
      license,
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
  return [".jpg", ".jpeg", ".png", ".webp"].includes(extension) ? extension : ".jpg";
}

function imageCategory(name) {
  const value = String(name || "").toLowerCase();
  if (/(dessert|cake|mousse|cream|sweet|tiramisu|pudding)/.test(value)) return "dessert";
  if (/(pizza|focaccia)/.test(value)) return "pizza";
  if (/(burger|sandwich|cevapcici)/.test(value)) return "burger";
  if (/(ramen|noodle|pad thai|udon|pho)/.test(value)) return "noodles";
  if (/(pasta|spaghetti|penne|rigatoni|fusilli|macaroni|cappellacci|gnocchi)/.test(value)) return "pasta";
  if (/(soup|suppe|bouillon)/.test(value)) return "soup";
  if (/(curry|rendang|tikka|vindaloo|dal|thakali|korma)/.test(value)) return "curry";
  if (/(rice|bowl|risotto|paella|biryani)/.test(value)) return "rice";
  if (/(chicken|poulet|huhn|turkey|tori)/.test(value)) return "chicken";
  if (/(beef|veal|rind|brisket|meatball|goulash|bulgogi)/.test(value)) return "beef";
  if (/(pork|schwein|bacon|ham|prosciutto|sausage)/.test(value)) return "pork";
  if (/(fish|salmon|lachs|cod|kabeljau|tuna|shrimp|seafood)/.test(value)) return "fish";
  if (/(tofu|vegetable|vegan|vegetarian|salad|broccoli|zucchini|falafel)/.test(value)) return "vegetarian";
  if (/(dumpling|mandu|gyoza)/.test(value)) return "dumplings";
  return "generic";
}

const categoryQueries = {
  generic:"prepared meal plate",
  dessert:"dessert plate",
  pizza:"pizza margherita",
  burger:"cheeseburger",
  noodles:"noodle bowl",
  pasta:"pasta dish",
  soup:"vegetable soup bowl",
  curry:"curry dish",
  rice:"rice bowl meal",
  chicken:"chicken dish",
  beef:"beef dish",
  pork:"pork dish",
  fish:"fish fillet dish",
  vegetarian:"vegetarian meal plate",
  dumplings:"dumplings dish"
};

async function readPreviousImages() {
  try {
    const previous = JSON.parse(await readFile(dataFile, "utf8"));
    const map = new Map();
    Object.values(previous.days || {}).flat().forEach(dish => {
      if (dish.image?.path) map.set(dish.image.category || imageCategory(dish.name?.en || dish.name), dish.image);
    });
    return map;
  } catch (_) {
    return new Map();
  }
}

async function attachImages(dishes) {
  await mkdir(imageDirectory, {recursive:true});
  const imageByCategory = await readPreviousImages();
  const categories = ["generic", ...new Set(dishes.map(dish => imageCategory(dish.name.en || dish.name.de)))];
  const concurrency = Math.max(1, Math.min(3, Number(process.env.MENU_IMAGE_CONCURRENCY || 2)));
  let cursor = 0;
  async function worker() {
    while (cursor < categories.length) {
      const category = categories[cursor++];
      const old = imageByCategory.get(category);
      if (old?.path) {
        try {
          await readFile(join(projectRoot, old.path));
          continue;
        } catch (_) {}
      }
      try {
        const prototype = {name:{en:categoryQueries[category] || categoryQueries.generic}, restaurantName:"university mensa"};
        const found = await findCommonsImage(prototype);
        if (!found) continue;
        const extension = extensionFor(found.mime, found.downloadUrl);
        const filename = `${category}-${createHash("sha1").update(found.sourceUrl || found.downloadUrl).digest("hex").slice(0, 8)}${extension}`;
        const response = await fetchWithRetry(found.downloadUrl, {headers:{"user-agent":userAgent}});
        if (!response.ok) throw new Error(`image HTTP ${response.status}`);
        await writeFile(join(imageDirectory, filename), Buffer.from(await response.arrayBuffer()));
        imageByCategory.set(category, {
          path:`images/dishes/${filename}`,
          category,
          title:found.title,
          author:found.author,
          license:found.license,
          licenseUrl:found.licenseUrl,
          sourceUrl:found.sourceUrl
        });
      } catch (error) {
        console.warn(`Image category skipped: ${category}: ${error.message}`);
      }
    }
  }
  await Promise.all(Array.from({length:concurrency}, () => worker()));
  const generic = imageByCategory.get("generic") || [...imageByCategory.values()][0] || null;
  dishes.forEach(dish => {
    const category = imageCategory(dish.name.en || dish.name.de);
    const selected = imageByCategory.get(category) || generic;
    dish.image = selected ? {...selected, category:selected.category || (imageByCategory.has(category) ? category : "generic")} : null;
  });
  const used = new Set(dishes.map(dish => dish.image?.path?.split("/").pop()).filter(Boolean));
  for (const filename of await readdir(imageDirectory)) {
    if (!used.has(filename)) await unlink(join(imageDirectory, filename));
  }
}

async function main() {
  const today = process.env.MENU_REFERENCE_DATE || isoDateInZurich();
  const weekStart = process.env.MENU_WEEK_START || mondayOf(today);
  const weekEnd = addDays(weekStart, 6);
  await mkdir(join(projectRoot, "data"), {recursive:true});
  const [ethDishes, uzhDishes] = await Promise.all([fetchEthWeek(weekStart), fetchUzhToday(weekStart, weekEnd)]);
  const dishes = [...ethDishes, ...uzhDishes].sort((a, b) => a.date.localeCompare(b.date) || a.school.localeCompare(b.school) || a.restaurantName.localeCompare(b.restaurantName) || a.service.localeCompare(b.service) || a.name.en.localeCompare(b.name.en));
  await attachImages(dishes);
  const days = Object.fromEntries(Array.from({length:7}, (_, index) => [addDays(weekStart, index), []]));
  dishes.forEach(dish => days[dish.date]?.push(dish));
  const payload = {
    generatedAt:new Date().toISOString(),
    weekStart,
    weekEnd,
    timeZone:"Europe/Zurich",
    sources:[
      {name:"ETH Cookpit", url:"https://idapps.ethz.ch/cookpit-pub-services/"},
      {name:"UZH FOOD2050", url:"https://app.food2050.ch/"},
      {name:"Wikimedia Commons", url:"https://commons.wikimedia.org/"}
    ],
    days
  };
  await writeFile(dataFile, `${JSON.stringify(payload, null, 2)}\n`);
  const images = dishes.filter(dish => dish.image).length;
  console.log(`Wrote ${dishes.length} dish entries (${images} with images) for ${weekStart}..${weekEnd}`);
}

await main();
