/**
 * الجداول اللي محتواها أعرض من مكانها بتتسحب بالعرض، ولازم تتسحب بالكيبورد كمان (WCAG 2.1.1 · قاعدة axe
 * `scrollable-region-focusable`). antd Table مبيدّيش خاصية الفوكس للـ`.ant-table-content`، فبنحط `tabindex=0` عليه لما يبقى
 * فعلًا بيتسحب بس (مش على كل جدول، عشان ميبقاش Tab Stop زيادة من غير لازمة). بيتراقب الـDOM بخفة (rAF).
 */
const SELECTOR = '.ant-table-content, .ant-table-body';

function sync() {
  for (const element of document.querySelectorAll<HTMLElement>(SELECTOR)) {
    const scrolls = element.scrollWidth > element.clientWidth + 1;
    if (scrolls && element.getAttribute('tabindex') !== '0') element.setAttribute('tabindex', '0');
    if (!scrolls && element.getAttribute('tabindex') === '0') element.removeAttribute('tabindex');
  }
}

export function watchScrollableTables() {
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(sync);
  };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', schedule);
  schedule();
}
