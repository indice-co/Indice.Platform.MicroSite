(() => {
  const article = document.querySelector('.cases-article');
  const menu = document.querySelector('.cases-page-links');
  const menus = Array.from(document.querySelectorAll('.cases-page-links, .cases-article-toc nav')).map(navigation =>
    Array.from(navigation.querySelectorAll('a[href^="#"]')).map(link => ({
      link,
      heading:document.getElementById(link.getAttribute('href').slice(1))
    })).filter(item => item.heading)
  );
  let pendingFrame = null;
  function updateActiveSection() {
    pendingFrame = null;
    const anchorOffset = article && window.getComputedStyle
      ? parseFloat(window.getComputedStyle(article).getPropertyValue('--article-scroll-offset')) || 0
      : 0;
    const threshold = Math.max(menu?.getBoundingClientRect().bottom || 0, anchorOffset) + 32;
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const articleStarted = article && article.getBoundingClientRect().top <= threshold;
    for (const items of menus) {
      let active = null;
      for (const item of items) {
        if (item.heading.getBoundingClientRect().top <= threshold) active = item;
      }
      if (atBottom && articleStarted) active = items[items.length - 1];
      for (const item of items) {
        if (item === active) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      }
    }
  }
  function scheduleUpdate() {
    if (pendingFrame === null) pendingFrame = window.requestAnimationFrame(updateActiveSection);
  }
  if (article) {
    window.addEventListener('scroll', scheduleUpdate, { passive:true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('pageshow', scheduleUpdate);
    if (window.ResizeObserver) new window.ResizeObserver(scheduleUpdate).observe(article);
    updateActiveSection();
  }
  if (!window.mermaid) return;
  window.mermaid.initialize({
    startOnLoad:false,
    securityLevel:'strict',
    theme:'base',
    themeVariables:{
      fontFamily:'Manrope, sans-serif',
      primaryColor:'#eef5f5',
      primaryTextColor:'#0b4a51',
      primaryBorderColor:'#12707a',
      lineColor:'#12707a',
      secondaryColor:'#fff5da',
      tertiaryColor:'#f4f6f6'
    },
    flowchart:{ useMaxWidth:true, htmlLabels:false }
  });
  window.mermaid.run({ querySelector:'.cases-article .mermaid', suppressErrors:true });
})();