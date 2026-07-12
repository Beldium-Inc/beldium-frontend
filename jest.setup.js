require("@testing-library/jest-dom");

// rc-component/form (used by antd Form) schedules watch notifications via
// MessageChannel, which jsdom doesn't implement. A minimal in-process shim
// (rather than node:worker_threads) avoids leaking real thread handles in tests.
if (typeof global.MessageChannel === "undefined") {
  class ShimMessagePort {
    onmessage = null;
    postMessage(data) {
      if (this._other && this._other.onmessage) {
        queueMicrotask(() => this._other.onmessage({ data }));
      }
    }
    close() {}
  }

  global.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = new ShimMessagePort();
      this.port2 = new ShimMessagePort();
      this.port1._other = this.port2;
      this.port2._other = this.port1;
    }
  };
}

// Ant Design components probe these browser APIs, which jsdom doesn't implement.
if (typeof window !== "undefined") {
  window.matchMedia =
    window.matchMedia ||
    function (query) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {
          return false;
        },
      };
    };

  global.ResizeObserver =
    global.ResizeObserver ||
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
}
