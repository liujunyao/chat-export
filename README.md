# Chat Export - Chrome浏览器插件

一个用于导出AI对话内容的Chrome浏览器插件,支持导出Gemini、ChatGPT、DeepSeek等平台的对话记录。

## 功能特性

✅ **v1.0.0 (当前版本)**
- 在支持的网站上自动激活插件
- 显示页面信息和插件状态
- 浮动按钮和通知提示
- 支持多个AI对话平台

🚧 **规划中**
- 对话内容提取
- 多种导出格式 (Markdown, JSON, HTML)
- 自定义导出选项
- 批量导出功能

## 支持的平台

- 🧪 **lgpms.zlgx.com** (测试网站)
- 💎 **Google Gemini** (gemini.google.com)
- 🤖 **ChatGPT** (chat.openai.com)
- 🔍 **DeepSeek** (chat.deepseek.com)

## 安装方法

### 方式1: 开发者模式安装 (推荐用于测试)

1. **克隆或下载项目**
   ```bash
   git clone <repository-url>
   cd chat-export
   ```

2. **准备图标文件** (临时可选)
   - 在 `icons/` 目录下需要三个PNG图标文件
   - 可以暂时使用任意PNG图片命名为 `icon16.png`, `icon48.png`, `icon128.png`
   - 或参考 `icons/README.md` 中的说明生成图标

3. **加载到Chrome浏览器**
   - 打开Chrome浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的 **"开发者模式"**
   - 点击 **"加载已解压的扩展程序"**
   - 选择本项目的文件夹 (`chat-export`)

4. **验证安装**
   - 在扩展程序列表中看到 "Chat Export"
   - 图标出现在浏览器工具栏

## 使用方法

### 1. 访问支持的网站
打开以下任意支持的网站:
- https://lgpms.zlgx.com (用于测试)
- https://gemini.google.com
- https://chat.openai.com
- https://chat.deepseek.com

### 2. 查看插件状态
- 页面加载后会在右上角显示 **"✅ Chat Export 插件已激活"** 通知
- 右下角会出现 **"📥 导出对话"** 浮动按钮

### 3. 使用功能
- **点击浮动按钮**: 显示当前页面信息
- **点击工具栏图标**: 打开详细信息面板
- **导出对话**: 功能开发中,点击会显示提示

## 项目结构

```
chat-export/
├── manifest.json        # 插件配置文件
├── content.js          # 内容脚本(注入到网页)
├── popup.html          # 弹出面板HTML
├── popup.js            # 弹出面板逻辑
├── icons/              # 图标资源
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg        # SVG源文件
└── README.md           # 说明文档
```

## 开发说明

### 技术栈
- **Manifest V3**: Chrome扩展最新规范
- **原生JavaScript**: 无外部依赖
- **Content Scripts**: 与网页交互
- **Browser Action**: 工具栏弹出面板

### 核心文件说明

**manifest.json**
- 定义插件元数据和权限
- 配置content scripts注入规则
- 声明支持的网站域名

**content.js**
- 在目标网页上运行
- 检测网站类型
- 创建UI元素(通知、浮动按钮)
- 与popup通信

**popup.html/js**
- 工具栏图标点击后显示
- 显示页面信息和插件状态
- 提供导出操作入口

### 调试方法

1. **查看Content Script日志**
   - 在目标网页上按 `F12` 打开开发者工具
   - 切换到 "Console" 标签
   - 查看以 "Chat Export" 开头的日志

2. **调试Popup页面**
   - 右键点击工具栏图标
   - 选择 "检查弹出内容"
   - 在新窗口中调试popup

3. **重新加载插件**
   - 访问 `chrome://extensions/`
   - 找到 "Chat Export"
   - 点击刷新图标 🔄

## 下一步开发计划

### 阶段2: 对话内容提取
- [ ] 实现Gemini对话提取
- [ ] 实现ChatGPT对话提取
- [ ] 实现DeepSeek对话提取
- [ ] 统一对话数据格式

### 阶段3: 导出功能
- [ ] Markdown格式导出
- [ ] JSON格式导出
- [ ] HTML格式导出
- [ ] 文件下载功能

### 阶段4: 用户体验优化
- [ ] 导出进度提示
- [ ] 自定义导出选项
- [ ] 批量导出支持
- [ ] 导出历史记录

## 常见问题

### Q: 插件没有激活?
**A:** 确保你访问的是支持的网站,并且已经刷新页面。

### Q: 看不到浮动按钮?
**A:** 检查浏览器控制台是否有错误,尝试刷新页面或重新加载插件。

### Q: 图标显示问题?
**A:** 确保 `icons/` 目录下有对应尺寸的PNG文件,参考 `icons/README.md`。

### Q: 如何卸载插件?
**A:** 访问 `chrome://extensions/`,找到 "Chat Export",点击 "移除"。

## 贡献指南

欢迎贡献代码和建议!

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0 (2025-12-29)
- ✨ 初始版本发布
- ✅ 基础插件框架
- ✅ 支持4个AI平台
- ✅ 页面检测和状态显示
- ✅ UI交互组件

---

**Made with ❤️ | Version 1.0.0**
