# UZH × ETH Mensa Map

一个纯静态的苏黎世大学 (UZH) 与苏黎世联邦理工学院 (ETH) 食堂地图，支持中文、English 和 Deutsch。使用 Leaflet、OpenStreetMap、ETH Cookpit、UZH FOOD2050 与 Wikimedia Commons。

## 本地运行

直接用浏览器打开 `index.html`，或在目录内启动任意静态服务器：

```bash
python3 -m http.server 8000
```

## 部署

通过 GitHub Pages 发布，入口文件为 `index.html`。

## 功能

- 中文、英文、德语界面
- 按学校、午餐、晚餐和营业状态过滤
- 按距离排序并显示当前位置
- 聚合展示今日菜品和本地静态示意图片
- 查看 UZH FOOD2050 / ETH Cookpit 菜单
- 每周自动更新菜单快照、图片和图片许可信息

## 菜单数据更新

手动刷新本周数据：

```bash
node scripts/update-menus.mjs
```

脚本生成 `data/menu-week.json` 并把 Wikimedia Commons 的相似菜品缩略图下载到 `images/dishes/`。图片作者、许可和原始文件页保存在 JSON 中，并在网页上显示。

`.github/workflows/update-menus.yml` 每周一自动运行，更新 `main` 和用于 GitHub Pages 的 `gh-pages` 分支。ETH Cookpit 提供完整周数据；UZH FOOD2050 当前公开页面只保证当前日期，因此自动化会保存运行当天可抽取的 UZH 菜品，并在网页详情中保留实时菜单作为回退。
