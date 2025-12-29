// Chat Export Content Script
// 在目标网页上运行,用于检测和提取对话内容

// 创建一个浮动提示框显示插件状态
function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;

    // 添加动画样式
    if (!document.getElementById('chat-export-style')) {
        const style = document.createElement('style');
        style.id = 'chat-export-style';
        style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 自动移除通知
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

const gfm = turndownPluginGfm.gfm;

// 初始化 Turndown 实例
const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

// 使用 GFM 插件（支持表格、任务列表、删除线）
td.use(gfm)

// 过滤掉所有按钮和脚本标签
td.remove(['button', 'script', 'style', 'svg']);

// 页面加载完成后显示通知
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        showNotification('✅ Chat Export 插件已激活');
    });
} else {
    showNotification('✅ Chat Export 插件已激活');
}

// 检测当前网站
function detectWebsite() {
    const hostname = window.location.hostname;

    if (hostname.includes('gemini.google.com')) {
        return 'gemini';
    } else if (hostname.includes('chat.openai.com')) {
        return 'chatgpt';
    } else if (hostname.includes('chat.deepseek.com')) {
        return 'deepseek';
    }
    return 'unknown';
}

// 获取网站信息
const website = detectWebsite();
console.log('检测到的网站类型:', website);

// 创建一个浮动按钮用于测试
function createFloatingButton() {
    const button = document.createElement('button');
    button.textContent = '📥 导出对话';
    button.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    z-index: 10000;
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });

    button.addEventListener('click', () => {
        // 打开模态对话框
        showExportModal();
    });

    document.body.appendChild(button);
}

