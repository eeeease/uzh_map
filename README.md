# UZH × ETH Mensa Map

一个纯静态的苏黎世大学 (UZH) 与苏黎世联邦理工学院 (ETH) 食堂地图，使用 Leaflet 和 OpenStreetMap 瓦片。

## 本地运行

直接用浏览器打开 `index.html`，或在目录内启动任意静态服务器：

```bash
python3 -m http.server 8000
```

## 部署

通过 GitHub Pages 发布，入口文件为 `index.html`。

## 功能

- 按学校、早午晚餐过滤
- 按距离排序并显示当前位置
- 查看 UZH 每日菜单 / ETH Cookpit 菜单
