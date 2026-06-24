/**
 * 绥芬河市工业信息科技局服务平台 - 统一底部
 * 使用方式：在每个子页面的 </body> 之前引入本文件
 *   <script src="../assets/site-footer.js"></script>
 */
(function () {
    if (document.getElementById('site-footer-root')) return;

    var CSS = ''
        + '.site-footer{background:#122850;color:rgba(255,255,255,.78);margin-top:48px;position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;width:100vw;box-sizing:border-box;}'
        + '.site-footer-inner{max-width:1280px;margin:0 auto;padding:32px 24px 20px;}'
        + '.site-footer-row{display:flex;justify-content:space-between;flex-wrap:wrap;gap:24px 32px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.1);}'
        + '.site-footer-col{font-size:13px;line-height:1.9;min-width:0;flex:1 1 220px;}'
        + '.site-footer-col .lbl{color:#fff;font-weight:600;display:block;margin-bottom:4px;font-size:12px;opacity:.6;letter-spacing:1px;}'
        + '.site-footer-bottom{padding-top:16px;text-align:center;font-size:12px;color:rgba(255,255,255,.5);line-height:1.8;}'
        + '.site-tech{position:relative;display:inline-block;cursor:pointer;color:#ffd54a;border-bottom:1px dashed rgba(255,213,74,.4);padding-bottom:1px;transition:color .2s,border-color .2s;}'
        + '.site-tech:hover,.site-tech:focus{color:#fff;border-bottom-color:#fff;outline:none;}'
        + '.site-tech-tip{visibility:hidden;opacity:0;position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);background:#fff;color:#1a1a1a;padding:10px 16px;border-radius:4px;font-size:13px;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,.25);transition:opacity .2s,visibility .2s;z-index:1000;}'
        + '.site-tech-tip::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#fff;}'
        + '.site-tech-tip .tip-lbl{color:#7a7a7a;margin-right:6px;font-size:12px;}'
        + '.site-tech-tip .tip-mail{color:#c8102e;font-weight:600;font-family:Consolas,Monaco,monospace;}'
        + '.site-tech:hover .site-tech-tip,.site-tech:focus .site-tech-tip{visibility:visible;opacity:1;}'
        + '@media (max-width:768px){'
        +   '.site-footer-inner{padding:24px 16px 16px;}'
        +   '.site-footer-row{flex-direction:column;gap:14px;padding-bottom:16px;}'
        +   '.site-footer-col{font-size:13px;line-height:1.7;flex:1 1 auto;}'
        +   '.site-footer-bottom{font-size:11px;}'
        +   '.site-tech-tip{bottom:auto;top:calc(100% + 10px);}'
        +   '.site-tech-tip::after{top:auto;bottom:100%;border-top-color:transparent;border-bottom-color:#fff;}'
        + '}';

    var style = document.createElement('style');
    style.id = 'site-footer-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    var html = ''
        + '<footer class="site-footer">'
        +   '<div class="site-footer-inner">'
        +     '<div class="site-footer-row">'
        +       '<div class="site-footer-col"><span class="lbl">主办单位</span>绥芬河市工业信息科技局</div>'
        +       '<div class="site-footer-col"><span class="lbl">联系方式</span>0453-3962217</div>'
        +       '<div class="site-footer-col"><span class="lbl">办公地址</span>黑龙江牡丹江市绥芬河市青云路129号工信局302室</div>'
        +       '<div class="site-footer-col"><span class="lbl">技术支持</span>'
        +         '<span class="site-tech" tabindex="0">大连富乐达科技有限公司'
        +           '<span class="site-tech-tip"><span class="tip-lbl">联系方式</span><span class="tip-mail">ideallab@163.com</span></span>'
        +         '</span>'
        +       '</div>'
        +     '</div>'
        +     '<div class="site-footer-bottom">'
        +       '<div>© 2026 绥芬河市工业信息科技局　保留所有权利</div>'
        +       '<div>建议使用 Chrome、Edge、Firefox 浏览器，分辨率 1280×720 以上浏览</div>'
        +     '</div>'
        +   '</div>'
        + '</footer>';

    var wrap = document.createElement('div');
    wrap.id = 'site-footer-root';
    wrap.innerHTML = html;
    document.body.appendChild(wrap);

    // 访问追踪（数据看板用）
    try {
        var payload = {
            path: location.pathname + (location.search || ''),
            referer: document.referrer || '',
            ua: navigator.userAgent || '',
            screen: (screen.width || 0) + 'x' + (screen.height || 0),
        };
        var body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
        } else {
            fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
        }
    } catch (e) { /* 追踪失败不影响页面 */ }
})();
