# Icon Files

此目录需要包含以下PNG格式图标:
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

## 临时解决方案

由于命令行环境无法直接生成PNG图片,你可以:

### 方法1: 在线转换SVG
1. 将 icon.svg 上传到在线转换工具 (如 https://cloudconvert.com/svg-to-png)
2. 分别生成 16x16、48x48、128x128 尺寸的PNG
3. 命名为 icon16.png、icon48.png、icon128.png
4. 放入此目录

### 方法2: 使用ImageMagick (如果已安装)
```bash
cd icons
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### 方法3: 临时使用占位符
暂时可以使用任意PNG图片进行测试,不影响插件核心功能。

## 快速获取图标

你也可以使用以下emoji作为临时图标:
- 📥 (inbox tray)
- 💾 (floppy disk)
- 📄 (page facing up)

可以在 https://favicon.io/emoji-favicons/ 生成emoji PNG图标。
