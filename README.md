# UZH × ETH Mensa Map

一个同时适配手机与桌面 Web 的苏黎世大学 (UZH) 与苏黎世联邦理工学院 (ETH) 食堂地图，支持中文、English 和 Deutsch。使用 Leaflet、OpenStreetMap、ETH Cookpit、UZH FOOD2050 与 Wikimedia Commons。

## 本地运行

直接用浏览器打开 `index.html`，或在目录内启动任意静态服务器：

```bash
python3 -m http.server 8000
```

## 部署

通过 GitHub Pages 发布，入口文件为 `index.html`。

## 功能

- 中文、英文、德语界面，中文模式附带可靠的菜品分类标签
- 独立地图模式和列表模式，手机与桌面共享筛选状态
- 按学校、午餐、晚餐和营业状态过滤
- 首次打开主动请求位置权限，按距离排序，并将地图限制在苏黎世
- 按周一至周五和菜品类别反查餐厅，例如查找哪些餐厅在哪天提供米饭
- 餐厅详情展示完整的五个工作日菜单
- 展示经过视觉审核的本地类别图及图片许可信息
- 每周自动更新 ETH Cookpit 与 UZH FOOD2050 菜单快照

## 菜单数据更新

手动刷新本周数据：

```bash
node scripts/update-menus.mjs
```

脚本生成周一至周五的 `data/menu-week.json`，为每道菜建立可多选的主食、蛋白质和菜品类型标签，并把 Wikimedia Commons 的审核类别图下载到 `images/dishes/`。图片作者、许可、匹配类型、验证状态和原始文件页保存在 JSON 中，并在网页上显示。

`.github/workflows/update-menus.yml` 每周一自动运行，更新 `main` 和用于 GitHub Pages 的 `gh-pages` 分支。ETH 使用 Cookpit 周接口；UZH 使用 FOOD2050 的 `/menu/weekly` 页面，并从带日期的真实菜品链接读取菜名和描述。任一学校的数据缺失或校验失败时，脚本退出且不会覆盖上一版线上数据。
