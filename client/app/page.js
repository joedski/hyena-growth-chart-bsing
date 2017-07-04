export function getPage() {
  const elements = {
    pageHeaderTitle: document.getElementById('page-header-title'),
    panelHeader: document.getElementById('chart-panel-header'),
    panelHeaderTitle: document.getElementById('chart-panel-header-title'),
    chartCanvas: document.getElementById('hyena-chart-canvas'),
    panelFooter: document.getElementById('chart-panel-footer'),
    pageFooter: document.getElementById('pageFooter'),
  };

  return {
    elements,

    chartCanvasId: 'hyena-chart-canvas',

    setTitle(nextTitle) {
      document.title = nextTitle;
      elements.pageHeaderTitle.innerText = nextTitle;
    },

    setPanelTitle(nextTitle) {
      elements.panelHeaderTitle.innerText = nextTitle;
    },

    setPanelFooterContent(html) {
      elements.panelFooter.innerHTML = html;
    },
  };
}
