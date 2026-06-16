/**
 * 稿仓 Gaocang - 核心逻辑
 * 功能：作品增删改查、LocalStorage 持久化、作品集渲染、Toast 提示
 */

// 获取作品数据
function getWorks() {
    const data = localStorage.getItem('gaocang_works');
    return data ? JSON.parse(data) : [];
}

// 保存作品数据
function saveWorks(works) {
    localStorage.setItem('gaocang_works', JSON.stringify(works));
}

// 生成唯一 ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 类型名称映射
const categoryNames = {
    'text': '文字报道',
    'data': '数据新闻',
    'photo': '摄影组图',
    'video': '视频作品',
    'h5': 'H5 / 交互',
    'poster': '海报设计',
    'tweet': '推文制作',
    'comment': '新闻评论',
    'other': '其他'
};

// 获取显示用的类型名称（支持自定义类型）
function getCategoryName(work) {
    if (work.category === 'other' && work.customCategory) {
        return work.customCategory;
    }
    return categoryNames[work.category] || work.category;
}

// ========== Toast 提示系统 ==========
let toastContainer = null;

function ensureToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

function showToast(message, type = 'info', duration = 2800) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    let icon = '';
    if (type === 'success') {
        icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
        icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else {
        icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = icon + '<span>' + message + '</span>';
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, duration);
}

// 录入页：表单提交（仅在内联脚本未处理时绑定）
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('workForm');
    if (form && !document.getElementById('fileInput')) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const work = {
                id: generateId(),
                title: document.getElementById('title').value.trim(),
                category: document.getElementById('category').value,
                link: document.getElementById('link').value.trim(),
                cover: document.getElementById('cover').value.trim(),
                description: document.getElementById('description').value.trim(),
                date: document.getElementById('date').value
            };

            const works = getWorks();
            works.unshift(work);
            saveWorks(works);

            showToast('作品已保存', 'success');
            form.reset();
            renderMiniList();
        });
    }
});

// 录入页：渲染迷你列表
function renderMiniList() {
    const listEl = document.getElementById('workList');
    const countEl = document.getElementById('count');
    if (!listEl) return;

    const works = getWorks();
    if (countEl) countEl.textContent = works.length;

    if (works.length === 0) {
        listEl.innerHTML = '<p class="empty-tip">还没有作品，快去录入第一件吧</p>';
        return;
    }

    listEl.innerHTML = works.map(work => `
        <div class="work-item-mini" data-id="${work.id}">
            <div class="info">
                <div class="title">${escapeHtml(work.title)}</div>
                <div class="meta">${getCategoryName(work)} · ${work.date || '未标注时间'}</div>
            </div>
            <div class="actions">
                <button class="btn btn-small" onclick="deleteWork('${work.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 删除作品
function deleteWork(id) {
    if (!confirm('确定删除这件作品吗？')) return;
    const works = getWorks().filter(w => w.id !== id);
    saveWorks(works);
    renderMiniList();
    if (document.getElementById('portfolioContent')) {
        renderPortfolio();
    }
    showToast('作品已删除', 'info');
}

// 清空所有
function clearAllWorks() {
    localStorage.removeItem('gaocang_works');
    renderPortfolio();
    showToast('所有作品已清空', 'info');
}

// HTML 转义，防止 XSS
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 作品集页：渲染
function renderPortfolio(filterCategory) {
    const contentEl = document.getElementById('portfolioContent');
    if (!contentEl) return;

    let works = getWorks();

    if (filterCategory && filterCategory !== 'all') {
        works = works.filter(w => w.category === filterCategory);
    }

    if (works.length === 0) {
        contentEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h4>还没有作品</h4>
                <p>录入第一件作品，或加载示例数据查看不同模板的效果。</p>
                <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                    <a href="edit.html" class="btn btn-primary">去录入作品</a>
                    <button id="demoBtn2" class="btn btn-secondary" onclick="loadDemoFromGlobal()">加载示例数据</button>
                </div>
            </div>
        `;
        return;
    }

    const activeBtn = document.querySelector('.template-btn.active');
    const template = activeBtn ? activeBtn.dataset.template : 'minimal';
    const defaultCover = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400';

    contentEl.innerHTML = works.map(work => {
        const categoryName = getCategoryName(work);
        const coverImg = work.cover || defaultCover;
        const titleHtml = work.link
            ? `<a href="${escapeHtml(work.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(work.title)}</a>`
            : escapeHtml(work.title);

        if (template === 'card') {
            return `
                <article class="work-item">
                    <img src="${escapeHtml(coverImg)}" alt="${escapeHtml(work.title)}" class="work-cover" onerror="this.src='${defaultCover}'">
                    <div class="work-body">
                        <div class="work-category">${categoryName}</div>
                        <div class="work-title">${titleHtml}</div>
                        <div class="work-desc">${escapeHtml(work.description)}</div>
                        <div class="work-meta">
                            <span>${work.date || ''}</span>
                        </div>
                    </div>
                </article>
            `;
        } else if (template === 'timeline') {
            return `
                <article class="work-item">
                    <div class="work-date">${work.date || '未标注时间'}</div>
                    <div class="work-category">${categoryName}</div>
                    <div class="work-title">${titleHtml}</div>
                    <div class="work-desc">${escapeHtml(work.description)}</div>
                    ${work.cover ? `<img src="${escapeHtml(coverImg)}" alt="${escapeHtml(work.title)}" class="work-cover" onerror="this.style.display='none'">` : ''}
                </article>
            `;
        } else {
            return `
                <article class="work-item">
                    <div class="work-category">${categoryName}</div>
                    <div class="work-title">${titleHtml}</div>
                    <div class="work-desc">${escapeHtml(work.description)}</div>
                    <div class="work-meta">${work.date || ''}</div>
                </article>
            `;
        }
    }).join('');
}

