(() => {
  "use strict";

  const ZURICH_BOUNDS = L.latLngBounds([[47.32, 8.44], [47.45, 8.64]]);
  const categoryOrder = ["rice","noodles","pasta","potato","bread","chicken","beef","pork","fish","seafood","egg","tofu","curry","soup","salad","burger","pizza","dumpling","dessert","vegetarian","vegan"];
  const categoryLabels = {
    rice:{zh:"米饭",en:"Rice",de:"Reis"}, noodles:{zh:"面条",en:"Noodles",de:"Nudeln"},
    pasta:{zh:"意面",en:"Pasta",de:"Pasta"}, potato:{zh:"土豆",en:"Potato",de:"Kartoffeln"},
    bread:{zh:"面包",en:"Bread",de:"Brot"}, chicken:{zh:"鸡肉",en:"Chicken",de:"Poulet"},
    beef:{zh:"牛肉",en:"Beef",de:"Rind"}, pork:{zh:"猪肉",en:"Pork",de:"Schwein"},
    fish:{zh:"鱼",en:"Fish",de:"Fisch"}, seafood:{zh:"海鲜",en:"Seafood",de:"Meeresfrüchte"},
    egg:{zh:"鸡蛋",en:"Egg",de:"Ei"}, tofu:{zh:"豆腐/植物蛋白",en:"Tofu",de:"Tofu"},
    curry:{zh:"咖喱",en:"Curry",de:"Curry"}, soup:{zh:"汤",en:"Soup",de:"Suppe"},
    salad:{zh:"沙拉",en:"Salad",de:"Salat"}, burger:{zh:"汉堡",en:"Burger",de:"Burger"},
    pizza:{zh:"披萨",en:"Pizza",de:"Pizza"}, dumpling:{zh:"饺子",en:"Dumplings",de:"Teigtaschen"},
    dessert:{zh:"甜点",en:"Dessert",de:"Dessert"}, vegetarian:{zh:"素食",en:"Vegetarian",de:"Vegetarisch"},
    vegan:{zh:"纯素",en:"Vegan",de:"Vegan"}
  };
  const messages = {
    zh:{
      subtitle:"按菜品反查餐厅与日期 · 周一至周五菜单 · 苏黎世范围",
      map:"地图", list:"列表", all:"全部", lunch:"午餐", dinner:"晚餐", open:"现在营业",
      locate:"◎ 定位我", fit:"显示全部", search:"搜索餐厅、校区或菜品…", wholeWeek:"整周",
      allFoods:"全部菜品", results:"菜单与餐厅", dishes:"{n} 道菜 · {r} 家餐厅",
      updated:"更新于 {time} · {start} 至 {end}", loading:"正在读取本周菜单…",
      noResults:"没有符合当前日期和菜品筛选的结果。", categoryImage:"已审核类别示意图",
      image:"菜品图片", back:"← 返回", weeklyMenu:"周一至周五菜单", noMenu:"当天暂无菜单",
      source:"菜单来源 ↗", official:"餐厅官网 ↗", osm:"在地图中打开 ↗", service:"餐次",
      myLocation:"我的位置", locating:"正在请求位置权限…", denied:"位置未授权；仍可点击地图手动设置位置。",
      outside:"当前位置在苏黎世地图范围外；距离仍会计算，地图保持在苏黎世。",
      nearest:"最近：{name} · {distance}", confirm:"将这里设为当前位置并计算距离吗？",
      schoolFilter:"学校筛选", mealFilter:"餐次筛选", modeFilter:"显示模式", dateFilter:"日期筛选", foodFilter:"菜品分类",
      weekdays:["周一","周二","周三","周四","周五"], details:"查看五日菜单"
    },
    en:{
      subtitle:"Find restaurants by dish and day · Monday–Friday menus · Zurich only",
      map:"Map", list:"List", all:"All", lunch:"Lunch", dinner:"Dinner", open:"Open now",
      locate:"◎ Locate me", fit:"Show all", search:"Search restaurant, campus or dish…", wholeWeek:"Whole week",
      allFoods:"All dishes", results:"Menus and restaurants", dishes:"{n} dishes · {r} restaurants",
      updated:"Updated {time} · {start} to {end}", loading:"Loading this week's menus…",
      noResults:"No results match the current day and food filters.", categoryImage:"Reviewed category image",
      image:"Dish image", back:"← Back", weeklyMenu:"Monday–Friday menu", noMenu:"No menu for this day",
      source:"Menu source ↗", official:"Restaurant website ↗", osm:"Open on map ↗", service:"Service",
      myLocation:"My location", locating:"Requesting location permission…", denied:"Location was not allowed; click the map to set it manually.",
      outside:"Your location is outside the Zurich map; distances still work while the map stays in Zurich.",
      nearest:"Nearest: {name} · {distance}", confirm:"Use this point as your location for distance calculations?",
      schoolFilter:"School filter", mealFilter:"Meal filter", modeFilter:"View mode", dateFilter:"Date filter", foodFilter:"Food categories",
      weekdays:["Monday","Tuesday","Wednesday","Thursday","Friday"], details:"View five-day menu"
    },
    de:{
      subtitle:"Mensen nach Gericht und Tag finden · Montag–Freitag · nur Zürich",
      map:"Karte", list:"Liste", all:"Alle", lunch:"Mittag", dinner:"Abend", open:"Jetzt geöffnet",
      locate:"◎ Mein Standort", fit:"Alle anzeigen", search:"Mensa, Campus oder Gericht suchen…", wholeWeek:"Ganze Woche",
      allFoods:"Alle Gerichte", results:"Menüs und Mensen", dishes:"{n} Gerichte · {r} Mensen",
      updated:"Aktualisiert {time} · {start} bis {end}", loading:"Wochenmenüs werden geladen…",
      noResults:"Keine Ergebnisse für die aktuellen Tages- und Speisefilter.", categoryImage:"Geprüftes Kategoriebild",
      image:"Gerichtbild", back:"← Zurück", weeklyMenu:"Menü Montag–Freitag", noMenu:"Kein Menü an diesem Tag",
      source:"Menüquelle ↗", official:"Mensa-Webseite ↗", osm:"Auf Karte öffnen ↗", service:"Angebot",
      myLocation:"Mein Standort", locating:"Standortberechtigung wird angefragt…", denied:"Standort wurde nicht erlaubt; Position kann auf der Karte gesetzt werden.",
      outside:"Der Standort liegt ausserhalb der Zürcher Karte; Distanzen werden trotzdem berechnet.",
      nearest:"Nächste Mensa: {name} · {distance}", confirm:"Diesen Punkt für die Distanzberechnung verwenden?",
      schoolFilter:"Hochschulfilter", mealFilter:"Angebotsfilter", modeFilter:"Ansicht", dateFilter:"Tagesfilter", foodFilter:"Speisekategorien",
      weekdays:["Montag","Dienstag","Mittwoch","Donnerstag","Freitag"], details:"Fünf-Tage-Menü"
    }
  };

  const restaurants = [
    {id:"uzh-lower",school:"UZH",campus:"Zentrum",name:"Untere Mensa",lat:47.37399725,lng:8.54825215,official:"https://www.zfv.ch/de/essen-gehen/untere-mensa-uzh",services:[["lunch","11:00-14:30"],["dinner","17:00-19:00"]]},
    {id:"uzh-upper",school:"UZH",campus:"Zentrum",name:"Obere Mensa",lat:47.37399725,lng:8.54825215,official:"https://www.zfv.ch/de/essen-gehen/obere-mensa-uzh",services:[["lunch","11:00-14:30"]]},
    {id:"uzh-lichthof",school:"UZH",campus:"Zentrum",name:"Lichthof",lat:47.3738,lng:8.5481,official:"https://www.mensa.uzh.ch/de/menueplaene/lichthof-rondell.html",services:[["lunch","11:00-14:00"]]},
    {id:"uzh-raemi59",school:"UZH",campus:"Zentrum",name:"Rämi59",lat:47.3720996,lng:8.5498961,official:"https://www.zfv.ch/de/essen-gehen/raemi-59",services:[["lunch","11:00-14:00"]]},
    {id:"uzh-platte14",school:"UZH",campus:"Zentrum",name:"Platte 14",lat:47.3740968,lng:8.5526502,official:"https://www.zfv.ch/de/essen-gehen/platte-14",services:[["lunch","11:00-13:30"]]},
    {id:"uzh-zzm",school:"UZH",campus:"Zentrum",name:"ZZM Mensa",lat:47.37458285,lng:8.5529493,official:"https://www.zfv.ch/de/essen-gehen/cafeteria-zentrum-fuer-zahnmedizin-zzm",services:[["lunch","11:00-13:45"]]},
    {id:"uzh-irchel",school:"UZH",campus:"Irchel",name:"Mensa Irchel",lat:47.3971646,lng:8.5482446,official:"https://www.zfv.ch/de/essen-gehen/mensa-uzh-irchel",services:[["lunch","11:00-14:00"]]},
    {id:"uzh-green",school:"UZH",campus:"Irchel",name:"Green Kitchen Lab",lat:47.397101,lng:8.549727,official:"https://www.zfv.ch/de/essen-gehen/uzh-green-kitchen-lab",services:[["lunch","11:00-14:00"]]},
    {id:"uzh-seerose",school:"UZH",campus:"Irchel",name:"Seerose",lat:47.39704197,lng:8.54824305,official:"https://www.zfv.ch/de/essen-gehen/cafeteria-uzh-irchel-seerose",services:[["lunch","11:30-13:00"],["dinner","17:00-19:30"]]},
    {id:"uzh-binz",school:"UZH",campus:"Oerlikon",name:"Mensa Binzmühle",lat:47.4142433,lng:8.549725,official:"https://www.zfv.ch/de/essen-gehen/mensa-uzh-binzmuehle",services:[["lunch","11:15-14:15"]]},
    {id:"uzh-cityport",school:"UZH",campus:"Oerlikon",name:"Cityport",lat:47.4105886,lng:8.5396374,official:"https://www.zfv.ch/de/essen-gehen/cafeteria-uzh-cityport",services:[["lunch","09:00-14:30"]]},
    {id:"uzh-tierspital",school:"UZH",campus:"Irchel",name:"Tierspital",lat:47.40087465,lng:8.55158385,official:"https://www.zfv.ch/de/essen-gehen/cafeteria-uzh-tierspital",services:[["lunch","06:30-16:30"]]},
    {id:"uzh-bot",school:"UZH",campus:"Botanischer Garten",name:"Botanischer Garten",lat:47.3588123,lng:8.5595427,official:"https://www.zfv.ch/de/essen-gehen/cafeteria-uzh-botanischer-garten",services:[["lunch","08:00-17:00"]]},
    {id:"eth-arch",school:"ETH",campus:"Zentrum",name:"Archimedes",lat:47.37754666,lng:8.55340812,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-und-cafeterias/zentrum/archimedes.html",services:[["lunch","11:00-14:00"]]},
    {id:"eth-clausius",school:"ETH",campus:"Zentrum",name:"Clausiusbar",lat:47.37726,lng:8.547,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/zentrum/clausiusbar.html",services:[["lunch","11:00-14:00"]]},
    {id:"eth-doz",school:"ETH",campus:"Zentrum",name:"Dozentenfoyer",lat:47.37634,lng:8.5475,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/zentrum/dozentenfoyer.html",services:[["lunch","11:30-13:30"]]},
    {id:"eth-foodlab",school:"ETH",campus:"Zentrum",name:"food&lab",lat:47.37854,lng:8.54887,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/zentrum/food-lab.html",services:[["lunch","11:30-13:30"]]},
    {id:"eth-poly",school:"ETH",campus:"Zentrum",name:"Mensa Polyterrasse",lat:47.3763,lng:8.54654,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/zentrum/mensa-polyterrasse.html",services:[["lunch","11:15-13:30"],["dinner","17:30-19:30"]]},
    {id:"eth-polysnack",school:"ETH",campus:"Zentrum",name:"Polysnack",lat:47.37618,lng:8.54811,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/zentrum/polysnack.html",services:[["lunch","11:00-13:30"]]},
    {id:"eth-tannen",school:"ETH",campus:"Zentrum",name:"Tannenbar",lat:47.3774,lng:8.54787,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/zentrum/tannenbar.html",services:[["lunch","11:30-13:30"]]},
    {id:"eth-alumni",school:"ETH",campus:"Hönggerberg",name:"Alumni quattro Lounge",lat:47.40826,lng:8.50673,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/hoenggerberg/alumni-quattro-lounge.html",services:[["lunch","11:00-16:00"],["dinner","16:00-20:00"]]},
    {id:"eth-mendo",school:"ETH",campus:"Hönggerberg",name:"Mendokoro",lat:47.40841,lng:8.50801,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/hoenggerberg/mendokoro.html",services:[["lunch","11:15-14:00"]]},
    {id:"eth-foodmarket",school:"ETH",campus:"Hönggerberg",name:"food market",lat:47.408014,lng:8.509737,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/hoenggerberg/food-market-pizza-pasta.html",services:[["lunch","11:15-13:45"]]},
    {id:"eth-fusion",school:"ETH",campus:"Hönggerberg",name:"FUSION meal",lat:47.40775,lng:8.50786,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/hoenggerberg/fusion-meal.html",services:[["lunch","11:00-14:00"]]},
    {id:"eth-riceup",school:"ETH",campus:"Hönggerberg",name:"Rice Up!",lat:47.41011,lng:8.50841,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/hoenggerberg/rice-up.html",services:[["lunch","10:30-14:30"]]},
    {id:"eth-octavo",school:"ETH",campus:"Oerlikon",name:"Octavo",lat:47.41325,lng:8.53723,official:"https://ethz.ch/en/campus/getting-to-know/cafes-restaurants-shops/gastronomy/restaurants-and-cafeterias/oerlikon/octavo.html",services:[["lunch","11:30-13:30"]]}
  ].map(r => ({...r, services:r.services.map(([type,hours]) => ({type,hours}))}));

  const state = {
    language:readStored("mensa-language", ["zh","en","de"], defaultLanguage()),
    mode:readStored("mensa-mode", ["map","list"], "map"),
    school:"ALL", meal:"ALL", date:null, category:"ALL", query:"",
    snapshot:null, userPos:null, selectedRestaurant:null, detailService:"ALL"
  };
  const app = document.getElementById("app");
  const mapPanel = document.getElementById("mapPanel");
  const listPanel = document.getElementById("listPanel");
  const detailPanel = document.getElementById("detailPanel");
  const resultsEl = document.getElementById("results");
  const statusbar = document.getElementById("statusbar");
  let statusTimer = null;
  let userMarker = null;
  const markers = new Map();

  const map = L.map("map", {
    zoomControl:true, minZoom:11, maxBounds:ZURICH_BOUNDS, maxBoundsViscosity:1
  }).setView([47.3876,8.538],13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:19, attribution:'&copy; <a target="_blank" rel="noopener" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  function defaultLanguage() {
    const lang = (navigator.language || "zh").toLowerCase();
    return lang.startsWith("de") ? "de" : lang.startsWith("en") ? "en" : "zh";
  }
  function readStored(key, allowed, fallback) {
    try {
      const value = localStorage.getItem(key);
      return allowed.includes(value) ? value : fallback;
    } catch (_) { return fallback; }
  }
  function store(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  function t(key, values = {}) {
    const raw = messages[state.language][key] ?? messages.en[key] ?? key;
    if (Array.isArray(raw)) return raw;
    return String(raw).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
  }
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function dateISO(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {timeZone:"Europe/Zurich",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
  }
  function dateLabel(iso, index) {
    const date = new Date(`${iso}T12:00:00Z`);
    const locale = state.language === "zh" ? "zh-CN" : state.language === "de" ? "de-CH" : "en-GB";
    return `${t("weekdays")[index]} · ${date.toLocaleDateString(locale,{day:"2-digit",month:"2-digit",timeZone:"UTC"})}`;
  }
  function categoryLabel(category) {
    return categoryLabels[category]?.[state.language] || categoryLabels[category]?.en || category;
  }
  function dishName(dish) {
    return state.language === "de" ? (dish.name?.de || dish.name?.en || "") : (dish.name?.en || dish.name?.de || "");
  }
  function dishDescription(dish) {
    return state.language === "de" ? (dish.description?.de || dish.description?.en || "") : (dish.description?.en || dish.description?.de || "");
  }
  function allDishes() { return Object.values(state.snapshot?.days || {}).flat(); }
  function currentMinutes() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Zurich",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()).map(p => [p.type,p.value]));
    return Number(parts.hour) * 60 + Number(parts.minute);
  }
  function serviceOpen(service) {
    const [a,b] = service.hours.split("-");
    if (!a || !b) return false;
    const minutes = text => { const [h,m] = text.split(":").map(Number); return h*60+(m||0); };
    return currentMinutes() >= minutes(a) && currentMinutes() <= minutes(b);
  }
  function restaurantOpen(restaurant) {
    const weekday = Number(new Intl.DateTimeFormat("en-US",{timeZone:"Europe/Zurich",weekday:"short"}).format(new Date()).match(/Mon|Tue|Wed|Thu|Fri/) != null);
    return Boolean(weekday && restaurant.services.some(serviceOpen));
  }
  function restaurantById(id) { return restaurants.find(r => r.id === id) || null; }
  function searchableDish(dish) {
    const localizedCategories = (dish.categories || []).flatMap(c => Object.values(categoryLabels[c] || {}));
    return [dish.name?.en,dish.name?.de,dish.description?.en,dish.description?.de,dish.restaurantName,dish.campus,...localizedCategories].join(" ").toLowerCase();
  }
  function matchingDishes() {
    const query = state.query.trim().toLowerCase();
    return allDishes().filter(dish => {
      if (state.date && dish.date !== state.date) return false;
      if (state.school !== "ALL" && dish.school !== state.school) return false;
      if (state.meal === "LUNCH" && dish.service !== "lunch") return false;
      if (state.meal === "DINNER" && dish.service !== "dinner") return false;
      if (state.meal === "OPEN" && !restaurantOpen(restaurantById(dish.restaurantId))) return false;
      if (state.category !== "ALL" && !(dish.categories || []).includes(state.category)) return false;
      if (query && !searchableDish(dish).includes(query)) return false;
      return true;
    });
  }
  function visibleRestaurants() {
    const ids = new Set(matchingDishes().map(dish => dish.restaurantId));
    let values = restaurants.filter(r => ids.has(r.id));
    values = values.map(r => ({...r,distance:state.userPos ? distanceMeters(state.userPos,r) : null}));
    values.sort((a,b) => state.userPos ? a.distance-b.distance : a.school.localeCompare(b.school)||a.name.localeCompare(b.name));
    return values;
  }
  function distanceMeters(a,b) {
    const toRad = n => n*Math.PI/180;
    const dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng);
    const x=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
    return 6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
  }
  function fmtDistance(meters) { return meters < 1000 ? `${Math.round(meters)} m` : `${(meters/1000).toFixed(1)} km`; }
  function showStatus(message, milliseconds=3600) {
    clearTimeout(statusTimer);
    statusbar.textContent=message; statusbar.style.display="block";
    statusTimer=setTimeout(() => statusbar.style.display="none",milliseconds);
  }

  function renderFilters() {
    const dates = Object.keys(state.snapshot?.days || {});
    const dateBar = document.getElementById("dateBar");
    dateBar.innerHTML = `<button class="pill ${state.date ? "" : "active"}" data-date="ALL">${esc(t("wholeWeek"))}</button>` +
      dates.map((date,index) => `<button class="pill ${state.date===date?"active":""}" data-date="${date}">${esc(dateLabel(date,index))}</button>`).join("");
    dateBar.querySelectorAll("[data-date]").forEach(button => button.addEventListener("click",() => {
      state.date = button.dataset.date === "ALL" ? null : button.dataset.date;
      renderAll(true);
    }));
    const available = new Set(allDishes().flatMap(dish => dish.categories || []));
    const categories = categoryOrder.filter(category => available.has(category));
    const categoryBar = document.getElementById("categoryBar");
    categoryBar.innerHTML = `<button class="pill category ${state.category==="ALL"?"active":""}" data-category="ALL">${esc(t("allFoods"))}</button>` +
      categories.map(category => `<button class="pill category ${state.category===category?"active":""}" data-category="${category}">${esc(categoryLabel(category))}</button>`).join("");
    categoryBar.querySelectorAll("[data-category]").forEach(button => button.addEventListener("click",() => {
      state.category=button.dataset.category; renderAll(true);
    }));
  }

  function dishCardHtml(dish) {
    const image=dish.image;
    const categories=(dish.categories||[]);
    const categoryText=categories.map(categoryLabel);
    const title=dishName(dish);
    const flags=[dish.vegan?"Vegan":"",!dish.vegan&&dish.vegetarian?"Vegetarian":""].filter(Boolean).join(" · ");
    const prices=(dish.prices||[]).slice(0,3).map(p => `${p.group?esc(p.group)+": ":""}CHF ${Number(p.price).toFixed(2)}`).join(" · ");
    const imageHtml=image?.path ? `<img class="dishImage" src="${esc(image.path)}" alt="${esc(`${t("categoryImage")}: ${categoryLabel(image.category)||title}`)}" loading="lazy">` : "";
    const credit=image?.sourceUrl ? `<div class="credit">${esc(t("categoryImage"))}: <a href="${esc(image.sourceUrl)}" target="_blank" rel="noopener">${esc(image.author||"Wikimedia Commons")}</a> · <a href="${esc(image.licenseUrl||image.sourceUrl)}" target="_blank" rel="noopener">${esc(image.license||"Commons")}</a></div>` : "";
    const chineseLabels=state.language==="zh"&&categoryText.length ? `<div class="categoryLabels"><span class="categoryLabel">${esc(categoryText.join(" / "))}</span></div>` : "";
    const chips=state.language!=="zh"&&categoryText.length ? `<div class="categoryChips">${categoryText.map(x=>`<span class="miniChip">${esc(x)}</span>`).join("")}</div>` : "";
    return `<article class="dishCard clickable" data-restaurant="${esc(dish.restaurantId)}" data-service="${esc(dish.service)}">
      ${imageHtml}<div class="dishBody"><div class="dishTop"><span class="school ${dish.school.toLowerCase()}">${esc(dish.school)}</span><div class="dishTitle">${esc(title)}</div></div>
      ${chineseLabels}${chips}
      <div class="dishMeta">${esc(dish.restaurantName)} · ${esc(dish.campus)} · ${esc(dish.service==="dinner"?t("dinner"):t("lunch"))}${dish.line?` · ${esc(dish.line)}`:""}${flags?` · ${esc(flags)}`:""}</div>
      ${dishDescription(dish)?`<div class="dishDesc">${esc(dishDescription(dish))}</div>`:""}${prices?`<div class="prices">${prices}</div>`:""}${credit}</div></article>`;
  }

  function bindDishCards(root=resultsEl) {
    root.querySelectorAll(".dishCard[data-restaurant]").forEach(card => card.addEventListener("click", event => {
      if (event.target.closest("a")) return;
      openDetail(card.dataset.restaurant, card.dataset.service);
    }));
  }
  function renderList() {
    const dishes=matchingDishes();
    const restaurantCount=new Set(dishes.map(d => d.restaurantId)).size;
    document.getElementById("resultTitle").textContent=t("results");
    document.getElementById("resultCount").textContent=t("dishes",{n:dishes.length,r:restaurantCount});
    if (state.snapshot) {
      const generated=new Date(state.snapshot.generatedAt);
      const locale=state.language==="zh"?"zh-CN":state.language==="de"?"de-CH":"en-GB";
      document.getElementById("dataStamp").textContent=t("updated",{time:generated.toLocaleString(locale),start:state.snapshot.weekStart,end:state.snapshot.weekEnd});
    } else document.getElementById("dataStamp").textContent=t("loading");
    if (!dishes.length) {
      resultsEl.innerHTML=`<div class="empty">${esc(t("noResults"))}</div>`; return;
    }
    const dates=Object.keys(state.snapshot.days);
    resultsEl.innerHTML=dates.map((date,index) => {
      const items=dishes.filter(dish => dish.date===date);
      if (!items.length) return "";
      return `<section class="daySection"><h3>${esc(dateLabel(date,index))} · ${items.length}</h3><div class="dishGrid">${items.map(dishCardHtml).join("")}</div></section>`;
    }).join("");
    bindDishCards();
  }

  function markerIcon(restaurant) {
    const color=restaurant.school==="UZH"?"#0063a6":"#1f7a4c";
    return L.divIcon({className:"",html:`<div style="width:17px;height:17px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,.35)"></div>`,iconSize:[17,17],iconAnchor:[8,8],popupAnchor:[0,-8]});
  }
  function popupHtml(restaurant) {
    const dishes=matchingDishes().filter(dish => dish.restaurantId===restaurant.id);
    const matches=dishes.slice(0,8).map(dish => `<div><strong>${esc(dish.date.slice(5))}</strong> · ${esc(dishName(dish))}</div>`).join("");
    const distance=state.userPos?` · ${fmtDistance(distanceMeters(state.userPos,restaurant))}`:"";
    return `<div class="popupName">${esc(restaurant.name)}</div><div class="popupMeta">${esc(restaurant.school)} · ${esc(restaurant.campus)}${esc(distance)}</div>
      <div class="popupMatches">${matches}${dishes.length>8?`<div>+ ${dishes.length-8}</div>`:""}</div>
      <button class="popupAction" data-open="${esc(restaurant.id)}">${esc(t("details"))}</button>`;
  }
  function addMarkers() {
    restaurants.forEach(restaurant => {
      const marker=L.marker([restaurant.lat,restaurant.lng],{icon:markerIcon(restaurant)}).addTo(map);
      marker.bindTooltip(esc(restaurant.name),{direction:"top",offset:[0,-8],className:`marker-label ${restaurant.school.toLowerCase()}`});
      marker.bindPopup(() => popupHtml(restaurant));
      marker.on("popupopen", event => {
        const button=event.popup.getElement()?.querySelector("[data-open]");
        if (button) button.addEventListener("click",() => openDetail(restaurant.id),{once:true});
      });
      markers.set(restaurant.id,marker);
    });
  }
  function refreshMarkers(fit=false) {
    const visible=visibleRestaurants();
    const ids=new Set(visible.map(r => r.id));
    restaurants.forEach(restaurant => {
      const marker=markers.get(restaurant.id);
      const onMap=map.hasLayer(marker);
      if (ids.has(restaurant.id)&&!onMap) marker.addTo(map);
      if (!ids.has(restaurant.id)&&onMap) map.removeLayer(marker);
      if (ids.has(restaurant.id)) marker.setPopupContent(() => popupHtml(restaurant));
    });
    if (fit) fitVisible();
  }
  function fitVisible() {
    const visible=visibleRestaurants();
    if (!visible.length) return;
    if (visible.length===1) map.setView([visible[0].lat,visible[0].lng],15,{animate:true});
    else map.fitBounds(L.latLngBounds(visible.map(r => [r.lat,r.lng])).pad(.14),{maxZoom:15});
  }

  function compactDishHtml(dish) {
    const labels=(dish.categories||[]).map(categoryLabel);
    return `<div class="compactDish"><div class="compactName">${esc(dishName(dish))}</div>
      ${state.language==="zh"&&labels.length?`<div class="categoryLabel">${esc(labels.join(" / "))}</div>`:""}
      <div class="dishMeta">${esc(dish.service==="dinner"?t("dinner"):t("lunch"))}${dish.line?` · ${esc(dish.line)}`:""}</div>
      ${dishDescription(dish)?`<div class="dishDesc">${esc(dishDescription(dish))}</div>`:""}</div>`;
  }
  function renderDetail() {
    const restaurant=restaurantById(state.selectedRestaurant);
    if (!restaurant) return;
    const allForRestaurant=allDishes().filter(dish => dish.restaurantId===restaurant.id);
    const source=allForRestaurant[0]?.sourceUrl;
    const services=[...new Set(allForRestaurant.map(d => d.service))];
    const serviceButtons=[["ALL",t("all")],...services.map(service => [service,service==="dinner"?t("dinner"):t("lunch")])];
    const dates=Object.keys(state.snapshot?.days||{});
    document.getElementById("detailContent").innerHTML=`<section class="detailHero"><h2>${esc(restaurant.name)}</h2>
      <div class="detailMeta">${esc(restaurant.school)} · ${esc(restaurant.campus)}${state.userPos?` · ${esc(fmtDistance(distanceMeters(state.userPos,restaurant)))}`:""}<br>${esc(t("service"))}: ${restaurant.services.map(s=>`${s.type==="dinner"?t("dinner"):t("lunch")} ${s.hours}`).join(" · ")}</div>
      <div class="serviceBar">${serviceButtons.map(([value,label])=>`<button class="serviceButton ${state.detailService===value?"active":""}" data-detail-service="${value}">${esc(label)}</button>`).join("")}</div>
      <div class="detailActions">${source?`<a href="${esc(source)}" target="_blank" rel="noopener">${esc(t("source"))}</a>`:""}<a href="${esc(restaurant.official)}" target="_blank" rel="noopener">${esc(t("official"))}</a><a href="https://www.openstreetmap.org/?mlat=${restaurant.lat}&mlon=${restaurant.lng}#map=18/${restaurant.lat}/${restaurant.lng}" target="_blank" rel="noopener">${esc(t("osm"))}</a></div></section>
      <div class="sectionHead"><h2>${esc(t("weeklyMenu"))}</h2></div><div class="weekMenu">${dates.map((date,index)=>{
        const dishes=allForRestaurant.filter(d => d.date===date&&(state.detailService==="ALL"||d.service===state.detailService));
        return `<section class="weekDay"><h3>${esc(dateLabel(date,index))}</h3>${dishes.length?dishes.map(compactDishHtml).join(""):`<div class="dishMeta">${esc(t("noMenu"))}</div>`}</section>`;
      }).join("")}</div>`;
    document.querySelectorAll("[data-detail-service]").forEach(button => button.addEventListener("click",() => {
      state.detailService=button.dataset.detailService; renderDetail();
    }));
  }
  function openDetail(id) {
    state.selectedRestaurant=id;
    state.detailService="ALL";
    mapPanel.hidden=true; listPanel.hidden=true; detailPanel.hidden=false;
    renderDetail(); window.scrollTo({top:0,behavior:"smooth"});
  }
  function closeDetail() {
    state.selectedRestaurant=null; detailPanel.hidden=true; applyMode();
  }
  function applyMode() {
    app.dataset.mode=state.mode;
    mapPanel.hidden=state.mode!=="map"; listPanel.hidden=state.mode!=="list"; detailPanel.hidden=true;
    document.querySelectorAll("#modeBar [data-mode]").forEach(button=>button.classList.toggle("active",button.dataset.mode===state.mode));
    if (state.mode==="map") setTimeout(()=>{map.invalidateSize();fitVisible();},40);
  }
  function applyLanguage() {
    document.documentElement.lang=state.language==="zh"?"zh-CN":state.language;
    document.getElementById("subtitle").textContent=t("subtitle");
    document.querySelector('#modeBar [data-mode="map"]').textContent=t("map");
    document.querySelector('#modeBar [data-mode="list"]').textContent=t("list");
    document.querySelector('[data-school="ALL"]').textContent=t("all");
    document.querySelector('[data-meal="ALL"]').textContent=t("all");
    document.querySelector('[data-meal="LUNCH"]').textContent=t("lunch");
    document.querySelector('[data-meal="DINNER"]').textContent=t("dinner");
    document.querySelector('[data-meal="OPEN"]').textContent=t("open");
    document.getElementById("locateBtn").textContent=t("locate");
    document.getElementById("fitBtn").textContent=t("fit");
    document.getElementById("searchInput").placeholder=t("search");
    document.getElementById("searchInput").setAttribute("aria-label",t("search"));
    document.getElementById("searchLabel").textContent=t("search");
    document.getElementById("legendMe").textContent=t("myLocation");
    document.getElementById("backBtn").textContent=t("back");
    document.getElementById("modeBar").setAttribute("aria-label",t("modeFilter"));
    document.getElementById("schoolBar").setAttribute("aria-label",t("schoolFilter"));
    document.getElementById("mealBar").setAttribute("aria-label",t("mealFilter"));
    document.getElementById("dateBar").setAttribute("aria-label",t("dateFilter"));
    document.getElementById("categoryBar").setAttribute("aria-label",t("foodFilter"));
    document.querySelectorAll("#languageBar [data-lang]").forEach(button=>button.classList.toggle("active",button.dataset.lang===state.language));
  }
  function renderAll(fit=false) {
    applyLanguage(); renderFilters(); renderList(); refreshMarkers(fit);
    if (state.selectedRestaurant) renderDetail();
  }

  function setUserPosition(lat,lng,source="manual") {
    state.userPos={lat,lng};
    if (userMarker) { map.removeLayer(userMarker); userMarker=null; }
    if (ZURICH_BOUNDS.contains([lat,lng])) {
      userMarker=L.circleMarker([lat,lng],{radius:8,color:"#fff",weight:3,fillColor:"#111827",fillOpacity:1}).addTo(map).bindTooltip(t("myLocation"),{direction:"top"});
      if (source==="gps") map.setView([lat,lng],15,{animate:true});
    } else showStatus(t("outside"),5200);
    renderAll(false);
    const nearest=visibleRestaurants()[0];
    if (nearest) showStatus(t("nearest",{name:nearest.name,distance:fmtDistance(nearest.distance)}),4200);
  }
  function locateMe() {
    if (!navigator.geolocation) { showStatus(t("denied")); return; }
    showStatus(t("locating"),10000);
    navigator.geolocation.getCurrentPosition(
      position=>setUserPosition(position.coords.latitude,position.coords.longitude,"gps"),
      ()=>showStatus(t("denied"),5000),
      {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
    );
  }

  document.getElementById("languageBar").addEventListener("click",event=>{
    const button=event.target.closest("[data-lang]"); if(!button)return;
    state.language=button.dataset.lang; store("mensa-language",state.language); statusbar.style.display="none"; renderAll();
  });
  document.getElementById("modeBar").addEventListener("click",event=>{
    const button=event.target.closest("[data-mode]"); if(!button)return;
    state.mode=button.dataset.mode; store("mensa-mode",state.mode); window.scrollTo({top:0,behavior:"smooth"}); applyMode();
  });
  document.getElementById("schoolBar").addEventListener("click",event=>{
    const button=event.target.closest("[data-school]"); if(!button)return;
    state.school=button.dataset.school; document.querySelectorAll("[data-school]").forEach(x=>x.classList.toggle("active",x===button)); renderAll(true);
  });
  document.getElementById("mealBar").addEventListener("click",event=>{
    const button=event.target.closest("[data-meal]"); if(!button)return;
    state.meal=button.dataset.meal; document.querySelectorAll("[data-meal]").forEach(x=>x.classList.toggle("active",x===button)); renderAll(true);
  });
  document.getElementById("searchInput").addEventListener("input",event=>{state.query=event.target.value||"";renderList();refreshMarkers(true);});
  document.getElementById("locateBtn").addEventListener("click",locateMe);
  document.getElementById("fitBtn").addEventListener("click",fitVisible);
  document.getElementById("backBtn").addEventListener("click",closeDetail);
  map.on("click",event=>{if(confirm(t("confirm")))setUserPosition(event.latlng.lat,event.latlng.lng,"manual");});
  map.on("drag",()=>map.panInsideBounds(ZURICH_BOUNDS,{animate:false}));
  window.addEventListener("resize",()=>map.invalidateSize());

  addMarkers();
  applyLanguage();
  applyMode();
  document.getElementById("dataStamp").textContent=t("loading");
  fetch(`./data/menu-week.json?v=${Date.now()}`,{cache:"no-store"})
    .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
    .then(snapshot=>{
      state.snapshot=snapshot;
      const dates=Object.keys(snapshot.days||{});
      state.date=dates.includes(dateISO())?dateISO():null;
      renderAll(true);
    })
    .catch(error=>{
      console.error(error);
      resultsEl.innerHTML=`<div class="empty">${esc(t("noResults"))}</div>`;
    })
    .finally(()=>setTimeout(locateMe,700));
})();