// 等待页面完全加载后创建按钮
if (document.body) {
    createFloatingButton();
} else {
    const observer = new MutationObserver((_, obs) => {
        if (document.body) {
            createFloatingButton();
            obs.disconnect();
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

// 处理导出对话请求
async function loadConversation(sendResponse) {
    try {
        let chatData = {
            success: false,
            website: website,
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            exchanges: [],
            note: ''
        };

        if (website !== 'gemini' && website !== 'deepseek') {
            chatData.note = '当前网站暂不支持对话提取';
        } else {
            // 通用提取逻辑
            await scrollToTopAndLoadAll();

            // 获取回话的标题
            const title = extractTitle();

            // 获取对话dom
            const exchanges = extractExchanges();

            if (exchanges.length > 0) {
                chatData.success = true;
                chatData.title = title;
                chatData.exchanges = exchanges;
            }
        }

        // 返回数据
        sendResponse(chatData);

        // 显示结果通知
        if (chatData.success && chatData.exchanges.length > 0) {
            showNotification(`✅ 成功提取 ${chatData.exchanges.length} 条对话`, 3000);
        } else {
            showNotification('⚠️ 未找到对话内容', 3000);
        }

    } catch (error) {
        console.error('导出失败:', error);
        sendResponse({
            success: false,
            website: website,
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            exchanges: [],
            error: error.message,
            note: '提取失败: ' + error.message
        });
        showNotification('❌ 导出失败: ' + error.message, 3000);
    }
}

// ==================== 模态对话框功能 ====================

let modalInstance = null;
let currentChatData = null;

// 显示导出模态对话框
function showExportModal() {
    // 如果已存在模态框,直接显示
    if (modalInstance) {
        modalInstance.style.display = 'flex';
        loadModalData();
        return;
    }

    // 创建模态对话框
    createExportModal();
    loadModalData();
}

// 创建模态对话框DOM
function createExportModal() {
    const modal = document.createElement('div');
    modal.id = 'chat-export-modal';
    modal.style.cssText = `
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    justify-content: center;
    align-items: flex-start;
    padding-top: 5vh;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

    modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      width: 95%;
      max-width: 800px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    ">
      <!-- 头部 -->
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">📥 导出对话</h2>
        <button id="modal-close-btn" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          line-height: 1;
        ">×</button>
      </div>

      <!-- 内容区 -->
      <div style="padding: 20px;">
        <!-- 对话预览 -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="font-size: 14px; color: #667eea; margin: 0; font-weight: 600;">
              📋 对话内容 <span id="modal-message-count" style="
                background: #667eea;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                margin-left: 5px;
              ">0</span>
            </h3>
            <button id="modal-refresh-btn" style="
              background: #667eea;
              border: none;
              color: white;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              cursor: pointer;
              font-size: 14px;
              line-height: 1;
              transition: all 0.2s;
            " title="刷新对话内容">🔄</button>
          </div>
          <div id="modal-preview" style="
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            max-height: 300px;
            overflow-y: auto;
            font-size: 13px;
            line-height: 1.6;
            white-space: pre-wrap;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">正在加载对话内容...</div>
        </div>

        <!-- 导出按钮 -->
        <button id="modal-export-btn" style="
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 6px;
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        ">
          💾 确认导出
        </button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    modalInstance = modal;

    // 绑定事件
    setupModalEvents();
}

// 设置模态框事件
function setupModalEvents() {
    // 关闭按钮
    document.getElementById('modal-close-btn').addEventListener('click', () => {
        modalInstance.style.display = 'none';
    });

    // 刷新按钮
    const refreshBtn = document.getElementById('modal-refresh-btn');
    refreshBtn.addEventListener('click', () => {
        showNotification('🔄 正在刷新对话内容...', 2000);
        loadModalData();
    });

    // 刷新按钮悬停效果
    refreshBtn.addEventListener('mouseenter', () => {
        refreshBtn.style.transform = 'rotate(180deg)';
        refreshBtn.style.background = '#5568d3';
    });
    refreshBtn.addEventListener('mouseleave', () => {
        refreshBtn.style.transform = 'rotate(0deg)';
        refreshBtn.style.background = '#667eea';
    });

    // 点击背景关闭
    modalInstance.addEventListener('click', (e) => {
        if (e.target === modalInstance) {
            modalInstance.style.display = 'none';
        }
    });

    // 导出按钮
    document.getElementById('modal-export-btn').addEventListener('click', () => {
        performModalExport();
    });
}

// 加载模态框数据
function loadModalData() {
    loadConversation((response) => {
        if (response && response.success) {
            currentChatData = response;
            updateModalPreview();
        } else {
            currentChatData = null;
            updateModalPreview();
        }
    });
}

// 更新模态框预览
function updateModalPreview() {
    const preview = document.getElementById('modal-preview');
    const messageCount = document.getElementById('modal-message-count');
    const exportBtn = document.getElementById('modal-export-btn');

    if (!currentChatData) {
        preview.textContent = '正在加载对话内容...';
        messageCount.textContent = '0';
        // 禁用导出按钮
        exportBtn.disabled = true;
        exportBtn.style.opacity = '0.5';
        exportBtn.style.cursor = 'not-allowed';
        return;
    }

    if (!currentChatData.success || !currentChatData.exchanges || currentChatData.exchanges.length === 0) {
        preview.textContent = currentChatData.note || '暂无对话内容';
        messageCount.textContent = '0';
        // 禁用导出按钮
        exportBtn.disabled = true;
        exportBtn.style.opacity = '0.5';
        exportBtn.style.cursor = 'not-allowed';
        return;
    }

    // 启用导出按钮
    exportBtn.disabled = false;
    exportBtn.style.opacity = '1';
    exportBtn.style.cursor = 'pointer';

    // 更新消息数量
    messageCount.textContent = currentChatData.exchanges.length;

    // 生成Markdown格式的预览
    let markdownContent = `# ${currentChatData.title}\n\n`;
    markdownContent += `**网站**: ${currentChatData.website}\n`;
    markdownContent += `**时间**: ${new Date(currentChatData.timestamp).toLocaleString('zh-CN')}\n`;
    markdownContent += `**对话数**: ${currentChatData.exchanges.length} 条\n\n`;
    markdownContent += `---\n\n`;

    // 添加对话内容
    currentChatData.exchanges.forEach((exchange, index) => {
        const ask = exchange.ask;
        const answer = exchange.answer;
        markdownContent += `### 👤 User\n\n`;
        markdownContent += `${ask}\n\n`;

        markdownContent += `### 🤖 Assistant\n\n`;
        markdownContent += `${answer}\n\n`;
        // 不是最后一条消息时添加分隔符
        if (index < currentChatData.exchanges.length - 1) {
            markdownContent += `---\n\n`;
        }
    });

    preview.textContent = markdownContent;
}

// 执行模态框导出
function performModalExport() {
    const preview = document.getElementById('modal-preview');
    const content = preview.textContent;

    if (!content || content.trim() === '' || !currentChatData) {
        showNotification('❌ 没有可导出的数据', 3000);
        return;
    }
    try {
        // 只支持Markdown格式
        const filename = `chat-export-${currentChatData.website}-${Date.now()}.md`;
        const mimeType = 'text/markdown';

        // 下载文件
        downloadFile(content, filename, mimeType);

        // 显示成功消息并关闭模态框
        showNotification(`✅ 导出成功!\n文件: ${filename}`, 3000);
        modalInstance.style.display = 'none';
    } catch (error) {
        console.error('导出失败:', error);
        showNotification('❌ 导出失败: ' + error.message, 3000);
    }
}

// 下载文件
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ==================== 网站特定的对话提取函数 ====================

/**
 * 提取对话标题，返回一个字符串
 */
function extractTitle() {
    let title = 'AI问答'
    if (website === 'gemini') {
        title = document.querySelector('conversations-list div.selected')?.textContent || document.querySelector('div.conversation-title')?.textContent || document.title;
    } else if (website === 'deepseek') {

    }
    return title;
}

/**
 * 提取对话内容，返回一个集合
 */
function extractExchanges() {
    const exchanges = [];

    let asks = []
    let answers = []
    // 获取用户提问和AI回答的选择器
    if (website === 'gemini') {
        asks = document.querySelectorAll("user-query");
        answers = document.querySelectorAll("model-response");
    } else if(website === 'deepseek') {
        const messages = document.querySelectorAll("div.ds-message");
        for (let i = 0; i < messages.length; i++) {
            // 如果有 ds-markdown
            const markdown = messages[i].querySelector(":scope > .ds-markdown")
            if (markdown) {
                answers.push(markdown)
            } else {
                asks.push(messages[i])
            }
        }
    }

    if (asks.length > 0) {
        for (let i = 0; i < asks.length; i++) {
            const ask = td.turndown(asks[i]);
            let answer = ''
            if (answers.length > i) {
                answer = td.turndown(answers[i]);
            }
            exchanges.push({
                ask: ask,
                answer: answer
            });
        }
    }
    return exchanges;
}

// 查找可滚动的容器，用于滚动到顶部加载所有对话内容
function findScrollableContainer() {
    let messageSelectors = '';
    if (website === 'gemini') {
        messageSelectors = 'user-query, model-response, div[data-message-id]';
    } else if (website === 'deepseek') {
        messageSelectors = 'div.ds-message';
    }
    const firstMessage = document.querySelector(messageSelectors);
    if (!firstMessage) {
        console.log('Could not find a message element to start search from.');
        return null;
    }

    let parent = firstMessage.parentElement;
    while (parent && parent !== document.body) {
        if (parent.scrollHeight > parent.clientHeight) {
            console.log('Found scrollable container: ' + parent.tagName);
            return parent;
        }
        parent = parent.parentElement;
    }
    console.log('No specific scroll container found, will attempt to scroll window.');
    return window;
}

// 滚动到顶部并加载所有对话内容
async function scrollToTopAndLoadAll() {
    // 1. 查找可滚动的容器
    const scrollContainer = findScrollableContainer();
    if (!scrollContainer) return;

    let tries = 0;
    while (tries < 300) {
        // 在滚动前后，判断消息的数量变化
        const lastMessageCount = getExchangeCount();

        for (let i = 0; i < 4; i++) {
            scrollContainer.scrollTo({ top: 0 });
            await delay(50);
        }
        await delay(5000);
        const currentMessageCount = getExchangeCount();
        if (currentMessageCount === lastMessageCount && lastMessageCount > 0) {
            break;
        }
        tries++;
    }
}

function getExchangeCount() {
    if (website === 'gemini') {
        return document.querySelectorAll('user-query, model-response, div[data-message-id]').length;
    } else if (website === 'deepseek') {
        return document.querySelectorAll('div.ds-message').length;
    }
    return document.querySelectorAll('user-query, model-response, div[data-message-id]').length;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}