// 导出独立作品集 HTML
function exportPortfolio() {
    const works = getWorks();
    if (works.length === 0) {
        showToast('暂无作品可导出，请先录入或加载示例数据', 'error');
        return;
    }

    const aboutText = localStorage.getItem('gaocang_about') || '';
    const activeBtn = document.querySelector('.template-btn.active');
    const template = activeBtn ? activeBtn.dataset.template : 'minimal';
    const templateLabels = { minimal: '极简文字风', card: '融媒体卡片风', timeline: '时间轴履历风' };

    const defaultCover = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400';

    // 计算统计与领域
    const categorySet = new Set(works.map(w => w.category));
    const typeCount = categorySet.size;
    const dates = works.map(w => w.date).filter(Boolean).sort();
    const latestDate = dates.length ? dates[dates.length - 1] : '—';
    const earliestDate = dates.length ? dates[0] : '—';
    const domainLabels = Array.from(categorySet).map(c => categoryNames[c] || c).join(' · ');

    const worksHtml = works.map(work => {
        const categoryName = getCategoryName(work);
        const coverImg = work.cover || defaultCover;
        const titleHtml = work.link
            ? `<a href="${escapeHtml(work.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(work.title)}</a>`
            : escapeHtml(work.title);

        if (template === 'card') {
            return `
                <article class="work-item">
                    <img src="${escapeHtml(coverImg)}" alt="${escapeHtml(work.title)}" class="work-cover" onerror="this.src='${defaultCover}'">
                    <div class="work-body">
                        <div class="work-category">${categoryName}</div>
                        <div class="work-title">${titleHtml}</div>
                        <div class="work-desc">${escapeHtml(work.description)}</div>
                        <div class="work-meta">${work.date || ''}</div>
                    </div>
                </article>
            `;
        } else if (template === 'timeline') {
            return `
                <article class="work-item">
                    <div class="work-date">${work.date || '未标注时间'}</div>
                    <div class="work-category">${categoryName}</div>
                    <div class="work-title">${titleHtml}</div>
                    <div class="work-desc">${escapeHtml(work.description)}</div>
                    ${work.cover ? `<img src="${escapeHtml(coverImg)}" alt="${escapeHtml(work.title)}" class="work-cover" onerror="this.style.display='none'">` : ''}
                </article>
            `;
        } else {
            return `
                <article class="work-item">
                    <div class="work-category">${categoryName}</div>
                    <div class="work-title">${titleHtml}</div>
                    <div class="work-desc">${escapeHtml(work.description)}</div>
                    <div class="work-meta">${work.date || ''}</div>
                </article>
            `;
        }
    }).join('');

    const aboutHtml = aboutText
        ? `<div class="profile-body"><h2>关于我</h2><p>${escapeHtml(aboutText).replace(/\n/g, '<br>')}</p></div>`
        : `<div class="profile-body"><h2>关于我</h2><p>暂未填写个人简介。</p></div>`;

    const exportCss = `
        :root{--ink:#0f172a;--ink-soft:#1e293b;--accent:#2563eb;--accent-soft:#eff6ff;--bg:#f8fafc;--surface:#ffffff;--border:#e2e8f0;--border-strong:#cbd5e1;--text-secondary:#475569;--text-tertiary:#64748b}
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;background:var(--bg);color:var(--ink);line-height:1.65;min-height:100vh;-webkit-font-smoothing:antialiased}
        .container{max-width:960px;margin:0 auto;padding:0 24px}
        .portfolio-hero{background:linear-gradient(135deg,var(--ink) 0%,var(--ink-soft) 100%);color:#fff;padding:72px 24px 64px;text-align:center;position:relative;overflow:hidden}
        .portfolio-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 30%,rgba(37,99,235,0.18) 0,transparent 40%),radial-gradient(circle at 80% 70%,rgba(99,102,241,0.12) 0,transparent 40%);pointer-events:none}
        .hero-inner{position:relative;z-index:1;max-width:640px;margin:0 auto}
        .hero-label{display:inline-block;font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:16px;border:1px solid rgba(148,163,184,0.35);padding:5px 12px;border-radius:999px}
        .portfolio-hero h1{font-size:clamp(2.2rem,6vw,3.6rem);font-weight:700;letter-spacing:-.03em;margin-bottom:12px}
        .hero-subtitle{font-size:1.15rem;color:#cbd5e1;font-weight:400}
        .profile-section{margin-top:-40px;position:relative;z-index:2;margin-bottom:56px}
        .profile-card{background:var(--surface);border-radius:20px;border:1px solid var(--border);box-shadow:0 20px 40px -12px rgba(15,23,42,0.12);padding:32px;display:grid;grid-template-columns:auto 1fr auto;gap:28px;align-items:center}
        .profile-avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--accent) 0%,#4f46e5 100%);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:700;flex-shrink:0}
        .profile-body h2{font-size:1.3rem;font-weight:600;margin-bottom:10px;letter-spacing:-.01em}
        .profile-body p{color:var(--text-secondary);line-height:1.75;white-space:pre-wrap}
        .profile-stats{display:flex;gap:28px;border-left:1px solid var(--border);padding-left:28px;flex-shrink:0}
        .stat{display:flex;flex-direction:column;gap:4px;text-align:center}
        .stat-value{font-size:1.6rem;font-weight:700;color:var(--ink);letter-spacing:-.02em}
        .stat-label{font-size:.8rem;color:var(--text-tertiary);font-weight:500}
        .domain-tags{margin-top:18px;display:flex;flex-wrap:wrap;gap:8px}
        .domain-tag{font-size:.82rem;font-weight:500;color:var(--accent);background:var(--accent-soft);border:1px solid #bfdbfe;padding:5px 12px;border-radius:999px}
        .works-section{margin-bottom:64px}
        .section-header{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid var(--border)}
        .section-header h2{font-size:1.5rem;font-weight:700;letter-spacing:-.01em}
        .section-tag{font-size:.8rem;font-weight:500;color:var(--text-tertiary);background:var(--bg);border:1px solid var(--border);padding:5px 12px;border-radius:999px}
        .portfolio-content{position:relative}
        footer{text-align:center;padding:48px 24px;border-top:1px solid var(--border);background:var(--surface)}
        footer p{color:var(--text-secondary);font-size:.9rem}
        .footer-hint{font-size:.8rem;color:var(--text-tertiary);margin-top:6px}
        /* minimal */
        .template-minimal .portfolio-content{max-width:760px;margin:0 auto}
        .template-minimal .work-item{padding:32px 0;border-bottom:1px solid var(--border)}
        .template-minimal .work-item:last-child{border-bottom:none}
        .template-minimal .work-category{font-size:.72rem;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
        .template-minimal .work-title{font-size:1.35rem;font-weight:600;letter-spacing:-.01em;margin-bottom:10px;line-height:1.35}
        .template-minimal .work-title a{color:var(--ink);text-decoration:none}
        .template-minimal .work-title a:hover{color:var(--accent);text-decoration:underline}
        .template-minimal .work-desc{color:var(--text-secondary);line-height:1.8;margin-bottom:10px;max-width:68ch}
        .template-minimal .work-meta{font-size:.85rem;color:var(--text-tertiary);font-variant-numeric:tabular-nums}
        /* card */
        .template-card .portfolio-content{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px}
        .template-card .work-item{background:var(--surface);border-radius:16px;overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow-sm);transition:transform .25s,box-shadow .25s}
        .template-card .work-item:hover{transform:translateY(-4px);box-shadow:0 12px 24px -8px rgba(15,23,42,0.12)}
        .template-card .work-cover{width:100%;height:190px;object-fit:cover;background:var(--bg)}
        .template-card .work-body{padding:22px}
        .template-card .work-category{font-size:.72rem;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
        .template-card .work-title{font-size:1.1rem;font-weight:600;margin-bottom:8px;line-height:1.4}
        .template-card .work-title a{color:var(--ink);text-decoration:none}
        .template-card .work-title a:hover{color:var(--accent)}
        .template-card .work-desc{font-size:.9rem;color:var(--text-secondary);line-height:1.7;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        .template-card .work-meta{font-size:.8rem;color:var(--text-tertiary);font-variant-numeric:tabular-nums}
        /* timeline */
        .template-timeline .portfolio-content{padding-left:32px}
        .template-timeline .portfolio-content::before{content:'';position:absolute;left:8px;top:0;bottom:0;width:2px;background:var(--border)}
        .template-timeline .work-item{position:relative;padding:22px 0 36px 28px}
        .template-timeline .work-item::before{content:'';position:absolute;left:-26px;top:28px;width:13px;height:13px;background:var(--accent);border-radius:50%;border:3px solid var(--surface);box-shadow:0 0 0 3px var(--accent-soft)}
        .template-timeline .work-date{font-size:.85rem;color:var(--accent);font-weight:600;font-variant-numeric:tabular-nums;margin-bottom:5px}
        .template-timeline .work-category{font-size:.72rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
        .template-timeline .work-title{font-size:1.2rem;font-weight:600;letter-spacing:-.01em;margin-bottom:8px}
        .template-timeline .work-title a{color:var(--ink);text-decoration:none}
        .template-timeline .work-title a:hover{color:var(--accent)}
        .template-timeline .work-desc{color:var(--text-secondary);line-height:1.8;margin-bottom:10px;max-width:65ch}
        .template-timeline .work-cover{width:100%;max-width:440px;border-radius:10px;margin-top:12px;box-shadow:0 4px 12px rgba(15,23,42,0.08)}
        @media(max-width:768px){
            .portfolio-hero{padding:56px 20px 48px}
            .profile-card{grid-template-columns:1fr;gap:20px;text-align:center}
            .profile-stats{border-left:none;border-top:1px solid var(--border);padding-left:0;padding-top:20px;justify-content:center}
            .section-header{flex-direction:column;align-items:flex-start;gap:10px}
            .template-card .portfolio-content{grid-template-columns:1fr}
            .template-timeline .portfolio-content{padding-left:22px}
            .template-timeline .portfolio-content::before{left:4px}
            .template-timeline .work-item::before{left:-20px;width:11px;height:11px}
        }
    `;

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的作品集 - 稿仓</title>
    <style>${exportCss}</style>
</head>
<body>
    <header class="portfolio-hero">
        <div class="hero-inner">
            <span class="hero-label">Portfolio</span>
            <h1>我的作品集</h1>
            <p class="hero-subtitle">新闻传播学专业 · 求职作品集</p>
        </div>
    </header>

    <main class="container">
        <section class="profile-section">
            <div class="profile-card">
                <div class="profile-avatar">我</div>
                ${aboutHtml}
                <div class="profile-stats">
                    <div class="stat">
                        <span class="stat-value">${works.length}</span>
                        <span class="stat-label">作品总数</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${typeCount}</span>
                        <span class="stat-label">作品类型</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${latestDate.slice(0, 4) || '—'}</span>
                        <span class="stat-label">最近更新</span>
                    </div>
                </div>
            </div>
            ${domainLabels ? `<div class="domain-tags">${domainLabels.split(' · ').map(d => `<span class="domain-tag">${d}</span>`).join('')}</div>` : ''}
        </section>

        <section class="works-section">
            <div class="section-header">
                <h2>精选作品</h2>
                <span class="section-tag">${templateLabels[template]}</span>
            </div>
            <div class="portfolio-content template-${template}">
                ${worksHtml}
            </div>
        </section>
    </main>

    <footer>
        <p>由稿仓 Gaocang 生成</p>
        <p class="footer-hint">新闻学 Web 前端技术课程实践作品 · ${earliestDate} ~ ${latestDate}</p>
    </footer>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '我的作品集.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('作品集已导出为独立 HTML', 'success');
}

