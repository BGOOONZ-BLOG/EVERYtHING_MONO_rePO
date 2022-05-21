(this.workbox = this.workbox || {}),
  (this.workbox.backgroundSync = (function (t, e, s) {
    "use strict";
    try {
      self["workbox:background-sync:4.3.1"] && _();
    } catch (t) {}
    const i = 3,
      n = "workbox-background-sync",
      a = "requests",
      r = "queueName";
    class c {
      constructor(t) {
        (this.t = t),
          (this.s = new s.DBWrapper(n, i, { onupgradeneeded: this.i }));
      }
      async pushEntry(t) {
        delete t.id, (t.queueName = this.t), await this.s.add(a, t);
      }
      async unshiftEntry(t) {
        const [e] = await this.s.getAllMatching(a, { count: 1 });
        e ? (t.id = e.id - 1) : delete t.id,
          (t.queueName = this.t),
          await this.s.add(a, t);
      }
      async popEntry() {
        return this.h({ direction: "prev" });
      }
      async shiftEntry() {
        return this.h({ direction: "next" });
      }
      async getAll() {
        return await this.s.getAllMatching(a, {
          index: r,
          query: IDBKeyRange.only(this.t),
        });
      }
      async deleteEntry(t) {
        await this.s.delete(a, t);
      }
      async h({ direction: t }) {
        const [e] = await this.s.getAllMatching(a, {
          direction: t,
          index: r,
          query: IDBKeyRange.only(this.t),
          count: 1,
        });
        if (e) return await this.deleteEntry(e.id), e;
      }
      i(t) {
        const e = t.target.result;
        t.oldVersion > 0 &&
          t.oldVersion < i &&
          e.objectStoreNames.contains(a) &&
          e.deleteObjectStore(a),
          e
            .createObjectStore(a, { autoIncrement: !0, keyPath: "id" })
            .createIndex(r, r, { unique: !1 });
      }
    }
    const h = [
      "method",
      "referrer",
      "referrerPolicy",
      "mode",
      "credentials",
      "cache",
      "redirect",
      "integrity",
      "keepalive",
    ];
    class o {
      static async fromRequest(t) {
        const e = { url: t.url, headers: {} };
        "GET" !== t.method && (e.body = await t.clone().arrayBuffer());
        for (const [s, i] of t.headers.entries()) e.headers[s] = i;
        for (const s of h) void 0 !== t[s] && (e[s] = t[s]);
        return new o(e);
      }
      constructor(t) {
        "navigate" === t.mode && (t.mode = "same-origin"), (this.o = t);
      }
      toObject() {
        const t = Object.assign({}, this.o);
        return (
          (t.headers = Object.assign({}, this.o.headers)),
          t.body && (t.body = t.body.slice(0)),
          t
        );
      }
      toRequest() {
        return new Request(this.o.url, this.o);
      }
      clone() {
        return new o(this.toObject());
      }
    }
    const u = "workbox-background-sync",
      y = 10080,
      w = new Set();
    class d {
      constructor(t, { onSync: s, maxRetentionTime: i } = {}) {
        if (w.has(t))
          throw new e.WorkboxError("duplicate-queue-name", { name: t });
        w.add(t),
          (this.u = t),
          (this.l = s || this.replayRequests),
          (this.q = i || y),
          (this.m = new c(this.u)),
          this.p();
      }
      get name() {
        return this.u;
      }
      async pushRequest(t) {
        await this.g(t, "push");
      }
      async unshiftRequest(t) {
        await this.g(t, "unshift");
      }
      async popRequest() {
        return this.R("pop");
      }
      async shiftRequest() {
        return this.R("shift");
      }
      async getAll() {
        const t = await this.m.getAll(),
          e = Date.now(),
          s = [];
        for (const i of t) {
          const t = 60 * this.q * 1e3;
          e - i.timestamp > t ? await this.m.deleteEntry(i.id) : s.push(f(i));
        }
        return s;
      }
      async g({ request: t, metadata: e, timestamp: s = Date.now() }, i) {
        const n = {
          requestData: (await o.fromRequest(t.clone())).toObject(),
          timestamp: s,
        };
        e && (n.metadata = e),
          await this.m[`${i}Entry`](n),
          this.k ? (this.D = !0) : await this.registerSync();
      }
      async R(t) {
        const e = Date.now(),
          s = await this.m[`${t}Entry`]();
        if (s) {
          const i = 60 * this.q * 1e3;
          return e - s.timestamp > i ? this.R(t) : f(s);
        }
      }
      async replayRequests() {
        let t;
        for (; (t = await this.shiftRequest()); )
          try {
            await fetch(t.request.clone());
          } catch (s) {
            throw (
              (await this.unshiftRequest(t),
              new e.WorkboxError("queue-replay-failed", { name: this.u }))
            );
          }
      }
      async registerSync() {
        if ("sync" in registration)
          try {
            await registration.sync.register(`${u}:${this.u}`);
          } catch (t) {}
      }
      p() {
        "sync" in registration
          ? self.addEventListener("sync", (t) => {
              if (t.tag === `${u}:${this.u}`) {
                const e = async () => {
                  let e;
                  this.k = !0;
                  try {
                    await this.l({ queue: this });
                  } catch (t) {
                    throw (e = t);
                  } finally {
                    !this.D ||
                      (e && !t.lastChance) ||
                      (await this.registerSync()),
                      (this.k = !1),
                      (this.D = !1);
                  }
                };
                t.waitUntil(e());
              }
            })
          : this.l({ queue: this });
      }
      static get _() {
        return w;
      }
    }
    const f = (t) => {
      const e = {
        request: new o(t.requestData).toRequest(),
        timestamp: t.timestamp,
      };
      return t.metadata && (e.metadata = t.metadata), e;
    };
    return (
      (t.Queue = d),
      (t.Plugin = class {
        constructor(...t) {
          (this.v = new d(...t)),
            (this.fetchDidFail = this.fetchDidFail.bind(this));
        }
        async fetchDidFail({ request: t }) {
          await this.v.pushRequest({ request: t });
        }
      }),
      t
    );
  })({}, workbox.core._private, workbox.core._private));
//# sourceMappingURL=workbox-background-sync.prod.js.map
