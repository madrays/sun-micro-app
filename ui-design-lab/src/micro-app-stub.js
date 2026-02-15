export class SunPanelWidgetElement {
  constructor() {
    this.spCtx = {
      widgetInfo: { gridSize: '2x2', config: {} },
      darkMode: false,
      api: {
        localCache: { app: { get: async () => null, set: async () => undefined } },
        network: { request: async () => ({}) },
        dataNode: {
          app: {
            getByKey: async () => null,
            setByKey: async () => undefined
          },
          user: {
            getByKey: async () => null,
            setByKey: async () => undefined
          }
        }
      }
    };
  }

  requestUpdate() {}
}

export class SunPanelPageElement {
  constructor() {
    this.spCtx = {
      darkMode: false,
      api: {
        widget: { save: async () => undefined },
        dataNode: {
          app: {
            getByKey: async () => null,
            setByKey: async () => undefined
          }
        }
      }
    };
  }

  requestUpdate() {}
}