// 供全局调用的加载示例
function loadDemoFromGlobal() {
    const demoData = [
        {
            id: generateId(),
            title: '城市边缘的搬迁者——城中村改造调查报道',
            category: 'text',
            link: 'https://example.com/article1',
            cover: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400',
            description: '本作品为深度报道课程期末作业，历时两周走访XX城中村，采访住户12人、街道办工作人员3人，呈现城市更新中个体命运的复杂性。作品获评课程优秀作业。',
            date: '2025-12'
        },
        {
            id: generateId(),
            title: '近十年大学生就业流向数据可视化',
            category: 'data',
            link: 'https://example.com/data1',
            cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
            description: '使用Python爬虫抓取教育部公开数据，结合ECharts制作交互式数据新闻页面。从地域、行业、薪资三个维度呈现大学生就业趋势变化。',
            date: '2026-03'
        },
        {
            id: generateId(),
            title: '早市烟火：城市清晨的另一种叙事',
            category: 'photo',
            link: 'https://example.com/photo1',
            cover: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400',
            description: '摄影课程作业，连续一周清晨5点前往本地早市拍摄，记录摊贩与顾客之间的日常互动。共拍摄300余张，精选12张组成专题组图。',
            date: '2025-09'
        },
        {
            id: generateId(),
            title: '短视频：一位非遗传承人的坚守与困惑',
            category: 'video',
            link: 'https://www.bilibili.com/video/example',
            cover: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
            description: '广播电视学课程小组作业，担任导演与剪辑。作品讲述本地皮影戏传承人的故事，获学院微视频大赛三等奖，全网播放量2.3万。',
            date: '2026-01'
        }
    ];
    localStorage.setItem('gaocang_works', JSON.stringify(demoData));
    renderPortfolio();
    showToast('示例数据已加载', 'success');
}
