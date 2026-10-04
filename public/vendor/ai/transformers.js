var Hv = Object.defineProperty;
var Gr = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, {
  get: (t, r) => (typeof require < "u" ? require : t)[r]
}) : e)(function(e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var Qv = (e, t) => {
  for (var r in t)
    Hv(e, r, { get: t[r], enumerable: !0 });
};

// node_modules/onnxruntime-web/dist/ort.webgpu.bundle.min.mjs
var bo = {};
Qv(bo, {
  InferenceSession: () => ao,
  TRACE: () => Ka,
  TRACE_EVENT_BEGIN: () => Mr,
  TRACE_EVENT_END: () => kr,
  TRACE_FUNC_BEGIN: () => Hr,
  TRACE_FUNC_END: () => Qr,
  Tensor: () => Ot,
  default: () => Mx,
  env: () => Be,
  registerBackend: () => Wr
});
var ro = Object.defineProperty, Xv = Object.getOwnPropertyDescriptor, Yv = Object.getOwnPropertyNames, Jv = Object.prototype.hasOwnProperty, Zv = ((e) => typeof Gr < "u" ? Gr : typeof Proxy < "u" ? new Proxy(e, { get: (t, r) => (typeof Gr < "u" ? Gr : t)[r] }) : e)(function(e) {
  if (typeof Gr < "u") return Gr.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
}), me = (e, t, r) => () => {
  if (r) throw r[0];
  try {
    return e && (t = e(e = 0)), t;
  } catch (n) {
    throw r = [n], n;
  }
}, aa = (e, t) => {
  for (var r in t) ro(e, r, { get: t[r], enumerable: !0 });
}, Kv = (e, t, r, n) => {
  if (t && typeof t == "object" || typeof t == "function") for (let a of Yv(t)) !Jv.call(e, a) && a !== r && ro(e, a, { get: () => t[a], enumerable: !(n = Xv(t, a)) || n.enumerable });
  return e;
}, Za = (e) => Kv(ro({}, "__esModule", { value: !0 }), e), Jn, br, Wr, eh, Ch, Sh = me(() => {
  "use strict";
  Jn = /* @__PURE__ */ new Map(), br = [], Wr = (e, t, r) => {
    if (t && typeof t.init == "function" && typeof t.createInferenceSessionHandler == "function") {
      let n = Jn.get(e);
      if (n === void 0) Jn.set(e, { backend: t, priority: r });
      else {
        if (n.priority > r) return;
        if (n.priority === r && n.backend !== t) throw new Error(`cannot register backend "${e}" using priority ${r}`);
      }
      if (r >= 0) {
        let a = br.indexOf(e);
        a !== -1 && br.splice(a, 1);
        for (let s = 0; s < br.length; s++) if (Jn.get(br[s]).priority <= r) {
          br.splice(s, 0, e);
          return;
        }
        br.push(e);
      }
      return;
    }
    throw new TypeError("not a valid backend");
  }, eh = async (e) => {
    let t = Jn.get(e);
    if (!t) return "backend not found.";
    if (t.initialized) return t.backend;
    if (t.aborted) return t.error;
    {
      let r = !!t.initPromise;
      try {
        return r || (t.initPromise = t.backend.init(e)), await t.initPromise, t.initialized = !0, t.backend;
      } catch (n) {
        return r || (t.error = `${n}`, t.aborted = !0), t.error;
      } finally {
        delete t.initPromise;
      }
    }
  }, Ch = async (e) => {
    let t = e.executionProviders || [], r = t.map((l) => typeof l == "string" ? l : l.name), n = r.length === 0 ? br : r, a, s = [], i = /* @__PURE__ */ new Set();
    for (let l of n) {
      let c = await eh(l);
      typeof c == "string" ? s.push({ name: l, err: c }) : (a || (a = c), a === c && i.add(l));
    }
    if (!a) throw new Error(`no available backend found. ERR: ${s.map((l) => `[${l.name}] ${l.err}`).join(", ")}`);
    for (let { name: l, err: c } of s) r.includes(l) && console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${c}`);
    let o = t.filter((l) => i.has(typeof l == "string" ? l : l.name));
    return [a, new Proxy(e, { get: (l, c) => c === "executionProviders" ? o : Reflect.get(l, c) })];
  };
}), ex = me(() => {
  "use strict";
  Sh();
}), Ph, tx = me(() => {
  "use strict";
  Ph = "1.31.0-dev.20260911-2a43ec07e";
}), Fi, Ke, Fh = me(() => {
  "use strict";
  tx(), Fi = "warning", Ke = { wasm: {}, webgl: {}, webgpu: {}, versions: { common: Ph }, set logLevel(e) {
    if (e !== void 0) {
      if (typeof e != "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(e) === -1) throw new Error(`Unsupported logging level: ${e}`);
      Fi = e;
    }
  }, get logLevel() {
    return Fi;
  } }, Object.defineProperty(Ke, "logLevel", { enumerable: !0 });
}), Be, rx = me(() => {
  "use strict";
  Fh(), Be = Ke;
}), Ih, Lh, nx = me(() => {
  "use strict";
  Ih = (e, t) => {
    let r = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
    r.width = e.dims[3], r.height = e.dims[2];
    let n = r.getContext("2d");
    if (n != null) {
      let a, s;
      t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (a = e.dims[2], s = e.dims[3]) : (a = e.dims[3], s = e.dims[2]);
      let i = t?.format !== void 0 ? t.format : "RGB", o = t?.norm, l, c;
      o === void 0 || o.mean === void 0 ? l = [255, 255, 255, 255] : typeof o.mean == "number" ? l = [o.mean, o.mean, o.mean, o.mean] : (l = [o.mean[0], o.mean[1], o.mean[2], 0], o.mean[3] !== void 0 && (l[3] = o.mean[3])), o === void 0 || o.bias === void 0 ? c = [0, 0, 0, 0] : typeof o.bias == "number" ? c = [o.bias, o.bias, o.bias, o.bias] : (c = [o.bias[0], o.bias[1], o.bias[2], 0], o.bias[3] !== void 0 && (c[3] = o.bias[3]));
      let p = s * a, d = 0, _ = p, f = p * 2, w = -1;
      i === "RGBA" ? (d = 0, _ = p, f = p * 2, w = p * 3) : i === "RGB" ? (d = 0, _ = p, f = p * 2) : i === "RBG" && (d = 0, f = p, _ = p * 2);
      for (let y = 0; y < s; y++) for (let b = 0; b < a; b++) {
        let x = (e.data[d++] - c[0]) * l[0], T = (e.data[_++] - c[1]) * l[1], A = (e.data[f++] - c[2]) * l[2], E = w === -1 ? 255 : (e.data[w++] - c[3]) * l[3];
        n.fillStyle = "rgba(" + x + "," + T + "," + A + "," + E + ")", n.fillRect(b, y, 1, 1);
      }
      if ("toDataURL" in r) return r.toDataURL();
      throw new Error("toDataURL is not supported");
    } else throw new Error("Can not access image data");
  }, Lh = (e, t) => {
    let r = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), n;
    if (r != null) {
      let a, s, i;
      t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (a = e.dims[2], s = e.dims[1], i = e.dims[3]) : (a = e.dims[3], s = e.dims[2], i = e.dims[1]);
      let o = t !== void 0 && t.format !== void 0 ? t.format : "RGB", l = t?.norm, c, p;
      l === void 0 || l.mean === void 0 ? c = [255, 255, 255, 255] : typeof l.mean == "number" ? c = [l.mean, l.mean, l.mean, l.mean] : (c = [l.mean[0], l.mean[1], l.mean[2], 255], l.mean[3] !== void 0 && (c[3] = l.mean[3])), l === void 0 || l.bias === void 0 ? p = [0, 0, 0, 0] : typeof l.bias == "number" ? p = [l.bias, l.bias, l.bias, l.bias] : (p = [l.bias[0], l.bias[1], l.bias[2], 0], l.bias[3] !== void 0 && (p[3] = l.bias[3]));
      let d = s * a;
      if (t !== void 0 && (t.format !== void 0 && i === 4 && t.format !== "RGBA" || i === 3 && t.format !== "RGB" && t.format !== "BGR")) throw new Error("Tensor format doesn't match input tensor dims");
      let _ = 4, f = 0, w = 1, y = 2, b = 3, x = 0, T = d, A = d * 2, E = -1;
      o === "RGBA" ? (x = 0, T = d, A = d * 2, E = d * 3) : o === "RGB" ? (x = 0, T = d, A = d * 2) : o === "RBG" && (x = 0, A = d, T = d * 2), n = r.createImageData(a, s);
      for (let S = 0; S < s * a; f += _, w += _, y += _, b += _, S++) n.data[f] = (e.data[x++] - p[0]) * c[0], n.data[w] = (e.data[T++] - p[1]) * c[1], n.data[y] = (e.data[A++] - p[2]) * c[2], n.data[b] = E === -1 ? 255 : (e.data[E++] - p[3]) * c[3];
    } else throw new Error("Can not access image data");
    return n;
  };
}), Wa, Oh, zh, Nh, Bh, $h, ax = me(() => {
  "use strict";
  no(), Wa = (e, t) => {
    if (e === void 0) throw new Error("Image buffer must be defined");
    if (t.height === void 0 || t.width === void 0) throw new Error("Image height and width must be defined");
    if (t.tensorLayout === "NHWC") throw new Error("NHWC Tensor layout is not supported yet");
    let { height: r, width: n } = t, a = t.norm ?? { mean: 255, bias: 0 }, s, i;
    typeof a.mean == "number" ? s = [a.mean, a.mean, a.mean, a.mean] : s = [a.mean[0], a.mean[1], a.mean[2], a.mean[3] ?? 255], typeof a.bias == "number" ? i = [a.bias, a.bias, a.bias, a.bias] : i = [a.bias[0], a.bias[1], a.bias[2], a.bias[3] ?? 0];
    let o = t.format !== void 0 ? t.format : "RGBA", l = t.tensorFormat !== void 0 && t.tensorFormat !== void 0 ? t.tensorFormat : "RGB", c = r * n, p = l === "RGBA" ? new Float32Array(c * 4) : new Float32Array(c * 3), d = 4, _ = 0, f = 1, w = 2, y = 3, b = 0, x = c, T = c * 2, A = -1;
    o === "RGB" && (d = 3, _ = 0, f = 1, w = 2, y = -1), l === "RGBA" ? A = c * 3 : l === "RBG" ? (b = 0, T = c, x = c * 2) : l === "BGR" && (T = 0, x = c, b = c * 2);
    for (let E = 0; E < c; E++, _ += d, w += d, f += d, y += d) p[b++] = (e[_] + i[0]) / s[0], p[x++] = (e[f] + i[1]) / s[1], p[T++] = (e[w] + i[2]) / s[2], A !== -1 && y !== -1 && (p[A++] = (e[y] + i[3]) / s[3]);
    return l === "RGBA" ? new vt("float32", p, [1, 4, r, n]) : new vt("float32", p, [1, 3, r, n]);
  }, Oh = async (e, t) => {
    let r = typeof HTMLImageElement < "u" && e instanceof HTMLImageElement, n = typeof ImageData < "u" && e instanceof ImageData, a = typeof ImageBitmap < "u" && e instanceof ImageBitmap, s = typeof e == "string", i, o = t ?? {}, l = () => {
      if (typeof document < "u") return document.createElement("canvas");
      if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(1, 1);
      throw new Error("Canvas is not supported");
    }, c = (p) => typeof HTMLCanvasElement < "u" && p instanceof HTMLCanvasElement || p instanceof OffscreenCanvas ? p.getContext("2d") : null;
    if (r) {
      let p = l();
      p.width = e.width, p.height = e.height;
      let d = c(p);
      if (d != null) {
        let _ = e.height, f = e.width;
        if (t !== void 0 && t.resizedHeight !== void 0 && t.resizedWidth !== void 0 && (_ = t.resizedHeight, f = t.resizedWidth), t !== void 0) {
          if (o = t, t.tensorFormat !== void 0) throw new Error("Image input config format must be RGBA for HTMLImageElement");
          o.tensorFormat = "RGBA", o.height = _, o.width = f;
        } else o.tensorFormat = "RGBA", o.height = _, o.width = f;
        d.drawImage(e, 0, 0), i = d.getImageData(0, 0, f, _).data;
      } else throw new Error("Can not access image data");
    } else if (n) {
      let p, d;
      if (t !== void 0 && t.resizedWidth !== void 0 && t.resizedHeight !== void 0 ? (p = t.resizedHeight, d = t.resizedWidth) : (p = e.height, d = e.width), t !== void 0 && (o = t), o.format = "RGBA", o.height = p, o.width = d, t !== void 0) {
        let _ = l();
        _.width = d, _.height = p;
        let f = c(_);
        if (f != null) f.putImageData(e, 0, 0), i = f.getImageData(0, 0, d, p).data;
        else throw new Error("Can not access image data");
      } else i = e.data;
    } else if (a) {
      if (t === void 0) throw new Error("Please provide image config with format for Imagebitmap");
      let p = l();
      p.width = e.width, p.height = e.height;
      let d = c(p);
      if (d != null) {
        let _ = e.height, f = e.width;
        return d.drawImage(e, 0, 0, f, _), i = d.getImageData(0, 0, f, _).data, o.height = _, o.width = f, Wa(i, o);
      } else throw new Error("Can not access image data");
    } else {
      if (s) return new Promise((p, d) => {
        let _ = l(), f = c(_);
        if (!e || !f) return d();
        let w = new Image();
        w.crossOrigin = "Anonymous", w.src = e, w.onload = () => {
          _.width = w.width, _.height = w.height, f.drawImage(w, 0, 0, _.width, _.height);
          let y = f.getImageData(0, 0, _.width, _.height);
          o.height = _.height, o.width = _.width, p(Wa(y.data, o));
        };
      });
      throw new Error("Input data provided is not supported - aborted tensor creation");
    }
    if (i !== void 0) return Wa(i, o);
    throw new Error("Input data provided is not supported - aborted tensor creation");
  }, zh = (e, t) => {
    let { width: r, height: n, download: a, dispose: s } = t, i = [1, n, r, 4];
    return new vt({ location: "texture", type: "float32", texture: e, dims: i, download: a, dispose: s });
  }, Nh = (e, t) => {
    let { dataType: r, dims: n, download: a, dispose: s } = t;
    return new vt({ location: "gpu-buffer", type: r ?? "float32", gpuBuffer: e, dims: n, download: a, dispose: s });
  }, Bh = (e, t) => {
    let { dataType: r, dims: n, download: a, dispose: s } = t;
    return new vt({ location: "ml-tensor", type: r ?? "float32", mlTensor: e, dims: n, download: a, dispose: s });
  }, $h = (e, t, r) => new vt({ location: "cpu-pinned", type: e, data: t, dims: r ?? [t.length] });
}), qr, ra, Ii, Dh, sx = me(() => {
  "use strict";
  qr = /* @__PURE__ */ new Map([["float32", Float32Array], ["uint8", Uint8Array], ["int8", Int8Array], ["uint16", Uint16Array], ["int16", Int16Array], ["int32", Int32Array], ["bool", Uint8Array], ["float64", Float64Array], ["uint32", Uint32Array], ["int4", Uint8Array], ["uint4", Uint8Array]]), ra = /* @__PURE__ */ new Map([[Float32Array, "float32"], [Uint8Array, "uint8"], [Int8Array, "int8"], [Uint16Array, "uint16"], [Int16Array, "int16"], [Int32Array, "int32"], [Float64Array, "float64"], [Uint32Array, "uint32"]]), Ii = !1, Dh = () => {
    if (!Ii) {
      Ii = !0;
      let e = typeof BigInt64Array < "u" && BigInt64Array.from, t = typeof BigUint64Array < "u" && BigUint64Array.from, r = globalThis.Float16Array, n = typeof r < "u" && r.from;
      e && (qr.set("int64", BigInt64Array), ra.set(BigInt64Array, "int64")), t && (qr.set("uint64", BigUint64Array), ra.set(BigUint64Array, "uint64")), n ? (qr.set("float16", r), ra.set(r, "float16")) : qr.set("float16", Uint16Array);
    }
  };
}), Rh, Gh, ix = me(() => {
  "use strict";
  no(), Rh = (e) => {
    let t = 1;
    for (let r = 0; r < e.length; r++) {
      let n = e[r];
      if (typeof n != "number" || !Number.isSafeInteger(n)) throw new TypeError(`dims[${r}] must be an integer, got: ${n}`);
      if (n < 0) throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${n}`);
      t *= n;
    }
    return t;
  }, Gh = (e, t) => {
    switch (e.location) {
      case "cpu":
        return new vt(e.type, e.data, t);
      case "cpu-pinned":
        return new vt({ location: "cpu-pinned", data: e.data, type: e.type, dims: t });
      case "texture":
        return new vt({ location: "texture", texture: e.texture, type: e.type, dims: t });
      case "gpu-buffer":
        return new vt({ location: "gpu-buffer", gpuBuffer: e.gpuBuffer, type: e.type, dims: t });
      case "ml-tensor":
        return new vt({ location: "ml-tensor", mlTensor: e.mlTensor, type: e.type, dims: t });
      default:
        throw new Error(`tensorReshape: tensor location ${e.location} is not supported`);
    }
  };
}), vt, no = me(() => {
  "use strict";
  nx(), ax(), sx(), ix(), vt = class {
    constructor(e, t, r) {
      Dh();
      let n, a;
      if (typeof e == "object" && "location" in e) switch (this.dataLocation = e.location, n = e.type, a = e.dims, e.location) {
        case "cpu-pinned": {
          let i = qr.get(n);
          if (!i) throw new TypeError(`unsupported type "${n}" to create tensor from pinned buffer`);
          if (!(e.data instanceof i)) throw new TypeError(`buffer should be of type ${i.name}`);
          this.cpuData = e.data;
          break;
        }
        case "texture": {
          if (n !== "float32") throw new TypeError(`unsupported type "${n}" to create tensor from texture`);
          this.gpuTextureData = e.texture, this.downloader = e.download, this.disposer = e.dispose;
          break;
        }
        case "gpu-buffer": {
          if (n !== "float32" && n !== "float16" && n !== "int32" && n !== "int64" && n !== "uint32" && n !== "uint8" && n !== "bool" && n !== "uint4" && n !== "int4") throw new TypeError(`unsupported type "${n}" to create tensor from gpu buffer`);
          this.gpuBufferData = e.gpuBuffer, this.downloader = e.download, this.disposer = e.dispose;
          break;
        }
        case "ml-tensor": {
          if (n !== "float32" && n !== "float16" && n !== "int32" && n !== "int64" && n !== "uint32" && n !== "uint64" && n !== "int8" && n !== "uint8" && n !== "bool" && n !== "uint4" && n !== "int4") throw new TypeError(`unsupported type "${n}" to create tensor from MLTensor`);
          this.mlTensorData = e.mlTensor, this.downloader = e.download, this.disposer = e.dispose;
          break;
        }
        default:
          throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
      }
      else {
        let i, o;
        if (typeof e == "string") if (n = e, o = r, e === "string") {
          if (!Array.isArray(t)) throw new TypeError("A string tensor's data must be a string array.");
          i = t;
        } else {
          let l = qr.get(e);
          if (l === void 0) throw new TypeError(`Unsupported tensor type: ${e}.`);
          if (Array.isArray(t)) {
            if (e === "float16" && l === Uint16Array || e === "uint4" || e === "int4") throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`);
            e === "uint64" || e === "int64" ? i = l.from(t, BigInt) : i = l.from(t);
          } else if (t instanceof l) i = t;
          else if (t instanceof Uint8ClampedArray) if (e === "uint8") i = Uint8Array.from(t);
          else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");
          else if (e === "float16" && t instanceof Uint16Array && l !== Uint16Array) i = new globalThis.Float16Array(t.buffer, t.byteOffset, t.length);
          else throw new TypeError(`A ${n} tensor's data must be type of ${l}`);
        }
        else if (o = t, Array.isArray(e)) {
          if (e.length === 0) throw new TypeError("Tensor type cannot be inferred from an empty array.");
          let l = typeof e[0];
          if (l === "string") n = "string", i = e;
          else if (l === "boolean") n = "bool", i = Uint8Array.from(e);
          else throw new TypeError(`Invalid element type of data array: ${l}.`);
        } else if (e instanceof Uint8ClampedArray) n = "uint8", i = Uint8Array.from(e);
        else {
          let l = ra.get(e.constructor);
          if (l === void 0) throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);
          n = l, i = e;
        }
        if (o === void 0) o = [i.length];
        else if (!Array.isArray(o)) throw new TypeError("A tensor's dims must be a number array");
        a = o, this.cpuData = i, this.dataLocation = "cpu";
      }
      let s = Rh(a);
      if (this.cpuData && s !== this.cpuData.length && !((n === "uint4" || n === "int4") && Math.ceil(s / 2) === this.cpuData.length)) throw new Error(`Tensor's size(${s}) does not match data length(${this.cpuData.length}).`);
      this.type = n, this.dims = a, this.size = s;
    }
    static async fromImage(e, t) {
      return Oh(e, t);
    }
    static fromTexture(e, t) {
      return zh(e, t);
    }
    static fromGpuBuffer(e, t) {
      return Nh(e, t);
    }
    static fromMLTensor(e, t) {
      return Bh(e, t);
    }
    static fromPinnedBuffer(e, t, r) {
      return $h(e, t, r);
    }
    toDataURL(e) {
      return Ih(this, e);
    }
    toImageData(e) {
      return Lh(this, e);
    }
    get data() {
      if (this.ensureValid(), !this.cpuData) throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
      return this.cpuData;
    }
    get location() {
      return this.dataLocation;
    }
    get texture() {
      if (this.ensureValid(), !this.gpuTextureData) throw new Error("The data is not stored as a WebGL texture.");
      return this.gpuTextureData;
    }
    get gpuBuffer() {
      if (this.ensureValid(), !this.gpuBufferData) throw new Error("The data is not stored as a WebGPU buffer.");
      return this.gpuBufferData;
    }
    get mlTensor() {
      if (this.ensureValid(), !this.mlTensorData) throw new Error("The data is not stored as a WebNN MLTensor.");
      return this.mlTensorData;
    }
    async getData(e) {
      switch (this.ensureValid(), this.dataLocation) {
        case "cpu":
        case "cpu-pinned":
          return this.data;
        case "texture":
        case "gpu-buffer":
        case "ml-tensor": {
          if (!this.downloader) throw new Error("The current tensor is not created with a specified data downloader.");
          if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
          try {
            this.isDownloading = !0;
            let t = await this.downloader();
            return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = t, e && this.disposer && (this.disposer(), this.disposer = void 0), t;
          } finally {
            this.isDownloading = !1;
          }
        }
        default:
          throw new Error(`cannot get data from location: ${this.dataLocation}`);
      }
    }
    dispose() {
      if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
      this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.mlTensorData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
    }
    ensureValid() {
      if (this.dataLocation === "none") throw new Error("The tensor is disposed.");
    }
    reshape(e) {
      if (this.ensureValid(), this.downloader || this.disposer) throw new Error("Cannot reshape a tensor that owns GPU resource.");
      return Gh(this, e);
    }
  };
}), Ot, Vh = me(() => {
  "use strict";
  no(), Ot = vt;
}), Ka, Li, Hr, Qr, Mr, kr, Uh = me(() => {
  "use strict";
  Fh(), Ka = (e, t) => {
    (typeof Ke.trace > "u" ? !Ke.wasm.trace : !Ke.trace) || console.timeStamp(`${e}::ORT::${t}`);
  }, Li = (e, t) => {
    let r = new Error().stack?.split(/\r\n|\r|\n/g) || [], n = !1;
    for (let a = 0; a < r.length; a++) {
      if (n && !r[a].includes("TRACE_FUNC")) {
        let s = `FUNC_${e}::${r[a].trim().split(" ")[1]}`;
        t && (s += `::${t}`), Ka("CPU", s);
        return;
      }
      r[a].includes("TRACE_FUNC") && (n = !0);
    }
  }, Hr = (e) => {
    (typeof Ke.trace > "u" ? !Ke.wasm.trace : !Ke.trace) || Li("BEGIN", e);
  }, Qr = (e) => {
    (typeof Ke.trace > "u" ? !Ke.wasm.trace : !Ke.trace) || Li("END", e);
  }, Mr = (e) => {
    (typeof Ke.trace > "u" ? !Ke.wasm.trace : !Ke.trace) || console.time(`ORT::${e}`);
  }, kr = (e) => {
    (typeof Ke.trace > "u" ? !Ke.wasm.trace : !Ke.trace) || console.timeEnd(`ORT::${e}`);
  };
}), qh, ox = me(() => {
  "use strict";
  Sh(), Vh(), Uh(), qh = class jh {
    constructor(t) {
      this.handler = t;
    }
    async run(t, r, n) {
      Hr(), Mr("InferenceSession.run");
      let a = {}, s = {};
      if (typeof t != "object" || t === null || t instanceof Ot || Array.isArray(t)) throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
      let i = !0;
      if (typeof r == "object") {
        if (r === null) throw new TypeError("Unexpected argument[1]: cannot be null.");
        if (r instanceof Ot) throw new TypeError("'fetches' cannot be a Tensor");
        if (Array.isArray(r)) {
          if (r.length === 0) throw new TypeError("'fetches' cannot be an empty array.");
          i = !1;
          for (let c of r) {
            if (typeof c != "string") throw new TypeError("'fetches' must be a string array or an object.");
            if (this.outputNames.indexOf(c) === -1) throw new RangeError(`'fetches' contains invalid output name: ${c}.`);
            a[c] = null;
          }
          if (typeof n == "object" && n !== null) s = n;
          else if (typeof n < "u") throw new TypeError("'options' must be an object.");
        } else {
          let c = !1, p = Object.getOwnPropertyNames(r);
          for (let d of this.outputNames) if (p.indexOf(d) !== -1) {
            let _ = r[d];
            (_ === null || _ instanceof Ot) && (c = !0, i = !1, a[d] = _);
          }
          if (c) {
            if (typeof n == "object" && n !== null) s = n;
            else if (typeof n < "u") throw new TypeError("'options' must be an object.");
          } else s = r;
        }
      } else if (typeof r < "u") throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
      for (let c of this.inputNames) if (typeof t[c] > "u") throw new Error(`input '${c}' is missing in 'feeds'.`);
      if (i) for (let c of this.outputNames) a[c] = null;
      let o = await this.handler.run(t, a, s), l = {};
      for (let c in o) if (Object.hasOwnProperty.call(o, c)) {
        let p = o[c];
        p instanceof Ot ? l[c] = p : l[c] = new Ot(p.type, p.data, p.dims);
      }
      return kr("InferenceSession.run"), Qr(), l;
    }
    async release() {
      return this.handler.dispose();
    }
    static async create(t, r, n, a) {
      Hr(), Mr("InferenceSession.create");
      let s, i = {};
      if (typeof t == "string") {
        if (s = t, typeof r == "object" && r !== null) i = r;
        else if (typeof r < "u") throw new TypeError("'options' must be an object.");
      } else if (t instanceof Uint8Array) {
        if (s = t, typeof r == "object" && r !== null) i = r;
        else if (typeof r < "u") throw new TypeError("'options' must be an object.");
      } else if (t instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && t instanceof SharedArrayBuffer) {
        let p = t, d = 0, _ = t.byteLength;
        if (typeof r == "object" && r !== null) i = r;
        else if (typeof r == "number") {
          if (d = r, !Number.isSafeInteger(d)) throw new RangeError("'byteOffset' must be an integer.");
          if (d < 0 || d >= p.byteLength) throw new RangeError(`'byteOffset' is out of range [0, ${p.byteLength}).`);
          if (_ = t.byteLength - d, typeof n == "number") {
            if (_ = n, !Number.isSafeInteger(_)) throw new RangeError("'byteLength' must be an integer.");
            if (_ <= 0 || d + _ > p.byteLength) throw new RangeError(`'byteLength' is out of range (0, ${p.byteLength - d}].`);
            if (typeof a == "object" && a !== null) i = a;
            else if (typeof a < "u") throw new TypeError("'options' must be an object.");
          } else if (typeof n < "u") throw new TypeError("'byteLength' must be a number.");
        } else if (typeof r < "u") throw new TypeError("'options' must be an object.");
        s = new Uint8Array(p, d, _);
      } else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
      let [o, l] = await Ch(i), c = await o.createInferenceSessionHandler(s, l);
      return kr("InferenceSession.create"), Qr(), new jh(c);
    }
    startProfiling() {
      this.handler.startProfiling();
    }
    endProfiling() {
      this.handler.endProfiling();
    }
    get inputNames() {
      return this.handler.inputNames;
    }
    get outputNames() {
      return this.handler.outputNames;
    }
    get inputMetadata() {
      return this.handler.inputMetadata;
    }
    get outputMetadata() {
      return this.handler.outputMetadata;
    }
  };
}), ao, lx = me(() => {
  "use strict";
  ox(), ao = qh;
}), cx = me(() => {
  "use strict";
}), ux = me(() => {
  "use strict";
}), dx = me(() => {
  "use strict";
}), px = me(() => {
  "use strict";
}), Wh = {};
aa(Wh, { InferenceSession: () => ao, TRACE: () => Ka, TRACE_EVENT_BEGIN: () => Mr, TRACE_EVENT_END: () => kr, TRACE_FUNC_BEGIN: () => Hr, TRACE_FUNC_END: () => Qr, Tensor: () => Ot, env: () => Be, registerBackend: () => Wr });
var Xr = me(() => {
  "use strict";
  ex(), rx(), lx(), Vh(), cx(), ux(), Uh(), dx(), px();
}), so = me(() => {
  "use strict";
}), Hh = {};
aa(Hh, { default: () => Qh });
var Oi, zi, Qh, hx = me(() => {
  "use strict";
  c_(), Yr(), io(), Oi = "ort-wasm-proxy-worker", zi = globalThis.self?.name === Oi, zi && (self.onmessage = (e) => {
    let { type: t, in: r } = e.data;
    try {
      switch (t) {
        case "init-wasm":
          oo(r.wasm).then(() => {
            ho(r).then(() => {
              postMessage({ type: t });
            }, (n) => {
              postMessage({ type: t, err: n });
            });
          }, (n) => {
            postMessage({ type: t, err: n });
          });
          break;
        case "init-ep": {
          let { epName: n, env: a } = r;
          _o(a, n).then(() => {
            postMessage({ type: t });
          }, (s) => {
            postMessage({ type: t, err: s });
          });
          break;
        }
        case "copy-from": {
          let { buffer: n } = r, a = rs(n);
          postMessage({ type: t, out: a });
          break;
        }
        case "create": {
          let { model: n, options: a } = r;
          fo(n, a).then((s) => {
            postMessage({ type: t, out: s });
          }, (s) => {
            postMessage({ type: t, err: s });
          });
          break;
        }
        case "release":
          mo(r), postMessage({ type: t });
          break;
        case "run": {
          let { sessionId: n, inputIndices: a, inputs: s, outputIndices: i, options: o } = r;
          go(n, a, s, i, new Array(i.length).fill(null), o).then((l) => {
            l.some((c) => c[3] !== "cpu") ? postMessage({ type: t, err: "Proxy does not support non-cpu tensor location." }) : postMessage({ type: t, out: l }, yo([...s, ...l]));
          }, (l) => {
            postMessage({ type: t, err: l });
          });
          break;
        }
        case "end-profiling":
          wo(r), postMessage({ type: t });
          break;
        default:
      }
    } catch (n) {
      postMessage({ type: t, err: n });
    }
  }), Qh = zi ? null : (e) => new Worker(e ?? yt, { type: "module", name: Oi });
}), Xh = {};
aa(Xh, { default: () => Yh });
async function th(e = {}) {
  var t = e, r = !!globalThis.window, n = !!globalThis.WorkerGlobalScope, a = n && self.name?.startsWith("em-pthread");
  t.mountExternalData = (u, h) => {
    u.startsWith("./") && (u = u.substring(2)), (t.ed || (t.ed = /* @__PURE__ */ new Map())).set(u, h);
  }, t.unmountExternalData = () => {
    delete t.ed, delete t.Te, delete t.Se, delete t.Ue;
  }, globalThis.SharedArrayBuffer ?? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: !0 }).buffer.constructor;
  let s = () => {
    let u = (h) => (...m) => {
      let g = Qt;
      return m = h(...m), Qt != g ? new Promise((v, k) => {
        hi = { resolve: v, reject: k };
      }) : m;
    };
    (() => {
      for (let h of ["_OrtAppendExecutionProvider", "_OrtCreateSession", "_OrtRun", "_OrtRunWithBinding", "_OrtBindInput"]) t[h] = u(t[h]);
    })(), typeof jsepRunAsync < "u" && (t._OrtRun = jsepRunAsync(t._OrtRun), t._OrtRunWithBinding = jsepRunAsync(t._OrtRunWithBinding)), s = void 0;
  };
  t.asyncInit = () => {
    s?.();
  };
  var i, o, l = (u, h) => {
    throw h;
  }, c = import.meta.url, p = "";
  if (r || n) {
    try {
      p = new URL(".", c).href;
    } catch {
    }
    n && (o = (u) => {
      var h = new XMLHttpRequest();
      return h.open("GET", u, !1), h.responseType = "arraybuffer", h.send(null), new Uint8Array(h.response);
    }), i = async (u) => {
      if (O(u)) return new Promise((m, g) => {
        var v = new XMLHttpRequest();
        v.open("GET", u, !0), v.responseType = "arraybuffer", v.onload = () => {
          v.status == 200 || v.status == 0 && v.response ? m(v.response) : g(v.status);
        }, v.onerror = g, v.send(null);
      });
      var h = await fetch(u, { credentials: "same-origin" });
      if (h.ok) return h.arrayBuffer();
      throw Error(h.status + " : " + h.url);
    };
  }
  var d, _, f, w, y, b, x = console.log.bind(console), T = console.error.bind(console), A = x, E = T, S = !1, O = (u) => u.startsWith("file://");
  function M() {
    wr.buffer != U.buffer && R();
  }
  if (a) {
    let u = function(h) {
      try {
        var m = h.data, g = m.$c;
        if (g === "load") {
          let v = [];
          self.onmessage = (k) => v.push(k), b = () => {
            postMessage({ $c: "loaded" });
            for (let k of v) u(k);
            self.onmessage = u;
          };
          for (let k of m.ue) t[k] && !t[k].proxy || (t[k] = (...F) => {
            postMessage({ $c: "callHandler", te: k, args: F });
          }, k == "print" && (A = t[k]), k == "printErr" && (E = t[k]));
          wr = m.Me, R(), _ = m.Ne, Me(), ja();
        } else if (g === "run") {
          (function(v) {
            var k = (M(), C)[v + 52 >>> 2 >>> 0];
            v = (M(), C)[v + 56 >>> 2 >>> 0], lp(k, k - v), ee(k);
          })(m.Xc), Ti(m.Xc, 0, 0, 1, 0, 0), Vu(), ui(m.Xc), D || (Ud(), D = !0);
          try {
            By(m.ze, m.kd);
          } catch (v) {
            if (v != "unwind") throw v;
          }
        } else m.target !== "setimmediate" && (g === "checkMailbox" ? D && za() : g && (E(`worker: received unknown command ${g}`), E(m)));
      } catch (v) {
        throw np(), v;
      }
    };
    var G = u, D = !1;
    self.onunhandledrejection = (h) => {
      throw h.reason || h;
    }, self.onmessage = u;
  }
  var U, q, H, Q, $, C, ae, ge, J, oe, L, N = !1;
  function R() {
    var u = wr.buffer;
    t.HEAP8 = U = new Int8Array(u), H = new Int16Array(u), t.HEAPU8 = q = new Uint8Array(u), Q = new Uint16Array(u), t.HEAP32 = $ = new Int32Array(u), t.HEAPU32 = C = new Uint32Array(u), ae = new Float32Array(u), ge = new Float64Array(u), J = new BigInt64Array(u), oe = new BigUint64Array(u);
  }
  function K() {
    N = !0, a ? b() : ur.hc();
  }
  function le(u) {
    throw E(u = "Aborted(" + u + ")"), S = !0, u = new WebAssembly.RuntimeError(u + ". Build with -sASSERTIONS for more info."), y?.(u), u;
  }
  function je() {
    return { a: { qa: ov, f: $y, K: Dy, k: Ry, p: Gy, l: Vy, fa: Uy, b: qy, da: jy, gc: Qu, q: Wy, ea: Zu, Ua: Ku, cc: ed, ec: td, Va: rd, Sa: nd, La: ad, Ra: sd, oa: id, dc: od, ac: ld, Ta: cd, bc: ud, _a: Hy, Ba: Xy, Xb: Yy, Vb: Zy, Aa: e0, O: t0, J: r0, Wb: n0, ka: u0, Yb: d0, Oa: p0, _b: _0, Ea: f0, Tb: m0, Ca: g0, Na: ui, Xa: w0, U: x0, n: A0, c: li, qb: C0, w: S0, N: P0, A: F0, j: I0, o: wd, rb: L0, H: O0, T: z0, g: N0, u: B0, m: $0, i: D0, Ia: R0, Ja: G0, Ka: V0, Ga: xd, Ha: Md, Ub: kd, ab: q0, Za: H0, Z: Q0, pb: X0, Da: Y0, Ya: j0, X: J0, Wa: Z0, $b: K0, G: U0, db: eb, _: tb, pa: Ra, Zb: nb, cb: rb, bb: ab, lb: gb, z: wb, sa: yb, ra: bb, nb: vb, Y: xb, v: Mb, kb, jb: Tb, ib: Eb, mb: Ab, gb: Cb, fb: Sb, eb: Pb, Pa: zd, Qa: Nd, fc: ni, W: Bd, Fa: $d, ma: Dd, Ma: Rd, la: Gd, Fb: jv, va: Dv, Gb: qv, wa: $v, E: Tv, e: dv, r: cv, x: lv, C: vv, Ib: zv, ca: Ov, D: _v, xa: Nv, aa: Rv, ha: Lv, Jb: Iv, Kb: Fv, za: Av, Lb: Sv, ya: Pv, Mb: Cv, ua: Uv, ba: Bv, d: uv, B: hv, s: pv, Eb: Wv, t: mv, y: Mv, F: fv, I: gv, L: kv, Nb: Ev, R: Gv, ia: bv, $: Vv, Pb: yv, Rb: wv, Ob: xv, h: Ib, a: wr, $a: on, Hb: Lb, V: Ob, M: zb, na: Nb, Db: Bb, ja: $b, S: Db, Ab: Rb, Bb: Gb, vb: Vb, wb: Ub, P: qb, xb: jb, yb: Wb, ta: Hb, Sb: Qb, ob: Xb, Q: Yb, hb: Jb, Cb: Zb, sb: Kb, tb: tv, ub: rv, ga: nv, zb: av, Qb: sv } };
  }
  async function Me() {
    function u(g, v) {
      var k = ur = g.exports;
      g = {};
      for (let [F, P] of Object.entries(k)) typeof P == "function" ? (k = y0(P), g[F] = k) : g[F] = P;
      return ur = g, ur = (function() {
        var F = ur, P = (j) => (de) => j(de) >>> 0, z = (j) => () => j() >>> 0;
        return (F = Object.assign({}, F)).ic = P(F.ic), F.Nc = z(F.Nc), F.Pc = P(F.Pc), F.Bd = /* @__PURE__ */ ((j) => (de, _e) => j(de, _e) >>> 0)(F.Bd), F.Gd = P(F.Gd), F.Hd = z(F.Hd), F.Ld = P(F.Ld), F;
      })(), Ru.push(ur.sd), Vd = (g = ur).ic, Ud = g.jc, t._OrtInit = g.kc, t._OrtGetLastError = g.lc, t._OrtCreateSessionOptions = g.mc, t._OrtAppendExecutionProvider = g.nc, t._OrtAddFreeDimensionOverride = g.oc, t._OrtAddSessionConfigEntry = g.pc, t._OrtReleaseSessionOptions = g.qc, t._OrtCreateSession = g.rc, t._OrtReleaseSession = g.sc, t._OrtGetInputOutputCount = g.tc, t._OrtGetInputOutputMetadata = g.uc, t._OrtFree = g.vc, t._OrtCreateTensor = g.wc, t._OrtGetTensorData = g.xc, t._OrtReleaseTensor = g.yc, t._OrtCreateRunOptions = g.zc, t._OrtAddRunConfigEntry = g.Ac, t._OrtReleaseRunOptions = g.Bc, t._OrtCreateBinding = g.Cc, t._OrtBindInput = g.Dc, t._OrtBindOutput = g.Ec, t._OrtClearBoundOutputs = g.Fc, t._OrtReleaseBinding = g.Gc, t._OrtRunWithBinding = g.Hc, t._OrtRun = g.Ic, t._OrtEndProfiling = g.Jc, qd = t._OrtCreateWebGpuInstance = g.Kc, t._wgpuCreateInstance = g.Lc, yi = t._OrtGetWebGpuDevice = g.Mc, Ua = g.Nc, Et = t._free = g.Oc, $r = t._malloc = g.Pc, jd = t._wgpuBufferRelease = g.Qc, Wd = g.Rc, Hd = g.Sc, Qd = g.Tc, Xd = g.Uc, Yd = g.Vc, Jd = g.Yc, Zd = g.Zc, Kd = g.hd, ep = g.id, tp = g.jd, bi = g.ld, vi = g.md, xi = g.nd, Mi = g.od, Xn = g.pd, ki = g.qd, rp = g.rd, Ti = g.ud, np = g.vd, ap = g.wd, sp = g.xd, Ei = g.yd, ip = g.zd, op = g.Ad, Ai = g.Bd, he = g.Cd, Yn = g.Dd, lp = g.Ed, ee = g.Fd, qa = g.Gd, te = g.Hd, cp = g.Id, Ci = g.Jd, up = g.Kd, dp = g.Ld, pp = g.Md, Si = g.Nd, hp = g.Od, _p = g.Pd, fp = g.Qd, mp = g.Rd, gp = g.Sd, wp = g.Td, yp = g.Ud, bp = g.Vd, vp = g.Wd, xp = g.Xd, Mp = g.Yd, kp = g.Zd, Tp = g._d, Ep = g.$d, Ap = g.ae, Cp = g.be, Sp = g.ce, Pp = g.de, Fp = g.fe, Ip = g.ge, Lp = g.he, Op = g.ie, zp = g.je, Np = g.ke, Bp = g.le, $p = g.me, Dp = g.Ae, Rp = g.Be, Gp = g.Ce, Vp = g.De, Up = g.Ee, qp = g.Fe, jp = g.Ge, Wp = g.He, Hp = g.Ie, Qp = g.Je, Xp = g.Ke, Yp = g.nf, Jp = g.of, Zp = g.pf, Kp = g.qf, _ = v, ur;
    }
    var h, m = je();
    return t.instantiateWasm ? new Promise((g) => {
      t.instantiateWasm(m, (v, k) => {
        g(u(v, k));
      });
    }) : a ? u(new WebAssembly.Instance(_, je()), _) : (L ??= t.locateFile ? t.locateFile ? t.locateFile("ort-wasm-simd-threaded.asyncify.wasm", p) : p + "ort-wasm-simd-threaded.asyncify.wasm" : new URL("ort-wasm-simd-threaded.asyncify.wasm", import.meta.url).href, h = await (async function(g) {
      var v = L;
      if (!d && !O(v)) try {
        var k = fetch(v, { credentials: "same-origin" });
        return await WebAssembly.instantiateStreaming(k, g);
      } catch (F) {
        E(`wasm streaming compile failed: ${F}`), E("falling back to ArrayBuffer instantiation");
      }
      return (async function(F, P) {
        try {
          var z = await (async function(j) {
            if (!d) try {
              var de = await i(j);
              return new Uint8Array(de);
            } catch {
            }
            if (j == L && d) j = new Uint8Array(d);
            else {
              if (!o) throw "both async and sync fetching of the wasm failed";
              j = o(j);
            }
            return j;
          })(F);
          return await WebAssembly.instantiate(z, P);
        } catch (j) {
          E(`failed to asynchronously prepare wasm: ${j}`), le(j);
        }
      })(v, g);
    })(m), u(h.instance, h.module));
  }
  class be {
    name = "ExitStatus";
    constructor(h) {
      this.message = `Program terminated with exit(${h})`, this.status = h;
    }
  }
  var Ve = (u) => {
    u.terminate(), u.onmessage = () => {
    };
  }, Le = [], ke = 0, Ye = null, sr = (u) => {
    gr.length == 0 && (qu(), Uu(gr[0]));
    var h = gr.pop();
    if (!h) return 6;
    Hn.push(h), zr[u.Xc] = h, h.Xc = u.Xc;
    var m = { $c: "run", ze: u.ye, kd: u.kd, Xc: u.Xc };
    return h.postMessage(m, u.oe), 0;
  }, ve = 0, Fe = (u, h, ...m) => {
    var g, v = 16 * m.length, k = te(), F = qa(v), P = F >>> 3;
    for (g of m) typeof g == "bigint" ? ((M(), J)[P++ >>> 0] = 1n, (M(), J)[P++ >>> 0] = g) : ((M(), J)[P++ >>> 0] = 0n, (M(), ge)[P++ >>> 0] = g);
    return u = ap(u, 0, v, F, h), ee(k), u;
  };
  function on(u) {
    if (a) return Fe(0, 1, u);
    if (f = u, !(0 < ve)) {
      for (var h of Hn) Ve(h);
      for (h of gr) Ve(h);
      gr = [], Hn = [], zr = {}, S = !0;
    }
    l(0, new be(u));
  }
  function Du(u) {
    if (a) return Fe(1, 0, u);
    ni(u);
  }
  var ni = (u) => {
    if (f = u, a) throw Du(u), "unwind";
    on(u);
  }, gr = [], Hn = [], Ru = [], zr = {}, Gu = (u) => {
    var h = u.Xc;
    delete zr[h], gr.push(u), Hn.splice(Hn.indexOf(u), 1), u.Xc = 0, sp(h);
  };
  function Vu() {
    Ru.forEach((u) => u());
  }
  var Uu = (u) => new Promise((h) => {
    u.onmessage = (v) => {
      var k = v.data;
      if (v = k.$c, k.gd && k.gd != Ua()) {
        var F = zr[k.gd];
        F ? F.postMessage(k, k.oe) : E(`Internal error! Worker sent a message "${v}" to target pthread ${k.gd}, but that thread no longer exists!`);
      } else v === "checkMailbox" ? za() : v === "spawnThread" ? sr(k) : v === "cleanupThread" ? ht(() => {
        Gu(zr[k.Le]);
      }) : v === "loaded" ? (u.loaded = !0, h(u)) : k.target === "setimmediate" ? u.postMessage(k) : v === "uncaughtException" ? u.onerror(k.error) : v === "callHandler" ? t[k.te](...k.args) : v && E(`worker sent an unknown command ${v}`);
    }, u.onerror = (v) => {
      throw E(`worker sent an error! ${v.filename}:${v.lineno}: ${v.message}`), v;
    };
    var m, g = [];
    for (m of []) t.propertyIsEnumerable(m) && g.push(m);
    u.postMessage({ $c: "load", ue: g, Me: wr, Ne: _ });
  });
  function qu() {
    var u = new Worker((() => {
      let h = URL;
      return import.meta.url > "file:" && import.meta.url < "file;" ? new h("ort.webgpu.bundle.min.mjs", import.meta.url) : new URL(import.meta.url);
    })(), { type: "module", workerData: "em-pthread", name: "em-pthread" });
    gr.push(u);
  }
  var wr, By = (u, h) => {
    ve = 0, u = Si(u, h), 0 < ve ? f = u : Ei(u);
  }, La = [], Oa = 0, tt = (u) => -9007199254740992 > u || 9007199254740992 < u ? NaN : Number(u);
  function $y(u) {
    var h = new ai(u >>>= 0);
    return (M(), U)[h.ad + 12 >>> 0] == 0 && (ju(h, !0), Oa--), Wu(h, !1), La.push(h), dp(u);
  }
  var ln = 0, Dy = () => {
    he(0, 0);
    var u = La.pop();
    cp(u.td), ln = 0;
  };
  function ju(u, h) {
    h = h ? 1 : 0, (M(), U)[u.ad + 12 >>> 0] = h;
  }
  function Wu(u, h) {
    h = h ? 1 : 0, (M(), U)[u.ad + 13 >>> 0] = h;
  }
  class ai {
    constructor(h) {
      this.td = h, this.ad = h - 24;
    }
  }
  var si = (u) => {
    var h = ln;
    if (!h) return Yn(0), 0;
    var m = new ai(h);
    (M(), C)[m.ad + 16 >>> 2 >>> 0] = h;
    var g = (M(), C)[m.ad + 4 >>> 2 >>> 0];
    if (!g) return Yn(0), h;
    for (var v of u) {
      if (v === 0 || v === g) break;
      if (up(v, g, m.ad + 16)) return Yn(v), h;
    }
    return Yn(g), h;
  };
  function Ry() {
    return si([]);
  }
  function Gy(u) {
    return si([u >>> 0]);
  }
  function Vy(u, h, m, g) {
    return si([u >>> 0, h >>> 0, m >>> 0, g >>> 0]);
  }
  var Uy = () => {
    var u = La.pop();
    u || le("no exception to throw");
    var h = u.td;
    throw (M(), U)[u.ad + 13 >>> 0] == 0 && (La.push(u), Wu(u, !0), ju(u, !1), Oa++), Ci(h), ln = h;
  };
  function qy(u, h, m) {
    var g = new ai(u >>>= 0);
    throw h >>>= 0, m >>>= 0, (M(), C)[g.ad + 16 >>> 2 >>> 0] = 0, (M(), C)[g.ad + 4 >>> 2 >>> 0] = h, (M(), C)[g.ad + 8 >>> 2 >>> 0] = m, Ci(u), Oa++, ln = u;
  }
  var jy = () => Oa;
  function Hu(u, h, m, g) {
    return a ? Fe(2, 1, u, h, m, g) : Qu(u, h, m, g);
  }
  function Qu(u, h, m, g) {
    if (u >>>= 0, h >>>= 0, m >>>= 0, g >>>= 0, !globalThis.SharedArrayBuffer) return 6;
    var v = [];
    return a && v.length === 0 ? Hu(u, h, m, g) : (u = { ye: m, Xc: u, kd: g, oe: v }, a ? (u.$c = "spawnThread", postMessage(u, v), 0) : sr(u));
  }
  function Wy(u) {
    throw ln ||= u >>> 0, ln;
  }
  var Xu = globalThis.TextDecoder && new TextDecoder(), Yu = (u, h, m, g) => {
    if (m = h + m, g) return m;
    for (; u[h] && !(h >= m); ) ++h;
    return h;
  }, Ju = (u, h = 0, m, g) => {
    if (16 < (m = Yu(u, h >>>= 0, m, g)) - h && u.buffer && Xu) return Xu.decode(u.buffer instanceof ArrayBuffer ? u.subarray(h, m) : u.slice(h, m));
    for (g = ""; h < m; ) {
      var v = u[h++];
      if (128 & v) {
        var k = 63 & u[h++];
        if ((224 & v) == 192) g += String.fromCharCode((31 & v) << 6 | k);
        else {
          var F = 63 & u[h++];
          65536 > (v = (240 & v) == 224 ? (15 & v) << 12 | k << 6 | F : (7 & v) << 18 | k << 12 | F << 6 | 63 & u[h++]) ? g += String.fromCharCode(v) : (v -= 65536, g += String.fromCharCode(55296 | v >> 10, 56320 | 1023 & v));
        }
      } else g += String.fromCharCode(v);
    }
    return g;
  }, cn = (u, h, m) => (u >>>= 0) ? Ju((M(), q), u, h, m) : "";
  function Zu(u, h, m) {
    return a ? Fe(3, 1, u, h, m) : 0;
  }
  function Ku(u, h) {
    if (a) return Fe(4, 1, u, h);
  }
  function ed(u, h) {
    if (a) return Fe(5, 1, u, h);
  }
  function td(u, h, m) {
    if (a) return Fe(6, 1, u, h, m);
  }
  function rd(u, h, m) {
    return a ? Fe(7, 1, u, h, m) : 0;
  }
  function nd(u, h) {
    if (a) return Fe(8, 1, u, h);
  }
  function ad(u, h, m) {
    if (a) return Fe(9, 1, u, h, m);
  }
  function sd(u, h, m, g) {
    if (a) return Fe(10, 1, u, h, m, g);
  }
  function id(u, h, m, g) {
    if (a) return Fe(11, 1, u, h, m, g);
  }
  function od(u, h, m, g) {
    if (a) return Fe(12, 1, u, h, m, g);
  }
  function ld(u) {
    if (a) return Fe(13, 1, u);
  }
  function cd(u, h) {
    if (a) return Fe(14, 1, u, h);
  }
  function ud(u, h, m) {
    if (a) return Fe(15, 1, u, h, m);
  }
  var Hy = () => le(""), Ht = (u) => {
    u >>>= 0;
    for (var h = ""; ; ) {
      var m = (M(), q)[u++ >>> 0];
      if (!m) return h;
      h += String.fromCharCode(m);
    }
  }, ii = {}, oi = {}, Qy = {}, un = class extends Error {
    constructor(u) {
      super(u), this.name = "BindingError";
    }
  };
  function ir(u, h, m = {}) {
    return (function(g, v, k = {}) {
      var F = v.name;
      if (!g) throw new un(`type "${F}" must have a positive integer typeid pointer`);
      if (oi.hasOwnProperty(g)) {
        if (k.ve) return;
        throw new un(`Cannot register type '${F}' twice`);
      }
      oi[g] = v, delete Qy[g], ii.hasOwnProperty(g) && (v = ii[g], delete ii[g], v.forEach((P) => P()));
    })(u, h, m);
  }
  var dd = (u, h, m) => {
    switch (h) {
      case 1:
        return m ? (g) => (M(), U)[g >>> 0] : (g) => (M(), q)[g >>> 0];
      case 2:
        return m ? (g) => (M(), H)[g >>> 1 >>> 0] : (g) => (M(), Q)[g >>> 1 >>> 0];
      case 4:
        return m ? (g) => (M(), $)[g >>> 2 >>> 0] : (g) => (M(), C)[g >>> 2 >>> 0];
      case 8:
        return m ? (g) => (M(), J)[g >>> 3 >>> 0] : (g) => (M(), oe)[g >>> 3 >>> 0];
      default:
        throw new TypeError(`invalid integer width (${h}): ${u}`);
    }
  };
  function Xy(u, h, m, g, v) {
    u >>>= 0, m >>>= 0, h = Ht(h >>> 0);
    let k = (F) => F;
    if (g = g === 0n) {
      let F = 8 * m;
      k = (P) => BigInt.asUintN(F, P), v = k(v);
    }
    ir(u, { name: h, Wc: k, cd: (F, P) => (typeof P == "number" && (P = BigInt(P)), P), bd: dd(h, m, !g), dd: null });
  }
  function Yy(u, h, m, g) {
    ir(u >>>= 0, { name: h = Ht(h >>> 0), Wc: function(v) {
      return !!v;
    }, cd: function(v, k) {
      return k ? m : g;
    }, bd: function(v) {
      return this.Wc((M(), q)[v >>> 0]);
    }, dd: null });
  }
  var pd = [], Nr = [0, 1, , 1, null, 1, !0, 1, !1, 1];
  function li(u) {
    9 < (u >>>= 0) && --Nr[u + 1] === 0 && (Nr[u] = void 0, pd.push(u));
  }
  var Tt = (u) => {
    if (!u) throw new un(`Cannot use deleted val. handle = ${u}`);
    return Nr[u];
  }, It = (u) => {
    switch (u) {
      case void 0:
        return 2;
      case null:
        return 4;
      case !0:
        return 6;
      case !1:
        return 8;
      default:
        let h = pd.pop() || Nr.length;
        return Nr[h] = u, Nr[h + 1] = 1, h;
    }
  };
  function ci(u) {
    return this.Wc((M(), C)[u >>> 2 >>> 0]);
  }
  var Jy = { name: "emscripten::val", Wc: (u) => {
    var h = Tt(u);
    return li(u), h;
  }, cd: (u, h) => It(h), bd: ci, dd: null };
  function Zy(u) {
    return ir(u >>> 0, Jy);
  }
  var Ky = (u, h) => {
    switch (h) {
      case 4:
        return function(m) {
          return this.Wc((M(), ae)[m >>> 2 >>> 0]);
        };
      case 8:
        return function(m) {
          return this.Wc((M(), ge)[m >>> 3 >>> 0]);
        };
      default:
        throw new TypeError(`invalid float width (${h}): ${u}`);
    }
  };
  function e0(u, h, m) {
    m >>>= 0, ir(u >>>= 0, { name: h = Ht(h >>> 0), Wc: (g) => g, cd: (g, v) => v, bd: Ky(h, m), dd: null });
  }
  function t0(u, h, m, g, v) {
    u >>>= 0, m >>>= 0, h = Ht(h >>> 0);
    let k = (P) => P;
    if (g === 0) {
      var F = 32 - 8 * m;
      k = (P) => P << F >>> F, v = k(v);
    }
    ir(u, { name: h, Wc: k, cd: (P, z) => z, bd: dd(h, m, g !== 0), dd: null });
  }
  function r0(u, h, m) {
    function g(k) {
      var F = (M(), C)[k >>> 2 >>> 0];
      return k = (M(), C)[k + 4 >>> 2 >>> 0], new v((M(), U).buffer, k, F);
    }
    var v = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][h];
    ir(u >>>= 0, { name: m = Ht(m >>> 0), Wc: g, bd: g }, { ve: !0 });
  }
  var or = (u, h, m) => {
    var g = (M(), q);
    if (h >>>= 0, 0 < m) {
      var v = h;
      m = h + m - 1;
      for (var k = 0; k < u.length; ++k) {
        var F = u.codePointAt(k);
        if (127 >= F) {
          if (h >= m) break;
          g[h++ >>> 0] = F;
        } else if (2047 >= F) {
          if (h + 1 >= m) break;
          g[h++ >>> 0] = 192 | F >> 6, g[h++ >>> 0] = 128 | 63 & F;
        } else if (65535 >= F) {
          if (h + 2 >= m) break;
          g[h++ >>> 0] = 224 | F >> 12, g[h++ >>> 0] = 128 | F >> 6 & 63, g[h++ >>> 0] = 128 | 63 & F;
        } else {
          if (h + 3 >= m) break;
          g[h++ >>> 0] = 240 | F >> 18, g[h++ >>> 0] = 128 | F >> 12 & 63, g[h++ >>> 0] = 128 | F >> 6 & 63, g[h++ >>> 0] = 128 | 63 & F, k++;
        }
      }
      g[h >>> 0] = 0, u = h - v;
    } else u = 0;
    return u;
  }, lr = (u) => {
    for (var h = 0, m = 0; m < u.length; ++m) {
      var g = u.charCodeAt(m);
      127 >= g ? h++ : 2047 >= g ? h += 2 : 55296 <= g && 57343 >= g ? (h += 4, ++m) : h += 3;
    }
    return h;
  };
  function n0(u, h) {
    ir(u >>>= 0, { name: h = Ht(h >>> 0), Wc(m) {
      var g = (M(), C)[m >>> 2 >>> 0];
      return g = cn(m + 4, g, !0), Et(m), g;
    }, cd(m, g) {
      g instanceof ArrayBuffer && (g = new Uint8Array(g));
      var v = typeof g == "string";
      if (!(v || ArrayBuffer.isView(g) && g.BYTES_PER_ELEMENT == 1)) throw new un("Cannot pass non-string to std::string");
      var k = v ? lr(g) : g.length, F = $r(4 + k + 1), P = F + 4;
      return (M(), C)[F >>> 2 >>> 0] = k, v ? or(g, P, k + 1) : (M(), q).set(g, P >>> 0), m !== null && m.push(Et, F), F;
    }, bd: ci, dd(m) {
      Et(m);
    } });
  }
  var hd = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, a0 = (u, h, m) => {
    if (u >>>= 1, 16 < (h = Yu((M(), Q), u, h / 2, m)) - u && hd) return hd.decode((M(), Q).slice(u, h));
    for (m = ""; u < h; ++u) {
      var g = (M(), Q)[u >>> 0];
      m += String.fromCharCode(g);
    }
    return m;
  }, s0 = (u, h, m) => {
    if (m ??= 2147483647, 2 > m) return 0;
    var g = h;
    m = (m -= 2) < 2 * u.length ? m / 2 : u.length;
    for (var v = 0; v < m; ++v) {
      var k = u.charCodeAt(v);
      (M(), H)[h >>> 1 >>> 0] = k, h += 2;
    }
    return (M(), H)[h >>> 1 >>> 0] = 0, h - g;
  }, i0 = (u) => 2 * u.length, o0 = (u, h, m) => {
    var g = "";
    u >>>= 2;
    for (var v = 0; !(v >= h / 4); v++) {
      var k = (M(), C)[u + v >>> 0];
      if (!k && !m) break;
      g += String.fromCodePoint(k);
    }
    return g;
  }, l0 = (u, h, m) => {
    if (h >>>= 0, m ??= 2147483647, 4 > m) return 0;
    var g = h;
    m = g + m - 4;
    for (var v = 0; v < u.length; ++v) {
      var k = u.codePointAt(v);
      if (65535 < k && v++, (M(), $)[h >>> 2 >>> 0] = k, (h += 4) + 4 > m) break;
    }
    return (M(), $)[h >>> 2 >>> 0] = 0, h - g;
  }, c0 = (u) => {
    for (var h = 0, m = 0; m < u.length; ++m) 65535 < u.codePointAt(m) && m++, h += 4;
    return h;
  };
  function u0(u, h, m) {
    if (u >>>= 0, h >>>= 0, m = Ht(m >>>= 0), h === 2) var g = a0, v = s0, k = i0;
    else g = o0, v = l0, k = c0;
    ir(u, { name: m, Wc: (F) => {
      var P = (M(), C)[F >>> 2 >>> 0];
      return P = g(F + 4, P * h, !0), Et(F), P;
    }, cd: (F, P) => {
      if (typeof P != "string") throw new un(`Cannot pass non-string to C++ string type ${m}`);
      var z = k(P), j = $r(4 + z + h);
      return (M(), C)[j >>> 2 >>> 0] = z / h, v(P, j + 4, z + h), F !== null && F.push(Et, j), j;
    }, bd: ci, dd(F) {
      Et(F);
    } });
  }
  function d0(u, h) {
    ir(u >>>= 0, { we: !0, name: h = Ht(h >>> 0), Wc: () => {
    }, cd: () => {
    } });
  }
  function p0(u) {
    Ti(u >>> 0, !n, 1, !r, 131072, !1), Vu();
  }
  var ht = (u) => {
    if (!S) try {
      if (u(), !(0 < ve)) try {
        a ? Ua() && Ei(f) : ni(f);
      } catch (h) {
        h instanceof be || h == "unwind" || l(0, h);
      }
    } catch (h) {
      h instanceof be || h == "unwind" || l(0, h);
    }
  }, h0 = !Atomics.waitAsync || globalThis.navigator?.userAgent && 91 > Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./) || [])[2]);
  function ui(u) {
    u >>>= 0, h0 || (Atomics.waitAsync((M(), $), u >>> 2, u).value.then(za), u += 128, Atomics.store((M(), $), u >>> 2, 1));
  }
  var za = () => ht(() => {
    var u = Ua();
    u && (ui(u), op());
  });
  function _0(u, h) {
    (u >>>= 0) == h >>> 0 ? setTimeout(za) : a ? postMessage({ gd: u, $c: "checkMailbox" }) : (u = zr[u]) && u.postMessage({ $c: "checkMailbox" });
  }
  var di = [];
  function f0(u, h, m, g, v) {
    for (h >>>= 0, v >>>= 0, di.length = 0, m = v >>> 3, g = v + g >>> 3; m < g; ) {
      var k;
      k = (M(), J)[m++ >>> 0] ? (M(), J)[m++ >>> 0] : (M(), ge)[m++ >>> 0], di.push(k);
    }
    return (h ? Pi[h] : iv[u])(...di);
  }
  var m0 = () => {
    ve = 0;
  };
  function g0(u) {
    u >>>= 0, a ? postMessage({ $c: "cleanupThread", Le: u }) : Gu(zr[u]);
  }
  function w0(u) {
  }
  var Na = (u) => {
    try {
      u();
    } catch (h) {
      le(h);
    }
  };
  function y0(u) {
    var h = (...m) => {
      Ba.push(u);
      try {
        return u(...m);
      } finally {
        S || (Ba.pop(), Qt && yr === 1 && Ba.length === 0 && (yr = 0, ve += 1, Na(Jp), typeof Fibers < "u" && Fibers.We()));
      }
    };
    return md.set(u, h), h;
  }
  var yr = 0, Qt = null, _d = 0, Ba = [], pi = /* @__PURE__ */ new Map(), fd = /* @__PURE__ */ new Map(), md = /* @__PURE__ */ new Map(), b0 = 0, hi = null, v0 = [], gd = (u) => (function(h) {
    if (!S) {
      if (yr === 0) {
        var m = !1, g = !1;
        h((v = 0) => {
          if (!S && (_d = v, m = !0, g)) {
            yr = 2, Na(() => Zp(Qt)), typeof MainLoop < "u" && MainLoop.se && MainLoop.resume(), v = !1;
            try {
              var k = (function() {
                var z = (M(), $)[Qt + 8 >>> 2 >>> 0];
                return z = fd.get(z), z = md.get(z), --ve, z();
              })();
            } catch (z) {
              k = z, v = !0;
            }
            var F = !1;
            if (!Qt) {
              var P = hi;
              P && (hi = null, (v ? P.reject : P.resolve)(k), F = !0);
            }
            if (v && !F) throw k;
          }
        }), g = !0, m || (yr = 1, Qt = (function() {
          var v = $r(65548), k = v + 12;
          if ((M(), C)[v >>> 2 >>> 0] = k, (M(), C)[v + 4 >>> 2 >>> 0] = k + 65536, k = Ba[0], !pi.has(k)) {
            var F = b0++;
            pi.set(k, F), fd.set(F, k);
          }
          return k = pi.get(k), (M(), $)[v + 8 >>> 2 >>> 0] = k, v;
        })(), typeof MainLoop < "u" && MainLoop.se && MainLoop.pause(), Na(() => Yp(Qt)));
      } else yr === 2 ? (yr = 0, Na(Kp), Et(Qt), Qt = null, v0.forEach(ht)) : le(`invalid state: ${yr}`);
      return _d;
    }
  })((h) => {
    u().then(h);
  });
  function x0(u) {
    return u >>>= 0, gd(async () => {
      var h = await Tt(u);
      return It(h);
    });
  }
  var _i = [], M0 = (u) => {
    var h = _i.length;
    return _i.push(u), h;
  }, k0 = (u, h) => {
    for (var m = Array(u), g = 0; g < u; ++g) {
      var v = g, k = (M(), C)[h + 4 * g >>> 2 >>> 0], F = oi[k];
      if (F === void 0) throw u = `parameter ${g}`, k = Vd(k), h = Ht(k), Et(k), new un(`${u} has unknown type ${h}`);
      m[v] = F;
    }
    return m;
  }, T0 = (u, h, m) => {
    var g = [];
    return u = u(g, m), g.length && ((M(), C)[h >>> 2 >>> 0] = It(g)), u;
  }, E0 = {}, $a = (u) => {
    var h = E0[u];
    return h === void 0 ? Ht(u) : h;
  };
  function A0(u, h, m) {
    var [g, ...v] = k0(u, h >>> 0);
    h = g.cd.bind(g);
    var k = v.map((z) => z.bd.bind(z));
    u--;
    var F = { toValue: Tt };
    switch (u = k.map((z, j) => {
      var de = `argFromPtr${j}`;
      return F[de] = z, `${de}(args${j ? "+" + 8 * j : ""})`;
    }), m) {
      case 0:
        var P = "toValue(handle)";
        break;
      case 2:
        P = "new (toValue(handle))";
        break;
      case 3:
        P = "";
        break;
      case 1:
        F.getStringOrSymbol = $a, P = "toValue(handle)[getStringOrSymbol(methodName)]";
    }
    return P += `(${u})`, g.we || (F.toReturnWire = h, F.emval_returnValue = T0, P = `return emval_returnValue(toReturnWire, destructorsRef, ${P})`), P = `return function (handle, methodName, destructorsRef, args) {
  ${P}
  }`, m = new Function(Object.keys(F), P)(...Object.values(F)), P = `methodCaller<(${v.map((z) => z.name)}) => ${g.name}>`, M0(Object.defineProperty(m, "name", { value: P }));
  }
  function C0(u, h) {
    return h >>>= 0, (u = Tt(u >>> 0)) == Tt(h);
  }
  function S0(u) {
    return (u >>>= 0) ? (u = $a(u), It(globalThis[u])) : It(globalThis);
  }
  function P0(u) {
    return u = $a(u >>> 0), It(t[u]);
  }
  function F0(u, h) {
    return h >>>= 0, u = Tt(u >>> 0), h = Tt(h), It(u[h]);
  }
  function I0(u) {
    9 < (u >>>= 0) && (Nr[u + 1] += 1);
  }
  function wd(u, h, m, g, v) {
    return _i[u >>> 0](h >>> 0, m >>> 0, g >>> 0, v >>> 0);
  }
  function L0(u, h, m, g, v) {
    return wd(u >>> 0, h >>> 0, m >>> 0, g >>> 0, v >>> 0);
  }
  function O0() {
    return It([]);
  }
  function z0(u) {
    u = Tt(u >>> 0);
    for (var h = Array(u.length), m = 0; m < u.length; m++) h[m] = u[m];
    return It(h);
  }
  function N0(u) {
    return It($a(u >>> 0));
  }
  function B0() {
    return It({});
  }
  function $0(u) {
    for (var h = Tt(u >>>= 0); h.length; ) {
      var m = h.pop();
      h.pop()(m);
    }
    li(u);
  }
  function D0(u, h, m) {
    h >>>= 0, m >>>= 0, u = Tt(u >>> 0), h = Tt(h), m = Tt(m), u[h] = m;
  }
  function R0(u, h) {
    u = tt(u), h >>>= 0, u = new Date(1e3 * u), (M(), $)[h >>> 2 >>> 0] = u.getUTCSeconds(), (M(), $)[h + 4 >>> 2 >>> 0] = u.getUTCMinutes(), (M(), $)[h + 8 >>> 2 >>> 0] = u.getUTCHours(), (M(), $)[h + 12 >>> 2 >>> 0] = u.getUTCDate(), (M(), $)[h + 16 >>> 2 >>> 0] = u.getUTCMonth(), (M(), $)[h + 20 >>> 2 >>> 0] = u.getUTCFullYear() - 1900, (M(), $)[h + 24 >>> 2 >>> 0] = u.getUTCDay(), u = (u.getTime() - Date.UTC(u.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0, (M(), $)[h + 28 >>> 2 >>> 0] = u;
  }
  var yd = (u) => u % 4 == 0 && (u % 100 != 0 || u % 400 == 0), bd = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], vd = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  function G0(u, h) {
    u = tt(u), h >>>= 0, u = new Date(1e3 * u), (M(), $)[h >>> 2 >>> 0] = u.getSeconds(), (M(), $)[h + 4 >>> 2 >>> 0] = u.getMinutes(), (M(), $)[h + 8 >>> 2 >>> 0] = u.getHours(), (M(), $)[h + 12 >>> 2 >>> 0] = u.getDate(), (M(), $)[h + 16 >>> 2 >>> 0] = u.getMonth(), (M(), $)[h + 20 >>> 2 >>> 0] = u.getFullYear() - 1900, (M(), $)[h + 24 >>> 2 >>> 0] = u.getDay();
    var m = (yd(u.getFullYear()) ? bd : vd)[u.getMonth()] + u.getDate() - 1 | 0;
    (M(), $)[h + 28 >>> 2 >>> 0] = m, (M(), $)[h + 36 >>> 2 >>> 0] = -60 * u.getTimezoneOffset(), m = new Date(u.getFullYear(), 6, 1).getTimezoneOffset();
    var g = new Date(u.getFullYear(), 0, 1).getTimezoneOffset();
    u = 0 | (m != g && u.getTimezoneOffset() == Math.min(g, m)), (M(), $)[h + 32 >>> 2 >>> 0] = u;
  }
  function V0(u) {
    u >>>= 0;
    var h = new Date((M(), $)[u + 20 >>> 2 >>> 0] + 1900, (M(), $)[u + 16 >>> 2 >>> 0], (M(), $)[u + 12 >>> 2 >>> 0], (M(), $)[u + 8 >>> 2 >>> 0], (M(), $)[u + 4 >>> 2 >>> 0], (M(), $)[u >>> 2 >>> 0], 0), m = (M(), $)[u + 32 >>> 2 >>> 0], g = h.getTimezoneOffset(), v = new Date(h.getFullYear(), 6, 1).getTimezoneOffset(), k = new Date(h.getFullYear(), 0, 1).getTimezoneOffset(), F = Math.min(k, v);
    return 0 > m ? (M(), $)[u + 32 >>> 2 >>> 0] = +(v != k && F == g) : 0 < m != (F == g) && (v = Math.max(k, v), h.setTime(h.getTime() + 6e4 * ((0 < m ? F : v) - g))), (M(), $)[u + 24 >>> 2 >>> 0] = h.getDay(), m = (yd(h.getFullYear()) ? bd : vd)[h.getMonth()] + h.getDate() - 1 | 0, (M(), $)[u + 28 >>> 2 >>> 0] = m, (M(), $)[u >>> 2 >>> 0] = h.getSeconds(), (M(), $)[u + 4 >>> 2 >>> 0] = h.getMinutes(), (M(), $)[u + 8 >>> 2 >>> 0] = h.getHours(), (M(), $)[u + 12 >>> 2 >>> 0] = h.getDate(), (M(), $)[u + 16 >>> 2 >>> 0] = h.getMonth(), (M(), $)[u + 20 >>> 2 >>> 0] = h.getYear(), u = h.getTime(), BigInt(isNaN(u) ? -1 : u / 1e3);
  }
  function xd(u, h, m, g, v, k, F) {
    return a ? Fe(16, 1, u, h, m, g, v, k, F) : -52;
  }
  function Md(u, h, m, g, v, k) {
    if (a) return Fe(17, 1, u, h, m, g, v, k);
  }
  var Qn = {}, U0 = () => performance.timeOrigin + performance.now();
  function kd(u, h) {
    if (a) return Fe(18, 1, u, h);
    if (Qn[u] && (clearTimeout(Qn[u].id), delete Qn[u]), !h) return 0;
    var m = setTimeout(() => {
      delete Qn[u], ht(() => ip(u, performance.timeOrigin + performance.now()));
    }, h);
    return Qn[u] = { id: m, Ve: h }, 0;
  }
  function q0(u, h, m, g) {
    u >>>= 0, h >>>= 0, m >>>= 0, g >>>= 0;
    var v = (/* @__PURE__ */ new Date()).getFullYear(), k = new Date(v, 0, 1).getTimezoneOffset();
    v = new Date(v, 6, 1).getTimezoneOffset();
    var F = Math.max(k, v);
    (M(), C)[u >>> 2 >>> 0] = 60 * F, (M(), $)[h >>> 2 >>> 0] = +(k != v), u = (h = (P) => {
      var z = Math.abs(P);
      return `UTC${0 <= P ? "-" : "+"}${String(Math.floor(z / 60)).padStart(2, "0")}${String(z % 60).padStart(2, "0")}`;
    })(k), h = h(v), v < k ? (or(u, m, 17), or(h, g, 17)) : (or(u, g, 17), or(h, m, 17));
  }
  var j0 = () => Date.now(), W0 = 1;
  function H0(u, h, m) {
    if (m >>>= 0, !(0 <= u && 3 >= u)) return 28;
    if (u === 0) u = Date.now();
    else {
      if (!W0) return 52;
      u = performance.timeOrigin + performance.now();
    }
    return u = Math.round(1e6 * u), (M(), J)[m >>> 3 >>> 0] = BigInt(u), 0;
  }
  var fi = [], Td = (u, h) => {
    fi.length = 0;
    for (var m; m = (M(), q)[u++ >>> 0]; ) {
      var g = m != 105;
      h += (g &= m != 112) && h % 8 ? 4 : 0, fi.push(m == 112 ? (M(), C)[h >>> 2 >>> 0] : m == 106 ? (M(), J)[h >>> 3 >>> 0] : m == 105 ? (M(), $)[h >>> 2 >>> 0] : (M(), ge)[h >>> 3 >>> 0]), h += g ? 8 : 4;
    }
    return fi;
  };
  function Q0(u, h, m) {
    return u >>>= 0, h = Td(h >>> 0, m >>> 0), Pi[u](...h);
  }
  function X0(u, h, m) {
    return u >>>= 0, h = Td(h >>> 0, m >>> 0), Pi[u](...h);
  }
  var Y0 = () => {
  };
  function J0(u, h) {
    return E(cn(u >>> 0, h >>> 0));
  }
  var Z0 = () => {
    throw ve += 1, "unwind";
  };
  function K0() {
    return 4294901760;
  }
  var eb = () => 1, tb = () => navigator.hardwareConcurrency, Br = {}, Ed = (u) => {
    var h = lr(u) + 1, m = $r(h);
    return m && or(u, m, h), m;
  }, Da = (u) => {
    var h;
    return (h = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(u)) ? +h[1] : (h = /:(\d+):\d+(?:\)|$)/.exec(u)) ? 2147483648 | +h[1] : 0;
  }, Ad = (u) => {
    for (var h of u) (u = Da(h)) && (Br[u] = h);
  };
  function rb() {
    var u = Error().stack.toString().split(`
`);
    return u[0] == "Error" && u.shift(), Ad(u), Br.ee = Da(u[3]), Br.xe = u, Br.ee;
  }
  function Ra(u) {
    if (!(u = Br[u >>> 0])) return 0;
    var h;
    if (h = /^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(u)) u = h[1];
    else if (h = /^\s+at (.*) \(.*\)$/.exec(u)) u = h[1];
    else {
      if (!(h = /^(.+?)@/.exec(u))) return 0;
      u = h[1];
    }
    return Et(Ra.ne ?? 0), Ra.ne = Ed(u), Ra.ne;
  }
  function nb(u) {
    u >>>= 0;
    var h = (M(), q).length;
    if (u <= h || 4294901760 < u) return !1;
    for (var m = 1; 4 >= m; m *= 2) {
      var g = h * (1 + 0.2 / m);
      g = Math.min(g, u + 100663296);
      e: {
        g = (Math.min(4294901760, 65536 * Math.ceil(Math.max(u, g) / 65536)) - wr.buffer.byteLength + 65535) / 65536 | 0;
        try {
          wr.grow(g), R();
          var v = 1;
          break e;
        } catch {
        }
        v = void 0;
      }
      if (v) return !0;
    }
    return !1;
  }
  function ab(u, h, m) {
    if (u >>>= 0, h >>>= 0, Br.ee == u) var g = Br.xe;
    else (g = Error().stack.toString().split(`
`))[0] == "Error" && g.shift(), Ad(g);
    for (var v = 3; g[v] && Da(g[v]) != u; ) ++v;
    for (u = 0; u < m && g[u + v]; ++u) (M(), $)[h + 4 * u >>> 2 >>> 0] = Da(g[u + v]);
    return u;
  }
  var Xt = (u) => {
    var h = lr(u) + 1, m = qa(h);
    return or(u, m, h), m;
  }, dn = (u) => (M(), C)[u >>> 2 >>> 0] + 4294967296 * (M(), $)[u + 4 >>> 2 >>> 0], rt = [], Cd = (u, h) => {
    rt[u >>> 0] = h;
  }, cr = [], Ga = [], pn = (u, h) => {
    Ga[u] = new Promise((m) => h.finally(() => m(u)));
  }, Z = (u) => {
    if (u) return rt[u >>> 0];
  }, mi = (u, h) => {
    for (u = (M(), C)[u >>> 2 >>> 0]; u; u = (M(), C)[u >>> 2 >>> 0]) h[(M(), $)[u + 4 >>> 2 >>> 0]](u);
  }, Va = (u, h, m) => {
    (M(), C)[u >>> 2 >>> 0] = h, (M(), C)[u + 4 >>> 2 >>> 0] = m;
  }, Sd = (u) => {
    var h = (M(), C)[u >>> 2 >>> 0];
    return u = (M(), C)[u + 4 >>> 2 >>> 0], cn(h, u);
  }, Lt = (u) => {
    var h = (M(), C)[u >>> 2 >>> 0];
    return u = (M(), C)[u + 4 >>> 2 >>> 0], h ? cn(h, u) : u === 0 ? "" : void 0;
  }, sb = (u) => {
    var h = Lt(u + 4), m = (m = (M(), C)[u + 12 >>> 2 >>> 0]) ? Z(m) : "auto";
    if (u += 16) {
      var g = Z((M(), C)[u + 4 >>> 2 >>> 0]), v = (M(), C)[u + 16 >>> 2 >>> 0], k = (M(), C)[u + 20 >>> 2 >>> 0];
      if (v) {
        for (var F = {}, P = 0; P < v; ++P) {
          var z = k + 24 * P;
          F[Sd(z + 4)] = (M(), ge)[z + 16 >>> 3 >>> 0];
        }
        v = F;
      } else v = void 0;
      u = { module: g, constants: v, entryPoint: Lt(u + 8) };
    } else u = void 0;
    return { label: h, layout: m, compute: u };
  }, Pd = (u, h) => {
    function m(k, F, P, z = 0) {
      k = u[k] ?? z, (M(), C)[F + P >>> 2 >>> 0] = k;
    }
    function g(k, F, P, z = 0) {
      F += P, k = u[k] ?? z, (M(), C)[F >>> 2 >>> 0] = k, z = (M(), C)[F >>> 2 >>> 0], (M(), C)[F + 4 >>> 2 >>> 0] = (k - z) / 4294967296;
    }
    var v = (M(), C)[h >>> 2 >>> 0];
    m("maxTextureDimension1D", h, 4), m("maxTextureDimension2D", h, 8), m("maxTextureDimension3D", h, 12), m("maxTextureArrayLayers", h, 16), m("maxBindGroups", h, 20), m("maxBindGroupsPlusVertexBuffers", h, 24), m("maxBindingsPerBindGroup", h, 28), m("maxDynamicUniformBuffersPerPipelineLayout", h, 32), m("maxDynamicStorageBuffersPerPipelineLayout", h, 36), m("maxSampledTexturesPerShaderStage", h, 40), m("maxSamplersPerShaderStage", h, 44), m("maxStorageBuffersPerShaderStage", h, 48), m("maxStorageTexturesPerShaderStage", h, 52), m("maxUniformBuffersPerShaderStage", h, 56), m("minUniformBufferOffsetAlignment", h, 80), m("minStorageBufferOffsetAlignment", h, 84), g("maxUniformBufferBindingSize", h, 64), g("maxStorageBufferBindingSize", h, 72), m("maxVertexBuffers", h, 88), g("maxBufferSize", h, 96), m("maxVertexAttributes", h, 104), m("maxVertexBufferArrayStride", h, 108), m("maxInterStageShaderVariables", h, 112), m("maxColorAttachments", h, 116), m("maxColorAttachmentBytesPerSample", h, 120), m("maxComputeWorkgroupStorageSize", h, 124), m("maxComputeInvocationsPerWorkgroup", h, 128), m("maxComputeWorkgroupSizeX", h, 132), m("maxComputeWorkgroupSizeY", h, 136), m("maxComputeWorkgroupSizeZ", h, 140), m("maxComputeWorkgroupsPerDimension", h, 144), m("maxImmediateSize", h, 148), v !== 0 && (M(), m("maxStorageBuffersInVertexStage", v, 8, u.maxStorageBuffersPerShaderStage), m("maxStorageBuffersInFragmentStage", v, 16, u.maxStorageBuffersPerShaderStage), m("maxStorageTexturesInVertexStage", v, 12, u.maxStorageTexturesPerShaderStage), m("maxStorageTexturesInFragmentStage", v, 20, u.maxStorageTexturesPerShaderStage));
  }, ib = (u, h) => {
    (M(), C)[h + 52 >>> 2 >>> 0] = u.subgroupMinSize, (M(), C)[h + 56 >>> 2 >>> 0] = u.subgroupMaxSize;
    var m = Ed(u.vendor + u.architecture + u.device + u.description), g = lr(u.vendor);
    Va(h + 4, m, g), m += g, g = lr(u.architecture), Va(h + 12, m, g), m += g, g = lr(u.device), Va(h + 20, m, g), m += g, g = lr(u.description), Va(h + 28, m, g), m += g, (M(), $)[h + 36 >>> 2 >>> 0] = 2, m = u.isFallbackAdapter ? 3 : 4, (M(), $)[h + 40 >>> 2 >>> 0] = m, (M(), C)[h + 44 >>> 2 >>> 0] = 0, (M(), C)[h + 48 >>> 2 >>> 0] = 0, mi(h, { 327739: (v) => {
      let k = 0, F = 0;
      if (u.subgroupMatrixConfigs) {
        k = u.subgroupMatrixConfigs.length, F = $r(20 * k);
        for (let [P, z] of u.subgroupMatrixConfigs.entries()) {
          let j = F + 20 * P, de = Id.indexOf(z.componentType), _e = Id.indexOf(z.resultComponentType);
          (M(), $)[j >>> 2 >>> 0] = de, (M(), $)[j + 4 >>> 2 >>> 0] = _e, (M(), C)[j + 8 >>> 2 >>> 0] = z.M, (M(), C)[j + 12 >>> 2 >>> 0] = z.N, (M(), C)[j + 16 >>> 2 >>> 0] = z.K;
        }
      }
      (M(), C)[v + 12 >>> 2 >>> 0] = F, (M(), C)[v + 8 >>> 2 >>> 0] = k;
    } });
  }, ob = [, , "uniform", "storage", "read-only-storage"], lb = [, "validation", "out-of-memory", "internal"], cb = [, "compatibility", "core"], Fd = { 1: "core-features-and-limits", 2: "depth-clip-control", 3: "depth32float-stencil8", 4: "texture-compression-bc", 5: "texture-compression-bc-sliced-3d", 6: "texture-compression-etc2", 7: "texture-compression-astc", 8: "texture-compression-astc-sliced-3d", 9: "timestamp-query", 10: "indirect-first-instance", 11: "shader-f16", 12: "rg11b10ufloat-renderable", 13: "bgra8unorm-storage", 14: "float32-filterable", 15: "float32-blendable", 16: "clip-distances", 17: "dual-source-blending", 18: "subgroups", 19: "texture-formats-tier1", 20: "texture-formats-tier2", 21: "primitive-index", 22: "texture-component-swizzle", 23: "subgroup-size-control", 327692: "chromium-experimental-unorm16-texture-formats", 327729: "chromium-experimental-multi-draw-indirect", 327732: "chromium-experimental-subgroup-matrix" }, ub = [, "low-power", "high-performance"], db = [, "occlusion", "timestamp"], pb = [, , "filtering", "non-filtering", "comparison"], hb = [, , "write-only", "read-only", "read-write"], Id = [, "f32", "f16", "u32", "i32", "u8", "i8"], _b = [, "r8unorm", "r8snorm", "r8uint", "r8sint", "r16unorm", "r16snorm", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32float", "r32uint", "r32sint", "rg16unorm", "rg16snorm", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb10a2uint", "rgb10a2unorm", "rg11b10ufloat", "rgb9e5ufloat", "rg32float", "rg32uint", "rg32sint", "rgba16unorm", "rgba16snorm", "rgba16uint", "rgba16sint", "rgba16float", "rgba32float", "rgba32uint", "rgba32sint", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"], fb = [, , "float", "unfilterable-float", "depth", "sint", "uint"], Ld = [, "1d", "2d", "2d-array", "cube", "cube-array", "3d"], mb = { undefined: 1, unknown: 1, destroyed: 2 };
  function gb(u, h, m, g, v, k) {
    h = tt(h), m = tt(m), g >>>= 0, v >>>= 0, k >>>= 0;
    var F = Z(u >>> 0);
    if (u = {}, k) {
      var P = (M(), C)[k + 12 >>> 2 >>> 0];
      if (P) {
        var z = (M(), C)[k + 16 >>> 2 >>> 0];
        u.requiredFeatures = Array.from((M(), C).subarray(z >>> 2 >>> 0, z + 4 * P >>> 2 >>> 0), (X) => Fd[X]);
      }
      if (P = (M(), C)[k + 20 >>> 2 >>> 0]) {
        let X = function(_t, lt, Dr, Rr = !1) {
          lt += Dr, (lt = (M(), C)[lt >>> 2 >>> 0]) == 4294967295 || Rr && lt == 0 || (_e[_t] = lt);
        }, Te = function(_t, lt, Dr) {
          lt += Dr, Dr = (M(), C)[lt >>> 2 >>> 0];
          var Rr = (M(), C)[lt + 4 >>> 2 >>> 0];
          Dr == 4294967295 && Rr == 4294967295 || (_e[_t] = dn(lt));
        };
        var j = X, de = Te;
        z = (M(), C)[P >>> 2 >>> 0];
        var _e = {};
        X("maxTextureDimension1D", P, 4), X("maxTextureDimension2D", P, 8), X("maxTextureDimension3D", P, 12), X("maxTextureArrayLayers", P, 16), X("maxBindGroups", P, 20), X("maxBindGroupsPlusVertexBuffers", P, 24), X("maxBindingsPerBindGroup", P, 28), X("maxDynamicUniformBuffersPerPipelineLayout", P, 32), X("maxDynamicStorageBuffersPerPipelineLayout", P, 36), X("maxSampledTexturesPerShaderStage", P, 40), X("maxSamplersPerShaderStage", P, 44), X("maxStorageBuffersPerShaderStage", P, 48), X("maxStorageTexturesPerShaderStage", P, 52), X("maxUniformBuffersPerShaderStage", P, 56), X("minUniformBufferOffsetAlignment", P, 80), X("minStorageBufferOffsetAlignment", P, 84), Te("maxUniformBufferBindingSize", P, 64), Te("maxStorageBufferBindingSize", P, 72), X("maxVertexBuffers", P, 88), Te("maxBufferSize", P, 96), X("maxVertexAttributes", P, 104), X("maxVertexBufferArrayStride", P, 108), X("maxInterStageShaderVariables", P, 112), X("maxColorAttachments", P, 116), X("maxColorAttachmentBytesPerSample", P, 120), X("maxComputeWorkgroupStorageSize", P, 124), X("maxComputeInvocationsPerWorkgroup", P, 128), X("maxComputeWorkgroupSizeX", P, 132), X("maxComputeWorkgroupSizeY", P, 136), X("maxComputeWorkgroupSizeZ", P, 140), X("maxComputeWorkgroupsPerDimension", P, 144), X("maxImmediateSize", P, 148, !0), z !== 0 && (M(), "maxStorageBuffersInVertexStage" in GPUSupportedLimits.prototype && (X("maxStorageBuffersInVertexStage", z, 8), X("maxStorageTexturesInVertexStage", z, 12), X("maxStorageBuffersInFragmentStage", z, 16), X("maxStorageTexturesInFragmentStage", z, 20))), u.requiredLimits = _e;
      }
      (P = (M(), C)[k + 24 >>> 2 >>> 0]) && (P = { label: Lt(P + 4) }, u.defaultQueue = P), u.label = Lt(k + 4);
    }
    ve += 1, pn(h, F.requestDevice(u).then((X) => {
      --ve, ht(() => {
        rt[v >>> 0] = X.queue, rt[g >>> 0] = X, ve += 1, pn(m, X.lost.then((Te) => {
          ht(() => {
            X.onuncapturederror = () => {
            };
            var _t = te(), lt = Xt(Te.message);
            vi(m, mb[Te.reason], lt), ee(_t);
          }), --ve;
        })), X.onuncapturederror = (Te) => {
          var _t = 5;
          Te.error instanceof GPUValidationError ? _t = 2 : Te.error instanceof GPUOutOfMemoryError ? _t = 3 : Te.error instanceof GPUInternalError && (_t = 4);
          var lt = te();
          Te = Xt(Te.error.message), rp(g, _t, Te), ee(lt);
        }, "adapterInfo" in X || (X.adapterInfo = F.info), ki(h, 1, g, 0);
      });
    }, (X) => {
      --ve, ht(() => {
        var Te = te(), _t = Xt(X.message);
        ki(h, 3, g, _t), m && vi(m, 4, _t), ee(Te);
      });
    }));
  }
  function wb(u) {
    var h = Z(u >>>= 0), m = cr[u];
    if (m) {
      for (var g = 0; g < m.length; ++g) m[g]();
      delete cr[u];
    }
    h.destroy();
  }
  function yb(u, h, m) {
    m >>>= 0;
    var g = Z(u >>>= 0);
    m == 4294967295 && (m = void 0);
    try {
      var v = g.getMappedRange(h >>> 0, m);
    } catch {
      return 0;
    }
    var k = Ai(16, v.byteLength);
    return (M(), q).set(new Uint8Array(v), k >>> 0), cr[u].push(() => Et(k)), k;
  }
  function bb(u, h, m) {
    m >>>= 0;
    var g = Z(u >>>= 0);
    m == 4294967295 && (m = void 0);
    try {
      var v = g.getMappedRange(h >>> 0, m);
    } catch {
      return 0;
    }
    var k = Ai(16, v.byteLength);
    return (M(), q).fill(0, k, v.byteLength), cr[u].push(() => {
      new Uint8Array(v).set((M(), q).subarray(k >>> 0, k + v.byteLength >>> 0)), Et(k);
    }), k;
  }
  function vb(u, h, m, g, v) {
    u >>>= 0, h = tt(h), m = tt(m), v >>>= 0;
    var k = Z(u);
    cr[u] = [], v == 4294967295 && (v = void 0), ve += 1, pn(h, k.mapAsync(m, g >>> 0, v).then(() => {
      --ve, ht(() => {
        xi(h, 1, 0);
      });
    }, (F) => {
      --ve, ht(() => {
        te();
        var P = Xt(F.message);
        xi(h, F.name === "AbortError" ? 4 : F.name === "OperationError" ? 3 : 0, P), delete cr[u];
      });
    }));
  }
  function xb(u) {
    var h = Z(u >>>= 0), m = cr[u];
    if (m) {
      for (var g = 0; g < m.length; ++g) m[g]();
      delete cr[u], h.unmap();
    }
  }
  function Mb(u) {
    delete rt[u >>> 0];
  }
  function kb(u, h, m) {
    u >>>= 0, h >>>= 0, m >>>= 0;
    var g = !!(M(), C)[h + 32 >>> 2 >>> 0];
    h = { label: Lt(h + 4), usage: (M(), C)[h + 16 >>> 2 >>> 0], size: dn(h + 24), mappedAtCreation: g }, u = Z(u);
    try {
      var v = u.createBuffer(h);
    } catch {
      return !1;
    }
    return rt[m >>> 0] = v, g && (cr[m] = []), !0;
  }
  function Tb(u, h, m, g) {
    u >>>= 0, h = tt(h), g >>>= 0, m = sb(m >>> 0), u = Z(u), ve += 1, pn(h, u.createComputePipelineAsync(m).then((v) => {
      --ve, ht(() => {
        rt[g >>> 0] = v, bi(h, 1, g, 0);
      });
    }, (v) => {
      --ve, ht(() => {
        var k = te(), F = Xt(v.message);
        bi(h, v.reason === "validation" ? 3 : v.reason === "internal" ? 4 : 0, g, F), ee(k);
      });
    }));
  }
  function Eb(u, h, m) {
    u >>>= 0, h >>>= 0, m >>>= 0;
    var g = (M(), C)[h >>> 2 >>> 0], v = (M(), $)[g + 4 >>> 2 >>> 0];
    h = { label: Lt(h + 4), code: "" }, v === 2 && (h.code = Sd(g + 8)), u = Z(u).createShaderModule(h), rt[m >>> 0] = u;
  }
  var Ab = (u) => {
    (u = Z(u)).onuncapturederror = null, u.destroy();
  };
  function Cb(u, h) {
    h = tt(h), u = Z(u >>> 0), ve += 1, pn(h, u.popErrorScope().then((m) => {
      --ve, ht(() => {
        var g = 5;
        m ? m instanceof GPUValidationError ? g = 2 : m instanceof GPUOutOfMemoryError ? g = 3 : m instanceof GPUInternalError && (g = 4) : g = 1;
        var v = te(), k = m ? Xt(m.message) : 0;
        Mi(h, 1, g, k), ee(v);
      });
    }, (m) => {
      --ve, ht(() => {
        var g = te(), v = Xt(m.message);
        Mi(h, 1, 5, v), ee(g);
      });
    }));
  }
  function Sb(u, h, m, g) {
    if (h = tt(h), g >>>= 0, m >>>= 0) {
      var v = { featureLevel: cb[(M(), $)[m + 4 >>> 2 >>> 0]], powerPreference: ub[(M(), $)[m + 8 >>> 2 >>> 0]], forceFallbackAdapter: !!(M(), C)[m + 12 >>> 2 >>> 0] };
      (u = (M(), C)[m >>> 2 >>> 0]) !== 0 && (M(), v.Ye = !!(M(), C)[u + 8 >>> 2 >>> 0]);
    }
    "gpu" in navigator ? (ve += 1, pn(h, navigator.gpu.requestAdapter(v).then((k) => {
      --ve, ht(() => {
        if (k) rt[g >>> 0] = k, Xn(h, 1, g, 0);
        else {
          var F = te(), P = Xt("WebGPU not available on this browser (requestAdapter returned null)");
          Xn(h, 3, g, P), ee(F);
        }
      });
    }, (k) => {
      --ve, ht(() => {
        var F = te(), P = Xt(k.message);
        Xn(h, 4, g, P), ee(F);
      });
    }))) : (v = te(), u = Xt("WebGPU not available on this browser (navigator.gpu is not available)"), Xn(h, 3, g, u), ee(v));
  }
  function Pb(u, h, m) {
    return u >>>= 0, h >>>= 0, m >>>= 0, gd(async () => {
      var g = [];
      if (m) {
        var v = (M(), $)[m >>> 2 >>> 0];
        g.length = h + 1, g[h] = new Promise((P) => setTimeout(P, v, 0));
      } else g.length = h;
      for (var k = 0; k < h; ++k) {
        var F = dn(u + 8 * k);
        if (!(F in Ga)) return F;
        g[k] = Ga[F];
      }
      return g = await Promise.race(g), delete Ga[g], g;
    });
  }
  var gi, wi = {}, Od = () => {
    if (!gi) {
      var u, h = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8", _: "./this.program" };
      for (u in wi) wi[u] === void 0 ? delete h[u] : h[u] = wi[u];
      var m = [];
      for (u in h) m.push(`${u}=${h[u]}`);
      gi = m;
    }
    return gi;
  };
  function zd(u, h) {
    if (a) return Fe(19, 1, u, h);
    u >>>= 0, h >>>= 0;
    var m, g = 0, v = 0;
    for (m of Od()) {
      var k = h + g;
      (M(), C)[u + v >>> 2 >>> 0] = k, g += or(m, k, 1 / 0) + 1, v += 4;
    }
    return 0;
  }
  function Nd(u, h) {
    if (a) return Fe(20, 1, u, h);
    u >>>= 0, h >>>= 0;
    var m = Od();
    for (var g of ((M(), C)[u >>> 2 >>> 0] = m.length, u = 0, m)) u += lr(g) + 1;
    return (M(), C)[h >>> 2 >>> 0] = u, 0;
  }
  function Bd(u) {
    return a ? Fe(21, 1, u) : 52;
  }
  function $d(u, h, m, g, v) {
    return a ? Fe(22, 1, u, h, m, g, v) : 52;
  }
  function Dd(u, h, m, g) {
    return a ? Fe(23, 1, u, h, m, g) : 52;
  }
  function Rd(u, h, m, g) {
    return a ? Fe(24, 1, u, h, m, g) : 70;
  }
  var Fb = [null, [], []];
  function Gd(u, h, m, g) {
    if (a) return Fe(25, 1, u, h, m, g);
    h >>>= 0, m >>>= 0, g >>>= 0;
    for (var v = 0, k = 0; k < m; k++) {
      var F = (M(), C)[h >>> 2 >>> 0], P = (M(), C)[h + 4 >>> 2 >>> 0];
      h += 8;
      for (var z = 0; z < P; z++) {
        var j = u, de = (M(), q)[F + z >>> 0], _e = Fb[j];
        de === 0 || de === 10 ? ((j === 1 ? A : E)(Ju(_e)), _e.length = 0) : _e.push(de);
      }
      v += P;
    }
    return (M(), C)[g >>> 2 >>> 0] = v, 0;
  }
  function Ib(u) {
    return u >>> 0;
  }
  function Lb(u, h) {
    return Pd(Z(u >>> 0).limits, h >>> 0), 1;
  }
  function Ob(u, h) {
    return Z(u >>> 0).features.has(Fd[h]);
  }
  function zb(u) {
    return BigInt(Z(u >>> 0).size);
  }
  function Nb(u) {
    return BigInt(Z(u >>> 0).usage);
  }
  function Bb(u, h) {
    if (u >>>= 0, h >>>= 0) {
      var m = Lt(h + 4);
      m = { label: m, timestampWrites: h = (h = (M(), C)[h + 12 >>> 2 >>> 0]) !== 0 ? { querySet: Z((M(), C)[h + 4 >>> 2 >>> 0]), beginningOfPassWriteIndex: (M(), C)[h + 8 >>> 2 >>> 0], endOfPassWriteIndex: (M(), C)[h + 12 >>> 2 >>> 0] } : void 0 };
    }
    return h = Z(u), u = Yd(0), m = h.beginComputePass(m), rt[u >>> 0] = m, u;
  }
  function $b(u, h, m, g) {
    m = tt(m), (g = tt(g)) == -1 && (g = void 0), (u = Z(u >>> 0)).clearBuffer(Z(h >>> 0), m, g);
  }
  function Db(u, h, m, g, v, k) {
    m = tt(m), v = tt(v), k = tt(k), Z(u >>> 0).copyBufferToBuffer(Z(h >>> 0), m, Z(g >>> 0), v, k);
  }
  function Rb(u) {
    var h = Z(u >>> 0);
    return u = Qd(0), h = h.finish(), rt[u >>> 0] = h, u;
  }
  function Gb(u, h, m, g, v, k) {
    k = tt(k), Z(u >>> 0).resolveQuerySet(Z(h >>> 0), m, g, Z(v >>> 0), k);
  }
  function Vb(u, h, m, g) {
    Z(u >>> 0).dispatchWorkgroups(h, m, g);
  }
  function Ub(u, h, m) {
    m = tt(m), Z(u >>> 0).dispatchWorkgroupsIndirect(Z(h >>> 0), m);
  }
  function qb(u) {
    Z(u >>> 0).end();
  }
  function jb(u, h, m, g, v) {
    g >>>= 0, v >>>= 0, u = Z(u >>> 0), m = Z(m >>> 0), g == 0 ? u.setBindGroup(h, m) : u.setBindGroup(h, m, (M(), C), v >>> 2, g);
  }
  function Wb(u, h) {
    Z(u >>> 0).setPipeline(Z(h >>> 0));
  }
  function Hb(u, h, m) {
    Z(u >>> 0).Xe(Z(h >>> 0), m);
  }
  function Qb(u, h) {
    function m(v) {
      var k = (M(), C)[v + 8 >>> 2 >>> 0], F = (M(), C)[v + 32 >>> 2 >>> 0], P = (M(), C)[v + 36 >>> 2 >>> 0], z = 0;
      return mi(v, { 14: (j) => {
        z = (M(), C)[j + 8 >>> 2 >>> 0];
      } }), k ? ((F = dn(v + 24)) == -1 && (F = void 0), k = { buffer: Z(k), offset: dn(v + 16), size: F }) : k = Z(F || P || z), { binding: (M(), C)[v + 4 >>> 2 >>> 0], resource: k };
    }
    u >>>= 0, h = { label: Lt((h >>>= 0) + 4), layout: Z((M(), C)[h + 12 >>> 2 >>> 0]), entries: (function(v, k) {
      for (var F = [], P = 0; P < v; ++P) F.push(m(k + 40 * P));
      return F;
    })((M(), C)[h + 16 >>> 2 >>> 0], (M(), C)[h + 20 >>> 2 >>> 0]) }, u = Z(u);
    var g = Wd(0);
    return Cd(g, u.createBindGroup(h)), g;
  }
  function Xb(u, h) {
    function m(z) {
      var j = (M(), C)[z + 4 >>> 2 >>> 0];
      if (j) return { type: ob[j], hasDynamicOffset: !!(M(), C)[z + 8 >>> 2 >>> 0], minBindingSize: dn(z + 16) };
    }
    function g(z) {
      if (z = (M(), C)[z + 4 >>> 2 >>> 0]) return { type: pb[z] };
    }
    function v(z) {
      var j = (M(), C)[z + 4 >>> 2 >>> 0];
      if (j) return { sampleType: fb[j], viewDimension: Ld[(M(), $)[z + 8 >>> 2 >>> 0]], multisampled: !!(M(), C)[z + 12 >>> 2 >>> 0] };
    }
    function k(z) {
      var j = (M(), C)[z + 4 >>> 2 >>> 0];
      if (j) return { access: hb[j], format: _b[(M(), $)[z + 8 >>> 2 >>> 0]], viewDimension: Ld[(M(), $)[z + 12 >>> 2 >>> 0]] };
    }
    function F(z) {
      var j = { binding: (M(), C)[z + 4 >>> 2 >>> 0], visibility: (M(), C)[z + 8 >>> 2 >>> 0], buffer: m(z + 24), sampler: g(z + 48), texture: v(z + 56), storageTexture: k(z + 72) };
      return mi(z, { 13: () => {
        j.externalTexture = {};
      } }), j;
    }
    u >>>= 0, h = { label: Lt((h >>>= 0) + 4), entries: (function(z, j) {
      for (var de = [], _e = 0; _e < z; ++_e) de.push(F(j + 88 * _e));
      return de;
    })((M(), C)[h + 12 >>> 2 >>> 0], (M(), C)[h + 16 >>> 2 >>> 0]) }, u = Z(u);
    var P = Hd(0);
    return Cd(P, u.createBindGroupLayout(h)), P;
  }
  function Yb(u, h) {
    var m;
    return u >>>= 0, (h >>>= 0) && (m = { label: Lt(h + 4) }), h = Z(u), u = Xd(0), m = h.createCommandEncoder(m), rt[u >>> 0] = m, u;
  }
  function Jb(u, h) {
    u >>>= 0, h >>>= 0;
    for (var m = (M(), C)[h + 12 >>> 2 >>> 0], g = (M(), C)[h + 16 >>> 2 >>> 0], v = [], k = 0; k < m; ++k) v.push(Z((M(), C)[g + 4 * k >>> 2 >>> 0]));
    return h = { label: Lt(h + 4), bindGroupLayouts: v, immediateSize: (M(), C)[h + 20 >>> 2 >>> 0] }, m = Z(u), u = Jd(0), h = m.createPipelineLayout(h), rt[u >>> 0] = h, u;
  }
  function Zb(u, h) {
    u >>>= 0, h >>>= 0, h = { type: db[(M(), $)[h + 12 >>> 2 >>> 0]], count: (M(), C)[h + 16 >>> 2 >>> 0] };
    var m = Z(u);
    return u = Zd(0), h = m.createQuerySet(h), rt[u >>> 0] = h, u;
  }
  function Kb(u, h) {
    return ib(Z(u >>> 0).adapterInfo, h >>> 0), 1;
  }
  var ev = { "core-features-and-limits": 1, "depth-clip-control": 2, "depth32float-stencil8": 3, "texture-compression-bc": 4, "texture-compression-bc-sliced-3d": 5, "texture-compression-etc2": 6, "texture-compression-astc": 7, "texture-compression-astc-sliced-3d": 8, "timestamp-query": 9, "indirect-first-instance": 10, "shader-f16": 11, "rg11b10ufloat-renderable": 12, "bgra8unorm-storage": 13, "float32-filterable": 14, "float32-blendable": 15, "clip-distances": 16, "dual-source-blending": 17, subgroups: 18, "texture-formats-tier1": 19, "texture-formats-tier2": 20, "primitive-index": 21, "texture-component-swizzle": 22, "subgroup-size-control": 23, "chromium-experimental-unorm16-texture-formats": 327692, "chromium-experimental-multi-draw-indirect": 327729, "chromium-experimental-subgroup-matrix": 327732 };
  function tv(u, h) {
    h >>>= 0;
    var m = Z(u >>> 0);
    u = $r(4 * m.features.size);
    var g = 0, v = 0;
    for (let k of m.features) 0 <= (m = ev[k]) && ((M(), $)[u + g >>> 2 >>> 0] = m, g += 4, v++);
    (M(), C)[h + 4 >>> 2 >>> 0] = u, (M(), C)[h >>> 2 >>> 0] = v;
  }
  function rv(u, h) {
    return Pd(Z(u >>> 0).limits, h >>> 0), 1;
  }
  function nv(u, h) {
    Z(u >>> 0).pushErrorScope(lb[h]);
  }
  function av(u, h, m) {
    h >>>= 0, m >>>= 0, u = Z(u >>> 0), h = Array.from((M(), $).subarray(m >>> 2 >>> 0, m + 4 * h >>> 2 >>> 0), (g) => Z(g)), u.submit(h);
  }
  function sv(u, h, m, g, v) {
    m = tt(m), g >>>= 0, v >>>= 0, u = Z(u >>> 0), h = Z(h >>> 0), g = (M(), q).subarray(g >>> 0, g + v >>> 0), u.writeBuffer(h, m, g, 0, v);
  }
  a || (function() {
    for (var u = t.numThreads - 1; u--; ) qu();
    Le.push(async () => {
      var h = (async function() {
        if (!a) return Promise.all(gr.map(Uu));
      })();
      ke++, await h, --ke == 0 && Ye && (h = Ye, Ye = null, h());
    });
  })(), a || (wr = new WebAssembly.Memory({ initial: 256, maximum: 65536, shared: !0 }), R()), t.wasmBinary && (d = t.wasmBinary), t.stackSave = () => te(), t.stackRestore = (u) => ee(u), t.stackAlloc = (u) => qa(u), t.setValue = function(u, h, m = "i8") {
    switch (m.endsWith("*") && (m = "*"), m) {
      case "i1":
      case "i8":
        (M(), U)[u >>> 0] = h;
        break;
      case "i16":
        (M(), H)[u >>> 1 >>> 0] = h;
        break;
      case "i32":
        (M(), $)[u >>> 2 >>> 0] = h;
        break;
      case "i64":
        (M(), J)[u >>> 3 >>> 0] = BigInt(h);
        break;
      case "float":
        (M(), ae)[u >>> 2 >>> 0] = h;
        break;
      case "double":
        (M(), ge)[u >>> 3 >>> 0] = h;
        break;
      case "*":
        (M(), C)[u >>> 2 >>> 0] = h;
        break;
      default:
        le(`invalid type for setValue: ${m}`);
    }
  }, t.getValue = function(u, h = "i8") {
    switch (h.endsWith("*") && (h = "*"), h) {
      case "i1":
      case "i8":
        return (M(), U)[u >>> 0];
      case "i16":
        return (M(), H)[u >>> 1 >>> 0];
      case "i32":
        return (M(), $)[u >>> 2 >>> 0];
      case "i64":
        return (M(), J)[u >>> 3 >>> 0];
      case "float":
        return (M(), ae)[u >>> 2 >>> 0];
      case "double":
        return (M(), ge)[u >>> 3 >>> 0];
      case "*":
        return (M(), C)[u >>> 2 >>> 0];
      default:
        le(`invalid type for getValue: ${h}`);
    }
  }, t.UTF8ToString = cn, t.stringToUTF8 = or, t.lengthBytesUTF8 = lr;
  var Vd, Ud, qd, yi, Ua, Et, $r, jd, Wd, Hd, Qd, Xd, Yd, Jd, Zd, Kd, ep, tp, bi, vi, xi, Mi, Xn, ki, rp, Ti, np, ap, sp, Ei, ip, op, Ai, he, Yn, lp, ee, qa, te, cp, Ci, up, dp, pp, Si, hp, _p, fp, mp, gp, wp, yp, bp, vp, xp, Mp, kp, Tp, Ep, Ap, Cp, Sp, Pp, Fp, Ip, Lp, Op, zp, Np, Bp, $p, Dp, Rp, Gp, Vp, Up, qp, jp, Wp, Hp, Qp, Xp, Yp, Jp, Zp, Kp, ur, iv = [on, Du, Hu, Zu, Ku, ed, td, rd, nd, ad, sd, id, od, ld, cd, ud, xd, Md, kd, zd, Nd, Bd, $d, Dd, Rd, Gd], Pi = { 1280444: (u, h, m, g, v) => {
    if (t === void 0 || !t.ed) return 1;
    if ((u = cn(Number(u >>> 0))).startsWith("./") && (u = u.substring(2)), !(u = t.ed.get(u))) return 2;
    if (h = Number(h >>> 0), m = Number(m >>> 0), g = Number(g >>> 0), h + m > u.byteLength) return 3;
    try {
      let k = u.subarray(h, h + m);
      switch (v) {
        case 0:
          (M(), q).set(k, g >>> 0);
          break;
        case 1:
          t.pe ? t.pe(g, k) : t.Re(g, k);
          break;
        default:
          return 4;
      }
      return 0;
    } catch {
      return 4;
    }
  }, 1281268: (u, h, m) => {
    t.re(u, (M(), q).subarray(h >>> 0, h + m >>> 0));
  }, 1281332: () => t.Pe(), 1281374: (u) => {
    t.qe(u);
  }, 1281411: () => typeof wasmOffsetConverter < "u" };
  function ov() {
    return typeof wasmOffsetConverter < "u";
  }
  function lv(u, h, m, g) {
    var v = te();
    try {
      return bp(u, h, m, g);
    } catch (k) {
      if (ee(v), k !== k + 0) throw k;
      he(1, 0);
    }
  }
  function cv(u, h, m) {
    var g = te();
    try {
      return gp(u, h, m);
    } catch (v) {
      if (ee(g), v !== v + 0) throw v;
      he(1, 0);
    }
  }
  function uv(u) {
    var h = te();
    try {
      hp(u);
    } catch (m) {
      if (ee(h), m !== m + 0) throw m;
      he(1, 0);
    }
  }
  function dv(u, h) {
    var m = te();
    try {
      return Si(u, h);
    } catch (g) {
      if (ee(m), g !== g + 0) throw g;
      he(1, 0);
    }
  }
  function pv(u, h, m) {
    var g = te();
    try {
      pp(u, h, m);
    } catch (v) {
      if (ee(g), v !== v + 0) throw v;
      he(1, 0);
    }
  }
  function hv(u, h) {
    var m = te();
    try {
      vp(u, h);
    } catch (g) {
      if (ee(m), g !== g + 0) throw g;
      he(1, 0);
    }
  }
  function _v(u, h, m, g, v, k, F) {
    var P = te();
    try {
      return mp(u, h, m, g, v, k, F);
    } catch (z) {
      if (ee(P), z !== z + 0) throw z;
      he(1, 0);
    }
  }
  function fv(u, h, m, g, v, k) {
    var F = te();
    try {
      _p(u, h, m, g, v, k);
    } catch (P) {
      if (ee(F), P !== P + 0) throw P;
      he(1, 0);
    }
  }
  function mv(u, h, m, g) {
    var v = te();
    try {
      yp(u, h, m, g);
    } catch (k) {
      if (ee(v), k !== k + 0) throw k;
      he(1, 0);
    }
  }
  function gv(u, h, m, g, v, k, F) {
    var P = te();
    try {
      Mp(u, h, m, g, v, k, F);
    } catch (z) {
      if (ee(P), z !== z + 0) throw z;
      he(1, 0);
    }
  }
  function wv(u, h, m, g, v, k, F) {
    var P = te();
    try {
      kp(u, h, m, g, v, k, F);
    } catch (z) {
      if (ee(P), z !== z + 0) throw z;
      he(1, 0);
    }
  }
  function yv(u, h, m, g, v, k, F, P) {
    var z = te();
    try {
      Op(u, h, m, g, v, k, F, P);
    } catch (j) {
      if (ee(z), j !== j + 0) throw j;
      he(1, 0);
    }
  }
  function bv(u, h, m, g, v, k, F, P, z, j, de, _e) {
    var X = te();
    try {
      Tp(u, h, m, g, v, k, F, P, z, j, de, _e);
    } catch (Te) {
      if (ee(X), Te !== Te + 0) throw Te;
      he(1, 0);
    }
  }
  function vv(u, h, m, g, v) {
    var k = te();
    try {
      return xp(u, h, m, g, v);
    } catch (F) {
      if (ee(k), F !== F + 0) throw F;
      he(1, 0);
    }
  }
  function xv(u, h, m, g, v, k) {
    var F = te();
    try {
      zp(u, h, m, g, v, k);
    } catch (P) {
      if (ee(F), P !== P + 0) throw P;
      he(1, 0);
    }
  }
  function Mv(u, h, m, g, v) {
    var k = te();
    try {
      fp(u, h, m, g, v);
    } catch (F) {
      if (ee(k), F !== F + 0) throw F;
      he(1, 0);
    }
  }
  function kv(u, h, m, g, v, k, F, P) {
    var z = te();
    try {
      wp(u, h, m, g, v, k, F, P);
    } catch (j) {
      if (ee(z), j !== j + 0) throw j;
      he(1, 0);
    }
  }
  function Tv(u) {
    var h = te();
    try {
      return Np(u);
    } catch (m) {
      if (ee(h), m !== m + 0) throw m;
      he(1, 0);
    }
  }
  function Ev(u, h, m, g, v, k, F, P, z) {
    var j = te();
    try {
      Ap(u, h, m, g, v, k, F, P, z);
    } catch (de) {
      if (ee(j), de !== de + 0) throw de;
      he(1, 0);
    }
  }
  function Av(u, h, m) {
    var g = te();
    try {
      return Bp(u, h, m);
    } catch (v) {
      if (ee(g), v !== v + 0) throw v;
      he(1, 0);
    }
  }
  function Cv(u, h) {
    var m = te();
    try {
      return Xp(u, h);
    } catch (g) {
      if (ee(m), g !== g + 0) throw g;
      return he(1, 0), 0n;
    }
  }
  function Sv(u, h, m, g) {
    var v = te();
    try {
      return $p(u, h, m, g);
    } catch (k) {
      if (ee(v), k !== k + 0) throw k;
      he(1, 0);
    }
  }
  function Pv(u) {
    var h = te();
    try {
      return Ep(u);
    } catch (m) {
      if (ee(h), m !== m + 0) throw m;
      return he(1, 0), 0n;
    }
  }
  function Fv(u, h, m, g) {
    var v = te();
    try {
      return Dp(u, h, m, g);
    } catch (k) {
      if (ee(v), k !== k + 0) throw k;
      he(1, 0);
    }
  }
  function Iv(u, h, m, g, v) {
    var k = te();
    try {
      return Rp(u, h, m, g, v);
    } catch (F) {
      if (ee(k), F !== F + 0) throw F;
      he(1, 0);
    }
  }
  function Lv(u, h, m, g, v, k) {
    var F = te();
    try {
      return Gp(u, h, m, g, v, k);
    } catch (P) {
      if (ee(F), P !== P + 0) throw P;
      he(1, 0);
    }
  }
  function Ov(u, h, m, g, v, k) {
    var F = te();
    try {
      return Ip(u, h, m, g, v, k);
    } catch (P) {
      if (ee(F), P !== P + 0) throw P;
      he(1, 0);
    }
  }
  function zv(u, h, m, g, v, k) {
    var F = te();
    try {
      return Vp(u, h, m, g, v, k);
    } catch (P) {
      if (ee(F), P !== P + 0) throw P;
      he(1, 0);
    }
  }
  function Nv(u, h, m, g, v, k, F, P) {
    var z = te();
    try {
      return Lp(u, h, m, g, v, k, F, P);
    } catch (j) {
      if (ee(z), j !== j + 0) throw j;
      he(1, 0);
    }
  }
  function Bv(u, h, m, g, v) {
    var k = te();
    try {
      return Up(u, h, m, g, v);
    } catch (F) {
      if (ee(k), F !== F + 0) throw F;
      return he(1, 0), 0n;
    }
  }
  function $v(u, h, m, g) {
    var v = te();
    try {
      return qp(u, h, m, g);
    } catch (k) {
      if (ee(v), k !== k + 0) throw k;
      he(1, 0);
    }
  }
  function Dv(u, h, m, g) {
    var v = te();
    try {
      return jp(u, h, m, g);
    } catch (k) {
      if (ee(v), k !== k + 0) throw k;
      he(1, 0);
    }
  }
  function Rv(u, h, m, g, v, k, F, P, z, j, de, _e) {
    var X = te();
    try {
      return Wp(u, h, m, g, v, k, F, P, z, j, de, _e);
    } catch (Te) {
      if (ee(X), Te !== Te + 0) throw Te;
      he(1, 0);
    }
  }
  function Gv(u, h, m, g, v, k, F, P, z, j, de) {
    var _e = te();
    try {
      Hp(u, h, m, g, v, k, F, P, z, j, de);
    } catch (X) {
      if (ee(_e), X !== X + 0) throw X;
      he(1, 0);
    }
  }
  function Vv(u, h, m, g, v, k, F, P, z, j, de, _e, X, Te, _t, lt) {
    var Dr = te();
    try {
      Qp(u, h, m, g, v, k, F, P, z, j, de, _e, X, Te, _t, lt);
    } catch (Rr) {
      if (ee(Dr), Rr !== Rr + 0) throw Rr;
      he(1, 0);
    }
  }
  function Uv(u, h, m) {
    var g = te();
    try {
      return Sp(u, h, m);
    } catch (v) {
      if (ee(g), v !== v + 0) throw v;
      return he(1, 0), 0n;
    }
  }
  function qv(u, h, m) {
    var g = te();
    try {
      return Cp(u, h, m);
    } catch (v) {
      if (ee(g), v !== v + 0) throw v;
      he(1, 0);
    }
  }
  function jv(u, h, m) {
    var g = te();
    try {
      return Pp(u, h, m);
    } catch (v) {
      if (ee(g), v !== v + 0) throw v;
      he(1, 0);
    }
  }
  function Wv(u, h, m, g) {
    var v = te();
    try {
      Fp(u, h, m, g);
    } catch (k) {
      if (ee(v), k !== k + 0) throw k;
      he(1, 0);
    }
  }
  function ja() {
    if (0 < ke) Ye = ja;
    else if (a) w?.(t), K();
    else {
      for (var u = Le; 0 < u.length; ) u.shift()(t);
      0 < ke ? Ye = ja : (t.calledRun = !0, S || (K(), w?.(t)));
    }
  }
  return a || (ur = await Me(), ja()), t.PTR_SIZE = 4, t.webgpuInit = (u) => {
    let h = /* @__PURE__ */ new WeakMap(), m, g, v = 1;
    t.webgpuRegisterDevice = (P) => {
      if (g !== void 0) throw Error("another WebGPU EP inference session is being created.");
      if (P) {
        var z = h.get(P);
        if (!z) {
          let j = ((de, _e = 0) => {
            var X = tp(_e);
            return _e = ep(_e, X), rt[X >>> 0] = de.queue, rt[_e >>> 0] = de, _e;
          })(P, z = qd());
          z = [v++, z, j], h.set(P, z);
        }
        return m = P, g = z[0], z;
      }
      m = void 0, g = 0;
    };
    let k = /* @__PURE__ */ new Map();
    t.webgpuOnCreateSession = (P) => {
      if (g !== void 0) {
        var z = g;
        if (g = void 0, P) {
          let j = yi(z);
          k.set(P, j), z === 0 && u(m ?? Z(j));
        }
        m = void 0;
      }
    }, t.webgpuOnReleaseSession = (P) => {
      k.delete(P);
    };
    let F = /* @__PURE__ */ Symbol("gpuBufferMetadata");
    t.webgpuRegisterBuffer = (P, z, j) => {
      if (j) return P[F] = [j, NaN], j;
      if (j = P[F]) return j[1]++, j[0];
      if ((z = k.get(z)) === void 0) throw Error("Invalid session handle passed to webgpuRegisterBuffer");
      return z = ((de, _e = 0) => (de.mapState === "unmapped" || le(), _e = Kd(_e), rt[_e >>> 0] = de, _e))(P, z), P[F] = [z, 1], z;
    }, t.webgpuUnregisterBuffer = (P) => {
      let z = P[F];
      if (!z) throw Error("Buffer is not registered");
      z[1]--, z[1] === 0 && (jd(z[0]), delete P[F]);
    }, t.webgpuGetBuffer = (P) => Z(P), t.webgpuCreateDownloader = (P, z, j) => {
      if ((j = k.get(j)) === void 0) throw Error("Invalid session handle passed to webgpuRegisterBuffer");
      let de = Z(j), _e = 16 * Math.ceil(Number(z) / 16);
      return async () => {
        let X = de.createBuffer({ size: _e, usage: 9 });
        try {
          let Te = de.createCommandEncoder();
          return Te.copyBufferToBuffer(P, 0, X, 0, _e), de.queue.submit([Te.finish()]), await X.mapAsync(GPUMapMode.READ), X.getMappedRange().slice(0, z);
        } finally {
          X.destroy();
        }
      };
    }, t.pe = (P, z) => {
      var j = z.buffer;
      let de = z.byteOffset, _e = z.byteLength;
      if (z = 16 * Math.ceil(Number(_e) / 16), P = Z(P), !m) {
        var X = yi(g);
        m = Z(X);
      }
      let Te = (X = m.createBuffer({ mappedAtCreation: !0, size: z, usage: 6 })).getMappedRange();
      new Uint8Array(Te).set(new Uint8Array(j, de, _e)), X.unmap(), (j = m.createCommandEncoder()).copyBufferToBuffer(X, 0, P, 0, z), m.queue.submit([j.finish()]), X.destroy();
    };
  }, t.webnnInit = (u) => {
    let h = u[0];
    [t.Pe, t.qe, t.webnnEnsureTensor, t.re, t.webnnDownloadTensor, t.Oe, t.webnnEnableTraceEvent] = u.slice(1), t.webnnReleaseTensorId = t.qe, t.webnnUploadTensor = t.re, t.webnnRegisterMLContext = t.Oe, t.webnnOnRunStart = (m) => h.onRunStart(m), t.webnnOnRunEnd = h.onRunEnd.bind(h), t.webnnOnReleaseSession = (m) => {
      h.onReleaseSession(m);
    }, t.webnnCreateMLTensorDownloader = (m, g) => h.createMLTensorDownloader(m, g), t.webnnRegisterMLTensor = (m, g, v, k) => h.registerMLTensor(m, g, v, k), t.webnnCreateMLContext = (m) => h.createMLContext(m), t.webnnRegisterGraphInput = h.registerGraphInput.bind(h), t.webnnIsGraphInput = h.isGraphInput.bind(h), t.webnnRegisterGraphOutput = h.registerGraphOutput.bind(h), t.webnnIsGraphOutput = h.isGraphOutput.bind(h), t.webnnCreateTemporaryTensor = h.createTemporaryTensor.bind(h), t.webnnIsGraphInputOutputTypeSupported = h.isGraphInputOutputTypeSupported.bind(h);
  }, N ? t : new Promise((u, h) => {
    w = u, y = h;
  });
}
var Yh, rh, _x = me(() => {
  "use strict";
  Yh = th, rh = globalThis.self?.name?.startsWith("em-pthread"), rh && th();
}), Ni, Zi, nh, yt, Jh, Ha, ah, sh, Bi, ih, $i, Zh, Di, Kh, io = me(() => {
  "use strict";
  so(), Ni = typeof location > "u" ? void 0 : location.origin, Zi = import.meta.url > "file:" && import.meta.url < "file;", nh = () => {
    if (Zi) {
      let e = URL;
      return new URL(new e("ort.webgpu.bundle.min.mjs", import.meta.url).href, Ni).href;
    }
    return import.meta.url;
  }, yt = nh(), Jh = () => {
    if (yt && !yt.startsWith("blob:")) return yt.substring(0, yt.lastIndexOf("/") + 1);
  }, Ha = (e, t) => {
    try {
      let r = t ?? yt;
      return (r ? new URL(e, r) : new URL(e)).origin === Ni;
    } catch {
      return !1;
    }
  }, ah = (e, t) => {
    let r = t ?? yt;
    try {
      return (r ? new URL(e, r) : new URL(e)).href;
    } catch {
      return;
    }
  }, sh = (e, t) => `${t ?? "./"}${e}`, Bi = async (e) => {
    let t = await (await fetch(e, { credentials: "same-origin" })).blob();
    return URL.createObjectURL(t);
  }, ih = async (e) => (await import(
    /*webpackIgnore:true*/
    /*@vite-ignore*/
    e
  )).default, $i = (hx(), Za(Hh)).default, Zh = async () => {
    if (!yt) throw new Error("Failed to load proxy worker: cannot determine the script source URL.");
    if (Ha(yt)) return [void 0, $i()];
    let e = await Bi(yt);
    return [e, $i(e)];
  }, Di = (_x(), Za(Xh)).default, Kh = async (e, t, r, n) => {
    let a = Di && !(e || t);
    if (a) if (yt) a = Ha(yt) || n && !r;
    else if (n && !r) a = !0;
    else throw new Error("cannot determine the script source URL.");
    if (a) return [void 0, Di];
    {
      let s = "ort-wasm-simd-threaded.asyncify.mjs", i = e ?? ah(s, t), o = r && i && !Ha(i, t), l = o ? await Bi(i) : i ?? sh(s, t);
      return [o ? l : void 0, await ih(l)];
    }
  };
}), Ri, Qa, Zn, Gi, oh, lh, ch, oo, Ie, Yr = me(() => {
  "use strict";
  io(), Qa = !1, Zn = !1, Gi = !1, oh = () => {
    if (typeof SharedArrayBuffer > "u") return !1;
    try {
      return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
    } catch {
      return !1;
    }
  }, lh = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 30, 1, 28, 0, 65, 0, 253, 15, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 253, 186, 1, 26, 11]));
    } catch {
      return !1;
    }
  }, ch = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 19, 1, 17, 0, 65, 1, 253, 15, 65, 2, 253, 15, 65, 3, 253, 15, 253, 147, 2, 11]));
    } catch {
      return !1;
    }
  }, oo = async (e) => {
    if (Qa) return Promise.resolve();
    if (Zn) throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
    if (Gi) throw new Error("previous call to 'initializeWebAssembly()' failed.");
    Zn = !0;
    let t = e.initTimeout, r = e.numThreads;
    if (e.simd !== !1) {
      if (e.simd === "relaxed") {
        if (!ch()) throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.");
      } else if (!lh()) throw new Error("WebAssembly SIMD is not supported in the current environment.");
    }
    let n = oh();
    r > 1 && !n && (typeof self < "u" && !self.crossOriginIsolated && console.warn("env.wasm.numThreads is set to " + r + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."), console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."), e.numThreads = r = 1);
    let a = e.wasmPaths, s = typeof a == "string" ? a : void 0, i = a?.mjs, o = i?.href ?? i, l = a?.wasm, c = l?.href ?? l, p = e.wasmBinary, [d, _] = await Kh(o, s, r > 1, !!p || !!c), f = !1, w = [];
    if (t > 0 && w.push(new Promise((y) => {
      setTimeout(() => {
        f = !0, y();
      }, t);
    })), w.push(new Promise((y, b) => {
      let x = { numThreads: r };
      if (p) x.wasmBinary = p, x.locateFile = (T) => T;
      else if (c || s) x.locateFile = (T) => c ?? s + T;
      else if (o && o.indexOf("blob:") !== 0) x.locateFile = (T) => new URL(T, o).href;
      else if (d) {
        let T = Jh();
        T && (x.locateFile = (A) => T + A);
      }
      _(x).then((T) => {
        Zn = !1, Qa = !0, Ri = T, y(), d && URL.revokeObjectURL(d);
      }, (T) => {
        Zn = !1, Gi = !0, b(T);
      });
    })), await Promise.race(w), f) throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`);
  }, Ie = () => {
    if (Qa && Ri) return Ri;
    throw new Error("WebAssembly is not initialized yet.");
  };
}), bt, es, xe, lo = me(() => {
  "use strict";
  Yr(), bt = (e, t) => {
    let r = Ie(), n = r.lengthBytesUTF8(e) + 1, a = r._malloc(n);
    return r.stringToUTF8(e, a, n), t.push(a), a;
  }, es = (e, t, r, n) => {
    if (typeof e == "object" && e !== null) {
      if (r.has(e)) throw new Error("Circular reference in options");
      r.add(e);
    }
    Object.entries(e).forEach(([a, s]) => {
      let i = t ? t + a : a;
      if (typeof s == "object") es(s, i + ".", r, n);
      else if (typeof s == "string" || typeof s == "number") n(i, s.toString());
      else if (typeof s == "boolean") n(i, s ? "1" : "0");
      else throw new Error(`Can't handle extra config type: ${typeof s}`);
    });
  }, xe = (e) => {
    let t = Ie(), r = t.stackSave();
    try {
      let n = t.PTR_SIZE, a = t.stackAlloc(2 * n);
      t._OrtGetLastError(a, a + n);
      let s = Number(t.getValue(a, n === 4 ? "i32" : "i64")), i = t.getValue(a + n, "*"), o = i ? t.UTF8ToString(i) : "";
      throw new Error(`${e} ERROR_CODE: ${s}, ERROR_MESSAGE: ${o}`);
    } finally {
      t.stackRestore(r);
    }
  };
}), e_, fx = me(() => {
  "use strict";
  Yr(), lo(), e_ = (e) => {
    let t = Ie(), r = 0, n = [], a = e || {};
    try {
      if (e?.logSeverityLevel === void 0) a.logSeverityLevel = 2;
      else if (typeof e.logSeverityLevel != "number" || !Number.isInteger(e.logSeverityLevel) || e.logSeverityLevel < 0 || e.logSeverityLevel > 4) throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);
      if (e?.logVerbosityLevel === void 0) a.logVerbosityLevel = 0;
      else if (typeof e.logVerbosityLevel != "number" || !Number.isInteger(e.logVerbosityLevel)) throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);
      e?.terminate === void 0 && (a.terminate = !1);
      let s = 0;
      return e?.tag !== void 0 && (s = bt(e.tag, n)), r = t._OrtCreateRunOptions(a.logSeverityLevel, a.logVerbosityLevel, !!a.terminate, s), r === 0 && xe("Can't create run options."), e?.extra !== void 0 && es(e.extra, "", /* @__PURE__ */ new WeakSet(), (i, o) => {
        let l = bt(i, n), c = bt(o, n);
        t._OrtAddRunConfigEntry(r, l, c) !== 0 && xe(`Can't set a run config entry: ${i} - ${o}.`);
      }), [r, n];
    } catch (s) {
      throw r !== 0 && t._OrtReleaseRunOptions(r), n.forEach((i) => t._free(i)), s;
    }
  };
}), uh, dh, ph, hn, Yt, hh, t_, mx = me(() => {
  "use strict";
  Yr(), lo(), uh = (e) => {
    switch (e) {
      case "disabled":
        return 0;
      case "basic":
        return 1;
      case "extended":
        return 2;
      case "layout":
        return 3;
      case "all":
        return 99;
      default:
        throw new Error(`unsupported graph optimization level: ${e}`);
    }
  }, dh = (e) => {
    switch (e) {
      case "sequential":
        return 0;
      case "parallel":
        return 1;
      default:
        throw new Error(`unsupported execution mode: ${e}`);
    }
  }, ph = (e) => {
    e.extra || (e.extra = {}), e.extra.session || (e.extra.session = {});
    let t = e.extra.session;
    t.use_ort_model_bytes_directly || (t.use_ort_model_bytes_directly = "1"), e.executionProviders && e.executionProviders.some((r) => (typeof r == "string" ? r : r.name) === "webgpu") && (e.enableMemPattern = !1);
  }, hn = (e, t, r, n) => {
    let a = bt(t, n), s = bt(r, n);
    Ie()._OrtAddSessionConfigEntry(e, a, s) !== 0 && xe(`Can't set a session config entry: ${t} - ${r}.`);
  }, Yt = (e, t, r, n) => {
    let a = bt(t, n), s = bt(r, n);
    e.push([a, s]);
  }, hh = async (e, t, r) => {
    let n = t.executionProviders;
    for (let a of n) {
      let s = typeof a == "string" ? a : a.name, i = [];
      switch (s) {
        case "webnn":
          if (s = "WEBNN", hn(e, "session.disable_quant_qdq", "1", r), hn(e, "session.disable_qdq_constant_folding", "1", r), typeof a != "string") {
            let d = a?.deviceType;
            d && hn(e, "deviceType", d, r);
          }
          break;
        case "webgpu":
          {
            s = "WebGPU";
            let d;
            if (typeof a != "string") {
              let f = a;
              if (f.device) if (typeof GPUDevice < "u" && f.device instanceof GPUDevice) d = f.device;
              else throw new Error("Invalid GPU device set in WebGPU EP options.");
              let { enableGraphCapture: w } = t;
              if (typeof w == "boolean" && w && Yt(i, "enableGraphCapture", "1", r), typeof f.preferredLayout == "string" && Yt(i, "preferredLayout", f.preferredLayout, r), f.forceCpuNodeNames) {
                let y = Array.isArray(f.forceCpuNodeNames) ? f.forceCpuNodeNames : [f.forceCpuNodeNames];
                Yt(i, "forceCpuNodeNames", y.join(`
`), r);
              }
              f.validationMode && Yt(i, "validationMode", f.validationMode, r), typeof f.enableMatmulFp32Accumulation == "boolean" && Yt(i, "enableMatmulFp32Accumulation", f.enableMatmulFp32Accumulation ? "1" : "0", r);
              for (let y of ["storageBufferCacheMode", "uniformBufferCacheMode", "queryResolveBufferCacheMode", "defaultBufferCacheMode"]) {
                let b = f[y];
                if (b) {
                  if (b !== "disabled" && b !== "lazyRelease" && b !== "simple" && b !== "bucket") throw new Error(`${y} must be one of 'disabled', 'lazyRelease', 'simple' or 'bucket': ${b}`);
                  Yt(i, y, b, r);
                }
              }
            }
            let _ = Ie().webgpuRegisterDevice(d);
            if (_) {
              let [f, w, y] = _;
              Yt(i, "deviceId", f.toString(), r), Yt(i, "webgpuInstance", w.toString(), r), Yt(i, "webgpuDevice", y.toString(), r);
            }
          }
          break;
        case "wasm":
        case "cpu":
          continue;
        default:
          throw new Error(`not supported execution provider: ${s}`);
      }
      let o = bt(s, r), l = i.length, c = 0, p = 0;
      if (l > 0) {
        c = Ie()._malloc(l * Ie().PTR_SIZE), r.push(c), p = Ie()._malloc(l * Ie().PTR_SIZE), r.push(p);
        for (let d = 0; d < l; d++) Ie().setValue(c + d * Ie().PTR_SIZE, i[d][0], "*"), Ie().setValue(p + d * Ie().PTR_SIZE, i[d][1], "*");
      }
      await Ie()._OrtAppendExecutionProvider(e, o, c, p, l) !== 0 && xe(`Can't append execution provider: ${s}.`);
    }
  }, t_ = async (e) => {
    let t = Ie(), r = 0, n = [], a = e || {};
    ph(a);
    try {
      let s = uh(a.graphOptimizationLevel ?? "all"), i = dh(a.executionMode ?? "sequential"), o = typeof a.logId == "string" ? bt(a.logId, n) : 0, l = a.logSeverityLevel ?? 2;
      if (!Number.isInteger(l) || l < 0 || l > 4) throw new Error(`log severity level is not valid: ${l}`);
      let c = a.logVerbosityLevel ?? 0;
      if (!Number.isInteger(c) || c < 0 || c > 4) throw new Error(`log verbosity level is not valid: ${c}`);
      let p = typeof a.optimizedModelFilePath == "string" ? bt(a.optimizedModelFilePath, n) : 0;
      if (r = t._OrtCreateSessionOptions(s, !!a.enableCpuMemArena, !!a.enableMemPattern, i, !!a.enableProfiling, 0, o, l, c, p), r === 0 && xe("Can't create session options."), a.executionProviders && await hh(r, a, n), a.enableGraphCapture !== void 0) {
        if (typeof a.enableGraphCapture != "boolean") throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);
        hn(r, "enableGraphCapture", a.enableGraphCapture.toString(), n);
      }
      if (a.freeDimensionOverrides) for (let [d, _] of Object.entries(a.freeDimensionOverrides)) {
        if (typeof d != "string") throw new Error(`free dimension override name must be a string: ${d}`);
        if (typeof _ != "number" || !Number.isInteger(_) || _ < 0) throw new Error(`free dimension override value must be a non-negative integer: ${_}`);
        let f = bt(d, n);
        t._OrtAddFreeDimensionOverride(r, f, _) !== 0 && xe(`Can't set a free dimension override: ${d} - ${_}.`);
      }
      return a.extra !== void 0 && es(a.extra, "", /* @__PURE__ */ new WeakSet(), (d, _) => {
        hn(r, d, _, n);
      }), [r, n];
    } catch (s) {
      throw r !== 0 && t._OrtReleaseSessionOptions(r) !== 0 && xe("Can't release session options."), n.forEach((i) => t._free(i)), s;
    }
  };
}), jr, Ja, fn, na, ts, co, uo, Ki, mn = me(() => {
  "use strict";
  jr = (e) => {
    switch (e) {
      case "int8":
        return 3;
      case "uint8":
        return 2;
      case "bool":
        return 9;
      case "int16":
        return 5;
      case "uint16":
        return 4;
      case "int32":
        return 6;
      case "uint32":
        return 12;
      case "float16":
        return 10;
      case "float32":
        return 1;
      case "float64":
        return 11;
      case "string":
        return 8;
      case "int64":
        return 7;
      case "uint64":
        return 13;
      case "int4":
        return 22;
      case "uint4":
        return 21;
      default:
        throw new Error(`unsupported data type: ${e}`);
    }
  }, Ja = (e) => {
    switch (e) {
      case 3:
        return "int8";
      case 2:
        return "uint8";
      case 9:
        return "bool";
      case 5:
        return "int16";
      case 4:
        return "uint16";
      case 6:
        return "int32";
      case 12:
        return "uint32";
      case 10:
        return "float16";
      case 1:
        return "float32";
      case 11:
        return "float64";
      case 8:
        return "string";
      case 7:
        return "int64";
      case 13:
        return "uint64";
      case 22:
        return "int4";
      case 21:
        return "uint4";
      default:
        throw new Error(`unsupported data type: ${e}`);
    }
  }, fn = (e, t) => {
    let r = [-1, 4, 1, 1, 2, 2, 4, 8, -1, 1, 2, 8, 4, 8, -1, -1, -1, -1, -1, -1, -1, 0.5, 0.5][e], n = typeof t == "number" ? t : t.reduce((a, s) => a * s, 1);
    return r > 0 ? Math.ceil(n * r) : void 0;
  }, na = (e) => {
    switch (e) {
      case "float16":
        return typeof Float16Array < "u" ? Float16Array : Uint16Array;
      case "float32":
        return Float32Array;
      case "uint8":
        return Uint8Array;
      case "int8":
        return Int8Array;
      case "uint16":
        return Uint16Array;
      case "int16":
        return Int16Array;
      case "int32":
        return Int32Array;
      case "bool":
        return Uint8Array;
      case "float64":
        return Float64Array;
      case "uint32":
        return Uint32Array;
      case "int64":
        return BigInt64Array;
      case "uint64":
        return BigUint64Array;
      default:
        throw new Error(`unsupported type: ${e}`);
    }
  }, ts = (e) => {
    switch (e) {
      case "verbose":
        return 0;
      case "info":
        return 1;
      case "warning":
        return 2;
      case "error":
        return 3;
      case "fatal":
        return 4;
      default:
        throw new Error(`unsupported logging level: ${e}`);
    }
  }, co = (e) => e === "float32" || e === "float16" || e === "int32" || e === "int64" || e === "uint32" || e === "uint8" || e === "bool" || e === "uint4" || e === "int4", uo = (e) => e === "float32" || e === "float16" || e === "int32" || e === "int64" || e === "uint32" || e === "uint64" || e === "int8" || e === "uint8" || e === "bool" || e === "uint4" || e === "int4", Ki = (e) => {
    switch (e) {
      case "none":
        return 0;
      case "cpu":
        return 1;
      case "cpu-pinned":
        return 2;
      case "texture":
        return 3;
      case "gpu-buffer":
        return 4;
      case "ml-tensor":
        return 5;
      default:
        throw new Error(`unsupported data location: ${e}`);
    }
  };
}), po, r_ = me(() => {
  "use strict";
  so(), po = async (e) => {
    if (typeof e == "string") {
      let t = await fetch(e);
      if (!t.ok) throw new Error(`failed to load external data file: ${e}`);
      let r = t.headers.get("Content-Length"), n = r ? parseInt(r, 10) : 0;
      if (n < 1073741824) return new Uint8Array(await t.arrayBuffer());
      {
        if (!t.body) throw new Error(`failed to load external data file: ${e}, no response body.`);
        let a = t.body.getReader(), s;
        try {
          s = new ArrayBuffer(n);
        } catch (o) {
          if (o instanceof RangeError) {
            let l = Math.ceil(n / 65536);
            s = new WebAssembly.Memory({ initial: l, maximum: l }).buffer;
          } else throw o;
        }
        let i = 0;
        for (; ; ) {
          let { done: o, value: l } = await a.read();
          if (o) break;
          let c = l.byteLength;
          new Uint8Array(s, i, c).set(l), i += c;
        }
        return new Uint8Array(s, 0, n);
      }
    } else return e instanceof Blob ? new Uint8Array(await e.arrayBuffer()) : e instanceof Uint8Array ? e : new Uint8Array(e);
  };
}), n_, gx = me(() => {
  "use strict";
  mn(), n_ = (e, t) => new (na(t))(e);
}), _h, fh, mh, gh, a_, wh, ft, s_ = me(() => {
  "use strict";
  mn(), _h = ["V", "I", "W", "E", "F"], fh = (e, t) => {
    console.log(`[${_h[e]},${(/* @__PURE__ */ new Date()).toISOString()}]${t}`);
  }, a_ = (e, t) => {
    mh = e, gh = t;
  }, wh = (e, t) => {
    let r = ts(e), n = ts(mh);
    r >= n && fh(r, typeof t == "function" ? t() : t);
  }, ft = (...e) => {
    gh && wh(...e);
  };
}), Vi, yh, Ui, bh, qi, vh, ji, Wi, Hi, xh, i_, wx = me(() => {
  "use strict";
  mn(), s_(), Vi = /* @__PURE__ */ new Map([["float32", 32], ["float16", 16], ["int32", 32], ["uint32", 32], ["int64", 64], ["uint64", 64], ["int8", 8], ["uint8", 8], ["int4", 4], ["uint4", 4]]), yh = (e, t) => {
    if (t === "int32") return e;
    let r = Vi.get(t);
    if (!r) throw new Error(`WebNN backend does not support data type: ${t}`);
    let n = r / 8;
    if (e.byteLength % n !== 0) throw new Error(`Invalid Uint8Array length - must be a multiple of ${n}.`);
    let a = e.byteLength / n, s = new (na(t))(e.buffer, e.byteOffset, a);
    switch (t) {
      case "int64":
      case "uint64": {
        let i = new Int32Array(a);
        for (let o = 0; o < a; o++) {
          let l = s[o];
          if (l > 2147483647n || l < -2147483648n) throw new Error("Can not convert int64 data to int32 - value out of range.");
          i[o] = Number(l);
        }
        return new Uint8Array(i.buffer);
      }
      case "int8":
      case "uint8":
      case "uint32": {
        if (t === "uint32" && s.some((o) => o > 2147483647)) throw new Error("Can not convert uint32 data to int32 - value out of range.");
        let i = Int32Array.from(s, Number);
        return new Uint8Array(i.buffer);
      }
      default:
        throw new Error(`Unsupported data conversion from ${t} to 'int32'`);
    }
  }, Ui = (e, t) => {
    if (t === "int32") return e;
    if (e.byteLength % 4 !== 0) throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");
    let r = e.byteLength / 4, n = new Int32Array(e.buffer, e.byteOffset, r);
    switch (t) {
      case "int64": {
        let a = BigInt64Array.from(n, BigInt);
        return new Uint8Array(a.buffer);
      }
      case "uint64": {
        if (n.some((s) => s < 0)) throw new Error("Can not convert int32 data to uin64 - negative value found.");
        let a = BigUint64Array.from(n, BigInt);
        return new Uint8Array(a.buffer);
      }
      case "int8": {
        if (n.some((s) => s < -128 || s > 127)) throw new Error("Can not convert int32 data to int8 - value out of range.");
        let a = Int8Array.from(n, Number);
        return new Uint8Array(a.buffer);
      }
      case "uint8": {
        if (n.some((a) => a < 0 || a > 255)) throw new Error("Can not convert int32 data to uint8 - value out of range.");
        return Uint8Array.from(n, Number);
      }
      case "uint32": {
        if (n.some((s) => s < 0)) throw new Error("Can not convert int32 data to uint32 - negative value found.");
        let a = Uint32Array.from(n, Number);
        return new Uint8Array(a.buffer);
      }
      default:
        throw new Error(`Unsupported data conversion from 'int32' to ${t}`);
    }
  }, bh = 1, qi = () => bh++, vh = /* @__PURE__ */ new Map([["int8", "int32"], ["uint8", "int32"], ["uint32", "int32"], ["int64", "int32"]]), ji = (e, t) => {
    let r = Vi.get(e);
    if (!r) throw new Error(`WebNN backend does not support data type: ${e}`);
    return t.length > 0 ? Math.ceil(t.reduce((n, a) => n * a) * r / 8) : 0;
  }, Wi = class {
    constructor(e) {
      this.isDataConverted = !1;
      let { sessionId: t, context: r, tensor: n, dataType: a, shape: s, fallbackDataType: i } = e;
      this.sessionId = t, this.mlContext = r, this.mlTensor = n, this.dataType = a, this.tensorShape = s, this.fallbackDataType = i;
    }
    get tensor() {
      return this.mlTensor;
    }
    get type() {
      return this.dataType;
    }
    get fallbackType() {
      return this.fallbackDataType;
    }
    get shape() {
      return this.tensorShape;
    }
    get byteLength() {
      return ji(this.dataType, this.tensorShape);
    }
    destroy() {
      ft("verbose", () => "[WebNN] TensorWrapper.destroy"), this.mlTensor.destroy();
    }
    write(e) {
      this.mlContext.writeTensor(this.mlTensor, e);
    }
    async read(e) {
      if (this.fallbackDataType) {
        let t = await this.mlContext.readTensor(this.mlTensor), r = Ui(new Uint8Array(t), this.dataType);
        if (e) {
          (e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength)).set(r);
          return;
        } else return new Uint8Array(r).buffer;
      } else return e ? this.mlContext.readTensor(this.mlTensor, e) : this.mlContext.readTensor(this.mlTensor);
    }
    canReuseTensor(e, t, r) {
      return this.mlContext === e && this.dataType === t && this.tensorShape.length === r.length && this.tensorShape.every((n, a) => n === r[a]);
    }
    setIsDataConverted(e) {
      this.isDataConverted = e;
    }
  }, Hi = class {
    constructor(e, t) {
      this.tensorManager = e, this.wrapper = t;
    }
    get tensorWrapper() {
      return this.wrapper;
    }
    releaseTensor() {
      this.tensorWrapper && (this.tensorManager.releaseTensor(this.tensorWrapper), this.wrapper = void 0);
    }
    async ensureTensor(e, t, r, n) {
      let a = this.tensorManager.getMLContext(e), s = this.tensorManager.getMLOpSupportLimits(e), i;
      if (!s?.input.dataTypes.includes(t)) {
        if (i = vh.get(t), !i || !s?.input.dataTypes.includes(i)) throw new Error(`WebNN backend does not support data type: ${t}`);
        ft("verbose", () => `[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${i}`);
      }
      if (this.wrapper) {
        if (this.wrapper.canReuseTensor(a, t, r)) return this.wrapper.tensor;
        if (n) {
          if (this.wrapper.byteLength !== ji(t, r)) throw new Error("Unable to copy data to tensor with different size.");
          this.activeUpload = new Uint8Array(await this.wrapper.read());
        }
        this.tensorManager.releaseTensor(this.wrapper);
      }
      let o = typeof MLTensorUsage > "u" ? void 0 : MLTensorUsage.READ | MLTensorUsage.WRITE;
      return this.wrapper = await this.tensorManager.getCachedTensor(e, t, r, o, !0, !0, i), n && this.activeUpload && (this.wrapper.write(this.activeUpload), this.activeUpload = void 0), this.wrapper.tensor;
    }
    upload(e) {
      let t = e;
      if (this.wrapper) {
        if (this.wrapper.fallbackType) if (this.wrapper.fallbackType === "int32") t = yh(e, this.wrapper.type), this.wrapper.setIsDataConverted(!0);
        else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);
        if (e.byteLength === this.wrapper.byteLength) {
          this.wrapper.write(t);
          return;
        } else ft("verbose", () => "Data size does not match tensor size. Releasing tensor."), this.releaseTensor();
      }
      this.activeUpload ? this.activeUpload.set(t) : this.activeUpload = new Uint8Array(t);
    }
    async download(e) {
      if (this.activeUpload) {
        let t = this.wrapper?.isDataConverted ? Ui(this.activeUpload, this.wrapper?.type) : this.activeUpload;
        if (e) {
          e instanceof ArrayBuffer ? new Uint8Array(e).set(t) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength).set(t);
          return;
        } else return t.buffer;
      }
      if (!this.wrapper) throw new Error("Tensor has not been created.");
      return e ? this.wrapper.read(e) : this.wrapper.read();
    }
  }, xh = class {
    constructor(e) {
      this.backend = e, this.tensorTrackersById = /* @__PURE__ */ new Map(), this.freeTensors = [], this.externalTensors = /* @__PURE__ */ new Set();
    }
    getMLContext(e) {
      let t = this.backend.getMLContext(e);
      if (!t) throw new Error("MLContext not found for session.");
      return t;
    }
    getMLOpSupportLimits(e) {
      return this.backend.getMLOpSupportLimits(e);
    }
    reserveTensorId() {
      let e = qi();
      return this.tensorTrackersById.set(e, new Hi(this)), e;
    }
    releaseTensorId(e) {
      let t = this.tensorTrackersById.get(e);
      t && (this.tensorTrackersById.delete(e), t.tensorWrapper && this.releaseTensor(t.tensorWrapper));
    }
    async ensureTensor(e, t, r, n, a) {
      ft("verbose", () => `[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${n}, copyOld: ${a}}`);
      let s = this.tensorTrackersById.get(t);
      if (!s) throw new Error("Tensor not found.");
      return s.ensureTensor(e, r, n, a);
    }
    upload(e, t) {
      let r = this.tensorTrackersById.get(e);
      if (!r) throw new Error("Tensor not found.");
      r.upload(t);
    }
    async download(e, t) {
      ft("verbose", () => `[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);
      let r = this.tensorTrackersById.get(e);
      if (!r) throw new Error("Tensor not found.");
      return r.download(t);
    }
    releaseTensorsForSession(e) {
      for (let t of this.freeTensors) t.sessionId === e && t.destroy();
      this.freeTensors = this.freeTensors.filter((t) => t.sessionId !== e);
    }
    registerTensor(e, t, r, n) {
      let a = this.getMLContext(e), s = qi(), i = new Wi({ sessionId: e, context: a, tensor: t, dataType: r, shape: n });
      return this.tensorTrackersById.set(s, new Hi(this, i)), this.externalTensors.add(i), s;
    }
    async getCachedTensor(e, t, r, n, a, s, i) {
      let o = this.getMLContext(e);
      for (let [c, p] of this.freeTensors.entries()) if (p.canReuseTensor(o, t, r)) {
        ft("verbose", () => `[WebNN] Reusing tensor {dataType: ${t}, ${i ? `fallbackDataType: ${i},` : ""} shape: ${r}`);
        let d = this.freeTensors.splice(c, 1)[0];
        return d.sessionId = e, d;
      }
      ft("verbose", () => `[WebNN] MLContext.createTensor {dataType: ${t}, ${i ? `fallbackDataType: ${i},` : ""} shape: ${r}}`);
      let l = await o.createTensor({ dataType: i ?? t, shape: r, dimensions: r, usage: n, writable: a, readable: s });
      return new Wi({ sessionId: e, context: o, tensor: l, dataType: t, shape: r, fallbackDataType: i });
    }
    releaseTensor(e) {
      this.externalTensors.has(e) && this.externalTensors.delete(e), this.freeTensors.push(e);
    }
  }, i_ = (...e) => new xh(...e);
}), o_ = {};
aa(o_, { WebNNBackend: () => l_ });
var Kn, Mh, l_, yx = me(() => {
  "use strict";
  mn(), Yr(), gx(), wx(), s_(), Kn = /* @__PURE__ */ new Map([[1, "float32"], [10, "float16"], [6, "int32"], [12, "uint32"], [7, "int64"], [13, "uint64"], [22, "int4"], [21, "uint4"], [3, "int8"], [2, "uint8"], [9, "uint8"]]), Mh = (e, t) => {
    if (e === t) return !0;
    if (e === void 0 || t === void 0) return !1;
    let r = Object.keys(e).sort(), n = Object.keys(t).sort();
    return r.length === n.length && r.every((a, s) => a === n[s] && e[a] === t[a]);
  }, l_ = class {
    constructor(e) {
      this.tensorManager = i_(this), this.mlContextBySessionId = /* @__PURE__ */ new Map(), this.sessionIdsByMLContext = /* @__PURE__ */ new Map(), this.mlContextCache = [], this.sessionGraphInputs = /* @__PURE__ */ new Map(), this.sessionGraphOutputs = /* @__PURE__ */ new Map(), this.temporaryGraphInputs = [], this.temporaryGraphOutputs = [], this.temporarySessionTensorIds = /* @__PURE__ */ new Map(), this.mlOpSupportLimitsBySessionId = /* @__PURE__ */ new Map(), a_(e.logLevel, !!e.debug);
    }
    get currentSessionId() {
      if (this.activeSessionId === void 0) throw new Error("No active session");
      return this.activeSessionId;
    }
    onRunStart(e) {
      ft("verbose", () => `[WebNN] onRunStart {sessionId: ${e}}`), this.activeSessionId = e;
    }
    onRunEnd(e) {
      ft("verbose", () => `[WebNN] onRunEnd {sessionId: ${e}}`);
      let t = this.temporarySessionTensorIds.get(e);
      if (t) {
        for (let r of t) ft("verbose", () => `[WebNN] releasing temporary tensor {tensorId: ${r}}`), this.tensorManager.releaseTensorId(r);
        this.temporarySessionTensorIds.delete(e), this.activeSessionId = void 0;
      }
    }
    async createMLContext(e) {
      if (e instanceof GPUDevice) {
        let r = this.mlContextCache.findIndex((n) => n.gpuDevice === e);
        if (r !== -1) return this.mlContextCache[r].mlContext;
        {
          let n = await navigator.ml.createContext(e);
          return this.mlContextCache.push({ gpuDevice: e, mlContext: n }), n;
        }
      } else if (e === void 0) {
        let r = this.mlContextCache.findIndex((n) => n.options === void 0 && n.gpuDevice === void 0);
        if (r !== -1) return this.mlContextCache[r].mlContext;
        {
          let n = await navigator.ml.createContext();
          return this.mlContextCache.push({ mlContext: n }), n;
        }
      }
      let t = this.mlContextCache.findIndex((r) => Mh(r.options, e));
      if (t !== -1) return this.mlContextCache[t].mlContext;
      {
        let r = await navigator.ml.createContext(e);
        return this.mlContextCache.push({ options: e, mlContext: r }), r;
      }
    }
    registerMLContext(e, t) {
      this.mlContextBySessionId.set(e, t);
      let r = this.sessionIdsByMLContext.get(t);
      r || (r = /* @__PURE__ */ new Set(), this.sessionIdsByMLContext.set(t, r)), r.add(e), this.mlOpSupportLimitsBySessionId.has(e) || this.mlOpSupportLimitsBySessionId.set(e, t.opSupportLimits()), this.temporaryGraphInputs.length > 0 && (this.sessionGraphInputs.set(e, this.temporaryGraphInputs), this.temporaryGraphInputs = []), this.temporaryGraphOutputs.length > 0 && (this.sessionGraphOutputs.set(e, this.temporaryGraphOutputs), this.temporaryGraphOutputs = []);
    }
    onReleaseSession(e) {
      this.sessionGraphInputs.delete(e), this.sessionGraphOutputs.delete(e);
      let t = this.mlContextBySessionId.get(e);
      if (!t) return;
      this.tensorManager.releaseTensorsForSession(e), this.mlContextBySessionId.delete(e), this.mlOpSupportLimitsBySessionId.delete(e);
      let r = this.sessionIdsByMLContext.get(t);
      if (r.delete(e), r.size === 0) {
        this.sessionIdsByMLContext.delete(t);
        let n = this.mlContextCache.findIndex((a) => a.mlContext === t);
        n !== -1 && this.mlContextCache.splice(n, 1);
      }
    }
    getMLContext(e) {
      return this.mlContextBySessionId.get(e);
    }
    getMLOpSupportLimits(e) {
      return this.mlOpSupportLimitsBySessionId.get(e);
    }
    reserveTensorId() {
      return this.tensorManager.reserveTensorId();
    }
    releaseTensorId(e) {
      ft("verbose", () => `[WebNN] releaseTensorId {tensorId: ${e}}`), this.tensorManager.releaseTensorId(e);
    }
    async ensureTensor(e, t, r, n, a) {
      let s = Kn.get(r);
      if (!s) throw new Error(`Unsupported ONNX data type: ${r}`);
      return this.tensorManager.ensureTensor(e ?? this.currentSessionId, t, s, n, a);
    }
    async createTemporaryTensor(e, t, r) {
      ft("verbose", () => `[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);
      let n = Kn.get(t);
      if (!n) throw new Error(`Unsupported ONNX data type: ${t}`);
      let a = this.tensorManager.reserveTensorId();
      await this.tensorManager.ensureTensor(e, a, n, r, !1);
      let s = this.temporarySessionTensorIds.get(e);
      return s ? s.push(a) : this.temporarySessionTensorIds.set(e, [a]), a;
    }
    uploadTensor(e, t) {
      if (!Ie().shouldTransferToMLTensor) throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");
      ft("verbose", () => `[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`), this.tensorManager.upload(e, t);
    }
    async downloadTensor(e, t) {
      return this.tensorManager.download(e, t);
    }
    createMLTensorDownloader(e, t) {
      return async () => {
        let r = await this.tensorManager.download(e);
        return n_(r, t);
      };
    }
    registerMLTensor(e, t, r, n) {
      let a = Kn.get(r);
      if (!a) throw new Error(`Unsupported ONNX data type: ${r}`);
      let s = this.tensorManager.registerTensor(e, t, a, n);
      return ft("verbose", () => `[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${n}} -> {tensorId: ${s}}`), s;
    }
    registerGraphInput(e) {
      this.temporaryGraphInputs.push(e);
    }
    registerGraphOutput(e) {
      this.temporaryGraphOutputs.push(e);
    }
    isGraphInput(e, t) {
      let r = this.sessionGraphInputs.get(e);
      return r ? r.includes(t) : !1;
    }
    isGraphOutput(e, t) {
      let r = this.sessionGraphOutputs.get(e);
      return r ? r.includes(t) : !1;
    }
    isGraphInputOutputTypeSupported(e, t, r = !0) {
      let n = Kn.get(jr(t)), a = this.mlOpSupportLimitsBySessionId.get(e);
      return typeof n > "u" ? !1 : r ? !!a?.input.dataTypes.includes(n) : !!a?.output.dataTypes.includes(n);
    }
    flush() {
    }
  };
}), kh, ho, _o, vr, Th, Qi, rs, fo, mo, Xi, go, wo, yo, c_ = me(() => {
  "use strict";
  Xr(), fx(), mx(), mn(), Yr(), lo(), r_(), kh = (e, t) => {
    Ie()._OrtInit(e, t) !== 0 && xe("Can't initialize onnxruntime.");
  }, ho = async (e) => {
    kh(e.wasm.numThreads, ts(e.logLevel));
  }, _o = async (e, t) => {
    Ie().asyncInit?.();
    let r = e.webgpu.adapter;
    if (t === "webgpu") {
      if (typeof navigator > "u" || !navigator.gpu) throw new Error("WebGPU is not supported in current environment");
      if (r) {
        if (typeof r.limits != "object" || typeof r.features != "object" || typeof r.requestDevice != "function") throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
      } else {
        let n = e.webgpu.powerPreference;
        if (n !== void 0 && n !== "low-power" && n !== "high-performance") throw new Error(`Invalid powerPreference setting: "${n}"`);
        let a = e.webgpu.forceFallbackAdapter;
        if (a !== void 0 && typeof a != "boolean") throw new Error(`Invalid forceFallbackAdapter setting: "${a}"`);
        if (r = await navigator.gpu.requestAdapter({ powerPreference: n, forceFallbackAdapter: a }), !r) throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.');
      }
    }
    if (t === "webnn" && (typeof navigator > "u" || !navigator.ml)) throw new Error("WebNN is not supported in current environment");
    if (t === "webgpu" && Ie().webgpuInit((n) => {
      e.webgpu.device = n;
    }), t === "webnn") {
      let n = new (yx(), Za(o_)).WebNNBackend(e);
      Ie().webnnInit([n, () => n.reserveTensorId(), (a) => n.releaseTensorId(a), async (a, s, i, o, l) => n.ensureTensor(a, s, i, o, l), (a, s) => {
        n.uploadTensor(a, s);
      }, async (a, s) => n.downloadTensor(a, s), (a, s) => n.registerMLContext(a, s), !!e.trace]);
    }
  }, vr = /* @__PURE__ */ new Map(), Th = (e) => {
    let t = Ie(), r = t.stackSave();
    try {
      let n = t.PTR_SIZE, a = t.stackAlloc(2 * n);
      t._OrtGetInputOutputCount(e, a, a + n) !== 0 && xe("Can't get session input/output count.");
      let s = n === 4 ? "i32" : "i64";
      return [Number(t.getValue(a, s)), Number(t.getValue(a + n, s))];
    } finally {
      t.stackRestore(r);
    }
  }, Qi = (e, t) => {
    let r = Ie(), n = r.stackSave(), a = 0;
    try {
      let s = r.PTR_SIZE, i = r.stackAlloc(2 * s);
      r._OrtGetInputOutputMetadata(e, t, i, i + s) !== 0 && xe("Can't get session input/output metadata.");
      let o = Number(r.getValue(i, "*"));
      a = Number(r.getValue(i + s, "*"));
      let l = r.HEAP32[a / 4];
      if (l === 0) return [o, 0];
      let c = r.HEAPU32[a / 4 + 1], p = [];
      for (let d = 0; d < c; d++) {
        let _ = Number(r.getValue(a + 8 + d * s, "*"));
        p.push(_ !== 0 ? r.UTF8ToString(_) : Number(r.getValue(a + 8 + (d + c) * s, "*")));
      }
      return [o, l, p];
    } finally {
      r.stackRestore(n), a !== 0 && r._OrtFree(a);
    }
  }, rs = (e) => {
    let t = Ie(), r = t._malloc(e.byteLength);
    if (r === 0) throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);
    return t.HEAPU8.set(e, r), [r, e.byteLength];
  }, fo = async (e, t) => {
    let r, n, a = Ie();
    Array.isArray(e) ? [r, n] = e : e.buffer === a.HEAPU8.buffer ? [r, n] = [e.byteOffset, e.byteLength] : [r, n] = rs(e);
    let s = 0, i = 0, o = 0, l = [], c = [], p = [];
    try {
      if ([i, l] = await t_(t), t?.externalData && a.mountExternalData) {
        let E = [];
        for (let S of t.externalData) {
          let O = typeof S == "string" ? S : S.path, M = typeof S == "string" ? S : S.data;
          E.push(po(M).then((G) => {
            a.mountExternalData(O, G);
          }));
        }
        await Promise.all(E);
      }
      for (let E of t?.executionProviders ?? []) if ((typeof E == "string" ? E : E.name) === "webnn") {
        if (a.shouldTransferToMLTensor = !1, typeof E != "string") {
          let S = E, O = S?.context, M = S?.gpuDevice, G = S?.deviceType, D = S?.powerPreference;
          O ? a.currentContext = O : M ? a.currentContext = await a.webnnCreateMLContext(M) : a.currentContext = await a.webnnCreateMLContext({ deviceType: G, powerPreference: D });
        } else a.currentContext = await a.webnnCreateMLContext();
        break;
      }
      s = await a._OrtCreateSession(r, n, i), a.webgpuOnCreateSession?.(s), s === 0 && xe("Can't create a session."), a.jsepOnCreateSession?.(), a.currentContext && (a.webnnRegisterMLContext(s, a.currentContext), a.currentContext = void 0, a.shouldTransferToMLTensor = !0);
      let [d, _] = Th(s), f = !!t?.enableGraphCapture, w = [], y = [], b = [], x = [], T = [];
      for (let E = 0; E < d; E++) {
        let [S, O, M] = Qi(s, E);
        S === 0 && xe("Can't get an input name."), c.push(S);
        let G = a.UTF8ToString(S);
        w.push(G), b.push(O === 0 ? { name: G, isTensor: !1 } : { name: G, isTensor: !0, type: Ja(O), shape: M });
      }
      for (let E = 0; E < _; E++) {
        let [S, O, M] = Qi(s, E + d);
        S === 0 && xe("Can't get an output name."), p.push(S);
        let G = a.UTF8ToString(S);
        y.push(G), x.push(O === 0 ? { name: G, isTensor: !1 } : { name: G, isTensor: !0, type: Ja(O), shape: M });
        {
          if (f && t?.preferredOutputLocation === void 0) {
            T.push("gpu-buffer");
            continue;
          }
          let D = typeof t?.preferredOutputLocation == "string" ? t.preferredOutputLocation : t?.preferredOutputLocation?.[G] ?? "cpu", U = a.webnnIsGraphOutput;
          if (D === "cpu" && U && U(s, G)) {
            T.push("ml-tensor-cpu-output");
            continue;
          }
          if (D !== "cpu" && D !== "cpu-pinned" && D !== "gpu-buffer" && D !== "ml-tensor") throw new Error(`Not supported preferred output location: ${D}.`);
          if (f && D !== "gpu-buffer") throw new Error(`Not supported preferred output location: ${D}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);
          T.push(D);
        }
      }
      let A = null;
      return T.some((E) => E === "gpu-buffer" || E === "ml-tensor" || E === "ml-tensor-cpu-output") && (o = a._OrtCreateBinding(s), o === 0 && xe("Can't create IO binding."), A = { handle: o, outputPreferredLocations: T, outputPreferredLocationsEncoded: T.map((E) => E === "ml-tensor-cpu-output" ? "ml-tensor" : E).map((E) => Ki(E)) }), vr.set(s, [s, c, p, A, f, !1]), [s, w, y, b, x];
    } catch (d) {
      throw c.forEach((_) => a._OrtFree(_)), p.forEach((_) => a._OrtFree(_)), o !== 0 && a._OrtReleaseBinding(o) !== 0 && xe("Can't release IO binding."), s !== 0 && a._OrtReleaseSession(s) !== 0 && xe("Can't release session."), d;
    } finally {
      a._free(r), i !== 0 && a._OrtReleaseSessionOptions(i) !== 0 && xe("Can't release session options."), l.forEach((d) => a._free(d)), a.unmountExternalData?.();
    }
  }, mo = (e) => {
    let t = Ie(), r = vr.get(e);
    if (!r) throw new Error(`cannot release session. invalid session id: ${e}`);
    let [n, a, s, i, o] = r;
    i && (o && t._OrtClearBoundOutputs(i.handle) !== 0 && xe("Can't clear bound outputs."), t._OrtReleaseBinding(i.handle) !== 0 && xe("Can't release IO binding.")), t.jsepOnReleaseSession?.(e), t.webnnOnReleaseSession?.(e), t.webgpuOnReleaseSession?.(e), a.forEach((l) => t._OrtFree(l)), s.forEach((l) => t._OrtFree(l)), t._OrtReleaseSession(n) !== 0 && xe("Can't release session."), vr.delete(e);
  }, Xi = async (e, t, r, n, a, s, i = !1) => {
    if (!e) {
      t.push(0);
      return;
    }
    let o = Ie(), l = o.PTR_SIZE, c = e[0], p = e[1], d = e[3], _ = d, f, w;
    if (c === "string" && (d === "gpu-buffer" || d === "ml-tensor")) throw new Error("String tensor is not supported on GPU.");
    if (i && d !== "gpu-buffer") throw new Error(`External buffer must be provided for input/output index ${s} when enableGraphCapture is true.`);
    if (d === "gpu-buffer") {
      let x = e[2].gpuBuffer;
      w = fn(jr(c), p);
      {
        let T = o.webgpuRegisterBuffer;
        if (!T) throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
        f = T(x, n);
      }
    } else if (d === "ml-tensor") {
      let x = e[2].mlTensor;
      w = fn(jr(c), p);
      let T = o.webnnRegisterMLTensor;
      if (!T) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
      f = T(n, x, jr(c), p);
    } else {
      let x = e[2];
      if (Array.isArray(x)) {
        w = l * x.length, f = o._malloc(w), r.push(f);
        for (let T = 0; T < x.length; T++) {
          if (typeof x[T] != "string") throw new TypeError(`tensor data at index ${T} is not a string`);
          o.setValue(f + T * l, bt(x[T], r), "*");
        }
      } else {
        let T = o.webnnIsGraphInput, A = o.webnnIsGraphOutput;
        if (c !== "string" && T && A) {
          let E = o.UTF8ToString(a);
          if (T(n, E) || A(n, E)) {
            let S = jr(c);
            w = fn(S, p), _ = "ml-tensor";
            let O = o.webnnCreateTemporaryTensor, M = o.webnnUploadTensor;
            if (!O || !M) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
            let G = await O(n, S, p);
            M(G, new Uint8Array(x.buffer, x.byteOffset, x.byteLength)), f = G;
          } else w = x.byteLength, f = o._malloc(w), r.push(f), o.HEAPU8.set(new Uint8Array(x.buffer, x.byteOffset, w), f);
        } else w = x.byteLength, f = o._malloc(w), r.push(f), o.HEAPU8.set(new Uint8Array(x.buffer, x.byteOffset, w), f);
      }
    }
    let y = o.stackSave(), b = o.stackAlloc(4 * p.length);
    try {
      p.forEach((T, A) => o.setValue(b + A * l, T, l === 4 ? "i32" : "i64"));
      let x = o._OrtCreateTensor(jr(c), f, w, b, p.length, Ki(_));
      x === 0 && xe(`Can't create tensor for input/output. session=${n}, index=${s}.`), t.push(x);
    } finally {
      o.stackRestore(y);
    }
  }, go = async (e, t, r, n, a, s) => {
    let i = Ie(), o = i.PTR_SIZE, l = vr.get(e);
    if (!l) throw new Error(`cannot run inference. invalid session id: ${e}`);
    let c = l[0], p = l[1], d = l[2], _ = l[3], f = l[4], w = l[5], y = t.length, b = n.length, x = 0, T = [], A = [], E = [], S = [], O = [], M = i.stackSave(), G = i.stackAlloc(y * o), D = i.stackAlloc(y * o), U = i.stackAlloc(b * o), q = i.stackAlloc(b * o);
    try {
      [x, T] = e_(s), Mr("wasm prepareInputOutputTensor");
      for (let C = 0; C < y; C++) await Xi(r[C], A, S, e, p[t[C]], t[C], f);
      for (let C = 0; C < b; C++) await Xi(a[C], E, S, e, d[n[C]], y + n[C], f);
      kr("wasm prepareInputOutputTensor");
      for (let C = 0; C < y; C++) i.setValue(G + C * o, A[C], "*"), i.setValue(D + C * o, p[t[C]], "*");
      for (let C = 0; C < b; C++) i.setValue(U + C * o, E[C], "*"), i.setValue(q + C * o, d[n[C]], "*");
      if (_ && !w) {
        let { handle: C, outputPreferredLocations: ae, outputPreferredLocationsEncoded: ge } = _;
        if (p.length !== y) throw new Error(`input count from feeds (${y}) is expected to be always equal to model's input count (${p.length}).`);
        Mr("wasm bindInputsOutputs");
        for (let J = 0; J < y; J++) {
          let oe = t[J];
          await i._OrtBindInput(C, p[oe], A[J]) !== 0 && xe(`Can't bind input[${J}] for session=${e}.`);
        }
        for (let J = 0; J < b; J++) {
          let oe = n[J];
          a[J]?.[3] ? (O.push(E[J]), i._OrtBindOutput(C, d[oe], E[J], 0) !== 0 && xe(`Can't bind pre-allocated output[${J}] for session=${e}.`)) : i._OrtBindOutput(C, d[oe], 0, ge[oe]) !== 0 && xe(`Can't bind output[${J}] to ${ae[J]} for session=${e}.`);
        }
        kr("wasm bindInputsOutputs"), vr.set(e, [c, p, d, _, f, !0]);
      }
      i.jsepOnRunStart?.(c), i.webnnOnRunStart?.(c);
      let H;
      _ ? H = await i._OrtRunWithBinding(c, _.handle, b, U, x) : H = await i._OrtRun(c, D, G, y, q, b, U, x), H !== 0 && xe("failed to call OrtRun().");
      let Q = [], $ = [];
      Mr("wasm ProcessOutputTensor");
      for (let C = 0; C < b; C++) {
        let ae = Number(i.getValue(U + C * o, "*"));
        if (ae === E[C] || O.includes(E[C])) {
          Q.push(a[C]), ae !== E[C] && i._OrtReleaseTensor(ae) !== 0 && xe("Can't release tensor.");
          continue;
        }
        let ge = i.stackSave(), J = i.stackAlloc(4 * o), oe = !1, L, N = 0;
        try {
          i._OrtGetTensorData(ae, J, J + o, J + 2 * o, J + 3 * o) !== 0 && xe(`Can't access output tensor data on index ${C}.`);
          let R = o === 4 ? "i32" : "i64", K = Number(i.getValue(J, R));
          N = i.getValue(J + o, "*");
          let le = i.getValue(J + o * 2, "*"), je = Number(i.getValue(J + o * 3, R)), Me = [];
          for (let Le = 0; Le < je; Le++) Me.push(Number(i.getValue(le + Le * o, R)));
          i._OrtFree(le) !== 0 && xe("Can't free memory for tensor dims.");
          let be = Me.reduce((Le, ke) => Le * ke, 1);
          L = Ja(K);
          let Ve = _?.outputPreferredLocations[n[C]];
          if (L === "string") {
            if (Ve === "gpu-buffer" || Ve === "ml-tensor") throw new Error("String tensor is not supported on GPU.");
            let Le = [];
            for (let ke = 0; ke < be; ke++) {
              let Ye = i.getValue(N + ke * o, "*"), sr = i.getValue(N + (ke + 1) * o, "*"), ve = ke === be - 1 ? void 0 : sr - Ye;
              Le.push(i.UTF8ToString(Ye, ve));
            }
            Q.push([L, Me, Le, "cpu"]);
          } else if (Ve === "gpu-buffer" && be > 0) {
            let Le = i.webgpuGetBuffer;
            if (!Le) throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
            let ke = Le(N), Ye = fn(K, be);
            if (Ye === void 0 || !co(L)) throw new Error(`Unsupported data type: ${L}`);
            oe = !0;
            {
              i.webgpuRegisterBuffer(ke, e, N);
              let sr = i.webgpuCreateDownloader(ke, Ye, e);
              Q.push([L, Me, { gpuBuffer: ke, download: async () => {
                let ve = await sr();
                return new (na(L))(ve);
              }, dispose: () => {
                i._OrtReleaseTensor(ae) !== 0 && xe("Can't release tensor.");
              } }, "gpu-buffer"]);
            }
          } else if (Ve === "ml-tensor" && be > 0) {
            let Le = i.webnnEnsureTensor, ke = i.webnnIsGraphInputOutputTypeSupported;
            if (!Le || !ke) throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');
            if (fn(K, be) === void 0 || !uo(L)) throw new Error(`Unsupported data type: ${L}`);
            if (!ke(e, L, !1)) throw new Error(`preferredLocation "ml-tensor" for ${L} output is not supported by current WebNN Context.`);
            let Ye = await Le(e, N, K, Me, !1);
            oe = !0, Q.push([L, Me, { mlTensor: Ye, download: i.webnnCreateMLTensorDownloader(N, L), dispose: () => {
              i.webnnReleaseTensorId(N), i._OrtReleaseTensor(ae);
            } }, "ml-tensor"]);
          } else if (Ve === "ml-tensor-cpu-output" && be > 0) {
            let Le = i.webnnCreateMLTensorDownloader(N, L)(), ke = Q.length;
            oe = !0, $.push((async () => {
              let Ye = [ke, await Le];
              return i.webnnReleaseTensorId(N), i._OrtReleaseTensor(ae), Ye;
            })()), Q.push([L, Me, [], "cpu"]);
          } else {
            let Le = na(L), ke = new Le(be);
            new Uint8Array(ke.buffer, ke.byteOffset, ke.byteLength).set(i.HEAPU8.subarray(N, N + ke.byteLength)), Q.push([L, Me, ke, "cpu"]);
          }
        } finally {
          i.stackRestore(ge), L === "string" && N && i._free(N), oe || i._OrtReleaseTensor(ae);
        }
      }
      _ && !f && (i._OrtClearBoundOutputs(_.handle) !== 0 && xe("Can't clear bound outputs."), vr.set(e, [c, p, d, _, f, !1]));
      for (let [C, ae] of await Promise.all($)) Q[C][2] = ae;
      return kr("wasm ProcessOutputTensor"), Q;
    } finally {
      i.webnnOnRunEnd?.(c), i.stackRestore(M), r.forEach((H) => {
        H && H[3] === "gpu-buffer" && i.webgpuUnregisterBuffer(H[2].gpuBuffer);
      }), a.forEach((H) => {
        H && H[3] === "gpu-buffer" && i.webgpuUnregisterBuffer(H[2].gpuBuffer);
      }), A.forEach((H) => i._OrtReleaseTensor(H)), E.forEach((H) => i._OrtReleaseTensor(H)), S.forEach((H) => i._free(H)), x !== 0 && i._OrtReleaseRunOptions(x), T.forEach((H) => i._free(H));
    }
  }, wo = (e) => {
    let t = Ie(), r = vr.get(e);
    if (!r) throw new Error("invalid session id");
    let n = r[0], a = t._OrtEndProfiling(n);
    a === 0 && xe("Can't get an profile file name."), t._OrtFree(a);
  }, yo = (e) => {
    let t = [];
    for (let r of e) {
      let n = r[2];
      !Array.isArray(n) && "buffer" in n && t.push(n.buffer);
    }
    return t;
  };
}), xr, At, _n, ea, ta, Xa, Yi, Ya, Vr, Ur, Eh, u_, d_, p_, h_, __, f_, m_, g_ = me(() => {
  "use strict";
  Xr(), c_(), Yr(), io(), xr = () => !!Be.wasm.proxy && typeof document < "u", _n = !1, ea = !1, ta = !1, Ya = /* @__PURE__ */ new Map(), Vr = (e, t) => {
    let r = Ya.get(e);
    r ? r.push(t) : Ya.set(e, [t]);
  }, Ur = () => {
    if (_n || !ea || ta || !At) throw new Error("worker not ready");
  }, Eh = (e) => {
    switch (e.data.type) {
      case "init-wasm":
        _n = !1, e.data.err ? (ta = !0, Yi[1](e.data.err)) : (ea = !0, Yi[0]()), Xa && (URL.revokeObjectURL(Xa), Xa = void 0);
        break;
      case "init-ep":
      case "copy-from":
      case "create":
      case "release":
      case "run":
      case "end-profiling": {
        let t = Ya.get(e.data.type);
        e.data.err ? t.shift()[1](e.data.err) : t.shift()[0](e.data.out);
        break;
      }
      default:
    }
  }, u_ = async () => {
    if (!ea) {
      if (_n) throw new Error("multiple calls to 'initWasm()' detected.");
      if (ta) throw new Error("previous call to 'initWasm()' failed.");
      if (_n = !0, xr()) return new Promise((e, t) => {
        At?.terminate(), Zh().then(([r, n]) => {
          try {
            At = n, At.onerror = (s) => t(s), At.onmessage = Eh, Yi = [e, t];
            let a = { type: "init-wasm", in: Be };
            !a.in.wasm.wasmPaths && (r || Zi) && (a.in.wasm.wasmPaths = { wasm: new URL("ort-wasm-simd-threaded.asyncify.wasm", import.meta.url).href }), At.postMessage(a), Xa = r;
          } catch (a) {
            t(a);
          }
        }, t);
      });
      try {
        await oo(Be.wasm), await ho(Be), ea = !0;
      } catch (e) {
        throw ta = !0, e;
      } finally {
        _n = !1;
      }
    }
  }, d_ = async (e) => {
    if (xr()) return Ur(), new Promise((t, r) => {
      Vr("init-ep", [t, r]);
      let n = { type: "init-ep", in: { epName: e, env: Be } };
      At.postMessage(n);
    });
    await _o(Be, e);
  }, p_ = async (e) => xr() ? (Ur(), new Promise((t, r) => {
    Vr("copy-from", [t, r]);
    let n = { type: "copy-from", in: { buffer: e } };
    At.postMessage(n, [e.buffer]);
  })) : rs(e), h_ = async (e, t) => {
    if (xr()) {
      if (t?.preferredOutputLocation) throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
      return Ur(), new Promise((r, n) => {
        Vr("create", [r, n]);
        let a = { type: "create", in: { model: e, options: { ...t } } }, s = [];
        e instanceof Uint8Array && s.push(e.buffer), At.postMessage(a, s);
      });
    } else return fo(e, t);
  }, __ = async (e) => {
    if (xr()) return Ur(), new Promise((t, r) => {
      Vr("release", [t, r]);
      let n = { type: "release", in: e };
      At.postMessage(n);
    });
    mo(e);
  }, f_ = async (e, t, r, n, a, s) => {
    if (xr()) {
      if (r.some((i) => i[3] !== "cpu")) throw new Error("input tensor on GPU is not supported for proxy.");
      if (a.some((i) => i)) throw new Error("pre-allocated output tensor is not supported for proxy.");
      return Ur(), new Promise((i, o) => {
        Vr("run", [i, o]);
        let l = r, c = { type: "run", in: { sessionId: e, inputIndices: t, inputs: l, outputIndices: n, options: s } };
        At.postMessage(c, yo(l));
      });
    } else return go(e, t, r, n, a, s);
  }, m_ = async (e) => {
    if (xr()) return Ur(), new Promise((t, r) => {
      Vr("end-profiling", [t, r]);
      let n = { type: "end-profiling", in: e };
      At.postMessage(n);
    });
    wo(e);
  };
}), Ji, Ah, w_, bx = me(() => {
  "use strict";
  Xr(), g_(), mn(), so(), r_(), Ji = (e, t) => {
    switch (e.location) {
      case "cpu":
        return [e.type, e.dims, e.data, "cpu"];
      case "gpu-buffer":
        return [e.type, e.dims, { gpuBuffer: e.gpuBuffer }, "gpu-buffer"];
      case "ml-tensor":
        return [e.type, e.dims, { mlTensor: e.mlTensor }, "ml-tensor"];
      default:
        throw new Error(`invalid data location: ${e.location} for ${t()}`);
    }
  }, Ah = (e) => {
    switch (e[3]) {
      case "cpu":
        return new Ot(e[0], e[2], e[1]);
      case "gpu-buffer": {
        let t = e[0];
        if (!co(t)) throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);
        let { gpuBuffer: r, download: n, dispose: a } = e[2];
        return Ot.fromGpuBuffer(r, { dataType: t, dims: e[1], download: n, dispose: a });
      }
      case "ml-tensor": {
        let t = e[0];
        if (!uo(t)) throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);
        let { mlTensor: r, download: n, dispose: a } = e[2];
        return Ot.fromMLTensor(r, { dataType: t, dims: e[1], download: n, dispose: a });
      }
      default:
        throw new Error(`invalid data location: ${e[3]}`);
    }
  }, w_ = class {
    async fetchModelAndCopyToWasmMemory(e) {
      return p_(await po(e));
    }
    async loadModel(e, t) {
      Hr();
      let r;
      typeof e == "string" ? r = await this.fetchModelAndCopyToWasmMemory(e) : r = e, [this.sessionId, this.inputNames, this.outputNames, this.inputMetadata, this.outputMetadata] = await h_(r, t), Qr();
    }
    async dispose() {
      return __(this.sessionId);
    }
    async run(e, t, r) {
      Hr();
      let n = [], a = [];
      Object.entries(e).forEach((d) => {
        let _ = d[0], f = d[1], w = this.inputNames.indexOf(_);
        if (w === -1) throw new Error(`invalid input '${_}'`);
        n.push(f), a.push(w);
      });
      let s = [], i = [];
      Object.entries(t).forEach((d) => {
        let _ = d[0], f = d[1], w = this.outputNames.indexOf(_);
        if (w === -1) throw new Error(`invalid output '${_}'`);
        s.push(f), i.push(w);
      });
      let o = n.map((d, _) => Ji(d, () => `input "${this.inputNames[a[_]]}"`)), l = s.map((d, _) => d ? Ji(d, () => `output "${this.outputNames[i[_]]}"`) : null), c = await f_(this.sessionId, a, o, i, l, r), p = {};
      for (let d = 0; d < c.length; d++) p[this.outputNames[i[d]]] = s[d] ?? Ah(c[d]);
      return Qr(), p;
    }
    startProfiling() {
    }
    endProfiling() {
      m_(this.sessionId);
    }
  };
}), y_ = {};
aa(y_, { OnnxruntimeWebAssemblyBackend: () => to, initializeFlags: () => eo, wasmBackend: () => b_ });
var eo, to, b_, vx = me(() => {
  "use strict";
  Xr(), g_(), bx(), eo = () => {
    (typeof Be.wasm.initTimeout != "number" || Be.wasm.initTimeout < 0) && (Be.wasm.initTimeout = 0);
    let e = Be.wasm.simd;
    if (typeof e != "boolean" && e !== void 0 && e !== "fixed" && e !== "relaxed" && (console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`), Be.wasm.simd = !1), typeof Be.wasm.proxy != "boolean" && (Be.wasm.proxy = !1), typeof Be.wasm.trace != "boolean" && (Be.wasm.trace = !1), typeof Be.wasm.numThreads != "number" || !Number.isInteger(Be.wasm.numThreads) || Be.wasm.numThreads <= 0) if (typeof self < "u" && !self.crossOriginIsolated) Be.wasm.numThreads = 1;
    else {
      let t = typeof navigator > "u" ? Zv("node:os").cpus().length : navigator.hardwareConcurrency;
      Be.wasm.numThreads = Math.min(4, Math.ceil((t || 1) / 2));
    }
  }, to = class {
    async init(e) {
      eo(), await u_(), await d_(e);
    }
    async createInferenceSessionHandler(e, t) {
      let r = new w_();
      return await r.loadModel(e, t), r;
    }
  }, b_ = new to();
});
Xr();
Xr();
Xr();
var xx = "1.31.0-dev.20260914-8d85527a0", Mx = Wh;
{
  let e = (vx(), Za(y_)).wasmBackend;
  Wr("webgpu", e, 5), Wr("webnn", e, 5), Wr("cpu", e, 10), Wr("wasm", e, 10);
}
Object.defineProperty(Be.versions, "web", { value: xx, enumerable: !0 });

// node_modules/onnxruntime-common/dist/esm/version.js
var v_ = "1.30.0";

// node_modules/onnxruntime-common/dist/esm/env-impl.js
var x_ = "warning", vo = {
  wasm: {},
  webgl: {},
  webgpu: {},
  versions: { common: v_ },
  set logLevel(e) {
    if (e !== void 0) {
      if (typeof e != "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(e) === -1)
        throw new Error(`Unsupported logging level: ${e}`);
      x_ = e;
    }
  },
  get logLevel() {
    return x_;
  }
};
Object.defineProperty(vo, "logLevel", { enumerable: !0 });

// node_modules/onnxruntime-common/dist/esm/tensor-conversion-impl.js
var M_ = (e, t) => {
  let r = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
  r.width = e.dims[3], r.height = e.dims[2];
  let n = r.getContext("2d");
  if (n != null) {
    let a, s;
    t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (a = e.dims[2], s = e.dims[3]) : (a = e.dims[3], s = e.dims[2]);
    let i = t?.format !== void 0 ? t.format : "RGB", o = t?.norm, l, c;
    o === void 0 || o.mean === void 0 ? l = [255, 255, 255, 255] : typeof o.mean == "number" ? l = [o.mean, o.mean, o.mean, o.mean] : (l = [o.mean[0], o.mean[1], o.mean[2], 0], o.mean[3] !== void 0 && (l[3] = o.mean[3])), o === void 0 || o.bias === void 0 ? c = [0, 0, 0, 0] : typeof o.bias == "number" ? c = [o.bias, o.bias, o.bias, o.bias] : (c = [o.bias[0], o.bias[1], o.bias[2], 0], o.bias[3] !== void 0 && (c[3] = o.bias[3]));
    let p = s * a, d = 0, _ = p, f = p * 2, w = -1;
    i === "RGBA" ? (d = 0, _ = p, f = p * 2, w = p * 3) : i === "RGB" ? (d = 0, _ = p, f = p * 2) : i === "RBG" && (d = 0, f = p, _ = p * 2);
    for (let y = 0; y < s; y++)
      for (let b = 0; b < a; b++) {
        let x = (e.data[d++] - c[0]) * l[0], T = (e.data[_++] - c[1]) * l[1], A = (e.data[f++] - c[2]) * l[2], E = w === -1 ? 255 : (e.data[w++] - c[3]) * l[3];
        n.fillStyle = "rgba(" + x + "," + T + "," + A + "," + E + ")", n.fillRect(b, y, 1, 1);
      }
    if ("toDataURL" in r)
      return r.toDataURL();
    throw new Error("toDataURL is not supported");
  } else
    throw new Error("Can not access image data");
}, k_ = (e, t) => {
  let r = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), n;
  if (r != null) {
    let a, s, i;
    t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (a = e.dims[2], s = e.dims[1], i = e.dims[3]) : (a = e.dims[3], s = e.dims[2], i = e.dims[1]);
    let o = t !== void 0 && t.format !== void 0 ? t.format : "RGB", l = t?.norm, c, p;
    l === void 0 || l.mean === void 0 ? c = [255, 255, 255, 255] : typeof l.mean == "number" ? c = [l.mean, l.mean, l.mean, l.mean] : (c = [l.mean[0], l.mean[1], l.mean[2], 255], l.mean[3] !== void 0 && (c[3] = l.mean[3])), l === void 0 || l.bias === void 0 ? p = [0, 0, 0, 0] : typeof l.bias == "number" ? p = [l.bias, l.bias, l.bias, l.bias] : (p = [l.bias[0], l.bias[1], l.bias[2], 0], l.bias[3] !== void 0 && (p[3] = l.bias[3]));
    let d = s * a;
    if (t !== void 0 && (t.format !== void 0 && i === 4 && t.format !== "RGBA" || i === 3 && t.format !== "RGB" && t.format !== "BGR"))
      throw new Error("Tensor format doesn't match input tensor dims");
    let _ = 4, f = 0, w = 1, y = 2, b = 3, x = 0, T = d, A = d * 2, E = -1;
    o === "RGBA" ? (x = 0, T = d, A = d * 2, E = d * 3) : o === "RGB" ? (x = 0, T = d, A = d * 2) : o === "RBG" && (x = 0, A = d, T = d * 2), n = r.createImageData(a, s);
    for (let S = 0; S < s * a; f += _, w += _, y += _, b += _, S++)
      n.data[f] = (e.data[x++] - p[0]) * c[0], n.data[w] = (e.data[T++] - p[1]) * c[1], n.data[y] = (e.data[A++] - p[2]) * c[2], n.data[b] = E === -1 ? 255 : (e.data[E++] - p[3]) * c[3];
  } else
    throw new Error("Can not access image data");
  return n;
};

// node_modules/onnxruntime-common/dist/esm/tensor-factory-impl.js
var xo = (e, t) => {
  if (e === void 0)
    throw new Error("Image buffer must be defined");
  if (t.height === void 0 || t.width === void 0)
    throw new Error("Image height and width must be defined");
  if (t.tensorLayout === "NHWC")
    throw new Error("NHWC Tensor layout is not supported yet");
  let { height: r, width: n } = t, a = t.norm ?? { mean: 255, bias: 0 }, s, i;
  typeof a.mean == "number" ? s = [a.mean, a.mean, a.mean, a.mean] : s = [a.mean[0], a.mean[1], a.mean[2], a.mean[3] ?? 255], typeof a.bias == "number" ? i = [a.bias, a.bias, a.bias, a.bias] : i = [a.bias[0], a.bias[1], a.bias[2], a.bias[3] ?? 0];
  let o = t.format !== void 0 ? t.format : "RGBA", l = t.tensorFormat !== void 0 && t.tensorFormat !== void 0 ? t.tensorFormat : "RGB", c = r * n, p = l === "RGBA" ? new Float32Array(c * 4) : new Float32Array(c * 3), d = 4, _ = 0, f = 1, w = 2, y = 3, b = 0, x = c, T = c * 2, A = -1;
  o === "RGB" && (d = 3, _ = 0, f = 1, w = 2, y = -1), l === "RGBA" ? A = c * 3 : l === "RBG" ? (b = 0, T = c, x = c * 2) : l === "BGR" && (T = 0, x = c, b = c * 2);
  for (let S = 0; S < c; S++, _ += d, w += d, f += d, y += d)
    p[b++] = (e[_] + i[0]) / s[0], p[x++] = (e[f] + i[1]) / s[1], p[T++] = (e[w] + i[2]) / s[2], A !== -1 && y !== -1 && (p[A++] = (e[y] + i[3]) / s[3]);
  return l === "RGBA" ? new nt("float32", p, [1, 4, r, n]) : new nt("float32", p, [1, 3, r, n]);
}, T_ = async (e, t) => {
  let r = typeof HTMLImageElement < "u" && e instanceof HTMLImageElement, n = typeof ImageData < "u" && e instanceof ImageData, a = typeof ImageBitmap < "u" && e instanceof ImageBitmap, s = typeof e == "string", i, o = t ?? {}, l = () => {
    if (typeof document < "u")
      return document.createElement("canvas");
    if (typeof OffscreenCanvas < "u")
      return new OffscreenCanvas(1, 1);
    throw new Error("Canvas is not supported");
  }, c = (p) => typeof HTMLCanvasElement < "u" && p instanceof HTMLCanvasElement || p instanceof OffscreenCanvas ? p.getContext("2d") : null;
  if (r) {
    let p = l();
    p.width = e.width, p.height = e.height;
    let d = c(p);
    if (d != null) {
      let _ = e.height, f = e.width;
      if (t !== void 0 && t.resizedHeight !== void 0 && t.resizedWidth !== void 0 && (_ = t.resizedHeight, f = t.resizedWidth), t !== void 0) {
        if (o = t, t.tensorFormat !== void 0)
          throw new Error("Image input config format must be RGBA for HTMLImageElement");
        o.tensorFormat = "RGBA", o.height = _, o.width = f;
      } else
        o.tensorFormat = "RGBA", o.height = _, o.width = f;
      d.drawImage(e, 0, 0), i = d.getImageData(0, 0, f, _).data;
    } else
      throw new Error("Can not access image data");
  } else if (n) {
    let p, d;
    if (t !== void 0 && t.resizedWidth !== void 0 && t.resizedHeight !== void 0 ? (p = t.resizedHeight, d = t.resizedWidth) : (p = e.height, d = e.width), t !== void 0 && (o = t), o.format = "RGBA", o.height = p, o.width = d, t !== void 0) {
      let _ = l();
      _.width = d, _.height = p;
      let f = c(_);
      if (f != null)
        f.putImageData(e, 0, 0), i = f.getImageData(0, 0, d, p).data;
      else
        throw new Error("Can not access image data");
    } else
      i = e.data;
  } else if (a) {
    if (t === void 0)
      throw new Error("Please provide image config with format for Imagebitmap");
    let p = l();
    p.width = e.width, p.height = e.height;
    let d = c(p);
    if (d != null) {
      let _ = e.height, f = e.width;
      return d.drawImage(e, 0, 0, f, _), i = d.getImageData(0, 0, f, _).data, o.height = _, o.width = f, xo(i, o);
    } else
      throw new Error("Can not access image data");
  } else {
    if (s)
      return new Promise((p, d) => {
        let _ = l(), f = c(_);
        if (!e || !f)
          return d();
        let w = new Image();
        w.crossOrigin = "Anonymous", w.src = e, w.onload = () => {
          _.width = w.width, _.height = w.height, f.drawImage(w, 0, 0, _.width, _.height);
          let y = f.getImageData(0, 0, _.width, _.height);
          o.height = _.height, o.width = _.width, p(xo(y.data, o));
        };
      });
    throw new Error("Input data provided is not supported - aborted tensor creation");
  }
  if (i !== void 0)
    return xo(i, o);
  throw new Error("Input data provided is not supported - aborted tensor creation");
}, E_ = (e, t) => {
  let { width: r, height: n, download: a, dispose: s } = t, i = [1, n, r, 4];
  return new nt({ location: "texture", type: "float32", texture: e, dims: i, download: a, dispose: s });
}, A_ = (e, t) => {
  let { dataType: r, dims: n, download: a, dispose: s } = t;
  return new nt({ location: "gpu-buffer", type: r ?? "float32", gpuBuffer: e, dims: n, download: a, dispose: s });
}, C_ = (e, t) => {
  let { dataType: r, dims: n, download: a, dispose: s } = t;
  return new nt({ location: "ml-tensor", type: r ?? "float32", mlTensor: e, dims: n, download: a, dispose: s });
}, S_ = (e, t, r) => new nt({ location: "cpu-pinned", type: e, data: t, dims: r ?? [t.length] });

// node_modules/onnxruntime-common/dist/esm/tensor-impl-type-mapping.js
var Jr = /* @__PURE__ */ new Map([
  ["float32", Float32Array],
  ["uint8", Uint8Array],
  ["int8", Int8Array],
  ["uint16", Uint16Array],
  ["int16", Int16Array],
  ["int32", Int32Array],
  ["bool", Uint8Array],
  ["float64", Float64Array],
  ["uint32", Uint32Array],
  ["int4", Uint8Array],
  ["uint4", Uint8Array]
]), sa = /* @__PURE__ */ new Map([
  [Float32Array, "float32"],
  [Uint8Array, "uint8"],
  [Int8Array, "int8"],
  [Uint16Array, "uint16"],
  [Int16Array, "int16"],
  [Int32Array, "int32"],
  [Float64Array, "float64"],
  [Uint32Array, "uint32"]
]), P_ = !1, F_ = () => {
  if (!P_) {
    P_ = !0;
    let e = typeof BigInt64Array < "u" && BigInt64Array.from, t = typeof BigUint64Array < "u" && BigUint64Array.from, r = globalThis.Float16Array, n = typeof r < "u" && r.from;
    e && (Jr.set("int64", BigInt64Array), sa.set(BigInt64Array, "int64")), t && (Jr.set("uint64", BigUint64Array), sa.set(BigUint64Array, "uint64")), n ? (Jr.set("float16", r), sa.set(r, "float16")) : Jr.set("float16", Uint16Array);
  }
};

// node_modules/onnxruntime-common/dist/esm/tensor-utils-impl.js
var I_ = (e) => {
  let t = 1;
  for (let r = 0; r < e.length; r++) {
    let n = e[r];
    if (typeof n != "number" || !Number.isSafeInteger(n))
      throw new TypeError(`dims[${r}] must be an integer, got: ${n}`);
    if (n < 0)
      throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${n}`);
    t *= n;
  }
  return t;
}, L_ = (e, t) => {
  switch (e.location) {
    case "cpu":
      return new nt(e.type, e.data, t);
    case "cpu-pinned":
      return new nt({
        location: "cpu-pinned",
        data: e.data,
        type: e.type,
        dims: t
      });
    case "texture":
      return new nt({
        location: "texture",
        texture: e.texture,
        type: e.type,
        dims: t
      });
    case "gpu-buffer":
      return new nt({
        location: "gpu-buffer",
        gpuBuffer: e.gpuBuffer,
        type: e.type,
        dims: t
      });
    case "ml-tensor":
      return new nt({
        location: "ml-tensor",
        mlTensor: e.mlTensor,
        type: e.type,
        dims: t
      });
    default:
      throw new Error(`tensorReshape: tensor location ${e.location} is not supported`);
  }
};

// node_modules/onnxruntime-common/dist/esm/tensor-impl.js
var nt = class {
  /**
   * implementation.
   */
  constructor(t, r, n) {
    F_();
    let a, s;
    if (typeof t == "object" && "location" in t)
      switch (this.dataLocation = t.location, a = t.type, s = t.dims, t.location) {
        case "cpu-pinned": {
          let o = Jr.get(a);
          if (!o)
            throw new TypeError(`unsupported type "${a}" to create tensor from pinned buffer`);
          if (!(t.data instanceof o))
            throw new TypeError(`buffer should be of type ${o.name}`);
          this.cpuData = t.data;
          break;
        }
        case "texture": {
          if (a !== "float32")
            throw new TypeError(`unsupported type "${a}" to create tensor from texture`);
          this.gpuTextureData = t.texture, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        case "gpu-buffer": {
          if (a !== "float32" && a !== "float16" && a !== "int32" && a !== "int64" && a !== "uint32" && a !== "uint8" && a !== "bool" && a !== "uint4" && a !== "int4")
            throw new TypeError(`unsupported type "${a}" to create tensor from gpu buffer`);
          this.gpuBufferData = t.gpuBuffer, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        case "ml-tensor": {
          if (a !== "float32" && a !== "float16" && a !== "int32" && a !== "int64" && a !== "uint32" && a !== "uint64" && a !== "int8" && a !== "uint8" && a !== "bool" && a !== "uint4" && a !== "int4")
            throw new TypeError(`unsupported type "${a}" to create tensor from MLTensor`);
          this.mlTensorData = t.mlTensor, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        default:
          throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
      }
    else {
      let o, l;
      if (typeof t == "string")
        if (a = t, l = n, t === "string") {
          if (!Array.isArray(r))
            throw new TypeError("A string tensor's data must be a string array.");
          o = r;
        } else {
          let c = Jr.get(t);
          if (c === void 0)
            throw new TypeError(`Unsupported tensor type: ${t}.`);
          if (Array.isArray(r)) {
            if (t === "float16" && c === Uint16Array || t === "uint4" || t === "int4")
              throw new TypeError(`Creating a ${t} tensor from number array is not supported. Please use ${c.name} as data.`);
            t === "uint64" || t === "int64" ? o = c.from(r, BigInt) : o = c.from(r);
          } else if (r instanceof c)
            o = r;
          else if (r instanceof Uint8ClampedArray)
            if (t === "uint8")
              o = Uint8Array.from(r);
            else
              throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");
          else if (t === "float16" && r instanceof Uint16Array && c !== Uint16Array)
            o = new globalThis.Float16Array(r.buffer, r.byteOffset, r.length);
          else
            throw new TypeError(`A ${a} tensor's data must be type of ${c}`);
        }
      else if (l = r, Array.isArray(t)) {
        if (t.length === 0)
          throw new TypeError("Tensor type cannot be inferred from an empty array.");
        let c = typeof t[0];
        if (c === "string")
          a = "string", o = t;
        else if (c === "boolean")
          a = "bool", o = Uint8Array.from(t);
        else
          throw new TypeError(`Invalid element type of data array: ${c}.`);
      } else if (t instanceof Uint8ClampedArray)
        a = "uint8", o = Uint8Array.from(t);
      else {
        let c = sa.get(t.constructor);
        if (c === void 0)
          throw new TypeError(`Unsupported type for tensor data: ${t.constructor}.`);
        a = c, o = t;
      }
      if (l === void 0)
        l = [o.length];
      else if (!Array.isArray(l))
        throw new TypeError("A tensor's dims must be a number array");
      s = l, this.cpuData = o, this.dataLocation = "cpu";
    }
    let i = I_(s);
    if (this.cpuData && i !== this.cpuData.length && !((a === "uint4" || a === "int4") && Math.ceil(i / 2) === this.cpuData.length))
      throw new Error(`Tensor's size(${i}) does not match data length(${this.cpuData.length}).`);
    this.type = a, this.dims = s, this.size = i;
  }
  // #endregion
  // #region factory
  static async fromImage(t, r) {
    return T_(t, r);
  }
  static fromTexture(t, r) {
    return E_(t, r);
  }
  static fromGpuBuffer(t, r) {
    return A_(t, r);
  }
  static fromMLTensor(t, r) {
    return C_(t, r);
  }
  static fromPinnedBuffer(t, r, n) {
    return S_(t, r, n);
  }
  // #endregion
  // #region conversions
  toDataURL(t) {
    return M_(this, t);
  }
  toImageData(t) {
    return k_(this, t);
  }
  // #endregion
  // #region properties
  get data() {
    if (this.ensureValid(), !this.cpuData)
      throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
    return this.cpuData;
  }
  get location() {
    return this.dataLocation;
  }
  get texture() {
    if (this.ensureValid(), !this.gpuTextureData)
      throw new Error("The data is not stored as a WebGL texture.");
    return this.gpuTextureData;
  }
  get gpuBuffer() {
    if (this.ensureValid(), !this.gpuBufferData)
      throw new Error("The data is not stored as a WebGPU buffer.");
    return this.gpuBufferData;
  }
  get mlTensor() {
    if (this.ensureValid(), !this.mlTensorData)
      throw new Error("The data is not stored as a WebNN MLTensor.");
    return this.mlTensorData;
  }
  // #endregion
  // #region methods
  async getData(t) {
    switch (this.ensureValid(), this.dataLocation) {
      case "cpu":
      case "cpu-pinned":
        return this.data;
      case "texture":
      case "gpu-buffer":
      case "ml-tensor": {
        if (!this.downloader)
          throw new Error("The current tensor is not created with a specified data downloader.");
        if (this.isDownloading)
          throw new Error("The current tensor is being downloaded.");
        try {
          this.isDownloading = !0;
          let r = await this.downloader();
          return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = r, t && this.disposer && (this.disposer(), this.disposer = void 0), r;
        } finally {
          this.isDownloading = !1;
        }
      }
      default:
        throw new Error(`cannot get data from location: ${this.dataLocation}`);
    }
  }
  dispose() {
    if (this.isDownloading)
      throw new Error("The current tensor is being downloaded.");
    this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.mlTensorData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
  }
  // #endregion
  // #region tensor utilities
  ensureValid() {
    if (this.dataLocation === "none")
      throw new Error("The tensor is disposed.");
  }
  reshape(t) {
    if (this.ensureValid(), this.downloader || this.disposer)
      throw new Error("Cannot reshape a tensor that owns GPU resource.");
    return L_(this, t);
  }
};

// node_modules/onnxruntime-common/dist/esm/tensor.js
var Mo = nt;

// node_modules/@huggingface/transformers/dist/transformers.web.min.js
var kx = Object.defineProperty, fa = (e, t) => {
  for (var r in t) kx(e, r, { get: t[r], enumerable: !0 });
}, Mt = {}, Kt = {}, Tx = {}, Ex = "4.3.0", Zo = typeof self < "u", Tn = !Wf(Mt), Uf = !Wf(Kt), hs = Zo && "caches" in self, Ax = typeof globalThis.Deno < "u", a$ = typeof globalThis.Bun < "u", Cs = Ax && hs && !Tn, qf = typeof process < "u", jf = qf && process?.release?.name === "node" && !Cs, Ko = typeof window < "u" && typeof window.document < "u", el = Zo && ["DedicatedWorkerGlobalScope", "ServiceWorkerGlobalScope", "SharedWorkerGlobalScope"].includes(self.constructor?.name), Cx = Ko || el || Cs, Sx = jf || typeof navigator < "u" && "gpu" in navigator, Px = typeof navigator < "u" && "ml" in navigator, Fx = typeof crypto < "u" && typeof crypto.getRandomValues == "function", Ix = typeof chrome < "u" && typeof chrome.runtime < "u" && typeof chrome.runtime.id == "string", Lx = typeof ServiceWorkerGlobalScope < "u" && Zo && self instanceof ServiceWorkerGlobalScope, Ox = () => {
  if (typeof navigator > "u") return !1;
  let e = navigator.userAgent;
  if (!((navigator.vendor || "").indexOf("Apple") > -1 && !e.match(/CriOS|FxiOS|EdgiOS|OPiOS|mercury|brave/i) && !e.includes("Chrome") && !e.includes("Android"))) return !1;
  let t = e.match(/Version\/(\d+)/);
  return t ? parseInt(t[1], 10) < 26 : !1;
}, zx = Ox(), pe = Object.freeze({ IS_BROWSER_ENV: Ko, IS_WEBWORKER_ENV: el, IS_WEB_ENV: Cx, IS_SERVICE_WORKER_ENV: Lx, IS_DENO_WEB_RUNTIME: Cs, IS_WEB_CACHE_AVAILABLE: hs, IS_WEBGPU_AVAILABLE: Sx, IS_WEBNN_AVAILABLE: Px, IS_SAFARI_BELOW_26: zx, IS_PROCESS_AVAILABLE: qf, IS_NODE_ENV: jf, IS_FS_AVAILABLE: Tn, IS_PATH_AVAILABLE: Uf, IS_CRYPTO_AVAILABLE: Fx, IS_CHROME_AVAILABLE: Ix }), tl = Tn && Uf, _s = "./";
if (tl) {
  let e = import.meta.url;
  e ? _s = Kt.dirname(Kt.dirname(Tx.fileURLToPath(e))) : typeof __dirname < "u" && (_s = Kt.dirname(__dirname));
}
var Nx = tl ? Kt.join(_s, "/.cache/") : null, O_ = "/models/", Bx = tl ? Kt.join(_s, O_) : O_, $x = typeof globalThis.fetch == "function" ? globalThis.fetch.bind(globalThis) : void 0, Bt = Object.freeze({ DEBUG: 10, INFO: 20, WARNING: 30, ERROR: 40, NONE: 50 }), z_ = Bt.WARNING, we = { version: Ex, backends: { onnx: {} }, get logLevel() {
  return z_;
}, set logLevel(e) {
  z_ = e, we.backends.onnx?.setLogLevel?.(e);
}, allowRemoteModels: !0, remoteHost: "https://huggingface.co/", remotePathTemplate: "{model}/resolve/{revision}/", allowLocalModels: !(Ko || el || Cs), localModelPath: Bx, useFS: Tn, useBrowserCache: hs, useFSCache: Tn, cacheDir: Nx, useCustomCache: !1, customCache: null, useWasmCache: hs || Tn, cacheKey: "transformers-cache", experimental_useCrossOriginStorage: !1, fetch: $x };
function Wf(e) {
  return Object.keys(e).length === 0;
}
var gt = class {
  constructor() {
    let e = function(...t) {
      return e._call(...t);
    };
    return Object.setPrototypeOf(e, new.target.prototype);
  }
  _call(...e) {
    throw Error("Must implement _call method in subclass");
  }
};
function Sr(e, t) {
  e && e(t);
}
var fs = class extends gt {
  constructor(e, t) {
    super(), this.callback = e, this.files_loading = t, this.loads = /* @__PURE__ */ new Map();
  }
  _call(e) {
    if (e.status === "progress") {
      this.files_loading[e.file] = { loaded: e.loaded, total: e.total };
      let t = Object.values(this.files_loading).reduce((a, s) => a + s.loaded, 0), r = Object.values(this.files_loading).reduce((a, s) => a + s.total, 0), n = r > 0 ? t / r * 100 : 0;
      this.callback({ status: "progress_total", name: e.name, progress: n, loaded: t, total: r, files: structuredClone(this.files_loading) });
    }
    this.callback(e);
  }
};
function Dx(e) {
  return Number.isInteger(e) || typeof e == "bigint";
}
function N_(e) {
  return e == null || e === -1;
}
function B_(e) {
  let t = [], r = e;
  for (; Array.isArray(r); ) t.push(r.length), r = r[0];
  return t;
}
function $t(...e) {
  return Array.prototype.concat.apply([], e);
}
function Rx(...e) {
  return e.reduce((t, r) => t.flatMap((n) => r.map((a) => [n, a])));
}
function ms(e, t) {
  return Math.abs((e + t) % (2 * t) - t);
}
function et(e, t) {
  return Object.assign({}, ...t.map((r) => {
    if (e[r] !== void 0) return { [r]: e[r] };
  }));
}
function Gx(e, t) {
  let r = 0;
  for (let n of e) n === t && ++r;
  return r;
}
var ce = { error(...e) {
  we.logLevel <= Bt.ERROR && console.error(...e);
}, warn(...e) {
  we.logLevel <= Bt.WARNING && console.warn(...e);
}, info(...e) {
  we.logLevel <= Bt.INFO && console.log(...e);
}, debug(...e) {
  we.logLevel <= Bt.DEBUG && console.log(...e);
}, log(...e) {
  this.info(...e);
} }, Vx = class {
  constructor(e) {
    this.trie = this._build_trie(e);
  }
  _build_trie(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let r of e) {
      let n = t;
      for (let a = 0; a < r.length; ++a) {
        let s = r[a];
        n = n[s] ??= /* @__PURE__ */ Object.create(null);
      }
      n.end = r;
    }
    return t;
  }
  split(e) {
    let t = [], r = e.length, n = 0, a = 0;
    for (; a < r; ) {
      let s = this.trie, i = null, o = a;
      for (; o < r && (s = s[e[o]]); ) s.end && (i = s.end), ++o;
      i ? (a > n && t.push(e.slice(n, a)), t.push(i), a += i.length, n = a) : ++a;
    }
    return n < r && t.push(e.slice(n)), t;
  }
}, $_ = Vx, Ux = class {
  constructor(e) {
    this.content = e.content, this.id = e.id, this.single_word = e.single_word ?? !1, this.lstrip = e.lstrip ?? !1, this.rstrip = e.rstrip ?? !1, this.special = e.special ?? !1, this.normalized = e.normalized ?? !this.special;
  }
}, qx = Ux, Hf = (e, t) => {
  try {
    return new RegExp(e, t);
  } catch (r) {
    if (!(r instanceof SyntaxError)) throw r;
    let n = /* @__PURE__ */ new Map(), a = e.replace(/(\\[pP])\{([^}=]+)\}/g, (s, i, o, l) => {
      let c = 0;
      for (let d = l - 1; d >= 0 && e[d] === "\\"; --d) ++c;
      if (c % 2 === 1) return s;
      let p = n.get(o);
      if (p === void 0) {
        try {
          new RegExp(`\\p{${o}}`, "u"), p = o;
        } catch {
          p = `Script=${o}`;
        }
        n.set(o, p);
      }
      return `${i}{${p}}`;
    });
    if (a === e) throw r;
    try {
      return new RegExp(a, t);
    } catch {
      throw r;
    }
  }
}, rl = (e) => e.replace(/ \./g, ".").replace(/ \?/g, "?").replace(/ \!/g, "!").replace(/ ,/g, ",").replace(/ \' /g, "'").replace(/ n't/g, "n't").replace(/ 'm/g, "'m").replace(/ 's/g, "'s").replace(/ 've/g, "'ve").replace(/ 're/g, "'re"), Ss = (e, t = !0) => {
  if (e.Regex !== void 0) {
    let r = oM(aM(e.Regex));
    return Hf(r, "gu");
  } else if (e.String !== void 0) {
    let r = lM(e.String);
    return new RegExp(t ? r : `(${r})`, "gu");
  } else return console.warn("Unknown pattern type:", e), null;
}, Sn = "\\p{Alphabetic}\\p{M}\\p{Nd}\\p{Pc}", Qf = `${Sn}\\u00B2\\u00B3\\u00B9\\u00BC-\\u00BE`, er = `[${Qf}]`, Xf = `[^${Qf}]`, jx = `(?:(?<!${er})(?=${er})|(?<=${er})(?!${er}))`, Wx = `(?:(?<!${er})(?!${er})|(?<=${er})(?=${er}))`, Hx = "(?:(?<![\\s\\S])|(?<=\\n))", Qx = "(?:(?=\\n)|(?![\\s\\S]))", ca = "0-9A-Fa-f", Xx = /* @__PURE__ */ new Map([["A", "(?<![\\s\\S])"], ["z", "(?![\\s\\S])"], ["Z", "(?=\\n?(?![\\s\\S]))"], ["h", `[${ca}]`], ["H", `[^${ca}]`], ["w", er], ["W", Xf], ["d", "\\p{Nd}"], ["D", "\\P{Nd}"], ["s", "\\p{White_Space}"], ["S", "\\P{White_Space}"], ["b", jx], ["B", Wx], ["a", "\\x07"], ["e", "\\x1B"]]), Yx = /* @__PURE__ */ new Map([["h", ca], ["w", Sn], ["d", "\\p{Nd}"], ["D", "\\P{Nd}"], ["s", "\\p{White_Space}"], ["S", "\\P{White_Space}"], ["a", "\\x07"], ["e", "\\x1B"]]), Jx = /* @__PURE__ */ new Map([["W", `[^${Sn}]`], ["H", `[^${ca}]`]]), Yf = /* @__PURE__ */ new Map([[`
`, "\\n"], ["\r", "\\r"], ["	", "\\t"], ["\f", "\\f"], ["\v", "\\v"]]), Zx = /* @__PURE__ */ new Map([["alpha", "\\p{Alphabetic}"], ["alnum", "\\p{Alphabetic}\\p{Nd}"], ["digit", "\\p{Nd}"], ["lower", "\\p{Lowercase}"], ["upper", "\\p{Uppercase}"], ["space", "\\p{White_Space}"], ["blank", "\\t\\p{Zs}"], ["punct", "\\p{P}\\p{S}"], ["cntrl", "\\p{Cc}"], ["word", Sn], ["xdigit", ca]]), Jf = "^$\\.*+?()[]{}|/", Kx = /^\(\?(?:<[=!]|<[A-Za-z_][A-Za-z0-9_]*>|[:=!>])/, Zf = /^\\([pPxu])\{([^}]*)\}/, eM = /^\{(\d+(?:,\d*)?|,\d+)\}/, tM = /^\[:(\^?)(\p{Alphabetic}+):\]/u, rM = /^\[:\^:\]/, nM = /^\[(?:\.[^\]]*\.\]|=[^\]]*=\])/, Kf = /^(?:\\x[0-9A-Fa-f]{2}|\\u[0-9A-Fa-f]{4}|\\c[A-Za-z])/, em = (e) => e >= "A" && e <= "Z" || e >= "a" && e <= "z", gs = (e, t) => String.fromCodePoint(e.codePointAt(t)), D_ = (e) => {
  if (!/^[0-9A-Fa-f]{1,8}$/.test(e)) return null;
  let t = Number.parseInt(e, 16);
  if (t > 127) return null;
  let r = String.fromCharCode(t);
  return em(r) ? `[${r.toLowerCase()}${r.toUpperCase()}]` : null;
}, aM = (e) => e.replace(/\[\^\(\\s\|\[([^\]]+)\]\)\]/g, "[^()|\\s$1]"), tm = "[\\s\\S]", R_ = 256, G_ = () => ({ fragment: "", alternatives: [], tail: null, contains_complex_set: !1 }), nl = (e) => {
  throw new SyntaxError(`Unsupported range with a set-valued character-class operand at index ${e}`);
}, ws = (e, t, r, n = !0) => {
  e.tail === "range" && nl(r), e.alternatives.push(t), e.tail = "set", e.contains_complex_set = e.contains_complex_set || n;
}, Pr = (e, t, r = !1, n = -1) => {
  if (r && e.tail === "range" && nl(n), e.tail === "range") {
    e.fragment += t, e.tail = "complete_range";
    return;
  }
  e.fragment += t, e.tail = r ? "set" : "scalar", e.contains_complex_set = e.contains_complex_set || r;
}, sM = (e, t, r) => {
  let n = Zf.exec(e.slice(t));
  if (n) {
    let [_, f, w] = n;
    if (f === "P" && w === "Word") ws(r, `[^${Sn}]`, t);
    else {
      let y = f === "x" ? `\\u{${w}}` : f === "p" && w === "Word" ? Sn : _;
      Pr(r, y, f === "p" || f === "P", t);
    }
    return t + _.length;
  }
  let a = Kf.exec(e.slice(t));
  if (a) return Pr(r, a[0]), t + a[0].length;
  if (t + 1 >= e.length) throw new SyntaxError(`Unterminated escape in character class at index ${t}`);
  let s = gs(e, t + 1), i = t + 1 + s.length, o = Yf.get(s);
  if (o !== void 0) return Pr(r, o), i;
  let l = Jx.get(s);
  if (l !== void 0) return ws(r, l, t), i;
  let c = Yx.get(s), p, d = !1;
  return c !== void 0 ? (p = c, d = s !== "a" && s !== "e") : /[A-Za-z0-9]/.test(s) ? p = `\\${s}` : Jf.includes(s) || s === "-" ? p = `\\${s}` : p = s, Pr(r, p, d, t), i;
}, rm = (e) => e.length === 1 ? e[0] : `(?:(?=(?:${e.join("|")}))${tm})`, V_ = (e) => {
  let t = e.fragment.length === 0 ? e.alternatives : [`[${e.fragment}]`, ...e.alternatives];
  return rm(t);
}, iM = (e) => {
  let t = Hf(`^(?:${e})$`, "u"), r = "";
  for (let n = 0; n < 26; ++n) {
    let a = String.fromCharCode(65 + n), s = String.fromCharCode(97 + n), i = t.test(a), o = t.test(s);
    i !== o && (r += i ? s : a);
  }
  return r;
}, nm = (e, t, r, n = !0, a = 1) => {
  if (a > R_) throw new SyntaxError(`Maximum character-class nesting depth of ${R_} exceeded at index ${t}`);
  let s = t + 1, i = e[s] === "^";
  i && ++s;
  let o = s, l = [G_()], c = l[0], p = !1;
  for (; s < e.length; ) {
    let d = gs(e, s);
    if (d === "\\") {
      s = sM(e, s, c);
      continue;
    }
    if (d === "]") {
      if (s === o) {
        Pr(c, "\\]"), ++s;
        continue;
      }
      if (c.tail === null) throw l.length > 1 ? new SyntaxError(`Malformed character-class intersection with an empty operand at index ${s}`) : new SyntaxError(`Empty character class at index ${t}`);
      let _ = l.some((x) => x.contains_complex_set);
      if (i && l.length > 1 && p) throw new SyntaxError(`Unsupported outer-negated character-class intersection with a nested negated class containing a Unicode property, POSIX class, or shorthand at index ${t}`);
      let f = V_(l[0]), w = f;
      if (l.length > 1) {
        let x = "";
        for (let T = 1; T < l.length; ++T) x += `(?=${V_(l[T])})`;
        w = `(?:${x}${f})`;
      }
      let y = l.length === 1 && c.alternatives.length === 0, b = c.fragment;
      if (r && n) {
        let x = iM(w);
        x.length > 0 && (y ? (b += x, w = `[${b}]`) : w = rm([w, `[${x}]`]));
      }
      return { atom: i ? y ? `[^${b}]` : `(?:(?!${w})${tm})` : w, end: s + 1, negated: i, contains_complex_set: _, contains_nested_negated_complex_set: p };
    }
    if (e.startsWith("&&", s)) {
      if (c.tail === null) throw new SyntaxError(`Malformed character-class intersection with an empty operand at index ${s}`);
      c = G_(), l.push(c), s += 2;
      continue;
    }
    if (d === "[") {
      let _ = e.slice(s);
      if (rM.test(_)) throw new SyntaxError(`Malformed empty negated POSIX character class at index ${s}`);
      let f = tM.exec(_);
      if (f) {
        let [, y, b] = f, x = Zx.get(b);
        if (x === void 0) throw new SyntaxError(`Unsupported POSIX character class "${b}" at index ${s}`);
        if (r && y && (b === "lower" || b === "upper")) throw new SyntaxError(`Unsupported negated POSIX ${b} class inside an inline case-insensitive group`);
        y ? ws(c, `[^${x}]`, s) : Pr(c, x, !0, s), s += f[0].length;
        continue;
      }
      if (nM.test(_)) throw new SyntaxError(`Unsupported POSIX collating or equivalence bracket expression at index ${s}`);
      let w = nm(e, s, r, !1, a + 1);
      ws(c, w.atom, s, w.contains_complex_set), p ||= w.contains_nested_negated_complex_set || w.negated && w.contains_complex_set, s = w.end;
      continue;
    }
    if (d === "-") {
      let _ = e[s + 1] === "]" || e.startsWith("&&", s + 1);
      c.tail === "set" && !_ && nl(s), c.tail === null || c.tail === "range" || c.tail === "complete_range" || _ ? Pr(c, "\\-") : (c.fragment += "-", c.tail = "range"), ++s;
      continue;
    }
    Pr(c, d === "^" && c.fragment.length === 0 ? "\\^" : d), s += d.length;
  }
  throw new SyntaxError(`${l.length > 1 ? "Unterminated character-class intersection" : "Unterminated character class"} at index ${t}`);
}, oM = (e) => {
  let t = "", r = -1, n = !1, a = !1, s = [], i = (o) => {
    r = t.length, t += o, n = !1;
  };
  for (let o = 0; o < e.length; ) {
    let l = gs(e, o);
    if (l === "\\") {
      let c = Zf.exec(e.slice(o));
      if (c) {
        let [y, b, x] = c, T = y;
        if (b === "x") {
          let A = `\\u{${x}}`;
          T = a ? D_(x) ?? A : A;
        } else x === "Word" && (T = b === "p" ? er : Xf);
        i(T), o += y.length;
        continue;
      }
      let p = Kf.exec(e.slice(o));
      if (p) {
        let y = p[0], b = a && y[1] !== "c" ? D_(y.slice(2)) ?? y : y;
        i(b), o += y.length;
        continue;
      }
      if (o + 1 >= e.length) {
        t += l;
        break;
      }
      let d = gs(e, o + 1);
      if (o += 1 + d.length, d === "G") continue;
      let _ = Yf.get(d);
      if (_ !== void 0) {
        i(_);
        continue;
      }
      let f = Xx.get(d), w;
      f !== void 0 ? w = f : /[A-Za-z0-9]/.test(d) ? w = `\\${d}` : Jf.includes(d) ? w = `\\${d}` : w = d, i(w);
      continue;
    }
    switch (l) {
      case "[": {
        let c = nm(e, o, a);
        i(c.atom), o = c.end;
        continue;
      }
      case "]":
        i("\\]"), ++o;
        continue;
      case ".":
        i("[^\\n]"), ++o;
        continue;
      case "^":
        i(Hx), ++o;
        continue;
      case "$":
        i(Qx), ++o;
        continue;
      case "(": {
        let c = e.startsWith("(?i:", o), p = c ? "(?i:" : Kx.exec(e.slice(o))?.[0] ?? "(", d = c || p === "(?>" ? "(?:" : p;
        s.push([t.length, a]), c && (a = !0), t += d, n = !1, o += p.length;
        continue;
      }
      case ")":
        t += l, [r, a] = s.pop() ?? [-1, !1], n = !1, ++o;
        continue;
      case "|":
        t += l, r = -1, n = !1, ++o;
        continue;
      case "{": {
        let c = eM.exec(e.slice(o));
        if (!c || r < 0) {
          i("\\{"), ++o;
          continue;
        }
        let p = c[1].startsWith(",") ? `0${c[1]}` : c[1];
        o += c[0].length;
        let d = e[o];
        d === "+" || d === "*" ? (t = `${t.slice(0, r)}(?:${t.slice(r)}{${p}})${d}`, ++o) : t += `{${p}}`, n = !0;
        continue;
      }
      case "}":
        i("\\}"), ++o;
        continue;
      case "+":
        if (n) {
          ++o;
          continue;
        }
        t += l, n = !0, ++o;
        continue;
      case "*":
      case "?":
        t += l, n = !0, ++o;
        continue;
      default:
        i(a && em(l) ? `[${l.toLowerCase()}${l.toUpperCase()}]` : l), o += l.length;
        continue;
    }
  }
  return t;
}, lM = (e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), cM = (e, t, r) => {
  let n = [], a = 0;
  for (; a < e.length; ) {
    if (n.push(e[a]), (t.get(e[a]) ?? r) !== r) {
      ++a;
      continue;
    }
    for (; ++a < e.length && (t.get(e[a]) ?? r) === r; ) t.get(n.at(-1)) !== r && (n[n.length - 1] += e[a]);
  }
  return n;
}, uM = (e) => e >= 19968 && e <= 40959 || e >= 13312 && e <= 19903 || e >= 131072 && e <= 173791 || e >= 173824 && e <= 177983 || e >= 177984 && e <= 178207 || e >= 178208 && e <= 183983 || e >= 63744 && e <= 64255 || e >= 194560 && e <= 195103, dM = (e) => Number.isInteger(e) || typeof e == "bigint", pM = (e) => {
  let t = 0;
  for (let r of e) ++t;
  return t;
}, hM = (e) => am(e.toLowerCase()), Dt = (...e) => Array.prototype.concat.apply([], e), al = (e) => new Map(Object.entries(e)), _M = (e, t) => {
  let r = [], n = 0;
  for (let a of e.matchAll(t)) {
    let s = a[0];
    n < a.index && r.push(e.slice(n, a.index)), s.length > 0 && r.push(s), n = a.index + s.length;
  }
  return n < e.length && r.push(e.slice(n)), r;
}, am = (e) => e.replace(/\p{M}/gu, ""), U_ = (e, t, r = []) => {
  if (!e || Array.isArray(e) || typeof e != "object") return `${t} must be a valid object`;
  for (let n of r) if (!(n in e)) return `${t} must contain a "${n}" property`;
  return null;
}, fM = (e) => e.match(/\S+/g) || [], mM = class {
  constructor() {
    let e = function(...t) {
      return e._call(...t);
    };
    return Object.setPrototypeOf(e, new.target.prototype);
  }
}, ma = mM, gM = class extends ma {
  constructor(e) {
    super(), this.config = e;
  }
  _call(e) {
    return this.normalize(e);
  }
}, fr = gM, wM = class extends fr {
  tokenize_chinese_chars(e) {
    let t = [];
    for (let r = 0; r < e.length; ++r) {
      let n = e[r], a = n.charCodeAt(0);
      uM(a) ? (t.push(" "), t.push(n), t.push(" ")) : t.push(n);
    }
    return t.join("");
  }
  strip_accents(e) {
    return e.normalize("NFD").replace(/\p{Mn}/gu, "");
  }
  is_control(e) {
    switch (e) {
      case "	":
      case `
`:
      case "\r":
        return !1;
      default:
        return /^\p{Cc}|\p{Cf}|\p{Co}|\p{Cs}$/u.test(e);
    }
  }
  clean_text(e) {
    let t = [];
    for (let r of e) {
      let n = r.charCodeAt(0);
      n === 0 || n === 65533 || this.is_control(r) || (/^\s$/.test(r) ? t.push(" ") : t.push(r));
    }
    return t.join("");
  }
  normalize(e) {
    return this.config.clean_text && (e = this.clean_text(e)), this.config.handle_chinese_chars && (e = this.tokenize_chinese_chars(e)), this.config.lowercase ? (e = e.toLowerCase(), this.config.strip_accents !== !1 && (e = this.strip_accents(e))) : this.config.strip_accents && (e = this.strip_accents(e)), e;
  }
}, yM = wM, bM = class extends fr {
  constructor(e) {
    super(e), this.charsmap = e.precompiled_charsmap ?? null;
  }
  normalize(e) {
    return e = e.replace(/[\u0001-\u0008\u000B\u000E-\u001F\u007F\u008F\u009F]/gm, ""), e = e.replace(/[\u0009\u000A\u000C\u000D\u00A0\u1680\u2000-\u200F\u2028\u2029\u202F\u205F\u2581\u3000\uFEFF\uFFFD]/gm, " "), e.includes("\uFF5E") ? e = e.split("\uFF5E").map((t) => t.normalize("NFKC")).join("\uFF5E") : e = e.normalize("NFKC"), e;
  }
}, vM = bM, xM = class extends fr {
  constructor(e) {
    super(e), this.normalizers = (e.normalizers ?? []).map((t) => sm(t));
  }
  normalize(e) {
    return this.normalizers.reduce((t, r) => r ? r.normalize(t) : t, e);
  }
}, MM = xM, kM = class extends fr {
  constructor(e) {
    super(e), this.pattern = Ss(this.config.pattern ?? {});
  }
  normalize(e) {
    return this.pattern === null ? e : e.replaceAll(this.pattern, this.config.content ?? "");
  }
}, TM = kM, EM = class extends fr {
  constructor() {
    super(...arguments), this.form = "NFC";
  }
  normalize(e) {
    return e = e.normalize(this.form), e;
  }
}, Ps = EM, AM = class extends Ps {
  constructor() {
    super(...arguments), this.form = "NFC";
  }
}, CM = AM, SM = class extends Ps {
  constructor() {
    super(...arguments), this.form = "NFD";
  }
}, PM = SM, FM = class extends Ps {
  constructor() {
    super(...arguments), this.form = "NFKC";
  }
}, IM = FM, LM = class extends Ps {
  constructor() {
    super(...arguments), this.form = "NFKD";
  }
}, OM = LM, zM = class extends fr {
  normalize(e) {
    return this.config.strip_left && this.config.strip_right ? e = e.trim() : (this.config.strip_left && (e = e.trimStart()), this.config.strip_right && (e = e.trimEnd())), e;
  }
}, NM = zM, BM = class extends fr {
  normalize(e) {
    return am(e);
  }
}, $M = BM, DM = class extends fr {
  normalize(e) {
    return e.toLowerCase();
  }
}, RM = DM, GM = class extends fr {
  normalize(e) {
    return e = this.config.prepend + e, e;
  }
}, VM = GM;
function UM(e) {
  if (e === null) return null;
  switch (e.type) {
    case "BertNormalizer":
      return new yM(e);
    case "Precompiled":
      return new vM(e);
    case "Sequence":
      return new MM(e);
    case "Replace":
      return new TM(e);
    case "NFC":
      return new CM(e);
    case "NFD":
      return new PM(e);
    case "NFKC":
      return new IM(e);
    case "NFKD":
      return new OM(e);
    case "Strip":
      return new NM(e);
    case "StripAccents":
      return new $M(e);
    case "Lowercase":
      return new RM(e);
    case "Prepend":
      return new VM(e);
    default:
      throw new Error(`Unknown Normalizer type: ${e.type}`);
  }
}
var sm = UM, qM = class extends ma {
  pre_tokenize(e, t) {
    return (Array.isArray(e) ? e.map((r) => this.pre_tokenize_text(r, t)) : this.pre_tokenize_text(e, t)).flat();
  }
  _call(e, t) {
    return this.pre_tokenize(e, t);
  }
}, Vt = qM, im = (() => {
  let e = [...Array.from({ length: 94 }, (a, s) => s + 33), ...Array.from({ length: 12 }, (a, s) => s + 161), ...Array.from({ length: 82 }, (a, s) => s + 174)], t = e.slice(), r = 0;
  for (let a = 0; a < 256; ++a) e.includes(a) || (e.push(a), t.push(256 + r), r += 1);
  let n = t.map((a) => String.fromCharCode(a));
  return Object.fromEntries(e.map((a, s) => [a, n[s]]));
})(), jM = (e) => Object.fromEntries(Object.entries(e).map(([t, r]) => [r, t])), WM = jM(im), ys = "\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E", HM = class extends Vt {
  constructor(e) {
    super(), this.config = e, this.add_prefix_space = this.config.add_prefix_space ?? !1, this.trim_offsets = this.config.trim_offsets ?? !1, this.use_regex = this.config.use_regex ?? !0, this.pattern = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu, this.byte_encoder = im, this.text_encoder = new TextEncoder();
  }
  pre_tokenize_text(e, t) {
    return this.add_prefix_space && !e.startsWith(" ") && (e = " " + e), (this.use_regex ? e.match(this.pattern) || [] : [e]).map((r) => Array.from(this.text_encoder.encode(r), (n) => this.byte_encoder[n]).join(""));
  }
}, QM = HM, XM = class extends Vt {
  pre_tokenize_text(e, t) {
    return e.match(/\w+|[^\w\s]+/g) || [];
  }
}, YM = XM, JM = class extends Vt {
  constructor(e) {
    super(), this.replacement = e.replacement ?? "\u2581", this.str_rep = e.str_rep || this.replacement, this.prepend_scheme = e.prepend_scheme ?? "always";
  }
  pre_tokenize_text(e, t) {
    let { section_index: r = void 0 } = t ?? {}, n = e.replaceAll(" ", this.str_rep);
    return !n.startsWith(this.replacement) && (this.prepend_scheme === "always" || this.prepend_scheme === "first" && r === 0) && (n = this.str_rep + n), [n];
  }
}, ZM = JM, KM = class extends Vt {
  constructor(e) {
    super(), this.config = e, this.pattern = Ss(this.config.pattern ?? {}, this.config.invert ?? !0);
  }
  pre_tokenize_text(e) {
    return this.pattern === null ? [] : this.config.invert ? (e.match(this.pattern) || []).filter((t) => t) : this.config.behavior?.toLowerCase() === "removed" ? e.split(this.pattern).filter((t) => t) : _M(e, this.pattern);
  }
}, e1 = KM, t1 = class extends Vt {
  constructor(e) {
    super(), this.config = e, this.pattern = new RegExp(`[^${ys}]+|[${ys}]+`, "gu");
  }
  pre_tokenize_text(e) {
    return e.match(this.pattern) || [];
  }
}, r1 = t1, n1 = class extends Vt {
  constructor(e) {
    super(), this.config = e;
    let t = `[^\\d]+|\\d${this.config.individual_digits ? "" : "+"}`;
    this.pattern = new RegExp(t, "gu");
  }
  pre_tokenize_text(e) {
    return e.match(this.pattern) || [];
  }
}, a1 = n1, s1 = class extends Vt {
  constructor() {
    super(), this.pattern = new RegExp(`[^\\s${ys}]+|[${ys}]`, "gu");
  }
  pre_tokenize_text(e, t) {
    return e.trim().match(this.pattern) || [];
  }
}, i1 = s1, o1 = class extends Vt {
  constructor(e) {
    super(), this.config = e, this.pattern = Ss(this.config.pattern ?? {}), this.content = this.config.content ?? "";
  }
  pre_tokenize_text(e) {
    return this.pattern === null ? [e] : [e.replaceAll(this.pattern, this.config.content ?? "")];
  }
}, l1 = o1, c1 = class extends Vt {
  constructor(e) {
    super(), this.tokenizers = (e.pretokenizers ?? []).map((t) => om(t));
  }
  pre_tokenize_text(e, t) {
    return this.tokenizers.reduce((r, n) => n ? n.pre_tokenize(r, t) : r, [e]);
  }
}, u1 = c1, d1 = class extends Vt {
  pre_tokenize_text(e) {
    return fM(e);
  }
}, p1 = d1, h1 = class extends Vt {
  constructor(e) {
    super(), this.config = e, this._length = e.length;
  }
  pre_tokenize_text(e) {
    let t = [];
    for (let r = 0; r < e.length; r += this._length) t.push(e.slice(r, r + this._length));
    return t;
  }
}, _1 = h1;
function f1(e) {
  if (e === null) return null;
  switch (e.type) {
    case "BertPreTokenizer":
      return new i1();
    case "Sequence":
      return new u1(e);
    case "Whitespace":
      return new YM();
    case "WhitespaceSplit":
      return new p1();
    case "Metaspace":
      return new ZM(e);
    case "ByteLevel":
      return new QM(e);
    case "Split":
      return new e1(e);
    case "Punctuation":
      return new r1(e);
    case "Digits":
      return new a1(e);
    case "Replace":
      return new l1(e);
    case "FixedLength":
      return new _1(e);
    default:
      throw new Error(`Unknown PreTokenizer type: ${e.type}`);
  }
}
var om = f1, m1 = class extends ma {
  constructor(e) {
    super(), this.config = e, this.vocab = [], this.tokens_to_ids = /* @__PURE__ */ new Map(), this.unk_token_id = void 0, this.unk_token = void 0, this.end_of_word_suffix = void 0, this.fuse_unk = this.config.fuse_unk ?? !1;
  }
  _call(e) {
    let t = this.encode(e);
    return this.fuse_unk && (t = cM(t, this.tokens_to_ids, this.unk_token_id)), t;
  }
}, Fs = m1, g1 = class extends Fs {
  constructor(e) {
    super(e), this.max_input_chars_per_word = 100, this.tokens_to_ids = al(e.vocab), this.unk_token_id = this.tokens_to_ids.get(e.unk_token), this.unk_token = e.unk_token, this.max_input_chars_per_word = e.max_input_chars_per_word ?? 100, this.vocab = new Array(this.tokens_to_ids.size);
    for (let [t, r] of this.tokens_to_ids) this.vocab[r] = t;
  }
  encode(e) {
    let t = [];
    for (let r of e) {
      let n = [...r];
      if (n.length > this.max_input_chars_per_word) {
        t.push(this.unk_token);
        continue;
      }
      let a = !1, s = 0, i = [];
      for (; s < n.length; ) {
        let o = n.length, l = null;
        for (; s < o; ) {
          let c = n.slice(s, o).join("");
          if (s > 0 && (c = this.config.continuing_subword_prefix + c), this.tokens_to_ids.has(c)) {
            l = c;
            break;
          }
          --o;
        }
        if (l === null) {
          a = !0;
          break;
        }
        i.push(l), s = o;
      }
      a ? t.push(this.unk_token) : t.push(...i);
    }
    return t;
  }
}, q_ = g1, j_ = class lm {
  constructor(t, r) {
    this.is_leaf = t, this.children = r;
  }
  static default() {
    return new lm(!1, /* @__PURE__ */ new Map());
  }
}, w1 = class {
  constructor() {
    this.root = j_.default();
  }
  extend(e) {
    for (let t of e) this.push(t);
  }
  push(e) {
    let t = this.root;
    for (let r of e) {
      let n = t.children.get(r);
      n === void 0 && (n = j_.default(), t.children.set(r, n)), t = n;
    }
    t.is_leaf = !0;
  }
  *common_prefix_search(e, t = 0) {
    let r = this.root;
    if (r === void 0) return;
    let n = "";
    for (let a = t; a < e.length; ++a) {
      let s = e[a];
      if (n += s, r = r.children.get(s), r === void 0) return;
      r.is_leaf && (yield n);
    }
  }
}, y1 = w1, ko = class cm {
  constructor(t, r, n, a, s) {
    this.token_id = t, this.node_id = r, this.pos = n, this.length = a, this.score = s, this.prev = null, this.backtrace_score = 0;
  }
  clone() {
    let t = new cm(this.token_id, this.node_id, this.pos, this.length, this.score);
    return t.prev = this.prev, t.backtrace_score = this.backtrace_score, t;
  }
}, b1 = class {
  constructor(e, t, r) {
    this.chars = Array.from(e), this.len = this.chars.length, this.bos_token_id = t, this.eos_token_id = r, this.nodes = [], this.begin_nodes = Array.from({ length: this.len + 1 }, () => []), this.end_nodes = Array.from({ length: this.len + 1 }, () => []);
    let n = new ko(this.bos_token_id ?? 0, 0, 0, 0, 0), a = new ko(this.eos_token_id ?? 0, 1, this.len, 0, 0);
    this.nodes.push(n.clone()), this.nodes.push(a.clone()), this.begin_nodes[this.len].push(a), this.end_nodes[0].push(n);
  }
  insert(e, t, r, n) {
    let a = this.nodes.length, s = new ko(n, a, e, t, r);
    this.begin_nodes[e].push(s), this.end_nodes[e + t].push(s), this.nodes.push(s);
  }
  viterbi() {
    let e = this.len, t = 0;
    for (; t <= e; ) {
      if (this.begin_nodes[t].length == 0) return [];
      for (let s of this.begin_nodes[t]) {
        s.prev = null;
        let i = 0, o = null;
        for (let l of this.end_nodes[t]) {
          let c = l.backtrace_score + s.score;
          (o === null || c > i) && (o = l.clone(), i = c);
        }
        if (o !== null) s.prev = o, s.backtrace_score = i;
        else return [];
      }
      ++t;
    }
    let r = [], n = this.begin_nodes[e][0].prev;
    if (n === null) return [];
    let a = n.clone();
    for (; a.prev !== null; ) r.push(a.clone()), a = a.clone().prev.clone();
    return r.reverse(), r;
  }
  piece(e) {
    return this.chars.slice(e.pos, e.pos + e.length).join("");
  }
  tokens() {
    return this.viterbi().map((e) => this.piece(e));
  }
  token_ids() {
    return this.viterbi().map((e) => e.token_id);
  }
}, v1 = b1;
function x1(e) {
  if (e.length === 0) throw new Error("Array must not be empty");
  let t = e[0], r = 0;
  for (let n = 1; n < e.length; ++n) e[n] < t && (t = e[n], r = n);
  return [t, r];
}
var M1 = class extends Fs {
  constructor(e, t) {
    super(e);
    let r = e.vocab.length;
    this.vocab = new Array(r), this.scores = new Array(r);
    for (let n = 0; n < r; ++n) [this.vocab[n], this.scores[n]] = e.vocab[n];
    this.unk_token_id = e.unk_id, this.unk_token = this.vocab[e.unk_id], this.tokens_to_ids = new Map(this.vocab.map((n, a) => [n, a])), this.bos_token = " ", this.bos_token_id = this.tokens_to_ids.get(this.bos_token), this.eos_token = t, this.eos_token_id = this.tokens_to_ids.get(this.eos_token), this.unk_token = this.vocab[this.unk_token_id], this.min_score = x1(this.scores)[0], this.unk_score = this.min_score - 10, this.scores[this.unk_token_id] = this.unk_score, this.trie = new y1(), this.trie.extend(this.vocab), this.fuse_unk = !0;
  }
  populate_nodes(e) {
    let t = e.chars, r = 1, n = 0;
    for (; n < t.length; ) {
      let a = !1, s = this.trie.common_prefix_search(t, n);
      for (let i of s) {
        let o = this.tokens_to_ids.get(i), l = this.scores[o], c = pM(i);
        e.insert(n, c, l, o), !a && c === r && (a = !0);
      }
      a || e.insert(n, r, this.unk_score, this.unk_token_id), n += r;
    }
  }
  tokenize(e) {
    let t = new v1(e, this.bos_token_id, this.eos_token_id);
    return this.populate_nodes(t), t.tokens();
  }
  encode(e) {
    let t = [];
    for (let r of e) {
      let n = this.tokenize(r);
      t.push(...n);
    }
    return t;
  }
}, W_ = M1, k1 = class {
  constructor(e = (r, n) => r > n, t = 1 / 0) {
    this._heap = [], this._comparator = e, this._max_size = t;
  }
  get size() {
    return this._heap.length;
  }
  is_empty() {
    return this.size === 0;
  }
  peek() {
    return this._heap[0];
  }
  push(...e) {
    return this.extend(e);
  }
  extend(e) {
    for (let t of e) if (this.size < this._max_size) this._heap.push(t), this._sift_up();
    else {
      let r = this._smallest();
      this._comparator(t, this._heap[r]) && (this._heap[r] = t, this._sift_up_from(r));
    }
    return this.size;
  }
  pop() {
    let e = this.peek(), t = this.size - 1;
    return t > 0 && this._swap(0, t), this._heap.pop(), this._sift_down(), e;
  }
  replace(e) {
    let t = this.peek();
    return this._heap[0] = e, this._sift_down(), t;
  }
  _parent(e) {
    return (e + 1 >>> 1) - 1;
  }
  _left(e) {
    return (e << 1) + 1;
  }
  _right(e) {
    return e + 1 << 1;
  }
  _greater(e, t) {
    return this._comparator(this._heap[e], this._heap[t]);
  }
  _swap(e, t) {
    let r = this._heap[e];
    this._heap[e] = this._heap[t], this._heap[t] = r;
  }
  _sift_up() {
    this._sift_up_from(this.size - 1);
  }
  _sift_up_from(e) {
    for (; e > 0 && this._greater(e, this._parent(e)); ) this._swap(e, this._parent(e)), e = this._parent(e);
  }
  _sift_down() {
    let e = 0;
    for (; this._left(e) < this.size && this._greater(this._left(e), e) || this._right(e) < this.size && this._greater(this._right(e), e); ) {
      let t = this._right(e) < this.size && this._greater(this._right(e), this._left(e)) ? this._right(e) : this._left(e);
      this._swap(e, t), e = t;
    }
  }
  _smallest() {
    return 2 ** Math.floor(Math.log2(this.size)) - 1;
  }
}, T1 = k1, E1 = class {
  constructor(e) {
    this.capacity = e, this.cache = /* @__PURE__ */ new Map();
  }
  get(e) {
    if (!this.cache.has(e)) return;
    let t = this.cache.get(e);
    return this.cache.delete(e), this.cache.set(e, t), t;
  }
  put(e, t) {
    this.cache.has(e) && this.cache.delete(e), this.cache.set(e, t), this.cache.size > this.capacity && this.cache.delete(this.cache.keys().next().value);
  }
  clear() {
    this.cache.clear();
  }
}, A1 = E1, C1 = class extends Fs {
  constructor(e) {
    super(e), this.tokens_to_ids = al(e.vocab), this.unk_token_id = this.tokens_to_ids.get(e.unk_token), this.unk_token = e.unk_token, this.vocab = new Array(this.tokens_to_ids.size);
    for (let [r, n] of this.tokens_to_ids) this.vocab[n] = r;
    let t = Array.isArray(e.merges[0]);
    this.merges = t ? e.merges : e.merges.map((r) => r.split(" ", 2)), this.bpe_ranks = new Map(this.merges.map((r, n) => [JSON.stringify(r), n])), this.end_of_word_suffix = e.end_of_word_suffix, this.continuing_subword_suffix = e.continuing_subword_suffix ?? null, this.byte_fallback = this.config.byte_fallback ?? !1, this.byte_fallback && (this.text_encoder = new TextEncoder()), this.ignore_merges = this.config.ignore_merges ?? !1, this.max_length_to_cache = 256, this.cache_capacity = 1e4, this.cache = new A1(this.cache_capacity);
  }
  clear_cache() {
    this.cache.clear();
  }
  bpe(e) {
    if (e.length === 0) return [];
    let t = this.cache.get(e);
    if (t !== void 0) return t;
    let r = Array.from(e);
    this.end_of_word_suffix && (r[r.length - 1] += this.end_of_word_suffix);
    let n = [];
    if (r.length > 1) {
      let a = new T1((o, l) => o.score < l.score), s = { token: r[0], bias: 0, prev: null, next: null }, i = s;
      for (let o = 1; o < r.length; ++o) {
        let l = { bias: o / r.length, token: r[o], prev: i, next: null };
        i.next = l, this.add_node(a, i), i = l;
      }
      for (; !a.is_empty(); ) {
        let o = a.pop();
        if (o.deleted || !o.next || o.next.deleted) continue;
        if (o.deleted = !0, o.next.deleted = !0, o.prev) {
          let c = { ...o.prev };
          o.prev.deleted = !0, o.prev = c, c.prev ? c.prev.next = c : s = c;
        }
        let l = { token: o.token + o.next.token, bias: o.bias, prev: o.prev, next: o.next.next };
        l.prev ? (l.prev.next = l, this.add_node(a, l.prev)) : s = l, l.next && (l.next.prev = l, this.add_node(a, l));
      }
      for (let o = s; o !== null; o = o.next) n.push(o.token);
    } else n = r;
    if (this.continuing_subword_suffix) for (let a = 0; a < n.length - 1; ++a) n[a] += this.continuing_subword_suffix;
    return e.length < this.max_length_to_cache && this.cache.put(e, n), n;
  }
  add_node(e, t) {
    let r = this.bpe_ranks.get(JSON.stringify([t.token, t.next.token]));
    r !== void 0 && (t.score = r + t.bias, e.push(t));
  }
  encode(e) {
    let t = [];
    for (let r of e) {
      if (this.ignore_merges && this.tokens_to_ids.has(r)) {
        t.push(r);
        continue;
      }
      let n = this.bpe(r);
      for (let a of n) if (this.tokens_to_ids.has(a)) t.push(a);
      else if (this.byte_fallback) {
        let s = Array.from(this.text_encoder.encode(a)).map((i) => `<0x${i.toString(16).toUpperCase().padStart(2, "0")}>`);
        s.every((i) => this.tokens_to_ids.has(i)) ? t.push(...s) : this.unk_token != null && t.push(this.unk_token);
      } else this.unk_token != null && t.push(this.unk_token);
    }
    return t;
  }
}, H_ = C1, S1 = class extends Fs {
  constructor(e, t) {
    super(e);
    let r = e.vocab;
    this.tokens_to_ids = al(t.target_lang ? r[t.target_lang] : r), this.bos_token = t.bos_token, this.bos_token_id = this.tokens_to_ids.get(this.bos_token), this.eos_token = t.eos_token, this.eos_token_id = this.tokens_to_ids.get(this.eos_token), this.pad_token = t.pad_token, this.pad_token_id = this.tokens_to_ids.get(this.pad_token), this.unk_token = t.unk_token, this.unk_token_id = this.tokens_to_ids.get(this.unk_token), this.vocab = new Array(this.tokens_to_ids.size);
    for (let [n, a] of this.tokens_to_ids) this.vocab[a] = n;
  }
  encode(e) {
    return e;
  }
}, P1 = S1;
function F1(e, t) {
  switch (e.type) {
    case "WordPiece":
      return new q_(e);
    case "Unigram":
      return new W_(e, t.eos_token);
    case "BPE":
      return new H_(e);
    default:
      if (e.vocab) return Array.isArray(e.vocab) ? new W_(e, t.eos_token) : Object.hasOwn(e, "continuing_subword_prefix") && Object.hasOwn(e, "unk_token") ? Object.hasOwn(e, "merges") ? new H_(e) : new q_(e) : new P1(e, { target_lang: t.target_lang, bos_token: t.bos_token, eos_token: t.eos_token, pad_token: t.pad_token, unk_token: t.unk_token });
      throw new Error(`Unknown TokenizerModel type: ${e?.type}`);
  }
}
var I1 = F1, L1 = class extends ma {
  constructor(e) {
    super(), this.config = e;
  }
  _call(e, ...t) {
    return this.post_process(e, ...t);
  }
}, ga = L1, O1 = class extends ga {
  post_process(e, t = null, r = !0) {
    let n = t === null ? this.config.single : this.config.pair, a = [], s = [];
    for (let i of n) "SpecialToken" in i ? r && (a.push(i.SpecialToken.id), s.push(i.SpecialToken.type_id)) : "Sequence" in i && (i.Sequence.id === "A" ? (a = Dt(a, e), s = Dt(s, new Array(e.length).fill(i.Sequence.type_id))) : i.Sequence.id === "B" && (a = Dt(a, t), s = Dt(s, new Array(t.length).fill(i.Sequence.type_id))));
    return { tokens: a, token_type_ids: s };
  }
}, z1 = O1, N1 = class extends ga {
  post_process(e, t = null) {
    return { tokens: e, tokens_pair: t };
  }
}, B1 = N1, $1 = class extends ga {
  constructor(e) {
    super(e), this.sep = e.sep, this.cls = e.cls;
  }
  post_process(e, t = null, r = !0) {
    r && (e = Dt([this.cls[0]], e, [this.sep[0]]));
    let n = new Array(e.length).fill(0);
    if (t) {
      let a = [], s = r ? [this.sep[0]] : [];
      e = Dt(e, a, t, s), n = Dt(n, new Array(t.length + a.length + s.length).fill(1));
    }
    return { tokens: e, token_type_ids: n };
  }
}, D1 = $1, R1 = class extends ga {
  constructor(e) {
    super(e), this.sep = e.sep, this.cls = e.cls;
  }
  post_process(e, t, r = !0) {
    r && (e = Dt([this.cls[0]], e, [this.sep[0]]));
    let n = new Array(e.length).fill(0);
    if (t) {
      let a = r ? [this.sep[0]] : [], s = r ? [this.sep[0]] : [];
      e = Dt(e, a, t, s), n = Dt(n, new Array(t.length + a.length + s.length).fill(1));
    }
    return { tokens: e, token_type_ids: n };
  }
}, G1 = R1, V1 = class extends ga {
  constructor(e) {
    super(e), this.processors = (e.processors ?? []).map((t) => um(t));
  }
  post_process(e, t = null, r = !0) {
    let n = { tokens: e, tokens_pair: t };
    for (let a of this.processors) n = a.post_process(n.tokens, n.tokens_pair, r);
    return n;
  }
}, U1 = V1;
function q1(e) {
  if (e === null) return null;
  switch (e.type) {
    case "TemplateProcessing":
      return new z1(e);
    case "ByteLevel":
      return new B1(e);
    case "BertProcessing":
      return new D1(e);
    case "RobertaProcessing":
      return new G1(e);
    case "Sequence":
      return new U1(e);
    default:
      throw new Error(`Unknown PostProcessor type: ${e.type}`);
  }
}
var um = q1, j1 = class extends ma {
  constructor(e) {
    super(), this.config = e, this.added_tokens = [], this.end_of_word_suffix = null, this.trim_offsets = "trim_offsets" in e ? e.trim_offsets : !1;
  }
  _call(e) {
    return this.decode(e);
  }
  decode(e) {
    return this.decode_chain(e).join("");
  }
}, Ut = j1, W1 = class extends Ut {
  constructor(e) {
    super(e), this.byte_decoder = WM, this.text_decoder = new TextDecoder("utf-8", { fatal: !1, ignoreBOM: !0 }), this.end_of_word_suffix = null;
  }
  convert_tokens_to_string(e) {
    let t = e.join(""), r = new Uint8Array([...t].map((n) => this.byte_decoder[n]));
    return this.text_decoder.decode(r);
  }
  decode_chain(e) {
    let t = [], r = [];
    for (let n of e) this.added_tokens.find((a) => a.content === n) !== void 0 ? (r.length > 0 && (t.push(this.convert_tokens_to_string(r)), r = []), t.push(n)) : r.push(n);
    return r.length > 0 && t.push(this.convert_tokens_to_string(r)), t;
  }
}, H1 = W1, Q1 = class extends Ut {
  constructor(e) {
    super(e), this.cleanup = e.cleanup;
  }
  decode_chain(e) {
    return e.map((t, r) => {
      if (r !== 0) {
        let n = this.config.prefix;
        n && t.startsWith(n) ? t = t.replace(n, "") : t = " " + t;
      }
      return this.cleanup && (t = rl(t)), t;
    });
  }
}, X1 = Q1, Y1 = class extends Ut {
  constructor(e) {
    super(e), this.replacement = e.replacement ?? "\u2581";
  }
  decode_chain(e) {
    let t = [];
    for (let r = 0; r < e.length; ++r) {
      let n = e[r].replaceAll(this.replacement, " ");
      r == 0 && n.startsWith(" ") && (n = n.substring(1)), t.push(n);
    }
    return t;
  }
}, J1 = Y1, Z1 = class extends Ut {
  constructor(e) {
    super(e), this.suffix = e.suffix ?? "";
  }
  decode_chain(e) {
    return e.map((t, r) => t.replaceAll(this.suffix, r === e.length - 1 ? "" : " "));
  }
}, K1 = Z1, ek = class extends Ut {
  constructor(e) {
    super(e), this.pad_token = e.pad_token ?? "", this.word_delimiter_token = e.word_delimiter_token ?? "", this.cleanup = e.cleanup;
  }
  convert_tokens_to_string(e) {
    if (e.length === 0) return "";
    let t = [e[0]];
    for (let n = 1; n < e.length; ++n) e[n] !== t.at(-1) && t.push(e[n]);
    let r = t.filter((n) => n !== this.pad_token).join("");
    return this.cleanup && (r = rl(r).replaceAll(this.word_delimiter_token, " ").trim()), r;
  }
  decode_chain(e) {
    return [this.convert_tokens_to_string(e)];
  }
}, tk = ek, rk = class extends Ut {
  constructor(e) {
    super(e), this.decoders = (e.decoders ?? []).map((t) => dm(t));
  }
  decode_chain(e) {
    return this.decoders.reduce((t, r) => r.decode_chain(t), e);
  }
}, nk = rk, ak = class extends Ut {
  constructor(e) {
    super(e), this.pattern = Ss(this.config.pattern);
  }
  decode_chain(e) {
    let t = this.config.content ?? "", r = this.pattern;
    return r === null ? e : e.map((n) => n.replaceAll(r, t));
  }
}, sk = ak, ik = class extends Ut {
  decode_chain(e) {
    return [e.join("")];
  }
}, ok = ik, lk = class extends Ut {
  constructor(e) {
    super(e), this.content = e.content ?? "", this.start = e.start ?? 0, this.stop = e.stop ?? 0;
  }
  decode_chain(e) {
    return e.map((t) => {
      let r = 0;
      for (let a = 0; a < this.start && t[a] === this.content; ++a)
        r = a + 1;
      let n = t.length;
      for (let a = 0; a < this.stop; ++a) {
        let s = t.length - a - 1;
        if (t[s] === this.content) {
          n = s;
          continue;
        } else break;
      }
      return t.slice(r, n);
    });
  }
}, ck = lk, uk = class extends Ut {
  constructor(e) {
    super(e), this.text_decoder = new TextDecoder();
  }
  decode_chain(e) {
    let t = [], r = [];
    for (let n of e) {
      let a = null;
      if (n.length === 6 && n.startsWith("<0x") && n.endsWith(">")) {
        let s = parseInt(n.slice(3, 5), 16);
        isNaN(s) || (a = s);
      }
      if (a !== null) r.push(a);
      else {
        if (r.length > 0) {
          let s = this.text_decoder.decode(Uint8Array.from(r));
          t.push(s), r = [];
        }
        t.push(n);
      }
    }
    if (r.length > 0) {
      let n = this.text_decoder.decode(Uint8Array.from(r));
      t.push(n), r = [];
    }
    return t;
  }
}, dk = uk;
function pk(e) {
  if (e === null) return null;
  switch (e.type) {
    case "ByteLevel":
      return new H1(e);
    case "WordPiece":
      return new X1(e);
    case "Metaspace":
      return new J1(e);
    case "BPEDecoder":
      return new K1(e);
    case "CTC":
      return new tk(e);
    case "Sequence":
      return new nk(e);
    case "Replace":
      return new sk(e);
    case "Fuse":
      return new ok(e);
    case "Strip":
      return new ck(e);
    case "ByteFallback":
      return new dk(e);
    default:
      throw new Error(`Unknown Decoder type: ${e.type}`);
  }
}
var dm = pk, hk = class {
  constructor(e, t) {
    let r = U_(e, "Tokenizer", ["model", "decoder", "post_processor", "pre_tokenizer", "normalizer"]);
    if (r) throw new Error(r);
    let n = U_(t, "Config");
    if (n) throw new Error(n);
    this.tokenizer = e, this.config = t, this.normalizer = sm(this.tokenizer.normalizer), this.pre_tokenizer = om(this.tokenizer.pre_tokenizer), this.model = I1(this.tokenizer.model, this.config), this.post_processor = um(this.tokenizer.post_processor), this.decoder = dm(this.tokenizer.decoder), this.special_tokens = [], this.all_special_ids = [], this.added_tokens = [];
    let a = [], s = [];
    this.added_tokens_map = /* @__PURE__ */ new Map();
    for (let i of this.tokenizer.added_tokens) {
      let o = new qx(i);
      if (this.added_tokens.push(o), this.model.tokens_to_ids.set(o.content, o.id), this.model.vocab[o.id] = o.content, o.special && (this.special_tokens.push(o.content), this.all_special_ids.push(o.id)), this.added_tokens_map.set(o.content, o), o.normalized && this.normalizer !== null) {
        let l = this.normalizer(o.content);
        s.push(l), this.added_tokens_map.set(l, o);
      } else a.push(o.content);
    }
    (this.config.additional_special_tokens ?? []).forEach((i) => {
      this.special_tokens.includes(i) || this.special_tokens.push(i);
    }), this.decoder && (this.decoder.added_tokens = this.added_tokens, this.decoder.end_of_word_suffix = this.model.end_of_word_suffix), this.splitter_unnormalized = new $_(a), this.splitter_normalized = new $_(s), this.remove_space = this.config.remove_space, this.clean_up_tokenization_spaces = this.config.clean_up_tokenization_spaces ?? !0, this.do_lowercase_and_remove_accent = this.config.do_lowercase_and_remove_accent ?? !1;
  }
  encode(e, { text_pair: t = null, add_special_tokens: r = !0, return_token_type_ids: n = null } = {}) {
    let { tokens: a, token_type_ids: s } = this.tokenize_helper(e, { text_pair: t, add_special_tokens: r }), i = a.map((l) => this.added_tokens_map.get(l)?.id ?? this.model.tokens_to_ids.get(l) ?? this.model.unk_token_id), o = { ids: i, tokens: a, attention_mask: new Array(i.length).fill(1) };
    return n && s && (o.token_type_ids = s), o;
  }
  decode(e, t = {}) {
    if (!Array.isArray(e) || e.length === 0 || !dM(e[0])) throw Error("token_ids must be a non-empty array of integers.");
    let r = e.map((a) => this.model.vocab[Number(a)] ?? this.model.unk_token);
    t.skip_special_tokens && (r = r.filter((a) => !this.special_tokens.includes(a)));
    let n = this.decoder ? this.decoder(r) : r.join(" ");
    return this.decoder && this.decoder.end_of_word_suffix && (n = n.replaceAll(this.decoder.end_of_word_suffix, " "), t.skip_special_tokens && (n = n.trim())), (t.clean_up_tokenization_spaces ?? this.clean_up_tokenization_spaces) && (n = rl(n)), n;
  }
  tokenize(e, { text_pair: t = null, add_special_tokens: r = !1 } = {}) {
    return this.tokenize_helper(e, { text_pair: t, add_special_tokens: r }).tokens;
  }
  encode_text(e) {
    if (e === null) return null;
    let t = this.splitter_unnormalized.split(e);
    return t.forEach((r, n) => {
      let a = this.added_tokens_map.get(r);
      a && (a.lstrip && n > 0 && (t[n - 1] = t[n - 1].trimEnd()), a.rstrip && n < t.length - 1 && (t[n + 1] = t[n + 1].trimStart()));
    }), t.flatMap((r, n) => {
      if (r.length === 0) return [];
      if (this.added_tokens_map.has(r)) return [r];
      if (this.remove_space === !0 && (r = r.trim().split(/\s+/).join(" ")), this.do_lowercase_and_remove_accent && (r = hM(r)), this.normalizer !== null && (r = this.normalizer(r)), r.length === 0) return [];
      let a = this.splitter_normalized.split(r);
      return a.forEach((s, i) => {
        let o = this.added_tokens_map.get(s);
        o && (o.lstrip && i > 0 && (a[i - 1] = a[i - 1].trimEnd()), o.rstrip && i < a.length - 1 && (a[i + 1] = a[i + 1].trimStart()));
      }), a.flatMap((s) => {
        if (s.length === 0) return [];
        if (this.added_tokens_map.has(s)) return [s];
        let i = this.pre_tokenizer !== null ? this.pre_tokenizer(s, { section_index: n }) : [s];
        return this.model(i);
      });
    });
  }
  tokenize_helper(e, { text_pair: t = null, add_special_tokens: r = !0 }) {
    let n = this.encode_text(e), a = this.encode_text(t || null);
    return this.post_processor ? this.post_processor(n, a, r) : { tokens: Dt(n ?? [], a ?? []) };
  }
  token_to_id(e) {
    return this.model.tokens_to_ids.get(e);
  }
  id_to_token(e) {
    return this.model.vocab[e];
  }
  get_added_tokens_decoder() {
    let e = /* @__PURE__ */ new Map();
    for (let t of this.added_tokens) e.set(t.id, t);
    return e;
  }
  get_vocab(e = !0) {
    let t = /* @__PURE__ */ new Map();
    for (let r = 0; r < this.model.vocab.length; ++r) {
      let n = this.model.vocab[r];
      (e || !this.added_tokens_map.has(n)) && t.set(n, r);
    }
    return t;
  }
}, _k = hk, fk = Object.defineProperty, mk = (e, t, r) => t in e ? fk(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, gk = (e, t, r) => (mk(e, typeof t != "symbol" ? t + "" : t, r), r), B = Object.freeze({ Text: "Text", NumericLiteral: "NumericLiteral", StringLiteral: "StringLiteral", Identifier: "Identifier", Equals: "Equals", OpenParen: "OpenParen", CloseParen: "CloseParen", OpenStatement: "OpenStatement", CloseStatement: "CloseStatement", OpenExpression: "OpenExpression", CloseExpression: "CloseExpression", OpenSquareBracket: "OpenSquareBracket", CloseSquareBracket: "CloseSquareBracket", OpenCurlyBracket: "OpenCurlyBracket", CloseCurlyBracket: "CloseCurlyBracket", Comma: "Comma", Dot: "Dot", Colon: "Colon", Pipe: "Pipe", CallOperator: "CallOperator", AdditiveBinaryOperator: "AdditiveBinaryOperator", MultiplicativeBinaryOperator: "MultiplicativeBinaryOperator", ExponentiationBinaryOperator: "ExponentiationBinaryOperator", ComparisonBinaryOperator: "ComparisonBinaryOperator", UnaryOperator: "UnaryOperator", Comment: "Comment" }), Ct = class {
  constructor(e, t) {
    this.value = e, this.type = t;
  }
};
function Q_(e) {
  return /\w/.test(e);
}
function Zr(e) {
  return /[0-9]/.test(e);
}
function X_(e) {
  return /\s/.test(e);
}
var wk = [["{%", B.OpenStatement], ["%}", B.CloseStatement], ["{{", B.OpenExpression], ["}}", B.CloseExpression], ["(", B.OpenParen], [")", B.CloseParen], ["{", B.OpenCurlyBracket], ["}", B.CloseCurlyBracket], ["[", B.OpenSquareBracket], ["]", B.CloseSquareBracket], [",", B.Comma], [".", B.Dot], [":", B.Colon], ["|", B.Pipe], ["<=", B.ComparisonBinaryOperator], [">=", B.ComparisonBinaryOperator], ["==", B.ComparisonBinaryOperator], ["!=", B.ComparisonBinaryOperator], ["<", B.ComparisonBinaryOperator], [">", B.ComparisonBinaryOperator], ["+", B.AdditiveBinaryOperator], ["-", B.AdditiveBinaryOperator], ["~", B.AdditiveBinaryOperator], ["**", B.ExponentiationBinaryOperator], ["*", B.MultiplicativeBinaryOperator], ["//", B.MultiplicativeBinaryOperator], ["/", B.MultiplicativeBinaryOperator], ["%", B.MultiplicativeBinaryOperator], ["=", B.Equals]], yk = /* @__PURE__ */ new Map([["n", `
`], ["t", "	"], ["r", "\r"], ["b", "\b"], ["f", "\f"], ["v", "\v"], ["'", "'"], ['"', '"'], ["\\", "\\"]]);
function bk(e, t = {}) {
  return e.endsWith(`
`) && (e = e.slice(0, -1)), t.lstrip_blocks && (e = e.replace(/^[ \t]*({[#%-])/gm, "$1")), t.trim_blocks && (e = e.replace(/([#%-]})\n/g, "$1")), e.replace(/(\s*){%(-?)\s*(?:end)?generation\s*(-?)%}(\s*)/gs, (r, n, a, s, i) => (a ? "" : n) + (s ? "" : i));
}
function vk(e, t = {}) {
  let r = [], n = bk(e, t), a = 0, s = 0, i = (c) => {
    let p = "";
    for (; c(n[a]); ) {
      if (n[a] === "\\") {
        if (++a, a >= n.length) throw new SyntaxError("Unexpected end of input");
        let d = n[a++], _ = yk.get(d);
        if (_ === void 0) throw new SyntaxError(`Unexpected escaped character: ${d}`);
        p += _;
        continue;
      }
      if (p += n[a++], a >= n.length) throw new SyntaxError("Unexpected end of input");
    }
    return p;
  }, o = () => {
    let c = r.at(-1);
    c && c.type === B.Text && (c.value = c.value.trimEnd(), c.value === "" && r.pop());
  }, l = () => {
    for (; a < n.length && X_(n[a]); ) ++a;
  };
  e: for (; a < n.length; ) {
    let c = r.at(-1)?.type;
    if (c === void 0 || c === B.CloseStatement || c === B.CloseExpression || c === B.Comment) {
      let d = "";
      for (; a < n.length && !(n[a] === "{" && (n[a + 1] === "%" || n[a + 1] === "{" || n[a + 1] === "#")); ) d += n[a++];
      if (d.length > 0) {
        r.push(new Ct(d, B.Text));
        continue;
      }
    }
    if (n[a] === "{" && n[a + 1] === "#") {
      a += 2;
      let d = n[a] === "-";
      d && ++a;
      let _ = "";
      for (; n[a] !== "#" || n[a + 1] !== "}"; ) {
        if (a + 2 >= n.length) throw new SyntaxError("Missing end of comment tag");
        _ += n[a++];
      }
      let f = _.endsWith("-");
      f && (_ = _.slice(0, -1)), d && o(), r.push(new Ct(_, B.Comment)), a += 2, f && l();
      continue;
    }
    if (n.slice(a, a + 3) === "{%-") {
      o(), r.push(new Ct("{%", B.OpenStatement)), a += 3;
      continue;
    }
    if (n.slice(a, a + 3) === "{{-") {
      o(), r.push(new Ct("{{", B.OpenExpression)), s = 0, a += 3;
      continue;
    }
    if (i(X_), n.slice(a, a + 3) === "-%}") {
      r.push(new Ct("%}", B.CloseStatement)), a += 3, l();
      continue;
    }
    if (n.slice(a, a + 3) === "-}}") {
      r.push(new Ct("}}", B.CloseExpression)), a += 3, l();
      continue;
    }
    let p = n[a];
    if (p === "-" || p === "+") {
      let d = r.at(-1)?.type;
      if (d === B.Text || d === void 0) throw new SyntaxError(`Unexpected character: ${p}`);
      switch (d) {
        case B.Identifier:
        case B.NumericLiteral:
        case B.StringLiteral:
        case B.CloseParen:
        case B.CloseSquareBracket:
          break;
        default: {
          ++a;
          let _ = i(Zr);
          if (_.length > 0 && n[a] === "." && Zr(n[a + 1])) {
            ++a;
            let f = i(Zr);
            _ = `${_}.${f}`;
          }
          r.push(new Ct(`${p}${_}`, _.length > 0 ? B.NumericLiteral : B.UnaryOperator));
          continue;
        }
      }
    }
    for (let [d, _] of wk)
      if (!(d === "}}" && s > 0) && n.slice(a, a + d.length) === d) {
        r.push(new Ct(d, _)), _ === B.OpenExpression ? s = 0 : _ === B.OpenCurlyBracket ? ++s : _ === B.CloseCurlyBracket && --s, a += d.length;
        continue e;
      }
    if (p === "'" || p === '"') {
      ++a;
      let d = i((_) => _ !== p);
      r.push(new Ct(d, B.StringLiteral)), ++a;
      continue;
    }
    if (Zr(p)) {
      let d = i(Zr);
      if (r.at(-1)?.type !== B.Dot && n[a] === "." && Zr(n[a + 1])) {
        ++a;
        let _ = i(Zr);
        d = `${d}.${_}`;
      }
      r.push(new Ct(d, B.NumericLiteral));
      continue;
    }
    if (Q_(p)) {
      let d = i(Q_);
      r.push(new Ct(d, B.Identifier));
      continue;
    }
    throw new SyntaxError(`Unexpected character: ${p}`);
  }
  return r;
}
var Pt = class {
  type = "Statement";
}, xk = class extends Pt {
  constructor(e) {
    super(), this.body = e;
  }
  type = "Program";
}, Mk = class extends Pt {
  constructor(e, t, r) {
    super(), this.test = e, this.body = t, this.alternate = r;
  }
  type = "If";
}, kk = class extends Pt {
  constructor(e, t, r, n) {
    super(), this.loopvar = e, this.iterable = t, this.body = r, this.defaultBlock = n;
  }
  type = "For";
}, Tk = class extends Pt {
  type = "Break";
}, Ek = class extends Pt {
  type = "Continue";
}, Ak = class extends Pt {
  constructor(e, t, r) {
    super(), this.assignee = e, this.value = t, this.body = r;
  }
  type = "Set";
}, Ck = class extends Pt {
  constructor(e, t, r) {
    super(), this.name = e, this.args = t, this.body = r;
  }
  type = "Macro";
}, Sk = class extends Pt {
  constructor(e) {
    super(), this.value = e;
  }
  type = "Comment";
}, wt = class extends Pt {
  type = "Expression";
}, Pk = class extends wt {
  constructor(e, t, r) {
    super(), this.object = e, this.property = t, this.computed = r;
  }
  type = "MemberExpression";
}, Y_ = class extends wt {
  constructor(e, t) {
    super(), this.callee = e, this.args = t;
  }
  type = "CallExpression";
}, Tr = class extends wt {
  constructor(e) {
    super(), this.value = e;
  }
  type = "Identifier";
}, Pn = class extends wt {
  constructor(e) {
    super(), this.value = e;
  }
  type = "Literal";
}, Fk = class extends Pn {
  type = "IntegerLiteral";
}, Ik = class extends Pn {
  type = "FloatLiteral";
}, J_ = class extends Pn {
  type = "StringLiteral";
}, Lk = class extends Pn {
  type = "ArrayLiteral";
}, Z_ = class extends Pn {
  type = "TupleLiteral";
}, Ok = class extends Pn {
  type = "ObjectLiteral";
}, gn = class extends wt {
  constructor(e, t, r) {
    super(), this.operator = e, this.left = t, this.right = r;
  }
  type = "BinaryExpression";
}, zk = class extends wt {
  constructor(e, t) {
    super(), this.operand = e, this.filter = t;
  }
  type = "FilterExpression";
}, Nk = class extends Pt {
  constructor(e, t) {
    super(), this.filter = e, this.body = t;
  }
  type = "FilterStatement";
}, Bk = class extends wt {
  constructor(e, t) {
    super(), this.lhs = e, this.test = t;
  }
  type = "SelectExpression";
}, $k = class extends wt {
  constructor(e, t, r) {
    super(), this.operand = e, this.negate = t, this.test = r;
  }
  type = "TestExpression";
}, K_ = class extends wt {
  constructor(e, t) {
    super(), this.operator = e, this.argument = t;
  }
  type = "UnaryExpression";
}, Dk = class extends wt {
  constructor(e = void 0, t = void 0, r = void 0) {
    super(), this.start = e, this.stop = t, this.step = r;
  }
  type = "SliceExpression";
}, To = class extends wt {
  constructor(e, t) {
    super(), this.key = e, this.value = t;
  }
  type = "KeywordArgumentExpression";
}, Rk = class extends wt {
  constructor(e) {
    super(), this.argument = e;
  }
  type = "SpreadExpression";
}, Gk = class extends wt {
  constructor(e) {
    super(), this.argument = e;
  }
  type = "KeywordSpreadExpression";
}, Vk = class extends Pt {
  constructor(e, t, r) {
    super(), this.call = e, this.callerArgs = t, this.body = r;
  }
  type = "CallStatement";
}, Uk = class extends wt {
  constructor(e, t, r) {
    super(), this.condition = e, this.trueExpr = t, this.falseExpr = r;
  }
  type = "Ternary";
};
function qk(e) {
  let t = new xk([]), r = 0;
  function n(L, N) {
    let R = e[r++];
    if (!R || R.type !== L) throw new Error(`Parser Error: ${N}. ${R.type} !== ${L}.`);
    return R;
  }
  function a(L) {
    if (!l(L)) throw new SyntaxError(`Expected ${L}`);
    ++r;
  }
  function s() {
    switch (e[r].type) {
      case B.Comment:
        return new Sk(e[r++].value);
      case B.Text:
        return c();
      case B.OpenStatement:
        return p();
      case B.OpenExpression:
        return d();
      default:
        throw new SyntaxError(`Unexpected token type: ${e[r].type}`);
    }
  }
  function i(...L) {
    return r + L.length <= e.length && L.every((N, R) => N === e[r + R].type);
  }
  function o(...L) {
    return e[r]?.type === B.OpenStatement && e[r + 1]?.type === B.Identifier && L.includes(e[r + 1]?.value);
  }
  function l(...L) {
    return r + L.length <= e.length && L.every((N, R) => e[r + R].type === "Identifier" && N === e[r + R].value);
  }
  function c() {
    return new J_(n(B.Text, "Expected text token").value);
  }
  function p() {
    if (n(B.OpenStatement, "Expected opening statement token"), e[r].type !== B.Identifier) throw new SyntaxError(`Unknown statement, got ${e[r].type}`);
    let L = e[r].value, N;
    switch (L) {
      case "set":
        ++r, N = _();
        break;
      case "if":
        ++r, N = f(), n(B.OpenStatement, "Expected {% token"), a("endif"), n(B.CloseStatement, "Expected %} token");
        break;
      case "macro":
        ++r, N = w(), n(B.OpenStatement, "Expected {% token"), a("endmacro"), n(B.CloseStatement, "Expected %} token");
        break;
      case "for":
        ++r, N = b(), n(B.OpenStatement, "Expected {% token"), a("endfor"), n(B.CloseStatement, "Expected %} token");
        break;
      case "call": {
        ++r;
        let R = null;
        i(B.OpenParen) && (R = U("parameters"));
        let K = oe();
        if (K.type !== "Identifier") throw new SyntaxError("Expected identifier following call statement");
        let le = U("call");
        n(B.CloseStatement, "Expected closing statement token");
        let je = [];
        for (; !o("endcall"); ) je.push(s());
        n(B.OpenStatement, "Expected '{%'"), a("endcall"), n(B.CloseStatement, "Expected closing statement token");
        let Me = new Y_(K, le);
        N = new Vk(Me, R, je);
        break;
      }
      case "break":
        ++r, n(B.CloseStatement, "Expected closing statement token"), N = new Tk();
        break;
      case "continue":
        ++r, n(B.CloseStatement, "Expected closing statement token"), N = new Ek();
        break;
      case "filter": {
        ++r;
        let R = oe();
        R instanceof Tr && i(B.OpenParen) && (R = D(R)), n(B.CloseStatement, "Expected closing statement token");
        let K = [];
        for (; !o("endfilter"); ) K.push(s());
        n(B.OpenStatement, "Expected '{%'"), a("endfilter"), n(B.CloseStatement, "Expected '%}'"), N = new Nk(R, K);
        break;
      }
      default:
        throw new SyntaxError(`Unknown statement type: ${L}`);
    }
    return N;
  }
  function d() {
    n(B.OpenExpression, "Expected opening expression token");
    let L = x();
    return n(B.CloseExpression, "Expected closing expression token"), L;
  }
  function _() {
    let L = y(), N = null, R = [];
    if (i(B.Equals)) ++r, N = y();
    else {
      for (n(B.CloseStatement, "Expected %} token"); !o("endset"); ) R.push(s());
      n(B.OpenStatement, "Expected {% token"), a("endset");
    }
    return n(B.CloseStatement, "Expected closing statement token"), new Ak(L, N, R);
  }
  function f() {
    let L = x();
    n(B.CloseStatement, "Expected closing statement token");
    let N = [], R = [];
    for (; !o("elif", "else", "endif"); ) N.push(s());
    if (o("elif")) {
      ++r, ++r;
      let K = f();
      R.push(K);
    } else if (o("else")) for (++r, ++r, n(B.CloseStatement, "Expected closing statement token"); !o("endif"); ) R.push(s());
    return new Mk(L, N, R);
  }
  function w() {
    let L = oe();
    if (L.type !== "Identifier") throw new SyntaxError("Expected identifier following macro statement");
    let N = U("parameters");
    n(B.CloseStatement, "Expected closing statement token");
    let R = [];
    for (; !o("endmacro"); ) R.push(s());
    return new Ck(L, N, R);
  }
  function y(L = !1) {
    let N = L ? oe : x, R = [N()], K = i(B.Comma);
    for (; K && (++r, R.push(N()), !!i(B.Comma)); ) ;
    return K ? new Z_(R) : R[0];
  }
  function b() {
    let L = y(!0);
    if (!(L instanceof Tr || L instanceof Z_)) throw new SyntaxError(`Expected identifier/tuple for the loop variable, got ${L.type} instead`);
    if (!l("in")) throw new SyntaxError("Expected `in` keyword following loop variable");
    ++r;
    let N = x();
    n(B.CloseStatement, "Expected closing statement token");
    let R = [];
    for (; !o("endfor", "else"); ) R.push(s());
    let K = [];
    if (o("else")) for (++r, ++r, n(B.CloseStatement, "Expected closing statement token"); !o("endfor"); ) K.push(s());
    return new kk(L, N, R, K);
  }
  function x() {
    return T();
  }
  function T() {
    let L = A();
    if (l("if")) {
      ++r;
      let N = A();
      if (l("else")) {
        ++r;
        let R = T();
        return new Uk(N, L, R);
      } else return new Bk(L, N);
    }
    return L;
  }
  function A() {
    let L = E();
    for (; l("or"); ) {
      let N = e[r];
      ++r;
      let R = E();
      L = new gn(N, L, R);
    }
    return L;
  }
  function E() {
    let L = S();
    for (; l("and"); ) {
      let N = e[r];
      ++r;
      let R = S();
      L = new gn(N, L, R);
    }
    return L;
  }
  function S() {
    let L;
    for (; l("not"); ) {
      let N = e[r];
      ++r;
      let R = S();
      L = new K_(N, R);
    }
    return L ?? O();
  }
  function O() {
    let L = M();
    for (; ; ) {
      let N;
      if (l("not", "in")) N = new Ct("not in", B.Identifier), r += 2;
      else if (l("in")) N = e[r++];
      else if (i(B.ComparisonBinaryOperator)) N = e[r++];
      else break;
      let R = M();
      L = new gn(N, L, R);
    }
    return L;
  }
  function M() {
    let L = $();
    for (; i(B.AdditiveBinaryOperator); ) {
      let N = e[r];
      ++r;
      let R = $();
      L = new gn(N, L, R);
    }
    return L;
  }
  function G() {
    let L = Q(oe());
    return i(B.OpenParen) ? D(L) : L;
  }
  function D(L) {
    let N = new Y_(L, U("call"));
    return N = Q(N), i(B.OpenParen) && (N = D(N)), N;
  }
  function U(L) {
    n(B.OpenParen, "Expected opening parenthesis for arguments list");
    let N = q(L);
    return n(B.CloseParen, "Expected closing parenthesis for arguments list"), N;
  }
  function q(L) {
    let N = [], R = /* @__PURE__ */ new Set(), K = !1, le = !1;
    for (; !i(B.CloseParen); ) {
      let je = i(B.ExponentiationBinaryOperator), Me = i(B.MultiplicativeBinaryOperator) && e[r].value === "*";
      if (L === "parameters" && (je || Me)) throw new SyntaxError("Argument unpacking is not allowed in parameter declarations");
      if (je) {
        if (++r, N.push(new Gk(x())), i(B.Comma) && ++r, !i(B.CloseParen)) throw new SyntaxError("Expected closing parenthesis: `**` must be applied to the final argument");
        break;
      }
      let be;
      if (Me) {
        if (le) throw new SyntaxError("Only one `*` argument unpacking is allowed");
        le = !0, ++r;
        let Ve = x();
        be = new Rk(Ve);
      } else {
        if (be = x(), i(B.Equals)) {
          if (++r, !(be instanceof Tr)) throw new SyntaxError(L === "parameters" ? "Expected identifier for parameter declaration" : "Expected identifier for keyword argument");
          let Ve = x();
          be = new To(be, Ve);
        }
        if (L === "parameters") {
          if (!(be instanceof Tr || be instanceof To)) throw new SyntaxError("Expected identifier for parameter declaration");
          let Ve = be instanceof Tr ? be.value : be.key.value;
          if (R.has(Ve)) throw new SyntaxError(`Duplicate parameter name: ${Ve}`);
          R.add(Ve);
        }
        if (be instanceof To) K = !0;
        else {
          if (K) throw new SyntaxError(L === "call" ? "Positional arguments must come before keyword arguments" : "Non-default argument follows default argument");
          if (le) throw new SyntaxError("Positional arguments must not follow `*` argument unpacking");
        }
      }
      N.push(be), i(B.Comma) && ++r;
    }
    return N;
  }
  function H() {
    let L = [], N = !1;
    for (; !i(B.CloseSquareBracket); ) i(B.Colon) ? (L.push(void 0), ++r, N = !0) : (L.push(x()), i(B.Colon) && (++r, N = !0));
    if (L.length === 0) throw new SyntaxError("Expected at least one argument for member/slice expression");
    if (N) {
      if (L.length > 3) throw new SyntaxError("Expected 0-3 arguments for slice expression");
      return new Dk(...L);
    }
    return L[0];
  }
  function Q(L) {
    for (; i(B.Dot) || i(B.OpenSquareBracket); ) {
      let N = e[r];
      ++r;
      let R, K = N.type === B.OpenSquareBracket;
      if (K) R = H(), n(B.CloseSquareBracket, "Expected closing square bracket");
      else if (R = oe(), R.type !== "Identifier" && R.type !== "IntegerLiteral") throw new SyntaxError("Expected identifier or integer following dot operator");
      L = new Pk(L, R, K);
    }
    return L;
  }
  function $() {
    let L = C();
    for (; i(B.MultiplicativeBinaryOperator); ) {
      let N = e[r++], R = C();
      L = new gn(N, L, R);
    }
    return L;
  }
  function C() {
    let L = ae();
    for (; i(B.ExponentiationBinaryOperator); ) {
      let N = e[r++], R = ae();
      L = new gn(N, L, R);
    }
    return L;
  }
  function ae() {
    let L = ge();
    for (; l("is"); ) {
      ++r;
      let N = l("not");
      N && ++r;
      let R = oe();
      if (!(R instanceof Tr)) throw new SyntaxError("Expected identifier for the test");
      L = new $k(L, N, R);
    }
    return L;
  }
  function ge() {
    let L = J();
    for (; i(B.Pipe); ) {
      ++r;
      let N = oe();
      if (!(N instanceof Tr)) throw new SyntaxError("Expected identifier for the filter");
      i(B.OpenParen) && (N = D(N)), L = new zk(L, N);
    }
    return L;
  }
  function J() {
    let L = e[r];
    if (L && (L.type === B.UnaryOperator || L.type === B.AdditiveBinaryOperator) && (L.value === "-" || L.value === "+")) {
      let N = e[r++], R = J();
      return new K_(N, R);
    }
    return G();
  }
  function oe() {
    let L = e[r++];
    switch (L.type) {
      case B.NumericLiteral: {
        let N = L.value;
        return N.includes(".") ? new Ik(Number(N)) : new Fk(Number(N));
      }
      case B.StringLiteral: {
        let N = L.value;
        for (; i(B.StringLiteral); ) N += e[r++].value;
        return new J_(N);
      }
      case B.Identifier:
        return new Tr(L.value);
      case B.OpenParen: {
        let N = y();
        return n(B.CloseParen, "Expected closing parenthesis, got ${tokens[current].type} instead."), N;
      }
      case B.OpenSquareBracket: {
        let N = [];
        for (; !i(B.CloseSquareBracket); ) N.push(x()), i(B.Comma) && ++r;
        return ++r, new Lk(N);
      }
      case B.OpenCurlyBracket: {
        let N = /* @__PURE__ */ new Map();
        for (; !i(B.CloseCurlyBracket); ) {
          let R = x();
          n(B.Colon, "Expected colon between key and value in object literal");
          let K = x();
          N.set(R, K), i(B.Comma) && ++r;
        }
        return ++r, new Ok(N);
      }
      default:
        throw new SyntaxError(`Unexpected token: ${L.type}`);
    }
  }
  for (; r < e.length; ) t.body.push(s());
  return t;
}
function jk(e, t, r = 1) {
  if (t === void 0 && (t = e, e = 0), r === 0) throw new Error("range() step must not be zero");
  let n = [];
  if (r > 0) for (let a = e; a < t; a += r) n.push(a);
  else for (let a = e; a > t; a += r) n.push(a);
  return n;
}
function ef(e, t, r, n = 1) {
  let a = Math.sign(n);
  a >= 0 ? (t = (t ??= 0) < 0 ? Math.max(e.length + t, 0) : Math.min(t, e.length), r = (r ??= e.length) < 0 ? Math.max(e.length + r, 0) : Math.min(r, e.length)) : (t = (t ??= e.length - 1) < 0 ? Math.max(e.length + t, -1) : Math.min(t, e.length - 1), r = (r ??= -1) < -1 ? Math.max(e.length + r, -1) : Math.min(r, e.length - 1));
  let s = [];
  for (let i = t; a * i < a * r; i += n) s.push(e[i]);
  return s;
}
function Wk(e) {
  return e.replace(/\b\w/g, (t) => t.toUpperCase());
}
function Hk(e) {
  return Qk(/* @__PURE__ */ new Date(), e);
}
function Qk(e, t) {
  let r = new Intl.DateTimeFormat(void 0, { month: "long" }), n = new Intl.DateTimeFormat(void 0, { month: "short" }), a = (s) => s < 10 ? "0" + s : s.toString();
  return t.replace(/%[YmdbBHM%]/g, (s) => {
    switch (s) {
      case "%Y":
        return e.getFullYear().toString();
      case "%m":
        return a(e.getMonth() + 1);
      case "%d":
        return a(e.getDate());
      case "%b":
        return n.format(e);
      case "%B":
        return r.format(e);
      case "%H":
        return a(e.getHours());
      case "%M":
        return a(e.getMinutes());
      case "%%":
        return "%";
      default:
        return s;
    }
  });
}
function Xk(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Yk(e, t, r, n) {
  if (n === 0) return e;
  let a = n == null || n < 0 ? 1 / 0 : n, s = t.length === 0 ? new RegExp("(?=)", "gu") : new RegExp(Xk(t), "gu");
  return e.replaceAll(s, (i) => a > 0 ? (--a, r) : i);
}
var tf = class extends Error {
}, rf = class extends Error {
}, Jk = /* @__PURE__ */ new Map(), qt = class {
  type = "RuntimeValue";
  value;
  get builtins() {
    return Jk;
  }
  constructor(e = void 0) {
    this.value = e;
  }
  __bool__() {
    return new re(!!this.value);
  }
  toString() {
    return String(this.value);
  }
}, se = class extends qt {
  type = "IntegerValue";
}, Ee = class extends qt {
  type = "FloatValue";
  toString() {
    return Object.is(this.value, -0) ? "-0.0" : this.value % 1 === 0 ? this.value.toFixed(1) : this.value.toString();
  }
}, Y = class extends qt {
  type = "StringValue";
  _builtins;
  get builtins() {
    return this._builtins ??= /* @__PURE__ */ new Map([["upper", new ze(() => new Y(this.value.toUpperCase()))], ["lower", new ze(() => new Y(this.value.toLowerCase()))], ["strip", new ze(() => new Y(this.value.trim()))], ["title", new ze(() => new Y(Wk(this.value)))], ["capitalize", new ze(() => new Y(this.value.charAt(0).toUpperCase() + this.value.slice(1)))], ["length", new se(this.value.length)], ["rstrip", new ze(() => new Y(this.value.trimEnd()))], ["lstrip", new ze(() => new Y(this.value.trimStart()))], ["startswith", new ze((e) => {
      if (e.length === 0) throw new Error("startswith() requires at least one argument");
      let t = e[0];
      if (t instanceof Y) return new re(this.value.startsWith(t.value));
      if (t instanceof fe) {
        for (let r of t.value) {
          if (!(r instanceof Y)) throw new Error("startswith() tuple elements must be strings");
          if (this.value.startsWith(r.value)) return new re(!0);
        }
        return new re(!1);
      }
      throw new Error("startswith() argument must be a string or tuple of strings");
    })], ["endswith", new ze((e) => {
      if (e.length === 0) throw new Error("endswith() requires at least one argument");
      let t = e[0];
      if (t instanceof Y) return new re(this.value.endsWith(t.value));
      if (t instanceof fe) {
        for (let r of t.value) {
          if (!(r instanceof Y)) throw new Error("endswith() tuple elements must be strings");
          if (this.value.endsWith(r.value)) return new re(!0);
        }
        return new re(!1);
      }
      throw new Error("endswith() argument must be a string or tuple of strings");
    })], ["split", new ze((e) => {
      let t = e[0] ?? new $e();
      if (!(t instanceof Y || t instanceof $e)) throw new Error("sep argument must be a string or null");
      let r = e[1] ?? new se(-1);
      if (!(r instanceof se)) throw new Error("maxsplit argument must be a number");
      let n = [];
      if (t instanceof $e) {
        let a = this.value.trimStart();
        for (let { 0: s, index: i } of a.matchAll(/\S+/g)) {
          if (r.value !== -1 && n.length >= r.value && i !== void 0) {
            n.push(s + a.slice(i + s.length));
            break;
          }
          n.push(s);
        }
      } else {
        if (t.value === "") throw new Error("empty separator");
        n = this.value.split(t.value), r.value !== -1 && n.length > r.value && n.push(n.splice(r.value).join(t.value));
      }
      return new fe(n.map((a) => new Y(a)));
    })], ["replace", new ze((e) => {
      if (e.length < 2) throw new Error("replace() requires at least two arguments");
      let t = e[0], r = e[1];
      if (!(t instanceof Y && r instanceof Y)) throw new Error("replace() arguments must be strings");
      let n;
      if (e.length > 2 ? e[2].type === "KeywordArgumentsValue" ? n = e[2].value.get("count") ?? new $e() : n = e[2] : n = new $e(), !(n instanceof se || n instanceof $e)) throw new Error("replace() count argument must be a number or null");
      return new Y(Yk(this.value, t.value, r.value, n.value));
    })]]);
  }
}, re = class extends qt {
  type = "BooleanValue";
}, Zk = /[\x7f-\uffff]/g;
function nf(e) {
  return e.replace(Zk, (t) => "\\u" + t.charCodeAt(0).toString(16).padStart(4, "0"));
}
function Fr(e, t = {}, r = 0, n = !0) {
  let { indent: a = null, ensureAscii: s = !1, separators: i = null, sortKeys: o = !1 } = t, l, c;
  switch (i ? [l, c] = i : a ? (l = ",", c = ": ") : (l = ", ", c = ": "), e.type) {
    case "NullValue":
      return "null";
    case "UndefinedValue":
      return n ? "null" : "undefined";
    case "IntegerValue":
    case "FloatValue":
    case "BooleanValue":
      return JSON.stringify(e.value);
    case "StringValue": {
      let p = JSON.stringify(e.value);
      return s && (p = nf(p)), p;
    }
    case "ArrayValue":
    case "NamespaceValue":
    case "ObjectValue": {
      let p = a ? " ".repeat(a) : "", d = `
` + p.repeat(r), _ = d + p;
      if (e.type === "ArrayValue") {
        let f = e.value.map((w) => Fr(w, t, r + 1, n));
        return a ? `[${_}${f.join(`${l}${_}`)}${d}]` : `[${f.join(l)}]`;
      } else {
        let f = Array.from(e.value.entries());
        o && (f = f.sort(([y], [b]) => y.localeCompare(b)));
        let w = f.map(([y, b]) => {
          let x = JSON.stringify(y);
          s && (x = nf(x));
          let T = `${x}${c}${Fr(b, t, r + 1, n)}`;
          return a ? `${_}${T}` : T;
        });
        return a ? `{${w.join(l)}${d}}` : `{${w.join(l)}}`;
      }
    }
    default:
      throw new Error(`Cannot convert to JSON: ${e.type}`);
  }
}
var ct = class extends qt {
  type = "ObjectValue";
  _builtins;
  __bool__() {
    return new re(this.value.size > 0);
  }
  get builtins() {
    return this._builtins ??= /* @__PURE__ */ new Map([["get", new ze(([e, t]) => {
      if (!(e instanceof Y)) throw new Error(`Object key must be a string: got ${e.type}`);
      return this.value.get(e.value) ?? t ?? new $e();
    })], ["items", new ze(() => this.items())], ["keys", new ze(() => this.keys())], ["values", new ze(() => this.values())], ["dictsort", new ze((e) => {
      let t = /* @__PURE__ */ new Map(), r = e.filter((o) => o instanceof tn ? (t = o.value, !1) : !0), n = r.at(0) ?? t.get("case_sensitive") ?? new re(!1);
      if (!(n instanceof re)) throw new Error("case_sensitive must be a boolean");
      let a = r.at(1) ?? t.get("by") ?? new Y("key");
      if (!(a instanceof Y)) throw new Error("by must be a string");
      if (!["key", "value"].includes(a.value)) throw new Error("by must be either 'key' or 'value'");
      let s = r.at(2) ?? t.get("reverse") ?? new re(!1);
      if (!(s instanceof re)) throw new Error("reverse must be a boolean");
      let i = Array.from(this.value.entries()).map(([o, l]) => new fe([new Y(o), l])).sort((o, l) => {
        let c = a.value === "key" ? 0 : 1, p = o.value[c], d = l.value[c], _ = Bo(p, d, n.value);
        return s.value ? -_ : _;
      });
      return new fe(i);
    })]]);
  }
  items() {
    return new fe(Array.from(this.value.entries()).map(([e, t]) => new fe([new Y(e), t])));
  }
  keys() {
    return new fe(Array.from(this.value.keys()).map((e) => new Y(e)));
  }
  values() {
    return new fe(Array.from(this.value.values()));
  }
  toString() {
    return Fr(this, {}, 0, !1);
  }
}, tn = class extends ct {
  type = "KeywordArgumentsValue";
}, sl = class extends qt {
  type = "NamespaceValue";
  toString() {
    return Fr(this, {}, 0, !1);
  }
}, fe = class extends qt {
  type = "ArrayValue";
  _builtins;
  get builtins() {
    return this._builtins ??= /* @__PURE__ */ new Map([["length", new se(this.value.length)]]);
  }
  __bool__() {
    return new re(this.value.length > 0);
  }
  toString() {
    return Fr(this, {}, 0, !1);
  }
}, af = class extends fe {
  type = "TupleValue";
}, ze = class extends qt {
  type = "FunctionValue";
}, $e = class extends qt {
  type = "NullValue";
}, Oe = class extends qt {
  type = "UndefinedValue";
};
function Kk(e) {
  let t;
  if (e instanceof fe ? t = e.value : e instanceof Y && (t = Array.from(e.value, (a) => new Y(a))), !t || t.length !== 2) throw new Error("namespace expected an object or an iterable of [key, value] pairs");
  let [r, n] = t;
  if (!(r instanceof Y)) throw new Error("namespace keys must be strings");
  return [r, n];
}
var pm = class {
  constructor(e) {
    this.parent = e;
  }
  variables = /* @__PURE__ */ new Map([["namespace", new ze((e) => {
    let t = e.slice(), r;
    if (t.at(-1) instanceof tn && (r = t.pop()), t.length > 1) throw new Error(`namespace expected at most 1 argument, got ${t.length}`);
    let n = /* @__PURE__ */ new Map();
    if (t.length === 1) {
      let a = t[0];
      if (a instanceof ct) for (let [s, i] of a.value) n.set(s, i);
      else if (a instanceof fe) for (let s of a.value) {
        let [i, o] = Kk(s);
        n.set(i.value, o);
      }
      else throw new Error(`'${a.type}' object is not iterable`);
    }
    if (r) for (let [a, s] of r.value) n.set(a, s);
    return new sl(n);
  })]]);
  tests = pm.TESTS;
  set(e, t) {
    return this.declareVariable(e, ds(t));
  }
  declareVariable(e, t) {
    if (this.variables.has(e)) throw new SyntaxError(`Variable already declared: ${e}`);
    return this.variables.set(e, t), t;
  }
  setVariable(e, t) {
    return this.variables.set(e, t), t;
  }
  resolve(e) {
    if (this.variables.has(e)) return this;
    if (this.parent) return this.parent.resolve(e);
    throw new Error(`Unknown variable: ${e}`);
  }
  lookupVariable(e) {
    try {
      return this.resolve(e).variables.get(e) ?? new Oe();
    } catch {
      return new Oe();
    }
  }
}, Ar = pm;
gk(Ar, "TESTS", /* @__PURE__ */ new Map([["boolean", (e) => e.type === "BooleanValue"], ["callable", (e) => e instanceof ze], ["odd", (e) => {
  if (!(e instanceof se)) throw new Error(`cannot odd on ${e.type}`);
  return e.value % 2 !== 0;
}], ["even", (e) => {
  if (!(e instanceof se)) throw new Error(`cannot even on ${e.type}`);
  return e.value % 2 === 0;
}], ["false", (e) => e.type === "BooleanValue" && !e.value], ["true", (e) => e.type === "BooleanValue" && e.value], ["none", (e) => e.type === "NullValue"], ["string", (e) => e.type === "StringValue"], ["number", (e) => e instanceof se || e instanceof Ee], ["integer", (e) => e instanceof se], ["iterable", (e) => e.type === "ArrayValue" || e.type === "StringValue"], ["mapping", (e) => e instanceof ct], ["sequence", (e) => e instanceof fe || e instanceof ct || e instanceof Y], ["lower", (e) => {
  let t = e.value;
  return e.type === "StringValue" && t === t.toLowerCase();
}], ["upper", (e) => {
  let t = e.value;
  return e.type === "StringValue" && t === t.toUpperCase();
}], ["none", (e) => e.type === "NullValue"], ["defined", (e) => e.type !== "UndefinedValue"], ["undefined", (e) => e.type === "UndefinedValue"], ["equalto", (e, t) => e.value === t.value], ["eq", (e, t) => e.value === t.value]]));
function eT(e) {
  e.set("false", !1), e.set("true", !0), e.set("none", null), e.set("raise_exception", (t) => {
    throw new Error(t);
  }), e.set("range", jk), e.set("strftime_now", Hk), e.set("True", !0), e.set("False", !1), e.set("None", null);
}
function us(e) {
  return e instanceof ct || e instanceof sl;
}
function bs(e) {
  return e instanceof se || e instanceof Ee || e instanceof re;
}
function vs(e) {
  return e instanceof re ? Number(e.value) : e.value;
}
function sf(e, t) {
  let r = t.split("."), n = e;
  for (let a of r) if (us(n)) n = n.value.get(a) ?? new Oe();
  else if (n instanceof fe) {
    let s = parseInt(a, 10);
    if (!isNaN(s) && s >= 0 && s < n.value.length) n = n.value[s];
    else return new Oe();
  } else return new Oe();
  return n;
}
function Bo(e, t, r = !1) {
  if (e instanceof $e && t instanceof $e) return 0;
  if (e instanceof $e || t instanceof $e) throw new Error(`Cannot compare ${e.type} with ${t.type}`);
  if (e instanceof Oe && t instanceof Oe) return 0;
  if (e instanceof Oe || t instanceof Oe) throw new Error(`Cannot compare ${e.type} with ${t.type}`);
  if (bs(e) && bs(t)) {
    let n = vs(e), a = vs(t);
    return n < a ? -1 : n > a ? 1 : 0;
  }
  if (e.type !== t.type) throw new Error(`Cannot compare different types: ${e.type} and ${t.type}`);
  if (e.type === "StringValue") {
    let n = e.value, a = t.value;
    return r || (n = n.toLowerCase(), a = a.toLowerCase()), n < a ? -1 : n > a ? 1 : 0;
  } else throw new Error(`Cannot compare type: ${e.type}`);
}
function $o(e) {
  if (e.type === "Identifier") return { name: e.value };
  let t = e;
  return { name: t.key.value, defaultValue: t.value };
}
function of(e) {
  return e === "kwargs" || e === "varargs";
}
function lf(e, t) {
  let r = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), a = (p) => {
    of(p) && r.add(p);
  }, s = (p) => {
    if (p.type === "Identifier") a(p.value);
    else if (p.type === "TupleLiteral") for (let d of p.value) s(d);
  }, i = (p) => {
    a($o(p).name);
  }, o = (p) => {
    for (let d of p) {
      let _ = $o(d);
      _.defaultValue && c(_.defaultValue);
    }
  }, l = (p) => {
    p.type === "CallExpression" && c(p.args);
  }, c = (p) => {
    if (Array.isArray(p)) {
      for (let d of p) c(d);
      return;
    }
    if (p instanceof Map) {
      for (let [d, _] of p) c(d), c(_);
      return;
    }
    if (p instanceof Pt) switch (p.type) {
      case "For": {
        let d = p;
        if (s(d.loopvar), d.iterable.type === "SelectExpression") {
          let _ = d.iterable;
          c(_.lhs), c(d.body), c(d.defaultBlock), c(_.test);
          return;
        }
        c(d.iterable), c(d.body), c(d.defaultBlock);
        return;
      }
      case "Set": {
        let d = p;
        s(d.assignee), c(d.value), c(d.body);
        return;
      }
      case "Macro": {
        let d = p;
        for (let _ of d.args) i(_);
        o(d.args), c(d.body);
        return;
      }
      case "CallStatement": {
        let d = p;
        c(d.call);
        for (let _ of d.callerArgs ?? []) i(_);
        o(d.callerArgs ?? []), c(d.body);
        return;
      }
      case "FilterStatement": {
        let d = p;
        c(d.body), l(d.filter);
        return;
      }
      case "Identifier": {
        let d = p.value;
        of(d) && !r.has(d) && n.add(d);
        return;
      }
      case "MemberExpression": {
        let d = p;
        c(d.object), d.computed && c(d.property);
        return;
      }
      case "FilterExpression": {
        let d = p;
        c(d.operand), l(d.filter);
        return;
      }
      case "TestExpression":
        c(p.operand);
        return;
      case "SelectExpression": {
        let d = p;
        c(d.test), c(d.lhs);
        return;
      }
      case "KeywordArgumentExpression":
        c(p.value);
        return;
      default:
        for (let d of Object.values(p)) c(d);
    }
  };
  for (let p of e) i(p);
  return c(t), n;
}
var tT = class {
  global;
  constructor(e) {
    this.global = e ?? new Ar();
  }
  run(e) {
    return this.evaluate(e, this.global);
  }
  evaluateBinaryExpression(e, t) {
    let r = this.evaluate(e.left, t);
    switch (e.operator.value) {
      case "and":
        return r.__bool__().value ? this.evaluate(e.right, t) : r;
      case "or":
        return r.__bool__().value ? r : this.evaluate(e.right, t);
    }
    let n = this.evaluate(e.right, t);
    switch (e.operator.value) {
      case "==":
        return new re(r.value == n.value);
      case "!=":
        return new re(r.value != n.value);
    }
    if (r instanceof Oe || n instanceof Oe) {
      if (n instanceof Oe && ["in", "not in"].includes(e.operator.value)) return new re(e.operator.value === "not in");
      throw new Error(`Cannot perform operation ${e.operator.value} on undefined values`);
    } else {
      if (r instanceof $e || n instanceof $e) throw new Error("Cannot perform operation on null values");
      if (e.operator.value === "~") return new Y(r.value.toString() + n.value.toString());
      if (e.operator.value === "**" && bs(r) && bs(n)) {
        let a = vs(r), s = vs(n);
        if (a === 0 && s < 0) throw new Error("0.0 cannot be raised to a negative power");
        let i = a ** s;
        if (!Number.isFinite(i)) throw new Error("Exponentiation result is not a finite real number");
        return r instanceof Ee || n instanceof Ee || s < 0 ? new Ee(i) : new se(i);
      } else if ((r instanceof se || r instanceof Ee) && (n instanceof se || n instanceof Ee)) {
        let a = r.value, s = n.value;
        switch (e.operator.value) {
          case "+":
          case "-":
          case "*": {
            let i = e.operator.value === "+" ? a + s : e.operator.value === "-" ? a - s : a * s;
            return r instanceof Ee || n instanceof Ee ? new Ee(i) : new se(i);
          }
          case "/":
            return new Ee(a / s);
          case "//": {
            let i = Math.floor(a / s);
            return r instanceof Ee || n instanceof Ee ? new Ee(i) : new se(i);
          }
          case "%": {
            let i = a % s;
            return r instanceof Ee || n instanceof Ee ? new Ee(i) : new se(i);
          }
          case "<":
            return new re(a < s);
          case ">":
            return new re(a > s);
          case ">=":
            return new re(a >= s);
          case "<=":
            return new re(a <= s);
        }
      } else if (r instanceof fe && n instanceof fe) {
        if (e.operator.value === "+") return new fe(r.value.concat(n.value));
      } else if (n instanceof fe) {
        let a = n.value.find((s) => s.value === r.value) !== void 0;
        switch (e.operator.value) {
          case "in":
            return new re(a);
          case "not in":
            return new re(!a);
        }
      }
    }
    if ((r instanceof Y || n instanceof Y) && e.operator.value === "+") return new Y(r.value.toString() + n.value.toString());
    if (r instanceof Y && n instanceof Y) switch (e.operator.value) {
      case "in":
        return new re(n.value.includes(r.value));
      case "not in":
        return new re(!n.value.includes(r.value));
    }
    if (r instanceof Y && n instanceof ct) switch (e.operator.value) {
      case "in":
        return new re(n.value.has(r.value));
      case "not in":
        return new re(!n.value.has(r.value));
    }
    throw new SyntaxError(`Unknown operator "${e.operator.value}" between ${r.type} and ${n.type}`);
  }
  evaluateArguments(e, t) {
    let r = [], n = /* @__PURE__ */ new Map(), a = (s, i) => {
      if (n.has(s)) throw new Error(`Got multiple values for keyword argument '${s}'`);
      n.set(s, i);
    };
    for (let s of e) if (s.type === "SpreadExpression") {
      let i = s, o = this.evaluate(i.argument, t);
      if (!(o instanceof fe)) throw new Error(`Cannot unpack non-iterable type: ${o.type}`);
      for (let l of o.value) r.push(l);
    } else s.type !== "KeywordArgumentExpression" && s.type !== "KeywordSpreadExpression" && r.push(this.evaluate(s, t));
    for (let s of e) if (s.type === "KeywordArgumentExpression") {
      let i = s;
      a(i.key.value, this.evaluate(i.value, t));
    } else if (s.type === "KeywordSpreadExpression") {
      let i = s, o = this.evaluate(i.argument, t);
      if (!(o instanceof ct)) throw new Error(`Argument after ** must be a mapping, not ${o.type}`);
      for (let [l, c] of o.value) a(l, c);
    }
    return [r, n];
  }
  applyFilter(e, t, r) {
    if (t.type === "Identifier") {
      let n = t;
      if (n.value === "safe") return e;
      if (n.value === "tojson") return new Y(Fr(e, {}));
      if (e instanceof fe) switch (n.value) {
        case "list":
          return e;
        case "first":
          return e.value[0];
        case "last":
          return e.value[e.value.length - 1];
        case "length":
          return new se(e.value.length);
        case "reverse":
          return new fe(e.value.slice().reverse());
        case "sort":
          return new fe(e.value.slice().sort((a, s) => Bo(a, s, !1)));
        case "join":
          return new Y(e.value.map((a) => a.value).join(""));
        case "string":
          return new Y(Fr(e, {}, 0, !1));
        case "unique": {
          let a = /* @__PURE__ */ new Set(), s = [];
          for (let i of e.value) a.has(i.value) || (a.add(i.value), s.push(i));
          return new fe(s);
        }
        default:
          throw new Error(`Unknown ArrayValue filter: ${n.value}`);
      }
      else if (e instanceof Y) switch (n.value) {
        case "length":
        case "upper":
        case "lower":
        case "title":
        case "capitalize": {
          let a = e.builtins.get(n.value);
          if (a instanceof ze) return a.value([], r);
          if (a instanceof se) return a;
          throw new Error(`Unknown StringValue filter: ${n.value}`);
        }
        case "trim":
          return new Y(e.value.trim());
        case "indent":
          return new Y(e.value.split(`
`).map((a, s) => s === 0 || a.length === 0 ? a : "    " + a).join(`
`));
        case "join":
        case "string":
          return e;
        case "int": {
          let a = parseInt(e.value, 10);
          return new se(isNaN(a) ? 0 : a);
        }
        case "float": {
          let a = parseFloat(e.value);
          return new Ee(isNaN(a) ? 0 : a);
        }
        default:
          throw new Error(`Unknown StringValue filter: ${n.value}`);
      }
      else if (e instanceof se || e instanceof Ee) switch (n.value) {
        case "abs":
          return e instanceof se ? new se(Math.abs(e.value)) : new Ee(Math.abs(e.value));
        case "int":
          return new se(Math.floor(e.value));
        case "float":
          return new Ee(e.value);
        case "string":
          return new Y(e.toString());
        default:
          throw new Error(`Unknown NumericValue filter: ${n.value}`);
      }
      else if (e instanceof ct) switch (n.value) {
        case "items":
          return new fe(Array.from(e.value.entries()).map(([a, s]) => new fe([new Y(a), s])));
        case "length":
          return new se(e.value.size);
        default: {
          let a = e.builtins.get(n.value);
          if (a) return a instanceof ze ? a.value([], r) : a;
          throw new Error(`Unknown ObjectValue filter: ${n.value}`);
        }
      }
      else if (e instanceof re) switch (n.value) {
        case "bool":
          return new re(e.value);
        case "int":
          return new se(e.value ? 1 : 0);
        case "float":
          return new Ee(e.value ? 1 : 0);
        case "string":
          return new Y(e.value ? "true" : "false");
        default:
          throw new Error(`Unknown BooleanValue filter: ${n.value}`);
      }
      throw new Error(`Cannot apply filter "${n.value}" to type: ${e.type}`);
    } else if (t.type === "CallExpression") {
      let n = t;
      if (n.callee.type !== "Identifier") throw new Error(`Unknown filter: ${n.callee.type}`);
      let a = n.callee.value;
      if (a === "tojson") {
        let [, s] = this.evaluateArguments(n.args, r), i = s.get("indent") ?? new $e();
        if (!(i instanceof se || i instanceof $e)) throw new Error("If set, indent must be a number");
        let o = s.get("ensure_ascii") ?? new re(!1);
        if (!(o instanceof re)) throw new Error("If set, ensure_ascii must be a boolean");
        let l = s.get("sort_keys") ?? new re(!1);
        if (!(l instanceof re)) throw new Error("If set, sort_keys must be a boolean");
        let c = s.get("separators") ?? new $e(), p = null;
        if (c instanceof fe || c instanceof af) {
          if (c.value.length !== 2) throw new Error("separators must be a tuple of two strings");
          let [d, _] = c.value;
          if (!(d instanceof Y) || !(_ instanceof Y)) throw new Error("separators must be a tuple of two strings");
          p = [d.value, _.value];
        } else if (!(c instanceof $e)) throw new Error("If set, separators must be a tuple of two strings");
        return new Y(Fr(e, { indent: i.value, ensureAscii: o.value, sortKeys: l.value, separators: p }));
      } else if (a === "join") {
        let s;
        if (e instanceof Y) s = Array.from(e.value);
        else if (e instanceof fe) s = e.value.map((c) => c.value);
        else throw new Error(`Cannot apply filter "${a}" to type: ${e.type}`);
        let [i, o] = this.evaluateArguments(n.args, r), l = i.at(0) ?? o.get("separator") ?? new Y("");
        if (!(l instanceof Y)) throw new Error("separator must be a string");
        return new Y(s.join(l.value));
      } else if (a === "int" || a === "float") {
        let [s, i] = this.evaluateArguments(n.args, r), o = s.at(0) ?? i.get("default") ?? (a === "int" ? new se(0) : new Ee(0));
        if (e instanceof Y) {
          let l = a === "int" ? parseInt(e.value, 10) : parseFloat(e.value);
          return isNaN(l) ? o : a === "int" ? new se(l) : new Ee(l);
        } else {
          if (e instanceof se || e instanceof Ee) return e;
          if (e instanceof re) return a === "int" ? new se(e.value ? 1 : 0) : new Ee(e.value ? 1 : 0);
          throw new Error(`Cannot apply filter "${a}" to type: ${e.type}`);
        }
      } else if (a === "default") {
        let [s, i] = this.evaluateArguments(n.args, r), o = s[0] ?? new Y(""), l = s[1] ?? i.get("boolean") ?? new re(!1);
        if (!(l instanceof re)) throw new Error("`default` filter flag must be a boolean");
        return e instanceof Oe || l.value && !e.__bool__().value ? o : e;
      }
      if (e instanceof fe) {
        switch (a) {
          case "sort": {
            let [s, i] = this.evaluateArguments(n.args, r), o = s.at(0) ?? i.get("reverse") ?? new re(!1);
            if (!(o instanceof re)) throw new Error("reverse must be a boolean");
            let l = s.at(1) ?? i.get("case_sensitive") ?? new re(!1);
            if (!(l instanceof re)) throw new Error("case_sensitive must be a boolean");
            let c = s.at(2) ?? i.get("attribute") ?? new $e();
            if (!(c instanceof Y || c instanceof se || c instanceof $e)) throw new Error("attribute must be a string, integer, or null");
            let p = (d) => {
              if (c instanceof $e) return d;
              let _ = c instanceof se ? String(c.value) : c.value;
              return sf(d, _);
            };
            return new fe(e.value.slice().sort((d, _) => {
              let f = p(d), w = p(_), y = Bo(f, w, l.value);
              return o.value ? -y : y;
            }));
          }
          case "selectattr":
          case "rejectattr": {
            let s = a === "selectattr";
            if (e.value.some((d) => !us(d))) throw new Error(`\`${a}\` can only be applied to array of objects`);
            if (n.args.some((d) => d.type !== "StringLiteral")) throw new Error(`arguments of \`${a}\` must be strings`);
            let [i, o, l] = n.args.map((d) => this.evaluate(d, r)), c;
            if (o) {
              let d = r.tests.get(o.value);
              if (!d) throw new Error(`Unknown test: ${o.value}`);
              c = d;
            } else c = (...d) => d[0].__bool__().value;
            let p = e.value.filter((d) => {
              let _ = d.value.get(i.value), f = _ ? c(_, l) : !1;
              return s ? f : !f;
            });
            return new fe(p);
          }
          case "map": {
            let [, s] = this.evaluateArguments(n.args, r);
            if (s.has("attribute")) {
              let i = s.get("attribute");
              if (!(i instanceof Y)) throw new Error("attribute must be a string");
              let o = s.get("default"), l = e.value.map((c) => {
                if (!us(c)) throw new Error("items in map must be an object");
                let p = sf(c, i.value);
                return p instanceof Oe ? o ?? new Oe() : p;
              });
              return new fe(l);
            } else throw new Error("`map` expressions without `attribute` set are not currently supported.");
          }
        }
        throw new Error(`Unknown ArrayValue filter: ${a}`);
      } else if (e instanceof Y) {
        switch (a) {
          case "indent": {
            let [s, i] = this.evaluateArguments(n.args, r), o = s.at(0) ?? i.get("width") ?? new se(4);
            if (!(o instanceof se)) throw new Error("width must be a number");
            let l = s.at(1) ?? i.get("first") ?? new re(!1), c = s.at(2) ?? i.get("blank") ?? new re(!1), p = e.value.split(`
`), d = " ".repeat(o.value), _ = p.map((f, w) => !l.value && w === 0 || !c.value && f.length === 0 ? f : d + f);
            return new Y(_.join(`
`));
          }
          case "replace": {
            let s = e.builtins.get("replace");
            if (!(s instanceof ze)) throw new Error("replace filter not available");
            let [i, o] = this.evaluateArguments(n.args, r);
            return s.value([...i, new tn(o)], r);
          }
        }
        throw new Error(`Unknown StringValue filter: ${a}`);
      } else if (e instanceof ct) {
        let s = e.builtins.get(a);
        if (s && s instanceof ze) {
          let [i, o] = this.evaluateArguments(n.args, r);
          return o.size > 0 && i.push(new tn(o)), s.value(i, r);
        }
        throw new Error(`Unknown ObjectValue filter: ${a}`);
      } else throw new Error(`Cannot apply filter "${a}" to type: ${e.type}`);
    }
    throw new Error(`Unknown filter: ${t.type}`);
  }
  evaluateFilterExpression(e, t) {
    let r = this.evaluate(e.operand, t);
    return this.applyFilter(r, e.filter, t);
  }
  evaluateTestExpression(e, t) {
    let r = this.evaluate(e.operand, t), n = t.tests.get(e.test.value);
    if (!n) throw new Error(`Unknown test: ${e.test.value}`);
    let a = n(r);
    return new re(e.negate ? !a : a);
  }
  evaluateSelectExpression(e, t) {
    return this.evaluate(e.test, t).__bool__().value ? this.evaluate(e.lhs, t) : new Oe();
  }
  evaluateUnaryExpression(e, t) {
    let r = this.evaluate(e.argument, t);
    switch (e.operator.value) {
      case "not":
        return new re(!r.value);
      case "+":
      case "-": {
        let n = e.operator.value === "-" ? -1 : 1;
        if (r instanceof se || r instanceof Ee || r instanceof re) {
          let a = r instanceof re ? r.value ? 1 : 0 : r.value, s = n * a;
          return r instanceof Ee ? new Ee(s) : new se(s);
        }
        throw new SyntaxError(`Unknown operator "${e.operator.value}" for ${r.type}`);
      }
      default:
        throw new SyntaxError(`Unknown operator: ${e.operator.value}`);
    }
  }
  evaluateTernaryExpression(e, t) {
    return this.evaluate(e.condition, t).__bool__().value ? this.evaluate(e.trueExpr, t) : this.evaluate(e.falseExpr, t);
  }
  evalProgram(e, t) {
    return this.evaluateBlock(e.body, t);
  }
  evaluateBlock(e, t) {
    let r = "";
    for (let n of e) {
      let a = this.evaluate(n, t);
      a.type !== "NullValue" && a.type !== "UndefinedValue" && (r += a.toString());
    }
    return new Y(r);
  }
  evaluateIdentifier(e, t) {
    return t.lookupVariable(e.value);
  }
  evaluateCallExpression(e, t) {
    let [r, n] = this.evaluateArguments(e.args, t);
    n.size > 0 && r.push(new tn(n));
    let a = this.evaluate(e.callee, t);
    if (a.type !== "FunctionValue") throw new Error(`Cannot call something that is not a function: got ${a.type}`);
    return a.value(r, t);
  }
  evaluateSliceExpression(e, t, r) {
    if (!(e instanceof fe || e instanceof Y)) throw new Error("Slice object must be an array or string");
    let n = this.evaluate(t.start, r), a = this.evaluate(t.stop, r), s = this.evaluate(t.step, r);
    if (!(n instanceof se || n instanceof Oe)) throw new Error("Slice start must be numeric or undefined");
    if (!(a instanceof se || a instanceof Oe)) throw new Error("Slice stop must be numeric or undefined");
    if (!(s instanceof se || s instanceof Oe)) throw new Error("Slice step must be numeric or undefined");
    return e instanceof fe ? new fe(ef(e.value, n.value, a.value, s.value)) : new Y(ef(Array.from(e.value), n.value, a.value, s.value).join(""));
  }
  evaluateMemberExpression(e, t) {
    let r = this.evaluate(e.object, t), n;
    if (e.computed) {
      if (e.property.type === "SliceExpression") return this.evaluateSliceExpression(r, e.property, t);
      n = this.evaluate(e.property, t);
    } else e.property.type === "IntegerLiteral" ? n = new se(e.property.value) : n = new Y(e.property.value);
    let a;
    if (us(r)) {
      if (!(n instanceof Y)) throw new Error(`Cannot access property with non-string: got ${n.type}`);
      a = r.value.get(n.value) ?? (r instanceof ct ? r.builtins.get(n.value) : void 0);
    } else if (r instanceof fe || r instanceof Y) if (n instanceof se) a = r.value.at(n.value), r instanceof Y && (a = new Y(r.value.at(n.value)));
    else if (n instanceof Y) a = r.builtins.get(n.value);
    else throw new Error(`Cannot access property with non-string/non-number: got ${n.type}`);
    else {
      if (!(n instanceof Y)) throw new Error(`Cannot access property with non-string: got ${n.type}`);
      a = r.builtins.get(n.value);
    }
    return a instanceof qt ? a : new Oe();
  }
  evaluateSet(e, t) {
    let r = e.value ? this.evaluate(e.value, t) : this.evaluateBlock(e.body, t);
    if (e.assignee.type === "Identifier") {
      let n = e.assignee.value;
      t.setVariable(n, r);
    } else if (e.assignee.type === "TupleLiteral") {
      let n = e.assignee;
      if (!(r instanceof fe)) throw new Error(`Cannot unpack non-iterable type in set: ${r.type}`);
      let a = r.value;
      if (a.length !== n.value.length) throw new Error(`Too ${n.value.length > a.length ? "few" : "many"} items to unpack in set`);
      for (let s = 0; s < n.value.length; ++s) {
        let i = n.value[s];
        if (i.type !== "Identifier") throw new Error(`Cannot unpack to non-identifier in set: ${i.type}`);
        t.setVariable(i.value, a[s]);
      }
    } else if (e.assignee.type === "MemberExpression") {
      let n = e.assignee, a = this.evaluate(n.object, t);
      if (!(a instanceof sl)) throw new Error("cannot assign attribute on non-namespace object");
      if (n.property.type !== "Identifier") throw new Error("Cannot assign to member with non-identifier property");
      a.value.set(n.property.value, r);
    } else throw new Error(`Invalid LHS inside assignment expression: ${JSON.stringify(e.assignee)}`);
    return new $e();
  }
  evaluateIf(e, t) {
    let r = this.evaluate(e.test, t);
    return this.evaluateBlock(r.__bool__().value ? e.body : e.alternate, t);
  }
  evaluateFor(e, t) {
    let r = new Ar(t), n, a;
    if (e.iterable.type === "SelectExpression") {
      let c = e.iterable;
      a = this.evaluate(c.lhs, r), n = c.test;
    } else a = this.evaluate(e.iterable, r);
    if (!(a instanceof fe || a instanceof ct)) throw new Error(`Expected iterable or object type in for loop: got ${a.type}`);
    a instanceof ct && (a = a.keys());
    let s = [], i = [];
    for (let c = 0; c < a.value.length; ++c) {
      let p = new Ar(r), d = a.value[c], _;
      if (e.loopvar.type === "Identifier") _ = (f) => f.setVariable(e.loopvar.value, d);
      else if (e.loopvar.type === "TupleLiteral") {
        let f = e.loopvar;
        if (d.type !== "ArrayValue") throw new Error(`Cannot unpack non-iterable type: ${d.type}`);
        let w = d;
        if (f.value.length !== w.value.length) throw new Error(`Too ${f.value.length > w.value.length ? "few" : "many"} items to unpack`);
        _ = (y) => {
          for (let b = 0; b < f.value.length; ++b) {
            if (f.value[b].type !== "Identifier") throw new Error(`Cannot unpack non-identifier type: ${f.value[b].type}`);
            y.setVariable(f.value[b].value, w.value[b]);
          }
        };
      } else throw new Error(`Invalid loop variable(s): ${e.loopvar.type}`);
      n && (_(p), !this.evaluate(n, p).__bool__().value) || (s.push(d), i.push(_));
    }
    let o = "", l = !0;
    for (let c = 0; c < s.length; ++c) {
      let p = /* @__PURE__ */ new Map([["index", new se(c + 1)], ["index0", new se(c)], ["revindex", new se(s.length - c)], ["revindex0", new se(s.length - c - 1)], ["first", new re(c === 0)], ["last", new re(c === s.length - 1)], ["length", new se(s.length)], ["previtem", c > 0 ? s[c - 1] : new Oe()], ["nextitem", c < s.length - 1 ? s[c + 1] : new Oe()]]);
      r.setVariable("loop", new ct(p)), i[c](r);
      try {
        let d = this.evaluateBlock(e.body, r);
        o += d.value;
      } catch (d) {
        if (d instanceof rf) continue;
        if (d instanceof tf) break;
        throw d;
      }
      l = !1;
    }
    if (l) {
      let c = this.evaluateBlock(e.defaultBlock, r);
      o += c.value;
    }
    return new Y(o);
  }
  bindMacroArguments(e, t, r, n, a) {
    let s = n.slice(), i = /* @__PURE__ */ new Map();
    s.at(-1) instanceof tn && (i = new Map(s.pop().value));
    let o = [];
    for (let l = 0; l < t.length; ++l) {
      let { name: c, defaultValue: p } = $o(t[l]), d = s[l];
      d === void 0 && i.has(c) && (d = i.get(c), i.delete(c)), d === void 0 && p !== void 0 && o.push([c, p]), a.setVariable(c, d ?? new Oe());
    }
    if (r.has("kwargs")) a.setVariable("kwargs", new ct(i));
    else if (i.size > 0) throw new Error(`macro ${e} takes no keyword argument '${i.keys().next().value}'`);
    if (r.has("varargs")) a.setVariable("varargs", new fe(s.slice(t.length)));
    else if (s.length > t.length) throw new Error(`macro ${e} takes not more than ${t.length} argument(s)`);
    for (let [l, c] of o) a.setVariable(l, this.evaluate(c, a));
  }
  evaluateMacro(e, t) {
    let r = lf(e.args, e.body);
    return t.setVariable(e.name.value, new ze((n, a) => {
      let s = new Ar(a);
      return this.bindMacroArguments(`'${e.name.value}'`, e.args, r, n, s), this.evaluateBlock(e.body, s);
    })), new $e();
  }
  evaluateCallStatement(e, t) {
    let r = e.callerArgs ?? [], n = lf(r, e.body), a = new ze((c) => {
      let p = new Ar(t);
      return this.bindMacroArguments("None", r, n, c, p), this.evaluateBlock(e.body, p);
    }), [s, i] = this.evaluateArguments(e.call.args, t);
    s.push(new tn(i));
    let o = this.evaluate(e.call.callee, t);
    if (o.type !== "FunctionValue") throw new Error(`Cannot call something that is not a function: got ${o.type}`);
    let l = new Ar(t);
    return l.setVariable("caller", a), o.value(s, l);
  }
  evaluateFilterStatement(e, t) {
    let r = this.evaluateBlock(e.body, t);
    return this.applyFilter(r, e.filter, t);
  }
  evaluate(e, t) {
    if (!e) return new Oe();
    switch (e.type) {
      case "Program":
        return this.evalProgram(e, t);
      case "Set":
        return this.evaluateSet(e, t);
      case "If":
        return this.evaluateIf(e, t);
      case "For":
        return this.evaluateFor(e, t);
      case "Macro":
        return this.evaluateMacro(e, t);
      case "CallStatement":
        return this.evaluateCallStatement(e, t);
      case "Break":
        throw new tf();
      case "Continue":
        throw new rf();
      case "IntegerLiteral":
        return new se(e.value);
      case "FloatLiteral":
        return new Ee(e.value);
      case "StringLiteral":
        return new Y(e.value);
      case "ArrayLiteral":
        return new fe(e.value.map((r) => this.evaluate(r, t)));
      case "TupleLiteral":
        return new af(e.value.map((r) => this.evaluate(r, t)));
      case "ObjectLiteral": {
        let r = /* @__PURE__ */ new Map();
        for (let [n, a] of e.value) {
          let s = this.evaluate(n, t);
          if (!(s instanceof Y)) throw new Error(`Object keys must be strings: got ${s.type}`);
          r.set(s.value, this.evaluate(a, t));
        }
        return new ct(r);
      }
      case "Identifier":
        return this.evaluateIdentifier(e, t);
      case "CallExpression":
        return this.evaluateCallExpression(e, t);
      case "MemberExpression":
        return this.evaluateMemberExpression(e, t);
      case "UnaryExpression":
        return this.evaluateUnaryExpression(e, t);
      case "BinaryExpression":
        return this.evaluateBinaryExpression(e, t);
      case "FilterExpression":
        return this.evaluateFilterExpression(e, t);
      case "FilterStatement":
        return this.evaluateFilterStatement(e, t);
      case "TestExpression":
        return this.evaluateTestExpression(e, t);
      case "SelectExpression":
        return this.evaluateSelectExpression(e, t);
      case "Ternary":
        return this.evaluateTernaryExpression(e, t);
      case "Comment":
        return new $e();
      default:
        throw new SyntaxError(`Unknown node type: ${e.type}`);
    }
  }
};
function ds(e) {
  switch (typeof e) {
    case "number":
      return Number.isInteger(e) ? new se(e) : new Ee(e);
    case "string":
      return new Y(e);
    case "boolean":
      return new re(e);
    case "undefined":
      return new Oe();
    case "object":
      return e === null ? new $e() : Array.isArray(e) ? new fe(e.map(ds)) : new ct(new Map(Object.entries(e).map(([t, r]) => [t, ds(r)])));
    case "function":
      return new ze((t, r) => {
        let n = e(...t.map((a) => a.value)) ?? null;
        return ds(n);
      });
    default:
      throw new Error(`Cannot convert to runtime value: ${e}`);
  }
}
var Ze = `
`, rT = "{%- ", nT = " -%}", Re = Object.freeze({ CONDITIONAL: 0, LOGICAL_OR: 1, LOGICAL_AND: 2, LOGICAL_NOT: 3, COMPARISON: 4, ADDITIVE: 5, MULTIPLICATIVE: 6, EXPONENTIATION: 7, TEST: 8, FILTER: 9, UNARY_SIGN: 10, ATOM: 11 });
function hm(e) {
  switch (e.operator.type) {
    case "ExponentiationBinaryOperator":
      return Re.EXPONENTIATION;
    case "MultiplicativeBinaryOperator":
      return Re.MULTIPLICATIVE;
    case "AdditiveBinaryOperator":
      return Re.ADDITIVE;
    case "ComparisonBinaryOperator":
      return Re.COMPARISON;
    case "Identifier":
      return e.operator.value === "and" ? Re.LOGICAL_AND : e.operator.value === "in" || e.operator.value === "not in" ? Re.COMPARISON : Re.LOGICAL_OR;
  }
  return Re.LOGICAL_OR;
}
function _m(e) {
  switch (e.type) {
    case "SelectExpression":
    case "Ternary":
      return Re.CONDITIONAL;
    case "BinaryExpression":
      return hm(e);
    case "UnaryExpression":
      return e.operator.value === "not" ? Re.LOGICAL_NOT : Re.UNARY_SIGN;
    case "TestExpression":
      return Re.TEST;
    case "FilterExpression":
      return Re.FILTER;
    default:
      return Re.ATOM;
  }
}
function zt(e, t) {
  let r = De(e);
  return _m(e) < t ? `(${r})` : r;
}
function aT(e, t = "	") {
  let r = typeof t == "number" ? " ".repeat(t) : t;
  return Rt(e.body, 0, r).replace(/\n$/, "");
}
function at(...e) {
  return rT + e.join(" ") + nT;
}
function Rt(e, t, r) {
  return e.map((n) => sT(n, t, r)).join(Ze);
}
function xs(e) {
  return e.map((t) => De(t)).join(", ");
}
function sT(e, t, r) {
  let n = r.repeat(t);
  switch (e.type) {
    case "Program":
      return Rt(e.body, t, r);
    case "If":
      return iT(e, t, r);
    case "For":
      return oT(e, t, r);
    case "Set":
      return lT(e, t, r);
    case "Macro":
      return cT(e, t, r);
    case "Break":
      return n + at("break");
    case "Continue":
      return n + at("continue");
    case "CallStatement":
      return uT(e, t, r);
    case "FilterStatement":
      return dT(e, t, r);
    case "Comment":
      return n + "{# " + e.value + " #}";
    default:
      return n + "{{- " + De(e) + " -}}";
  }
}
function iT(e, t, r) {
  let n = r.repeat(t), a = [], s = e;
  for (; s && (a.push({ test: s.test, body: s.body }), s.alternate.length === 1 && s.alternate[0].type === "If"); ) s = s.alternate[0];
  let i = n + at("if", De(a[0].test)) + Ze + Rt(a[0].body, t + 1, r);
  for (let o = 1; o < a.length; ++o) i += Ze + n + at("elif", De(a[o].test)) + Ze + Rt(a[o].body, t + 1, r);
  return s && s.alternate.length > 0 && (i += Ze + n + at("else") + Ze + Rt(s.alternate, t + 1, r)), i += Ze + n + at("endif"), i;
}
function oT(e, t, r) {
  let n = r.repeat(t), a = "";
  if (e.iterable.type === "SelectExpression") {
    let i = e.iterable;
    a = `${De(i.lhs)} if ${De(i.test)}`;
  } else a = De(e.iterable);
  let s = n + at("for", De(e.loopvar), "in", a) + Ze + Rt(e.body, t + 1, r);
  return e.defaultBlock.length > 0 && (s += Ze + n + at("else") + Ze + Rt(e.defaultBlock, t + 1, r)), s += Ze + n + at("endfor"), s;
}
function lT(e, t, r) {
  let n = r.repeat(t), a = De(e.assignee), s = e.value ? De(e.value) : "", i = n + at("set", `${a}${e.value ? " = " + s : ""}`);
  return e.body.length === 0 ? i : i + Ze + Rt(e.body, t + 1, r) + Ze + n + at("endset");
}
function cT(e, t, r) {
  let n = r.repeat(t), a = xs(e.args);
  return n + at("macro", `${e.name.value}(${a})`) + Ze + Rt(e.body, t + 1, r) + Ze + n + at("endmacro");
}
function uT(e, t, r) {
  let n = r.repeat(t), a = e.callerArgs && e.callerArgs.length > 0 ? `(${xs(e.callerArgs)})` : "", s = De(e.call), i = n + at(`call${a}`, s) + Ze;
  return i += Rt(e.body, t + 1, r) + Ze, i += n + at("endcall"), i;
}
function dT(e, t, r) {
  let n = r.repeat(t), a = e.filter.type === "Identifier" ? e.filter.value : De(e.filter), s = n + at("filter", a) + Ze;
  return s += Rt(e.body, t + 1, r) + Ze, s += n + at("endfilter"), s;
}
function De(e) {
  switch (e.type) {
    case "SpreadExpression":
      return `*${De(e.argument)}`;
    case "KeywordSpreadExpression":
      return `**${De(e.argument)}`;
    case "Identifier":
      return e.value;
    case "IntegerLiteral":
      return `${e.value}`;
    case "FloatLiteral": {
      let t = e.value;
      return Object.is(t, -0) ? "-0.0" : t % 1 === 0 ? t.toFixed(1) : t.toString();
    }
    case "StringLiteral":
      return JSON.stringify(e.value);
    case "BinaryExpression": {
      let t = e, r = hm(t), n = zt(t.left, r), a = zt(t.right, r + 1);
      return `${n} ${t.operator.value} ${a}`;
    }
    case "UnaryExpression": {
      let t = e, r = t.argument.type === "UnaryExpression" ? _m(t) : Re.ATOM;
      return t.operator.value + (t.operator.value === "not" ? " " : "") + zt(t.argument, r);
    }
    case "CallExpression": {
      let t = e, r = xs(t.args);
      return `${De(t.callee)}(${r})`;
    }
    case "MemberExpression": {
      let t = e, r = zt(t.object, Re.ATOM), n = De(t.property);
      return !t.computed && t.property.type !== "Identifier" && t.property.type !== "IntegerLiteral" && (n = `(${n})`), t.computed ? `${r}[${n}]` : `${r}.${n}`;
    }
    case "FilterExpression": {
      let t = e, r = zt(t.operand, Re.FILTER);
      return t.filter.type === "CallExpression" ? `${r} | ${De(t.filter)}` : `${r} | ${t.filter.value}`;
    }
    case "SelectExpression": {
      let t = e;
      return `${zt(t.lhs, Re.LOGICAL_OR)} if ${zt(t.test, Re.LOGICAL_OR)}`;
    }
    case "TestExpression": {
      let t = e;
      return `${zt(t.operand, Re.TEST)} is${t.negate ? " not" : ""} ${t.test.value}`;
    }
    case "ArrayLiteral":
    case "TupleLiteral": {
      let t = xs(e.value), r = e.type === "ArrayLiteral" ? "[]" : "()";
      return `${r[0]}${t}${r[1]}`;
    }
    case "ObjectLiteral":
      return `{${Array.from(e.value.entries()).map(([t, r]) => `${De(t)}: ${De(r)}`).join(", ")}}`;
    case "SliceExpression": {
      let t = e, r = t.start ? De(t.start) : "", n = t.stop ? De(t.stop) : "", a = t.step ? `:${De(t.step)}` : "";
      return `${r}:${n}${a}`;
    }
    case "KeywordArgumentExpression": {
      let t = e;
      return `${t.key.value}=${De(t.value)}`;
    }
    case "Ternary": {
      let t = e;
      return `${zt(t.trueExpr, Re.LOGICAL_OR)} if ${zt(t.condition, Re.LOGICAL_OR)} else ${zt(t.falseExpr, Re.CONDITIONAL)}`;
    }
    default:
      throw new Error(`Unknown expression type: ${e.type}`);
  }
}
var pT = class {
  parsed;
  constructor(e) {
    let t = vk(e, { lstrip_blocks: !0, trim_blocks: !0 });
    this.parsed = qk(t);
  }
  render(e) {
    let t = new Ar();
    if (eT(t), e) for (let [r, n] of Object.entries(e)) t.set(r, n);
    return new tT(t).run(this.parsed).value;
  }
  format(e) {
    return aT(this.parsed, e?.indent || "	");
  }
}, hT = { txt: "text/plain", html: "text/html", css: "text/css", js: "text/javascript", json: "application/json", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif" }, Ms = class fm {
  constructor(t) {
    if (this.filePath = t, this.headers = new Headers(), this.exists = Mt.existsSync(t), this.exists) {
      this.status = 200, this.statusText = "OK";
      let r = Mt.statSync(t);
      this.headers.set("content-length", r.size.toString()), this.updateContentType();
      let n = Mt.createReadStream(t);
      this.body = new ReadableStream({ start(a) {
        n.on("data", (s) => a.enqueue(s)), n.on("end", () => a.close()), n.on("error", (s) => a.error(s));
      }, cancel() {
        n.destroy();
      } });
    } else this.status = 404, this.statusText = "Not Found", this.body = null;
  }
  updateContentType() {
    let t = this.filePath.toString().split(".").pop().toLowerCase();
    this.headers.set("content-type", hT[t] ?? "application/octet-stream");
  }
  clone() {
    let t = new fm(this.filePath);
    return t.exists = this.exists, t.status = this.status, t.statusText = this.statusText, t.headers = new Headers(this.headers), t;
  }
  async arrayBuffer() {
    return (await Mt.promises.readFile(this.filePath)).buffer;
  }
  async blob() {
    let t = await Mt.promises.readFile(this.filePath);
    return new Blob([t], { type: this.headers.get("content-type") });
  }
  async text() {
    return await Mt.promises.readFile(this.filePath, "utf8");
  }
  async json() {
    return JSON.parse(await this.text());
  }
}, Is = class {
  constructor(e) {
    this._mt = new Uint32Array(624), this._idx = 625, this._gauss_next = null, this._random_fn = this.random.bind(this), this.seed(e);
  }
  seed(e) {
    if (e == null) if (pe.IS_CRYPTO_AVAILABLE) {
      let i = new Uint32Array(1);
      crypto.getRandomValues(i), e = i[0];
    } else e = Date.now() >>> 0;
    let t = this._mt, r = (i, o) => Math.imul(i, o) >>> 0, n = [];
    for (let i = e || 0; i > 0; i = Math.floor(i / 4294967296)) n.push(i & 4294967295);
    n.length || n.push(0), t[0] = 19650218;
    for (let i = 1; i < 624; ++i) t[i] = r(1812433253, t[i - 1] ^ t[i - 1] >>> 30) + i >>> 0;
    let a = 1, s = 0;
    for (let i = Math.max(624, n.length); i > 0; --i, ++a, ++s) a >= 624 && (t[0] = t[623], a = 1), s >= n.length && (s = 0), t[a] = (t[a] ^ r(t[a - 1] ^ t[a - 1] >>> 30, 1664525)) + n[s] + s >>> 0;
    for (let i = 623; i > 0; --i, ++a) a >= 624 && (t[0] = t[623], a = 1), t[a] = (t[a] ^ r(t[a - 1] ^ t[a - 1] >>> 30, 1566083941)) - a >>> 0;
    t[0] = 2147483648, this._idx = 624, this._gauss_next = null;
  }
  _int32() {
    let e = this._mt;
    if (this._idx >= 624) {
      for (let r = 0; r < 624; ++r) {
        let n = e[r] & 2147483648 | e[(r + 1) % 624] & 2147483647;
        e[r] = (e[(r + 397) % 624] ^ n >>> 1 ^ (n & 1 ? 2567483615 : 0)) >>> 0;
      }
      this._idx = 0;
    }
    let t = e[this._idx++];
    return t ^= t >>> 11, t ^= t << 7 & 2636928640, t ^= t << 15 & 4022730752, t ^= t >>> 18, t >>> 0;
  }
  random() {
    return ((this._int32() >>> 5) * 67108864 + (this._int32() >>> 6)) / 9007199254740992;
  }
  gauss(e = 0, t = 1) {
    let r = this._gauss_next;
    if (this._gauss_next = null, r === null) {
      let n = this.random() * 2 * Math.PI, a = Math.sqrt(-2 * Math.log(1 - this.random()));
      r = Math.cos(n) * a, this._gauss_next = Math.sin(n) * a;
    }
    return e + r * t;
  }
  shuffle(e) {
    for (let t = e.length - 1; t > 0; --t) {
      let r = 32 - Math.clz32(t + 1), n = this._int32() >>> 32 - r;
      for (; n > t; ) n = this._int32() >>> 32 - r;
      let a = e[t];
      e[t] = e[n], e[n] = a;
    }
  }
  choices(e, t) {
    return e[mm(this._random_fn, t)];
  }
};
function mm(e, t) {
  let r = 0;
  for (let a = 0; a < t.length; ++a) r += t[a];
  let n = e() * r;
  for (let a = 0; a < t.length; ++a) if (n -= t[a], n < 0) return a;
  return t.length - 1;
}
var Jt = new Is(), Ls = Object.freeze({ Random: Is, seed: Jt.seed.bind(Jt), random: Jt.random.bind(Jt), gauss: Jt.gauss.bind(Jt), shuffle: Jt.shuffle.bind(Jt), choices: Jt.choices.bind(Jt) }), _T = (e) => mm(Ls.random, e), fT = new Is(), gm = class {
  constructor(e) {
    this.path = e;
  }
  async match(e) {
    let t = Kt.join(this.path, e), r = new Ms(t);
    if (r.exists) return r;
  }
  async put(e, t, r = void 0) {
    let n = Kt.join(this.path, e), a = pe.IS_PROCESS_AVAILABLE ? process.pid : Date.now(), s = fT._int32().toString(36), i = n + `.tmp.${a}.${s}`;
    try {
      let o = t.headers.get("Content-Length"), l = parseInt(o ?? "0"), c = 0;
      await Mt.promises.mkdir(Kt.dirname(n), { recursive: !0 });
      let p = Mt.createWriteStream(i), d = t.body.getReader();
      for (; ; ) {
        let { done: _, value: f } = await d.read();
        if (_) break;
        await new Promise((y, b) => {
          p.write(f, (x) => {
            if (x) {
              b(x);
              return;
            }
            y();
          });
        }), c += f.length;
        let w = l ? c / l * 100 : 0;
        r?.({ progress: w, loaded: c, total: l });
      }
      await new Promise((_, f) => {
        p.close((w) => w ? f(w) : _());
      }), await Mt.promises.rename(i, n);
    } catch (o) {
      try {
        await Mt.promises.unlink(i);
      } catch {
      }
      throw o;
    }
  }
  async delete(e) {
    let t = Kt.join(this.path, e);
    try {
      return await Mt.promises.unlink(t), !0;
    } catch {
      return !1;
    }
  }
}, mT = { 400: "Bad request error occurred while trying to load file", 401: "Unauthorized access to file", 403: "Forbidden access to file", 404: "Could not locate file", 408: "Request timeout error occurred while trying to load file", 500: "Internal server error error occurred while trying to load file", 502: "Bad gateway error occurred while trying to load file", 503: "Service unavailable error occurred while trying to load file", 504: "Gateway timeout error occurred while trying to load file" }, cf = 100, gT = /^(\b[\w\-.]+\b\/)?\b[\w\-.]{1,96}\b$/;
function ns(...e) {
  return e = e.map((t, r) => (r && (t = t.replace(new RegExp("^/"), "")), r !== e.length - 1 && (t = t.replace(new RegExp("/$"), "")), t)), e.join("/");
}
function nn(e, t = null, r = null) {
  let n;
  try {
    n = new URL(e);
  } catch {
    return !1;
  }
  return !(t && !t.includes(n.protocol) || r && !r.includes(n.hostname));
}
function wT(e) {
  return !(!gT.test(e) || e.includes("..") || e.includes("--") || e.endsWith(".git") || e.endsWith(".ipynb"));
}
function il(e, t = {}, ...r) {
  return JSON.stringify([e, t.revision ?? "main", t.cache_dir ?? null, t.local_files_only ?? !1, ...r]);
}
var Do = class extends Error {
  constructor(e, { status: t = null } = {}) {
    super(e), this.name = "ModelFileNotFoundError", this.status = t;
  }
}, yT = /* @__PURE__ */ new Set([401, 403, 404]);
function wm(e, t, r) {
  if (!r) return null;
  let n = `${mT[e] ?? `Error (${e}) occurred while trying to load file`}: "${t}".`;
  throw yT.has(e) ? new Do(n, { status: e }) : Error(n);
}
async function bT(e, t, r) {
  let n = e.headers.get("Content-Length"), a = n ? parseInt(n, 10) : r ?? 0;
  n === null && !r && ce.warn("Unable to determine content-length from response headers. Will expand buffer when needed.");
  let s = new Uint8Array(a), i = 0, o = e.body.getReader();
  async function l() {
    let { done: c, value: p } = await o.read();
    if (c) return;
    let d = i + p.length;
    if (d > a) {
      a = d;
      let f = new Uint8Array(a);
      f.set(s), s = f;
    }
    s.set(p, i), i = d;
    let _ = i / a * 100;
    return t({ progress: _, loaded: i, total: a }), l();
  }
  return await l(), s;
}
function uf(e) {
  return nn(e, ["blob:"]);
}
function Ro(e, { allowUnresolved: t = !1 } = {}) {
  let r;
  if (typeof location < "u" && location.href) r = location.href;
  else if (typeof import.meta < "u" && import.meta.url) r = import.meta.url;
  else return e;
  try {
    return new URL(e, r).href;
  } catch (n) {
    if (!t) throw n;
    return e;
  }
}
var ym = "SHA-256", vT = "experimental_transformers-hash-cache", df = (e) => ({ algorithm: ym, value: e }), pf = class {
  #t = null;
  _getHashCache = () => (this.#t ??= caches.open(vT), this.#t);
  static isAvailable = () => typeof navigator < "u" && "crossOriginStorage" in navigator;
  match = async (e) => {
    let t = await this._getFileHash(e);
    if (t) try {
      let r = await (await navigator.crossOriginStorage.requestFileHandle(df(t))).getFile();
      return new Response(r, { headers: { "Content-Length": String(r.size) } });
    } catch {
      return;
    }
  };
  put = async (e, t) => {
    let r = await this._getFileHash(e);
    if (r) {
      let n = await t.blob();
      await this._storeBlobInCOS(n, r);
    } else this._processAndStore(e, t.body);
  };
  _storeBlobInCOS = async (e, t) => {
    let r = await (await navigator.crossOriginStorage.requestFileHandle(df(t), { create: !0, origins: "*" })).createWritable();
    await r.write(e), await r.close();
  };
  _processAndStore = async (e, t) => {
    try {
      let r = [];
      for await (let s of t) r.push(s);
      let n = new Blob(r), a = await this._getBlobHash(n);
      await this._storeBlobInCOS(n, a);
      try {
        await (await this._getHashCache()).put(e, new Response(a));
      } catch {
      }
    } catch {
    }
  };
  delete = async (e) => {
    try {
      return await (await this._getHashCache()).delete(e);
    } catch {
      return !1;
    }
  };
  _getFileHash = async (e) => {
    try {
      let t = await this._getHashCache(), r = await t.match(e);
      if (r) return r.text();
      let n = await this._getLfsFileHash(e);
      return n ? (await t.put(e, new Response(n)), n) : null;
    } catch {
      return null;
    }
  };
  _getLfsFileHash = async (e) => {
    if (!e.includes("/resolve/")) return null;
    let t = e.replace("/resolve/", "/raw/");
    try {
      let r = (await fetch(t).then((n) => n.text())).match(/^oid sha256:([0-9a-f]+)$/m);
      return r ? r[1] : null;
    } catch {
      return null;
    }
  };
  _getBlobHash = async (e) => {
    let t = await e.arrayBuffer(), r = await crypto.subtle.digest(ym, t);
    return Array.from(new Uint8Array(r)).map((n) => n.toString(16).padStart(2, "0")).join("");
  };
};
async function Fn(e = null) {
  let t = null;
  if (we.useCustomCache) {
    if (!we.customCache) throw Error("`env.useCustomCache=true`, but `env.customCache` is not defined.");
    if (!we.customCache.match || !we.customCache.put) throw new Error("`env.customCache` must be an object which implements the `match` and `put` functions of the Web Cache API. For more information, see https://developer.mozilla.org/en-US/docs/Web/API/Cache");
    t = we.customCache;
  }
  if (!t && we.experimental_useCrossOriginStorage && pf.isAvailable() && (t = new pf()), !t && we.useBrowserCache) {
    if (typeof caches > "u") throw Error("Browser cache is not available in this environment.");
    try {
      t = await caches.open(we.cacheKey);
    } catch (r) {
      ce.warn("An error occurred while opening the browser cache:", r);
    }
  }
  if (!t && we.useFSCache) {
    if (!pe.IS_FS_AVAILABLE) throw Error("File System Cache is not available in this environment.");
    t = new gm(e ?? we.cacheDir);
  }
  return t;
}
async function xT(e, ...t) {
  for (let r of t) try {
    let n = await e.match(r);
    if (n) return n;
  } catch {
    continue;
  }
}
var MT = class {
  #t;
  #e;
  constructor(e) {
    this.#t = e, this.#e = /* @__PURE__ */ new Map();
  }
  get(e) {
    if (!this.#e.has(e)) return;
    let t = this.#e.get(e);
    return this.#e.delete(e), this.#e.set(e, t), t;
  }
  put(e, t) {
    this.#e.has(e) && this.#e.delete(e), this.#e.set(e, t), this.#e.size > this.#t && this.#e.delete(this.#e.keys().next().value);
  }
  delete(e) {
    return this.#e.delete(e);
  }
  clear() {
    this.#e.clear();
  }
}, kT = 100, Eo = new MT(kT);
function bm(e, t) {
  let r = Eo.get(e);
  if (r !== void 0) return r;
  let n = t().then((a) => a, (a) => (Eo.delete(e), Promise.reject(a)));
  return Eo.put(e, n), n;
}
async function TT(e) {
  if (!nn(e, ["http:", "https:"])) return null;
  let t = vm(e);
  return t.set("Range", "bytes=0-0"), we.fetch(e, { method: "GET", headers: t, cache: "no-store" });
}
function an(e, t, r = {}) {
  let n = il(e, r, t);
  return bm(n, () => ET(e, t, r));
}
async function ET(e, t, r) {
  let n = await Fn(r?.cache_dir), { localPath: a, remoteURL: s, proposedCacheKey: i, validModelId: o } = wa(e, t, r, n), l = await ya(n, a, i);
  if (l !== void 0 && typeof l != "string") {
    let c = l.headers.get("content-length"), p = l.headers.get("content-type");
    return { exists: !0, size: c ? parseInt(c, 10) : void 0, contentType: p || void 0, fromCache: !0 };
  }
  if (we.allowLocalModels && !nn(a, ["http:", "https:"])) try {
    let c = await ua(a);
    if (typeof c != "string" && c.status !== 404) {
      let p = c.headers.get("content-length"), d = c.headers.get("content-type");
      return { exists: !0, size: p ? parseInt(p, 10) : void 0, contentType: d || void 0, fromCache: !1 };
    }
  } catch {
  }
  if (we.allowRemoteModels && !r.local_files_only && o) {
    let c = await TT(s);
    if (c && c.status >= 200 && c.status < 300) {
      let p, d = c.headers.get("content-type");
      if (c.status === 206) {
        let _ = c.headers.get("content-range");
        if (_) {
          let f = _.match(/bytes \d+-\d+\/(\d+)/);
          f && (p = parseInt(f[1], 10));
        }
      } else if (c.status === 200) try {
        await c.body?.cancel();
      } catch {
      }
      if (p === void 0) {
        let _ = c.headers.get("content-length");
        p = _ ? parseInt(_, 10) : void 0;
      }
      return { exists: !0, size: p, contentType: d || void 0, fromCache: !1 };
    }
    c && c.status !== 404 && c.status !== 416 && wm(c.status, s, !0);
  }
  return { exists: !1, fromCache: !1 };
}
async function ua(e) {
  return we.useFS && !nn(e, ["http:", "https:", "blob:"]) ? new Ms(e instanceof URL ? e.protocol === "file:" ? e.pathname : e.toString() : e) : we.fetch(e, { headers: vm(e) });
}
function vm(e) {
  let t = typeof process < "u" && process?.release?.name === "node", r = new Headers();
  if (t) {
    let n = !!process.env?.TESTING_REMOTELY, a = we.version;
    if (r.set("User-Agent", `transformers.js/${a}; is_ci/${n};`), nn(e, ["http:", "https:"], ["huggingface.co", "hf.co"])) {
      let s = process.env?.HF_TOKEN ?? process.env?.HF_ACCESS_TOKEN;
      s && r.set("Authorization", `Bearer ${s}`);
    }
  }
  return r;
}
function wa(e, t, r = {}, n = null) {
  let a = r.revision ?? "main", s = ns(e, t), i = wT(e), o = i ? ns(we.localModelPath, s) : s, l = ns(we.remoteHost, we.remotePathTemplate.replaceAll("{model}", e).replaceAll("{revision}", encodeURIComponent(a)), t), c = n instanceof gm ? a === "main" ? s : ns(e, a, t) : l;
  return { requestURL: s, localPath: o, remoteURL: l, proposedCacheKey: c, validModelId: i };
}
async function ya(e, t, r) {
  if (e) return await xT(e, t, r);
}
async function AT(e, t, r, n, a, s, i = {}) {
  if (await r.match(n) === void 0 && !(typeof Cache < "u" && r instanceof Cache && !nn(Ro(n, { allowUnresolved: !0 }), ["http:", "https:"]))) if (s) {
    if (typeof a != "string") {
      let o = new Headers(a.headers);
      o.set("content-length", s.byteLength.toString()), await r.put(n, new Response(s, { headers: o })).catch((l) => {
        ce.warn(`Unable to add response to browser cache: ${l}.`);
      });
    }
  } else {
    let o = i.progress_callback ? (l) => Sr(i.progress_callback, { status: "progress", name: e, file: t, ...l }) : void 0;
    await r.put(n, a, o);
  }
}
async function CT(e, t, r = !0, n = {}, a = !1, s = null) {
  let { requestURL: i, localPath: o, remoteURL: l, proposedCacheKey: c, validModelId: p } = wa(e, t, n, s), d, _ = !1, f;
  f = await ya(s, o, c);
  let w = f !== void 0;
  if (w) d = c;
  else {
    if (we.allowLocalModels) if (nn(i, ["http:", "https:"])) {
      if (n.local_files_only) throw new Error(`\`local_files_only=true\`, but attempted to load a remote file from: ${i}.`);
      if (!we.allowRemoteModels) throw new Error(`\`env.allowRemoteModels=false\`, but attempted to load a remote file from: ${i}.`);
    } else try {
      f = await ua(o), d = o;
    } catch (x) {
      ce.warn(`Unable to load from local path "${o}": "${x}"`);
    }
    if (f === void 0 || typeof f != "string" && f.status === 404) {
      if (n.local_files_only || !we.allowRemoteModels) {
        if (r) throw new Do(`\`local_files_only=true\` or \`env.allowRemoteModels=false\` and file was not found locally at "${o}".`);
        return null;
      }
      if (!p) throw new Do(`Local file missing at "${o}" and download aborted due to invalid model ID "${e}".`);
      if (f = await ua(l), f.status !== 200) return wm(f.status, l, r);
      d = c;
    }
    _ = s && typeof Response < "u" && f instanceof Response && f.status === 200;
  }
  Sr(n.progress_callback, { status: "download", name: e, file: t });
  let y;
  if (!(pe.IS_NODE_ENV && a)) {
    let x;
    if (typeof f != "string") if (!n.progress_callback) x = new Uint8Array(await f.arrayBuffer());
    else if (w && typeof navigator < "u" && /firefox/i.test(navigator.userAgent)) x = new Uint8Array(await f.arrayBuffer()), Sr(n.progress_callback, { status: "progress", name: e, file: t, progress: 100, loaded: x.length, total: x.length });
    else {
      let T, A = f.headers.get("content-length");
      if (A) T = parseInt(A, 10);
      else try {
        let E = await an(e, t, n);
        E.size && (T = E.size);
      } catch {
      }
      x = await bT(f, (E) => {
        Sr(n.progress_callback, { status: "progress", name: e, file: t, ...E });
      }, T);
    }
    y = x;
  }
  if (_ && d && typeof f != "string" && await AT(e, t, s, d, f, y, n), pe.IS_NODE_ENV && a && n.progress_callback && typeof f != "string") {
    let x = parseInt(f.headers.get("content-length"), 10) || 0;
    Sr(n.progress_callback, { status: "progress", name: e, file: t, progress: 100, loaded: x, total: x });
  }
  if (Sr(n.progress_callback, { status: "done", name: e, file: t }), y) {
    if (!pe.IS_NODE_ENV && a) throw new Error("Cannot return path in a browser environment.");
    return y;
  }
  if (f instanceof Ms) return f.filePath;
  let b = await s?.match(d);
  if (b instanceof Ms) return b.filePath;
  if (b instanceof Response) return new Uint8Array(await b.arrayBuffer());
  if (typeof b == "string") return b;
  throw new Error("Unable to get model file path or buffer.");
}
var Ao = /* @__PURE__ */ new Map();
async function ks(e, t, r = !0, n = {}, a = !1) {
  if (!we.allowLocalModels) {
    if (n.local_files_only) throw Error("Invalid configuration detected: local models are disabled (`env.allowLocalModels=false`) but you have requested to only use local models (`local_files_only=true`).");
    if (!we.allowRemoteModels) throw Error("Invalid configuration detected: both local and remote models are disabled. Fix by setting `env.allowLocalModels` or `env.allowRemoteModels` to `true`.");
  }
  let s = il(e, n, t, r, a), { progress_callback: i } = n, o = i instanceof fs ? i.loads : Ao, l = o.get(s);
  return l || (Sr(i, { status: "initiate", name: e, file: t }), l = Fn(n.cache_dir).then((c) => CT(e, t, r, n, a, c)), o === Ao && (l = l.finally(() => Ao.delete(s))), o.set(s, l)), await l;
}
async function ol(e, t, r = !0, n = {}) {
  let a = await ks(e, t, r, n, !1);
  return a === null ? null : new TextDecoder("utf-8").decode(a);
}
async function nr(e, t, r = !0, n = {}) {
  let a = await ol(e, t, r, n);
  return a === null ? {} : JSON.parse(a);
}
function ST(e, [t, r, n], [a, s], i = "bilinear", o = !1) {
  let l = s / n, c = a / r, p = new e.constructor(a * s * t), d = r * n, _ = a * s;
  for (let f = 0; f < a; ++f) for (let w = 0; w < s; ++w) {
    let y = f * s + w, b = (w + 0.5) / l - 0.5, x = (f + 0.5) / c - 0.5, T = Math.floor(b), A = Math.floor(x), E = Math.min(T + 1, n - 1), S = Math.min(A + 1, r - 1);
    T = Math.max(T, 0), A = Math.max(A, 0);
    let O = b - T, M = x - A, G = (1 - O) * (1 - M), D = O * (1 - M), U = (1 - O) * M, q = O * M, H = A * n, Q = S * n, $ = H + T, C = H + E, ae = Q + T, ge = Q + E;
    for (let J = 0; J < t; ++J) {
      let oe = J * d;
      p[J * _ + y] = G * e[oe + $] + D * e[oe + C] + U * e[oe + ae] + q * e[oe + ge];
    }
  }
  return p;
}
function PT(e, t, r) {
  let n = new Array(r.length), a = new Array(r.length);
  for (let o = r.length - 1, l = 1; o >= 0; --o) a[o] = l, n[o] = t[r[o]], l *= n[o];
  let s = r.map((o, l) => a[r.indexOf(l)]), i = new e.constructor(e.length);
  for (let o = 0; o < e.length; ++o) {
    let l = 0;
    for (let c = t.length - 1, p = o; c >= 0; --c) l += p % t[c] * s[c], p = Math.floor(p / t[c]);
    i[l] = e[o];
  }
  return [i, n];
}
function st(e) {
  let t = We(e)[0], r = e.map((a) => Math.exp(a - t)), n = r.reduce((a, s) => a + s, 0);
  return r.map((a) => a / n);
}
function FT(e) {
  let t = We(e)[0], r = 0;
  for (let a = 0; a < e.length; ++a) r += Math.exp(e[a] - t);
  let n = Math.log(r);
  return e.map((a) => a - t - n);
}
function IT(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; ++n) r += e[n] * t[n];
  return r;
}
function s$(e, t) {
  let r = IT(e, t), n = hf(e), a = hf(t);
  return r / (n * a);
}
function hf(e) {
  return Math.sqrt(e.reduce((t, r) => t + r * r, 0));
}
function Go(e) {
  if (e.length === 0) throw Error("Array must not be empty");
  let t = e[0], r = 0;
  for (let n = 1; n < e.length; ++n) e[n] < t && (t = e[n], r = n);
  return [t, r];
}
function We(e) {
  if (e.length === 0) throw Error("Array must not be empty");
  let t = e[0], r = 0;
  for (let n = 1; n < e.length; ++n) e[n] > t && (t = e[n], r = n);
  return [t, r];
}
function xm(e) {
  return e > 0 && (e & e - 1) === 0;
}
var Mm = class {
  constructor(e) {
    if (this.size = e | 0, this.size <= 1 || !xm(this.size)) throw new Error("FFT size must be a power of two larger than 1");
    this._csize = e << 1, this.table = new Float64Array(this.size * 2);
    for (let r = 0; r < this.table.length; r += 2) {
      let n = Math.PI * r / this.size;
      this.table[r] = Math.cos(n), this.table[r + 1] = -Math.sin(n);
    }
    let t = 0;
    for (let r = 1; this.size > r; r <<= 1) ++t;
    this._width = t % 2 === 0 ? t - 1 : t, this._bitrev = new Int32Array(1 << this._width);
    for (let r = 0; r < this._bitrev.length; ++r) {
      this._bitrev[r] = 0;
      for (let n = 0; n < this._width; n += 2) {
        let a = this._width - n - 2;
        this._bitrev[r] |= (r >>> n & 3) << a;
      }
    }
  }
  createComplexArray() {
    return new Float64Array(this._csize);
  }
  fromComplexArray(e, t) {
    let r = t || new Array(e.length >>> 1);
    for (let n = 0; n < e.length; n += 2) r[n >>> 1] = e[n];
    return r;
  }
  toComplexArray(e, t) {
    let r = t || this.createComplexArray();
    for (let n = 0; n < r.length; n += 2) r[n] = e[n >>> 1], r[n + 1] = 0;
    return r;
  }
  transform(e, t) {
    if (e === t) throw new Error("Input and output buffers must be different");
    this._transform4(e, t, 1);
  }
  realTransform(e, t) {
    if (e === t) throw new Error("Input and output buffers must be different");
    this._realTransform4(e, t, 1);
  }
  inverseTransform(e, t) {
    if (e === t) throw new Error("Input and output buffers must be different");
    this._transform4(e, t, -1);
    for (let r = 0; r < e.length; ++r) e[r] /= this.size;
  }
  _transform4(e, t, r) {
    let n = this._csize, a = 1 << this._width, s = n / a << 1, i, o, l = this._bitrev;
    if (s === 4) for (i = 0, o = 0; i < n; i += s, ++o) {
      let p = l[o];
      this._singleTransform2(t, e, i, p, a);
    }
    else for (i = 0, o = 0; i < n; i += s, ++o) {
      let p = l[o];
      this._singleTransform4(t, e, i, p, a, r);
    }
    let c = this.table;
    for (a >>= 2; a >= 2; a >>= 2) {
      s = n / a << 1;
      let p = s >>> 2;
      for (i = 0; i < n; i += s) {
        let d = i + p - 1;
        for (let _ = i, f = 0; _ < d; _ += 2, f += a) {
          let w = _, y = w + p, b = y + p, x = b + p, T = e[w], A = e[w + 1], E = e[y], S = e[y + 1], O = e[b], M = e[b + 1], G = e[x], D = e[x + 1], U = c[f], q = r * c[f + 1], H = E * U - S * q, Q = E * q + S * U, $ = c[2 * f], C = r * c[2 * f + 1], ae = O * $ - M * C, ge = O * C + M * $, J = c[3 * f], oe = r * c[3 * f + 1], L = G * J - D * oe, N = G * oe + D * J, R = T + ae, K = A + ge, le = T - ae, je = A - ge, Me = H + L, be = Q + N, Ve = r * (H - L), Le = r * (Q - N);
          e[w] = R + Me, e[w + 1] = K + be, e[y] = le + Le, e[y + 1] = je - Ve, e[b] = R - Me, e[b + 1] = K - be, e[x] = le - Le, e[x + 1] = je + Ve;
        }
      }
    }
  }
  _singleTransform2(e, t, r, n, a) {
    let s = e[n], i = e[n + 1], o = e[n + a], l = e[n + a + 1];
    t[r] = s + o, t[r + 1] = i + l, t[r + 2] = s - o, t[r + 3] = i - l;
  }
  _singleTransform4(e, t, r, n, a, s) {
    let i = a * 2, o = a * 3, l = e[n], c = e[n + 1], p = e[n + a], d = e[n + a + 1], _ = e[n + i], f = e[n + i + 1], w = e[n + o], y = e[n + o + 1], b = l + _, x = c + f, T = l - _, A = c - f, E = p + w, S = d + y, O = s * (p - w), M = s * (d - y);
    t[r] = b + E, t[r + 1] = x + S, t[r + 2] = T + M, t[r + 3] = A - O, t[r + 4] = b - E, t[r + 5] = x - S, t[r + 6] = T - M, t[r + 7] = A + O;
  }
  _realTransform4(e, t, r) {
    let n = this._csize, a = 1 << this._width, s = n / a << 1, i, o, l = this._bitrev;
    if (s === 4) for (i = 0, o = 0; i < n; i += s, ++o) {
      let d = l[o];
      this._singleRealTransform2(t, e, i, d >>> 1, a >>> 1);
    }
    else for (i = 0, o = 0; i < n; i += s, ++o) {
      let d = l[o];
      this._singleRealTransform4(t, e, i, d >>> 1, a >>> 1, r);
    }
    let c = this.table;
    for (a >>= 2; a >= 2; a >>= 2) {
      s = n / a << 1;
      let d = s >>> 1, _ = d >>> 1, f = _ >>> 1;
      for (i = 0; i < n; i += s) for (let w = 0, y = 0; w <= f; w += 2, y += a) {
        let b = i + w, x = b + _, T = x + _, A = T + _, E = e[b], S = e[b + 1], O = e[x], M = e[x + 1], G = e[T], D = e[T + 1], U = e[A], q = e[A + 1], H = E, Q = S, $ = c[y], C = r * c[y + 1], ae = O * $ - M * C, ge = O * C + M * $, J = c[2 * y], oe = r * c[2 * y + 1], L = G * J - D * oe, N = G * oe + D * J, R = c[3 * y], K = r * c[3 * y + 1], le = U * R - q * K, je = U * K + q * R, Me = H + L, be = Q + N, Ve = H - L, Le = Q - N, ke = ae + le, Ye = ge + je, sr = r * (ae - le), ve = r * (ge - je);
        if (e[b] = Me + ke, e[b + 1] = be + Ye, e[x] = Ve + ve, e[x + 1] = Le - sr, w === 0) {
          e[T] = Me - ke, e[T + 1] = be - Ye;
          continue;
        }
        if (w === f) continue;
        let Fe = i + _ - w, on = i + d - w;
        e[Fe] = Ve - r * ve, e[Fe + 1] = -Le - r * sr, e[on] = Me - r * ke, e[on + 1] = -be + r * Ye;
      }
    }
    let p = n >>> 1;
    for (let d = 2; d < p; d += 2) e[n - d] = e[d], e[n - d + 1] = -e[d + 1];
  }
  _singleRealTransform2(e, t, r, n, a) {
    let s = e[n], i = e[n + a];
    t[r] = s + i, t[r + 1] = 0, t[r + 2] = s - i, t[r + 3] = 0;
  }
  _singleRealTransform4(e, t, r, n, a, s) {
    let i = a * 2, o = a * 3, l = e[n], c = e[n + a], p = e[n + i], d = e[n + o], _ = l + p, f = l - p, w = c + d, y = s * (c - d);
    t[r] = _ + w, t[r + 1] = 0, t[r + 2] = f, t[r + 3] = -y, t[r + 4] = _ - w, t[r + 5] = 0, t[r + 6] = f, t[r + 7] = y;
  }
}, LT = class {
  constructor(e) {
    let t = 2 * (e - 1), r = 2 * (2 * e - 1), n = 2 ** Math.ceil(Math.log2(r));
    this.bufferSize = n, this._a = t;
    let a = new Float64Array(r), s = new Float64Array(n);
    this._chirpBuffer = new Float64Array(n), this._buffer1 = new Float64Array(n), this._buffer2 = new Float64Array(n), this._outBuffer1 = new Float64Array(n), this._outBuffer2 = new Float64Array(n);
    let i = -2 * Math.PI / e, o = Math.cos(i), l = Math.sin(i);
    for (let c = 0; c < r >> 1; ++c) {
      let p = (c + 1 - e) ** 2 / 2, d = Math.sqrt(o ** 2 + l ** 2) ** p, _ = p * Math.atan2(l, o), f = 2 * c;
      a[f] = d * Math.cos(_), a[f + 1] = d * Math.sin(_), s[f] = a[f], s[f + 1] = -a[f + 1];
    }
    this._slicedChirpBuffer = a.subarray(t, r), this._f = new Mm(n >> 1), this._f.transform(this._chirpBuffer, s);
  }
  _transform(e, t, r) {
    let n = this._buffer1, a = this._buffer2, s = this._outBuffer1, i = this._outBuffer2, o = this._chirpBuffer, l = this._slicedChirpBuffer, c = this._a;
    if (r) for (let p = 0; p < l.length; p += 2) {
      let d = p + 1, _ = p >> 1, f = t[_];
      n[p] = f * l[p], n[d] = f * l[d];
    }
    else for (let p = 0; p < l.length; p += 2) {
      let d = p + 1;
      n[p] = t[p] * l[p] - t[d] * l[d], n[d] = t[p] * l[d] + t[d] * l[p];
    }
    this._f.transform(s, n);
    for (let p = 0; p < o.length; p += 2) {
      let d = p + 1;
      a[p] = s[p] * o[p] - s[d] * o[d], a[d] = s[p] * o[d] + s[d] * o[p];
    }
    this._f.inverseTransform(i, a);
    for (let p = 0; p < i.length; p += 2) {
      let d = i[p + c], _ = i[p + c + 1], f = l[p], w = l[p + 1];
      e[p] = d * f - _ * w, e[p + 1] = d * w + _ * f;
    }
  }
  transform(e, t) {
    this._transform(e, t, !1);
  }
  realTransform(e, t) {
    this._transform(e, t, !0);
  }
}, OT = class {
  constructor(e) {
    this.fft_length = e, this.isPowerOfTwo = xm(e), this.isPowerOfTwo ? (this.fft = new Mm(e), this.outputBufferSize = 2 * e) : (this.fft = new LT(e), this.outputBufferSize = this.fft.bufferSize);
  }
  realTransform(e, t) {
    this.fft.realTransform(e, t);
  }
  transform(e, t) {
    this.fft.transform(e, t);
  }
};
function zT(e, t) {
  if (t % 2 === 0 || t <= 0) throw new Error("Window size must be a positive odd number");
  let r = new e.constructor(e.length), n = new e.constructor(t), a = Math.floor(t / 2);
  for (let s = 0; s < e.length; ++s) {
    let i = 0;
    for (let o = -a; o <= a; ++o) {
      let l = s + o;
      l < 0 ? l = Math.abs(l) : l >= e.length && (l = 2 * (e.length - 1) - l), n[i++] = e[l];
    }
    n.sort(), r[s] = n[a];
  }
  return r;
}
function ia(e, t) {
  let r = Math.pow(10, t);
  return Math.round(e * r) / r;
}
function NT(e) {
  let t = Math.round(e);
  return Math.abs(e) % 1 === 0.5 ? t % 2 === 0 ? t : t - 1 : t;
}
function BT(e) {
  let t = e.length, r = e[0].length, n = [t + 1, r + 1], a = Array.from({ length: n[0] }, () => Array(n[1]).fill(1 / 0));
  a[0][0] = 0;
  let s = Array.from({ length: n[0] }, () => Array(n[1]).fill(-1));
  for (let p = 1; p < n[1]; ++p) for (let d = 1; d < n[0]; ++d) {
    let _ = a[d - 1][p - 1], f = a[d - 1][p], w = a[d][p - 1], y, b;
    _ < f && _ < w ? (y = _, b = 0) : f < _ && f < w ? (y = f, b = 1) : (y = w, b = 2), a[d][p] = e[d - 1][p - 1] + y, s[d][p] = b;
  }
  for (let p = 0; p < n[1]; ++p) s[0][p] = 2;
  for (let p = 0; p < n[0]; ++p) s[p][0] = 1;
  let i = t, o = r, l = [], c = [];
  for (; i > 0 || o > 0; ) switch (l.push(i - 1), c.push(o - 1), s[i][o]) {
    case 0:
      --i, --o;
      break;
    case 1:
      --i;
      break;
    case 2:
      --o;
      break;
    default:
      throw new Error(`Internal error in dynamic time warping. Unexpected trace[${i}, ${o}]. Please file a bug report.`);
  }
  return l.reverse(), c.reverse(), [l, c];
}
var $T = /* @__PURE__ */ (function() {
  let e = null;
  return function(t) {
    if (!e) {
      e = new Float32Array(65536);
      let s = new ArrayBuffer(4), i = new Uint32Array(s), o = new Float32Array(s);
      for (let l = 0; l < e.length; ++l) {
        let c = 0, p = (l & 32768) << 16, d = (l & 31744) >> 10, _ = l & 1023;
        if (d === 31) c = p | 2139095040 | _ << 13;
        else if (d === 0) if (_ === 0) c = p;
        else {
          let f = 113;
          for (; (_ & 1024) === 0; ) _ <<= 1, --f;
          _ &= -1025, c = p | f << 23 | _ << 13;
        }
        else c = p | d + 112 << 23 | _ << 13;
        i[0] = c, e[l] = o[0];
      }
    }
    let r = t.length, n = e, a = new Float32Array(r);
    for (let s = 0; s < r; ++s) a[s] = n[t[s]];
    return a;
  };
})(), DT = {};
async function km(e) {
  let t = e.split("/").pop(), r;
  try {
    if (r = await Fn(), r) {
      let a = await r.match(e);
      if (a) return a;
    }
  } catch (a) {
    ce.warn(`Failed to load ${t} from cache:`, a);
  }
  let n = await we.fetch(e);
  if (!n.ok) throw new Error(`Failed to fetch ${t}: ${n.status} ${n.statusText}`);
  if (r) try {
    await r.put(e, n.clone());
  } catch (a) {
    ce.warn(`Failed to cache ${t}:`, a);
  }
  return n;
}
async function RT(e) {
  let t = await km(e);
  if (!t || typeof t == "string") return null;
  try {
    return await t.arrayBuffer();
  } catch (r) {
    return ce.warn("Failed to read WASM binary:", r), null;
  }
}
async function GT(e) {
  if (pe.IS_SERVICE_WORKER_ENV || pe.IS_CHROME_AVAILABLE) return e;
  let t = await km(e);
  if (!t || typeof t == "string") return null;
  try {
    let r = await t.text();
    r = r.replaceAll("globalThis.process?.versions?.node", "false");
    let n = new Blob([r], { type: "text/javascript" });
    return URL.createObjectURL(n);
  } catch (r) {
    return ce.warn("Failed to read WASM factory:", r), null;
  }
}
var VT = Object.freeze({ auto: null, gpu: null, cpu: "cpu", wasm: "wasm", webgpu: "webgpu", cuda: "cuda", dml: "dml", coreml: "coreml", webnn: { name: "webnn", deviceType: "cpu" }, "webnn-npu": { name: "webnn", deviceType: "npu" }, "webnn-gpu": { name: "webnn", deviceType: "gpu" }, "webnn-cpu": { name: "webnn", deviceType: "cpu" } });
function Tm(e) {
  return e <= Bt.DEBUG ? 0 : e <= Bt.INFO ? 2 : e <= Bt.WARNING || e <= Bt.ERROR ? 3 : 4;
}
var UT = { 0: "verbose", 1: "info", 2: "warning", 3: "error", 4: "fatal" }, St = [], Vo, En, _f = /* @__PURE__ */ Symbol.for("onnxruntime");
if (_f in globalThis) En = globalThis[_f];
else if (pe.IS_NODE_ENV) {
  switch (En = DT, process.platform) {
    case "win32":
      St.push("dml");
      break;
    case "linux":
      process.arch === "x64" && St.push("cuda");
      break;
    case "darwin":
      St.push("coreml");
      break;
  }
  St.push("webgpu"), St.push("cpu"), Vo = ["cpu"];
} else En = bo, pe.IS_WEBNN_AVAILABLE && St.push("webnn-npu", "webnn-gpu", "webnn-cpu", "webnn"), pe.IS_WEBGPU_AVAILABLE && St.push("webgpu"), St.push("wasm"), Vo = ["wasm"];
var qT = En.InferenceSession;
function jT(e = null) {
  if (!e) return Vo;
  switch (e) {
    case "auto":
      return St;
    case "gpu":
      return St.filter((t) => ["webgpu", "cuda", "dml", "webnn-gpu"].includes(t));
  }
  if (St.includes(e)) return [VT[e] ?? e];
  throw new Error(`Unsupported device: "${e}". Should be one of: ${St.join(", ")}.`);
}
var ff = Promise.resolve(), wn = null;
async function WT() {
  if (wn) return wn;
  if (!(we.useWasmCache && typeof Je?.wasm?.wasmPaths == "object" && Je?.wasm?.wasmPaths?.wasm && Je?.wasm?.wasmPaths?.mjs)) {
    if (pe.IS_DENO_WEB_RUNTIME) throw new Error("env.useWasmCache=false is not supported in Deno's web runtime. Remove the useWasmCache override.");
    return wn = Promise.resolve(), wn;
  }
  return wn = (async () => {
    let e = Je.wasm.wasmPaths, t = !1;
    await Promise.all([e.wasm && !uf(e.wasm) ? (async () => {
      try {
        let r = await RT(Ro(e.wasm));
        r && (Je.wasm.wasmBinary = r, t = !0);
      } catch (r) {
        ce.warn("Failed to pre-load WASM binary:", r);
      }
    })() : Promise.resolve(), e.mjs && !uf(e.mjs) ? (async () => {
      try {
        let r = await GT(Ro(e.mjs));
        r && (Je.wasm.wasmPaths.mjs = r);
      } catch (r) {
        ce.warn("Failed to pre-load WASM factory:", r);
      }
    })() : Promise.resolve()]), t || (Je.wasm.wasmPaths.mjs = e.mjs);
  })(), wn;
}
async function Em(e, t, r) {
  await WT();
  let n = Tm(we.logLevel ?? Bt.WARNING), a = () => qT.create(e, { logSeverityLevel: n, ...t }), s = await (pe.IS_WEB_ENV ? ff = ff.then(a) : a());
  return s.config = r, s;
}
var mf = Promise.resolve();
async function Am(e, t) {
  let r = () => e.run(t);
  return pe.IS_WEB_ENV ? mf = mf.then(r) : r();
}
function Cm(e) {
  return e instanceof En.Tensor;
}
var Je = En?.env;
function ll() {
  return Je?.wasm?.proxy;
}
if (Je) {
  let e = function(t) {
    let r = Tm(t);
    Je.logLevel = UT[r];
  };
  if (Je.wasm) {
    if (!(typeof ServiceWorkerGlobalScope < "u" && self instanceof ServiceWorkerGlobalScope) && Je.versions?.web && !Je.wasm.wasmPaths) {
      let t = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${Je.versions.web}/dist/`, r = ".asyncify";
      pe.IS_SAFARI_BELOW_26 && !pe.IS_WEBGPU_AVAILABLE && (r = ""), Je.wasm.wasmPaths = { mjs: `${t}ort-wasm-simd-threaded${r}.mjs`, wasm: `${t}ort-wasm-simd-threaded${r}.wasm` };
    }
    Je.wasm.proxy = !1;
  }
  Je.webgpu && (Je.webgpu.powerPreference = "high-performance"), e(we.logLevel ?? Bt.WARNING), we.backends.onnx = { ...Je, setLogLevel: e };
}
var Er = async (e, t, r) => {
  let n = await Em(new Uint8Array(e), t);
  return (async (a) => {
    let s = ll(), i = Object.fromEntries(Object.entries(a).map(([l, c]) => [l, (s ? c.clone() : c).ort_tensor])), o = await Am(n, i);
    return Array.isArray(r) ? r.map((l) => new V(o[l])) : new V(o[r]);
  });
}, rn = class {
  static session_options = {};
  static get nearest_interpolate_4d() {
    return this._nearest_interpolate_4d || (this._nearest_interpolate_4d = Er([8, 10, 18, 0, 58, 129, 1, 10, 41, 10, 1, 120, 10, 0, 10, 0, 10, 1, 115, 18, 1, 121, 34, 6, 82, 101, 115, 105, 122, 101, 42, 18, 10, 4, 109, 111, 100, 101, 34, 7, 110, 101, 97, 114, 101, 115, 116, 160, 1, 3, 18, 1, 114, 90, 31, 10, 1, 120, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 90, 15, 10, 1, 115, 18, 10, 10, 8, 8, 7, 18, 4, 10, 2, 8, 4, 98, 31, 10, 1, 121, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 66, 2, 16, 21], this.session_options, "y")), this._nearest_interpolate_4d;
  }
  static get bilinear_interpolate_4d() {
    return this._bilinear_interpolate_4d || (this._bilinear_interpolate_4d = Er([8, 9, 18, 0, 58, 128, 1, 10, 40, 10, 1, 120, 10, 0, 10, 0, 10, 1, 115, 18, 1, 121, 34, 6, 82, 101, 115, 105, 122, 101, 42, 17, 10, 4, 109, 111, 100, 101, 34, 6, 108, 105, 110, 101, 97, 114, 160, 1, 3, 18, 1, 114, 90, 31, 10, 1, 120, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 90, 15, 10, 1, 115, 18, 10, 10, 8, 8, 7, 18, 4, 10, 2, 8, 4, 98, 31, 10, 1, 121, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 66, 2, 16, 20], this.session_options, "y")), this._bilinear_interpolate_4d;
  }
  static get bicubic_interpolate_4d() {
    return this._bicubic_interpolate_4d || (this._bicubic_interpolate_4d = Er([8, 9, 18, 0, 58, 127, 10, 39, 10, 1, 120, 10, 0, 10, 0, 10, 1, 115, 18, 1, 121, 34, 6, 82, 101, 115, 105, 122, 101, 42, 16, 10, 4, 109, 111, 100, 101, 34, 5, 99, 117, 98, 105, 99, 160, 1, 3, 18, 1, 114, 90, 31, 10, 1, 120, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 90, 15, 10, 1, 115, 18, 10, 10, 8, 8, 7, 18, 4, 10, 2, 8, 4, 98, 31, 10, 1, 121, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1, 99, 10, 3, 18, 1, 104, 10, 3, 18, 1, 119, 66, 2, 16, 20], this.session_options, "y")), this._bicubic_interpolate_4d;
  }
  static get matmul() {
    return this._matmul || (this._matmul = Er([8, 9, 18, 0, 58, 55, 10, 17, 10, 1, 97, 10, 1, 98, 18, 1, 99, 34, 6, 77, 97, 116, 77, 117, 108, 18, 1, 114, 90, 9, 10, 1, 97, 18, 4, 10, 2, 8, 1, 90, 9, 10, 1, 98, 18, 4, 10, 2, 8, 1, 98, 9, 10, 1, 99, 18, 4, 10, 2, 8, 1, 66, 2, 16, 20], this.session_options, "c")), this._matmul;
  }
  static get stft() {
    return this._stft || (this._stft = Er([8, 7, 18, 0, 58, 148, 1, 10, 38, 10, 1, 115, 10, 1, 106, 10, 1, 119, 10, 1, 108, 18, 1, 111, 34, 4, 83, 84, 70, 84, 42, 15, 10, 8, 111, 110, 101, 115, 105, 100, 101, 100, 24, 1, 160, 1, 2, 18, 1, 115, 90, 26, 10, 1, 115, 18, 21, 10, 19, 8, 1, 18, 15, 10, 3, 18, 1, 98, 10, 3, 18, 1, 115, 10, 3, 18, 1, 99, 90, 11, 10, 1, 106, 18, 6, 10, 4, 8, 7, 18, 0, 90, 16, 10, 1, 119, 18, 11, 10, 9, 8, 1, 18, 5, 10, 3, 18, 1, 119, 90, 11, 10, 1, 108, 18, 6, 10, 4, 8, 7, 18, 0, 98, 31, 10, 1, 111, 18, 26, 10, 24, 8, 1, 18, 20, 10, 3, 18, 1, 98, 10, 3, 18, 1, 102, 10, 3, 18, 1, 100, 10, 3, 18, 1, 99, 66, 2, 16, 17], this.session_options, "o")), this._stft;
  }
  static get rfft() {
    return this._rfft || (this._rfft = Er([8, 9, 58, 93, 10, 33, 10, 1, 120, 10, 0, 10, 1, 97, 18, 1, 121, 34, 3, 68, 70, 84, 42, 15, 10, 8, 111, 110, 101, 115, 105, 100, 101, 100, 24, 1, 160, 1, 2, 18, 1, 100, 90, 19, 10, 1, 120, 18, 14, 10, 12, 8, 1, 18, 8, 10, 0, 10, 0, 10, 2, 8, 1, 90, 11, 10, 1, 97, 18, 6, 10, 4, 8, 7, 18, 0, 98, 19, 10, 1, 121, 18, 14, 10, 12, 8, 1, 18, 8, 10, 0, 10, 0, 10, 2, 8, 2, 66, 2, 16, 20], this.session_options, "y")), this._rfft;
  }
  static get top_k() {
    return this._top_k || (this._top_k = Er([8, 10, 18, 0, 58, 73, 10, 18, 10, 1, 120, 10, 1, 107, 18, 1, 118, 18, 1, 105, 34, 4, 84, 111, 112, 75, 18, 1, 116, 90, 9, 10, 1, 120, 18, 4, 10, 2, 8, 1, 90, 15, 10, 1, 107, 18, 10, 10, 8, 8, 7, 18, 4, 10, 2, 8, 1, 98, 9, 10, 1, 118, 18, 4, 10, 2, 8, 1, 98, 9, 10, 1, 105, 18, 4, 10, 2, 8, 7, 66, 2, 16, 21], this.session_options, ["v", "i"])), this._top_k;
  }
  static get slice() {
    return this._slice || (this._slice = Er([8, 7, 18, 0, 58, 96, 10, 25, 10, 1, 120, 10, 1, 115, 10, 1, 101, 10, 1, 97, 10, 1, 116, 18, 1, 121, 34, 5, 83, 108, 105, 99, 101, 18, 1, 114, 90, 9, 10, 1, 120, 18, 4, 10, 2, 8, 1, 90, 9, 10, 1, 115, 18, 4, 10, 2, 8, 7, 90, 9, 10, 1, 101, 18, 4, 10, 2, 8, 7, 90, 9, 10, 1, 97, 18, 4, 10, 2, 8, 7, 90, 9, 10, 1, 116, 18, 4, 10, 2, 8, 7, 98, 9, 10, 1, 121, 18, 4, 10, 2, 8, 1, 66, 2, 16, 13], this.session_options, "y")), this._slice;
  }
}, HT = Object.freeze({ auto: "auto", gpu: "gpu", cpu: "cpu", wasm: "wasm", webgpu: "webgpu", cuda: "cuda", dml: "dml", coreml: "coreml", webnn: "webnn", "webnn-npu": "webnn-npu", "webnn-gpu": "webnn-gpu", "webnn-cpu": "webnn-cpu" }), Co = pe.IS_NODE_ENV ? "cpu" : "wasm";
function Sm(e, t, { warn: r } = {}) {
  return e ? typeof e == "string" ? e : e.hasOwnProperty(t) ? e[t] : (r && r(`device not specified for "${t}". Using the default device (${Co}).`), Co) : Co;
}
var QT = /* @__PURE__ */ (function() {
  let e;
  return async function() {
    if (e === void 0) if (!pe.IS_WEBGPU_AVAILABLE) e = !1;
    else try {
      e = (await navigator.gpu.requestAdapter()).features.has("shader-f16");
    } catch {
      e = !1;
    }
    return e;
  };
})(), Qe = Object.freeze({ auto: "auto", fp32: "fp32", fp16: "fp16", q8: "q8", int8: "int8", uint8: "uint8", q4: "q4", bnb4: "bnb4", q4f16: "q4f16", q2: "q2", q2f16: "q2f16", q1: "q1", q1f16: "q1f16" }), gf = Qe.fp32, wf = Object.freeze({ [HT.wasm]: Qe.q8 }), da = Object.freeze({ [Qe.fp32]: "", [Qe.fp16]: "_fp16", [Qe.int8]: "_int8", [Qe.uint8]: "_uint8", [Qe.q8]: "_quantized", [Qe.q4]: "_q4", [Qe.q2]: "_q2", [Qe.q1]: "_q1", [Qe.q4f16]: "_q4f16", [Qe.q2f16]: "_q2f16", [Qe.q1f16]: "_q1f16", [Qe.bnb4]: "_bnb4" });
function Pm(e, t, r, { configDtype: n = null, warn: a } = {}) {
  let s, i = !1;
  e && typeof e != "string" ? e.hasOwnProperty(t) ? s = e[t] : (s = null, i = !0) : s = e;
  let o;
  if (s === Qe.auto) {
    if (n) {
      let l = typeof n == "string" ? n : n?.[t];
      if (l && l !== Qe.auto && Qe.hasOwnProperty(l)) return l;
    }
    o = wf[r] ?? gf;
  } else s && Qe.hasOwnProperty(s) ? o = s : o = wf[r] ?? gf;
  return i && a && a(`dtype not specified for "${t}". Using the default dtype (${o}) for this device (${r}).`), o;
}
var pa = Object.freeze({ float32: Float32Array, float16: typeof Float16Array < "u" ? Float16Array : Uint16Array, float64: Float64Array, string: Array, int8: Int8Array, uint8: Uint8Array, int16: Int16Array, uint16: Uint16Array, int32: Int32Array, uint32: Uint32Array, int64: BigInt64Array, uint64: BigUint64Array, bool: Uint8Array, uint4: Uint8Array, int4: Int8Array }), V = class Ue {
  get dims() {
    return this.ort_tensor.dims;
  }
  set dims(t) {
    this.ort_tensor.dims = t;
  }
  get type() {
    return this.ort_tensor.type;
  }
  get data() {
    return this.ort_tensor.data;
  }
  get size() {
    return this.ort_tensor.size;
  }
  get location() {
    return this.ort_tensor.location;
  }
  ort_tensor;
  constructor(...t) {
    return Cm(t[0]) ? this.ort_tensor = t[0] : this.ort_tensor = new Mo(t[0], t[1], t[2]), new Proxy(this, { get: (r, n) => {
      if (typeof n == "string") {
        let a = Number(n);
        if (Number.isInteger(a)) return r._getitem(a);
      }
      return r[n];
    }, set: (r, n, a) => r[n] = a });
  }
  dispose() {
    this.ort_tensor.dispose();
  }
  *[Symbol.iterator]() {
    let [t, ...r] = this.dims;
    if (r.length > 0) {
      let n = r.reduce((a, s) => a * s);
      for (let a = 0; a < t; ++a) yield this._subarray(a, n, r);
    } else yield* this.data;
  }
  _getitem(t) {
    let [r, ...n] = this.dims;
    if (t = Nt(t, r), n.length > 0) {
      let a = n.reduce((s, i) => s * i);
      return this._subarray(t, a, n);
    } else return new Ue(this.type, [this.data[t]], n);
  }
  _subarray(t, r, n) {
    let a = t * r, s = (t + 1) * r, i = "subarray" in this.data ? this.data.subarray(a, s) : this.data.slice(a, s);
    return new Ue(this.type, i, n);
  }
  item() {
    let t = this.data;
    if (t.length !== 1) throw new Error(`a Tensor with ${t.length} elements cannot be converted to Scalar`);
    return t[0];
  }
  tolist() {
    return XT(this.data, this.dims);
  }
  sigmoid() {
    return this.clone().sigmoid_();
  }
  sigmoid_() {
    let t = this.data;
    for (let r = 0; r < t.length; ++r) t[r] = 1 / (1 + Math.exp(-t[r]));
    return this;
  }
  map(t) {
    return this.clone().map_(t);
  }
  map_(t) {
    let r = this.data;
    for (let n = 0; n < r.length; ++n) r[n] = t(r[n], n, r);
    return this;
  }
  mul(t) {
    return this.clone().mul_(t);
  }
  mul_(t) {
    let r = this.data;
    for (let n = 0; n < r.length; ++n) r[n] *= t;
    return this;
  }
  div(t) {
    return this.clone().div_(t);
  }
  div_(t) {
    let r = this.data;
    for (let n = 0; n < r.length; ++n) r[n] /= t;
    return this;
  }
  add(t) {
    return this.clone().add_(t);
  }
  add_(t) {
    let r = this.data;
    for (let n = 0; n < r.length; ++n) r[n] += t;
    return this;
  }
  sub(t) {
    return this.clone().sub_(t);
  }
  sub_(t) {
    let r = this.data;
    for (let n = 0; n < r.length; ++n) r[n] -= t;
    return this;
  }
  remainder(t) {
    return this.clone().remainder_(t);
  }
  remainder_(t) {
    let r = this.data, n = r instanceof BigInt64Array || r instanceof BigUint64Array ? BigInt(t) : Number(t);
    if ((n === 0 || n === 0n) && (this.type.includes("int") || this.type === "bool")) throw new RangeError("Division by zero");
    if (n < 0 && (this.type.startsWith("uint") || this.type === "bool")) throw new RangeError("Negative divisors are not supported for unsigned or boolean tensors");
    for (let a = 0; a < r.length; ++a) {
      let s = r[a] % n, i = s < 0 && n > 0 || s > 0 && n < 0;
      r[a] = i ? s + n : s;
    }
    return this;
  }
  clone() {
    return new Ue(this.type, this.data.slice(), this.dims.slice());
  }
  slice(...t) {
    let r = [], n = [];
    for (let p = 0; p < this.dims.length; ++p) {
      let d = t[p];
      if (d == null) n.push([0, this.dims[p]]), r.push(this.dims[p]);
      else if (typeof d == "number") d = Nt(d, this.dims[p], p), n.push([d, d + 1]);
      else if (Array.isArray(d) && d.length === 2) {
        let [_, f] = d;
        if (_ = _ === null ? 0 : Nt(_, this.dims[p], p, !1), f = f === null ? this.dims[p] : Nt(f, this.dims[p], p, !1), _ > f) throw new Error(`Invalid slice: ${d}`);
        let w = [Math.max(_, 0), Math.min(f, this.dims[p])];
        n.push(w), r.push(w[1] - w[0]);
      } else throw new Error(`Invalid slice: ${d}`);
    }
    let a = n.map(([p, d]) => d - p), s = a.reduce((p, d) => p * d), i = this.data, o = new i.constructor(s), l = this.stride(), c = !0;
    for (let p = 1; p < a.length; ++p) if (n[p][0] !== 0 || n[p][1] !== this.dims[p]) {
      c = !1;
      break;
    }
    if (c) {
      let p = n[0][0] * l[0], d = n[0][1] * l[0];
      if (ArrayBuffer.isView(i)) o.set(i.subarray(p, d));
      else if (Array.isArray(i)) {
        let _ = i.slice(p, d);
        for (let f = 0; f < _.length; ++f) o[f] = _[f];
      } else throw new Error("Unsupported data type for slicing");
    } else for (let p = 0; p < s; ++p) {
      let d = 0;
      for (let _ = a.length - 1, f = p; _ >= 0; --_) {
        let w = a[_];
        d += (f % w + n[_][0]) * l[_], f = Math.floor(f / w);
      }
      o[p] = i[d];
    }
    return new Ue(this.type, o, r);
  }
  permute(...t) {
    return YT(this, t);
  }
  transpose(...t) {
    return this.permute(...t);
  }
  sum(t = null, r = !1) {
    return this.norm(1, t, r);
  }
  norm(t = "fro", r = null, n = !1) {
    if (t === "fro") t = 2;
    else if (typeof t == "string") throw Error(`Unsupported norm: ${t}`);
    let a = this.data, s = a instanceof BigInt64Array || a instanceof BigUint64Array;
    if (s && t !== 1) throw Error(`Expected a floating point tensor as input. Got ${this.type}`);
    let i, o;
    if (s ? (i = (d, _) => d + _, o = 0n) : (i = (d, _) => d + _ ** t, o = 0), r === null) {
      let d = a.reduce(i, o);
      return t !== 1 && (d = d ** (1 / t)), new Ue(this.type, [d], []);
    }
    let [l, c, p] = la(i, this, r, n);
    if (t !== 1) for (let d = 0; d < c.length; ++d) c[d] = c[d] ** (1 / t);
    return new Ue(l, c, p);
  }
  normalize_(t = 2, r = 1) {
    r = Nt(r, this.dims.length);
    let n = this.norm(t, r, !0), a = this.data, s = n.data;
    for (let i = 0; i < a.length; ++i) {
      let o = 0;
      for (let l = this.dims.length - 1, c = i, p = 1; l >= 0; --l) {
        let d = this.dims[l];
        if (l !== r) {
          let _ = c % d;
          o += _ * p, p *= this.dims[l];
        }
        c = Math.floor(c / d);
      }
      a[i] /= s[o];
    }
    return this;
  }
  normalize(t = 2, r = 1) {
    return this.clone().normalize_(t, r);
  }
  stride() {
    return So(this.dims);
  }
  squeeze(t = null) {
    return new Ue(this.type, this.data, yf(this.dims, t));
  }
  squeeze_(t = null) {
    return this.dims = yf(this.dims, t), this;
  }
  unsqueeze(t) {
    return new Ue(this.type, this.data, bf(this.dims, t));
  }
  unsqueeze_(t) {
    return this.dims = bf(this.dims, t), this;
  }
  flatten_(t = 0, r = -1) {
    r = (r + this.dims.length) % this.dims.length;
    let n = this.dims.slice(0, t), a = this.dims.slice(t, r + 1), s = this.dims.slice(r + 1);
    return this.dims = [...n, a.reduce((i, o) => i * o, 1), ...s], this;
  }
  flatten(t = 0, r = -1) {
    return this.clone().flatten_(t, r);
  }
  view(...t) {
    let r = -1;
    for (let a = 0; a < t.length; ++a) if (t[a] === -1) {
      if (r !== -1) throw new Error("Only one dimension can be inferred");
      r = a;
    }
    let n = this.data;
    if (r !== -1) {
      let a = t.reduce((s, i, o) => o !== r ? s * i : s, 1);
      t[r] = n.length / a;
    }
    return new Ue(this.type, n, t);
  }
  neg_() {
    let t = this.data;
    for (let r = 0; r < t.length; ++r) t[r] = -t[r];
    return this;
  }
  neg() {
    return this.clone().neg_();
  }
  gt(t) {
    let r = new Uint8Array(this.data.length), n = this.data;
    for (let a = 0; a < n.length; ++a) r[a] = n[a] > t ? 1 : 0;
    return new Ue("bool", r, this.dims);
  }
  lt(t) {
    let r = new Uint8Array(this.data.length), n = this.data;
    for (let a = 0; a < n.length; ++a) r[a] = n[a] < t ? 1 : 0;
    return new Ue("bool", r, this.dims);
  }
  clamp_(t, r) {
    let n = this.data;
    for (let a = 0; a < n.length; ++a) n[a] = Math.min(Math.max(n[a], t), r);
    return this;
  }
  clamp(t, r) {
    return this.clone().clamp_(t, r);
  }
  round_() {
    let t = this.data;
    for (let r = 0; r < t.length; ++r) t[r] = Math.round(t[r]);
    return this;
  }
  round() {
    return this.clone().round_();
  }
  mean(t = null, r = !1) {
    return cl(this, t, r);
  }
  min(t = null, r = !1) {
    if (t === null) {
      let i = Go(this.data)[0];
      return new Ue(this.type, [i], []);
    }
    let [n, a, s] = la((i, o) => Math.min(i, o), this, t, r, 1 / 0);
    return new Ue(n, a, s);
  }
  max(t = null, r = !1) {
    if (t === null) {
      let i = We(this.data)[0];
      return new Ue(this.type, [i], []);
    }
    let [n, a, s] = la((i, o) => Math.max(i, o), this, t, r, -1 / 0);
    return new Ue(n, a, s);
  }
  argmin(t = null, r = !1) {
    if (t !== null) throw new Error("`dim !== null` not yet implemented.");
    let n = Go(this.data)[1];
    return new Ue("int64", [BigInt(n)], []);
  }
  argmax(t = null, r = !1) {
    if (t !== null) throw new Error("`dim !== null` not yet implemented.");
    let n = We(this.data)[1];
    return new Ue("int64", [BigInt(n)], []);
  }
  repeat(...t) {
    if (t.length < this.dims.length) throw new Error(`Number of dimensions of repeat dims (${t.length}) cannot be smaller than number of dimensions of tensor (${this.dims.length})`);
    if (t.every((p) => p === 1)) {
      if (t.length === this.dims.length) return this.clone();
      let p = t.length - this.dims.length, d = Array(p).fill(1).concat(this.dims);
      return new Ue(this.type, this.data.slice(), d);
    }
    let r = t.length - this.dims.length, n = Array(r).fill(1).concat(this.dims), a = n.map((p, d) => p * t[d]), s = a.reduce((p, d) => p * d, 1), i = this.data, o = new i.constructor(s), l = So(n), c = So(a);
    for (let p = 0; p < s; ++p) {
      let d = p, _ = 0;
      for (let f = 0; f < a.length; ++f) {
        let w = Math.floor(d / c[f]);
        d = d % c[f];
        let y = w % n[f];
        _ += y * l[f];
      }
      o[p] = i[_];
    }
    return new Ue(this.type, o, a);
  }
  tile(...t) {
    if (t.length < this.dims.length) {
      let r = this.dims.length - t.length;
      t = Array(r).fill(1).concat(t);
    }
    return this.repeat(...t);
  }
  to(t) {
    if (this.type === t) return this;
    if (!pa.hasOwnProperty(t)) throw new Error(`Unsupported type: ${t}`);
    let r, n = ["int64", "uint64"].includes(this.type), a = ["int64", "uint64"].includes(t);
    if (n && !a) r = Number;
    else if (!n && a) ["float16", "float32", "float64"].includes(this.type) ? r = (s) => BigInt(Math.floor(s)) : r = BigInt;
    else if (this.type === "float16" && t == "float32" && this.data instanceof Uint16Array) return new Ue(t, $T(this.data), this.dims);
    return new Ue(t, pa[t].from(this.data, r), this.dims);
  }
};
function XT(e, t) {
  let r = e.length, n = t.length === 0 ? 1 : t.reduce((s, i) => s * i);
  if (r !== n) throw Error(`cannot reshape array of size ${r} into shape (${t})`);
  let a = e;
  for (let s = t.length - 1; s >= 0; s--) a = a.reduce((i, o) => {
    let l = i[i.length - 1];
    return l.length < t[s] ? l.push(o) : i.push([o]), i;
  }, [[]]);
  return a[0];
}
function YT(e, t) {
  let [r, n] = PT(e.data, e.dims, t);
  return new V(e.type, r, n);
}
function Fm(e, [t, r], n = "bilinear", a = !1) {
  let s = e.dims.at(-3) ?? 1, i = e.dims.at(-2), o = e.dims.at(-1), l = ST(e.data, [s, i, o], [t, r], n, a);
  return new V(e.type, l, [s, t, r]);
}
async function Gt(e, { size: t = null, mode: r = "bilinear" } = {}) {
  if (e.dims.length !== 4) throw new Error("`interpolate_4d` currently only supports 4D input.");
  if (!t) throw new Error("`interpolate_4d` requires a `size` argument.");
  let n;
  if (t.length === 2) n = [...e.dims.slice(0, 2), ...t];
  else if (t.length === 3) n = [e.dims[0], ...t];
  else if (t.length === 4) n = t;
  else throw new Error("`size` must be of length 2, 3, or 4.");
  let a;
  if (r === "nearest") a = await rn.nearest_interpolate_4d;
  else if (r === "bilinear") a = await rn.bilinear_interpolate_4d;
  else if (r === "bicubic") a = await rn.bicubic_interpolate_4d;
  else throw new Error(`Unsupported mode: ${r}`);
  let s = new V("int64", new BigInt64Array(n.map(BigInt)), [n.length]);
  return await a({ x: e, s });
}
async function JT(e, t) {
  return await (await rn.matmul)({ a: e, b: t });
}
async function o$(e, t) {
  let r = Nt(Number(t.item()), e.dims.length);
  return await (await rn.rfft)({ x: e.unsqueeze(-1), a: new V("int64", [BigInt(r)], []) });
}
async function In(e, t) {
  let r = await rn.top_k;
  return t == null ? t = e.dims.at(-1) : t = Math.min(t, e.dims.at(-1)), await r({ x: e, k: new V("int64", [BigInt(t)], [1]) });
}
var as = (e) => new V("int64", e, [e.length]);
async function Im(e, t, r, n, a) {
  return await (await rn.slice)({ x: e, s: as(t), e: as(r), a: as(n), t: as(a ?? new Array(n.length).fill(1)) });
}
function ZT(e, t) {
  let r = e.data, n = t.data, a = [e.dims[0], e.dims[2]], s = new r.constructor(a[0] * a[1]), [i, o, l] = e.dims, c = 0;
  for (let p = 0; p < i; ++p) {
    let d = p * l * o;
    for (let _ = 0; _ < l; ++_) {
      let f = 0, w = 0, y = p * o, b = d + _;
      for (let T = 0; T < o; ++T) {
        let A = Number(n[y + T]);
        w += A, f += r[b + T * l] * A;
      }
      let x = f / w;
      s[c++] = x;
    }
  }
  return new V(e.type, s, a);
}
function l$(e, t, { eps: r = 1e-5 } = {}) {
  if (e.dims.length !== 2) throw new Error("`layer_norm` currently only supports 2D input.");
  let [n, a] = e.dims;
  if (t.length !== 1 && t[0] !== a) throw new Error("`normalized_shape` must be a 1D array with shape `[input.dims[1]]`.");
  let [s, i] = Lm(e, 1, 0, !0), o = s.data, l = i.data, c = e.data, p = new c.constructor(c.length);
  for (let d = 0; d < n; ++d) {
    let _ = d * a;
    for (let f = 0; f < a; ++f) {
      let w = _ + f;
      p[w] = (c[w] - l[d]) / (o[d] + r);
    }
  }
  return new V(e.type, p, e.dims);
}
function yf(e, t) {
  return e = e.slice(), t === null ? e = e.filter((r) => r !== 1) : typeof t == "number" ? e[t] === 1 && e.splice(t, 1) : Array.isArray(t) && (e = e.filter((r, n) => r !== 1 || !t.includes(n))), e;
}
function bf(e, t) {
  return t = Nt(t, e.length + 1), e = e.slice(), e.splice(t, 0, 1), e;
}
function Nt(e, t, r = null, n = !0) {
  if (e < -t || e >= t) {
    if (n) throw new Error(`IndexError: index ${e} is out of bounds for dimension${r === null ? "" : " " + r} with size ${t}`);
    return e < -t ? 0 : t;
  }
  return e < 0 && (e = (e % t + t) % t), e;
}
function Ne(e, t = 0) {
  t = Nt(t, e[0].dims.length);
  let r = e[0].dims.slice();
  r[t] = e.reduce((i, o) => i + o.dims[t], 0);
  let n = r.reduce((i, o) => i * o, 1), a = new e[0].data.constructor(n), s = e[0].type;
  if (t === 0) {
    let i = 0;
    for (let o of e) {
      let l = o.data;
      a.set(l, i), i += l.length;
    }
  } else {
    let i = 0;
    for (let o = 0; o < e.length; ++o) {
      let { data: l, dims: c } = e[o];
      for (let p = 0; p < l.length; ++p) {
        let d = 0;
        for (let _ = c.length - 1, f = p, w = 1; _ >= 0; --_) {
          let y = c[_], b = f % y;
          _ === t && (b += i), d += b * w, w *= r[_], f = Math.floor(f / y);
        }
        a[d] = l[p];
      }
      i += c[t];
    }
  }
  return new V(s, a, r);
}
function hr(e, t = 0) {
  return Ne(e.map((r) => r.unsqueeze(t)), t);
}
function la(e, t, r, n = !1, a = null) {
  let s = t.data, i = t.dims;
  r = Nt(r, i.length);
  let o = i.slice();
  o[r] = 1;
  let l = new s.constructor(s.length / i[r]);
  a !== null && l.fill(a);
  for (let c = 0; c < s.length; ++c) {
    let p = 0;
    for (let d = i.length - 1, _ = c, f = 1; d >= 0; --d) {
      let w = i[d];
      if (d !== r) {
        let y = _ % w;
        p += y * f, f *= o[d];
      }
      _ = Math.floor(_ / w);
    }
    l[p] = e(l[p], s[c], c, p);
  }
  return n || o.splice(r, 1), [t.type, l, o];
}
function Lm(e, t = null, r = 1, n = !1) {
  let a = e.data, s = e.dims;
  if (t === null) {
    let d = a.reduce((w, y) => w + y, 0) / a.length, _ = Math.sqrt(a.reduce((w, y) => w + (y - d) ** 2, 0) / (a.length - r)), f = new V(e.type, [d], []);
    return [new V(e.type, [_], []), f];
  }
  t = Nt(t, s.length);
  let i = cl(e, t, n), o = i.data, [l, c, p] = la((d, _, f, w) => d + (_ - o[w]) ** 2, e, t, n);
  for (let d = 0; d < c.length; ++d) c[d] = Math.sqrt(c[d] / (s[t] - r));
  return [new V(l, c, p), i];
}
function cl(e, t = null, r = !1) {
  let n = e.dims, a = e.data;
  if (t === null) {
    let l = a.reduce((c, p) => c + p, 0);
    return new V(e.type, [l / a.length], []);
  }
  t = Nt(t, n.length);
  let [s, i, o] = la((l, c) => l + c, e, t, r);
  if (n[t] !== 1) for (let l = 0; l < i.length; ++l) i[l] /= n[t];
  return new V(s, i, o);
}
function So(e) {
  let t = new Array(e.length);
  for (let r = e.length - 1, n = 1; r >= 0; --r) t[r] = n, n *= e[r];
  return t;
}
function ul(e, t, r, n) {
  let a = e.reduce((s, i) => s * i, 1);
  return new V(r, new n(a).fill(t), e);
}
function ut(e, t) {
  let r, n;
  if (typeof t == "number") r = "float32", n = Float32Array;
  else if (typeof t == "bigint") r = "int64", n = BigInt64Array;
  else if (typeof t == "boolean") r = "bool", n = Uint8Array;
  else throw new Error(`Unsupported data type: ${typeof t}`);
  return ul(e, t, r, n);
}
function Uo(e, t) {
  return ut(e.dims, t);
}
function mt(e) {
  return ul(e, 1n, "int64", BigInt64Array);
}
function dl(e) {
  return mt(e.dims);
}
function Om(e) {
  return ul(e, 0n, "int64", BigInt64Array);
}
function pl(e) {
  return Om(e.dims);
}
function c$(e) {
  let t = e.reduce((r, n) => r * n, 1);
  return new V("float32", Float32Array.from({ length: t }, () => Ls.random()), e);
}
function KT(e) {
  let t = e.reduce((r, n) => r * n, 1);
  return new V("float32", Float32Array.from({ length: t }, () => Ls.gauss()), e);
}
function eE(e, t) {
  if (e.dims.length !== 2) throw new Error("The tensor must have 2 dimensions");
  if (e.dims.at(-1) % 8 !== 0) throw new Error("The last dimension of the tensor must be a multiple of 8");
  if (!["binary", "ubinary"].includes(t)) throw new Error("The precision must be either 'binary' or 'ubinary'");
  let r = t === "binary", n = r ? "int8" : "uint8", a = r ? Int8Array : Uint8Array, s = e.data, i = new a(s.length / 8);
  for (let o = 0; o < s.length; ++o) {
    let l = s[o] > 0 ? 1 : 0, c = Math.floor(o / 8), p = o % 8;
    i[c] |= l << 7 - p, r && p === 0 && (i[c] -= 128);
  }
  return new V(n, i, [e.dims[0], e.dims[1] / 8]);
}
async function hl(e) {
  if (!e) throw new Error("modelId is required for get_tokenizer_files");
  return (await an(e, "tokenizer_config.json", {})).exists ? ["tokenizer.json", "tokenizer_config.json"] : [];
}
async function zm(e, t) {
  let r = await hl(e);
  return await Promise.all(r.map((n) => nr(e, n, !0, t)));
}
function _l(e) {
  let t = e.dims;
  switch (t.length) {
    case 1:
      return e.tolist();
    case 2:
      if (t[0] !== 1) throw new Error("Unable to decode tensor with `batch size !== 1`. Use `tokenizer.batch_decode(...)` for batched inputs.");
      return e.tolist()[0];
    default:
      throw new Error(`Expected tensor to have 1-2 dimensions, got ${t.length}.`);
  }
}
var tE = ["bos_token", "eos_token", "unk_token", "sep_token", "pad_token", "cls_token", "mask_token"];
function rE(e, t, r, n) {
  for (let a of Object.keys(e)) {
    let s = t - e[a].length, i = r(a), o = new Array(s).fill(i);
    e[a] = n === "right" ? $t(e[a], o) : $t(o, e[a]);
  }
}
function nE(e, t) {
  for (let r of Object.keys(e)) e[r].length = t;
}
function Kr(e, ...t) {
  for (let r of t) {
    if (!Object.hasOwn(e, r)) continue;
    let n = e[r];
    if (n) if (typeof n == "object") {
      if (n.__type === "AddedToken") return n.content;
      throw Error(`Unknown token: ${n}`);
    } else return n;
  }
  return null;
}
function aE(e) {
  let t = [];
  for (let r of e.get_added_tokens_decoder().values()) r.special && t.push(r);
  return t;
}
var ie = class extends gt {
  return_token_type_ids = !1;
  padding_side = "right";
  constructor(e, t) {
    if (super(), this._tokenizerJSON = e, this._tokenizerConfig = t, this._tokenizer = new _k(e, t), this.config = t, this.padding_side = t.padding_side ?? this.padding_side, this.mask_token = Kr(t, "mask_token"), this.mask_token_id = this._tokenizer.token_to_id(this.mask_token), this.pad_token = Kr(t, "pad_token", "eos_token"), this.pad_token_id = this._tokenizer.token_to_id(this.pad_token), this.sep_token = Kr(t, "sep_token"), this.sep_token_id = this._tokenizer.token_to_id(this.sep_token), this.unk_token = Kr(t, "unk_token"), this.unk_token_id = this._tokenizer.token_to_id(this.unk_token), this.bos_token = Kr(t, "bos_token"), this.bos_token_id = this._tokenizer.token_to_id(this.bos_token), this.eos_token = Kr(t, "eos_token"), this.eos_token_id = this._tokenizer.token_to_id(this.eos_token), this.chat_template = t.chat_template ?? null, Array.isArray(this.chat_template)) {
      let n = /* @__PURE__ */ Object.create(null);
      for (let { name: a, template: s } of this.chat_template) {
        if (typeof a != "string" || typeof s != "string") throw new Error('Chat template must be a list of objects with "name" and "template" properties');
        n[a] = s;
      }
      this.chat_template = n;
    }
    this._compiled_template_cache = /* @__PURE__ */ new Map();
    let r = aE(this._tokenizer);
    this.all_special_ids = r.map((n) => n.id), this.all_special_tokens = r.map((n) => n.content);
  }
  static async from_pretrained(e, { progress_callback: t = null, config: r = null, cache_dir: n = null, local_files_only: a = !1, revision: s = "main" } = {}) {
    let i = await zm(e, { progress_callback: t, config: r, cache_dir: n, local_files_only: a, revision: s });
    return new this(...i);
  }
  get_vocab() {
    return this._tokenizer.get_vocab();
  }
  get model_max_length() {
    return this._tokenizerConfig.model_max_length ?? 1 / 0;
  }
  get add_eos_token() {
    return this._tokenizerConfig.add_eos_token;
  }
  get add_bos_token() {
    return this._tokenizerConfig.add_bos_token;
  }
  convert_tokens_to_ids(e) {
    return typeof e == "string" ? this._tokenizer.token_to_id(e) : e.map((t) => this._tokenizer.token_to_id(t));
  }
  _call(e, t = {}) {
    let { text_pair: r = null, add_special_tokens: n = !0, padding: a = !1, return_token_type_ids: s = null } = t, { truncation: i = null, max_length: o = null } = t, l = t.return_tensor ?? !0, c = Array.isArray(e), p;
    if (c) {
      if (e.length === 0) throw Error("text array must be non-empty");
      if (r !== null) {
        if (Array.isArray(r)) {
          if (e.length !== r.length) throw Error("text and text_pair must have the same length");
        } else throw Error("text_pair must also be an array");
        p = e.map((_, f) => this._encode_plus(_, { text_pair: r[f], add_special_tokens: n, return_token_type_ids: s }));
      } else p = e.map((_) => this._encode_plus(_, { add_special_tokens: n, return_token_type_ids: s }));
    } else {
      if (e == null) throw Error("text may not be null or undefined");
      if (Array.isArray(r)) throw Error("When specifying `text_pair`, since `text` is a string, `text_pair` must also be a string (i.e., not an array).");
      p = [this._encode_plus(e, { text_pair: r, add_special_tokens: n, return_token_type_ids: s })];
    }
    if (o === null ? o = this.model_max_length : i === null && (a === !0 ? (ce.warn("`max_length` is ignored when `padding: true` and there is no truncation strategy. To pad to max length, use `padding: 'max_length'`."), o = this.model_max_length) : a === !1 && (ce.warn("Truncation was not explicitly activated but `max_length` is provided a specific value, please use `truncation: true` to explicitly truncate examples to max length."), i = !0)), a === !0 && (o = Math.min(We(p.map((_) => _.input_ids.length))[0], o ?? 1 / 0)), o = Math.min(o, this.model_max_length ?? 1 / 0), a || i) for (let _ = 0; _ < p.length; ++_) p[_].input_ids.length !== o && (p[_].input_ids.length > o ? i && nE(p[_], o) : a && rE(p[_], o, (f) => f === "input_ids" ? this.pad_token_id : 0, this.padding_side));
    let d = {};
    if (l) {
      if (!(a && i) && p.some((f) => {
        for (let w of Object.keys(f)) if (f[w].length !== p[0][w]?.length) return !0;
        return !1;
      })) throw Error("Unable to create tensor, you should probably activate truncation and/or padding with 'padding=true' and 'truncation=true' to have batched tensors with the same length.");
      let _ = [p.length, p[0].input_ids.length];
      for (let f of Object.keys(p[0])) d[f] = new V("int64", BigInt64Array.from(p.flatMap((w) => w[f]).map(BigInt)), _);
    } else {
      for (let _ of Object.keys(p[0])) d[_] = p.map((f) => f[_]);
      if (!c) for (let _ of Object.keys(d)) d[_] = d[_][0];
    }
    return d;
  }
  _encode_text(e) {
    return e === null ? null : this._tokenizer.encode(e).tokens;
  }
  _encode_plus(e, { text_pair: t = null, add_special_tokens: r = !0, return_token_type_ids: n = null } = {}) {
    let { ids: a, attention_mask: s, token_type_ids: i } = this._tokenizer.encode(e, { text_pair: t, add_special_tokens: r, return_token_type_ids: n ?? this.return_token_type_ids });
    return { input_ids: a, attention_mask: s, ...i ? { token_type_ids: i } : {} };
  }
  tokenize(e, { pair: t = null, add_special_tokens: r = !1 } = {}) {
    return this._tokenizer.tokenize(e, { text_pair: t, add_special_tokens: r });
  }
  encode(e, { text_pair: t = null, add_special_tokens: r = !0, return_token_type_ids: n = null } = {}) {
    return this._tokenizer.encode(e, { text_pair: t, add_special_tokens: r, return_token_type_ids: n }).ids;
  }
  batch_decode(e, t = {}) {
    return e instanceof V && (e = e.tolist()), e.map((r) => this.decode(r, t));
  }
  decode(e, t = {}) {
    if (e instanceof V && (e = _l(e)), !Array.isArray(e) || e.length === 0 || !Dx(e[0])) throw Error("token_ids must be a non-empty array of integers.");
    return this.decode_single(e, t);
  }
  decode_single(e, { skip_special_tokens: t = !1, clean_up_tokenization_spaces: r = null }) {
    return this._tokenizer.decode(e, { skip_special_tokens: t, clean_up_tokenization_spaces: r });
  }
  get_chat_template({ chat_template: e = null, tools: t = null } = {}) {
    if (this.chat_template && typeof this.chat_template == "object") {
      let r = this.chat_template;
      if (e !== null && Object.hasOwn(r, e)) e = r[e];
      else if (e === null) if (t !== null && "tool_use" in r) e = r.tool_use;
      else if ("default" in r) e = r.default;
      else throw Error(`This model has multiple chat templates with no default specified! Please either pass a chat template or the name of the template you wish to use to the 'chat_template' argument. Available template names are ${Object.keys(r).sort()}.`);
    } else if (e === null) if (this.chat_template) e = this.chat_template;
    else throw Error("Cannot use apply_chat_template() because tokenizer.chat_template is not set and no template argument was passed! For information about writing templates and setting the tokenizer.chat_template attribute, please see the documentation at https://huggingface.co/docs/transformers/main/en/chat_templating");
    return e;
  }
  apply_chat_template(e, t = {}) {
    let { tools: r = null, documents: n = null, chat_template: a = null, add_generation_prompt: s = !1, tokenize: i = !0, padding: o = !1, truncation: l = !1, max_length: c = null, return_tensor: p = !0, return_dict: d = !0, tokenizer_kwargs: _ = {}, ...f } = t;
    if (a = this.get_chat_template({ chat_template: a, tools: r }), typeof a != "string") throw Error(`chat_template must be a string, but got ${typeof a}`);
    let w = this._compiled_template_cache.get(a);
    w === void 0 && (w = new pT(a), this._compiled_template_cache.set(a, w));
    let y = /* @__PURE__ */ Object.create(null);
    for (let x of tE) {
      let T = Kr(this.config, x);
      T && (y[x] = T);
    }
    let b = w.render({ messages: e, add_generation_prompt: s, tools: r, documents: n, ...y, ...f });
    if (i) {
      let x = this._call(b, { add_special_tokens: !1, padding: o, truncation: l, max_length: c, return_tensor: p, ..._ });
      return d ? x : x.input_ids;
    }
    return b;
  }
};
function fl(e, t, r, n) {
  if (!("language_codes" in e) || !Array.isArray(e.language_codes)) throw new Error("Tokenizer must have `language_codes` attribute set and it should be an array of language ids.");
  if (!("languageRegex" in e) || !(e.languageRegex instanceof RegExp)) throw new Error("Tokenizer must have `languageRegex` attribute set and it should be a regular expression.");
  if (!("lang_to_token" in e) || typeof e.lang_to_token != "function") throw new Error("Tokenizer must have `lang_to_token` attribute set and it should be a function.");
  let a = n.src_lang, s = n.tgt_lang;
  if (!e.language_codes.includes(s)) throw new Error(`Target language code "${s}" is not valid. Must be one of: {${e.language_codes.join(", ")}}`);
  if (a !== void 0) {
    if (!e.language_codes.includes(a)) throw new Error(`Source language code "${a}" is not valid. Must be one of: {${e.language_codes.join(", ")}}`);
    let i = e._tokenizer.post_processor?.config;
    if (i && "single" in i) {
      for (let o of i.single) if ("SpecialToken" in o && e.languageRegex.test(o.SpecialToken.id)) {
        o.SpecialToken.id = e.lang_to_token(a);
        break;
      }
    }
  }
  return n.forced_bos_token_id = e._tokenizer.token_to_id(e.lang_to_token(s)), e._call(t, r);
}
var Nm = {};
fa(Nm, { AlbertTokenizer: () => sE, AutoTokenizer: () => Ae, BartTokenizer: () => iE, BertTokenizer: () => oE, BlenderbotSmallTokenizer: () => lE, BlenderbotTokenizer: () => cE, BloomTokenizer: () => uE, CLIPTokenizer: () => pE, CamembertTokenizer: () => dE, CodeGenTokenizer: () => _E, CodeLlamaTokenizer: () => hE, CohereAsrTokenizer: () => mE, CohereTokenizer: () => fE, ConvBertTokenizer: () => gE, DebertaTokenizer: () => yE, DebertaV2Tokenizer: () => wE, DistilBertTokenizer: () => bE, ElectraTokenizer: () => vE, EsmTokenizer: () => xE, FalconTokenizer: () => ME, GPT2Tokenizer: () => EE, GPTNeoXTokenizer: () => TE, GemmaTokenizer: () => kE, HerbertTokenizer: () => AE, LlamaTokenizer: () => CE, M2M100Tokenizer: () => SE, MBart50Tokenizer: () => FE, MBartTokenizer: () => Bm, MPNetTokenizer: () => OE, MarianTokenizer: () => PE, MgpstrTokenizer: () => IE, MobileBertTokenizer: () => LE, NllbTokenizer: () => zE, NougatTokenizer: () => NE, PreTrainedTokenizer: () => ie, Qwen2Tokenizer: () => BE, RoFormerTokenizer: () => DE, RobertaTokenizer: () => $E, SiglipTokenizer: () => RE, SpeechT5Tokenizer: () => GE, SqueezeBertTokenizer: () => VE, T5Tokenizer: () => UE, TokenizersBackend: () => ie, VitsTokenizer: () => jE, Wav2Vec2CTCTokenizer: () => WE, WhisperTokenizer: () => JE, XLMRobertaTokenizer: () => ZE, XLMTokenizer: () => KE });
var sE = class extends ie {
  return_token_type_ids = !0;
}, iE = class extends ie {
}, oE = class extends ie {
  return_token_type_ids = !0;
}, lE = class extends ie {
}, cE = class extends ie {
}, uE = class extends ie {
}, dE = class extends ie {
}, pE = class extends ie {
}, hE = class extends ie {
}, _E = class extends ie {
}, fE = class extends ie {
}, mE = class extends ie {
}, gE = class extends ie {
  return_token_type_ids = !0;
}, wE = class extends ie {
  return_token_type_ids = !0;
}, yE = class extends ie {
  return_token_type_ids = !0;
}, bE = class extends ie {
}, vE = class extends ie {
  return_token_type_ids = !0;
}, xE = class extends ie {
}, ME = class extends ie {
}, kE = class extends ie {
}, TE = class extends ie {
}, EE = class extends ie {
}, AE = class extends ie {
  return_token_type_ids = !0;
}, CE = class extends ie {
  padding_side = "left";
}, SE = class extends ie {
  constructor(e, t) {
    super(e, t), this.languageRegex = /^__[a-z]{2,3}__$/, this.language_codes = this.all_special_tokens.filter((r) => this.languageRegex.test(r)).map((r) => r.slice(2, -2)), this.lang_to_token = (r) => `__${r}__`;
  }
  _build_translation_inputs(e, t, r) {
    return fl(this, e, t, r);
  }
}, PE = class extends ie {
  constructor(e, t) {
    super(e, t), this.languageRegex = /^(>>\w+<<)\s*/g, this.supported_language_codes = Array.from(this.get_vocab().keys()).filter((r) => this.languageRegex.test(r)), ce.warn('WARNING: `MarianTokenizer` is not yet supported by Hugging Face\'s "fast" tokenizers library. Therefore, you may experience slightly inaccurate results.');
  }
  _encode_text(e) {
    if (e === null) return null;
    let [t, ...r] = e.trim().split(this.languageRegex);
    if (r.length === 0) return super._encode_text(t);
    if (r.length === 2) {
      let [n, a] = r;
      return this.supported_language_codes.includes(n) || ce.warn(`Unsupported language code "${n}" detected, which may lead to unexpected behavior. Should be one of: ${JSON.stringify(this.supported_language_codes)}`), $t([n], super._encode_text(a));
    }
  }
}, Bm = class extends ie {
  constructor(e, t) {
    super(e, t), this.languageRegex = /^[a-z]{2}_[A-Z]{2}$/, this.language_codes = this.all_special_tokens.filter((r) => this.languageRegex.test(r)).map((r) => r), this.lang_to_token = (r) => r;
  }
  _build_translation_inputs(e, t, r) {
    return fl(this, e, t, r);
  }
}, FE = class extends Bm {
}, IE = class extends ie {
}, LE = class extends ie {
  return_token_type_ids = !0;
}, OE = class extends ie {
}, zE = class extends ie {
  constructor(e, t) {
    super(e, t), this.languageRegex = /^[a-z]{3}_[A-Z][a-z]{3}$/, this.language_codes = this.all_special_tokens.filter((r) => this.languageRegex.test(r)), this.lang_to_token = (r) => r;
  }
  _build_translation_inputs(e, t, r) {
    return fl(this, e, t, r);
  }
}, NE = class extends ie {
}, BE = class extends ie {
}, $E = class extends ie {
}, DE = class extends ie {
  return_token_type_ids = !0;
}, RE = class extends ie {
}, GE = class extends ie {
}, VE = class extends ie {
  return_token_type_ids = !0;
}, UE = class extends ie {
}, qE = class extends Ut {
  decode_chain(e) {
    let t = "";
    for (let r = 1; r < e.length; r += 2) t += e[r];
    return [t];
  }
}, jE = class extends ie {
  constructor(e, t) {
    super(e, t), this._tokenizer.decoder = new qE({ type: "VitsDecoder" });
  }
}, WE = class extends ie {
}, $m = [["en", "english"], ["zh", "chinese"], ["de", "german"], ["es", "spanish"], ["ru", "russian"], ["ko", "korean"], ["fr", "french"], ["ja", "japanese"], ["pt", "portuguese"], ["tr", "turkish"], ["pl", "polish"], ["ca", "catalan"], ["nl", "dutch"], ["ar", "arabic"], ["sv", "swedish"], ["it", "italian"], ["id", "indonesian"], ["hi", "hindi"], ["fi", "finnish"], ["vi", "vietnamese"], ["he", "hebrew"], ["uk", "ukrainian"], ["el", "greek"], ["ms", "malay"], ["cs", "czech"], ["ro", "romanian"], ["da", "danish"], ["hu", "hungarian"], ["ta", "tamil"], ["no", "norwegian"], ["th", "thai"], ["ur", "urdu"], ["hr", "croatian"], ["bg", "bulgarian"], ["lt", "lithuanian"], ["la", "latin"], ["mi", "maori"], ["ml", "malayalam"], ["cy", "welsh"], ["sk", "slovak"], ["te", "telugu"], ["fa", "persian"], ["lv", "latvian"], ["bn", "bengali"], ["sr", "serbian"], ["az", "azerbaijani"], ["sl", "slovenian"], ["kn", "kannada"], ["et", "estonian"], ["mk", "macedonian"], ["br", "breton"], ["eu", "basque"], ["is", "icelandic"], ["hy", "armenian"], ["ne", "nepali"], ["mn", "mongolian"], ["bs", "bosnian"], ["kk", "kazakh"], ["sq", "albanian"], ["sw", "swahili"], ["gl", "galician"], ["mr", "marathi"], ["pa", "punjabi"], ["si", "sinhala"], ["km", "khmer"], ["sn", "shona"], ["yo", "yoruba"], ["so", "somali"], ["af", "afrikaans"], ["oc", "occitan"], ["ka", "georgian"], ["be", "belarusian"], ["tg", "tajik"], ["sd", "sindhi"], ["gu", "gujarati"], ["am", "amharic"], ["yi", "yiddish"], ["lo", "lao"], ["uz", "uzbek"], ["fo", "faroese"], ["ht", "haitian creole"], ["ps", "pashto"], ["tk", "turkmen"], ["nn", "nynorsk"], ["mt", "maltese"], ["sa", "sanskrit"], ["lb", "luxembourgish"], ["my", "myanmar"], ["bo", "tibetan"], ["tl", "tagalog"], ["mg", "malagasy"], ["as", "assamese"], ["tt", "tatar"], ["haw", "hawaiian"], ["ln", "lingala"], ["ha", "hausa"], ["ba", "bashkir"], ["jw", "javanese"], ["su", "sundanese"]], ps = new Map($m), HE = new Map([...$m.map(([e, t]) => [t, e]), ["burmese", "my"], ["valencian", "ca"], ["flemish", "nl"], ["haitian", "ht"], ["letzeburgesch", "lb"], ["pushto", "ps"], ["panjabi", "pa"], ["moldavian", "ro"], ["moldovan", "ro"], ["sinhalese", "si"], ["castilian", "es"]]);
function QE(e) {
  e = e.toLowerCase();
  let t = HE.get(e);
  if (t === void 0) {
    let r = e.match(/^<\|([a-z]{2})\|>$/);
    if (r && (e = r[1]), ps.has(e)) t = e;
    else {
      let n = e.length === 2 ? ps.keys() : ps.values();
      throw new Error(`Language "${e}" is not supported. Must be one of: ${JSON.stringify(Array.from(n))}`);
    }
  }
  return t;
}
var XE = "\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E", vf = new RegExp(`^[${XE}]+$`, "gu"), YE = 0.1, JE = class extends ie {
  get timestamp_begin() {
    return this._tokenizer.token_to_id("<|notimestamps|>") + 1;
  }
  _decode_asr(e, { return_timestamps: t = !1, return_language: r = !1, time_precision: n = null, force_full_sequences: a = !0 } = {}) {
    if (n === null) throw Error("Must specify time_precision");
    let s = null, i = t === "word";
    function o() {
      return { language: s, timestamp: [null, null], text: "" };
    }
    let l = [], c = o(), p = 0, d = this.timestamp_begin, _ = d + 1500, f = [], w = [], y = !1, b = null, x = new Set(this.all_special_ids);
    for (let E of e) {
      let S = E.tokens, O = i ? E.token_timestamps : null, M = null, G = d;
      if ("stride" in E) {
        let [q, H, Q] = E.stride;
        if (p -= H, b = q - Q, H && (G = H / n + d), Q) for (let $ = S.length - 1; $ >= 0; --$) {
          let C = Number(S[$]);
          if (C >= d) {
            if (M !== null && (C - d) * n < b) break;
            M = C;
          }
        }
      }
      let D = [], U = [];
      for (let q = 0; q < S.length; ++q) {
        let H = Number(S[q]);
        if (x.has(H)) {
          let Q = this.decode([H]), $ = ps.get(Q.slice(2, -2));
          if ($ !== void 0) {
            if (s !== null && $ !== s && !t) {
              f.push(D);
              let C = this.findLongestCommonSequence(f)[0], ae = this.decode(C);
              c.text = ae, l.push(c), f = [], D = [], c = o();
            }
            s = c.language = $;
          }
        } else if (H >= d && H <= _) {
          let Q = (H - d) * n + p, $ = ia(Q, 2);
          if (M !== null && H >= M) y = !0;
          else if (y || f.length > 0 && H < G) y = !1;
          else if (c.timestamp[0] === null) c.timestamp[0] = $;
          else if ($ !== c.timestamp[0]) {
            c.timestamp[1] = $, f.push(D), i && w.push(U);
            let [C, ae] = this.findLongestCommonSequence(f, w), ge = this.decode(C);
            if (c.text = ge, i && (c.words = this.collateWordTimestamps(C, ae, s), c.words.length > 0 && c.timestamp[1] !== null)) for (let J of c.words) J.timestamp[1] > c.timestamp[1] && c.timestamp[1] >= J.timestamp[0] && (J.timestamp[1] = c.timestamp[1]);
            l.push(c), f = [], D = [], w = [], U = [], c = o();
          }
        } else if (D.push(H), i) {
          let Q = ia(O[q] + p, 2), $;
          if (q + 1 < O.length) {
            $ = ia(O[q + 1] + p, 2);
            let C = this.decode([H]);
            vf.test(C) && ($ = ia(Math.min(Q + n, $), 2));
          } else $ = null;
          U.push([Q, $]);
        }
      }
      if ("stride" in E) {
        let [q, H, Q] = E.stride;
        p += q - Q;
      }
      D.length > 0 ? (f.push(D), i && w.push(U)) : f.every((q) => q.length === 0) && (c = o(), f = [], D = [], w = [], U = []);
    }
    if (f.length > 0) {
      if (a && t) throw new Error("Whisper did not predict an ending timestamp, which can happen if audio is cut off in the middle of a word. Also make sure WhisperTimeStampLogitsProcessor was used during generation.");
      let [E, S] = this.findLongestCommonSequence(f, w), O = this.decode(E);
      c.text = O, i && (c.words = this.collateWordTimestamps(E, S, s)), l.push(c);
    }
    let T = /* @__PURE__ */ Object.create(null), A = l.map((E) => E.text).join("");
    if (t || r) {
      for (let E = 0; E < l.length; ++E) {
        let S = l[E];
        t || delete S.timestamp, r || delete S.language;
      }
      if (i) {
        let E = [];
        for (let S of l) for (let O of S.words) E.push(O);
        T = { chunks: E };
      } else T = { chunks: l };
    }
    return [A, T];
  }
  findLongestCommonSequence(e, t = null) {
    let r = e[0], n = r.length, a = [], s = Array.isArray(t) && t.length > 0, i = s ? [] : null, o = s ? t[0] : null;
    for (let l = 1; l < e.length; ++l) {
      let c = e[l], p = 0, d = [n, n, 0, 0], _ = c.length;
      for (let A = 1; A < n + _; ++A) {
        let E = Math.max(0, n - A), S = Math.min(n, n + _ - A), O = r.slice(E, S), M = Math.max(0, A - n), G = Math.min(_, A), D = c.slice(M, G);
        if (O.length !== D.length) throw new Error("There is a bug within whisper `decode_asr` function, please report it. Dropping to prevent bad inference.");
        let U;
        s ? U = O.filter((Q, $) => Q === D[$] && o[E + $][0] - YE <= t[l][M + $][0]).length : U = O.filter((Q, $) => Q === D[$]).length;
        let q = A / 1e4, H = U / A + q;
        U > 1 && H > p && (p = H, d = [E, S, M, G]);
      }
      let [f, w, y, b] = d, x = Math.floor((w + f) / 2), T = Math.floor((b + y) / 2);
      if (s && p === 0 && n > 0) {
        let A = o[n - 1][0], E = t[l].findIndex((S) => S[0] >= A);
        T = E === -1 ? c.length : E;
      }
      a.push(...r.slice(0, x)), r = c.slice(T), n = r.length, s && (i.push(...o.slice(0, x)), o = t[l].slice(T));
    }
    return a.push(...r), s ? (i.push(...o), [a, i]) : [a, []];
  }
  collateWordTimestamps(e, t, r) {
    let [n, a, s] = this.combineTokensIntoWords(e, r), i = [];
    for (let o = 0; o < n.length; ++o) {
      let l = s[o];
      i.push({ text: n[o], timestamp: [t[l.at(0)][0], t[l.at(-1)][1]] });
    }
    return i;
  }
  combineTokensIntoWords(e, t, r = `"'\u201C\xA1\xBF([{-`, n = `"'.\u3002,\uFF0C!\uFF01?\uFF1F:\uFF1A\u201D)]}\u3001`) {
    t = t ?? "english";
    let a, s, i;
    return ["chinese", "japanese", "thai", "lao", "myanmar"].includes(t) ? [a, s, i] = this.splitTokensOnUnicode(e) : [a, s, i] = this.splitTokensOnSpaces(e), this.mergePunctuations(a, s, i, r, n);
  }
  decode(e, t) {
    let r;
    return t?.decode_with_timestamps ? (e instanceof V && (e = _l(e)), r = this.decodeWithTimestamps(e, t)) : r = super.decode(e, t), r;
  }
  decodeWithTimestamps(e, t) {
    let r = t?.time_precision ?? 0.02, n = this.all_special_ids.at(-1) + 1, a = [[]];
    for (let s of e) if (s = Number(s), s >= n) {
      let i = ((s - n) * r).toFixed(2);
      a.push(`<|${i}|>`), a.push([]);
    } else a[a.length - 1].push(s);
    return a = a.map((s) => typeof s == "string" ? s : super.decode(s, t)), a.join("");
  }
  splitTokensOnUnicode(e) {
    let t = this.decode(e, { decode_with_timestamps: !0 }), r = "\uFFFD", n = [], a = [], s = [], i = [], o = [], l = 0;
    for (let c = 0; c < e.length; ++c) {
      let p = e[c];
      i.push(p), o.push(c);
      let d = this.decode(i, { decode_with_timestamps: !0 });
      (!d.includes(r) || t[l + d.indexOf(r)] === r) && (n.push(d), a.push(i), s.push(o), i = [], o = [], l += d.length);
    }
    return [n, a, s];
  }
  splitTokensOnSpaces(e) {
    let [t, r, n] = this.splitTokensOnUnicode(e), a = [], s = [], i = [];
    for (let o = 0; o < t.length; ++o) {
      let l = t[o], c = r[o], p = n[o], d = c[0] >= this._tokenizer.token_to_id("<|endoftext|>"), _ = l.startsWith(" "), f = l.trim(), w = vf.test(f);
      if (d || _ || w || a.length === 0) a.push(l), s.push(c), i.push(p);
      else {
        let y = a.length - 1;
        a[y] += l, s[y].push(...c), i[y].push(...p);
      }
    }
    return [a, s, i];
  }
  mergePunctuations(e, t, r, n, a) {
    let s = structuredClone(e), i = structuredClone(t), o = structuredClone(r), l = s.length - 2, c = s.length - 1;
    for (; l >= 0; ) s[l].startsWith(" ") && n.includes(s[l].trim()) ? (s[c] = s[l] + s[c], i[c] = $t(i[l], i[c]), o[c] = $t(o[l], o[c]), s[l] = "", i[l] = [], o[l] = []) : c = l, --l;
    for (l = 0, c = 1; c < s.length; ) !s[l].endsWith(" ") && a.includes(s[c]) ? (s[l] += s[c], i[l] = $t(i[l], i[c]), o[l] = $t(o[l], o[c]), s[c] = "", i[c] = [], o[c] = []) : l = c, ++c;
    return [s.filter((p) => p), i.filter((p) => p.length > 0), o.filter((p) => p.length > 0)];
  }
}, ZE = class extends ie {
}, KE = class extends ie {
  return_token_type_ids = !0;
  constructor(e, t) {
    super(e, t), ce.warn('WARNING: `XLMTokenizer` is not yet supported by Hugging Face\'s "fast" tokenizers library. Therefore, you may experience slightly inaccurate results.');
  }
}, Ae = class {
  static async from_pretrained(e, { progress_callback: t = null, config: r = null, cache_dir: n = null, local_files_only: a = !1, revision: s = "main" } = {}) {
    let [i, o] = await zm(e, { progress_callback: t, config: r, cache_dir: n, local_files_only: a, revision: s }), l = o.tokenizer_class?.replace(/Fast$/, "") ?? "PreTrainedTokenizer", c = Nm[l];
    return c || (ce.warn(`Unknown tokenizer class "${l}", attempting to construct from base class.`), c = ie), new c(i, o);
  }
}, Os = "https://github.com/huggingface/transformers.js/issues/new/choose", Dm = "preprocessor_config.json", ha = "preprocessor_config.json", Rm = "processor_config.json", Gm = "chat_template.jinja", Ce = class extends gt {
  static classes = ["image_processor_class", "tokenizer_class", "feature_extractor_class"];
  static uses_processor_config = !1;
  static uses_chat_template_file = !1;
  constructor(e, t, r) {
    super(), this.config = e, this.components = t, this.chat_template = r;
  }
  get image_processor() {
    return this.components.image_processor;
  }
  get tokenizer() {
    return this.components.tokenizer;
  }
  get feature_extractor() {
    return this.components.feature_extractor;
  }
  apply_chat_template(e, t = {}) {
    if (!this.tokenizer) throw new Error("Unable to apply chat template without a tokenizer.");
    return this.tokenizer.apply_chat_template(e, { tokenize: !1, chat_template: this.chat_template ?? void 0, ...t });
  }
  batch_decode(...e) {
    if (!this.tokenizer) throw new Error("Unable to decode without a tokenizer.");
    return this.tokenizer.batch_decode(...e);
  }
  decode(...e) {
    if (!this.tokenizer) throw new Error("Unable to decode without a tokenizer.");
    return this.tokenizer.decode(...e);
  }
  async _call(e, ...t) {
    for (let r of [this.image_processor, this.feature_extractor, this.tokenizer]) if (r) return r(e, ...t);
    throw new Error("No image processor, feature extractor, or tokenizer found.");
  }
  static async from_pretrained(e, t = {}) {
    let [r, n, a] = await Promise.all([this.uses_processor_config ? nr(e, Rm, !0, t) : {}, Promise.all(this.classes.filter((s) => s in this).map(async (s) => {
      let i = await this[s].from_pretrained(e, t);
      return [s.replace(/_class$/, ""), i];
    })).then(Object.fromEntries), this.uses_chat_template_file ? ol(e, Gm, !0, t) : null]);
    return new this(r, n, a);
  }
}, qo = {};
fa(qo, { ChatterboxProcessor: () => P2, CohereAsrProcessor: () => I2, Florence2Processor: () => LA, Gemma3Processor: () => OA, Gemma3nProcessor: () => zA, Gemma4Processor: () => NA, Glm46VProcessor: () => BA, GraniteSpeechProcessor: () => $A, GroundingDinoProcessor: () => RA, Idefics3Processor: () => Cf, JinaCLIPProcessor: () => jA, Lfm2VlProcessor: () => WA, LlavaProcessor: () => HA, MgpstrProcessor: () => QA, MoonshineProcessor: () => XA, OwlViTProcessor: () => YA, PaliGemmaProcessor: () => ZA, Phi3VProcessor: () => eC, PixtralProcessor: () => tC, Processor: () => Ce, PyAnnoteProcessor: () => rC, Qwen2VLProcessor: () => vl, Qwen2_5_VLProcessor: () => wg, Qwen3VLProcessor: () => nC, Sam2Processor: () => bg, Sam2VideoProcessor: () => aC, SamProcessor: () => yg, SmolVLMProcessor: () => Cf, SpeechT5Processor: () => sC, UltravoxProcessor: () => iC, VLChatProcessor: () => qA, VoxtralProcessor: () => uC, VoxtralRealtimeProcessor: () => hC, Wav2Vec2Processor: () => _C, Wav2Vec2ProcessorWithLM: () => fC, WhisperProcessor: () => mC });
var dt = class extends gt {
  constructor(e) {
    super(), this.config = e;
  }
  static async from_pretrained(e, t = {}) {
    let r = await nr(e, Dm, !0, t);
    return new this(r);
  }
};
function it(e, t) {
  if (!(e instanceof Float32Array || e instanceof Float64Array)) throw new Error(`${t} expects input to be a Float32Array or a Float64Array, but got ${e?.constructor?.name ?? typeof e} instead. If using the feature extractor directly, remember to use \`load_audio(url, sampling_rate)\` to obtain the raw audio data of the file/url.`);
}
var ml = {};
fa(ml, { ASTFeatureExtractor: () => m2, ChatterboxFeatureExtractor: () => g2, ClapFeatureExtractor: () => w2, CohereAsrFeatureExtractor: () => b2, DacFeatureExtractor: () => Hm, EncodecFeatureExtractor: () => jm, FeatureExtractor: () => dt, Gemma3nAudioFeatureExtractor: () => Qm, Gemma4AudioFeatureExtractor: () => Xm, GraniteSpeechFeatureExtractor: () => v2, MoonshineFeatureExtractor: () => x2, ParakeetFeatureExtractor: () => Wm, PyAnnoteFeatureExtractor: () => Ym, SeamlessM4TFeatureExtractor: () => M2, SnacFeatureExtractor: () => k2, SpeechT5FeatureExtractor: () => T2, VoxtralRealtimeFeatureExtractor: () => C2, Wav2Vec2FeatureExtractor: () => E2, WeSpeakerFeatureExtractor: () => A2, WhisperFeatureExtractor: () => S2 });
var e2 = () => {
}, t2 = { fromWeb: e2 }, r2 = () => {
}, n2 = r2;
async function Vm(e, t) {
  if (pe.IS_BROWSER_ENV) {
    if (pe.IS_WEBWORKER_ENV) throw new Error("Unable to save a file from a Web Worker.");
    let r = URL.createObjectURL(t), n = document.createElement("a");
    n.href = r, n.download = e, n.click(), n.remove(), URL.revokeObjectURL(r);
  } else if (pe.IS_FS_AVAILABLE) {
    let r = t.stream(), n = t2.fromWeb(r), a = Mt.createWriteStream(e);
    await n2(n, a);
  } else throw new Error("Unable to save because filesystem is disabled in this environment.");
}
async function a2(e, t) {
  if (typeof AudioContext > "u") throw Error("Unable to load audio from path/URL since `AudioContext` is not available in your environment. Instead, audio data should be passed directly to the pipeline/processor. For more information and some example code, see https://huggingface.co/docs/transformers.js/guides/node-audio-processing.");
  let r = await (await ua(e)).arrayBuffer(), n = new AudioContext({ sampleRate: t });
  typeof t > "u" && ce.warn(`No sampling rate provided, using default of ${n.sampleRate}Hz.`);
  let a = await n.decodeAudioData(r), s;
  if (a.numberOfChannels === 2) {
    let i = Math.sqrt(2), o = a.getChannelData(0), l = a.getChannelData(1);
    s = new Float32Array(o.length);
    for (let c = 0; c < a.length; ++c) s[c] = i * (o[c] + l[c]) / 2;
  } else s = a.getChannelData(0);
  return s;
}
async function s2(e, t) {
  return await a2(e, t);
}
function Um(e, t) {
  if (e < 1) return new Float64Array();
  if (e === 1) return new Float64Array([1]);
  let r = 1 - t, n = 2 * Math.PI / (e - 1), a = new Float64Array(e);
  for (let s = 0; s < e; ++s) a[s] = t - r * Math.cos(s * n);
  return a;
}
function xf(e) {
  return Um(e, 0.5);
}
function i2(e) {
  return Um(e, 0.54);
}
var o2 = { htk: (e) => 2595 * Math.log10(1 + e / 700), kaldi: (e) => 1127 * Math.log(1 + e / 700), slaney: (e, t = 1e3, r = 15, n = 27 / Math.log(6.4)) => e >= t ? r + Math.log(e / t) * n : 3 * e / 200 };
function Po(e, t = "htk") {
  let r = o2[t];
  if (!r) throw new Error('mel_scale should be one of "htk", "slaney" or "kaldi".');
  return typeof e == "number" ? r(e) : e.map((n) => r(n));
}
var l2 = { htk: (e) => 700 * (10 ** (e / 2595) - 1), kaldi: (e) => 700 * (Math.exp(e / 1127) - 1), slaney: (e, t = 1e3, r = 15, n = Math.log(6.4) / 27) => e >= r ? t * Math.exp(n * (e - r)) : 200 * e / 3 };
function c2(e, t = "htk") {
  let r = l2[t];
  if (!r) throw new Error('mel_scale should be one of "htk", "slaney" or "kaldi".');
  return typeof e == "number" ? r(e) : e.map((n) => r(n));
}
function u2(e, t) {
  let r = Float64Array.from({ length: t.length - 1 }, (i, o) => t[o + 1] - t[o]), n = Array.from({ length: e.length }, () => new Array(t.length));
  for (let i = 0; i < e.length; ++i) {
    let o = n[i];
    for (let l = 0; l < t.length; ++l) o[l] = t[l] - e[i];
  }
  let a = t.length - 2, s = Array.from({ length: a }, () => new Array(e.length));
  for (let i = 0; i < e.length; ++i) {
    let o = n[i];
    for (let l = 0; l < a; ++l) {
      let c = -o[l] / r[l], p = o[l + 2] / r[l + 1];
      s[l][i] = Math.max(0, Math.min(c, p));
    }
  }
  return s;
}
function Mf(e, t, r) {
  let n = (t - e) / (r - 1);
  return Float64Array.from({ length: r }, (a, s) => e + n * s);
}
function tr(e, t, r, n, a, s = null, i = "htk", o = !1) {
  if (s !== null && s !== "slaney") throw new Error('norm must be one of null or "slaney"');
  if (e < 2) throw new Error(`Require num_frequency_bins: ${e} >= 2`);
  if (r > n) throw new Error(`Require min_frequency: ${r} <= max_frequency: ${n}`);
  let l = Po(r, i), c = Po(n, i), p = Mf(l, c, t + 2), d = c2(p, i), _;
  if (o) {
    let w = a / ((e - 1) * 2);
    _ = Po(Float64Array.from({ length: e }, (y, b) => b * w), i), d = p;
  } else _ = Mf(0, Math.floor(a / 2), e);
  let f = u2(_, d);
  if (s !== null && s === "slaney") for (let w = 0; w < t; ++w) {
    let y = f[w], b = 2 / (d[w + 2] - d[w]);
    for (let x = 0; x < e; ++x) y[x] *= b;
  }
  return f;
}
function d2(e, t, r) {
  let n = new e.constructor(e.length + t + r), a = e.length - 1;
  for (let s = 0; s < e.length; ++s) n[t + s] = e[s];
  for (let s = 1; s <= t; ++s) n[t - s] = e[ms(s, a)];
  for (let s = 1; s <= r; ++s) n[a + t + s] = e[ms(a - s, a)];
  return n;
}
function qm(e, t, r, n, a) {
  if (r <= 0) throw new Error("reference must be greater than zero");
  if (n <= 0) throw new Error("min_value must be greater than zero");
  r = Math.max(n, r);
  let s = Math.log10(r);
  for (let i = 0; i < e.length; ++i) e[i] = t * Math.log10(Math.max(n, e[i]) - s);
  if (a !== null) {
    if (a <= 0) throw new Error("db_range must be greater than zero");
    let i = We(e)[0] - a;
    for (let o = 0; o < e.length; ++o) e[o] = Math.max(e[o], i);
  }
  return e;
}
function p2(e, t = 1, r = 1e-5, n = null) {
  return qm(e, 20, t, r, n);
}
function h2(e, t = 1, r = 1e-10, n = null) {
  return qm(e, 10, t, r, n);
}
async function ar(e, t, r, n, { fft_length: a = null, power: s = 1, center: i = !0, pad_mode: o = "reflect", onesided: l = !0, preemphasis: c = null, preemphasis_htk_flavor: p = !0, mel_filters: d = null, mel_floor: _ = 1e-10, log_mel: f = null, max_log_mel: w = null, reference: y = 1, min_value: b = 1e-10, db_range: x = null, remove_dc_offset: T = null, min_num_frames: A = null, max_num_frames: E = null, do_pad: S = !0, transpose: O = !1, mel_offset: M = 0, mel_floor_mode: G = "clamp" } = {}) {
  let D = t.length;
  if (a === null && (a = r), r > a) throw Error(`frame_length (${r}) may not be larger than fft_length (${a})`);
  if (D !== r) throw new Error(`Length of the window (${D}) must equal frame_length (${r})`);
  if (n <= 0) throw new Error("hop_length must be greater than zero");
  if (s === null && d !== null) throw new Error("You have provided `mel_filters` but `power` is `None`. Mel spectrogram computation is not yet supported for complex-valued spectrogram. Specify `power` to fix this issue.");
  if (!p) throw new Error("`preemphasis_htk_flavor=false` is not currently supported.");
  if (i) {
    let N = Math.floor(r / 2);
    switch (o) {
      case "reflect": {
        e = d2(e, N, N);
        break;
      }
      case "constant": {
        let R = new e.constructor(e.length + 2 * N);
        R.set(e, N), e = R;
        break;
      }
      case "semicausal": {
        let R = new e.constructor(e.length + N);
        R.set(e, N), e = R;
        break;
      }
      default:
        throw new Error(`pad_mode="${o}" not implemented yet.`);
    }
  }
  let U = Math.floor(1 + Math.floor((e.length - r) / n));
  A !== null && U < A && (U = A);
  let q = l ? Math.floor(a / 2) + 1 : a, H = U, Q = U;
  E !== null && (E > U ? S && (Q = E) : Q = H = E);
  let $ = new OT(a), C = new Float64Array(a), ae = new Float64Array($.outputBufferSize), ge = new Float32Array(q * Q);
  for (let N = 0; N < H; ++N) {
    let R = N * n, K = Math.min(e.length - R, r);
    K !== r && C.fill(0, 0, r);
    for (let le = 0; le < K; ++le) C[le] = e[R + le];
    if (T) {
      let le = 0;
      for (let Me = 0; Me < K; ++Me) le += C[Me];
      let je = le / K;
      for (let Me = 0; Me < K; ++Me) C[Me] -= je;
    }
    if (c !== null) {
      for (let le = K - 1; le >= 1; --le) C[le] -= c * C[le - 1];
      C[0] *= 1 - c;
    }
    for (let le = 0; le < t.length; ++le) C[le] *= t[le];
    $.realTransform(ae, C);
    for (let le = 0; le < q; ++le) {
      let je = le << 1;
      ge[le * Q + N] = ae[je] ** 2 + ae[je + 1] ** 2;
    }
  }
  if (s !== null && s !== 2) {
    let N = s / 2;
    for (let R = 0; R < ge.length; ++R) ge[R] **= N;
  }
  let J = d.length, oe = await JT(new V("float32", d.flat(), [J, q]), new V("float32", ge, [q, Q]));
  O && (oe = oe.transpose(1, 0));
  let L = oe.data;
  if (G === "add") for (let N = 0; N < L.length; ++N) L[N] = M + L[N] + _;
  else for (let N = 0; N < L.length; ++N) L[N] = M + Math.max(_, L[N]);
  if (s !== null && f !== null) {
    let N = Math.min(L.length, H * J);
    switch (f) {
      case "log":
        for (let R = 0; R < N; ++R) L[R] = Math.log(L[R]);
        break;
      case "log10":
        for (let R = 0; R < N; ++R) L[R] = Math.log10(L[R]);
        break;
      case "log10_max_norm": {
        for (let K = 0; K < N; ++K) L[K] = Math.log10(L[K]);
        let R = (w ?? We(L)[0]) - 8;
        for (let K = 0; K < N; ++K) L[K] = (Math.max(L[K], R) + 4) / 4;
        break;
      }
      case "dB":
        if (s === 1) p2(L, y, b, x);
        else if (s === 2) h2(L, y, b, x);
        else throw new Error(`Cannot use log_mel option '${f}' with power ${s}`);
        break;
      default:
        throw new Error(`log_mel must be one of null, 'log', 'log10', 'log10_max_norm', or 'dB'. Got '${f}'`);
    }
  }
  return oe;
}
function mr(e, t, { periodic: r = !0, frame_length: n = null, center: a = !0 } = {}) {
  let s = r ? e + 1 : e, i;
  switch (t) {
    case "boxcar":
      i = new Float64Array(s).fill(1);
      break;
    case "hann":
    case "hann_window":
      i = xf(s);
      break;
    case "hamming":
      i = i2(s);
      break;
    case "povey":
      i = xf(s).map((c) => Math.pow(c, 0.85));
      break;
    default:
      throw new Error(`Unknown window type ${t}.`);
  }
  if (r && (i = i.subarray(0, e)), n === null || e === n) return i;
  if (e > n) throw new Error(`Length of the window (${e}) may not be larger than frame_length (${n})`);
  let o = new Float64Array(n), l = a ? Math.floor((n - e) / 2) : 0;
  return o.set(i, l), o;
}
function _2(e, t) {
  let r = e.reduce((s, i) => s + i.length, 0), n = new ArrayBuffer(44), a = new DataView(n);
  return ss(a, 0, "RIFF"), a.setUint32(4, 36 + r * 4, !0), ss(a, 8, "WAVE"), ss(a, 12, "fmt "), a.setUint32(16, 16, !0), a.setUint16(20, 3, !0), a.setUint16(22, 1, !0), a.setUint32(24, t, !0), a.setUint32(28, t * 4, !0), a.setUint16(32, 4, !0), a.setUint16(34, 32, !0), ss(a, 36, "data"), a.setUint32(40, r * 4, !0), new Blob([n, ...e.map((s) => s.buffer instanceof ArrayBuffer ? new Uint8Array(s.buffer, s.byteOffset, s.byteLength) : s.slice())], { type: "audio/wav" });
}
function ss(e, t, r) {
  for (let n = 0; n < r.length; ++n) e.setUint8(t + n, r.charCodeAt(n));
}
var f2 = class {
  constructor(e, t) {
    this.audio = e, this.sampling_rate = t;
  }
  get data() {
    if (Array.isArray(this.audio)) {
      if (this.audio.length === 0) return new Float32Array(0);
      if (this.audio.length === 1) return this.audio[0];
      let e = this.audio.reduce((n, a) => n + a.length, 0), t = new Float32Array(e), r = 0;
      for (let n of this.audio) t.set(n, r), r += n.length;
      return t;
    } else return this.audio;
  }
  toBlob() {
    let e = this.audio;
    return e instanceof Float32Array && (e = [e]), _2(e, this.sampling_rate);
  }
  async save(e) {
    return Vm(e, this.toBlob());
  }
}, m2 = class extends dt {
  constructor(e) {
    super(e);
    let t = this.config.sampling_rate, r = tr(257, this.config.num_mel_bins, 20, Math.floor(t / 2), t, null, "kaldi", !0);
    this.mel_filters = r, this.window = mr(400, "hann", { periodic: !1 }), this.mean = this.config.mean, this.std = this.config.std;
  }
  async _extract_fbank_features(e, t) {
    return ar(e, this.window, 400, 160, { fft_length: 512, power: 2, center: !1, preemphasis: 0.97, mel_filters: this.mel_filters, log_mel: "log", mel_floor: 1192092955078125e-22, remove_dc_offset: !0, max_num_frames: t, transpose: !0 });
  }
  async _call(e) {
    it(e, "ASTFeatureExtractor");
    let t = await this._extract_fbank_features(e, this.config.max_length);
    if (this.config.do_normalize) {
      let r = this.std * 2, n = t.data;
      for (let a = 0; a < n.length; ++a) n[a] = (n[a] - this.mean) / r;
    }
    return { input_values: t.unsqueeze_(0) };
  }
}, jm = class extends dt {
  async _call(e) {
    it(e, "EncodecFeatureExtractor"), e instanceof Float64Array && (e = new Float32Array(e));
    let t = this.config.feature_size;
    if (e.length % t !== 0) throw new Error(`The length of the audio data must be a multiple of the number of channels (${t}).`);
    let r = [1, t, e.length / t];
    return { input_values: new V("float32", e, r) };
  }
}, g2 = class extends dt {
  async _call(e) {
    it(e, "ChatterboxFeatureExtractor"), e instanceof Float64Array && (e = new Float32Array(e));
    let t = [1, e.length];
    return { input_values: new V("float32", e, t) };
  }
}, w2 = class extends dt {
  constructor(e) {
    super(e), this.mel_filters = tr(this.config.nb_frequency_bins, this.config.feature_size, this.config.frequency_min, this.config.frequency_max, this.config.sampling_rate, null, "htk"), this.mel_filters_slaney = tr(this.config.nb_frequency_bins, this.config.feature_size, this.config.frequency_min, this.config.frequency_max, this.config.sampling_rate, "slaney", "slaney"), this.window = mr(this.config.fft_window_size, "hann");
  }
  async _get_input_mel(e, t, r, n) {
    let a, s = !1, i = e.length - t;
    if (i > 0) if (r === "rand_trunc") {
      s = !0;
      let o = Math.floor(Ls.random() * (i + 1));
      e = e.subarray(o, o + t), a = await this._extract_fbank_features(e, this.mel_filters_slaney, this.config.nb_max_samples);
    } else throw new Error(`Truncation strategy "${r}" not implemented`);
    else {
      if (i < 0) {
        let o = new Float64Array(t);
        if (o.set(e), n === "repeat") for (let l = e.length; l < t; l += e.length) o.set(e.subarray(0, Math.min(e.length, t - l)), l);
        else if (n === "repeatpad") for (let l = e.length; l < -i; l += e.length) o.set(e, l);
        e = o;
      }
      if (r === "fusion") throw new Error(`Truncation strategy "${r}" not implemented`);
      a = await this._extract_fbank_features(e, this.mel_filters_slaney, this.config.nb_max_samples);
    }
    return a.unsqueeze_(0);
  }
  async _extract_fbank_features(e, t, r = null) {
    return ar(e, this.window, this.config.fft_window_size, this.config.hop_length, { power: 2, mel_filters: t, log_mel: "dB", max_num_frames: r, do_pad: !1, transpose: !0 });
  }
  async _call(e, { max_length: t = null } = {}) {
    return it(e, "ClapFeatureExtractor"), { input_features: (await this._get_input_mel(e, t ?? this.config.nb_max_samples, this.config.truncation, this.config.padding)).unsqueeze_(0) };
  }
}, y2 = 1e-5, Wm = class extends dt {
  constructor(e) {
    super(e), this.config.mel_filters ??= tr(Math.floor(1 + this.config.n_fft / 2), this.config.feature_size, 0, this.config.sampling_rate / 2, this.config.sampling_rate, "slaney", "slaney");
    let t = mr(this.config.win_length, "hann", { periodic: !1 });
    this.window = new Float64Array(this.config.n_fft);
    let r = Math.floor((this.config.n_fft - this.config.win_length) / 2);
    this.window.set(t, r);
  }
  async _extract_fbank_features(e) {
    let t = this.config.preemphasis;
    e = new Float64Array(e);
    for (let r = e.length - 1; r >= 1; --r) e[r] -= t * e[r - 1];
    return await ar(e, this.window, this.window.length, this.config.hop_length, { fft_length: this.config.n_fft, power: 2, mel_filters: this.config.mel_filters, log_mel: "log", mel_floor: -1 / 0, pad_mode: "constant", center: !0, transpose: !0, mel_offset: 2 ** -24 });
  }
  async _call(e) {
    it(e, "ParakeetFeatureExtractor");
    let t = await this._extract_fbank_features(e), r = Math.floor((e.length + Math.floor(this.config.n_fft / 2) * 2 - this.config.n_fft) / this.config.hop_length), n = t.data;
    n.fill(0, r * t.dims[1]);
    let [a, s] = t.dims, i = new Float64Array(s), o = new Float64Array(s);
    for (let p = 0; p < r; ++p) {
      let d = p * s;
      for (let _ = 0; _ < s; ++_) {
        let f = n[d + _];
        i[_] += f, o[_] += f * f;
      }
    }
    let l = r > 1 ? r - 1 : 1;
    for (let p = 0; p < s; ++p) {
      let d = i[p] / r, _ = (o[p] - r * d * d) / l, f = 1 / (Math.sqrt(_) + y2);
      for (let w = 0; w < r; ++w) {
        let y = w * s + p;
        n[y] = (n[y] - d) * f;
      }
    }
    let c = new BigInt64Array(a);
    return c.fill(1n, 0, r), { input_features: t.unsqueeze_(0), attention_mask: new V("int64", c, [1, a]) };
  }
}, b2 = class extends Wm {
  _apply_dither(e) {
    let t = this.config.dither ?? 0;
    if (t <= 0) return e;
    let r = new Is(e.length);
    for (let n = 0; n < e.length; ++n) e[n] += t * r.gauss();
    return e;
  }
  split_audio(e) {
    let t = this.config.max_audio_clip_s ?? 35, r = this.config.overlap_chunk_second ?? 5, n = this.config.min_energy_window_samples ?? 1600, a = this.config.sampling_rate, s = Math.max(1, Math.round(t * a)), i = Math.max(1, Math.round(r * a));
    if (e.length <= s) return [e];
    let o = [], l = 0, c = e.length;
    for (; l < c; ) {
      if (l + s >= c) {
        o.push(e.slice(l, c));
        break;
      }
      let p = Math.max(l, l + s - i), d = Math.min(l + s, c), _;
      d <= p ? _ = l + s : _ = this._find_split_point_energy(e, p, d, n), _ = Math.max(l + 1, Math.min(_, c)), o.push(e.slice(l, _)), l = _;
    }
    return o;
  }
  _find_split_point_energy(e, t, r, n) {
    let a = r - t;
    if (a <= n) return Math.floor((t + r) / 2);
    let s = 1 / 0, i = t, o = a - n;
    for (let l = 0; l <= o; l += n) {
      let c = 0;
      for (let p = 0; p < n; ++p) {
        let d = e[t + l + p];
        c += d * d;
      }
      c = Math.sqrt(c / n), c < s && (s = c, i = t + l);
    }
    return i;
  }
  async _call(e) {
    it(e, "CohereAsrFeatureExtractor");
    let t = new Float64Array(e);
    return this._apply_dither(t), super._call(t);
  }
}, Hm = class extends jm {
}, Qm = class extends dt {
  constructor(e) {
    super(e);
    let { fft_length: t, feature_size: r, min_frequency: n, max_frequency: a, sampling_rate: s, frame_length: i } = this.config, o = tr(Math.floor(1 + t / 2), r, n, a, s, null, "htk", !1);
    this.mel_filters = o, this.window = mr(i, "hann");
  }
  async _extract_fbank_features(e, t) {
    return ar(e, this.window, this.config.frame_length, this.config.hop_length, { fft_length: this.config.fft_length, center: !1, onesided: !0, preemphasis: this.config.preemphasis, preemphasis_htk_flavor: this.config.preemphasis_htk_flavor, mel_filters: this.mel_filters, log_mel: "log", mel_floor: this.config.mel_floor, remove_dc_offset: !1, transpose: !0 });
  }
  async _call(e, { max_length: t = 48e4, truncation: r = !0, padding: n = !0, pad_to_multiple_of: a = 128 } = {}) {
    if (it(e, "Gemma3nAudioFeatureExtractor"), r && e.length > t && (e = e.slice(0, t)), n && e.length % a !== 0) {
      let o = a - e.length % a, l = new Float64Array(e.length + o);
      l.set(e), this.config.padding_value !== 0 && l.fill(this.config.padding_value, e.length), e = l;
    }
    let s = await this._extract_fbank_features(e, this.config.max_length), i = ut([1, s.dims[0]], !0);
    return { input_features: s.unsqueeze_(0), input_features_mask: i };
  }
}, Xm = class extends Qm {
  async _extract_fbank_features(e, t) {
    let { frame_length: r, hop_length: n, fft_length: a } = this.config, s = Math.floor(r / 2), i = Math.floor((e.length + s - (r + 1)) / n) + 1;
    return ar(e, this.window, r, n, { fft_length: a, center: !0, pad_mode: "semicausal", onesided: !0, preemphasis: this.config.preemphasis, preemphasis_htk_flavor: this.config.preemphasis_htk_flavor, mel_filters: this.mel_filters, log_mel: "log", mel_floor: this.config.mel_floor, mel_floor_mode: "add", remove_dc_offset: !1, transpose: !0, max_num_frames: i });
  }
  async _call(e, t = {}) {
    it(e, "Gemma4AudioFeatureExtractor");
    let r = e.length, n = await super._call(e, t), { input_features: a } = n, [, s, i] = a.dims, { frame_length: o, hop_length: l } = this.config, c = Math.floor(o / 2), p = o + 1, d = new Uint8Array(r + c + (t.pad_to_multiple_of ?? 128));
    d.fill(1, c, c + r);
    let _ = new Uint8Array(s);
    for (let w = 0; w < s; ++w) _[w] = d[w * l + p - 1] ? 1 : 0;
    let f = a.data;
    for (let w = 0; w < s; ++w) _[w] || f.fill(0, w * i, (w + 1) * i);
    return n.input_features_mask = new V("bool", _, [1, s]), n;
  }
}, v2 = class extends dt {
  constructor(e) {
    super(e);
    let { n_fft: t, win_length: r, n_mels: n, sample_rate: a } = e.melspec_kwargs;
    this.mel_filters = tr(Math.floor(1 + t / 2), n, 0, a / 2, a, null, "htk");
    let s = mr(r, "hann");
    this.window = new Float64Array(t);
    let i = Math.floor((t - r) / 2);
    this.window.set(s, i);
  }
  async _call(e) {
    it(e, "GraniteSpeechFeatureExtractor");
    let { n_fft: t, hop_length: r, n_mels: n } = this.config.melspec_kwargs, a = Math.floor(e.length / r) + 1, s = a - a % 2;
    return { input_features: (await ar(e, this.window, t, r, { power: 2, mel_filters: this.mel_filters, log_mel: "log10_max_norm", transpose: !0, max_num_frames: s, do_pad: !1 })).view(-1, 2 * n).unsqueeze_(0) };
  }
}, x2 = class extends dt {
  async _call(e) {
    it(e, "MoonshineFeatureExtractor"), e instanceof Float64Array && (e = new Float32Array(e));
    let t = [1, e.length];
    return { input_values: new V("float32", e, t) };
  }
}, Ym = class extends dt {
  async _call(e) {
    it(e, "PyAnnoteFeatureExtractor"), e instanceof Float64Array && (e = new Float32Array(e));
    let t = [1, 1, e.length];
    return { input_values: new V("float32", e, t) };
  }
  samples_to_frames(e) {
    return (e - this.config.offset) / this.config.step;
  }
  post_process_speaker_diarization(e, t) {
    let r = t / this.samples_to_frames(t) / this.config.sampling_rate, n = [];
    for (let a of e.tolist()) {
      let s = [], i = -1;
      for (let o = 0; o < a.length; ++o) {
        let l = st(a[o]), [c, p] = We(l), [d, _] = [o, o + 1];
        p !== i ? (i = p, s.push({ id: p, start: d, end: _, score: c })) : (s.at(-1).end = _, s.at(-1).score += c);
      }
      n.push(s.map(({ id: o, start: l, end: c, score: p }) => ({ id: o, start: l * r, end: c * r, confidence: p / (c - l) })));
    }
    return n;
  }
}, M2 = class extends dt {
  constructor(e) {
    super(e);
    let t = this.config.sampling_rate, r = tr(257, this.config.num_mel_bins, 20, Math.floor(t / 2), t, null, "kaldi", !0);
    this.mel_filters = r, this.window = mr(400, "povey", { periodic: !1 });
  }
  async _extract_fbank_features(e, t) {
    return e = e.map((r) => r * 32768), ar(e, this.window, 400, 160, { fft_length: 512, power: 2, center: !1, preemphasis: 0.97, mel_filters: this.mel_filters, log_mel: "log", mel_floor: 1192092955078125e-22, remove_dc_offset: !0, max_num_frames: t, transpose: !0 });
  }
  async _call(e, { padding: t = !0, pad_to_multiple_of: r = 2, do_normalize_per_mel_bins: n = !0, return_attention_mask: a = !0 } = {}) {
    it(e, "SeamlessM4TFeatureExtractor");
    let s = await this._extract_fbank_features(e, this.config.max_length);
    if (n) {
      let [_, f] = s.dims, w = s.data;
      for (let y = 0; y < f; ++y) {
        let b = 0;
        for (let E = 0; E < _; ++E) b += w[E * f + y];
        let x = b / _, T = 0;
        for (let E = 0; E < _; ++E) T += (w[E * f + y] - x) ** 2;
        T /= _ - 1;
        let A = Math.sqrt(T + 1e-7);
        for (let E = 0; E < _; ++E) {
          let S = E * f + y;
          w[S] = (w[S] - x) / A;
        }
      }
    }
    let i;
    if (t) {
      let [_, f] = s.dims, w = s.data, y = _ % r;
      if (y > 0) {
        let b = new Float32Array(f * (_ + y));
        b.set(w), b.fill(this.config.padding_value, w.length);
        let x = _ + y;
        s = new V(s.type, b, [x, f]), a && (i = new V("int64", new BigInt64Array(x), [1, x]), i.data.fill(1n, 0, _));
      }
    }
    let [o, l] = s.dims, c = this.config.stride;
    if (o % c !== 0) throw new Error(`The number of frames (${o}) must be a multiple of the stride (${c}).`);
    let p = s.view(1, Math.floor(o / c), l * c), d = { input_features: p };
    if (a) {
      let _ = p.dims[1], f = new BigInt64Array(_);
      if (i) {
        let w = i.data;
        for (let y = 1, b = 0; y < o; y += c, ++b) f[b] = w[y];
      } else f.fill(1n);
      d.attention_mask = new V("int64", f, [1, _]);
    }
    return d;
  }
}, k2 = class extends Hm {
}, T2 = class extends dt {
}, E2 = class extends dt {
  _zero_mean_unit_var_norm(e) {
    let t = e.reduce((n, a) => n + a, 0) / e.length, r = e.reduce((n, a) => n + (a - t) ** 2, 0) / e.length;
    return e.map((n) => (n - t) / Math.sqrt(r + 1e-7));
  }
  async _call(e) {
    it(e, "Wav2Vec2FeatureExtractor"), e instanceof Float64Array && (e = new Float32Array(e));
    let t = e;
    this.config.do_normalize && (t = this._zero_mean_unit_var_norm(t));
    let r = [1, t.length];
    return { input_values: new V("float32", t, r), attention_mask: new V("int64", new BigInt64Array(t.length).fill(1n), r) };
  }
}, A2 = class extends dt {
  constructor(e) {
    super(e);
    let t = this.config.sampling_rate, r = tr(257, this.config.num_mel_bins, 20, Math.floor(t / 2), t, null, "kaldi", !0);
    this.mel_filters = r, this.window = mr(400, "hamming", { periodic: !1 }), this.min_num_frames = this.config.min_num_frames;
  }
  async _extract_fbank_features(e) {
    return e = e.map((t) => t * 32768), ar(e, this.window, 400, 160, { fft_length: 512, power: 2, center: !1, preemphasis: 0.97, mel_filters: this.mel_filters, log_mel: "log", mel_floor: 1192092955078125e-22, remove_dc_offset: !0, transpose: !0, min_num_frames: this.min_num_frames });
  }
  async _call(e) {
    it(e, "WeSpeakerFeatureExtractor");
    let t = (await this._extract_fbank_features(e)).unsqueeze_(0);
    if (this.config.fbank_centering_span === null) {
      let r = t.mean(1).data, n = t.data, [a, s, i] = t.dims;
      for (let o = 0; o < a; ++o) {
        let l = o * s * i, c = o * i;
        for (let p = 0; p < s; ++p) {
          let d = l + p * i;
          for (let _ = 0; _ < i; ++_) n[d + _] -= r[c + _];
        }
      }
    }
    return { input_features: t };
  }
}, C2 = class extends dt {
  constructor(e) {
    super(e), this.config.mel_filters ??= tr(Math.floor(1 + this.config.n_fft / 2), this.config.feature_size, 0, 8e3, this.config.sampling_rate, "slaney", "slaney"), this.window = mr(this.config.n_fft, "hann");
  }
  async _extract_fbank_features(e, { center: t = !0 } = {}) {
    let { n_fft: r, hop_length: n, mel_filters: a, global_log_mel_max: s } = this.config, i = Math.floor(t ? e.length / n : (e.length - r) / n);
    return await ar(e, this.window, r, n, { power: 2, mel_filters: a, log_mel: "log10_max_norm", max_log_mel: s, center: t, max_num_frames: i, do_pad: !1 });
  }
  async _call(e, { center: t = !0 } = {}) {
    return it(e, "VoxtralRealtimeFeatureExtractor"), { input_features: (await this._extract_fbank_features(e, { center: t })).unsqueeze_(0) };
  }
}, S2 = class extends dt {
  constructor(e) {
    super(e), this.config.mel_filters ??= tr(Math.floor(1 + this.config.n_fft / 2), this.config.feature_size, 0, 8e3, this.config.sampling_rate, "slaney", "slaney"), this.window = mr(this.config.n_fft, "hann");
  }
  async _extract_fbank_features(e) {
    return await ar(e, this.window, this.config.n_fft, this.config.hop_length, { power: 2, mel_filters: this.config.mel_filters, log_mel: "log10_max_norm", max_num_frames: Math.min(Math.floor(e.length / this.config.hop_length), this.config.nb_max_frames) });
  }
  async _call(e, { max_length: t = null } = {}) {
    it(e, "WhisperFeatureExtractor");
    let r, n = t ?? this.config.n_samples;
    return e.length > n ? (e.length > this.config.n_samples && ce.warn("Attempting to extract features for audio longer than 30 seconds. If using a pipeline to extract transcript from a long audio clip, remember to specify `chunk_length_s` and/or `stride_length_s`."), r = e.slice(0, n)) : (r = new Float32Array(n), r.set(e)), { input_features: (await this._extract_fbank_features(r)).unsqueeze_(0) };
  }
}, Ft = class {
  static async from_pretrained(e, t = {}) {
    let r = await nr(e, Dm, !0, t), n = r.feature_extractor_type, a = ml[n];
    if (!a) throw new Error(`Unknown feature_extractor_type: '${n}'. Please report this at ${Os}.`);
    return new a(r);
  }
}, P2 = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  async _call(e, t = null) {
    let r = this.tokenizer(e), n = t ? await this.feature_extractor(t) : {};
    return { ...r, ...n };
  }
}, F2 = /* @__PURE__ */ new Set(["ja", "zh"]), I2 = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  static uses_processor_config = !0;
  get_decoder_prompt_ids(e = "en") {
    let t = ["\u2581", "<|startofcontext|>", "<|startoftranscript|>", "<|emo:undefined|>", `<|${e}|>`, `<|${e}|>`, "<|pnc|>", "<|noitn|>", "<|notimestamp|>", "<|nodiarize|>"];
    return this.tokenizer.convert_tokens_to_ids(t);
  }
  static join_chunks(e, t = "en") {
    let r = e.filter((a) => a && a.trim());
    if (r.length === 0) return "";
    let n = F2.has(t) ? "" : " ";
    return [r[0].trimEnd(), ...r.slice(1).map((a) => a.trim())].join(n);
  }
  async _call(e) {
    return await this.feature_extractor(e);
  }
}, jo = {}, en, Jm, Cr;
if (pe.IS_WEB_ENV) en = (e, t) => {
  if (!self.OffscreenCanvas) throw new Error("OffscreenCanvas not supported by this environment.");
  return new self.OffscreenCanvas(e, t);
}, Cr = self.createImageBitmap, Jm = self.ImageData;
else if (jo) Cr = async (e) => {
  let t = (await e.metadata()).channels, { data: r, info: n } = await e.rotate().raw().toBuffer({ resolveWithObject: !0 }), a = new kt(new Uint8ClampedArray(r), n.width, n.height, n.channels);
  return t !== void 0 && t !== n.channels && a.convert(t), a;
};
else throw new Error("Unable to load image processing library.");
var L2 = { 0: "nearest", 1: "lanczos", 2: "bilinear", 3: "bicubic", 4: "box", 5: "hamming" }, O2 = /* @__PURE__ */ new Map([["png", "image/png"], ["jpg", "image/jpeg"], ["jpeg", "image/jpeg"], ["gif", "image/gif"]]), kt = class Zt {
  constructor(t, r, n, a) {
    this.data = t, this.width = r, this.height = n, this.channels = a;
  }
  get size() {
    return [this.width, this.height];
  }
  static async read(t) {
    if (t instanceof Zt) return t;
    if (typeof t == "string" || t instanceof URL) return await this.fromURL(t);
    if (t instanceof Blob) return await this.fromBlob(t);
    if (typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof OffscreenCanvas < "u" && t instanceof OffscreenCanvas) return this.fromCanvas(t);
    throw new Error(`Unsupported input type: ${typeof t}`);
  }
  static fromCanvas(t) {
    if (!pe.IS_WEB_ENV) throw new Error("fromCanvas() is only supported in browser environments.");
    let r = t.getContext("2d").getImageData(0, 0, t.width, t.height).data;
    return new Zt(r, t.width, t.height, 4);
  }
  static async fromURL(t) {
    let r = await ua(t);
    if (r.status !== 200) throw new Error(`Unable to read image from "${t}" (${r.status} ${r.statusText})`);
    let n = await r.blob();
    return this.fromBlob(n);
  }
  static async fromBlob(t) {
    if (pe.IS_WEB_ENV) {
      let r = await Cr(t), n = en(r.width, r.height).getContext("2d");
      return n.drawImage(r, 0, 0), new this(n.getImageData(0, 0, r.width, r.height).data, r.width, r.height, 4);
    } else {
      let r = jo(await t.arrayBuffer());
      return await Cr(r);
    }
  }
  static fromTensor(t, r = "CHW") {
    if (t.dims.length !== 3) throw new Error(`Tensor should have 3 dimensions, but has ${t.dims.length} dimensions.`);
    if (r === "CHW") t = t.permute(1, 2, 0);
    else if (r !== "HWC") throw new Error(`Unsupported channel format: ${r}`);
    if (!(t.data instanceof Uint8ClampedArray || t.data instanceof Uint8Array)) throw new Error(`Unsupported tensor type: ${t.type}`);
    switch (t.dims[2]) {
      case 1:
      case 2:
      case 3:
      case 4:
        return new Zt(t.data, t.dims[1], t.dims[0], t.dims[2]);
      default:
        throw new Error(`Unsupported number of channels: ${t.dims[2]}`);
    }
  }
  grayscale() {
    if (this.channels === 1) return this;
    let t = new Uint8ClampedArray(this.width * this.height * 1);
    switch (this.channels) {
      case 3:
      case 4:
        for (let r = 0, n = 0; r < this.data.length; r += this.channels) {
          let a = this.data[r], s = this.data[r + 1], i = this.data[r + 2];
          t[n++] = Math.round(0.2989 * a + 0.587 * s + 0.114 * i);
        }
        break;
      default:
        throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
    }
    return this._update(t, this.width, this.height, 1);
  }
  rgb() {
    if (this.channels === 3) return this;
    let t = new Uint8ClampedArray(this.width * this.height * 3);
    switch (this.channels) {
      case 1:
        for (let r = 0, n = 0; r < this.data.length; ++r) t[n++] = this.data[r], t[n++] = this.data[r], t[n++] = this.data[r];
        break;
      case 4:
        for (let r = 0, n = 0; r < this.data.length; r += 4) t[n++] = this.data[r], t[n++] = this.data[r + 1], t[n++] = this.data[r + 2];
        break;
      default:
        throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
    }
    return this._update(t, this.width, this.height, 3);
  }
  rgba() {
    if (this.channels === 4) return this;
    let t = new Uint8ClampedArray(this.width * this.height * 4);
    switch (this.channels) {
      case 1:
        for (let r = 0, n = 0; r < this.data.length; ++r) t[n++] = this.data[r], t[n++] = this.data[r], t[n++] = this.data[r], t[n++] = 255;
        break;
      case 3:
        for (let r = 0, n = 0; r < this.data.length; r += 3) t[n++] = this.data[r], t[n++] = this.data[r + 1], t[n++] = this.data[r + 2], t[n++] = 255;
        break;
      default:
        throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
    }
    return this._update(t, this.width, this.height, 4);
  }
  putAlpha(t) {
    if (t.width !== this.width || t.height !== this.height) throw new Error(`Expected mask size to be ${this.width}x${this.height}, but got ${t.width}x${t.height}`);
    if (t.channels !== 1) throw new Error(`Expected mask to have 1 channel, but got ${t.channels}`);
    let r = this.data, n = t.data, a = this.width * this.height;
    if (this.channels === 3) {
      let s = new Uint8ClampedArray(a * 4);
      for (let i = 0, o = 0, l = 0; i < a; ++i) s[l++] = r[o++], s[l++] = r[o++], s[l++] = r[o++], s[l++] = n[i];
      return this._update(s, this.width, this.height, 4);
    } else if (this.channels === 4) {
      for (let s = 0; s < a; ++s) r[4 * s + 3] = n[s];
      return this;
    }
    throw new Error(`Expected image to have 3 or 4 channels, but got ${this.channels}`);
  }
  async resize(t, r, { resample: n = 2 } = {}) {
    if (this.width === t && this.height === r) return this;
    let a = L2[n] ?? n, s = N_(t), i = N_(r);
    if (s && i) return this;
    if (s ? t = r / this.height * this.width : i && (r = t / this.width * this.height), pe.IS_WEB_ENV) {
      let o = this.channels, l = this.toCanvas(), c = en(t, r).getContext("2d");
      return c.drawImage(l, 0, 0, t, r), new Zt(c.getImageData(0, 0, t, r).data, t, r, 4).convert(o);
    } else {
      let o = this.toSharp();
      switch (a) {
        case "box":
        case "hamming":
          (a === "box" || a === "hamming") && (ce.warn(`Resampling method ${a} is not yet supported. Using bilinear instead.`), a = "bilinear");
        case "nearest":
        case "bilinear":
        case "bicubic":
          o = o.affine([t / this.width, 0, 0, r / this.height], { interpolator: a });
          break;
        case "lanczos":
          o = o.resize({ width: t, height: r, fit: "fill", kernel: "lanczos3" });
          break;
        default:
          throw new Error(`Resampling method ${a} is not supported.`);
      }
      return await Cr(o);
    }
  }
  async pad([t, r, n, a]) {
    if (t = Math.max(t, 0), r = Math.max(r, 0), n = Math.max(n, 0), a = Math.max(a, 0), t === 0 && r === 0 && n === 0 && a === 0) return this;
    if (pe.IS_WEB_ENV) {
      let s = this.channels, i = this.toCanvas(), o = this.width + t + r, l = this.height + n + a, c = en(o, l).getContext("2d");
      return c.drawImage(i, 0, 0, this.width, this.height, t, n, this.width, this.height), new Zt(c.getImageData(0, 0, o, l).data, o, l, 4).convert(s);
    } else {
      let s = this.toSharp().extend({ left: t, right: r, top: n, bottom: a });
      return await Cr(s);
    }
  }
  async crop([t, r, n, a]) {
    if (t = Math.max(t, 0), r = Math.max(r, 0), n = Math.min(n, this.width - 1), a = Math.min(a, this.height - 1), t === 0 && r === 0 && n === this.width - 1 && a === this.height - 1) return this;
    let s = n - t + 1, i = a - r + 1;
    if (pe.IS_WEB_ENV) {
      let o = this.channels, l = this.toCanvas(), c = en(s, i).getContext("2d");
      return c.drawImage(l, t, r, s, i, 0, 0, s, i), new Zt(c.getImageData(0, 0, s, i).data, s, i, 4).convert(o);
    } else {
      let o = this.toSharp().extract({ left: t, top: r, width: s, height: i });
      return await Cr(o);
    }
  }
  async center_crop(t, r) {
    if (this.width === t && this.height === r) return this;
    let n = (this.width - t) / 2, a = (this.height - r) / 2;
    if (pe.IS_WEB_ENV) {
      let s = this.channels, i = this.toCanvas(), o = en(t, r).getContext("2d"), l = 0, c = 0, p = 0, d = 0;
      return n >= 0 ? l = n : p = -n, a >= 0 ? c = a : d = -a, o.drawImage(i, l, c, t, r, p, d, t, r), new Zt(o.getImageData(0, 0, t, r).data, t, r, 4).convert(s);
    } else {
      let s = this.toSharp();
      if (n >= 0 && a >= 0) s = s.extract({ left: Math.floor(n), top: Math.floor(a), width: t, height: r });
      else if (n <= 0 && a <= 0) {
        let i = Math.floor(-a), o = Math.floor(-n);
        s = s.extend({ top: i, left: o, right: t - this.width - o, bottom: r - this.height - i });
      } else {
        let i = [0, 0], o = 0;
        a < 0 ? (i[0] = Math.floor(-a), i[1] = r - this.height - i[0]) : o = Math.floor(a);
        let l = [0, 0], c = 0;
        n < 0 ? (l[0] = Math.floor(-n), l[1] = t - this.width - l[0]) : c = Math.floor(n), s = s.extend({ top: i[0], bottom: i[1], left: l[0], right: l[1] }).extract({ left: c, top: o, width: t, height: r });
      }
      return await Cr(s);
    }
  }
  async toBlob(t = "image/png", r = 1) {
    if (!pe.IS_WEB_ENV) throw new Error("toBlob() is only supported in browser environments.");
    return await this.toCanvas().convertToBlob({ type: t, quality: r });
  }
  toTensor(t = "CHW") {
    let r = new V("uint8", new Uint8Array(this.data), [this.height, this.width, this.channels]);
    if (t !== "HWC") if (t === "CHW") r = r.permute(2, 0, 1);
    else throw new Error(`Unsupported channel format: ${t}`);
    return r;
  }
  toCanvas() {
    if (!pe.IS_WEB_ENV) throw new Error("toCanvas() is only supported in browser environments.");
    let t = this.clone().rgba(), r = en(t.width, t.height), n = new Jm(t.data, t.width, t.height);
    return r.getContext("2d").putImageData(n, 0, 0), r;
  }
  split() {
    let { data: t, width: r, height: n, channels: a } = this, s = t.constructor, i = t.length / a, o = Array.from({ length: a }, () => new s(i));
    for (let l = 0; l < i; ++l) {
      let c = a * l;
      for (let p = 0; p < a; ++p) o[p][l] = t[c + p];
    }
    return o.map((l) => new Zt(l, r, n, 1));
  }
  _update(t, r, n, a = null) {
    return this.data = t, this.width = r, this.height = n, a !== null && (this.channels = a), this;
  }
  clone() {
    return new Zt(this.data.slice(), this.width, this.height, this.channels);
  }
  convert(t) {
    if (this.channels === t) return this;
    switch (t) {
      case 1:
        this.grayscale();
        break;
      case 3:
        this.rgb();
        break;
      case 4:
        this.rgba();
        break;
      default:
        throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
    }
    return this;
  }
  async save(t) {
    if (pe.IS_WEB_ENV) {
      if (pe.IS_WEBWORKER_ENV) throw new Error("Unable to save an image from a Web Worker.");
      let r = t.split(".").pop().toLowerCase(), n = O2.get(r) ?? "image/png", a = await this.toBlob(n);
      return Vm(t, a);
    } else if (pe.IS_FS_AVAILABLE) await this.toSharp().toFile(t);
    else throw new Error("Unable to save the image because filesystem is disabled in this environment.");
  }
  toSharp() {
    if (pe.IS_WEB_ENV) throw new Error("toSharp() is only supported in server-side environments.");
    return jo(this.data, { raw: { width: this.width, height: this.height, channels: this.channels } });
  }
}, u$ = kt.read.bind(kt);
function kf(e, t, r = 0, n = null) {
  let a = e / t, s = NT(a) * t;
  return n !== null && s > n && (s = Math.floor(a) * t), s < r && (s = Math.ceil(a) * t), s;
}
function Tf([e, t], r) {
  return [Math.max(Math.floor(e / r), 1) * r, Math.max(Math.floor(t / r), 1) * r];
}
function Zm([e, t, r, n]) {
  return [e - r / 2, t - n / 2, e + r / 2, t + n / 2];
}
function zs(e, t = 0.5, r = null, n = !1) {
  let a = e.logits, s = e.pred_boxes, [i, o, l] = a.dims;
  if (r !== null && r.length !== i) throw Error("Make sure that you pass in as many target sizes as the batch dimension of the logits");
  let c = [];
  for (let p = 0; p < i; ++p) {
    let d = r !== null ? r[p] : null, _ = { boxes: [], classes: [], scores: [] }, f = a[p], w = s[p];
    for (let y = 0; y < o; ++y) {
      let b = f[y], x = [], T;
      if (n) {
        T = b.sigmoid().data;
        for (let A = 0; A < T.length; ++A) T[A] > t && x.push(A);
      } else {
        let A = We(b.data)[1];
        if (A === l - 1 || (T = st(b.data), T[A] < t)) continue;
        x.push(A);
      }
      for (let A of x) {
        let E = w[y].data;
        E = Zm(E), d !== null && (E = E.map((S, O) => S * d[(O + 1) % 2])), _.boxes.push(E), _.classes.push(A), _.scores.push(T[A]);
      }
    }
    c.push(_);
  }
  return c;
}
function Km(e, t = null) {
  let r = e.logits, n = r.dims[0];
  if (t !== null && t.length !== n) throw Error("Make sure that you pass in as many target sizes as the batch dimension of the logits");
  let a = [];
  for (let s = 0; s < n; ++s) {
    let i = t !== null ? t[s] : null, o = r[s];
    i !== null && (o = Fm(o, i, "bilinear", !1));
    let [l, c] = i ?? o.dims.slice(-2), p = new V("int32", new Int32Array(l * c), [l, c]), d = o[0].data, _ = p.data;
    for (let y = 1; y < o.dims[0]; ++y) {
      let b = o[y].data;
      for (let x = 0; x < b.length; ++x) b[x] > d[x] && (d[x] = b[x], _[x] = y);
    }
    let f = new Array(o.dims[0]);
    for (let y = 0; y < _.length; ++y) {
      let b = _[y];
      f[b] = b;
    }
    let w = f.filter((y) => y !== void 0);
    a.push({ segmentation: p, labels: w });
  }
  return a;
}
function z2(e, t, r, n) {
  let a = [], s = [], i = [];
  for (let o = 0; o < e.dims[0]; ++o) {
    let l = e[o], c = t[o], p = We(l.data)[1];
    if (p === n) continue;
    let d = st(l.data)[p];
    d > r && (a.push(c), s.push(d), i.push(p));
  }
  return [a, s, i];
}
function N2(e, t, r, n = 0.5, a = 0.8) {
  let s = [], i = 0, o = 0, l = t[r].data;
  for (let p = 0; p < e.length; ++p) e[p] === r && (s.push(p), ++i), l[p] >= n && ++o;
  let c = i > 0 && o > 0;
  return c && (c = i / o > a), [c, s];
}
function B2(e, t, r, n, a, s = null, i = null) {
  let [o, l] = i ?? e[0].dims, c = new V("int32", new Int32Array(o * l), [o, l]), p = [];
  if (i !== null) for (let y = 0; y < e.length; ++y) e[y] = Fm(e[y], i, "bilinear", !1);
  let d = new Int32Array(e[0].data.length), _ = new Float32Array(e[0].data.length);
  for (let y = 0; y < e.length; ++y) {
    let b = t[y], x = e[y].data;
    for (let T = 0; T < x.length; ++T) x[T] *= b, x[T] > _[T] && (d[T] = y, _[T] = x[T]);
  }
  let f = 0, w = c.data;
  for (let y = 0; y < r.length; ++y) {
    let b = r[y], [x, T] = N2(d, e, y, n, a);
    if (x) {
      ++f;
      for (let A of T) w[A] = f;
      p.push({ id: f, label_id: b, score: t[y] });
    }
  }
  return [c, p];
}
function gl(e, t, r = 28, n = 3136, a = 784 * 1280, s = 1) {
  if (e < r || t < r) {
    let l = Math.max(r / e, r / t);
    e = Math.round(e * l), t = Math.round(t * l);
  }
  if (Math.max(e, t) / Math.min(e, t) > 200) throw new Error(`absolute aspect ratio must be smaller than 200, got ${Math.max(e, t) / Math.min(e, t)}`);
  let i = Math.round(e / r) * r, o = Math.round(t / r) * r;
  if (s * i * o > a) {
    let l = Math.sqrt(s * e * t / a);
    i = Math.max(r, Math.floor(e / l / r) * r), o = Math.max(r, Math.floor(t / l / r) * r);
  } else if (s * i * o < n) {
    let l = Math.sqrt(n / (s * e * t));
    i = Math.ceil(e * l / r) * r, o = Math.ceil(t * l / r) * r;
  }
  return [o, i];
}
function eg(e, t = 0.5, r = 0.5, n = 0.8, a = null, s = null) {
  a === null && (ce.warn("`label_ids_to_fuse` unset. No instance will be fused."), a = /* @__PURE__ */ new Set());
  let i = e.class_queries_logits ?? e.logits, o = (e.masks_queries_logits ?? e.pred_masks).sigmoid(), [l, c, p] = i.dims;
  if (p -= 1, s !== null && s.length !== l) throw Error("Make sure that you pass in as many target sizes as the batch dimension of the logits");
  let d = [];
  for (let _ = 0; _ < l; ++_) {
    let f = s !== null ? s[_] : null, w = i[_], y = o[_], [b, x, T] = z2(w, y, t, p);
    if (T.length === 0) {
      let [S, O] = f ?? y.dims.slice(-2), M = new V("int32", new Int32Array(S * O).fill(-1), [S, O]);
      d.push({ segmentation: M, segments_info: [] });
      continue;
    }
    let [A, E] = B2(b, x, T, r, n, a, f);
    d.push({ segmentation: A, segments_info: E });
  }
  return d;
}
function tg(e, t = 0.5, r = null) {
  throw new Error("`post_process_instance_segmentation` is not yet implemented.");
}
var ue = class extends gt {
  constructor(e) {
    super(), this.image_mean = e.image_mean ?? e.mean, this.image_std = e.image_std ?? e.std, this.resample = e.resample ?? 2, this.do_rescale = e.do_rescale ?? !0, this.rescale_factor = e.rescale_factor ?? 1 / 255, this.do_normalize = e.do_normalize, this.do_thumbnail = e.do_thumbnail, this.size = e.size ?? e.image_size, this.do_resize = e.do_resize ?? this.size !== void 0, this.size_divisibility = e.size_divisibility ?? e.size_divisor, this.do_center_crop = e.do_center_crop, this.crop_size = e.crop_size, this.do_convert_rgb = e.do_convert_rgb ?? !0, this.do_crop_margin = e.do_crop_margin, this.pad_size = e.pad_size, this.do_pad = e.do_pad, this.min_pixels = e.min_pixels, this.max_pixels = e.max_pixels, this.do_pad && !this.pad_size && !this.size_divisibility && this.size && this.size.width !== void 0 && this.size.height !== void 0 && (this.pad_size = this.size), this.do_flip_channel_order = e.do_flip_channel_order ?? !1, this.config = e;
  }
  async thumbnail(e, t, r = 2) {
    let n = e.height, a = e.width, s = t.height, i = t.width, o = Math.min(n, s), l = Math.min(a, i);
    return o === n && l === a ? e : (n > a ? l = Math.floor(a * o / n) : a > n && (o = Math.floor(n * l / a)), await e.resize(l, o, { resample: r }));
  }
  async crop_margin(e, t = 200) {
    let r = e.clone().grayscale(), n = Go(r.data)[0], a = We(r.data)[0] - n;
    if (a === 0) return e;
    let s = t / 255, i = r.width, o = r.height, l = 0, c = 0, p = r.data;
    for (let d = 0; d < r.height; ++d) {
      let _ = d * r.width;
      for (let f = 0; f < r.width; ++f) (p[_ + f] - n) / a < s && (i = Math.min(i, f), o = Math.min(o, d), l = Math.max(l, f), c = Math.max(c, d));
    }
    return e = await e.crop([i, o, l, c]), e;
  }
  pad_image(e, t, r, { mode: n = "constant", center: a = !1, constant_values: s = 0 } = {}) {
    let [i, o, l] = t, c, p;
    if (typeof r == "number" ? (c = r, p = r) : r === "square" ? c = p = Math.max(i, o) : (c = r.width, p = r.height), c !== o || p !== i) {
      let d = new Float32Array(c * p * l);
      if (Array.isArray(s)) for (let w = 0; w < d.length; ++w) d[w] = s[w % l];
      else s !== 0 && d.fill(s);
      let [_, f] = a ? [Math.floor((c - o) / 2), Math.floor((p - i) / 2)] : [0, 0];
      for (let w = 0; w < i; ++w) {
        let y = (w + f) * c, b = w * o;
        for (let x = 0; x < o; ++x) {
          let T = (y + x + _) * l, A = (b + x) * l;
          for (let E = 0; E < l; ++E) d[T + E] = e[A + E];
        }
      }
      if (n === "symmetric") {
        if (a) throw new Error("`center` padding is not supported when `mode` is set to `symmetric`.");
        let w = i - 1, y = o - 1;
        for (let b = 0; b < p; ++b) {
          let x = b * c, T = ms(b, w) * o;
          for (let A = 0; A < c; ++A) {
            if (b < i && A < o) continue;
            let E = (x + A) * l, S = (T + ms(A, y)) * l;
            for (let O = 0; O < l; ++O) d[E + O] = e[S + O];
          }
        }
      }
      e = d, t = [p, c, l];
    }
    return [e, t];
  }
  rescale(e) {
    for (let t = 0; t < e.length; ++t) e[t] = this.rescale_factor * e[t];
  }
  get_resize_output_image_size(e, t) {
    let [r, n] = e.size, a, s;
    if (this.do_thumbnail) {
      let { height: i, width: o } = t;
      a = Math.min(i, o);
    } else Number.isInteger(t) ? (a = t, s = this.config.max_size ?? a) : t !== void 0 && (a = t.shortest_edge, s = t.longest_edge);
    if (a !== void 0 || s !== void 0) {
      let i = a === void 0 ? 1 : Math.max(a / r, a / n), o = r * i, l = n * i, c = s === void 0 ? 1 : Math.min(s / o, s / l), p = Math.floor(Number((o * c).toFixed(2))), d = Math.floor(Number((l * c).toFixed(2)));
      return this.size_divisibility !== void 0 && ([p, d] = Tf([p, d], this.size_divisibility)), [p, d];
    } else if (t !== void 0 && t.width !== void 0 && t.height !== void 0) {
      let i = t.width, o = t.height;
      if (this.config.keep_aspect_ratio && this.config.ensure_multiple_of) {
        let l = o / n, c = i / r;
        Math.abs(1 - c) < Math.abs(1 - l) ? l = c : c = l, o = kf(l * n, this.config.ensure_multiple_of), i = kf(c * r, this.config.ensure_multiple_of);
      }
      return [i, o];
    } else {
      if (this.size_divisibility !== void 0) return Tf([r, n], this.size_divisibility);
      throw new Error(`Could not resize image due to unsupported \`this.size\` option in config: ${JSON.stringify(t)}`);
    }
  }
  async resize(e) {
    let [t, r] = this.get_resize_output_image_size(e, this.size);
    return await e.resize(t, r, { resample: this.resample });
  }
  async preprocess(e, { do_normalize: t = null, do_pad: r = null, do_convert_rgb: n = null, do_convert_grayscale: a = null, do_flip_channel_order: s = null } = {}) {
    this.do_crop_margin && (e = await this.crop_margin(e));
    let [i, o] = e.size;
    if (n ?? this.do_convert_rgb ? e = e.rgb() : a && (e = e.grayscale()), this.do_resize && (e = await this.resize(e)), this.do_thumbnail && (e = await this.thumbnail(e, this.size, this.resample)), this.do_center_crop) {
      let _, f;
      Number.isInteger(this.crop_size) ? (_ = this.crop_size, f = this.crop_size) : (_ = this.crop_size.width, f = this.crop_size.height), e = await e.center_crop(_, f);
    }
    let l = [e.height, e.width], c = Float32Array.from(e.data), p = [e.height, e.width, e.channels];
    if (this.do_rescale && this.rescale(c), t ?? this.do_normalize) {
      let _ = this.image_mean;
      Array.isArray(this.image_mean) || (_ = new Array(e.channels).fill(_));
      let f = this.image_std;
      if (Array.isArray(this.image_std) || (f = new Array(e.channels).fill(f)), _.length !== e.channels || f.length !== e.channels) throw new Error(`When set to arrays, the length of \`image_mean\` (${_.length}) and \`image_std\` (${f.length}) must match the number of channels in the image (${e.channels}).`);
      for (let w = 0; w < c.length; w += e.channels) for (let y = 0; y < e.channels; ++y) c[w + y] = (c[w + y] - _[y]) / f[y];
    }
    if (r ?? this.do_pad) {
      if (this.pad_size) [c, p] = this.pad_image(c, [e.height, e.width, e.channels], this.pad_size);
      else if (this.size_divisibility) {
        let _ = Math.ceil(p[1] / this.size_divisibility) * this.size_divisibility, f = Math.ceil(p[0] / this.size_divisibility) * this.size_divisibility;
        [c, p] = this.pad_image(c, p, { width: _, height: f });
      }
    }
    if (s ?? this.do_flip_channel_order) {
      if (p[2] !== 3) throw new Error("Flipping channel order is only supported for RGB images.");
      for (let _ = 0; _ < c.length; _ += 3) {
        let f = c[_];
        c[_] = c[_ + 2], c[_ + 2] = f;
      }
    }
    let d = new V("float32", c, p).permute(2, 0, 1);
    return { original_size: [o, i], reshaped_input_size: l, pixel_values: d };
  }
  async _call(e, ...t) {
    Array.isArray(e) || (e = [e]);
    let r = await Promise.all(e.map((n) => this.preprocess(n)));
    return { pixel_values: hr(r.map((n) => n.pixel_values), 0), original_sizes: r.map((n) => n.original_size), reshaped_input_sizes: r.map((n) => n.reshaped_input_size) };
  }
  static async from_pretrained(e, t = {}) {
    let r = await nr(e, ha, !0, t);
    return new this(r);
  }
}, Ts = {};
fa(Ts, { BeitFeatureExtractor: () => $2, BitImageProcessor: () => D2, CHMv2ImageProcessor: () => G2, CLIPFeatureExtractor: () => V2, CLIPImageProcessor: () => rg, ChineseCLIPFeatureExtractor: () => R2, ConvNextFeatureExtractor: () => U2, ConvNextImageProcessor: () => ng, DINOv3ViTImageProcessor: () => W2, DPTFeatureExtractor: () => Q2, DPTImageProcessor: () => ig, DeiTFeatureExtractor: () => q2, DeiTImageProcessor: () => ag, DetrFeatureExtractor: () => j2, DetrImageProcessor: () => sg, DonutFeatureExtractor: () => H2, DonutImageProcessor: () => wl, EfficientNetImageProcessor: () => X2, GLPNFeatureExtractor: () => eA, Gemma3ImageProcessor: () => Y2, Gemma4ImageProcessor: () => og, Glm46VImageProcessor: () => K2, GroundingDinoImageProcessor: () => tA, Idefics3ImageProcessor: () => Ef, ImageFeatureExtractor: () => ue, ImageProcessor: () => ue, JinaCLIPImageProcessor: () => nA, Lfm2VlImageProcessor: () => lA, LlavaOnevisionImageProcessor: () => cA, Mask2FormerImageProcessor: () => dA, MaskFormerFeatureExtractor: () => uA, MaskFormerImageProcessor: () => yl, MobileNetV1FeatureExtractor: () => pA, MobileNetV1ImageProcessor: () => cg, MobileNetV2FeatureExtractor: () => hA, MobileNetV2ImageProcessor: () => ug, MobileNetV3FeatureExtractor: () => _A, MobileNetV3ImageProcessor: () => dg, MobileNetV4FeatureExtractor: () => fA, MobileNetV4ImageProcessor: () => pg, MobileViTFeatureExtractor: () => mA, MobileViTImageProcessor: () => hg, NougatImageProcessor: () => gA, OwlViTFeatureExtractor: () => wA, OwlViTImageProcessor: () => bl, Owlv2ImageProcessor: () => yA, Phi3VImageProcessor: () => vA, PixtralImageProcessor: () => xA, PvtImageProcessor: () => MA, Qwen2VLImageProcessor: () => lg, RTDetrImageProcessor: () => kA, Sam2ImageProcessor: () => Lo, Sam3ImageProcessor: () => Lo, SamImageProcessor: () => Lo, SapiensFeatureExtractor: () => TA, SapiensImageProcessor: () => _g, SegformerFeatureExtractor: () => EA, SegformerImageProcessor: () => fg, SiglipImageProcessor: () => AA, SmolVLMImageProcessor: () => Ef, Swin2SRImageProcessor: () => CA, VLMImageProcessor: () => rA, ViTFeatureExtractor: () => SA, ViTImageProcessor: () => mg, VitMatteImageProcessor: () => PA, VitPoseImageProcessor: () => FA, YolosFeatureExtractor: () => IA, YolosImageProcessor: () => gg });
var $2 = class extends ue {
}, D2 = class extends ue {
}, R2 = class extends ue {
}, G2 = class extends ue {
}, rg = class extends ue {
}, V2 = class extends rg {
}, ng = class extends ue {
  constructor(e) {
    super(e), this.crop_pct = this.config.crop_pct ?? 224 / 256;
  }
  async resize(e) {
    let t = this.size?.shortest_edge;
    if (t === void 0) throw new Error("Size dictionary must contain 'shortest_edge' key.");
    if (t < 384) {
      let r = Math.floor(t / this.crop_pct), [n, a] = this.get_resize_output_image_size(e, { shortest_edge: r });
      e = await e.resize(n, a, { resample: this.resample }), e = await e.center_crop(t, t);
    } else e = await e.resize(t, t, { resample: this.resample });
    return e;
  }
}, U2 = class extends ng {
}, ag = class extends ue {
}, q2 = class extends ag {
}, sg = class extends ue {
  async _call(e) {
    let t = await super._call(e), r = [t.pixel_values.dims[0], 64, 64], n = ut(r, 1n);
    return { ...t, pixel_mask: n };
  }
  post_process_object_detection(...e) {
    return zs(...e);
  }
  post_process_panoptic_segmentation(...e) {
    return eg(...e);
  }
  post_process_instance_segmentation(...e) {
    return tg(...e);
  }
}, j2 = class extends sg {
}, W2 = class extends ue {
}, wl = class extends ue {
  pad_image(e, t, r, n = {}) {
    let [a, s, i] = t, o = this.image_mean;
    Array.isArray(this.image_mean) || (o = new Array(i).fill(o));
    let l = this.image_std;
    Array.isArray(l) || (l = new Array(i).fill(o));
    let c = o.map((p, d) => -p / l[d]);
    return super.pad_image(e, t, r, { center: !0, constant_values: c, ...n });
  }
}, H2 = class extends wl {
}, ig = class extends ue {
}, Q2 = class extends ig {
}, X2 = class extends ue {
  constructor(e) {
    super(e), this.include_top = this.config.include_top ?? !0, this.include_top && (this.image_std = this.image_std.map((t) => t * t));
  }
}, Y2 = class extends ue {
};
function J2(e, t, r, n, a) {
  let s = n * r ** 2, i = Math.sqrt(s / (e * t)), o = a * r, l = Math.floor(i * e / o) * o, c = Math.floor(i * t / o) * o;
  if (l === 0 && c === 0) throw new Error(`Attempting to resize to a 0 x 0 image. Resized height should be divisible by \`pooling_kernel_size * patch_size\`=${o}.`);
  let p = Math.floor(n / a ** 2) * o;
  return l === 0 ? (l = o, c = Math.min(Math.floor(t / e) * o, p)) : c === 0 && (c = o, l = Math.min(Math.floor(e / t) * o, p)), [l, c];
}
function Z2(e, t, r, n, a, s, i) {
  let o = Math.floor(t / a), l = Math.floor(r / a), c = o * l, p = a * a * n, d = new Float32Array(s * p), _ = 0;
  for (let y = 0; y < o; ++y) for (let b = 0; b < l; ++b) for (let x = 0; x < a; ++x) {
    let T = (y * a + x) * r * n + b * a * n;
    for (let A = 0; A < a; ++A) {
      let E = T + A * n;
      for (let S = 0; S < n; ++S) d[_++] = e[E + S];
    }
  }
  let f = new BigInt64Array(s * 2).fill(-1n), w = 0;
  for (let y = 0; y < o; ++y) for (let b = 0; b < l; ++b) f[w++] = BigInt(b), f[w++] = BigInt(y);
  return { patches: new V("float32", d, [s, p]), positions: new V("int64", f, [s, 2]), num_soft_tokens: Math.floor(c / i ** 2) };
}
var og = class extends gt {
  constructor(e) {
    super(), this.config = e, this.patch_size = e.patch_size ?? 16, this.max_soft_tokens = e.max_soft_tokens ?? 280, this.pooling_kernel_size = e.pooling_kernel_size ?? 3, this.resample = e.resample ?? 3, this.rescale_factor = e.rescale_factor ?? 1 / 255, this.do_rescale = e.do_rescale ?? !0, this.do_resize = e.do_resize ?? !0, this.do_convert_rgb = e.do_convert_rgb ?? !0;
  }
  async _call(e) {
    Array.isArray(e) || (e = [e]);
    let { patch_size: t, pooling_kernel_size: r } = this, n = this.max_soft_tokens * r ** 2, a = [], s = [], i = [];
    for (let o of e) {
      if (this.do_convert_rgb && (o = o.rgb()), this.do_resize) {
        let [_, f] = J2(o.height, o.width, t, n, r);
        (_ !== o.height || f !== o.width) && (o = await o.resize(f, _, { resample: this.resample }));
      }
      let l = Float32Array.from(o.data);
      if (this.do_rescale) for (let _ = 0; _ < l.length; ++_) l[_] *= this.rescale_factor;
      let { patches: c, positions: p, num_soft_tokens: d } = Z2(l, o.height, o.width, o.channels, t, n, r);
      a.push(c), s.push(p), i.push(d);
    }
    return { pixel_values: hr(a, 0), image_position_ids: hr(s, 0), num_soft_tokens_per_image: i };
  }
}, lg = class extends ue {
  constructor(e) {
    super(e), this.min_pixels = e.min_pixels ?? e.size?.shortest_edge, this.max_pixels = e.max_pixels ?? e.size?.longest_edge, this.patch_size = e.patch_size, this.merge_size = e.merge_size;
  }
  get_resize_output_image_size(e, t) {
    let r = this.patch_size * this.merge_size;
    return gl(e.height, e.width, r, this.min_pixels, this.max_pixels);
  }
  async _call(e, ...t) {
    let { pixel_values: r, original_sizes: n, reshaped_input_sizes: a } = await super._call(e, ...t), s = r, { temporal_patch_size: i, merge_size: o, patch_size: l } = this.config;
    s.dims[0] === 1 && (s = Ne(Array.from({ length: i }, () => s), 0));
    let c = s.dims[0] / i, p = s.dims[1], d = Math.floor(s.dims[2] / l), _ = Math.floor(s.dims[3] / l), f = s.view(c, i, p, Math.floor(d / o), o, l, Math.floor(_ / o), o, l).permute(0, 3, 6, 4, 7, 2, 1, 5, 8).view(c * d * _, p * i * l * l), w = new V("int64", [c, d, _], [1, 3]);
    return { pixel_values: f, image_grid_thw: w, original_sizes: n, reshaped_input_sizes: a };
  }
}, K2 = class extends lg {
  get_resize_output_image_size(e, t) {
    let r = this.patch_size * this.merge_size, n = this.config.temporal_patch_size ?? 2;
    return gl(e.height, e.width, r, this.min_pixels, this.max_pixels, n);
  }
}, eA = class extends ue {
}, tA = class extends ue {
  async _call(e) {
    let t = await super._call(e), r = t.pixel_values.dims, n = mt([r[0], r[2], r[3]]);
    return { ...t, pixel_mask: n };
  }
}, Ef = class extends ue {
  constructor(e) {
    super(e), this.do_image_splitting = e.do_image_splitting ?? !0, this.max_image_size = e.max_image_size;
  }
  get_resize_for_vision_encoder(e, t) {
    let [r, n] = e.dims.slice(-2), a = n / r;
    return n >= r ? (n = Math.ceil(n / t) * t, r = Math.floor(n / a), r = Math.ceil(r / t) * t) : (r = Math.ceil(r / t) * t, n = Math.floor(r * a), n = Math.ceil(n / t) * t), { height: r, width: n };
  }
  async _call(e, { do_image_splitting: t = null, return_row_col_info: r = !1 } = {}) {
    let n;
    if (!Array.isArray(e)) n = [[e]];
    else {
      if (e.length === 0 || !e[0]) throw new Error("No images provided.");
      Array.isArray(e[0]) ? n = e : n = [e];
    }
    let a = [], s = [], i = [], o = [], l = [];
    for (let b of n) {
      let x = await Promise.all(b.map((E) => this.preprocess(E)));
      o.push(...x.map((E) => E.original_size)), l.push(...x.map((E) => E.reshaped_input_size)), x.forEach((E) => E.pixel_values.unsqueeze_(0));
      let { longest_edge: T } = this.max_image_size, A;
      if (t ?? this.do_image_splitting) {
        let E = new Array(x.length), S = new Array(x.length);
        A = await Promise.all(x.map(async (O, M) => {
          let G = this.get_resize_for_vision_encoder(O.pixel_values, T), D = await Gt(O.pixel_values, { size: [G.height, G.width] }), { frames: U, num_splits_h: q, num_splits_w: H } = await this.split_image(D, this.max_image_size);
          return E[M] = q, S[M] = H, Ne(U, 0);
        })), s.push(E), i.push(S);
      } else {
        let E = [T, T];
        A = await Promise.all(x.map((S) => Gt(S.pixel_values, { size: E }))), s.push(new Array(x.length).fill(0)), i.push(new Array(x.length).fill(0));
      }
      a.push(Ne(A, 0));
    }
    let c = a.length, [p, d, _, f] = a[0].dims, w, y;
    if (c === 1) w = a[0].unsqueeze_(0), y = ut([c, p, _, f], !0);
    else {
      let b = Math.max(...a.map((A) => A.dims.at(0)));
      y = ut([c, b, _, f], !0);
      let x = y.data, T = b * _ * f;
      for (let A = 0; A < c; ++A) {
        let E = a[A].dims[0];
        if (E < b) {
          a[A] = Ne([a[A], ut([b - E, d, _, f], 0)], 0);
          let S = A * T + E * _ * f, O = (A + 1) * T;
          x.fill(!1, S, O);
        }
      }
      w = hr(a, 0);
    }
    return { pixel_values: w, pixel_attention_mask: y, original_sizes: o, reshaped_input_sizes: l, ...r ? { rows: s, cols: i } : {} };
  }
  async split_image(e, { longest_edge: t }) {
    let r = t, n = t, a = [], [s, i] = e.dims.slice(-2), o = 0, l = 0;
    if (s > r || i > n) {
      o = Math.ceil(s / r), l = Math.ceil(i / n);
      let c = Math.ceil(s / o), p = Math.ceil(i / l);
      for (let f = 0; f < o; ++f) for (let w = 0; w < l; ++w) {
        let y, b, x, T;
        f === o - 1 ? (b = s - c, T = s) : (b = f * c, T = (f + 1) * c), w === l - 1 ? (y = i - p, x = i) : (y = w * p, x = (w + 1) * p);
        let A = await Im(e, [b, y], [T, x], [2, 3]);
        a.push(A);
      }
      let d = r, _ = n;
      (s !== d || i !== _) && (e = await Gt(e, { size: [d, _] }));
    }
    return a.push(e), { frames: a, num_splits_h: o, num_splits_w: l };
  }
}, rA = class extends ue {
  constructor(e) {
    super({ do_pad: !0, pad_size: { width: e.image_size, height: e.image_size }, ...e }), this.constant_values = this.config.background_color.map((t) => t * this.rescale_factor);
  }
  pad_image(e, t, r, n) {
    return super.pad_image(e, t, r, { constant_values: this.constant_values, center: !0, ...n });
  }
}, nA = class extends ue {
  constructor(e) {
    let { resize_mode: t, fill_color: r, interpolation: n, size: a, ...s } = e, i = t === "squash" ? { width: a, height: a } : t === "shortest" ? { shortest_edge: a } : { longest_edge: a }, o = n === "bicubic" ? 3 : 2;
    super({ ...s, size: i, resample: o, do_center_crop: !0, crop_size: a, do_normalize: !0 });
  }
};
function Af(e, t) {
  return Math.round(e / t) * t;
}
function aA(e, t, r, n, a) {
  let s = 1 / 0, i = [1, 1], o = r * n;
  for (let l of t) {
    let c = Math.abs(e - l[0] / l[1]);
    c < s ? (s = c, i = l) : c === s && o > 0.5 * a * a * l[0] * l[1] && (i = l);
  }
  return i;
}
function sA(e, t) {
  let r = [], n = /* @__PURE__ */ new Set();
  for (let a = e; a <= t; ++a) for (let s = 1; s <= a; ++s) for (let i = 1; i <= a; ++i) {
    let o = s * i;
    if (o >= e && o <= t) {
      let l = s << 16 | i;
      n.has(l) || (n.add(l), r.push([s, i]));
    }
  }
  return r.sort((a, s) => a[0] * a[1] - s[0] * s[1]);
}
function iA(e, t) {
  let [r, n, a, s] = e.dims, i = Math.floor(a / t), o = Math.floor(s / t), l = t * t * n, c = e.data, p = new Float32Array(r * i * o * l), d = a * s;
  for (let _ = 0; _ < r; ++_) {
    let f = _ * n * d, w = _ * i * o * l;
    for (let y = 0; y < i; ++y) for (let b = 0; b < o; ++b) {
      let x = w + (y * o + b) * l;
      for (let T = 0; T < t; ++T) {
        let A = (y * t + T) * s + b * t;
        for (let E = 0; E < t; ++E) {
          let S = A + E;
          for (let O = 0; O < n; ++O) p[x++] = c[f + O * d + S];
        }
      }
    }
  }
  return new V("float32", p, [r, i * o, l]);
}
function oA(e, t) {
  let [, r, n] = e.dims, a = new BigInt64Array(t);
  a.fill(1n, 0, r);
  let s = e;
  if (r < t) {
    let i = new Float32Array(t * n);
    i.set(e.data), s = new V("float32", i, [1, t, n]);
  }
  return { padded: s, mask: new V("int64", a, [t]) };
}
var lA = class extends ue {
  constructor(e) {
    super(e), this.downsample_factor = e.downsample_factor ?? 2, this.do_image_splitting = e.do_image_splitting ?? !0, this.min_tiles = e.min_tiles ?? 2, this.max_tiles = e.max_tiles ?? 10, this.use_thumbnail = e.use_thumbnail ?? !0, this.min_image_tokens = e.min_image_tokens ?? 64, this.max_image_tokens = e.max_image_tokens ?? 256, this.encoder_patch_size = e.encoder_patch_size ?? e.patch_size ?? 16, this.tile_size = e.tile_size ?? 512, this.max_pixels_tolerance = e.max_pixels_tolerance ?? 2, this.return_row_col_info = e.return_row_col_info ?? !1;
    let t = this.max_image_tokens * this.downsample_factor ** 2, r = this.do_image_splitting ? (this.tile_size / this.encoder_patch_size) ** 2 : 0;
    this.max_num_patches = Math.max(t, r);
  }
  _is_image_too_large(e, t) {
    let r = this.encoder_patch_size * this.downsample_factor, n = Math.max(this.encoder_patch_size, Af(e, r)), a = Math.max(this.encoder_patch_size, Af(t, r));
    return n * a > this.max_image_tokens * (this.encoder_patch_size * this.downsample_factor) ** 2 * this.max_pixels_tolerance;
  }
  _get_grid_layout(e, t) {
    let r = sA(this.min_tiles, this.max_tiles), [n, a] = aA(t / e, r, t, e, this.tile_size);
    return { grid_width: n, grid_height: a, target_width: this.tile_size * n, target_height: this.tile_size * a };
  }
  async _call(e, { return_row_col_info: t = null } = {}) {
    let r;
    Array.isArray(e) ? Array.isArray(e[0]) ? r = e : r = [e] : r = [[e]];
    let n = [], a = [], s = [], i = [], o = [], l = [];
    for (let p of r) {
      let d = await Promise.all(p.map((_) => this.preprocess(_, { do_pad: !1 })));
      for (let { pixel_values: _ } of d) {
        let [, f, w] = _.dims, y = _.unsqueeze_(0), b = this.encoder_patch_size * this.downsample_factor, x = b ** 2, [T, A] = gl(Math.max(b, f), Math.max(b, w), b, this.min_image_tokens * x, this.max_image_tokens * x).map((D) => Math.max(b, D)), E, S = 1, O = 1, M = this._is_image_too_large(f, w), G = this.do_image_splitting && !(this.min_tiles === 1 && this.max_tiles === 1);
        if (M && G) {
          let { grid_width: D, grid_height: U, target_width: q, target_height: H } = this._get_grid_layout(f, w);
          S = U, O = D;
          let Q = await Gt(y, { size: [H, q] });
          E = [];
          for (let $ = 0; $ < U; ++$) for (let C = 0; C < D; ++C) {
            let ae = $ * this.tile_size, ge = C * this.tile_size;
            E.push(Q.slice(null, null, [ae, ae + this.tile_size], [ge, ge + this.tile_size]));
          }
          this.use_thumbnail && D * U !== 1 && E.push(await Gt(y, { size: [A, T] }));
        } else E = [await Gt(y, { size: [A, T] })];
        for (let D of E) {
          let [, , U, q] = D.dims, H = iA(D, this.encoder_patch_size), { padded: Q, mask: $ } = oA(H, this.max_num_patches);
          n.push(Q), a.push($), s.push([Math.floor(U / this.encoder_patch_size), Math.floor(q / this.encoder_patch_size)]);
        }
        i.push(S), o.push(O), l.push([A, T]);
      }
    }
    let c = { pixel_values: Ne(n, 0), pixel_attention_mask: hr(a, 0), spatial_shapes: new V("int64", BigInt64Array.from(s.flat(), BigInt), [s.length, 2]) };
    return (t ?? this.return_row_col_info) && (c.image_rows = i, c.image_cols = o, c.image_sizes = l), c;
  }
}, cA = class extends ue {
}, yl = class extends ue {
  post_process_panoptic_segmentation(...e) {
    return eg(...e);
  }
  post_process_instance_segmentation(...e) {
    return tg(...e);
  }
}, uA = class extends yl {
}, dA = class extends yl {
}, cg = class extends ue {
}, pA = class extends cg {
}, ug = class extends ue {
}, hA = class extends ug {
}, dg = class extends ue {
}, _A = class extends dg {
}, pg = class extends ue {
}, fA = class extends pg {
}, hg = class extends ue {
}, mA = class extends hg {
}, gA = class extends wl {
}, bl = class extends ue {
  post_process_object_detection(...e) {
    return zs(...e);
  }
}, wA = class extends bl {
}, yA = class extends bl {
}, xt = 336, bA = [2, 3], { ceil: Fo, floor: yn, sqrt: Io } = Math, vA = class extends ue {
  constructor(e) {
    super({ ...e, do_normalize: !0, do_pad: !0, pad_size: "custom", do_convert_rgb: !0, do_resize: !0 }), this._num_crops = e.num_crops;
  }
  calc_num_image_tokens_from_image_size(e, t) {
    let { num_img_tokens: r } = this.config;
    return yn((yn(t / xt) * yn(e / xt) + 1) * r + 1 + (yn(t / xt) + 1) * Io(r));
  }
  get_resize_output_image_size(e, t) {
    let r = this._num_crops, [n, a] = e.size, s = n / a, i = 1;
    for (; i * Math.ceil(i / s) <= r; ) i += 1;
    i -= 1;
    let o = Math.floor(i * 336), l = Math.floor(o / s);
    return [o, l];
  }
  pad_image(e, t, r, n = {}) {
    let [a, s] = t, i = xt * Fo(a / xt), o = xt * Fo(s / xt), l = [1, 1, 1].map((c, p) => (c - this.image_mean[p]) / this.image_std[p]);
    return super.pad_image(e, t, { width: o, height: i }, { center: !0, constant_values: l, ...n });
  }
  async _call(e, { num_crops: t = null } = {}) {
    if (this._num_crops = t ??= this.config.num_crops, t < 4 || Io(t) % 1 !== 0) throw new Error("num_crops must be a square number >= 4");
    Array.isArray(e) || (e = [e]);
    let r = e.length, n = await Promise.all(e.map((d) => this.preprocess(d))), a = n.map((d) => d.original_size), s = n.map((d) => d.reshaped_input_size), i = [];
    for (let { pixel_values: d } of n) {
      d.unsqueeze_(0);
      let [_, f] = d.dims.slice(-2), w = await Gt(d, { size: [xt, xt], mode: "bicubic" });
      if (t > 0) {
        let y = [], b = Io(t), x = yn(f / b), T = yn(_ / b);
        for (let E = 0; E < b; ++E) for (let S = 0; S < b; ++S) {
          let O, M, G, D;
          E === b - 1 ? (M = _ - T, D = _) : (M = E * T, D = (E + 1) * T), S === b - 1 ? (O = f - x, G = f) : (O = S * x, G = (S + 1) * x);
          let U = await Im(d, [M, O], [D, G], bA);
          y.push(U);
        }
        let A = await Gt(Ne(y, 0), { size: [xt, xt], mode: "bicubic" });
        i.push(Ne([w, A], 0));
      } else i.push(w);
    }
    let o = hr(i, 0), l = s.map((d) => d.map((_) => xt * Fo(_ / xt))), c = new V("int64", l.flat(), [r, 2]), p = l.map(([d, _]) => this.calc_num_image_tokens_from_image_size(_, d));
    return { pixel_values: o, original_sizes: a, reshaped_input_sizes: s, image_sizes: c, num_img_tokens: p };
  }
}, xA = class extends ue {
  get_resize_output_image_size(e, t) {
    let { longest_edge: r } = t;
    if (r === void 0) throw new Error("size must contain 'longest_edge'");
    let [n, a] = e.size, s = Math.max(n, a) / r, i = n, o = a;
    s > 1 && (i = Math.floor(n / s), o = Math.floor(a / s));
    let { patch_size: l, spatial_merge_size: c } = this.config;
    if (!c) throw new Error("config must contain 'spatial_merge_size'");
    let p = l * c, d = Math.floor((i - 1) / p) + 1, _ = Math.floor((o - 1) / p) + 1;
    return [d * p, _ * p];
  }
}, MA = class extends ue {
}, kA = class extends ue {
  post_process_object_detection(...e) {
    return zs(...e);
  }
}, Lo = class extends ue {
  reshape_input_points(e, t, r, n = !1) {
    e = structuredClone(e);
    let a = B_(e);
    if (a.length === 3) n || (a = [1, ...a]), e = [e];
    else if (a.length !== 4) throw Error("The input_points must be a 4D tensor of shape `batch_size`, `point_batch_size`, `nb_points_per_image`, `2`.");
    for (let s = 0; s < e.length; ++s) {
      let [i, o] = t[s], [l, c] = r[s], p = [c / o, l / i];
      for (let d = 0; d < e[s].length; ++d) for (let _ = 0; _ < e[s][d].length; ++_) for (let f = 0; f < e[s][d][_].length; ++f) e[s][d][_][f] *= p[f % 2];
    }
    return new V("float32", Float32Array.from(e.flat(1 / 0)), a);
  }
  add_input_labels(e, t) {
    let r = B_(e);
    if (r.length === 2) r = [1, ...r], e = [e];
    else if (r.length !== 3) throw Error("The input_points must be a 4D tensor of shape `batch_size`, `point_batch_size`, `nb_points_per_image`, `2`.");
    if (r.some((n, a) => n !== t.dims[a])) throw Error(`The first ${r.length} dimensions of 'input_points' and 'input_labels' must be the same.`);
    return new V("int64", e.flat(1 / 0).map(BigInt), r);
  }
  async _call(e, { input_points: t = null, input_labels: r = null, input_boxes: n = null } = {}) {
    let a = await super._call(e);
    if (t && (a.input_points = this.reshape_input_points(t, a.original_sizes, a.reshaped_input_sizes)), r) {
      if (!a.input_points) throw Error("`input_points` must be provided if `input_labels` are provided.");
      a.input_labels = this.add_input_labels(r, a.input_points);
    }
    return n && (a.input_boxes = this.reshape_input_points(n, a.original_sizes, a.reshaped_input_sizes, !0)), a;
  }
  async post_process_masks(e, t, r, { mask_threshold: n = 0, binarize: a = !0, pad_size: s = null } = {}) {
    let i = [];
    s = s ?? this.pad_size ?? this.size;
    let o = [s.height, s.width];
    for (let l = 0; l < t.length; ++l) {
      let c = t[l], p = r[l], d = await Gt(e[l], { mode: "bilinear", size: o });
      if (d = d.slice(null, null, [0, p[0]], [0, p[1]]), d = await Gt(d, { mode: "bilinear", size: c }), a) {
        let _ = d.data, f = new Uint8Array(_.length);
        for (let w = 0; w < _.length; ++w) _[w] > n && (f[w] = 1);
        d = new V("bool", f, d.dims);
      }
      i.push(d);
    }
    return i;
  }
  generate_crop_boxes(e, t, { crop_n_layers: r = 0, overlap_ratio: n = 512 / 1500, points_per_crop: a = 32, crop_n_points_downscale_factor: s = 1 } = {}) {
  }
}, _g = class extends ue {
  post_process_semantic_segmentation(...e) {
    return Km(...e);
  }
}, TA = class extends _g {
}, fg = class extends ue {
  post_process_semantic_segmentation(...e) {
    return Km(...e);
  }
}, EA = class extends fg {
}, AA = class extends ue {
}, CA = class extends ue {
  pad_image(e, t, r, n = {}) {
    let [a, s, i] = t;
    return super.pad_image(e, t, { width: s + (r - s % r) % r, height: a + (r - a % r) % r }, { mode: "symmetric", center: !1, constant_values: -1, ...n });
  }
}, mg = class extends ue {
}, SA = class extends mg {
}, PA = class extends ue {
  async _call(e, t) {
    Array.isArray(e) || (e = [e]), Array.isArray(t) || (t = [t]);
    let r = await Promise.all(e.map((a) => this.preprocess(a))), n = await Promise.all(t.map((a) => this.preprocess(a, { do_normalize: !1, do_convert_rgb: !1, do_convert_grayscale: !0 })));
    return { pixel_values: hr(r.map((a, s) => Ne([a.pixel_values, n[s].pixel_values], 0)), 0), original_sizes: r.map((a) => a.original_size), reshaped_input_sizes: r.map((a) => a.reshaped_input_size) };
  }
}, FA = class extends ue {
  post_process_pose_estimation(e, t, { threshold: r = null } = {}) {
    let n = e.tolist(), [a, s, i, o] = e.dims, l = [];
    for (let c = 0; c < a; ++c) {
      let p = n[c], d = t[c], _ = [];
      for (let f = 0; f < d.length; ++f) {
        let w = d[f], y = [], b = [], x = [], T = w.at(-2) / o, A = w.at(-1) / i;
        for (let E = 0; E < p.length; ++E) {
          let [S, O] = [0, 0], M = 0, G = -1 / 0, D = p[E];
          for (let q = 0; q < D.length; ++q) {
            let H = D[q];
            for (let Q = 0; Q < H.length; ++Q) {
              let $ = H[Q];
              M += $, G = Math.max(G, $), S += (Q + 0.5) * $, O += q * $;
            }
          }
          if (r != null && G < r) continue;
          let U = [T * S / M, A * O / M];
          y.push(U), x.push(E), b.push(G);
        }
        _.push({ bbox: w, scores: b, labels: x, keypoints: y });
      }
      l.push(_);
    }
    return l;
  }
}, gg = class extends ue {
  post_process_object_detection(...e) {
    return zs(...e);
  }
}, IA = class extends gg {
}, pt = class {
  static async from_pretrained(e, t = {}) {
    let r = await nr(e, ha, !0, t), n = r.image_processor_type ?? r.feature_extractor_type, a = Ts[n?.replace(/Fast$/, "")];
    return a || (n !== void 0 && ce.warn(`Image processor type '${n}' not found, assuming base ImageProcessor. Please report this at ${Os}.`), a = ue), new a(r);
  }
}, LA = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
  constructor(e, t, r) {
    super(e, t, r);
    let { tasks_answer_post_processing_type: n, task_prompts_without_inputs: a, task_prompts_with_input: s } = this.image_processor.config;
    this.tasks_answer_post_processing_type = new Map(Object.entries(n ?? {})), this.task_prompts_without_inputs = new Map(Object.entries(a ?? {})), this.task_prompts_with_input = new Map(Object.entries(s ?? {})), this.regexes = { quad_boxes: /(.+?)<loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)>/gm, bboxes: /([^<]+)?<loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)>/gm }, this.size_per_bin = 1e3;
  }
  construct_prompts(e) {
    typeof e == "string" && (e = [e]);
    let t = [];
    for (let r of e) if (this.task_prompts_without_inputs.has(r)) t.push(this.task_prompts_without_inputs.get(r));
    else {
      for (let [n, a] of this.task_prompts_with_input) if (r.includes(n)) {
        t.push(a.replaceAll("{input}", r).replaceAll(n, ""));
        break;
      }
      t.length !== e.length && t.push(r);
    }
    return t;
  }
  post_process_generation(e, t, r) {
    let n = this.tasks_answer_post_processing_type.get(t) ?? "pure_text";
    e = e.replaceAll("<s>", "").replaceAll("</s>", "");
    let a;
    switch (n) {
      case "pure_text":
        a = e;
        break;
      case "description_with_bboxes":
      case "bboxes":
      case "phrase_grounding":
      case "ocr":
        let s = n === "ocr" ? "quad_boxes" : "bboxes", i = e.matchAll(this.regexes[s]), o = [], l = [];
        for (let [c, p, ...d] of i) o.push(p ? p.trim() : o.at(-1) ?? ""), l.push(d.map((_, f) => (Number(_) + 0.5) / this.size_per_bin * r[f % 2]));
        a = { labels: o, [s]: l };
        break;
      default:
        throw new Error(`Task "${t}" (of type "${n}") not yet implemented.`);
    }
    return { [t]: a };
  }
  async _call(e, t = null, r = {}) {
    if (!e && !t) throw new Error("Either text or images must be provided");
    let n = await this.image_processor(e, r), a = t ? this.tokenizer(this.construct_prompts(t), r) : {};
    return { ...n, ...a };
  }
}, OA = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
  static uses_processor_config = !0;
  static uses_chat_template_file = !0;
  constructor(e, t, r) {
    super(e, t, r), this.image_seq_length = this.config.image_seq_length;
    let { boi_token: n, image_token: a, eoi_token: s } = this.tokenizer.config;
    this.boi_token = n, this.image_token = a, this.eoi_token = s;
    let i = a.repeat(this.image_seq_length);
    this.full_image_sequence = `

${n}${i}${s}

`;
  }
  async _call(e, t = null, r = {}) {
    typeof e == "string" && (e = [e]);
    let n;
    return t && (n = await this.image_processor(t, r), e = e.map((a) => a.replaceAll(this.boi_token, this.full_image_sequence))), { ...this.tokenizer(e, r), ...n };
  }
}, zA = class extends Ce {
  static image_processor_class = pt;
  static feature_extractor_class = Ft;
  static tokenizer_class = Ae;
  static uses_processor_config = !0;
  static uses_chat_template_file = !0;
  constructor(e, t, r) {
    super(e, t, r), this.audio_seq_length = this.config.audio_seq_length, this.image_seq_length = this.config.image_seq_length;
    let { audio_token_id: n, boa_token: a, audio_token: s, eoa_token: i, image_token_id: o, boi_token: l, image_token: c, eoi_token: p } = this.tokenizer.config;
    this.audio_token_id = n, this.boa_token = a, this.audio_token = s;
    let d = s.repeat(this.audio_seq_length);
    this.full_audio_sequence = `

${a}${d}${i}

`, this.image_token_id = o, this.boi_token = l, this.image_token = c;
    let _ = c.repeat(this.image_seq_length);
    this.full_image_sequence = `

${l}${_}${p}

`;
  }
  async _call(e, t = null, r = null, n = {}) {
    typeof e == "string" && (e = [e]);
    let a;
    r && (a = await this.feature_extractor(r, n), e = e.map((i) => i.replaceAll(this.audio_token, this.full_audio_sequence)));
    let s;
    return t && (s = await this.image_processor(t, n), e = e.map((i) => i.replaceAll(this.image_token, this.full_image_sequence))), { ...this.tokenizer(e, n), ...s, ...a };
  }
}, NA = class extends Ce {
  static uses_processor_config = !0;
  static uses_chat_template_file = !0;
  constructor(e, t, r) {
    super(e, t, r), this.audio_ms_per_token = this.config.audio_ms_per_token ?? 40, this.audio_seq_length = this.config.audio_seq_length ?? 750, this.image_seq_length = this.config.image_seq_length ?? 280;
    let { audio_token: n, boa_token: a, eoa_token: s, image_token: i, boi_token: o, eoi_token: l } = this.tokenizer.config;
    this.audio_token = n, this.boa_token = a, this.eoa_token = s, this.image_token = i, this.boi_token = o, this.eoi_token = l;
  }
  static async from_pretrained(e, t = {}) {
    let [r, n, a] = await Promise.all([nr(e, Rm, !0, t), Ae.from_pretrained(e, t), ol(e, Gm, !1, t)]), s = { tokenizer: n };
    return r.image_processor && (s.image_processor = new og(r.image_processor)), r.feature_extractor && (s.feature_extractor = new Xm(r.feature_extractor)), new this(r, s, a);
  }
  _compute_audio_num_tokens(e, t) {
    let r = Math.round(t * 20 / 1e3), n = Math.round(t * 10 / 1e3), a = Math.floor(r / 2), s = Math.floor((e + a - r - 1) / n) + 1;
    if (s <= 0) return 0;
    for (let i = 0; i < 2; ++i) s = Math.floor((s - 1) / 2) + 1;
    return Math.min(s, this.audio_seq_length);
  }
  async _call(e, t = null, r = null, n = {}) {
    typeof e == "string" && (e = [e]);
    let a;
    if (t) {
      a = await this.image_processor(t, n);
      let i = a.num_soft_tokens_per_image, o = 0;
      e = e.map((l) => l.replaceAll(this.image_token, () => `

${this.boi_token}${this.image_token.repeat(i[o++])}${this.eoi_token}

`));
    }
    let s;
    if (r) {
      let i = Array.isArray(r) ? r : [r];
      s = await this.feature_extractor(i[0], n);
      let o = this.feature_extractor.config.sampling_rate ?? 16e3, l = 0;
      e = e.map((c) => c.replaceAll(this.audio_token, () => `

${this.boa_token}${this.audio_token.repeat(this._compute_audio_num_tokens(i[l++].length, o))}${this.eoa_token}

`));
    }
    return { ...this.tokenizer(e, n), ...a, ...s };
  }
}, vl = class extends Ce {
  static image_processor_class = pt;
  static tokenizer_class = Ae;
  static image_token = "<|image_pad|>";
  async _call(e, t = null, ...r) {
    Array.isArray(e) || (e = [e]);
    let n, a;
    if (t && (n = await this.image_processor(t), a = n.image_grid_thw), a) {
      let s = this.image_processor.config.merge_size ** 2, i = 0, o = this.constructor.image_token, l = a.tolist();
      e = e.map((c) => {
        for (; c.includes(o); ) {
          let p = Number(l[i++].reduce((d, _) => d * _, 1n));
          c = c.replace(o, "<|placeholder|>".repeat(Math.floor(p / s)));
        }
        return c.replaceAll("<|placeholder|>", o);
      });
    }
    return { ...this.tokenizer(e), ...n };
  }
}, BA = class extends vl {
  static image_token = "<|image|>";
}, $A = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  static uses_processor_config = !0;
  _get_num_audio_features(e) {
    let { hop_length: t } = this.feature_extractor.config.melspec_kwargs, { projector_window_size: r, projector_downsample_rate: n } = this.feature_extractor.config, a = Math.floor(r / n), s = Math.floor(e / t) + 1, i = Math.floor(s / 2);
    return Math.ceil(i / r) * a;
  }
  async _call(e, t = null, r = {}) {
    if (Array.isArray(e)) throw new Error("Batched inputs are not supported yet.");
    let n = {};
    if (t) {
      let { input_features: a } = await this.feature_extractor(t);
      n.input_features = a;
      let s = this._get_num_audio_features(t.length), i = new Uint8Array(s).fill(1);
      n.input_features_mask = new V("bool", i, [1, s]);
      let o = this.config.audio_token ?? "<|audio|>";
      if (!e.includes(o)) throw new Error(`The input text does not contain the audio token ${o}.`);
      e = e.replaceAll(o, o.repeat(s));
    }
    return { ...this.tokenizer(e, { add_special_tokens: !1, ...r }), ...n };
  }
};
function DA(e, t) {
  let r = e.dims.at(-1) - 1, n = e.tolist();
  n.fill(!1, 0, 1), n.fill(!1, r);
  let a = t.tolist();
  return n.map((s, i) => s ? i : null).filter((s) => s !== null).map((s) => a[s]);
}
var RA = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
  async _call(e, t, r = {}) {
    let n = e ? await this.image_processor(e, r) : {};
    return { ...t ? this.tokenizer(t, r) : {}, ...n };
  }
  post_process_grounded_object_detection(e, t, { box_threshold: r = 0.25, text_threshold: n = 0.25, target_sizes: a = null } = {}) {
    let { logits: s, pred_boxes: i } = e, o = s.dims[0];
    if (a !== null && a.length !== o) throw Error("Make sure that you pass in as many target sizes as the batch dimension of the logits");
    let l = s.dims.at(1), c = s.sigmoid(), p = c.max(-1).tolist(), d = i.tolist().map((f) => f.map((w) => Zm(w))), _ = [];
    for (let f = 0; f < o; ++f) {
      let w = a !== null ? a[f] : null;
      w !== null && (d[f] = d[f].map((A) => A.map((E, S) => E * w[(S + 1) % 2])));
      let y = p[f], b = [], x = [], T = [];
      for (let A = 0; A < l; ++A) {
        let E = y[A];
        if (E <= r) continue;
        let S = d[f][A], O = c[f][A];
        b.push(E), T.push(S);
        let M = DA(O.gt(n), t[f]);
        x.push(M);
      }
      _.push({ scores: b, boxes: T, labels: this.batch_decode(x) });
    }
    return _;
  }
};
function GA(e, t, r, n, a, s) {
  let i = "";
  for (let o = 0; o < t; ++o) {
    for (let l = 0; l < r; ++l) i += n + `<row_${o + 1}_col_${l + 1}>` + a.repeat(e);
    i += `
`;
  }
  return i += `
${n}${s}` + a.repeat(e) + `${n}`, i;
}
function VA(e, t, r, n) {
  return `${t}${n}` + r.repeat(e) + `${t}`;
}
function UA(e, t, r, n, a, s) {
  return e === 0 && t === 0 ? VA(r, n, a, s) : GA(r, e, t, n, a, s);
}
var Cf = class extends Ce {
  static image_processor_class = pt;
  static tokenizer_class = Ae;
  static uses_processor_config = !0;
  fake_image_token = "<fake_token_around_image>";
  image_token = "<image>";
  global_img_token = "<global-img>";
  async _call(e, t = null, r = {}) {
    r.return_row_col_info ??= !0;
    let n;
    t && (n = await this.image_processor(t, r)), Array.isArray(e) || (e = [e]);
    let a = n.rows ?? [new Array(e.length).fill(0)], s = n.cols ?? [new Array(e.length).fill(0)], i = this.config.image_seq_len, o = [], l = [];
    for (let c = 0; c < e.length; ++c) {
      let p = e[c], d = a[c], _ = s[c];
      o.push(Gx(p, this.image_token));
      let f = d.map((b, x) => UA(b, _[x], i, this.fake_image_token, this.image_token, this.global_img_token)), w = p.split(this.image_token);
      if (w.length === 0) throw new Error("The image token should be present in the text.");
      let y = w[0];
      for (let b = 0; b < f.length; ++b) y += f[b] + w[b + 1];
      l.push(y);
    }
    return { ...this.tokenizer(l), ...n };
  }
}, qA = class extends Ce {
  static image_processor_class = pt;
  static tokenizer_class = Ae;
  static uses_processor_config = !0;
  constructor(e, t, r) {
    super(e, t, r), this.image_tag = this.config.image_tag, this.image_start_tag = this.config.image_start_tag, this.image_end_tag = this.config.image_end_tag, this.num_image_tokens = this.config.num_image_tokens;
  }
  async _call(e, { images: t = null, chat_template: r = "default" } = {}) {
    t ? Array.isArray(t) || (t = [t]) : t = await Promise.all(e.filter((y) => y.images).flatMap((y) => y.images).map((y) => kt.read(y)));
    let n = this.tokenizer, a = n.apply_chat_template(e, { tokenize: !1, add_generation_prompt: !0, chat_template: r }), s = (y) => n.encode(y, { add_special_tokens: !1 }), i = a.split(this.image_tag), o = i.length - 1;
    if (t.length !== o) throw new Error(`Number of images provided (${t.length}) does not match number of "${this.image_tag}" image tags (${o})`);
    let [l, c, p] = n.convert_tokens_to_ids([this.image_tag, this.image_start_tag, this.image_end_tag]), d = s(i[0]), _ = new Array(d.length).fill(!1);
    for (let y = 1; y < i.length; ++y) {
      let b = new Array(this.num_image_tokens).fill(l), x = s(i[y]);
      d = $t(d, [c], b, [p], x);
      let T = new Array(this.num_image_tokens).fill(!0);
      _ = $t(_, [!1], T, [!1], new Array(x.length).fill(!1));
    }
    let f = [1, d.length], w = { input_ids: new V("int64", d, f), attention_mask: new V("int64", new Array(d.length).fill(1), f), images_seq_mask: new V("bool", _, f), images_emb_mask: new V("bool", new Array(o * this.num_image_tokens).fill(!0), [1, o, this.num_image_tokens]) };
    if (t && t.length > 0) {
      let y = await this.image_processor(t);
      return y.pixel_values.unsqueeze_(0), { ...w, ...y };
    }
    return w;
  }
}, jA = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
  async _call(e = null, t = null, r = {}) {
    if (!e && !t) throw new Error("Either text or images must be provided");
    let n = e ? this.tokenizer(e, r) : {}, a = t ? await this.image_processor(t, r) : {};
    return { ...n, ...a };
  }
}, WA = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
  async _call(e, t = null, r = {}) {
    let { image_rows: n, image_cols: a, image_sizes: s, ...i } = await this.image_processor(e, { ...r, return_row_col_info: !0 });
    if (t) {
      let o = this.config.image_token ?? "<image>", { tile_size: l = 512, downsample_factor: c = 2, encoder_patch_size: p = 16, use_thumbnail: d = !0 } = this.image_processor.config, _ = (T) => Math.ceil(Math.floor(T / p) / c), f = _(l) ** 2, w = this.config.image_start_token ?? "<|image_start|>", y = this.config.image_end_token ?? "<|image_end|>", b = this.config.image_thumbnail ?? "<|img_thumbnail|>";
      Array.isArray(t) || (t = [t]);
      let x = 0;
      t = t.map((T) => {
        let A = T.split(o);
        return A[0] + A.slice(1).map((E) => {
          let S = x++, [O, M] = s[S], G = n[S], D = a[S], U = _(O) * _(M), q = w;
          if (G > 1 || D > 1) {
            let H = o.repeat(f);
            for (let Q = 0; Q < G; ++Q) for (let $ = 0; $ < D; ++$) q += `<|img_row_${Q + 1}_col_${$ + 1}|>` + H;
            d && (q += b + o.repeat(U));
          } else q += o.repeat(U);
          return q + y + E;
        }).join("");
      });
    }
    return { ...i, ...t ? this.tokenizer(t, r) : {} };
  }
}, HA = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
  static uses_processor_config = !0;
  async _call(e, t = null, r = {}) {
    let n = await this.image_processor(e, r);
    if (t) {
      let [s, i] = n.pixel_values.dims.slice(-2), { image_token: o, patch_size: l, num_additional_image_tokens: c } = this.config, p = Math.floor(s / l) * Math.floor(i / l) + c;
      t = structuredClone(t), Array.isArray(t) || (t = [t]);
      for (let d = 0; d < t.length; ++d) t[d] = t[d].replace(o, o.repeat(p));
    }
    let a = t ? this.tokenizer(t, r) : {};
    return { ...n, ...a };
  }
}, Sf = { char: ["char_decode", 1], bpe: ["bpe_decode", 2], wp: ["wp_decode", 102] }, QA = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
  get char_tokenizer() {
    return this.components.char_tokenizer;
  }
  get bpe_tokenizer() {
    return this.components.bpe_tokenizer;
  }
  get wp_tokenizer() {
    return this.components.wp_tokenizer;
  }
  _decode_helper(e, t) {
    if (!Sf.hasOwnProperty(t)) throw new Error(`Format ${t} is not supported.`);
    let [r, n] = Sf[t], a = this[r].bind(this), [s, i] = e.dims, o = [], l = [], c = e.tolist();
    for (let p = 0; p < s; ++p) {
      let d = c[p], _ = [], f = [];
      for (let y = 1; y < i; ++y) {
        let [b, x] = We(st(d[y]));
        if (f.push(b), x == n) break;
        _.push(x);
      }
      let w = f.length > 0 ? f.reduce((y, b) => y * b, 1) : 0;
      l.push(_), o.push(w);
    }
    return [a(l), o];
  }
  char_decode(e) {
    return this.char_tokenizer.batch_decode(e).map((t) => t.replaceAll(" ", ""));
  }
  bpe_decode(e) {
    return this.bpe_tokenizer.batch_decode(e);
  }
  wp_decode(e) {
    return this.wp_tokenizer.batch_decode(e).map((t) => t.replaceAll(" ", ""));
  }
  batch_decode([e, t, r]) {
    let [n, a] = this._decode_helper(e, "char"), [s, i] = this._decode_helper(t, "bpe"), [o, l] = this._decode_helper(r, "wp"), c = [], p = [];
    for (let d = 0; d < n.length; ++d) {
      let [_, f] = We([a[d], i[d], l[d]]);
      c.push([n[d], s[d], o[d]][f]), p.push(_);
    }
    return { generated_text: c, scores: p, char_preds: n, bpe_preds: s, wp_preds: o };
  }
  static async from_pretrained(...e) {
    let t = await super.from_pretrained(...e), r = await Ae.from_pretrained("Xenova/gpt2"), n = await Ae.from_pretrained("Xenova/bert-base-uncased");
    return t.components = { image_processor: t.image_processor, char_tokenizer: t.tokenizer, bpe_tokenizer: r, wp_tokenizer: n }, t;
  }
  async _call(e, t = null) {
    let r = await this.image_processor(e);
    return t && (r.labels = this.tokenizer(t).input_ids), r;
  }
}, XA = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  async _call(e) {
    return await this.feature_extractor(e);
  }
}, YA = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
}, bn = "<image>";
function JA(e, t, r, n, a) {
  return `${n.repeat(r * a)}${t}${e}
`;
}
var ZA = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
  static uses_processor_config = !1;
  async _call(e, t = null, r = {}) {
    t || (ce.warn("You are using PaliGemma without a text prefix. It will perform as a picture-captioning model."), t = ""), Array.isArray(e) || (e = [e]), Array.isArray(t) || (t = [t]);
    let n = this.tokenizer.bos_token, a = this.image_processor.config.image_seq_length, s;
    t.some((o) => o.includes(bn)) ? s = t.map((o) => {
      let l = o.replaceAll(bn, bn.repeat(a)), c = l.lastIndexOf(bn), p = c === -1 ? 0 : c + bn.length;
      return l.slice(0, p) + n + l.slice(p) + `
`;
    }) : (ce.warn("You are passing both `text` and `images` to `PaliGemmaProcessor`. The processor expects special image tokens in the text, as many tokens as there are images per each text. It is recommended to add `<image>` tokens in the very beginning of your text. For this call, we will infer how many images each text has and add special tokens."), s = t.map((o) => JA(o, n, a, bn, e.length)));
    let i = this.tokenizer(s, r);
    return { ...await this.image_processor(e, r), ...i };
  }
}, Pf = "<|image|>", KA = /<\|image_\d+\|>/g, eC = class extends Ce {
  static image_processor_class = pt;
  static tokenizer_class = Ae;
  async _call(e, t = null, { padding: r = !0, truncation: n = !0, num_crops: a = null } = {}) {
    Array.isArray(e) || (e = [e]);
    let s, i;
    if (t) {
      i = await this.image_processor(t, { num_crops: a });
      let { num_img_tokens: o } = i, l = e.map((p, d) => p.split(KA).join(Pf.repeat(o[d])));
      s = this.tokenizer(l, { padding: r, truncation: n });
      let c = this.tokenizer._tokenizer.token_to_id(Pf);
      s.input_ids.map_((p) => p == c ? -p : p);
    } else s = this.tokenizer(e);
    return { ...s, ...i };
  }
}, tC = class extends Ce {
  static tokenizer_class = Ae;
  static image_processor_class = pt;
  static uses_processor_config = !0;
  async _call(e, t = null, r = {}) {
    let n = await this.image_processor(e, r);
    if (t) {
      let [s, i] = n.pixel_values.dims.slice(-2), { image_token: o, image_break_token: l, image_end_token: c, patch_size: p, spatial_merge_size: d } = this.config, _ = p * d, f = Math.floor(s / _), w = Math.floor(i / _);
      t = structuredClone(t), Array.isArray(t) || (t = [t]);
      for (let y = 0; y < t.length; ++y) {
        let b = o.repeat(w), x = b + l, T = b + c, A = x.repeat(f - 1) + T;
        t[y] = t[y].replace(o, A);
      }
    }
    let a = t ? this.tokenizer(t, r) : {};
    return { ...n, ...a };
  }
}, rC = class extends Ce {
  static feature_extractor_class = Ym;
  async _call(e) {
    return await this.feature_extractor(e);
  }
  post_process_speaker_diarization(...e) {
    return this.feature_extractor.post_process_speaker_diarization(...e);
  }
  get sampling_rate() {
    return this.feature_extractor.config.sampling_rate;
  }
}, wg = class extends vl {
}, nC = class extends wg {
}, yg = class extends Ce {
  static image_processor_class = pt;
  async _call(...e) {
    return await this.image_processor(...e);
  }
  post_process_masks(...e) {
    return this.image_processor.post_process_masks(...e);
  }
  reshape_input_points(...e) {
    return this.image_processor.reshape_input_points(...e);
  }
}, bg = class extends yg {
}, aC = class extends bg {
}, sC = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  async _call(e) {
    return await this.feature_extractor(e);
  }
}, iC = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  static uses_processor_config = !0;
  async _call(e, t = null, r = {}) {
    if (Array.isArray(e)) throw new Error("Batched inputs are not supported yet.");
    let n = {};
    if (t) {
      let a = t.length, { input_features: s } = await this.feature_extractor(t, { ...r, max_length: a }), i = Math.round(a / this.config.encoder_ds_factor + 1e-4), o = 1 + Math.ceil(i / this.config.stack_factor);
      n.audio_token_len = [o], n.audio_values = s;
      let l = this.config.audio_placeholder;
      if (!e.includes(l)) throw new Error(`The input text does not contain the image token ${l}.`);
      e = e.replaceAll(l, l.repeat(o));
    }
    return { ...this.tokenizer(e, { add_special_tokens: !1, ...r }), ...n };
  }
}, is = "[AUDIO]", oC = "[BEGIN_AUDIO]", lC = 375;
function cC(e, t) {
  let r = [];
  for (let n = 0; n < e.length; n += t) r.push(e.subarray(n, Math.min(n + t, e.length)));
  return r;
}
var uC = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  static uses_processor_config = !1;
  async _call(e, t = null, r = {}) {
    if (Array.isArray(e)) throw new Error("Batched inputs are not supported yet.");
    let n = {};
    if (t) {
      if (!e.includes(is)) throw new Error(`The input text does not contain the audio token ${is}.`);
      Array.isArray(t) || (t = [t]);
      let a = e.split(is), s = a.length - 1;
      if (s !== t.length) throw new Error(`The number of audio inputs (${t.length}) does not match the number of audio tokens in the text (${s}).`);
      let i = this.feature_extractor.config.n_samples, o = t.map((_) => cC(_, i)), l = o.map((_) => _.length), c = o.flat(), p = (await Promise.all(c.map((_) => this.feature_extractor(_, r)))).map((_) => _.input_features);
      n.audio_values = p.length > 1 ? Ne(p, 0) : p[0];
      let d = a[0];
      for (let _ = 0; _ < l.length; ++_) {
        d += oC;
        for (let f = 0; f < l[_]; ++f) d += is.repeat(lC);
        d += a[_ + 1];
      }
      e = d;
    }
    return { ...this.tokenizer(e, { add_special_tokens: !1, ...r }), ...n };
  }
}, Ff = 32, Oo = 6, os = 8, dC = 10, pC = 32, hC = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  static uses_processor_config = !1;
  get num_mel_frames_first_audio_chunk() {
    return (Oo + 1) * os;
  }
  get num_samples_first_audio_chunk() {
    let { hop_length: e, n_fft: t } = this.feature_extractor.config;
    return (this.num_mel_frames_first_audio_chunk - 1) * e + Math.floor(t / 2);
  }
  get num_samples_per_audio_chunk() {
    let { hop_length: e, n_fft: t } = this.feature_extractor.config;
    return os * e + t;
  }
  get num_right_pad_tokens() {
    return Oo + 1 + dC;
  }
  get audio_length_per_tok() {
    return os;
  }
  get raw_audio_length_per_tok() {
    return os * this.feature_extractor.config.hop_length;
  }
  async _call(e, { is_streaming: t = !1, is_first_audio_chunk: r = !0 } = {}) {
    if (it(e, "VoxtralRealtimeProcessor"), !t && !r) throw new Error("In non-streaming mode (`is_streaming=false`), `is_first_audio_chunk` must be `true`.");
    if (r) if (t) {
      let n = Ff * this.raw_audio_length_per_tok, a = new Float32Array(n + e.length);
      a.set(e, n);
      let s = await this.feature_extractor(a, { center: !0 }), i = 1 + (Ff + Oo), o = new BigInt64Array(i).fill(BigInt(pC));
      return o[0] = 1n, { input_ids: new V("int64", o, [1, i]), ...s };
    } else {
      let n = this.num_right_pad_tokens * this.raw_audio_length_per_tok, a = new Float32Array(e.length + n);
      return a.set(e), await this.feature_extractor(a, { center: !0 });
    }
    else return await this.feature_extractor(e, { center: !1 });
  }
}, _C = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  async _call(e) {
    return await this.feature_extractor(e);
  }
}, fC = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  async _call(e) {
    return await this.feature_extractor(e);
  }
}, mC = class extends Ce {
  static tokenizer_class = Ae;
  static feature_extractor_class = Ft;
  async _call(e) {
    return await this.feature_extractor(e);
  }
}, gC = class {
  static async from_pretrained(e, t = {}) {
    let r = await nr(e, ha, !0, t), { image_processor_type: n, feature_extractor_type: a, processor_class: s } = r;
    if (s && qo[s]) return qo[s].from_pretrained(e, t);
    if (!n && !a) throw new Error("No `image_processor_type` or `feature_extractor_type` found in the config.");
    let i = {};
    if (n) {
      let l = Ts[n.replace(/Fast$/, "")];
      if (!l) throw new Error(`Unknown image_processor_type: '${n}'.`);
      i.image_processor = new l(r);
    }
    if (a) {
      let l = Ts[a];
      if (l) i.image_processor = new l(r);
      else {
        let c = ml[a];
        if (!c) throw new Error(`Unknown feature_extractor_type: '${a}'.`);
        i.feature_extractor = new c(r);
      }
    }
    let o = {};
    return new Ce(o, i, null);
  }
};
async function wC(e, t) {
  return await nr(e, "config.json", !0, t);
}
function vn(e) {
  let t = {}, r = {};
  switch (e.model_type) {
    case "llava":
    case "paligemma":
    case "gemma3":
    case "florence2":
    case "llava_onevision":
    case "idefics3":
    case "granite_speech":
    case "ultravox":
    case "voxtral":
    case "voxtral_realtime":
    case "smolvlm":
    case "gemma3n":
    case "gemma4":
    case "lfm2_vl":
    case "chatterbox":
    case "lighton_ocr":
    case "glm_ocr":
    case "mistral3":
    case "qwen2_5_vl":
    case "qwen3_vl":
    case "qwen3_vl_moe":
      r = vn(e.text_config);
      break;
    case "moondream1":
      r = vn(e.phi_config);
      break;
    case "musicgen":
      r = vn(e.decoder);
      break;
    case "multi_modality":
      r = vn(e.language_config);
      break;
    case "gpt2":
    case "gptj":
    case "jais":
    case "codegen":
    case "gpt_bigcode":
      t.num_heads = "n_head", t.num_layers = "n_layer", t.hidden_size = "n_embd";
      break;
    case "gpt_neox":
    case "stablelm":
    case "opt":
    case "falcon":
    case "modernbert-decoder":
      t.num_heads = "num_attention_heads", t.num_layers = "num_hidden_layers", t.hidden_size = "hidden_size";
      break;
    case "gpt_oss":
    case "llama":
    case "llama4_text":
    case "nanochat":
    case "apertus":
    case "arcee":
    case "afmoe":
    case "lfm2":
    case "lfm2_moe":
    case "smollm3":
    case "olmo":
    case "olmo2":
    case "olmo3":
    case "mobilellm":
    case "granite":
    case "granitemoehybrid":
    case "cohere":
    case "cohere2":
    case "mistral":
    case "voxtral_realtime_text":
    case "voxtral_realtime_encoder":
    case "starcoder2":
    case "qwen2":
    case "qwen2_moe":
    case "qwen2_vl":
    case "qwen2_vl_text":
    case "qwen2_5_vl_text":
    case "qwen3_moe":
    case "qwen3_vl_text":
    case "qwen3_vl_moe_text":
    case "phi":
    case "phi3":
    case "phi3_v":
    case "llava_qwen2":
      t.num_heads = "num_key_value_heads", t.num_layers = "num_hidden_layers", t.hidden_size = "hidden_size", t.num_attention_heads = "num_attention_heads", t.dim_kv = "head_dim";
      break;
    case "qwen3":
    case "solar_open":
    case "glm_ocr_text":
    case "gemma":
    case "gemma2":
    case "vaultgemma":
    case "gemma3_text":
    case "gemma3n_text":
    case "gemma4_text":
    case "glm":
    case "helium":
    case "ernie4_5":
    case "hunyuan_v1_dense":
    case "falcon_h1":
    case "nemotron_h":
    case "ministral":
    case "ministral3":
      t.num_heads = "num_key_value_heads", t.num_layers = "num_hidden_layers", t.dim_kv = "head_dim";
      break;
    case "openelm":
      t.num_heads = "num_kv_heads", t.num_layers = "num_transformer_layers", t.dim_kv = "head_dim";
      break;
    case "gpt_neo":
    case "donut-swin":
      t.num_heads = "num_heads", t.num_layers = "num_layers", t.hidden_size = "hidden_size";
      break;
    case "bloom":
      t.num_heads = "n_head", t.num_layers = "n_layer", t.hidden_size = "hidden_size";
      break;
    case "mpt":
      t.num_heads = "n_heads", t.num_layers = "n_layers", t.hidden_size = "d_model";
      break;
    case "exaone":
      t.num_heads = "num_key_value_heads", t.num_layers = "num_layers", t.dim_kv = "head_dim", t.num_attention_heads = "num_attention_heads";
      break;
    case "youtu":
    case "deepseek_v3":
    case "deepseek_v4":
    case "glm_moe_dsa":
    case "mistral4":
      t.num_heads = "num_key_value_heads", t.num_layers = "num_hidden_layers", t.dim_kv = e.model_type === "deepseek_v4" ? "head_dim" : "qk_head_dim", t.num_attention_heads = "num_attention_heads";
      break;
    case "zaya":
      t.num_heads = "num_key_value_heads", t.num_layers = "num_hidden_layers", t.hidden_size = "hidden_size", t.dim_kv = "head_dim", t.num_attention_heads = "num_attention_heads";
      break;
    case "hrm_text":
      t.num_heads = "num_key_value_heads", t.num_layers = "num_hidden_layers", t.hidden_size = "hidden_size", t.dim_kv = "head_dim", t.num_attention_heads = "num_attention_heads";
      break;
    case "t5":
    case "mt5":
    case "longt5":
      t.num_decoder_layers = "num_decoder_layers", t.num_decoder_heads = "num_heads", t.decoder_dim_kv = "d_kv", t.num_encoder_layers = "num_layers", t.num_encoder_heads = "num_heads", t.encoder_dim_kv = "d_kv";
      break;
    case "bart":
    case "mbart":
    case "marian":
    case "whisper":
    case "lite-whisper":
    case "m2m_100":
    case "blenderbot":
    case "blenderbot-small":
    case "florence2_language":
      t.num_decoder_layers = "decoder_layers", t.num_decoder_heads = "decoder_attention_heads", t.decoder_hidden_size = "d_model", t.num_encoder_layers = "encoder_layers", t.num_encoder_heads = "encoder_attention_heads", t.encoder_hidden_size = "d_model";
      break;
    case "speecht5":
      t.num_decoder_layers = "decoder_layers", t.num_decoder_heads = "decoder_attention_heads", t.decoder_hidden_size = "hidden_size", t.num_encoder_layers = "encoder_layers", t.num_encoder_heads = "encoder_attention_heads", t.encoder_hidden_size = "hidden_size";
      break;
    case "trocr":
      t.num_encoder_layers = t.num_decoder_layers = "decoder_layers", t.num_encoder_heads = t.num_decoder_heads = "decoder_attention_heads", t.encoder_hidden_size = t.decoder_hidden_size = "d_model";
      break;
    case "musicgen_decoder":
      t.num_encoder_layers = t.num_decoder_layers = "num_hidden_layers", t.num_encoder_heads = t.num_decoder_heads = "num_attention_heads", t.encoder_hidden_size = t.decoder_hidden_size = "hidden_size";
      break;
    case "moonshine":
      t.num_decoder_layers = "decoder_num_hidden_layers", t.num_decoder_heads = "decoder_num_key_value_heads", t.num_encoder_layers = "encoder_num_hidden_layers", t.num_encoder_heads = "encoder_num_key_value_heads", t.encoder_hidden_size = t.decoder_hidden_size = "hidden_size";
      break;
    case "cohere_asr":
      t.num_decoder_layers = "num_hidden_layers", t.num_decoder_heads = "num_key_value_heads", t.decoder_hidden_size = "hidden_size", t.decoder_dim_kv = "head_dim";
      let { num_hidden_layers: a, num_attention_heads: s, hidden_size: i } = e.encoder_config;
      r = { num_encoder_layers: a, num_encoder_heads: s, encoder_hidden_size: i, encoder_dim_kv: e.head_dim };
      break;
    case "vision-encoder-decoder":
      let o = vn(e.decoder), l = "num_decoder_layers" in o, c = et(e, ["model_type", "is_encoder_decoder"]);
      return l ? (c.num_decoder_layers = o.num_decoder_layers, c.num_decoder_heads = o.num_decoder_heads, c.decoder_hidden_size = o.decoder_hidden_size, c.num_encoder_layers = o.num_encoder_layers, c.num_encoder_heads = o.num_encoder_heads, c.encoder_hidden_size = o.encoder_hidden_size) : (c.num_layers = o.num_layers, c.num_heads = o.num_heads, c.hidden_size = o.hidden_size), c;
  }
  let n = { ...r, ...et(e, ["model_type", "multi_query", "is_encoder_decoder"]) };
  for (let a in t) n[a] = e[t[a]];
  return n;
}
function Ns(e, t) {
  e instanceof Wo || (e = new Wo(e));
  let r = t?.prefix ?? "past_key_values", n = r === "present" ? "present" : "past", a = /* @__PURE__ */ new Set();
  if (["lfm2", "lfm2_moe"].includes(e.model_type)) {
    let { layer_types: s } = e;
    for (let i = 0; i < s.length; ++i) if (s[i] === "full_attention") a.add(`${r}.${i}.key`), a.add(`${r}.${i}.value`);
    else if (s[i] === "conv") a.add(`${n}_conv.${i}`);
    else throw new Error(`Unsupported layer type: ${s[i]}`);
    return a;
  } else if (["granitemoehybrid", "falcon_h1", "nemotron_h"].includes(e.model_type)) {
    let s = e, i = s.layer_types ?? s.layers_block_type, o = s.num_hidden_layers ?? i?.length;
    for (let l = 0; l < o; ++l) (!i || i[l] === "mamba") && (a.add(`${n}_conv.${l}`), a.add(`${n}_ssm.${l}`)), (!i || i[l] === "attention") && (a.add(`${r}.${l}.key`), a.add(`${r}.${l}.value`));
    return a;
  } else if (["qwen3_next", "qwen3_5_text", "qwen3_5_moe_text", "olmo_hybrid"].includes(e.model_type)) {
    let { layer_types: s } = e;
    for (let i = 0; i < s.length; ++i) if (s[i] === "full_attention") a.add(`${r}.${i}.key`), a.add(`${r}.${i}.value`);
    else if (s[i] === "linear_attention") e.model_type === "olmo_hybrid" ? (a.add(`${n}_conv.${i}.key`), a.add(`${n}_conv.${i}.value`), a.add(`${n}_conv.${i}.query`)) : a.add(`${n}_conv.${i}`), a.add(`${n}_recurrent.${i}`);
    else throw new Error(`Unsupported layer type: ${s[i]}`);
    return a;
  } else if (["gemma4", "gemma4_text"].includes(e.model_type)) {
    let s = e.model_type === "gemma4" ? e.text_config : e, i = s.num_hidden_layers, o = s.num_kv_shared_layers ?? 0, l = i - o;
    for (let c = 0; c < l; ++c) a.add(`${r}.${c}.key`), a.add(`${r}.${c}.value`);
    return a;
  } else if (e.model_type === "deepseek_v4") {
    let { layer_types: s, num_hidden_layers: i } = e;
    for (let o = 0; o < i; ++o) {
      a.add(`${r}.${o}.key`), a.add(`${r}.${o}.value`);
      let l = s[o];
      if (l === "compressed_sparse_attention") a.add(`${n}_compressor.${o}.kv`), a.add(`${n}_compressor.${o}.gate`), a.add(`${n}_indexer.${o}.kv`), a.add(`${n}_indexer.${o}.gate`);
      else if (l === "heavily_compressed_attention") a.add(`${n}_compressor.${o}.kv`), a.add(`${n}_compressor.${o}.gate`);
      else if (l && l !== "sliding_attention") throw new Error(`Unsupported layer type: ${l}`);
    }
    return a;
  } else if (e.model_type === "zaya") {
    let { num_hidden_layers: s, cca_time1: i } = e, o = i ?? 1;
    for (let l = 0; l < s; l += o) a.add(`${r}.${l}.key`), a.add(`${r}.${l}.value`), a.add(`${r}.${l}.conv_state`), a.add(`${r}.${l}.shift_state`);
    return a;
  } else if (["lfm2_vl", "qwen3_5", "qwen3_5_moe", "voxtral_realtime"].includes(e.model_type)) {
    let s;
    return e.model_type === "voxtral_realtime" && t?.session_name === "audio_encoder" ? s = e.audio_config : s = e.text_config, Ns(s, t);
  }
  return yC(e, { prefix: r });
}
function yC(e, { prefix: t = "past_key_values" } = {}) {
  let r = /* @__PURE__ */ new Set(), n = e.normalized_config;
  if (n.is_encoder_decoder && "num_encoder_heads" in n && "num_decoder_heads" in n) for (let a = 0; a < n.num_decoder_layers; ++a) r.add(`${t}.${a}.encoder.key`), r.add(`${t}.${a}.encoder.value`), r.add(`${t}.${a}.decoder.key`), r.add(`${t}.${a}.decoder.value`);
  else if (n.multi_query) for (let a = 0; a < n.num_layers; ++a) r.add(`${t}.${a}.key_value`);
  else for (let a = 0; a < n.num_layers; ++a) r.add(`${t}.${a}.key`), r.add(`${t}.${a}.value`);
  return r;
}
var Wo = class Ho {
  model_type = null;
  is_encoder_decoder = !1;
  max_position_embeddings;
  "transformers.js_config";
  constructor(t) {
    Object.assign(this, t), this.normalized_config = vn(this);
  }
  static async from_pretrained(t, { progress_callback: r = null, config: n = null, cache_dir: a = null, local_files_only: s = !1, revision: i = "main" } = {}) {
    n && !(n instanceof Ho) && (n = new Ho(n));
    let o = n ?? await wC(t, { progress_callback: r, config: n, cache_dir: a, local_files_only: s, revision: i });
    return new this(o);
  }
}, _a = class {
  static async from_pretrained(...e) {
    return Wo.from_pretrained(...e);
  }
};
function vg(e, t, r) {
  return e ? typeof e == "object" && e !== null ? e.hasOwnProperty(t) ? +e[t] : e.hasOwnProperty(r) ? +e[r] : 0 : +e : 0;
}
function xg(e, t) {
  let r = [];
  for (let n = 0; n < t; ++n) r.push(`${e}_data${n === 0 ? "" : "_" + n}`);
  return r;
}
async function bC(e, t, r, n) {
  let a = `${t}${n}.onnx`, s = `${r.subfolder ?? ""}/${a}`;
  return await ks(e, s, !0, r, pe.IS_NODE_ENV);
}
async function vC(e, t, r, n, a, s = {}) {
  let i = `${t}${r}.onnx`, o = pe.IS_NODE_ENV, l = [], c = vg(a, i, t);
  if (c > 0) {
    if (c > cf) throw new Error(`The number of external data chunks (${c}) exceeds the maximum allowed value (${cf}).`);
    let p = xg(i, c);
    for (let d of p) {
      let _ = `${n.subfolder ?? ""}/${d}`;
      l.push(new Promise(async (f, w) => {
        let y = await ks(e, _, !0, n, o);
        f(y instanceof Uint8Array ? { path: d, data: y } : d);
      }));
    }
  } else s.externalData !== void 0 && (l = s.externalData.map(async (p) => {
    if (typeof p.data == "string") {
      let d = await ks(e, p.data, !0, n);
      return { ...p, data: d };
    }
    return p;
  }));
  return Promise.all(l);
}
async function xC(e, t, r, n = !1, a = void 0) {
  let s = r.config?.["transformers.js_config"] ?? {}, i = Sm(r.device ?? s.device, t, { warn: (b) => ce.info(b) }), o = jT(i), l = s.device_config ?? {};
  l.hasOwnProperty(i) && (s = { ...s, ...l[i] });
  let c = Pm(r.dtype ?? s.dtype, t, i, { configDtype: s.dtype, warn: (b) => ce.info(b) });
  if (da.hasOwnProperty(c)) {
    if (i === "webgpu" && !pe.IS_NODE_ENV && c === Qe.fp16 && !await QT()) throw new Error(`The device (${i}) does not support fp16.`);
  } else throw new Error(`Invalid dtype: ${c}. Should be one of: ${Object.keys(Qe).join(", ")}`);
  let p = da[c], d = { ...r.session_options };
  d.executionProviders ??= o;
  let _ = s.free_dimension_overrides;
  _ ? d.freeDimensionOverrides ??= _ : i.startsWith("webnn") && !d.freeDimensionOverrides && ce.warn(`WebNN does not currently support dynamic shapes and requires 'free_dimension_overrides' to be set in config.json, preferably as a field within config["transformers.js_config"]["device_config"]["${i}"]. When 'free_dimension_overrides' is not set, you may experience significant performance degradation.`);
  let f = bC(e, t, r, p), w = r.use_external_data_format ?? s.use_external_data_format, y = await vC(e, t, p, r, w, d);
  if (y.length > 0 && (!pe.IS_NODE_ENV || y.some((b) => typeof b != "string")) && (d.externalData = y), n && i === "webgpu") {
    let b = Ns(r.config, { prefix: "present", session_name: a });
    if (b.size > 0 && !ll()) {
      let x = {};
      for (let T of b) x[T] = "gpu-buffer";
      d.preferredOutputLocation = x;
    }
  }
  return { buffer_or_path: await f, session_options: d, session_config: { dtype: c, device: i } };
}
async function MC(e, t, r, n = void 0) {
  return Object.fromEntries(await Promise.all(Object.keys(t).map(async (a) => {
    let s = n?.[a] ?? !1, { buffer_or_path: i, session_options: o, session_config: l } = await xC(e, t[a], r, s, a), c = await Em(i, o, l);
    return [a, c];
  })));
}
function Mg(e) {
  for (let t in e) Cm(e[t]) ? e[t] = new V(e[t]) : typeof e[t] == "object" && Mg(e[t]);
  return e;
}
async function ye(e, t) {
  let r = kC(e, t);
  try {
    let n = Object.fromEntries(Object.entries(r).map(([s, i]) => {
      let o = i.ort_tensor;
      return pe.IS_NODE_ENV && typeof Float16Array < "u" && o.cpuData instanceof Float16Array && (o.cpuData = new Uint16Array(o.cpuData.buffer)), [s, o];
    })), a = await Am(e, n);
    return Mg(a);
  } catch (n) {
    let a = Object.fromEntries(Object.entries(r).map(([s, i]) => {
      let o = { type: i.type, dims: i.dims, location: i.location };
      return o.location !== "gpu-buffer" && (o.data = i.data), [s, o];
    }));
    throw ce.error(`An error occurred during model execution: "${n}".`), ce.error("Inputs given to model:", a), n;
  }
}
function kC(e, t) {
  let r = /* @__PURE__ */ Object.create(null), n = [];
  for (let i of e.inputNames) {
    let o = t[i];
    if (!(o instanceof V)) {
      n.push(i);
      continue;
    }
    r[i] = ll() ? o.clone() : o;
  }
  if (n.length > 0) throw new Error(`An error occurred during model execution: "Missing the following inputs: ${n.join(", ")}.`);
  let a = Object.keys(t).length, s = e.inputNames.length;
  if (a > s) {
    let i = Object.keys(t).filter((o) => !e.inputNames.includes(o));
    ce.warn(`WARNING: Too many inputs were provided (${a} > ${s}). The following inputs will be ignored: "${i.join(", ")}".`);
  }
  return r;
}
var Ge = class {
}, TC = class extends Ge {
  constructor({ last_hidden_state: e, hidden_states: t = null, attentions: r = null }) {
    super(), this.last_hidden_state = e, this.hidden_states = t, this.attentions = r;
  }
}, ne = class extends Ge {
  constructor({ logits: e, ...t }) {
    super(), this.logits = e;
    let r = Object.values(t);
    r.length > 0 && (this.attentions = r);
  }
}, He = class extends Ge {
  constructor({ logits: e }) {
    super(), this.logits = e;
  }
}, Xe = class extends Ge {
  constructor({ logits: e }) {
    super(), this.logits = e;
  }
}, ot = class extends Ge {
  constructor({ start_logits: e, end_logits: t }) {
    super(), this.start_logits = e, this.end_logits = t;
  }
}, Lr = class extends Ge {
  constructor({ logits: e }) {
    super(), this.logits = e;
  }
}, EC = class extends Ge {
  constructor({ logits: e, past_key_values: t }) {
    super(), this.logits = e, this.past_key_values = t;
  }
}, AC = class extends Ge {
  constructor({ logits: e, past_key_values: t, encoder_outputs: r, decoder_attentions: n = null, cross_attentions: a = null }) {
    super(), this.logits = e, this.past_key_values = t, this.encoder_outputs = r, this.decoder_attentions = n, this.cross_attentions = a;
  }
}, kg = class extends Ge {
  constructor({ alphas: e }) {
    super(), this.alphas = e;
  }
}, jt = class extends gt {
  _call(e, t) {
    throw Error("`_call` should be implemented in a subclass");
  }
}, xl = class extends gt {
  _call(e, t) {
    throw Error("`_call` should be implemented in a subclass");
  }
}, Qo = class extends gt {
  constructor() {
    super(), this.processors = [];
  }
  push(e) {
    this.processors.push(e);
  }
  extend(e) {
    this.processors.push(...e);
  }
  _call(e, t) {
    let r = t;
    for (let n of this.processors) r = n(e, r);
    return r;
  }
  [Symbol.iterator]() {
    return this.processors.values();
  }
}, CC = class extends jt {
  constructor(e) {
    super(), this.bos_token_id = e;
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) if (e[r].length === 1) {
      let n = t[r].data;
      n.fill(-1 / 0), n[this.bos_token_id] = 0;
    }
    return t;
  }
}, SC = class extends jt {
  constructor(e, t) {
    super(), this.max_length = e, this.eos_token_id = Array.isArray(t) ? t : [t];
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) if (e[r].length === this.max_length - 1) {
      let n = t[r].data;
      n.fill(-1 / 0);
      for (let a of this.eos_token_id) n[a] = 0;
    }
    return t;
  }
}, PC = class extends jt {
  constructor(e) {
    super(), this.suppress_tokens = e;
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) {
      let n = t[r].data;
      for (let a of this.suppress_tokens) n[a] = -1 / 0;
    }
    return t;
  }
}, Tg = class extends jt {
  constructor(e, t) {
    super(), this.begin_suppress_tokens = e, this.begin_index = t;
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) if (e[r].length === this.begin_index) {
      let n = t[r].data;
      for (let a of this.begin_suppress_tokens) n[a] = -1 / 0;
    }
    return t;
  }
}, FC = class extends jt {
  constructor(e, t) {
    super(), this.eos_token_id = Array.isArray(e.eos_token_id) ? e.eos_token_id[0] : e.eos_token_id, this.no_timestamps_token_id = e.no_timestamps_token_id, this.timestamp_begin = this.no_timestamps_token_id + 1, this.begin_index = t.length, t.at(-1) === this.no_timestamps_token_id && (this.begin_index -= 1), this.max_initial_timestamp_index = e.max_initial_timestamp_index;
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) {
      let n = t[r].data;
      if (n[this.no_timestamps_token_id] = -1 / 0, e[r].length === this.begin_index) {
        n.subarray(0, this.timestamp_begin).fill(-1 / 0);
        continue;
      }
      let a = e[r].slice(this.begin_index), s = a.length >= 1 && a[a.length - 1] >= this.timestamp_begin, i = a.length < 2 || a[a.length - 2] >= this.timestamp_begin;
      if (s && (i ? n.subarray(this.timestamp_begin).fill(-1 / 0) : n.subarray(0, this.eos_token_id).fill(-1 / 0)), e[r].length === this.begin_index && this.max_initial_timestamp_index !== null) {
        let p = this.timestamp_begin + this.max_initial_timestamp_index;
        n.subarray(p + 1).fill(-1 / 0);
      }
      let o = FT(n), l = Math.log(o.subarray(this.timestamp_begin).map(Math.exp).reduce((p, d) => p + d)), c = We(o.subarray(0, this.timestamp_begin))[0];
      l > c && n.subarray(0, this.timestamp_begin).fill(-1 / 0);
    }
    return t;
  }
}, IC = class extends jt {
  constructor(e) {
    super(), this.no_repeat_ngram_size = e;
  }
  getNgrams(e) {
    let t = e.length, r = [];
    for (let a = 0; a < t + 1 - this.no_repeat_ngram_size; ++a) {
      let s = [];
      for (let i = 0; i < this.no_repeat_ngram_size; ++i) s.push(e[a + i]);
      r.push(s.map(Number));
    }
    let n = /* @__PURE__ */ new Map();
    for (let a of r) {
      let s = a.slice(0, a.length - 1), i = JSON.stringify(s), o = n.get(i) ?? [];
      o.push(a[a.length - 1]), n.set(i, o);
    }
    return n;
  }
  getGeneratedNgrams(e, t) {
    let r = t.slice(t.length + 1 - this.no_repeat_ngram_size, t.length);
    return e.get(JSON.stringify(r.map(Number))) ?? [];
  }
  calcBannedNgramTokens(e) {
    let t = [];
    if (e.length + 1 < this.no_repeat_ngram_size) return t;
    {
      let r = this.getNgrams(e);
      return this.getGeneratedNgrams(r, e);
    }
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) {
      let n = t[r].data, a = this.calcBannedNgramTokens(e[r]);
      for (let s of a) n[s] = -1 / 0;
    }
    return t;
  }
}, LC = class extends jt {
  constructor(e) {
    super(), this.penalty = e;
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) {
      let n = t[r].data;
      for (let a of new Set(e[r])) {
        let s = Number(a);
        n[s] < 0 ? n[s] *= this.penalty : n[s] /= this.penalty;
      }
    }
    return t;
  }
}, OC = class extends jt {
  constructor(e, t) {
    super(), this.min_length = e, this.eos_token_id = Array.isArray(t) ? t : [t];
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) if (e[r].length < this.min_length) {
      let n = t[r].data;
      for (let a of this.eos_token_id) n[a] = -1 / 0;
    }
    return t;
  }
}, zC = class extends jt {
  constructor(e, t, r) {
    super(), this.prompt_length_to_skip = e, this.min_new_tokens = t, this.eos_token_id = Array.isArray(r) ? r : [r];
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) if (e[r].length - this.prompt_length_to_skip < this.min_new_tokens) {
      let n = t[r].data;
      for (let a of this.eos_token_id) n[a] = -1 / 0;
    }
    return t;
  }
}, NC = class extends jt {
  constructor(e, t) {
    super(), this.bad_words_ids = e, this.eos_token_id = Array.isArray(t) ? t : [t];
  }
  _call(e, t) {
    for (let r = 0; r < e.length; ++r) {
      let n = t[r].data, a = e[r];
      for (let s of this.bad_words_ids) {
        if (a.length < s.length - 1) continue;
        let i = !0;
        for (let o = 1; o <= s.length - 1; ++o) if (s.at(-o - 1) != a.at(-o)) {
          i = !1;
          break;
        }
        i && (n[s.at(-1)] = -1 / 0);
      }
    }
    return t;
  }
}, BC = class extends jt {
  constructor(e) {
    if (super(), e <= 1) throw new Error(`Require guidance scale >1 to use the classifier-free guidance processor, got guidance scale ${e}.`);
    this.guidance_scale = e;
  }
  _call(e, t) {
    if (t.dims[0] !== 2 * e.length) throw new Error(`Logits should have twice the batch size of the input ids, the first half of batches corresponding to the conditional inputs, and the second half of batches corresponding to the unconditional inputs. Got batch size ${t.dims[0]} for the logits and ${e.length} for the input ids.`);
    let r = e.length, n = t.slice([0, r], null), a = t.slice([r, t.dims[0]], null);
    for (let s = 0; s < a.data.length; ++s) a.data[s] += (n.data[s] - a.data[s]) * this.guidance_scale;
    return a;
  }
}, $C = class extends xl {
  constructor(e) {
    if (super(), typeof e != "number" || e <= 0) {
      let t = `\`temperature\` (=${e}) must be a strictly positive float, otherwise your next token scores will be invalid.`;
      e === 0 && (t += " If you're looking for greedy decoding strategies, set `do_sample=false`.");
    }
    this.temperature = e;
  }
  _call(e, t) {
    let r = t.data;
    for (let n = 0; n < r.length; ++n) r[n] /= this.temperature;
    return t;
  }
}, d$ = class extends xl {
  constructor(e, { filter_value: t = -1 / 0, min_tokens_to_keep: r = 1 } = {}) {
    if (super(), e < 0 || e > 1) throw new Error(`\`top_p\` must be a float > 0 and < 1, but is ${e}`);
    if (!Number.isInteger(r) || r < 1) throw new Error(`\`min_tokens_to_keep\` must be a positive integer, but is ${r}`);
    this.top_p = e, this.filter_value = t, this.min_tokens_to_keep = r;
  }
}, p$ = class extends xl {
  constructor(e, { filter_value: t = -1 / 0, min_tokens_to_keep: r = 1 } = {}) {
    if (super(), !Number.isInteger(e) || e < 0) throw new Error(`\`top_k\` must be a positive integer, but is ${e}`);
    this.top_k = Math.max(e, r), this.filter_value = t;
  }
}, Eg = class {
  max_length = 20;
  max_new_tokens = null;
  min_length = 0;
  min_new_tokens = null;
  early_stopping = !1;
  max_time = null;
  do_sample = !1;
  num_beams = 1;
  num_beam_groups = 1;
  penalty_alpha = null;
  use_cache = !0;
  temperature = 1;
  top_k = 50;
  top_p = 1;
  typical_p = 1;
  epsilon_cutoff = 0;
  eta_cutoff = 0;
  diversity_penalty = 0;
  repetition_penalty = 1;
  encoder_repetition_penalty = 1;
  length_penalty = 1;
  no_repeat_ngram_size = 0;
  bad_words_ids = null;
  force_words_ids = null;
  renormalize_logits = !1;
  constraints = null;
  forced_bos_token_id = null;
  forced_eos_token_id = null;
  remove_invalid_values = !1;
  exponential_decay_length_penalty = null;
  suppress_tokens = null;
  streamer = null;
  begin_suppress_tokens = null;
  forced_decoder_ids = null;
  guidance_scale = null;
  num_return_sequences = 1;
  output_attentions = !1;
  output_hidden_states = !1;
  output_scores = !1;
  return_dict_in_generate = !1;
  pad_token_id = null;
  bos_token_id = null;
  eos_token_id = null;
  encoder_no_repeat_ngram_size = 0;
  decoder_start_token_id = null;
  generation_kwargs = {};
  constructor(e) {
    Object.assign(this, et(e, Object.getOwnPropertyNames(this)));
  }
}, ba = class extends gt {
  _call(e, t) {
    throw Error("StoppingCriteria needs to be subclassed");
  }
}, Ag = class Cg extends gt {
  constructor() {
    super(), this.criteria = [];
  }
  push(t) {
    this.criteria.push(t);
  }
  extend(t) {
    t instanceof Cg ? t = t.criteria : t instanceof ba && (t = [t]), this.criteria.push(...t);
  }
  _call(t, r) {
    let n = new Array(t.length).fill(!1);
    for (let a of this.criteria) {
      let s = a(t, r);
      for (let i = 0; i < n.length; ++i) n[i] ||= s[i];
    }
    return n;
  }
  [Symbol.iterator]() {
    return this.criteria.values();
  }
}, DC = class extends ba {
  constructor(e, t = null) {
    super(), this.max_length = e, this.max_position_embeddings = t;
  }
  _call(e) {
    return e.map((t) => t.length >= this.max_length);
  }
}, RC = class extends ba {
  constructor(e) {
    super(), Array.isArray(e) || (e = [e]), this.eos_token_id = e;
  }
  _call(e, t) {
    return e.map((r) => {
      let n = r.at(-1);
      return this.eos_token_id.some((a) => n == a);
    });
  }
}, h$ = class extends ba {
  constructor() {
    super(), this.interrupted = !1;
  }
  interrupt() {
    this.interrupted = !0;
  }
  reset() {
    this.interrupted = !1;
  }
  _call(e, t) {
    return new Array(e.length).fill(this.interrupted);
  }
}, Bs = class extends gt {
  constructor(e) {
    super(), this.generation_config = e;
  }
  async _call(e) {
    return this.sample(e);
  }
  async sample(e) {
    throw Error("sample should be implemented in subclasses.");
  }
  getLogits(e, t) {
    let r = e.dims.at(-1), n = e.data;
    if (t === -1) n = n.slice(-r);
    else {
      let a = t * r;
      n = n.slice(a, a + r);
    }
    return n;
  }
  randomSelect(e) {
    return _T(e);
  }
  static getSampler(e) {
    if (e.do_sample) return new VC(e);
    if (e.num_beams > 1) return new UC(e);
    if (e.num_return_sequences > 1) throw Error(`num_return_sequences has to be 1 when doing greedy search, but is ${e.num_return_sequences}.`);
    return new GC(e);
  }
}, GC = class extends Bs {
  async sample(e) {
    let t = We(e.data)[1];
    return [[BigInt(t), 0]];
  }
}, VC = class extends Bs {
  async sample(e) {
    let t = e.dims.at(-1);
    this.generation_config.top_k > 0 && (t = Math.min(this.generation_config.top_k, t));
    let [r, n] = await In(e, t), a = st(r.data);
    return Array.from({ length: this.generation_config.num_beams }, () => {
      let s = this.randomSelect(a);
      return [n.data[s], Math.log(a[s])];
    });
  }
}, UC = class extends Bs {
  async sample(e) {
    let t = e.dims.at(-1);
    this.generation_config.top_k > 0 && (t = Math.min(this.generation_config.top_k, t));
    let [r, n] = await In(e, t), a = st(r.data);
    return Array.from({ length: this.generation_config.num_beams }, (s, i) => [n.data[i], Math.log(a[i])]);
  }
}, qC = class {
  constructor(e) {
    if (e) for (let t in e) {
      if (t in this) throw new TypeError(`Key "${t}" conflicts with an existing property on DynamicCache`);
      let r = e[t];
      if (!(r instanceof V)) throw new TypeError(`Expected a Tensor for key "${t}", got ${typeof r}`);
      this[t] = r;
    }
  }
  get_seq_length() {
    let e = this;
    if (Object.keys(e).length === 0) return 0;
    for (let t in e) if (t.startsWith("past_key_values.")) return e[t].dims.at(-2);
    throw new Error("Unable to determine sequence length from the cache.");
  }
  update(e) {
    for (let t in e) {
      let r = this[t], n = e[t];
      r && r !== n && r.location === "gpu-buffer" && r.dispose(), this[t] = n;
    }
  }
  async dispose() {
    let e = [];
    for (let t of Object.values(this)) t.location === "gpu-buffer" && e.push(t.dispose());
    await Promise.all(e);
  }
}, Ml = qC, W = { EncoderOnly: 0, EncoderDecoder: 1, Seq2Seq: 2, Vision2Seq: 3, DecoderOnly: 4, DecoderOnlyWithoutHead: 5, MaskGeneration: 6, ImageTextToText: 7, Musicgen: 8, MultiModality: 9, Phi3V: 10, AudioTextToText: 11, AutoEncoder: 12, ImageAudioTextToText: 13, Supertonic: 14, Chatterbox: 15, VoxtralRealtime: 16 }, dr = { [W.DecoderOnly]: { sessions: (e, t) => ({ model: t.model_file_name ?? "model" }), cache_sessions: { model: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.DecoderOnlyWithoutHead]: { sessions: (e, t) => ({ model: t.model_file_name ?? "model" }) }, [W.Seq2Seq]: { sessions: () => ({ model: "encoder_model", decoder_model_merged: "decoder_model_merged" }), cache_sessions: { decoder_model_merged: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.Vision2Seq]: { sessions: () => ({ model: "encoder_model", decoder_model_merged: "decoder_model_merged" }), cache_sessions: { decoder_model_merged: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.Musicgen]: { sessions: () => ({ model: "text_encoder", decoder_model_merged: "decoder_model_merged", encodec_decode: "encodec_decode" }), cache_sessions: { decoder_model_merged: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.EncoderDecoder]: { sessions: () => ({ model: "encoder_model", decoder_model_merged: "decoder_model_merged" }), cache_sessions: { decoder_model_merged: !0 } }, [W.MaskGeneration]: { sessions: () => ({ model: "vision_encoder", prompt_encoder_mask_decoder: "prompt_encoder_mask_decoder" }) }, [W.ImageTextToText]: { text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" }, sessions: (e, t, r) => {
  let n = { ...dr[W.ImageTextToText].text_only_sessions };
  return r || (n.vision_encoder = "vision_encoder"), e.is_encoder_decoder && (n.model = "encoder_model"), n;
}, cache_sessions: { decoder_model_merged: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.AudioTextToText]: { text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" }, sessions: (e, t, r) => {
  let n = { ...dr[W.AudioTextToText].text_only_sessions };
  return r || (n.audio_encoder = "audio_encoder"), n;
}, cache_sessions: { decoder_model_merged: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.ImageAudioTextToText]: { text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" }, sessions: (e, t, r) => {
  let n = { ...dr[W.ImageAudioTextToText].text_only_sessions };
  return r || (n.audio_encoder = "audio_encoder", n.vision_encoder = "vision_encoder"), n;
}, cache_sessions: { decoder_model_merged: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.Phi3V]: { sessions: () => ({ prepare_inputs_embeds: "prepare_inputs_embeds", model: "model", vision_encoder: "vision_encoder" }), cache_sessions: { model: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.MultiModality]: { sessions: () => ({ prepare_inputs_embeds: "prepare_inputs_embeds", model: "language_model", lm_head: "lm_head", gen_head: "gen_head", gen_img_embeds: "gen_img_embeds", image_decode: "image_decode" }), cache_sessions: { model: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.AutoEncoder]: { sessions: () => ({ encoder_model: "encoder_model", decoder_model: "decoder_model" }) }, [W.Supertonic]: { sessions: () => ({ text_encoder: "text_encoder", latent_denoiser: "latent_denoiser", voice_decoder: "voice_decoder" }) }, [W.Chatterbox]: { sessions: () => ({ embed_tokens: "embed_tokens", speech_encoder: "speech_encoder", model: "language_model", conditional_decoder: "conditional_decoder" }), cache_sessions: { model: !0 }, optional_configs: { generation_config: "generation_config.json" } }, [W.VoxtralRealtime]: { text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" }, sessions: (e, t, r) => {
  let n = { ...dr[W.VoxtralRealtime].text_only_sessions };
  return r || (n.audio_encoder = "audio_encoder"), n;
}, cache_sessions: { decoder_model_merged: !0, audio_encoder: !0 }, optional_configs: { generation_config: "generation_config.json" } }, default: { sessions: (e, t) => ({ model: t.model_file_name ?? "model" }) } };
function jC(e) {
  return dr[e]?.text_only_sessions ?? null;
}
function Sg(e, t, r = {}) {
  let n = dr[e] ?? dr.default;
  return { sessions: n.sessions(t, r, r.textOnly ?? !1), cache_sessions: n.cache_sessions, optional_configs: n.optional_configs };
}
function kl(e, { warn: t = !0 } = {}) {
  let r = e.architectures || [];
  for (let n of r) {
    let a = pr.get(n);
    if (a !== void 0) return a;
  }
  if (e.model_type) {
    let n = pr.get(e.model_type);
    if (n !== void 0) return n;
    for (let a of Object.values(xn)) if (a.has(e.model_type)) {
      let s = pr.get(a.get(e.model_type));
      if (s !== void 0) return s;
    }
  }
  if (t) {
    let n = r.length > 0 ? r.join(", ") : "(none)";
    ce.warn(`[resolve_model_type] Architecture(s) not found in MODEL_TYPE_MAPPING: [${n}] for model type '${e.model_type}'. Falling back to EncoderOnly (single model.onnx file). If you encounter issues, please report at: ${Os}`);
  }
  return W.EncoderOnly;
}
function Tl(e, { config: t = null, cache_dir: r = null, local_files_only: n = !1, revision: a = "main" } = {}) {
  if (t !== null) return _a.from_pretrained(e, { config: t, cache_dir: r, local_files_only: n, revision: a });
  let s = il(e, { cache_dir: r, local_files_only: n, revision: a });
  return bm(s, () => _a.from_pretrained(e, { config: t, cache_dir: r, local_files_only: n, revision: a }));
}
async function El(e, { config: t = null, dtype: r = null, device: n = null, model_file_name: a = null } = {}) {
  t = await Tl(e, { config: t });
  let s = ["config.json"], i = t["transformers.js_config"] ?? {}, o = i.use_external_data_format, l = "onnx", c = n ?? i.device, p = r ?? i.dtype, d = kl(t), _ = (y, b = null) => {
    b = b ?? y;
    let x = Sm(c, y), T = Pm(p, y, x), A = da[T] ?? "", E = `${b}${A}.onnx`, S = l ? `${l}/${E}` : E;
    s.push(S);
    let O = vg(o, E, y);
    for (let M of xg(E, O)) {
      let G = l ? `${l}/${M}` : M;
      s.push(G);
    }
  }, { sessions: f, optional_configs: w } = Sg(d, t, { model_file_name: a });
  for (let [y, b] of Object.entries(f)) _(y, b);
  if (w) for (let y of Object.values(w)) s.push(y);
  return s;
}
var xn = null;
function WC(e) {
  xn = e;
}
function Xo(e) {
  if (e instanceof V) return e;
  if (e.length === 0) throw Error("items must be non-empty");
  if (Array.isArray(e[0])) {
    if (e.some((t) => t.length !== e[0].length)) throw Error("Unable to create tensor, you should probably activate truncation and/or padding with 'padding=True' and/or 'truncation=True' to have batched tensors with the same length.");
    return new V("int64", BigInt64Array.from(e.flat().map((t) => BigInt(t))), [e.length, e[0].length]);
  } else return new V("int64", BigInt64Array.from(e.map((t) => BigInt(t))), [1, e.length]);
}
function Pg(e) {
  return new V("bool", [e], [1]);
}
var If = { [W.DecoderOnly]: { can_generate: !0, forward: _r, prepare_inputs: Cn }, [W.DecoderOnlyWithoutHead]: { can_generate: !1, forward: _r, prepare_inputs: Cn }, [W.Seq2Seq]: { can_generate: !0, forward: ls, prepare_inputs: Es }, [W.Vision2Seq]: { can_generate: !0, forward: ls, prepare_inputs: Es }, [W.Musicgen]: { can_generate: !0, forward: ls }, [W.EncoderDecoder]: { can_generate: !1, forward: ls }, [W.ImageTextToText]: { can_generate: !0, forward: YC, prepare_inputs: cs }, [W.AudioTextToText]: { can_generate: !0, forward: XC, prepare_inputs: cs }, [W.ImageAudioTextToText]: { can_generate: !0, prepare_inputs: cs }, [W.Phi3V]: { can_generate: !0, prepare_inputs: cs }, [W.MultiModality]: { can_generate: !0 }, [W.AutoEncoder]: { can_generate: !1, forward: HC }, [W.Chatterbox]: { can_generate: !0, forward: Ir }, [W.VoxtralRealtime]: { can_generate: !0, prepare_inputs: Cn }, default: { can_generate: !1, forward: Ir } };
function Lf(e, t) {
  let r = pr.get(e), n = !1, a = t?.architectures?.[0];
  if (a && a !== e && e?.endsWith("ForCausalLM") && a.endsWith("ForConditionalGeneration")) {
    let o = pr.get(a);
    o !== void 0 && (r = o, n = !0);
  }
  let s = If[r] ?? If.default, i = dr[r] ?? dr.default;
  return { typeConfig: { ...s, ...i }, textOnly: n, modelType: r };
}
var pr = /* @__PURE__ */ new Map(), Al = /* @__PURE__ */ new Map(), An = /* @__PURE__ */ new Map(), I = class extends gt {
  main_input_name = "input_ids";
  forward_params = ["input_ids", "attention_mask"];
  _return_dict_in_generate_keys = null;
  constructor(e, t, r) {
    super(), this.config = e, this.sessions = t, this.configs = r;
    let n = An.get(this.constructor), { typeConfig: a } = Lf(n, e);
    this.can_generate = a.can_generate, this._forward = a.forward, this._prepare_inputs_for_generation = a.prepare_inputs, this.can_generate && this.forward_params.push("past_key_values"), this.custom_config = this.config["transformers.js_config"] ?? {};
  }
  async dispose() {
    let e = [];
    for (let t of Object.values(this.sessions)) e.push(t.release?.());
    return await Promise.all(e);
  }
  static async from_pretrained(e, { progress_callback: t = null, config: r = null, cache_dir: n = null, local_files_only: a = !1, revision: s = "main", model_file_name: i = null, subfolder: o = "onnx", device: l = null, dtype: c = null, use_external_data_format: p = null, session_options: d = {} } = {}) {
    let _ = { progress_callback: t, config: r, cache_dir: n, local_files_only: a, revision: s, model_file_name: i, subfolder: o, device: l, dtype: c, use_external_data_format: p, session_options: d }, f = An.get(this);
    r = _.config = await _a.from_pretrained(e, _);
    let { typeConfig: w, textOnly: y, modelType: b } = Lf(f, r);
    if (b === void 0) {
      let E = f ?? r?.model_type;
      E !== "custom" && ce.warn(`Model type for '${E}' not found, assuming encoder-only architecture. Please report this at ${Os}.`);
    }
    if (t && !(t instanceof fs)) {
      let E = {};
      try {
        let S = await El(e, { config: r, dtype: c, device: l, model_file_name: i });
        (await Promise.all(S.map((O) => an(e, O, _)))).forEach((O, M) => {
          if (O.exists) {
            let G = S[M] === "config.json";
            E[S[M]] = { loaded: G ? O.size ?? 0 : 0, total: O.size ?? 0 };
          }
        });
      } catch (S) {
        ce.warn(`Unable to fetch model file metadata for total progress tracking: ${S}`);
      }
      Object.keys(E).length > 0 && (_.progress_callback = new fs(t, E));
    }
    let x = w.sessions(r, _, y), T = [MC(e, x, _, w.cache_sessions)];
    w.optional_configs && T.push(ZC(e, w.optional_configs, _));
    let A = await Promise.all(T);
    return new this(r, ...A);
  }
  async _call(e) {
    return await this.forward(e);
  }
  async forward(e) {
    return await this._forward(this, e);
  }
  get generation_config() {
    return this.configs?.generation_config ?? null;
  }
  _get_logits_processor(e, t, r = null) {
    let n = new Qo();
    if (e.repetition_penalty !== null && e.repetition_penalty !== 1 && n.push(new LC(e.repetition_penalty)), e.no_repeat_ngram_size !== null && e.no_repeat_ngram_size > 0 && n.push(new IC(e.no_repeat_ngram_size)), e.bad_words_ids !== null && n.push(new NC(e.bad_words_ids, e.eos_token_id)), e.min_length !== null && e.eos_token_id !== null && e.min_length > 0 && n.push(new OC(e.min_length, e.eos_token_id)), e.min_new_tokens !== null && e.eos_token_id !== null && e.min_new_tokens > 0 && n.push(new zC(t, e.min_new_tokens, e.eos_token_id)), e.forced_bos_token_id !== null && n.push(new CC(e.forced_bos_token_id)), e.forced_eos_token_id !== null && n.push(new SC(e.max_length, e.forced_eos_token_id)), e.suppress_tokens !== null && n.push(new PC(e.suppress_tokens)), e.begin_suppress_tokens !== null) {
      let a = t > 1 || e.forced_bos_token_id === null ? t : t + 1;
      n.push(new Tg(e.begin_suppress_tokens, a));
    }
    return e.guidance_scale !== null && e.guidance_scale > 1 && n.push(new BC(e.guidance_scale)), e.temperature === 0 && e.do_sample && (ce.warn("`do_sample` changed to false because `temperature: 0` implies greedy sampling (always selecting the most likely token), which is incompatible with `do_sample: true`."), e.do_sample = !1), e.do_sample && e.temperature !== null && e.temperature !== 1 && n.push(new $C(e.temperature)), r !== null && n.extend(r), n;
  }
  _prepare_generation_config(e, t, r = Eg) {
    let n = { ...this.config };
    for (let s of ["decoder", "generator", "text_config"]) s in n && Object.assign(n, n[s]);
    let a = new r(n);
    return Object.assign(a, this.generation_config ?? {}), e && Object.assign(a, e), t && Object.assign(a, et(t, Object.getOwnPropertyNames(a))), a;
  }
  _get_stopping_criteria(e, t = null) {
    let r = new Ag();
    return e.max_length !== null && r.push(new DC(e.max_length, this.config.max_position_embeddings ?? null)), e.eos_token_id !== null && r.push(new RC(e.eos_token_id)), t && r.extend(t), r;
  }
  _validate_model_class() {
    if (!this.can_generate) {
      let e = [xn.MODEL_FOR_CAUSAL_LM_MAPPING_NAMES, xn.MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES, xn.MODEL_FOR_SEQ_TO_SEQ_CAUSAL_LM_MAPPING_NAMES, xn.MODEL_FOR_SPEECH_SEQ_2_SEQ_MAPPING_NAMES].filter(Boolean), t = An.get(this.constructor), r = /* @__PURE__ */ new Set(), n = this.config.model_type;
      for (let s of e) {
        let i = s?.get(n);
        i && r.add(i);
      }
      let a = `The current model class (${t}) is not compatible with \`.generate()\`, as it doesn't have a language model head.`;
      throw r.size > 0 && (a += ` Please use the following class instead: ${[...r].join(", ")}`), Error(a);
    }
  }
  prepare_inputs_for_generation(...e) {
    if (!this._prepare_inputs_for_generation) throw new Error("prepare_inputs_for_generation is not implemented for this model.");
    return this._prepare_inputs_for_generation(this, ...e);
  }
  _update_model_kwargs_for_generation({ generated_input_ids: e, outputs: t, model_inputs: r, is_encoder_decoder: n }) {
    return r.past_key_values = Yo(t, r.past_key_values), r.input_ids = new V("int64", e.flat(), [e.length, 1]), n ? "decoder_attention_mask" in r && (r.decoder_attention_mask = Ne([r.decoder_attention_mask, mt([r.decoder_attention_mask.dims[0], 1])], 1)) : r.attention_mask = Ne([r.attention_mask, mt([r.attention_mask.dims[0], 1])], 1), r.position_ids = null, r;
  }
  _prepare_model_inputs({ inputs: e, bos_token_id: t, model_kwargs: r }) {
    let n = et(r, this.forward_params), a = this.main_input_name;
    if (a in n) {
      if (e) throw new Error("`inputs`: {inputs}` were passed alongside {input_name} which is not allowed. Make sure to either pass {inputs} or {input_name}=...");
    } else n[a] = e;
    return { inputs_tensor: n[a], model_inputs: n, model_input_name: a };
  }
  async _prepare_encoder_decoder_kwargs_for_generation({ inputs_tensor: e, model_inputs: t, model_input_name: r, generation_config: n }) {
    if (this.sessions.model.inputNames.includes("inputs_embeds") && !t.inputs_embeds && "_prepare_inputs_embeds" in this) {
      let { input_ids: s, pixel_values: i, attention_mask: o, ...l } = t, c = await this._prepare_inputs_embeds(t);
      t = { ...l, ...et(c, ["inputs_embeds", "attention_mask"]) };
    }
    let { last_hidden_state: a } = await Ir(this, t);
    if (n.guidance_scale !== null && n.guidance_scale > 1) a = Ne([a, Uo(a, 0)], 0), "attention_mask" in t && (t.attention_mask = Ne([t.attention_mask, pl(t.attention_mask)], 0));
    else if (t.decoder_input_ids) {
      let s = Xo(t.decoder_input_ids).dims[0];
      if (s !== a.dims[0]) {
        if (a.dims[0] !== 1) throw new Error(`The encoder outputs have a different batch size (${a.dims[0]}) than the decoder inputs (${s}).`);
        a = Ne(Array.from({ length: s }, () => a), 0);
      }
    }
    return t.encoder_outputs = a, t;
  }
  _prepare_decoder_input_ids_for_generation({ batch_size: e, model_input_name: t, model_kwargs: r, decoder_start_token_id: n, bos_token_id: a, generation_config: s }) {
    let { decoder_input_ids: i, ...o } = r;
    if (!(i instanceof V)) {
      if (i) Array.isArray(i[0]) || (i = Array.from({ length: e }, () => i));
      else if (n ??= a, this.config.model_type === "musicgen") i = Array.from({ length: e * this.config.decoder.num_codebooks }, () => [n]);
      else if (Array.isArray(n)) {
        if (n.length !== e) throw new Error(`\`decoder_start_token_id\` expected to have length ${e} but got ${n.length}`);
        i = n;
      } else i = Array.from({ length: e }, () => [n]);
      i = Xo(i);
    }
    return o.decoder_attention_mask = dl(i), { input_ids: i, model_inputs: o };
  }
  async generate({ inputs: e = null, generation_config: t = null, logits_processor: r = null, stopping_criteria: n = null, streamer: a = null, ...s }) {
    this._validate_model_class(), t = this._prepare_generation_config(t, s);
    let { inputs_tensor: i, model_inputs: o, model_input_name: l } = this._prepare_model_inputs({ inputs: e, model_kwargs: s }), c = this.config.is_encoder_decoder;
    c && ("encoder_outputs" in o || (o = await this._prepare_encoder_decoder_kwargs_for_generation({ inputs_tensor: i, model_inputs: o, model_input_name: l, generation_config: t })));
    let p;
    c ? { input_ids: p, model_inputs: o } = this._prepare_decoder_input_ids_for_generation({ batch_size: o[l].dims.at(0), model_input_name: l, model_kwargs: o, decoder_start_token_id: t.decoder_start_token_id, bos_token_id: t.bos_token_id, generation_config: t }) : p = o[l];
    let d = p.dims.at(-1);
    t.max_new_tokens !== null && (t.max_length = d + t.max_new_tokens);
    let _ = this._get_logits_processor(t, d, r), f = this._get_stopping_criteria(t, n), w = o[l].dims.at(0), y = Bs.getSampler(t), b = new Array(w).fill(0), x = p.tolist();
    a && a.put(x);
    let T, A = {}, E = {};
    for (; ; ) {
      if (o = this.prepare_inputs_for_generation(x, o, t), T = await this.forward(o), t.return_dict_in_generate) if (t.output_attentions) {
        let q = QC(T);
        for (let H in q) H in A || (A[H] = []), A[H].push(q[H]);
      } else this._return_dict_in_generate_keys && Object.assign(E, et(T, this._return_dict_in_generate_keys));
      let G = T.logits.slice(null, -1, null).to("float32"), D = _(x, G), U = [];
      for (let q = 0; q < D.dims.at(0); ++q) {
        let H = D[q], Q = await y(H);
        for (let [$, C] of Q) {
          let ae = BigInt($);
          b[q] += C, x[q].push(ae), U.push([ae]);
          break;
        }
      }
      if (a && a.put(U), f(x).every((q) => q)) break;
      o = this._update_model_kwargs_for_generation({ generated_input_ids: U, outputs: T, model_inputs: o, is_encoder_decoder: c });
    }
    a && a.end();
    let S = new V("int64", x.flat(), [x.length, x[0].length]), O = Yo(T, o.past_key_values), M = new Set(Object.values(O));
    for (let G of Object.values(T)) G.location === "gpu-buffer" && !M.has(G) && G.dispose();
    return "past_key_values" in s || t.return_dict_in_generate || await O.dispose(), t.return_dict_in_generate ? { sequences: S, past_key_values: O, ...A, ...E } : S;
  }
  async _encode_input(e, t, r) {
    if (!Object.hasOwn(this.sessions, e)) throw new Error(`Model does not have a ${e} session.`);
    let n = this.sessions[e];
    return (await ye(n, et(t, n.inputNames)))[r];
  }
  async encode_image(e) {
    return this._encode_input("vision_encoder", e, "image_features");
  }
  async encode_text(e) {
    return this._encode_input("embed_tokens", e, "inputs_embeds");
  }
  async encode_audio(e) {
    return this._encode_input("audio_encoder", e, "audio_features");
  }
};
async function ls(e, t) {
  let { encoder_outputs: r, input_ids: n, decoder_input_ids: a, decoder_attention_mask: s, ...i } = t;
  if (!r) {
    let o = et(t, e.sessions.model.inputNames);
    r = (await Ir(e, o)).last_hidden_state;
  }
  return i.input_ids = a, i.encoder_hidden_states = r, e.sessions.decoder_model_merged.inputNames.includes("encoder_attention_mask") && (i.encoder_attention_mask = t.attention_mask), s && !i.attention_mask && (i.attention_mask = s), await _r(e, i, !0);
}
async function Ir(e, t) {
  let r = e.sessions.model, n = et(t, r.inputNames);
  if (r.inputNames.includes("inputs_embeds") && !n.inputs_embeds) {
    if (!t.input_ids) throw new Error("Both `input_ids` and `inputs_embeds` are missing in the model inputs.");
    n.inputs_embeds = await e.encode_text({ input_ids: t.input_ids });
  }
  if (r.inputNames.includes("token_type_ids") && !n.token_type_ids) {
    if (!n.input_ids) throw new Error("Both `input_ids` and `token_type_ids` are missing in the model inputs.");
    n.token_type_ids = pl(n.input_ids);
  }
  if (r.inputNames.includes("pixel_mask") && !n.pixel_mask) {
    if (!n.pixel_values) throw new Error("Both `pixel_values` and `pixel_mask` are missing in the model inputs.");
    let a = n.pixel_values.dims;
    n.pixel_mask = mt([a[0], a[2], a[3]]);
  }
  return await ye(r, n);
}
async function HC(e, t) {
  let r = await e.encode(t);
  return await e.decode(r);
}
function Yo(e, t) {
  let r = /* @__PURE__ */ Object.create(null);
  for (let n in e) if (n.startsWith("present")) {
    let a = n.replace("present_ssm", "past_ssm").replace("present_conv", "past_conv").replace("present_recurrent", "past_recurrent").replace("present_compressor", "past_compressor").replace("present_indexer", "past_indexer").replace("present", "past_key_values");
    n.includes("encoder") && t ? r[a] = t[a] : r[a] = e[n];
  }
  return t ? (t.update(r), t) : new Ml(r);
}
function QC(e) {
  let t = {};
  for (let r of ["cross_attentions", "encoder_attentions", "decoder_attentions"]) for (let n in e) n.startsWith(r) && (r in t || (t[r] = []), t[r].push(e[n]));
  return t;
}
function Fg(e, t) {
  return e.map((r) => typeof r == "number" ? r : t[r] ?? 0);
}
function Cl(e, t, r) {
  if (r && Object.keys(r).length > 0) return Object.assign(t, r), r;
  let n = e.sessions.decoder_model_merged ?? e.sessions.model, a = (t[e.main_input_name] ?? t.attention_mask)?.dims?.[0] ?? 1, s = Ns(e.config), i = e.config?.normalized_config?.num_heads, o = { batch_size: a };
  typeof i == "number" && (o["batch_size x num_heads"] = a * i);
  let l = /* @__PURE__ */ Object.create(null);
  for (let c of n.inputMetadata) {
    if (!s.has(c.name)) continue;
    let p = Fg(c.shape, o), d = p.reduce((w, y) => w * y, 1), _ = pa[c.type], f = new V(c.type, new _(d), p);
    t[c.name] = f, l[c.name] = f;
  }
  return r ? (r.update(l), r) : new Ml(l);
}
function va(e, t, r) {
  t.num_logits_to_keep || (e.sessions.decoder_model_merged ?? e.sessions.model)?.inputNames.includes("num_logits_to_keep") && (t.num_logits_to_keep = new V("int64", [r], []));
}
async function _r(e, t, r = !1) {
  let n = e.sessions[r ? "decoder_model_merged" : "model"], { past_key_values: a, ...s } = t;
  if (n.inputNames.includes("use_cache_branch") && (s.use_cache_branch = Pg(a != null && Object.keys(a).length > 0)), n.inputNames.includes("position_ids") && s.attention_mask && !s.position_ids) {
    let o = ["paligemma", "gemma3_text", "gemma3"].includes(e.config.model_type) ? 1 : 0;
    s.position_ids = JC(s, a, o);
  }
  va(e, s, 0n), Cl(e, s, a);
  let i = et(s, n.inputNames);
  return await ye(n, i);
}
async function Ig(e, { encode_function: t, merge_function: r, modality_input_names: n, modality_output_name: a, input_ids: s = null, attention_mask: i = null, position_ids: o = null, inputs_embeds: l = null, past_key_values: c = null, generation_config: p = null, logits_processor: d = null, num_logits_to_keep: _ = null, ...f }) {
  if (!l) {
    l = await e.encode_text({ input_ids: s, ...f });
    let w = et(f, n);
    if (Object.keys(w).length > 0) {
      if (s.dims[1] !== 1) {
        let y = await t({ ...w, ...f });
        ({ inputs_embeds: l, attention_mask: i } = r({ [a]: y, inputs_embeds: l, input_ids: s, attention_mask: i }));
      } else if (c && s.dims[1] === 1) {
        let y = s.dims[1], b = c.get_seq_length();
        i = Ne([mt([s.dims[0], b]), i.slice(null, [i.dims[1] - y, i.dims[1]])], 1);
      }
    }
  }
  if (!o && ["qwen2_vl", "qwen2_vl_text", "qwen2_5_vl", "qwen2_5_vl_text", "qwen3_vl", "qwen3_vl_text", "qwen3_vl_moe", "qwen3_vl_moe_text", "qwen3_5", "qwen3_5_text", "qwen3_5_moe", "qwen3_5_moe_text", "glm_ocr", "glm_ocr_text"].includes(e.config.model_type)) {
    let { image_grid_thw: w, video_grid_thw: y } = f;
    [o] = e.get_rope_index(s, w, y, i);
  }
  return await _r(e, { inputs_embeds: l, past_key_values: c, attention_mask: i, position_ids: o, generation_config: p, logits_processor: d, num_logits_to_keep: _ }, !0);
}
async function XC(e, t) {
  return await Ig(e, { ...t, modality_input_names: ["audio_values", "input_features"], modality_output_name: "audio_features", encode_function: e.encode_audio.bind(e), merge_function: e._merge_input_ids_with_audio_features.bind(e) });
}
async function YC(e, t) {
  return await Ig(e, { ...t, modality_input_names: ["pixel_values"], modality_output_name: "image_features", encode_function: e.encode_image.bind(e), merge_function: e._merge_input_ids_with_image_features.bind(e) });
}
function Lg(e, t = 0) {
  let [r, n] = e.dims, a = e.data, s = new BigInt64Array(a.length);
  for (let i = 0; i < r; ++i) {
    let o = i * n, l = BigInt(t);
    for (let c = 0; c < n; ++c) {
      let p = o + c;
      a[p] === 0n ? s[p] = BigInt(1) : (s[p] = l, l += a[p]);
    }
  }
  return { data: s, dims: e.dims };
}
function JC(e, t = null, r = 0) {
  let { input_ids: n, inputs_embeds: a, attention_mask: s } = e, { data: i, dims: o } = Lg(s, r), l = new V("int64", i, o);
  if (t) {
    let c = -(n ?? a).dims.at(1);
    l = l.slice(null, [c, null]);
  }
  return l;
}
function Cn(e, t, r, n) {
  let a = r.past_key_values ? r.past_key_values.get_seq_length() : 0;
  if (va(e, r, 1n), !r.attention_mask) {
    let s;
    for (let i of ["input_ids", "inputs_embeds", "position_ids"]) if (r[i]) {
      s = r[i].dims;
      break;
    }
    if (!s) throw new Error("attention_mask is not provided, and unable to infer its shape from model inputs.");
    r.attention_mask = mt([s[0], a + s[1]]);
  }
  if (r.past_key_values) {
    let { input_ids: s, attention_mask: i } = r;
    i && i.dims[1] > s.dims[1] || a < s.dims[1] && (r.input_ids = s.slice(null, [a, null]));
  }
  return r;
}
function Es(e, t, r, n) {
  return r.past_key_values && (t = t.map((a) => [a.at(-1)])), va(e, r, 1n), { ...r, decoder_input_ids: Xo(t) };
}
function cs(e, ...t) {
  return e.config.is_encoder_decoder ? Es(e, ...t) : Cn(e, ...t);
}
function Og({ modality_token_id: e, inputs_embeds: t, modality_features: r, input_ids: n, attention_mask: a }) {
  let s = n.tolist().map((c) => c.reduce((p, d, _) => (d == e && p.push(_), p), [])), i = s.reduce((c, p) => c + p.length, 0), o = r.dims[0];
  if (i !== o) throw new Error(`Number of tokens and features do not match: tokens: ${i}, features ${o}`);
  let l = 0;
  for (let c = 0; c < s.length; ++c) {
    let p = s[c], d = t[c];
    for (let _ = 0; _ < p.length; ++_) d[p[_]].data.set(r[l++].data);
  }
  return { inputs_embeds: t, attention_mask: a };
}
function Sl({ image_token_id: e, inputs_embeds: t, image_features: r, input_ids: n, attention_mask: a }) {
  return Og({ modality_token_id: e, inputs_embeds: t, modality_features: r, input_ids: n, attention_mask: a });
}
function zg({ audio_token_id: e, inputs_embeds: t, audio_features: r, input_ids: n, attention_mask: a }) {
  return Og({ modality_token_id: e, inputs_embeds: t, modality_features: r, input_ids: n, attention_mask: a });
}
async function ZC(e, t, r) {
  return Object.fromEntries(await Promise.all(Object.keys(t).map(async (n) => {
    let a = await nr(e, t[n], !1, r);
    return [n, a];
  })));
}
var Pl = {};
fa(Pl, { ASTForAudioClassification: () => uS, ASTModel: () => cS, ASTPreTrainedModel: () => Ol, AfmoeForCausalLM: () => iS, AfmoeModel: () => sS, AfmoePreTrainedModel: () => Il, AlbertForMaskedLM: () => rS, AlbertForQuestionAnswering: () => tS, AlbertForSequenceClassification: () => eS, AlbertModel: () => KC, AlbertPreTrainedModel: () => xa, ApertusForCausalLM: () => aS, ApertusModel: () => nS, ApertusPreTrainedModel: () => Fl, ArceeForCausalLM: () => lS, ArceeModel: () => oS, ArceePreTrainedModel: () => Ll, BartForConditionalGeneration: () => pS, BartForSequenceClassification: () => hS, BartModel: () => dS, BartPretrainedModel: () => $s, BaseModelOutput: () => TC, BeitForImageClassification: () => fS, BeitModel: () => _S, BeitPreTrainedModel: () => zl, BertForMaskedLM: () => gS, BertForQuestionAnswering: () => bS, BertForSequenceClassification: () => wS, BertForTokenClassification: () => yS, BertModel: () => mS, BertPreTrainedModel: () => Ln, BlenderbotForConditionalGeneration: () => xS, BlenderbotModel: () => vS, BlenderbotPreTrainedModel: () => Nl, BlenderbotSmallForConditionalGeneration: () => kS, BlenderbotSmallModel: () => MS, BlenderbotSmallPreTrainedModel: () => Bl, BloomForCausalLM: () => ES, BloomModel: () => TS, BloomPreTrainedModel: () => $l, CHMv2ForDepthEstimation: () => OS, CHMv2PreTrainedModel: () => Dg, CLIPModel: () => NS, CLIPPreTrainedModel: () => sn, CLIPSegForImageSegmentation: () => GS, CLIPSegModel: () => RS, CLIPSegPreTrainedModel: () => Dl, CLIPTextModel: () => BS, CLIPTextModelWithProjection: () => Vg, CLIPVisionModel: () => $S, CLIPVisionModelWithProjection: () => DS, CamembertForMaskedLM: () => CS, CamembertForQuestionAnswering: () => FS, CamembertForSequenceClassification: () => SS, CamembertForTokenClassification: () => PS, CamembertModel: () => AS, CamembertPreTrainedModel: () => On, CausalLMOutput: () => Lr, CausalLMOutputWithPast: () => EC, ChatterboxModel: () => Bg, ChatterboxPreTrainedModel: () => Ng, ChineseCLIPModel: () => LS, ChineseCLIPPreTrainedModel: () => $g, ClapAudioModelWithProjection: () => Gg, ClapModel: () => zS, ClapPreTrainedModel: () => Ds, ClapTextModelWithProjection: () => Rg, CodeGenForCausalLM: () => US, CodeGenModel: () => VS, CodeGenPreTrainedModel: () => Rl, Cohere2ForCausalLM: () => HS, Cohere2Model: () => WS, Cohere2PreTrainedModel: () => Vl, CohereAsrForConditionalGeneration: () => XS, CohereAsrModel: () => QS, CohereAsrPreTrainedModel: () => Ul, CohereForCausalLM: () => jS, CohereModel: () => qS, CoherePreTrainedModel: () => Gl, ConvBertForMaskedLM: () => JS, ConvBertForQuestionAnswering: () => eP, ConvBertForSequenceClassification: () => ZS, ConvBertForTokenClassification: () => KS, ConvBertModel: () => YS, ConvBertPreTrainedModel: () => zn, ConvNextForImageClassification: () => rP, ConvNextModel: () => tP, ConvNextPreTrainedModel: () => ql, ConvNextV2ForImageClassification: () => aP, ConvNextV2Model: () => nP, ConvNextV2PreTrainedModel: () => jl, DFineForObjectDetection: () => lP, DFineModel: () => oP, DFinePreTrainedModel: () => Hl, DINOv3ConvNextModel: () => NP, DINOv3ConvNextPreTrainedModel: () => Jg, DINOv3ViTModel: () => BP, DINOv3ViTPreTrainedModel: () => Zg, DPTForDepthEstimation: () => jP, DPTModel: () => qP, DPTPreTrainedModel: () => ec, DacDecoderModel: () => Wg, DacDecoderOutput: () => qg, DacEncoderModel: () => jg, DacEncoderOutput: () => Ug, DacModel: () => cP, DacPreTrainedModel: () => Rs, DebertaForMaskedLM: () => dP, DebertaForQuestionAnswering: () => _P, DebertaForSequenceClassification: () => pP, DebertaForTokenClassification: () => hP, DebertaModel: () => uP, DebertaPreTrainedModel: () => Nn, DebertaV2ForMaskedLM: () => bP, DebertaV2ForQuestionAnswering: () => MP, DebertaV2ForSequenceClassification: () => vP, DebertaV2ForTokenClassification: () => xP, DebertaV2Model: () => yP, DebertaV2PreTrainedModel: () => Bn, DecisionTransformerModel: () => kP, DecisionTransformerPreTrainedModel: () => Hg, DeepseekV3ForCausalLM: () => mP, DeepseekV3Model: () => fP, DeepseekV3PreTrainedModel: () => Ql, DeepseekV4ForCausalLM: () => wP, DeepseekV4Model: () => gP, DeepseekV4PreTrainedModel: () => Xl, DeiTForImageClassification: () => EP, DeiTModel: () => TP, DeiTPreTrainedModel: () => Yl, DepthAnythingForDepthEstimation: () => AP, DepthAnythingPreTrainedModel: () => Qg, DepthProForDepthEstimation: () => CP, DepthProPreTrainedModel: () => Xg, DetrForObjectDetection: () => PP, DetrForSegmentation: () => FP, DetrModel: () => SP, DetrObjectDetectionOutput: () => Jl, DetrPreTrainedModel: () => Gs, DetrSegmentationOutput: () => Yg, Dinov2ForImageClassification: () => LP, Dinov2Model: () => IP, Dinov2PreTrainedModel: () => Zl, Dinov2WithRegistersForImageClassification: () => zP, Dinov2WithRegistersModel: () => OP, Dinov2WithRegistersPreTrainedModel: () => Kl, DistilBertForMaskedLM: () => VP, DistilBertForQuestionAnswering: () => GP, DistilBertForSequenceClassification: () => DP, DistilBertForTokenClassification: () => RP, DistilBertModel: () => $P, DistilBertPreTrainedModel: () => $n, DonutSwinModel: () => UP, DonutSwinPreTrainedModel: () => Kg, EdgeTamModel: () => cz, EfficientNetForImageClassification: () => HP, EfficientNetModel: () => WP, EfficientNetPreTrainedModel: () => tc, ElectraForMaskedLM: () => XP, ElectraForQuestionAnswering: () => ZP, ElectraForSequenceClassification: () => YP, ElectraForTokenClassification: () => JP, ElectraModel: () => QP, ElectraPreTrainedModel: () => Dn, Ernie4_5ForCausalLM: () => eF, Ernie4_5Model: () => KP, Ernie4_5PretrainedModel: () => rc, EsmForMaskedLM: () => rF, EsmForSequenceClassification: () => nF, EsmForTokenClassification: () => aF, EsmModel: () => tF, EsmPreTrainedModel: () => ka, EuroBertForMaskedLM: () => iF, EuroBertForSequenceClassification: () => oF, EuroBertForTokenClassification: () => lF, EuroBertModel: () => sF, EuroBertPreTrainedModel: () => Ta, ExaoneForCausalLM: () => uF, ExaoneModel: () => cF, ExaonePreTrainedModel: () => nc, FalconForCausalLM: () => pF, FalconH1ForCausalLM: () => _F, FalconH1Model: () => hF, FalconH1PreTrainedModel: () => sc, FalconModel: () => dF, FalconPreTrainedModel: () => ac, FastViTForImageClassification: () => mF, FastViTModel: () => fF, FastViTPreTrainedModel: () => ic, Florence2ForConditionalGeneration: () => gF, Florence2PreTrainedModel: () => ew, GLPNForDepthEstimation: () => OF, GLPNModel: () => LF, GLPNPreTrainedModel: () => _c, GPT2LMHeadModel: () => qF, GPT2Model: () => UF, GPT2PreTrainedModel: () => yc, GPTBigCodeForCausalLM: () => NF, GPTBigCodeModel: () => zF, GPTBigCodePreTrainedModel: () => fc, GPTJForCausalLM: () => WF, GPTJModel: () => jF, GPTJPreTrainedModel: () => bc, GPTNeoForCausalLM: () => $F, GPTNeoModel: () => BF, GPTNeoPreTrainedModel: () => mc, GPTNeoXForCausalLM: () => RF, GPTNeoXModel: () => DF, GPTNeoXPreTrainedModel: () => gc, Gemma2ForCausalLM: () => vF, Gemma2Model: () => bF, Gemma2PreTrainedModel: () => lc, Gemma3ForCausalLM: () => TF, Gemma3ForConditionalGeneration: () => nw, Gemma3Model: () => kF, Gemma3PreTrainedModel: () => rw, Gemma3nForCausalLM: () => EF, Gemma3nForConditionalGeneration: () => Vs, Gemma3nPreTrainedModel: () => aw, Gemma4ForCausalLM: () => AF, Gemma4ForConditionalGeneration: () => cc, GemmaForCausalLM: () => yF, GemmaModel: () => wF, GemmaPreTrainedModel: () => oc, GlmForCausalLM: () => SF, GlmModel: () => CF, GlmMoeDsaForCausalLM: () => FF, GlmMoeDsaModel: () => PF, GlmMoeDsaPreTrainedModel: () => dc, GlmOcrForConditionalGeneration: () => IF, GlmPreTrainedModel: () => uc, GptOssForCausalLM: () => VF, GptOssModel: () => GF, GptOssPreTrainedModel: () => wc, GraniteForCausalLM: () => QF, GraniteModel: () => HF, GraniteMoeHybridForCausalLM: () => YF, GraniteMoeHybridModel: () => XF, GraniteMoeHybridPreTrainedModel: () => xc, GranitePreTrainedModel: () => vc, GraniteSpeechForConditionalGeneration: () => JF, GroundingDinoForObjectDetection: () => ZF, GroundingDinoPreTrainedModel: () => cw, GroupViTModel: () => KF, GroupViTPreTrainedModel: () => uw, HeliumForCausalLM: () => tI, HeliumModel: () => eI, HeliumPreTrainedModel: () => kc, HieraForImageClassification: () => nI, HieraModel: () => rI, HieraPreTrainedModel: () => Tc, HrmTextForCausalLM: () => sI, HrmTextModel: () => aI, HrmTextPreTrainedModel: () => Ec, HubertForCTC: () => pI, HubertForSequenceClassification: () => hI, HubertModel: () => dI, HubertPreTrainedModel: () => uI, HunYuanDenseV1ForCausalLM: () => fI, HunYuanDenseV1Model: () => _I, HunYuanDenseV1PreTrainedModel: () => Ac, IJepaForImageClassification: () => gI, IJepaModel: () => mI, IJepaPreTrainedModel: () => Cc, Idefics3ForConditionalGeneration: () => dw, ImageMattingOutput: () => kg, JAISLMHeadModel: () => yI, JAISModel: () => wI, JAISPreTrainedModel: () => Sc, JinaCLIPModel: () => bI, JinaCLIPPreTrainedModel: () => Us, JinaCLIPTextModel: () => pw, JinaCLIPVisionModel: () => vI, Lfm2ForCausalLM: () => MI, Lfm2Model: () => xI, Lfm2MoeForCausalLM: () => EI, Lfm2MoeModel: () => TI, Lfm2MoePreTrainedModel: () => Fc, Lfm2PreTrainedModel: () => Pc, Lfm2VlForConditionalGeneration: () => AI, LightOnOcrForConditionalGeneration: () => kI, LiteWhisperForConditionalGeneration: () => P3, Llama4ForCausalLM: () => PI, Llama4PreTrainedModel: () => hw, LlamaForCausalLM: () => SI, LlamaModel: () => CI, LlamaPreTrainedModel: () => Ic, LlavaForConditionalGeneration: () => rr, LlavaOnevisionForConditionalGeneration: () => rr, LlavaPreTrainedModel: () => tw, LlavaQwen2ForCausalLM: () => MF, LongT5ForConditionalGeneration: () => II, LongT5Model: () => FI, LongT5PreTrainedModel: () => Lc, M2M100ForConditionalGeneration: () => OI, M2M100Model: () => LI, M2M100PreTrainedModel: () => Oc, MBartForCausalLM: () => VI, MBartForConditionalGeneration: () => RI, MBartForSequenceClassification: () => GI, MBartModel: () => DI, MBartPreTrainedModel: () => Ea, MPNetForMaskedLM: () => LL, MPNetForQuestionAnswering: () => NL, MPNetForSequenceClassification: () => OL, MPNetForTokenClassification: () => zL, MPNetModel: () => IL, MPNetPreTrainedModel: () => Rn, MT5ForConditionalGeneration: () => RL, MT5Model: () => DL, MT5PreTrainedModel: () => Hc, MarianMTModel: () => NI, MarianModel: () => zI, MarianPreTrainedModel: () => zc, MaskFormerForInstanceSegmentation: () => $I, MaskFormerModel: () => BI, MaskFormerPreTrainedModel: () => Nc, MaskedLMOutput: () => Xe, Metric3DForDepthEstimation: () => UI, Metric3DPreTrainedModel: () => _w, Metric3Dv2ForDepthEstimation: () => qI, Metric3Dv2PreTrainedModel: () => fw, MgpstrForSceneTextRecognition: () => jI, MgpstrModelOutput: () => mw, MgpstrPreTrainedModel: () => gw, MimiDecoderModel: () => vw, MimiDecoderOutput: () => yw, MimiEncoderModel: () => bw, MimiEncoderOutput: () => ww, MimiModel: () => WI, MimiPreTrainedModel: () => qs, Ministral3ForCausalLM: () => YI, Ministral3Model: () => XI, Ministral3PreTrainedModel: () => $c, MinistralForCausalLM: () => QI, MinistralModel: () => HI, MinistralPreTrainedModel: () => Bc, Mistral3ForConditionalGeneration: () => KI, Mistral4ForCausalLM: () => tL, Mistral4Model: () => eL, Mistral4PreTrainedModel: () => Rc, MistralForCausalLM: () => ZI, MistralModel: () => JI, MistralPreTrainedModel: () => Dc, MobileBertForMaskedLM: () => nL, MobileBertForQuestionAnswering: () => sL, MobileBertForSequenceClassification: () => aL, MobileBertModel: () => rL, MobileBertPreTrainedModel: () => Aa, MobileLLMForCausalLM: () => oL, MobileLLMModel: () => iL, MobileLLMPreTrainedModel: () => Gc, MobileNetV1ForImageClassification: () => cL, MobileNetV1ForSemanticSegmentation: () => uL, MobileNetV1Model: () => lL, MobileNetV1PreTrainedModel: () => js, MobileNetV2ForImageClassification: () => pL, MobileNetV2ForSemanticSegmentation: () => hL, MobileNetV2Model: () => dL, MobileNetV2PreTrainedModel: () => Ws, MobileNetV3ForImageClassification: () => fL, MobileNetV3ForSemanticSegmentation: () => mL, MobileNetV3Model: () => _L, MobileNetV3PreTrainedModel: () => Hs, MobileNetV4ForImageClassification: () => wL, MobileNetV4ForSemanticSegmentation: () => yL, MobileNetV4Model: () => gL, MobileNetV4PreTrainedModel: () => Qs, MobileViTForImageClassification: () => vL, MobileViTModel: () => bL, MobileViTPreTrainedModel: () => Vc, MobileViTV2ForImageClassification: () => ML, MobileViTV2Model: () => xL, MobileViTV2PreTrainedModel: () => Uc, ModelOutput: () => Ge, ModernBertDecoderForCausalLM: () => SL, ModernBertDecoderModel: () => CL, ModernBertDecoderPreTrainedModel: () => qc, ModernBertForMaskedLM: () => TL, ModernBertForSequenceClassification: () => EL, ModernBertForTokenClassification: () => AL, ModernBertModel: () => kL, ModernBertPreTrainedModel: () => Ca, Moondream1ForConditionalGeneration: () => xF, MoonshineForConditionalGeneration: () => FL, MoonshineModel: () => PL, MoonshinePreTrainedModel: () => jc, MptForCausalLM: () => $L, MptModel: () => BL, MptPreTrainedModel: () => Wc, MultiModalityCausalLM: () => GL, MultiModalityPreTrainedModel: () => xw, MusicgenForCausalLM: () => UL, MusicgenForConditionalGeneration: () => Mw, MusicgenModel: () => VL, MusicgenPreTrainedModel: () => Qc, NanoChatForCausalLM: () => jL, NanoChatModel: () => qL, NanoChatPreTrainedModel: () => Xc, NemotronHForCausalLM: () => HL, NemotronHModel: () => WL, NemotronHPreTrainedModel: () => Yc, NeoBertForMaskedLM: () => XL, NeoBertForQuestionAnswering: () => ZL, NeoBertForSequenceClassification: () => YL, NeoBertForTokenClassification: () => JL, NeoBertModel: () => QL, NeoBertPreTrainedModel: () => Gn, NomicBertModel: () => KL, NomicBertPreTrainedModel: () => kw, OPTForCausalLM: () => hO, OPTModel: () => pO, OPTPreTrainedModel: () => nu, Olmo2ForCausalLM: () => nO, Olmo2Model: () => rO, Olmo2PreTrainedModel: () => Zc, Olmo3ForCausalLM: () => sO, Olmo3Model: () => aO, Olmo3PreTrainedModel: () => Kc, OlmoForCausalLM: () => tO, OlmoHybridForCausalLM: () => oO, OlmoHybridModel: () => iO, OlmoHybridPreTrainedModel: () => eu, OlmoModel: () => eO, OlmoPreTrainedModel: () => Jc, OpenAIPrivacyFilterForTokenClassification: () => cO, OpenAIPrivacyFilterModel: () => lO, OpenAIPrivacyFilterPreTrainedModel: () => tu, OpenELMForCausalLM: () => dO, OpenELMModel: () => uO, OpenELMPreTrainedModel: () => ru, OwlViTForObjectDetection: () => gO, OwlViTModel: () => mO, OwlViTPreTrainedModel: () => su, Owlv2ForObjectDetection: () => fO, Owlv2Model: () => _O, Owlv2PreTrainedModel: () => au, PaliGemmaForConditionalGeneration: () => wO, ParakeetForCTC: () => yO, ParakeetPreTrainedModel: () => Tw, PatchTSMixerForPrediction: () => vO, PatchTSMixerModel: () => bO, PatchTSMixerPreTrainedModel: () => iu, PatchTSTForPrediction: () => MO, PatchTSTModel: () => xO, PatchTSTPreTrainedModel: () => ou, Phi3ForCausalLM: () => AO, Phi3Model: () => EO, Phi3PreTrainedModel: () => cu, Phi3VForCausalLM: () => Aw, Phi3VPreTrainedModel: () => Ew, PhiForCausalLM: () => TO, PhiModel: () => kO, PhiPreTrainedModel: () => lu, PreTrainedModel: () => I, PvtForImageClassification: () => SO, PvtModel: () => CO, PvtPreTrainedModel: () => uu, PyAnnoteForAudioFrameClassification: () => FO, PyAnnoteModel: () => PO, PyAnnotePreTrainedModel: () => du, QuestionAnsweringModelOutput: () => ot, Qwen2ForCausalLM: () => LO, Qwen2Model: () => IO, Qwen2MoeForCausalLM: () => zO, Qwen2MoeModel: () => OO, Qwen2MoePreTrainedModel: () => hu, Qwen2PreTrainedModel: () => pu, Qwen2VLForCausalLM: () => iw, Qwen2VLForConditionalGeneration: () => pc, Qwen2VLPreTrainedModel: () => sw, Qwen2_5_VLForCausalLM: () => ow, Qwen2_5_VLForConditionalGeneration: () => hc, Qwen3ForCausalLM: () => BO, Qwen3Model: () => NO, Qwen3MoeForCausalLM: () => DO, Qwen3MoeModel: () => $O, Qwen3MoePreTrainedModel: () => fu, Qwen3NextForCausalLM: () => GO, Qwen3NextModel: () => RO, Qwen3NextPreTrainedModel: () => mu, Qwen3PreTrainedModel: () => _u, Qwen3VLForCausalLM: () => Cw, Qwen3VLForConditionalGeneration: () => gu, Qwen3VLMoeForCausalLM: () => UO, Qwen3VLMoeForConditionalGeneration: () => VO, Qwen3_5ForCausalLM: () => Sw, Qwen3_5ForConditionalGeneration: () => wu, Qwen3_5MoeForCausalLM: () => jO, Qwen3_5MoeForConditionalGeneration: () => qO, RFDetrForObjectDetection: () => XO, RFDetrModel: () => QO, RFDetrObjectDetectionOutput: () => Pw, RFDetrPreTrainedModel: () => bu, RTDetrForObjectDetection: () => iP, RTDetrModel: () => sP, RTDetrObjectDetectionOutput: () => Ma, RTDetrPreTrainedModel: () => Wl, RTDetrV2ForObjectDetection: () => oz, RTDetrV2Model: () => iz, RTDetrV2ObjectDetectionOutput: () => Fw, RTDetrV2PreTrainedModel: () => vu, ResNetForImageClassification: () => HO, ResNetModel: () => WO, ResNetPreTrainedModel: () => yu, RoFormerForMaskedLM: () => rz, RoFormerForQuestionAnswering: () => sz, RoFormerForSequenceClassification: () => nz, RoFormerForTokenClassification: () => az, RoFormerModel: () => tz, RoFormerPreTrainedModel: () => Un, RobertaForMaskedLM: () => JO, RobertaForQuestionAnswering: () => ez, RobertaForSequenceClassification: () => ZO, RobertaForTokenClassification: () => KO, RobertaModel: () => YO, RobertaPreTrainedModel: () => Vn, Sam2ImageSegmentationOutput: () => Ow, Sam2Model: () => xu, Sam2PreTrainedModel: () => zw, Sam3TrackerModel: () => uz, SamImageSegmentationOutput: () => Iw, SamModel: () => lz, SamPreTrainedModel: () => Lw, SapiensForDepthEstimation: () => pz, SapiensForNormalEstimation: () => hz, SapiensForSemanticSegmentation: () => dz, SapiensPreTrainedModel: () => Xs, SegformerForImageClassification: () => fz, SegformerForSemanticSegmentation: () => mz, SegformerModel: () => _z, SegformerPreTrainedModel: () => Ys, Seq2SeqLMOutput: () => AC, SequenceClassifierOutput: () => ne, SiglipModel: () => gz, SiglipPreTrainedModel: () => Mu, SiglipTextModel: () => Nw, SiglipVisionModel: () => wz, SmolLM3ForCausalLM: () => bz, SmolLM3Model: () => yz, SmolLM3PreTrainedModel: () => ku, SmolVLMForConditionalGeneration: () => vz, SnacDecoderModel: () => $w, SnacEncoderModel: () => Bw, SnacModel: () => xz, SnacPreTrainedModel: () => Js, SolarOpenForCausalLM: () => kz, SolarOpenModel: () => Mz, SolarOpenPreTrainedModel: () => Tu, SpeechT5ForSpeechToText: () => Ez, SpeechT5ForTextToSpeech: () => Az, SpeechT5HifiGan: () => Cz, SpeechT5Model: () => Tz, SpeechT5PreTrainedModel: () => Zs, SqueezeBertForMaskedLM: () => Pz, SqueezeBertForQuestionAnswering: () => Iz, SqueezeBertForSequenceClassification: () => Fz, SqueezeBertModel: () => Sz, SqueezeBertPreTrainedModel: () => Sa, StableLmForCausalLM: () => Oz, StableLmModel: () => Lz, StableLmPreTrainedModel: () => Eu, Starcoder2ForCausalLM: () => Nz, Starcoder2Model: () => zz, Starcoder2PreTrainedModel: () => Au, StyleTextToSpeech2Model: () => Bz, StyleTextToSpeech2PreTrainedModel: () => Dw, SupertonicForConditionalGeneration: () => Gw, SupertonicPreTrainedModel: () => Rw, Swin2SRForImageSuperResolution: () => Vz, Swin2SRModel: () => Gz, Swin2SRPreTrainedModel: () => Cu, SwinForImageClassification: () => Dz, SwinForSemanticSegmentation: () => Rz, SwinModel: () => $z, SwinPreTrainedModel: () => Ks, T5ForConditionalGeneration: () => qz, T5Model: () => Uz, T5PreTrainedModel: () => Su, TableTransformerForObjectDetection: () => Wz, TableTransformerModel: () => jz, TableTransformerObjectDetectionOutput: () => Vw, TableTransformerPreTrainedModel: () => Pu, TokenClassifierOutput: () => He, TrOCRForCausalLM: () => Hz, TrOCRPreTrainedModel: () => Uw, UltravoxModel: () => Mc, UltravoxPreTrainedModel: () => lw, UniSpeechForCTC: () => Xz, UniSpeechForSequenceClassification: () => Yz, UniSpeechModel: () => Qz, UniSpeechPreTrainedModel: () => ei, UniSpeechSatForAudioFrameClassification: () => e3, UniSpeechSatForCTC: () => Zz, UniSpeechSatForSequenceClassification: () => Kz, UniSpeechSatModel: () => Jz, UniSpeechSatPreTrainedModel: () => Pa, VaultGemmaForCausalLM: () => r3, VaultGemmaModel: () => t3, VaultGemmaPreTrainedModel: () => Fu, ViTForImageClassification: () => s3, ViTMAEModel: () => i3, ViTMAEPreTrainedModel: () => qw, ViTMSNForImageClassification: () => l3, ViTMSNModel: () => o3, ViTMSNPreTrainedModel: () => Lu, ViTModel: () => a3, ViTPreTrainedModel: () => Iu, VisionEncoderDecoderModel: () => n3, VitMatteForImageMatting: () => c3, VitMattePreTrainedModel: () => jw, VitPoseForPoseEstimation: () => u3, VitPosePreTrainedModel: () => Ww, VitsModel: () => d3, VitsModelOutput: () => Hw, VitsPreTrainedModel: () => Qw, VoxtralForConditionalGeneration: () => p3, VoxtralRealtimeForConditionalGeneration: () => Yw, VoxtralRealtimePreTrainedModel: () => Xw, Wav2Vec2BertForCTC: () => b3, Wav2Vec2BertForSequenceClassification: () => v3, Wav2Vec2BertModel: () => y3, Wav2Vec2BertPreTrainedModel: () => ti, Wav2Vec2ForAudioFrameClassification: () => cI, Wav2Vec2ForCTC: () => oI, Wav2Vec2ForSequenceClassification: () => lI, Wav2Vec2Model: () => iI, Wav2Vec2PreTrainedModel: () => Or, WavLMForAudioFrameClassification: () => E3, WavLMForCTC: () => M3, WavLMForSequenceClassification: () => k3, WavLMForXVector: () => T3, WavLMModel: () => x3, WavLMPreTrainedModel: () => qn, WeSpeakerResNetModel: () => A3, WeSpeakerResNetPreTrainedModel: () => Zw, WhisperForConditionalGeneration: () => Kw, WhisperModel: () => S3, WhisperPreTrainedModel: () => Ou, XLMForQuestionAnswering: () => z3, XLMForSequenceClassification: () => L3, XLMForTokenClassification: () => O3, XLMModel: () => F3, XLMPreTrainedModel: () => jn, XLMRobertaForMaskedLM: () => B3, XLMRobertaForQuestionAnswering: () => R3, XLMRobertaForSequenceClassification: () => $3, XLMRobertaForTokenClassification: () => D3, XLMRobertaModel: () => N3, XLMRobertaPreTrainedModel: () => Wn, XLMWithLMHeadModel: () => I3, XVectorOutput: () => Jw, YolosForObjectDetection: () => V3, YolosModel: () => G3, YolosObjectDetectionOutput: () => ey, YolosPreTrainedModel: () => zu, YoutuForCausalLM: () => q3, YoutuModel: () => U3, YoutuPreTrainedModel: () => Nu, ZayaForCausalLM: () => W3, ZayaModel: () => j3, ZayaPreTrainedModel: () => Bu });
var xa = class extends I {
}, KC = class extends xa {
}, eS = class extends xa {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, tS = class extends xa {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, rS = class extends xa {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, Fl = class extends I {
}, nS = class extends Fl {
}, aS = class extends Fl {
}, Il = class extends I {
}, sS = class extends Il {
}, iS = class extends Il {
}, Ll = class extends I {
}, oS = class extends Ll {
}, lS = class extends Ll {
}, Ol = class extends I {
}, cS = class extends Ol {
}, uS = class extends Ol {
}, $s = class extends I {
}, dS = class extends $s {
}, pS = class extends $s {
}, hS = class extends $s {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, zl = class extends I {
}, _S = class extends zl {
}, fS = class extends zl {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Ln = class extends I {
}, mS = class extends Ln {
}, gS = class extends Ln {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, wS = class extends Ln {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, yS = class extends Ln {
  async _call(e) {
    return new He(await super._call(e));
  }
}, bS = class extends Ln {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, Nl = class extends I {
}, vS = class extends Nl {
}, xS = class extends Nl {
}, Bl = class extends I {
}, MS = class extends Bl {
}, kS = class extends Bl {
}, $l = class extends I {
}, TS = class extends $l {
}, ES = class extends $l {
}, On = class extends I {
}, AS = class extends On {
}, CS = class extends On {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, SS = class extends On {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, PS = class extends On {
  async _call(e) {
    return new He(await super._call(e));
  }
}, FS = class extends On {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, IS = 4299n, Of = 6561n, Ng = class extends I {
  forward_params = ["input_ids", "inputs_embeds", "attention_mask", "position_ids", "audio_values", "exaggeration", "audio_features", "audio_tokens", "speaker_embeddings", "speaker_features", "past_key_values"];
  main_input_name = "input_ids";
  _return_dict_in_generate_keys = ["audio_tokens", "speaker_embeddings", "speaker_features"];
}, Bg = class extends Ng {
  async encode_speech(e) {
    return ye(this.sessions.speech_encoder, { audio_values: e });
  }
  async forward({ input_ids: e = null, attention_mask: t = null, audio_values: r = null, exaggeration: n = null, position_ids: a = null, inputs_embeds: s = null, past_key_values: i = null, generation_config: o = null, logits_processor: l = null, num_logits_to_keep: c = null, audio_features: p = null, audio_tokens: d = null, speaker_embeddings: _ = null, speaker_features: f = null, ...w }) {
    let y;
    if (!s) {
      let b = this.sessions.embed_tokens.inputNames, x = { input_ids: e };
      if (b.includes("exaggeration")) {
        if (!(n instanceof V)) {
          let T = e.dims[0];
          if (n == null) n = ut([T], 0.5);
          else if (typeof n == "number") n = ut([T], n);
          else if (Array.isArray(n)) n = new V("float32", n, [T]);
          else throw new Error("Unsupported type for `exaggeration` input");
        }
        x.exaggeration = n;
      }
      if (b.includes("position_ids") && (x.position_ids = a), { inputs_embeds: s } = await ye(this.sessions.embed_tokens, x), p && d && _ && f && (y = { audio_features: p, audio_tokens: d, speaker_embeddings: _, speaker_features: f }), y || r) y ??= await this.encode_speech(r), s = Ne([y.audio_features, s], 1), t = mt([s.dims[0], s.dims[1]]);
      else {
        let T = s.dims[1];
        if (!i || T !== 1) throw new Error("Incorrect state encountered during generation.");
        let A = i.get_seq_length();
        t = mt([s.dims[0], A + T]);
      }
    }
    return { ...await _r(this, { inputs_embeds: s, past_key_values: i, attention_mask: t, generation_config: o, logits_processor: l, num_logits_to_keep: c }, !1), ...y };
  }
  prepare_inputs_for_generation(e, t, r) {
    if (!t.position_ids && this.sessions.embed_tokens.inputNames.includes("position_ids")) if (t.input_ids.dims[1] === 1) {
      let n = Array.from({ length: e.length }, (a, s) => e[s].length - e[s].findLastIndex((i) => i == Of) - 1);
      t.position_ids = new V("int64", n, [e.length, 1]);
    } else {
      let n = t.input_ids.tolist().map((a) => {
        let s = 0;
        return a.map((i) => i >= Of ? 0 : s++);
      });
      t.position_ids = new V("int64", n.flat(), t.input_ids.dims);
    }
    return t.input_ids.dims[1] === 1 && (delete t.audio_values, delete t.audio_features, delete t.audio_tokens, delete t.speaker_embeddings, delete t.speaker_features), Cn(this, e, t, r);
  }
  async generate(e) {
    let t = e.past_key_values, { sequences: r, audio_tokens: n, speaker_embeddings: a, speaker_features: s, past_key_values: i } = await super.generate({ ...e, return_dict_in_generate: !0 });
    try {
      let o = r.slice(null, [e.input_ids.dims[1], -1]), l = ut([o.dims[0], 3], IS), c = Ne([n, o, l], 1), { waveform: p } = await ye(this.sessions.conditional_decoder, { speech_tokens: c, speaker_features: s, speaker_embeddings: a });
      return p;
    } finally {
      i !== t && await i?.dispose();
    }
  }
}, $g = class extends I {
}, LS = class extends $g {
}, Dg = class extends I {
}, OS = class extends Dg {
}, Ds = class extends I {
}, zS = class extends Ds {
}, Rg = class extends Ds {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "text_model" });
  }
}, Gg = class extends Ds {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "audio_model" });
  }
}, sn = class extends I {
}, NS = class extends sn {
}, BS = class extends sn {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "text_model" });
  }
}, Vg = class extends sn {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "text_model" });
  }
}, $S = class extends sn {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "vision_model" });
  }
}, DS = class extends sn {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "vision_model" });
  }
}, Dl = class extends I {
}, RS = class extends Dl {
}, GS = class extends Dl {
}, Rl = class extends I {
}, VS = class extends Rl {
}, US = class extends Rl {
}, Gl = class extends I {
}, qS = class extends Gl {
}, jS = class extends Gl {
}, Vl = class extends I {
}, WS = class extends Vl {
}, HS = class extends Vl {
}, Ul = class extends I {
  requires_attention_mask = !1;
  main_input_name = "input_features";
  forward_params = ["input_features", "decoder_input_ids", "decoder_attention_mask", "past_key_values"];
}, QS = class extends Ul {
}, XS = class extends Ul {
}, zn = class extends I {
}, YS = class extends zn {
}, JS = class extends zn {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, ZS = class extends zn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, KS = class extends zn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, eP = class extends zn {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, ql = class extends I {
}, tP = class extends ql {
}, rP = class extends ql {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, jl = class extends I {
}, nP = class extends jl {
}, aP = class extends jl {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Wl = class extends I {
}, sP = class extends Wl {
}, iP = class extends Wl {
  async _call(e) {
    return new Ma(await super._call(e));
  }
}, Ma = class extends Ge {
  constructor({ logits: e, pred_boxes: t }) {
    super(), this.logits = e, this.pred_boxes = t;
  }
}, Hl = class extends I {
}, oP = class extends Hl {
}, lP = class extends Hl {
  async _call(e) {
    return new Ma(await super._call(e));
  }
}, Ug = class extends Ge {
  constructor({ audio_codes: e }) {
    super(), this.audio_codes = e;
  }
}, qg = class extends Ge {
  constructor({ audio_values: e }) {
    super(), this.audio_values = e;
  }
}, Rs = class extends I {
  main_input_name = "input_values";
  forward_params = ["input_values"];
}, cP = class extends Rs {
  async encode(e) {
    return new Ug(await ye(this.sessions.encoder_model, e));
  }
  async decode(e) {
    return new qg(await ye(this.sessions.decoder_model, e));
  }
}, jg = class extends Rs {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "encoder_model" });
  }
}, Wg = class extends Rs {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "decoder_model" });
  }
}, Nn = class extends I {
}, uP = class extends Nn {
}, dP = class extends Nn {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, pP = class extends Nn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, hP = class extends Nn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, _P = class extends Nn {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, Ql = class extends I {
}, fP = class extends Ql {
}, mP = class extends Ql {
}, Xl = class extends I {
}, gP = class extends Xl {
}, wP = class extends Xl {
}, Bn = class extends I {
}, yP = class extends Bn {
}, bP = class extends Bn {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, vP = class extends Bn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, xP = class extends Bn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, MP = class extends Bn {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, Hg = class extends I {
}, kP = class extends Hg {
}, Yl = class extends I {
}, TP = class extends Yl {
}, EP = class extends Yl {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Qg = class extends I {
}, AP = class extends Qg {
}, Xg = class extends I {
}, CP = class extends Xg {
}, Gs = class extends I {
}, SP = class extends Gs {
}, PP = class extends Gs {
  async _call(e) {
    return new Jl(await super._call(e));
  }
}, FP = class extends Gs {
  async _call(e) {
    return new Yg(await super._call(e));
  }
}, Jl = class extends Ge {
  constructor({ logits: e, pred_boxes: t }) {
    super(), this.logits = e, this.pred_boxes = t;
  }
}, Yg = class extends Ge {
  constructor({ logits: e, pred_boxes: t, pred_masks: r }) {
    super(), this.logits = e, this.pred_boxes = t, this.pred_masks = r;
  }
}, Zl = class extends I {
}, IP = class extends Zl {
}, LP = class extends Zl {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Kl = class extends I {
}, OP = class extends Kl {
}, zP = class extends Kl {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Jg = class extends I {
}, NP = class extends Jg {
}, Zg = class extends I {
}, BP = class extends Zg {
}, $n = class extends I {
}, $P = class extends $n {
}, DP = class extends $n {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, RP = class extends $n {
  async _call(e) {
    return new He(await super._call(e));
  }
}, GP = class extends $n {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, VP = class extends $n {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, Kg = class extends I {
}, UP = class extends Kg {
}, ec = class extends I {
}, qP = class extends ec {
}, jP = class extends ec {
}, tc = class extends I {
}, WP = class extends tc {
}, HP = class extends tc {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Dn = class extends I {
}, QP = class extends Dn {
}, XP = class extends Dn {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, YP = class extends Dn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, JP = class extends Dn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, ZP = class extends Dn {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, rc = class extends I {
}, KP = class extends rc {
}, eF = class extends rc {
}, ka = class extends I {
}, tF = class extends ka {
}, rF = class extends ka {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, nF = class extends ka {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, aF = class extends ka {
  async _call(e) {
    return new He(await super._call(e));
  }
}, Ta = class extends I {
}, sF = class extends Ta {
}, iF = class extends Ta {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, oF = class extends Ta {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, lF = class extends Ta {
  async _call(e) {
    return new He(await super._call(e));
  }
}, nc = class extends I {
}, cF = class extends nc {
}, uF = class extends nc {
}, ac = class extends I {
}, dF = class extends ac {
}, pF = class extends ac {
}, sc = class extends I {
}, hF = class extends sc {
}, _F = class extends sc {
}, ic = class extends I {
}, fF = class extends ic {
}, mF = class extends ic {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, ew = class extends I {
  forward_params = ["input_ids", "inputs_embeds", "attention_mask", "pixel_values", "encoder_outputs", "decoder_input_ids", "decoder_inputs_embeds", "decoder_attention_mask", "past_key_values"];
  main_input_name = "inputs_embeds";
}, gF = class extends ew {
  _merge_input_ids_with_image_features({ inputs_embeds: e, image_features: t, input_ids: r, attention_mask: n }) {
    return { inputs_embeds: Ne([t, e], 1), attention_mask: Ne([mt(t.dims.slice(0, 2)), n], 1) };
  }
  async _prepare_inputs_embeds({ input_ids: e, pixel_values: t, inputs_embeds: r, attention_mask: n }) {
    if (!e && !t) throw new Error("Either `input_ids` or `pixel_values` should be provided.");
    let a, s;
    return e && (a = await this.encode_text({ input_ids: e })), t && (s = await this.encode_image({ pixel_values: t })), a && s ? { inputs_embeds: r, attention_mask: n } = this._merge_input_ids_with_image_features({ inputs_embeds: a, image_features: s, input_ids: e, attention_mask: n }) : r = a || s, { inputs_embeds: r, attention_mask: n };
  }
  async forward({ input_ids: e, pixel_values: t, attention_mask: r, decoder_input_ids: n, decoder_attention_mask: a, encoder_outputs: s, past_key_values: i, inputs_embeds: o, decoder_inputs_embeds: l, num_logits_to_keep: c = null }) {
    if (o || ({ inputs_embeds: o, attention_mask: r } = await this._prepare_inputs_embeds({ input_ids: e, pixel_values: t, inputs_embeds: o, attention_mask: r })), !s) {
      let { last_hidden_state: p } = await Ir(this, { inputs_embeds: o, attention_mask: r });
      s = p;
    }
    if (!l) {
      if (!n) throw new Error("Either `decoder_input_ids` or `decoder_inputs_embeds` should be provided.");
      l = await this.encode_text({ input_ids: n });
    }
    return await _r(this, { inputs_embeds: l, attention_mask: a, encoder_attention_mask: r, encoder_hidden_states: s, past_key_values: i, num_logits_to_keep: c }, !0);
  }
}, oc = class extends I {
}, wF = class extends oc {
}, yF = class extends oc {
}, lc = class extends I {
}, bF = class extends lc {
}, vF = class extends lc {
}, tw = class extends I {
  forward_params = ["input_ids", "attention_mask", "pixel_values", "position_ids", "past_key_values"];
}, rr = class extends tw {
  _merge_input_ids_with_image_features(e) {
    let t = e.image_features.dims.at(-1), r = e.image_features.view(-1, t);
    return Sl({ image_token_id: this.config.image_token_index ?? this.config.image_token_id, ...e, image_features: r });
  }
}, xF = class extends rr {
}, MF = class extends rr {
}, rw = class extends I {
}, kF = class extends rw {
}, nw = class extends rr {
}, TF = class extends nw {
}, aw = class extends I {
  forward_params = ["input_ids", "attention_mask", "inputs_embeds", "per_layer_inputs", "position_ids", "pixel_values", "input_features", "input_features_mask", "past_key_values"];
}, Vs = class extends aw {
  async forward({ input_ids: e = null, attention_mask: t = null, pixel_values: r = null, input_features: n = null, input_features_mask: a = null, position_ids: s = null, inputs_embeds: i = null, per_layer_inputs: o = null, past_key_values: l = null, generation_config: c = null, logits_processor: p = null, num_logits_to_keep: d = null, ..._ }) {
    if ((!i || !o) && ({ inputs_embeds: i, per_layer_inputs: o } = await ye(this.sessions.embed_tokens, { input_ids: e }), e.dims[1] !== 1)) {
      if (r) {
        let { image_features: f } = await this._encode_vision({ pixel_values: r, ..._ });
        ({ inputs_embeds: i, attention_mask: t } = this._merge_input_ids_with_image_features({ image_features: f, inputs_embeds: i, input_ids: e, attention_mask: t }));
      }
      if (n) {
        let { audio_features: f } = await ye(this.sessions.audio_encoder, { input_features: n, input_features_mask: a });
        ({ inputs_embeds: i, attention_mask: t } = this._merge_input_ids_with_audio_features({ audio_features: f, inputs_embeds: i, input_ids: e, attention_mask: t }));
      }
    }
    return await _r(this, { inputs_embeds: i, per_layer_inputs: o, past_key_values: l, attention_mask: t, position_ids: s, generation_config: c, logits_processor: p, num_logits_to_keep: d }, !0);
  }
  _encode_vision(e) {
    return ye(this.sessions.vision_encoder, { pixel_values: e.pixel_values });
  }
  _merge_input_ids_with_image_features(e) {
    let t = e.image_features.dims.at(-1), r = e.image_features.view(-1, t);
    return Sl({ image_token_id: this.config.image_token_id, ...e, image_features: r });
  }
  _merge_input_ids_with_audio_features(e) {
    let t = e.audio_features.dims.at(-1), r = e.audio_features.view(-1, t);
    return zg({ audio_token_id: this.config.audio_token_id, ...e, audio_features: r });
  }
}, EF = class extends Vs {
}, cc = class extends Vs {
  forward_params = ["input_ids", "attention_mask", "inputs_embeds", "per_layer_inputs", "position_ids", "pixel_values", "image_position_ids", "input_features", "input_features_mask", "past_key_values"];
  _encode_vision(e) {
    return ye(this.sessions.vision_encoder, { pixel_values: e.pixel_values, pixel_position_ids: e.image_position_ids });
  }
}, AF = class extends cc {
}, uc = class extends I {
}, CF = class extends uc {
}, SF = class extends uc {
}, dc = class extends I {
}, PF = class extends dc {
}, FF = class extends dc {
}, sw = class extends I {
  forward_params = ["input_ids", "attention_mask", "position_ids", "past_key_values", "pixel_values", "image_grid_thw"];
}, pc = class extends sw {
  image_grid_thw_name = "grid_thw";
  _get_text_only_rope_index(e, t) {
    if (t) {
      let { data: r, dims: n } = Lg(t), a = BigInt64Array.from({ length: 3 * r.length }, (i, o) => r[o % r.length]), s = Array.from({ length: n[0] }, (i, o) => We(r.subarray(n[1] * o, n[1] * (o + 1)))[0] + 1n + BigInt(n[1]));
      return [new V("int64", a, [3, ...n]), new V("int64", s, [s.length, 1])];
    } else {
      let [r, n] = e.dims, a = BigInt64Array.from({ length: 3 * r * n }, (s, i) => BigInt(Math.floor(i % n / r)));
      return [new V("int64", a, [3, ...e.dims]), Om([r, 1])];
    }
  }
  _reorder_and_write_positions(e, t, r, n) {
    let a = e.reduce((l, c) => l + c.length, 0), s = new Array(a), i = 0;
    for (let l = 0; l < 3; ++l) for (let c of e) {
      let p = c.length / 3;
      for (let d = l * p; d < (l + 1) * p; ++d) s[i++] = c[d];
    }
    let o = 0;
    for (let l = 0; l < t.length; ++l) if (t[l] == 1) {
      for (let c = 0; c < 3; ++c) r[c][n][l] = s[c * a / 3 + o];
      ++o;
    }
    return s;
  }
  _get_multimodal_rope_positions({ filtered_ids: e, image_grid_thw_list: t, video_grid_thw_list: r, spatial_merge_size: n, state: a }) {
    let { image_token_id: s, video_token_id: i, vision_start_token_id: o } = this.config, l = e, c = l.reduce((b, x, T) => (x == o && b.push(T), b), []).map((b) => l[b + 1]), p = c.filter((b) => b == s).length, d = c.filter((b) => b == i).length, _ = [], f = 0, w = p, y = d;
    for (let b = 0; b < c.length; ++b) {
      let x = l.findIndex((oe, L) => L > f && oe == s), T = l.findIndex((oe, L) => L > f && oe == i), A = w > 0 && x !== -1 ? x : l.length + 1, E = y > 0 && T !== -1 ? T : l.length + 1, S, O, M, G;
      A < E ? ([O, M, G] = t[a.image_index], ++a.image_index, --w, S = A) : ([O, M, G] = r[a.video_index], ++a.video_index, --y, S = E);
      let [D, U, q] = [Number(O), Math.floor(Number(M) / n), Math.floor(Number(G) / n)], H = S - f, Q = _.length > 0 ? We(_.at(-1))[0] + 1 : 0;
      _.push(Array.from({ length: 3 * H }, (oe, L) => Q + L % H));
      let $ = H + Q, C = D * U * q, ae = Array.from({ length: C }, (oe, L) => $ + Math.floor(L / (U * q))), ge = Array.from({ length: C }, (oe, L) => $ + Math.floor(L / q) % U), J = Array.from({ length: C }, (oe, L) => $ + L % q);
      _.push([ae, ge, J].flat()), f = S + C;
    }
    if (f < l.length) {
      let b = _.length > 0 ? We(_.at(-1))[0] + 1 : 0, x = l.length - f;
      _.push(Array.from({ length: 3 * x }, (T, A) => b + A % x));
    }
    return _;
  }
  get_rope_index(e, t, r, n) {
    let { vision_config: a } = this.config, s = a.spatial_merge_size ?? 2;
    if (t || r) {
      let i = e.tolist();
      n || (n = dl(e));
      let o = n.tolist(), l = Array.from({ length: 3 }, () => Array.from({ length: e.dims[0] }, () => Array.from({ length: e.dims[1] }, () => 0))), c = t ? t.tolist() : [], p = r ? r.tolist() : [], d = { image_index: 0, video_index: 0 }, _ = [];
      for (let f = 0; f < i.length; ++f) {
        let w = i[f].filter((x, T) => o[f][T] == 1), y = this._get_multimodal_rope_positions({ filtered_ids: w, image_grid_thw_list: c, video_grid_thw_list: p, spatial_merge_size: s, state: d }), b = this._reorder_and_write_positions(y, o[f], l, f);
        _.push(We(b)[0] + 1 - i[f].length);
      }
      return [new V("int64", l.flat(1 / 0), [3, e.dims[0], e.dims[1]]), new V("int64", _, [_.length, 1])];
    } else return this._get_text_only_rope_index(e, n);
  }
  async encode_image({ pixel_values: e, image_grid_thw: t }) {
    return (await ye(this.sessions.vision_encoder, { pixel_values: e, [this.image_grid_thw_name]: t })).image_features;
  }
  _merge_input_ids_with_image_features(e) {
    return Sl({ image_token_id: this.config.image_token_id, ...e });
  }
  prepare_inputs_for_generation(e, t, r) {
    if (va(this, t, 1n), !t.attention_mask || t.position_ids || !(this.sessions.decoder_model_merged ?? this.sessions.model).inputNames.includes("position_ids")) return t;
    if (!t.past_key_values) [t.position_ids, t.rope_deltas] = this.get_rope_index(t.input_ids, t.image_grid_thw, t.video_grid_thw, t.attention_mask);
    else {
      t.pixel_values = null;
      let n = t.past_key_values.get_seq_length();
      if (n < t.input_ids.dims[1]) {
        let [a, s] = this.get_rope_index(t.input_ids, t.image_grid_thw, t.video_grid_thw, t.attention_mask);
        t.rope_deltas = s, t.position_ids = a.slice(null, null, [n, null]), t.input_ids = t.input_ids.slice(null, [n, null]);
      } else {
        t.rope_deltas || ([, t.rope_deltas] = this.get_rope_index(t.input_ids, t.image_grid_thw, t.video_grid_thw, t.attention_mask));
        let a = BigInt(n), s = t.rope_deltas.map((i) => a + i);
        t.position_ids = hr([s, s, s], 0);
      }
    }
    return t;
  }
}, iw = class extends pc {
}, hc = class extends pc {
  image_grid_thw_name = "image_grid_thw";
}, ow = class extends iw {
  image_grid_thw_name = "image_grid_thw";
}, IF = class extends hc {
  get_vision_position_ids(e, t, r, n) {
    let a = Math.floor(t[0] / r), s = Math.floor(t[1] / n), i = Math.floor(t[2] / n), o = s * i * a, l = Array.from({ length: o }, () => e), c = Array.from({ length: o }, (d, _) => e + Math.floor(_ / (i * a))), p = Array.from({ length: o }, (d, _) => e + _ % i);
    return [...l, ...c, ...p];
  }
  _get_multimodal_rope_positions({ filtered_ids: e, image_grid_thw_list: t, video_grid_thw_list: r, spatial_merge_size: n, state: a }) {
    let { image_token_id: s } = this.config, i = [], o = 0, l = e[0] == s ? 1 : 0;
    for (let d = 1; d <= e.length; ++d) {
      let _ = d < e.length ? e[d] == s ? 1 : 0 : -1;
      _ !== l && (i.push([l, o, d]), o = d, l = _);
    }
    let c = 0, p = [];
    for (let [d, _, f] of i) if (d === 0) {
      let w = f - _;
      p.push(Array.from({ length: 3 * w }, (y, b) => c + b % w)), c += w;
    } else {
      let w = t[a.image_index++].map(Number), y = w[0];
      p.push(this.get_vision_position_ids(c, w, y, n)), c += Math.max(w[1], w[2]) / n;
    }
    return p;
  }
}, _c = class extends I {
}, LF = class extends _c {
}, OF = class extends _c {
}, fc = class extends I {
}, zF = class extends fc {
}, NF = class extends fc {
}, mc = class extends I {
}, BF = class extends mc {
}, $F = class extends mc {
}, gc = class extends I {
}, DF = class extends gc {
}, RF = class extends gc {
}, wc = class extends I {
}, GF = class extends wc {
}, VF = class extends wc {
}, yc = class extends I {
}, UF = class extends yc {
}, qF = class extends yc {
}, bc = class extends I {
}, jF = class extends bc {
}, WF = class extends bc {
}, vc = class extends I {
}, HF = class extends vc {
}, QF = class extends vc {
}, xc = class extends I {
}, XF = class extends xc {
}, YF = class extends xc {
}, lw = class extends I {
  forward_params = ["input_ids", "attention_mask", "position_ids", "audio_values", "past_key_values"];
}, Mc = class extends lw {
  _merge_input_ids_with_audio_features(e) {
    let t = e.audio_features.dims.at(-1), r = e.audio_features.view(-1, t);
    return zg({ audio_token_id: this.config.ignore_index ?? this.config.audio_token_id ?? this.config.audio_token_index, ...e, audio_features: r });
  }
}, JF = class extends Mc {
  forward_params = ["input_ids", "attention_mask", "input_features", "past_key_values"];
}, cw = class extends I {
}, ZF = class extends cw {
}, uw = class extends I {
}, KF = class extends uw {
}, kc = class extends I {
}, eI = class extends kc {
}, tI = class extends kc {
}, Tc = class extends I {
}, rI = class extends Tc {
}, nI = class extends Tc {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Ec = class extends I {
}, aI = class extends Ec {
}, sI = class extends Ec {
  forward_params = ["input_ids", "attention_mask", "token_type_ids", "past_key_values"];
  prepare_inputs_for_generation(e, t, r) {
    let n = Cn(this, e, t, r);
    return n.token_type_ids = (n.past_key_values ? pl : dl)(n.input_ids), n;
  }
}, Or = class extends I {
}, iI = class extends Or {
}, oI = class extends Or {
  async _call(e) {
    return new Lr(await super._call(e));
  }
}, lI = class extends Or {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, cI = class extends Or {
  async _call(e) {
    return new He(await super._call(e));
  }
}, uI = class extends I {
}, dI = class extends Or {
}, pI = class extends Or {
  async _call(e) {
    return new Lr(await super._call(e));
  }
}, hI = class extends Or {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Ac = class extends I {
}, _I = class extends Ac {
}, fI = class extends Ac {
}, dw = class extends rr {
  forward_params = ["input_ids", "attention_mask", "pixel_values", "pixel_attention_mask", "position_ids", "past_key_values"];
}, Cc = class extends I {
}, mI = class extends Cc {
}, gI = class extends Cc {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Sc = class extends I {
}, wI = class extends Sc {
}, yI = class extends Sc {
}, Us = class extends I {
}, bI = class extends Us {
  async forward(e) {
    let t = !e.input_ids, r = !e.pixel_values;
    if (t && r) throw new Error("Either `input_ids` or `pixel_values` should be provided.");
    if (t && (e.input_ids = mt([e.pixel_values.dims[0], 1])), r) {
      let { image_size: l } = this.config.vision_config;
      e.pixel_values = ut([0, 3, l, l], 0);
    }
    let { text_embeddings: n, image_embeddings: a, l2norm_text_embeddings: s, l2norm_image_embeddings: i } = await super.forward(e), o = {};
    return t || (o.text_embeddings = n, o.l2norm_text_embeddings = s), r || (o.image_embeddings = a, o.l2norm_image_embeddings = i), o;
  }
}, pw = class extends Us {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "text_model" });
  }
}, vI = class extends Us {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "vision_model" });
  }
}, Pc = class extends I {
}, xI = class extends Pc {
}, MI = class extends Pc {
}, kI = class extends rr {
}, Fc = class extends I {
}, TI = class extends Fc {
}, EI = class extends Fc {
}, AI = class extends rr {
  forward_params = ["input_ids", "attention_mask", "pixel_values", "pixel_attention_mask", "spatial_shapes", "position_ids", "past_key_values"];
}, Ic = class extends I {
}, CI = class extends Ic {
}, SI = class extends Ic {
}, hw = class extends I {
}, PI = class extends hw {
}, Lc = class extends I {
}, FI = class extends Lc {
}, II = class extends Lc {
}, Oc = class extends I {
}, LI = class extends Oc {
}, OI = class extends Oc {
}, zc = class extends I {
}, zI = class extends zc {
}, NI = class extends zc {
}, Nc = class extends I {
}, BI = class extends Nc {
}, $I = class extends Nc {
}, Ea = class extends I {
}, DI = class extends Ea {
}, RI = class extends Ea {
}, GI = class extends Ea {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, VI = class extends Ea {
}, _w = class extends I {
}, UI = class extends _w {
}, fw = class extends I {
}, qI = class extends fw {
}, mw = class extends Ge {
  constructor({ char_logits: e, bpe_logits: t, wp_logits: r }) {
    super(), this.char_logits = e, this.bpe_logits = t, this.wp_logits = r;
  }
  get logits() {
    return [this.char_logits, this.bpe_logits, this.wp_logits];
  }
}, gw = class extends I {
}, jI = class extends gw {
  async _call(e) {
    return new mw(await super._call(e));
  }
}, ww = class extends Ge {
  constructor({ audio_codes: e }) {
    super(), this.audio_codes = e;
  }
}, yw = class extends Ge {
  constructor({ audio_values: e }) {
    super(), this.audio_values = e;
  }
}, qs = class extends I {
  main_input_name = "input_values";
  forward_params = ["input_values"];
}, WI = class extends qs {
  async encode(e) {
    return new ww(await ye(this.sessions.encoder_model, e));
  }
  async decode(e) {
    return new yw(await ye(this.sessions.decoder_model, e));
  }
}, bw = class extends qs {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "encoder_model" });
  }
}, vw = class extends qs {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "decoder_model" });
  }
}, Bc = class extends I {
}, HI = class extends Bc {
}, QI = class extends Bc {
}, $c = class extends I {
}, XI = class extends $c {
}, YI = class extends $c {
}, Dc = class extends I {
}, JI = class extends Dc {
}, ZI = class extends Dc {
}, KI = class extends rr {
}, Rc = class extends I {
}, eL = class extends Rc {
}, tL = class extends Rc {
}, Aa = class extends I {
}, rL = class extends Aa {
}, nL = class extends Aa {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, aL = class extends Aa {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, sL = class extends Aa {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, Gc = class extends I {
}, iL = class extends Gc {
}, oL = class extends Gc {
}, js = class extends I {
}, lL = class extends js {
}, cL = class extends js {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, uL = class extends js {
}, Ws = class extends I {
}, dL = class extends Ws {
}, pL = class extends Ws {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, hL = class extends Ws {
}, Hs = class extends I {
}, _L = class extends Hs {
}, fL = class extends Hs {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, mL = class extends Hs {
}, Qs = class extends I {
}, gL = class extends Qs {
}, wL = class extends Qs {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, yL = class extends Qs {
}, Vc = class extends I {
}, bL = class extends Vc {
}, vL = class extends Vc {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Uc = class extends I {
}, xL = class extends Uc {
}, ML = class extends Uc {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Ca = class extends I {
}, kL = class extends Ca {
}, TL = class extends Ca {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, EL = class extends Ca {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, AL = class extends Ca {
  async _call(e) {
    return new He(await super._call(e));
  }
}, qc = class extends I {
}, CL = class extends qc {
}, SL = class extends qc {
}, jc = class extends I {
  requires_attention_mask = !1;
  main_input_name = "input_values";
  forward_params = ["input_values", "decoder_input_ids", "past_key_values"];
}, PL = class extends jc {
}, FL = class extends jc {
}, Rn = class extends I {
}, IL = class extends Rn {
}, LL = class extends Rn {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, OL = class extends Rn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, zL = class extends Rn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, NL = class extends Rn {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, Wc = class extends I {
}, BL = class extends Wc {
}, $L = class extends Wc {
}, Hc = class extends I {
}, DL = class extends Hc {
}, RL = class extends Hc {
}, xw = class extends I {
}, GL = class extends xw {
  forward_params = ["input_ids", "pixel_values", "images_seq_mask", "images_emb_mask", "attention_mask", "position_ids", "past_key_values"];
  constructor(...e) {
    super(...e), this._generation_mode = "text";
  }
  async forward(e) {
    let t = this._generation_mode ?? "text", r;
    if (t === "text" || !e.past_key_values) {
      let o = this.sessions.prepare_inputs_embeds, l = et(e, o.inputNames);
      r = await ye(o, l);
    } else {
      let o = this.sessions.gen_img_embeds, l = et({ image_ids: e.input_ids }, o.inputNames);
      r = await ye(o, l);
    }
    let n = { ...e, ...r }, a = await _r(this, n), s = this.sessions[t === "text" ? "lm_head" : "gen_head"];
    if (!s) throw new Error(`Unable to find "${s}" generation head`);
    let i = await ye(s, et(a, s.inputNames));
    return { ...r, ...a, ...i };
  }
  prepare_inputs_for_generation(e, t, r) {
    let n = !!t.past_key_values;
    return va(this, t, 1n), r.guidance_scale !== null && r.guidance_scale > 1 && (n ? t.input_ids = Ne([t.input_ids, t.input_ids], 0) : (t.input_ids = Ne([t.input_ids, Uo(t.input_ids, BigInt(r.pad_token_id))], 0), t.attention_mask = Ne([t.attention_mask, Uo(t.attention_mask, 0n)], 0))), (n || !t.pixel_values) && (t.pixel_values = ut([0, 0, 3, 384, 384], 1)), n && (t.images_seq_mask = new V("bool", new Array(1).fill(!0).fill(!1, 0, 1), [1, 1]), t.images_emb_mask = new V("bool", new Array(0).fill(!1), [1, 1, 0])), t;
  }
  async generate(e) {
    return this._generation_mode = "text", super.generate(e);
  }
  async generate_images(e) {
    this._generation_mode = "image";
    let t = (e.inputs ?? e[this.main_input_name]).dims[1], r = (await super.generate(e)).slice(null, [t, null]), n = this.sessions.image_decode, { decoded_image: a } = await ye(n, { generated_tokens: r }), s = a.add_(1).mul_(255 / 2).clamp_(0, 255).to("uint8"), i = [];
    for (let o of s) {
      let l = kt.fromTensor(o);
      i.push(l);
    }
    return i;
  }
}, Qc = class extends I {
}, VL = class extends Qc {
}, UL = class extends Qc {
}, Mw = class extends I {
  forward_params = ["input_ids", "attention_mask", "encoder_outputs", "decoder_input_ids", "decoder_attention_mask", "past_key_values"];
  _apply_and_filter_by_delay_pattern_mask(e) {
    let [t, r] = e.dims, n = this.config.decoder.num_codebooks, a = r - n, s = 0;
    for (let l = 0; l < e.size; ++l) {
      if (e.data[l] == this.config.decoder.pad_token_id) continue;
      let c = l % r, p = Math.floor(l / r) % n, d = c - p;
      d > 0 && d <= a && (e.data[s++] = e.data[l]);
    }
    let i = Math.floor(t / n), o = s / (i * n);
    return new V(e.type, e.data.slice(0, s), [i, n, o]);
  }
  prepare_inputs_for_generation(e, t, r) {
    let n = BigInt(this.config.decoder.pad_token_id), a = structuredClone(e);
    for (let s = 0; s < a.length; ++s) for (let i = 0; i < a[s].length; ++i) s % this.config.decoder.num_codebooks >= i && (a[s][i] = n);
    return r.guidance_scale !== null && r.guidance_scale > 1 && (a = a.concat(a)), Es(this, a, t, r);
  }
  async generate(e) {
    let t = await super.generate(e), r = this._apply_and_filter_by_delay_pattern_mask(t).unsqueeze_(0), { audio_values: n } = await ye(this.sessions.encodec_decode, { audio_codes: r });
    return n;
  }
}, Xc = class extends I {
}, qL = class extends Xc {
}, jL = class extends Xc {
}, Yc = class extends I {
}, WL = class extends Yc {
}, HL = class extends Yc {
}, Gn = class extends I {
}, QL = class extends Gn {
}, XL = class extends Gn {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, YL = class extends Gn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, JL = class extends Gn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, ZL = class extends Gn {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, kw = class extends I {
}, KL = class extends kw {
}, Jc = class extends I {
}, eO = class extends Jc {
}, tO = class extends Jc {
}, Zc = class extends I {
}, rO = class extends Zc {
}, nO = class extends Zc {
}, Kc = class extends I {
}, aO = class extends Kc {
}, sO = class extends Kc {
}, eu = class extends I {
}, iO = class extends eu {
}, oO = class extends eu {
}, tu = class extends I {
}, lO = class extends tu {
}, cO = class extends tu {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, ru = class extends I {
}, uO = class extends ru {
}, dO = class extends ru {
}, nu = class extends I {
}, pO = class extends nu {
}, hO = class extends nu {
}, au = class extends I {
}, _O = class extends au {
}, fO = class extends au {
}, su = class extends I {
}, mO = class extends su {
}, gO = class extends su {
}, wO = class extends rr {
}, Tw = class extends I {
}, yO = class extends Tw {
  async _call(e) {
    return new Lr(await super._call(e));
  }
}, iu = class extends I {
}, bO = class extends iu {
}, vO = class extends iu {
}, ou = class extends I {
}, xO = class extends ou {
}, MO = class extends ou {
}, lu = class extends I {
}, kO = class extends lu {
}, TO = class extends lu {
}, cu = class extends I {
}, EO = class extends cu {
}, AO = class extends cu {
}, Ew = class extends I {
  forward_params = ["input_ids", "inputs_embeds", "attention_mask", "position_ids", "pixel_values", "image_sizes", "past_key_values"];
}, Aw = class extends Ew {
  async forward({ input_ids: e = null, attention_mask: t = null, pixel_values: r = null, image_sizes: n = null, position_ids: a = null, inputs_embeds: s = null, past_key_values: i = null, generation_config: o = null, logits_processor: l = null, num_logits_to_keep: c = null, ...p }) {
    if (!s) {
      let d;
      if (r && e.dims[1] !== 1) {
        if (!n) throw new Error("`image_sizes` must be provided when `pixel_values` is provided.");
        ({ image_features: d } = await ye(this.sessions.vision_encoder, { pixel_values: r, image_sizes: n }));
      } else {
        let _ = this.config.normalized_config.hidden_size;
        d = new V("float32", [], [0, _]);
      }
      ({ inputs_embeds: s } = await ye(this.sessions.prepare_inputs_embeds, { input_ids: e, image_features: d }));
    }
    return await _r(this, { inputs_embeds: s, past_key_values: i, attention_mask: t, position_ids: a, generation_config: o, logits_processor: l, num_logits_to_keep: c }, !1);
  }
}, uu = class extends I {
}, CO = class extends uu {
}, SO = class extends uu {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, du = class extends I {
}, PO = class extends du {
}, FO = class extends du {
  async _call(e) {
    return new He(await super._call(e));
  }
}, pu = class extends I {
}, IO = class extends pu {
}, LO = class extends pu {
}, hu = class extends I {
}, OO = class extends hu {
}, zO = class extends hu {
}, _u = class extends I {
}, NO = class extends _u {
}, BO = class extends _u {
}, fu = class extends I {
}, $O = class extends fu {
}, DO = class extends fu {
}, mu = class extends I {
}, RO = class extends mu {
}, GO = class extends mu {
}, gu = class extends hc {
}, Cw = class extends ow {
}, VO = class extends gu {
}, UO = class extends Cw {
}, wu = class extends gu {
}, Sw = class extends wu {
}, qO = class extends wu {
}, jO = class extends Sw {
}, yu = class extends I {
}, WO = class extends yu {
}, HO = class extends yu {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, bu = class extends I {
}, QO = class extends bu {
}, XO = class extends bu {
  async _call(e) {
    return new Pw(await super._call(e));
  }
}, Pw = class extends Ma {
}, Vn = class extends I {
}, YO = class extends Vn {
}, JO = class extends Vn {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, ZO = class extends Vn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, KO = class extends Vn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, ez = class extends Vn {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, Un = class extends I {
}, tz = class extends Un {
}, rz = class extends Un {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, nz = class extends Un {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, az = class extends Un {
  async _call(e) {
    return new He(await super._call(e));
  }
}, sz = class extends Un {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, vu = class extends I {
}, iz = class extends vu {
}, oz = class extends vu {
  async _call(e) {
    return new Fw(await super._call(e));
  }
}, Fw = class extends Ma {
}, Iw = class extends Ge {
  constructor({ iou_scores: e, pred_masks: t }) {
    super(), this.iou_scores = e, this.pred_masks = t;
  }
}, Lw = class extends I {
}, lz = class extends Lw {
  async get_image_embeddings({ pixel_values: e }) {
    return await Ir(this, { pixel_values: e });
  }
  async forward(e) {
    !e.image_embeddings || !e.image_positional_embeddings ? e = { ...e, ...await this.get_image_embeddings(e) } : e = { ...e }, e.input_labels ??= mt(e.input_points.dims.slice(0, -1));
    let t = { image_embeddings: e.image_embeddings, image_positional_embeddings: e.image_positional_embeddings };
    return e.input_points && (t.input_points = e.input_points), e.input_labels && (t.input_labels = e.input_labels), e.input_boxes && (t.input_boxes = e.input_boxes), await ye(this.sessions.prompt_encoder_mask_decoder, t);
  }
  async _call(e) {
    return new Iw(await super._call(e));
  }
}, Ow = class extends Ge {
  constructor({ iou_scores: e, pred_masks: t, object_score_logits: r }) {
    super(), this.iou_scores = e, this.pred_masks = t, this.object_score_logits = r;
  }
}, zw = class extends I {
}, xu = class extends zw {
  async get_image_embeddings({ pixel_values: e }) {
    return await Ir(this, { pixel_values: e });
  }
  async forward(e) {
    let { num_feature_levels: t } = this.config.vision_config;
    if (Array.from({ length: t }, (a, s) => `image_embeddings.${s}`).some((a) => !e[a]) ? e = { ...e, ...await this.get_image_embeddings(e) } : e = { ...e }, e.input_points) {
      if (e.input_boxes && e.input_boxes.dims[1] !== 1) throw new Error("When both `input_points` and `input_boxes` are provided, the number of boxes per image must be 1.");
      let a = e.input_points.dims;
      e.input_labels ??= mt(a.slice(0, -1)), e.input_boxes ??= ut([a[0], 0, 4], 0);
    } else if (e.input_boxes) {
      let a = e.input_boxes.dims;
      e.input_labels = ut([a[0], a[1], 0], -1n), e.input_points = ut([a[0], 1, 0, 2], 0);
    } else throw new Error("At least one of `input_points` or `input_boxes` must be provided.");
    let r = this.sessions.prompt_encoder_mask_decoder, n = et(e, r.inputNames);
    return await ye(r, n);
  }
  async _call(e) {
    return new Ow(await super._call(e));
  }
}, cz = class extends xu {
}, uz = class extends xu {
}, Xs = class extends I {
}, dz = class extends Xs {
}, pz = class extends Xs {
}, hz = class extends Xs {
}, Ys = class extends I {
}, _z = class extends Ys {
}, fz = class extends Ys {
}, mz = class extends Ys {
}, Mu = class extends I {
}, gz = class extends Mu {
}, Nw = class extends Mu {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "text_model" });
  }
}, wz = class extends sn {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "vision_model" });
  }
}, ku = class extends I {
}, yz = class extends ku {
}, bz = class extends ku {
}, vz = class extends dw {
}, Js = class extends I {
  main_input_name = "input_values";
  forward_params = ["input_values"];
}, xz = class extends Js {
  async encode(e) {
    return await ye(this.sessions.encoder_model, e);
  }
  async decode(e) {
    return await ye(this.sessions.decoder_model, e);
  }
}, Bw = class extends Js {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "encoder_model" });
  }
}, $w = class extends Js {
  static async from_pretrained(e, t = {}) {
    return super.from_pretrained(e, { ...t, model_file_name: t.model_file_name ?? "decoder_model" });
  }
}, Tu = class extends I {
}, Mz = class extends Tu {
}, kz = class extends Tu {
}, Zs = class extends I {
}, Tz = class extends Zs {
}, Ez = class extends Zs {
}, Az = class extends Zs {
  async generate_speech(e, t, { threshold: r = 0.5, minlenratio: n = 0, maxlenratio: a = 20, vocoder: s = null } = {}) {
    let i = { input_ids: e }, { encoder_outputs: o, encoder_attention_mask: l } = await Ir(this, i), c = o.dims[1] / this.config.reduction_factor, p = Math.floor(c * a), d = Math.floor(c * n), _ = this.config.num_mel_bins, f = [], w = null, y = null, b = 0;
    for (; ; ) {
      ++b;
      let A = Pg(!!y), E;
      y ? E = y.output_sequence_out : E = new V("float32", new Float32Array(_), [1, 1, _]);
      let S = { use_cache_branch: A, output_sequence: E, encoder_attention_mask: l, speaker_embeddings: t, encoder_hidden_states: o };
      Cl(this, S, w), y = await ye(this.sessions.decoder_model_merged, S), w = Yo(y, w);
      let { prob: O, spectrum: M } = y;
      if (f.push(M), b >= d && (Array.from(O.data).filter((G) => G >= r).length > 0 || b >= p)) break;
    }
    let x = Ne(f), { waveform: T } = await ye(s.sessions.model, { spectrogram: x });
    return { spectrogram: x, waveform: T };
  }
}, Cz = class extends I {
  main_input_name = "spectrogram";
}, Sa = class extends I {
}, Sz = class extends Sa {
}, Pz = class extends Sa {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, Fz = class extends Sa {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Iz = class extends Sa {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, Eu = class extends I {
}, Lz = class extends Eu {
}, Oz = class extends Eu {
}, Au = class extends I {
}, zz = class extends Au {
}, Nz = class extends Au {
}, Dw = class extends I {
}, Bz = class extends Dw {
}, Rw = class extends I {
}, Gw = class extends Rw {
  async generate_speech({ input_ids: e, attention_mask: t, style: r, num_inference_steps: n = 5, speed: a = 1.05 }) {
    let { sampling_rate: s, chunk_compress_factor: i, base_chunk_size: o, latent_dim: l } = this.config, { last_hidden_state: c, durations: p } = await ye(this.sessions.text_encoder, { input_ids: e, attention_mask: t, style: r }), d = p.div(a).mul_(s), _ = o * i, f = d.data, w = Int32Array.from(f, (D) => Math.ceil(D / _)), y = Math.max(...w), b = e.dims[0], x = new BigInt64Array(b * y);
    for (let D = 0; D < b; ++D) x.fill(1n, D * y, D * y + w[D]);
    let T = new V("int64", x, [b, y]), A = l * i, E = A * y, S = KT([b, A, y]), O = S.data;
    for (let D = 0; D < b; ++D) if (w[D] !== y) for (let U = 0; U < A; ++U) O.fill(0, D * E + U * y + w[D], D * E + (U + 1) * y);
    let M = ut([b], n);
    for (let D = 0; D < n; ++D) {
      let U = ut([b], D);
      ({ denoised_latents: S } = await ye(this.sessions.latent_denoiser, { style: r, noisy_latents: S, latent_mask: T, encoder_outputs: c, attention_mask: t, timestep: U, num_inference_steps: M }));
    }
    let { waveform: G } = await ye(this.sessions.voice_decoder, { latents: S });
    return { waveform: G, durations: d };
  }
}, Ks = class extends I {
}, $z = class extends Ks {
}, Dz = class extends Ks {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Rz = class extends Ks {
}, Cu = class extends I {
}, Gz = class extends Cu {
}, Vz = class extends Cu {
}, Su = class extends I {
  forward_params = ["input_ids", "attention_mask", "encoder_outputs", "decoder_input_ids", "decoder_attention_mask", "past_key_values"];
}, Uz = class extends Su {
}, qz = class extends Su {
}, Pu = class extends I {
}, jz = class extends Pu {
}, Wz = class extends Pu {
  async _call(e) {
    return new Vw(await super._call(e));
  }
}, Vw = class extends Jl {
}, Uw = class extends I {
}, Hz = class extends Uw {
}, ei = class extends I {
}, Qz = class extends ei {
}, Xz = class extends ei {
  async _call(e) {
    return new Lr(await super._call(e));
  }
}, Yz = class extends ei {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Pa = class extends I {
}, Jz = class extends Pa {
}, Zz = class extends Pa {
  async _call(e) {
    return new Lr(await super._call(e));
  }
}, Kz = class extends Pa {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, e3 = class extends Pa {
  async _call(e) {
    return new He(await super._call(e));
  }
}, Fu = class extends I {
}, t3 = class extends Fu {
}, r3 = class extends Fu {
}, n3 = class extends I {
  main_input_name = "pixel_values";
  forward_params = ["pixel_values", "decoder_input_ids", "encoder_hidden_states", "past_key_values"];
}, Iu = class extends I {
}, a3 = class extends Iu {
}, s3 = class extends Iu {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, qw = class extends I {
}, i3 = class extends qw {
}, Lu = class extends I {
}, o3 = class extends Lu {
}, l3 = class extends Lu {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, jw = class extends I {
}, c3 = class extends jw {
  async _call(e) {
    return new kg(await super._call(e));
  }
}, Ww = class extends I {
}, u3 = class extends Ww {
}, Hw = class extends Ge {
  constructor({ waveform: e, spectrogram: t }) {
    super(), this.waveform = e, this.spectrogram = t;
  }
}, Qw = class extends I {
}, d3 = class extends Qw {
  async _call(e) {
    return new Hw(await super._call(e));
  }
}, p3 = class extends Mc {
}, zf = 2, h3 = 1, zo = /* @__PURE__ */ new WeakMap();
function _3(e, t) {
  let { text_config: r, audio_config: n } = e.config, a = e.sessions.audio_encoder, { num_mel_bins: s, hidden_size: i } = n, o = s + i, l = new Ml(), c = Ns(n), p = { batch_size: 1 }, d = "float32";
  for (let y of a.inputMetadata) {
    if (y.name === "past_padding_cache") {
      d = y.type;
      continue;
    }
    if (!c.has(y.name)) continue;
    let b = Fg(y.shape, p), x = b.reduce((A, E) => A * E, 1), T = pa[y.type];
    l[y.name] = new V(y.type, new T(x), b);
  }
  let _ = pa[d], f = new V(d, new _(o * zf), [1, o, zf]), w = t[Symbol.asyncIterator]?.() ?? t[Symbol.iterator]?.();
  if (!w) throw new Error("input_features must be iterable or async iterable");
  return { encoder_session: a, enc_kv_cache: l, enc_padding_cache: f, enc_past_seq_len: 0, audio_embed_queue: [], audio_embed_total_tokens: 0, audio_queue_offset: 0, audio_consumed: 0, stream_exhausted: !1, chunks_iter: w, text_hidden_size: r.hidden_size };
}
async function f3(e, t) {
  let r = t.dims[2], n = Math.floor((h3 + r - 3) / 2) + 1, a = new V("int64", BigInt64Array.from({ length: n }, (p, d) => BigInt(e.enc_past_seq_len + d)), [1, n]), s = e.enc_past_seq_len + n, i = mt([1, s]), { audio_embeds: o, present_padding_cache: l, ...c } = await ye(e.encoder_session, { input_features: t, attention_mask: i, position_ids: a, past_padding_cache: e.enc_padding_cache, ...e.enc_kv_cache });
  e.enc_padding_cache.location === "gpu-buffer" && e.enc_padding_cache.dispose(), e.enc_padding_cache = l;
  for (let p in c) if (p.startsWith("present.")) {
    let d = p.replace("present", "past_key_values"), _ = e.enc_kv_cache[d];
    _?.location === "gpu-buffer" && _.dispose(), e.enc_kv_cache[d] = c[p];
  }
  return e.enc_past_seq_len = s, o;
}
async function m3(e, t) {
  for (; e.audio_embed_total_tokens < t && !e.stream_exhausted; ) {
    let r = await e.chunks_iter.next();
    if (r.done) {
      e.stream_exhausted = !0;
      break;
    }
    let n = await f3(e, r.value);
    e.audio_embed_queue.push({ data: n.data, tokens: n.dims[1] }), e.audio_embed_total_tokens += n.dims[1];
  }
}
function g3(e, t, r) {
  if (e.audio_embed_queue.length === 0) return;
  let n = t.data, a = 0, s = r;
  for (; s > 0 && e.audio_embed_queue.length > 0; ) {
    let i = e.audio_embed_queue[0], o = i.tokens - e.audio_queue_offset, l = Math.min(s, o), c = e.audio_queue_offset * e.text_hidden_size;
    for (let p = 0; p < l * e.text_hidden_size; ++p) n[a * e.text_hidden_size + p] += i.data[c + p];
    a += l, s -= l, e.audio_queue_offset += l, e.audio_queue_offset >= i.tokens && (e.audio_embed_queue.shift(), e.audio_queue_offset = 0);
  }
  e.audio_consumed += r - s;
}
var w3 = class extends ba {
  constructor(e) {
    super(), this._s = e;
  }
  _call(e) {
    let t = this._s.stream_exhausted && this._s.audio_embed_queue.length === 0;
    return e.map(() => t);
  }
}, Xw = class extends I {
  forward_params = ["input_ids", "attention_mask", "position_ids", "past_key_values"];
}, Yw = class extends Xw {
  async forward({ input_ids: e, past_key_values: t, ...r }) {
    let n = e.dims[1], a = zo.get(this);
    a && await m3(a, a.audio_consumed + n);
    let { inputs_embeds: s } = await ye(this.sessions.embed_tokens, { input_ids: e });
    a && g3(a, s, n);
    let i = { inputs_embeds: s, ...r };
    Cl(this, i, t);
    let o = this.sessions.decoder_model_merged, l = et(i, o.inputNames);
    return await ye(o, l);
  }
  async generate({ input_features: e, stopping_criteria: t, ...r }) {
    if (!e) throw new Error("input_features (generator/iterable) must be provided");
    let n = _3(this, e);
    zo.set(this, n);
    let a = new Ag();
    a.push(new w3(n)), t && a.extend(t);
    try {
      return await super.generate({ ...r, stopping_criteria: a });
    } finally {
      n.enc_kv_cache.dispose(), zo.delete(this);
    }
  }
}, ti = class extends I {
}, y3 = class extends ti {
}, b3 = class extends ti {
  async _call(e) {
    return new Lr(await super._call(e));
  }
}, v3 = class extends ti {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, Jw = class extends Ge {
  constructor({ logits: e, embeddings: t }) {
    super(), this.logits = e, this.embeddings = t;
  }
}, qn = class extends I {
}, x3 = class extends qn {
}, M3 = class extends qn {
  async _call(e) {
    return new Lr(await super._call(e));
  }
}, k3 = class extends qn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, T3 = class extends qn {
  async _call(e) {
    return new Jw(await super._call(e));
  }
}, E3 = class extends qn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, Zw = class extends I {
}, A3 = class extends Zw {
}, C3 = class extends Eg {
  return_timestamps = null;
  return_token_timestamps = null;
  num_frames = null;
  alignment_heads = null;
  task = null;
  language = null;
  no_timestamps_token_id = null;
  prompt_ids = null;
  is_multilingual = null;
  lang_to_id = null;
  task_to_id = null;
  max_initial_timestamp_index = 1;
}, Ou = class extends I {
  requires_attention_mask = !1;
  main_input_name = "input_features";
  forward_params = ["input_features", "attention_mask", "decoder_input_ids", "decoder_attention_mask", "past_key_values"];
}, S3 = class extends Ou {
}, Kw = class extends Ou {
  _prepare_generation_config(e, t) {
    return super._prepare_generation_config(e, t, C3);
  }
  _retrieve_init_tokens(e) {
    let t = [e.decoder_start_token_id], r = e.language, n = e.task;
    if (e.is_multilingual) {
      r || (ce.warn("No language specified - defaulting to English (en)."), r = "en");
      let a = `<|${QE(r)}|>`;
      t.push(e.lang_to_id[a]), t.push(e.task_to_id[n ?? "transcribe"]);
    } else if (r || n) throw new Error("Cannot specify `task` or `language` for an English-only model. If the model is intended to be multilingual, pass `is_multilingual=true` to generate, or update the generation config.");
    return !e.return_timestamps && e.no_timestamps_token_id && t.at(-1) !== e.no_timestamps_token_id ? t.push(e.no_timestamps_token_id) : e.return_timestamps && t.at(-1) === e.no_timestamps_token_id && (ce.warn("<|notimestamps|> prompt token is removed from generation_config since `return_timestamps` is set to `true`."), t.pop()), t.filter((a) => a != null);
  }
  async generate({ inputs: e = null, generation_config: t = null, logits_processor: r = null, stopping_criteria: n = null, ...a }) {
    t = this._prepare_generation_config(t, a);
    let s = a.decoder_input_ids instanceof V ? _l(a.decoder_input_ids) : a.decoder_input_ids ?? this._retrieve_init_tokens(t);
    if (t.return_timestamps && (r ??= new Qo(), r.push(new FC(t, s))), t.begin_suppress_tokens && (r ??= new Qo(), r.push(new Tg(t.begin_suppress_tokens, s.length))), t.return_token_timestamps) {
      if (!t.alignment_heads) throw new Error("Model generation config has no `alignment_heads`, token-level timestamps not available. See https://gist.github.com/hollance/42e32852f24243b748ae6bc1f985b13a on how to add this property to the generation config.");
      t.task === "translate" && ce.warn("Token-level timestamps may not be reliable for task 'translate'."), t.output_attentions = !0, t.return_dict_in_generate = !0;
    }
    if (t.return_timestamps && !a.max_new_tokens) return this._generate_with_seek({ inputs: e, generation_config: t, logits_processor: r, init_tokens: s, kwargs: a });
    let i = await super.generate({ inputs: e, generation_config: t, logits_processor: r, decoder_input_ids: s, ...a });
    return t.return_token_timestamps && (i.token_timestamps = this._extract_token_timestamps(i, t.alignment_heads, t.num_frames, 0.02, s.length)), i;
  }
  async _generate_with_seek({ inputs: e, generation_config: t, logits_processor: r, init_tokens: n, kwargs: a }) {
    let s = t.no_timestamps_token_id + 1, i = Array.isArray(t.eos_token_id) ? t.eos_token_id[0] : t.eos_token_id, o = t.return_token_timestamps, l = e, c = l.dims[2], p = 2, d = this.config.max_source_positions, _ = p * d, f = 0, w = [], y = [];
    for (; f < c; ) {
      let x = Math.min(f + _, c), T = l.slice(null, null, [f, x]), A, E = T.dims[2];
      if (E < _) {
        let C = l.dims[1], ae = new Float32Array(C * _), ge = T.data;
        for (let J = 0; J < C; ++J) ae.set(ge.subarray(J * E, (J + 1) * E), J * _);
        A = new V("float32", ae, [1, C, _]);
      } else A = T;
      if (r) for (let C of r) "begin_index" in C && (C.begin_index = n.length);
      let S = await super.generate({ inputs: A, generation_config: t, logits_processor: r, decoder_input_ids: n, ...a }), O = (o ? S.sequences : S)[0].tolist().map(Number).slice(n.length), M;
      if (o) {
        S.token_timestamps = this._extract_token_timestamps(S, t.alignment_heads, Math.floor((x - f) / p), 0.02, n.length);
        let C = f / p * 0.02;
        M = S.token_timestamps[0].tolist().slice(n.length).map((ae) => ae + C);
      }
      if (O.length > 0 && O.at(-1) === i && O.pop(), O.length === 0) break;
      let G = O.map((C) => C >= s), D = O.length >= 2 && G[O.length - 1] && !G[O.length - 2], U = [];
      for (let C = 0; C < O.length - 1; ++C) G[C] && G[C + 1] && U.push(C + 1);
      let q, H = O.length;
      if (U.length > 0) if (D) q = x - f;
      else {
        let C = U.at(-1);
        q = (O[C - 1] - s) * p, H = C;
      }
      else q = x - f;
      let Q = Math.floor(f / p), $ = s + 1500;
      for (let C = 0; C < H; ++C) O[C] >= s && (O[C] = Math.min(O[C] + Q, $));
      w.push(...O.slice(0, H)), M && y.push(...M.slice(0, H)), f += q;
    }
    w.push(i);
    let b = [...n, ...w];
    if (o) {
      let x = new V("int64", b.map(BigInt), [1, b.length]), T = [...new Array(n.length).fill(0), ...y, 0], A = new V("float32", new Float32Array(T), [1, T.length]);
      return { sequences: x, token_timestamps: A };
    }
    return new V("int64", b.map(BigInt), [1, b.length]);
  }
  _extract_token_timestamps(e, t, r = null, n = 0.02, a = 0) {
    if (!e.cross_attentions) throw new Error("Model outputs must contain cross attentions to extract timestamps. This is most likely because the model was not exported with `output_attentions=True`.");
    r == null && ce.warn("`num_frames` has not been set, meaning the entire audio will be analyzed. This may lead to inaccurate token-level timestamps for short audios (< 30 seconds).");
    let s = this.config.median_filter_width;
    s === void 0 && (ce.warn("Model config has no `median_filter_width`, using default value of 7."), s = 7);
    let i = e.cross_attentions, o = Array.from({ length: this.config.decoder_layers }, (b, x) => Ne(i.map((T) => T[x]), 2)), l = hr(t.map(([b, x]) => {
      if (b >= o.length) throw new Error(`Layer index ${b} is out of bounds for cross attentions (length ${o.length}).`);
      return r ? o[b].slice(null, x, null, [0, r]) : o[b].slice(null, x);
    })).permute(1, 0, 2, 3), [c, p] = Lm(l, -2, 0, !0), d = l.clone();
    for (let b = 0; b < d.dims[0]; ++b) {
      let x = d[b];
      for (let T = 0; T < x.dims[0]; ++T) {
        let A = x[T], E = c[b][T][0].data, S = p[b][T][0].data;
        for (let O = 0; O < A.dims[0]; ++O) {
          let M = A[O].data;
          for (let G = 0; G < M.length; ++G) M[G] = (M[G] - S[G]) / E[G];
          M.set(zT(M, s));
        }
      }
    }
    let _ = a > 0 ? d.slice(null, null, [a, d.dims[2]], null) : d, f = [cl(_, 1)], w = e.sequences.dims, y = new V("float32", new Float32Array(w[0] * w[1]), w);
    for (let b = 0; b < w[0]; ++b) {
      let x = f[b].neg().squeeze_(0), [T, A] = BT(x.tolist()), E = Array.from({ length: T.length - 1 }, (G, D) => T[D + 1] - T[D]), S = $t([1], E).map((G) => !!G), O = [];
      for (let G = 0; G < S.length; ++G) S[G] && O.push(A[G] * n);
      let M = new Array(a).fill(0);
      M.push(...O), O.length > 0 && M.push(O.at(-1)), y[b].data.set(M);
    }
    return y;
  }
}, P3 = class extends Kw {
}, jn = class extends I {
}, F3 = class extends jn {
}, I3 = class extends jn {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, L3 = class extends jn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, O3 = class extends jn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, z3 = class extends jn {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, Wn = class extends I {
}, N3 = class extends Wn {
}, B3 = class extends Wn {
  async _call(e) {
    return new Xe(await super._call(e));
  }
}, $3 = class extends Wn {
  async _call(e) {
    return new ne(await super._call(e));
  }
}, D3 = class extends Wn {
  async _call(e) {
    return new He(await super._call(e));
  }
}, R3 = class extends Wn {
  async _call(e) {
    return new ot(await super._call(e));
  }
}, zu = class extends I {
}, G3 = class extends zu {
}, V3 = class extends zu {
  async _call(e) {
    return new ey(await super._call(e));
  }
}, ey = class extends Ge {
  constructor({ logits: e, pred_boxes: t }) {
    super(), this.logits = e, this.pred_boxes = t;
  }
}, Nu = class extends I {
}, U3 = class extends Nu {
}, q3 = class extends Nu {
}, Bu = class extends I {
}, j3 = class extends Bu {
}, W3 = class extends Bu {
}, H3 = /* @__PURE__ */ new Map([["bert", "BertModel"], ["eurobert", "EuroBertModel"], ["neobert", "NeoBertModel"], ["modernbert", "ModernBertModel"], ["nomic_bert", "NomicBertModel"], ["roformer", "RoFormerModel"], ["electra", "ElectraModel"], ["esm", "EsmModel"], ["convbert", "ConvBertModel"], ["camembert", "CamembertModel"], ["deberta", "DebertaModel"], ["deberta-v2", "DebertaV2Model"], ["mpnet", "MPNetModel"], ["albert", "AlbertModel"], ["distilbert", "DistilBertModel"], ["roberta", "RobertaModel"], ["xlm", "XLMModel"], ["xlm-roberta", "XLMRobertaModel"], ["clap", "ClapModel"], ["clip", "CLIPModel"], ["clipseg", "CLIPSegModel"], ["chinese_clip", "ChineseCLIPModel"], ["siglip", "SiglipModel"], ["jina_clip", "JinaCLIPModel"], ["mobilebert", "MobileBertModel"], ["squeezebert", "SqueezeBertModel"], ["wav2vec2", "Wav2Vec2Model"], ["wav2vec2-bert", "Wav2Vec2BertModel"], ["unispeech", "UniSpeechModel"], ["unispeech-sat", "UniSpeechSatModel"], ["hubert", "HubertModel"], ["wavlm", "WavLMModel"], ["audio-spectrogram-transformer", "ASTModel"], ["vits", "VitsModel"], ["pyannote", "PyAnnoteModel"], ["wespeaker-resnet", "WeSpeakerResNetModel"], ["detr", "DetrModel"], ["rt_detr", "RTDetrModel"], ["rt_detr_v2", "RTDetrV2Model"], ["rf_detr", "RFDetrModel"], ["d_fine", "DFineModel"], ["table-transformer", "TableTransformerModel"], ["vit", "ViTModel"], ["ijepa", "IJepaModel"], ["pvt", "PvtModel"], ["vit_msn", "ViTMSNModel"], ["vit_mae", "ViTMAEModel"], ["groupvit", "GroupViTModel"], ["fastvit", "FastViTModel"], ["mobilevit", "MobileViTModel"], ["mobilevitv2", "MobileViTV2Model"], ["owlvit", "OwlViTModel"], ["owlv2", "Owlv2Model"], ["beit", "BeitModel"], ["deit", "DeiTModel"], ["hiera", "HieraModel"], ["convnext", "ConvNextModel"], ["convnextv2", "ConvNextV2Model"], ["dinov2", "Dinov2Model"], ["dinov2_with_registers", "Dinov2WithRegistersModel"], ["dinov3_vit", "DINOv3ViTModel"], ["dinov3_convnext", "DINOv3ConvNextModel"], ["resnet", "ResNetModel"], ["swin", "SwinModel"], ["swin2sr", "Swin2SRModel"], ["donut-swin", "DonutSwinModel"], ["yolos", "YolosModel"], ["dpt", "DPTModel"], ["glpn", "GLPNModel"], ["hifigan", "SpeechT5HifiGan"], ["efficientnet", "EfficientNetModel"], ["decision_transformer", "DecisionTransformerModel"], ["patchtst", "PatchTSTModel"], ["patchtsmixer", "PatchTSMixerModel"], ["mobilenet_v1", "MobileNetV1Model"], ["mobilenet_v2", "MobileNetV2Model"], ["mobilenet_v3", "MobileNetV3Model"], ["mobilenet_v4", "MobileNetV4Model"], ["maskformer", "MaskFormerModel"], ["mgp-str", "MgpstrForSceneTextRecognition"], ["style_text_to_speech_2", "StyleTextToSpeech2Model"], ["openai_privacy_filter", "OpenAIPrivacyFilterModel"]]), Q3 = /* @__PURE__ */ new Map([["t5", "T5Model"], ["longt5", "LongT5Model"], ["mt5", "MT5Model"], ["bart", "BartModel"], ["mbart", "MBartModel"], ["marian", "MarianModel"], ["whisper", "WhisperModel"], ["cohere_asr", "CohereAsrModel"], ["m2m_100", "M2M100Model"], ["blenderbot", "BlenderbotModel"], ["blenderbot-small", "BlenderbotSmallModel"]]), X3 = /* @__PURE__ */ new Map([["mimi", "MimiModel"], ["dac", "DacModel"], ["snac", "SnacModel"]]), Y3 = /* @__PURE__ */ new Map([["bloom", "BloomModel"], ["jais", "JAISModel"], ["gpt2", "GPT2Model"], ["gpt_oss", "GptOssModel"], ["gptj", "GPTJModel"], ["gpt_bigcode", "GPTBigCodeModel"], ["gpt_neo", "GPTNeoModel"], ["gpt_neox", "GPTNeoXModel"], ["codegen", "CodeGenModel"], ["llama", "LlamaModel"], ["apertus", "ApertusModel"], ["nanochat", "NanoChatModel"], ["arcee", "ArceeModel"], ["afmoe", "AfmoeModel"], ["lfm2", "Lfm2Model"], ["lfm2_moe", "Lfm2MoeModel"], ["smollm3", "SmolLM3Model"], ["exaone", "ExaoneModel"], ["olmo", "OlmoModel"], ["olmo2", "Olmo2Model"], ["olmo3", "Olmo3Model"], ["olmo_hybrid", "OlmoHybridModel"], ["mobilellm", "MobileLLMModel"], ["granite", "GraniteModel"], ["granitemoehybrid", "GraniteMoeHybridModel"], ["cohere", "CohereModel"], ["cohere2", "Cohere2Model"], ["gemma", "GemmaModel"], ["gemma2", "Gemma2Model"], ["vaultgemma", "VaultGemmaModel"], ["gemma3_text", "Gemma3Model"], ["helium", "HeliumModel"], ["glm", "GlmModel"], ["glm_moe_dsa", "GlmMoeDsaModel"], ["openelm", "OpenELMModel"], ["qwen2", "Qwen2Model"], ["qwen2_moe", "Qwen2MoeModel"], ["qwen3", "Qwen3Model"], ["qwen3_moe", "Qwen3MoeModel"], ["qwen3_next", "Qwen3NextModel"], ["phi", "PhiModel"], ["phi3", "Phi3Model"], ["mpt", "MptModel"], ["opt", "OPTModel"], ["mistral", "MistralModel"], ["mistral4", "Mistral4Model"], ["ministral", "MinistralModel"], ["ministral3", "Ministral3Model"], ["ernie4_5", "Ernie4_5ForCausalLM"], ["starcoder2", "Starcoder2Model"], ["deepseek_v3", "DeepseekV3Model"], ["deepseek_v4", "DeepseekV4Model"], ["falcon", "FalconModel"], ["falcon_h1", "FalconH1Model"], ["nemotron_h", "NemotronHModel"], ["solar_open", "SolarOpenModel"], ["stablelm", "StableLmModel"], ["modernbert-decoder", "ModernBertDecoderModel"], ["hunyuan_v1_dense", "HunYuanDenseV1Model"], ["youtu", "YoutuModel"], ["zaya", "ZayaModel"], ["hrm_text", "HrmTextModel"]]), ty = /* @__PURE__ */ new Map([["speecht5", "SpeechT5ForSpeechToText"], ["whisper", "WhisperForConditionalGeneration"], ["lite-whisper", "LiteWhisperForConditionalGeneration"], ["moonshine", "MoonshineForConditionalGeneration"], ["cohere_asr", "CohereAsrForConditionalGeneration"]]), ry = /* @__PURE__ */ new Map([["speecht5", "SpeechT5ForTextToSpeech"]]), ny = /* @__PURE__ */ new Map([["vits", "VitsModel"], ["musicgen", "MusicgenForConditionalGeneration"], ["supertonic", "SupertonicForConditionalGeneration"]]), ay = /* @__PURE__ */ new Map([["bert", "BertForSequenceClassification"], ["eurobert", "EuroBertForSequenceClassification"], ["neobert", "NeoBertForSequenceClassification"], ["modernbert", "ModernBertForSequenceClassification"], ["roformer", "RoFormerForSequenceClassification"], ["electra", "ElectraForSequenceClassification"], ["esm", "EsmForSequenceClassification"], ["convbert", "ConvBertForSequenceClassification"], ["camembert", "CamembertForSequenceClassification"], ["deberta", "DebertaForSequenceClassification"], ["deberta-v2", "DebertaV2ForSequenceClassification"], ["mpnet", "MPNetForSequenceClassification"], ["albert", "AlbertForSequenceClassification"], ["distilbert", "DistilBertForSequenceClassification"], ["roberta", "RobertaForSequenceClassification"], ["xlm", "XLMForSequenceClassification"], ["xlm-roberta", "XLMRobertaForSequenceClassification"], ["bart", "BartForSequenceClassification"], ["mbart", "MBartForSequenceClassification"], ["mobilebert", "MobileBertForSequenceClassification"], ["squeezebert", "SqueezeBertForSequenceClassification"]]), sy = /* @__PURE__ */ new Map([["bert", "BertForTokenClassification"], ["eurobert", "EuroBertForTokenClassification"], ["neobert", "NeoBertForTokenClassification"], ["modernbert", "ModernBertForTokenClassification"], ["roformer", "RoFormerForTokenClassification"], ["electra", "ElectraForTokenClassification"], ["esm", "EsmForTokenClassification"], ["convbert", "ConvBertForTokenClassification"], ["camembert", "CamembertForTokenClassification"], ["deberta", "DebertaForTokenClassification"], ["deberta-v2", "DebertaV2ForTokenClassification"], ["mpnet", "MPNetForTokenClassification"], ["distilbert", "DistilBertForTokenClassification"], ["roberta", "RobertaForTokenClassification"], ["xlm", "XLMForTokenClassification"], ["xlm-roberta", "XLMRobertaForTokenClassification"], ["openai_privacy_filter", "OpenAIPrivacyFilterForTokenClassification"]]), iy = /* @__PURE__ */ new Map([["t5", "T5ForConditionalGeneration"], ["longt5", "LongT5ForConditionalGeneration"], ["mt5", "MT5ForConditionalGeneration"], ["bart", "BartForConditionalGeneration"], ["mbart", "MBartForConditionalGeneration"], ["marian", "MarianMTModel"], ["m2m_100", "M2M100ForConditionalGeneration"], ["blenderbot", "BlenderbotForConditionalGeneration"], ["blenderbot-small", "BlenderbotSmallForConditionalGeneration"]]), oy = /* @__PURE__ */ new Map([["bloom", "BloomForCausalLM"], ["gpt2", "GPT2LMHeadModel"], ["gpt_oss", "GptOssForCausalLM"], ["jais", "JAISLMHeadModel"], ["gptj", "GPTJForCausalLM"], ["gpt_bigcode", "GPTBigCodeForCausalLM"], ["gpt_neo", "GPTNeoForCausalLM"], ["gpt_neox", "GPTNeoXForCausalLM"], ["codegen", "CodeGenForCausalLM"], ["llama", "LlamaForCausalLM"], ["nanochat", "NanoChatForCausalLM"], ["apertus", "ApertusForCausalLM"], ["llama4_text", "Llama4ForCausalLM"], ["arcee", "ArceeForCausalLM"], ["afmoe", "AfmoeForCausalLM"], ["lfm2", "Lfm2ForCausalLM"], ["lfm2_moe", "Lfm2MoeForCausalLM"], ["smollm3", "SmolLM3ForCausalLM"], ["exaone", "ExaoneForCausalLM"], ["olmo", "OlmoForCausalLM"], ["olmo2", "Olmo2ForCausalLM"], ["olmo3", "Olmo3ForCausalLM"], ["olmo_hybrid", "OlmoHybridForCausalLM"], ["mobilellm", "MobileLLMForCausalLM"], ["granite", "GraniteForCausalLM"], ["granitemoehybrid", "GraniteMoeHybridForCausalLM"], ["cohere", "CohereForCausalLM"], ["cohere2", "Cohere2ForCausalLM"], ["gemma", "GemmaForCausalLM"], ["gemma2", "Gemma2ForCausalLM"], ["vaultgemma", "VaultGemmaForCausalLM"], ["gemma3_text", "Gemma3ForCausalLM"], ["gemma3", "Gemma3ForCausalLM"], ["helium", "HeliumForCausalLM"], ["glm", "GlmForCausalLM"], ["glm_moe_dsa", "GlmMoeDsaForCausalLM"], ["openelm", "OpenELMForCausalLM"], ["qwen2", "Qwen2ForCausalLM"], ["qwen2_moe", "Qwen2MoeForCausalLM"], ["qwen3", "Qwen3ForCausalLM"], ["qwen3_moe", "Qwen3MoeForCausalLM"], ["qwen3_next", "Qwen3NextForCausalLM"], ["qwen2_vl", "Qwen2VLForCausalLM"], ["qwen2_5_vl", "Qwen2_5_VLForCausalLM"], ["qwen3_vl", "Qwen3VLForCausalLM"], ["qwen3_vl_moe", "Qwen3VLMoeForCausalLM"], ["qwen3_5", "Qwen3_5ForCausalLM"], ["qwen3_5_text", "Qwen3_5ForCausalLM"], ["qwen3_5_moe", "Qwen3_5MoeForCausalLM"], ["gemma3n", "Gemma3nForCausalLM"], ["gemma4", "Gemma4ForCausalLM"], ["phi", "PhiForCausalLM"], ["phi3", "Phi3ForCausalLM"], ["mpt", "MptForCausalLM"], ["opt", "OPTForCausalLM"], ["mbart", "MBartForCausalLM"], ["mistral", "MistralForCausalLM"], ["mistral4", "Mistral4ForCausalLM"], ["ministral", "MinistralForCausalLM"], ["ministral3", "Ministral3ForCausalLM"], ["ernie4_5", "Ernie4_5ForCausalLM"], ["starcoder2", "Starcoder2ForCausalLM"], ["deepseek_v3", "DeepseekV3ForCausalLM"], ["deepseek_v4", "DeepseekV4ForCausalLM"], ["falcon", "FalconForCausalLM"], ["falcon_h1", "FalconH1ForCausalLM"], ["nemotron_h", "NemotronHForCausalLM"], ["trocr", "TrOCRForCausalLM"], ["solar_open", "SolarOpenForCausalLM"], ["stablelm", "StableLmForCausalLM"], ["modernbert-decoder", "ModernBertDecoderForCausalLM"], ["hunyuan_v1_dense", "HunYuanDenseV1ForCausalLM"], ["youtu", "YoutuForCausalLM"], ["zaya", "ZayaForCausalLM"], ["hrm_text", "HrmTextForCausalLM"], ["phi3_v", "Phi3VForCausalLM"]]), J3 = /* @__PURE__ */ new Map([["multi_modality", "MultiModalityCausalLM"]]), ly = /* @__PURE__ */ new Map([["bert", "BertForMaskedLM"], ["eurobert", "EuroBertForMaskedLM"], ["neobert", "NeoBertForMaskedLM"], ["modernbert", "ModernBertForMaskedLM"], ["roformer", "RoFormerForMaskedLM"], ["electra", "ElectraForMaskedLM"], ["esm", "EsmForMaskedLM"], ["convbert", "ConvBertForMaskedLM"], ["camembert", "CamembertForMaskedLM"], ["deberta", "DebertaForMaskedLM"], ["deberta-v2", "DebertaV2ForMaskedLM"], ["mpnet", "MPNetForMaskedLM"], ["albert", "AlbertForMaskedLM"], ["distilbert", "DistilBertForMaskedLM"], ["roberta", "RobertaForMaskedLM"], ["xlm", "XLMWithLMHeadModel"], ["xlm-roberta", "XLMRobertaForMaskedLM"], ["mobilebert", "MobileBertForMaskedLM"], ["squeezebert", "SqueezeBertForMaskedLM"]]), cy = /* @__PURE__ */ new Map([["bert", "BertForQuestionAnswering"], ["neobert", "NeoBertForQuestionAnswering"], ["roformer", "RoFormerForQuestionAnswering"], ["electra", "ElectraForQuestionAnswering"], ["convbert", "ConvBertForQuestionAnswering"], ["camembert", "CamembertForQuestionAnswering"], ["deberta", "DebertaForQuestionAnswering"], ["deberta-v2", "DebertaV2ForQuestionAnswering"], ["mpnet", "MPNetForQuestionAnswering"], ["albert", "AlbertForQuestionAnswering"], ["distilbert", "DistilBertForQuestionAnswering"], ["roberta", "RobertaForQuestionAnswering"], ["xlm", "XLMForQuestionAnswering"], ["xlm-roberta", "XLMRobertaForQuestionAnswering"], ["mobilebert", "MobileBertForQuestionAnswering"], ["squeezebert", "SqueezeBertForQuestionAnswering"]]), uy = /* @__PURE__ */ new Map([["vision-encoder-decoder", "VisionEncoderDecoderModel"], ["idefics3", "Idefics3ForConditionalGeneration"], ["smolvlm", "SmolVLMForConditionalGeneration"]]), dy = /* @__PURE__ */ new Map([["llava", "LlavaForConditionalGeneration"], ["llava_onevision", "LlavaOnevisionForConditionalGeneration"], ["moondream1", "Moondream1ForConditionalGeneration"], ["florence2", "Florence2ForConditionalGeneration"], ["qwen2_vl", "Qwen2VLForConditionalGeneration"], ["qwen2_5_vl", "Qwen2_5_VLForConditionalGeneration"], ["qwen3_vl", "Qwen3VLForConditionalGeneration"], ["qwen3_vl_moe", "Qwen3VLMoeForConditionalGeneration"], ["qwen3_5", "Qwen3_5ForConditionalGeneration"], ["qwen3_5_moe", "Qwen3_5MoeForConditionalGeneration"], ["lfm2_vl", "Lfm2VlForConditionalGeneration"], ["idefics3", "Idefics3ForConditionalGeneration"], ["smolvlm", "SmolVLMForConditionalGeneration"], ["paligemma", "PaliGemmaForConditionalGeneration"], ["llava_qwen2", "LlavaQwen2ForCausalLM"], ["gemma3", "Gemma3ForConditionalGeneration"], ["gemma3n", "Gemma3nForConditionalGeneration"], ["gemma4", "Gemma4ForConditionalGeneration"], ["mistral3", "Mistral3ForConditionalGeneration"], ["lighton_ocr", "LightOnOcrForConditionalGeneration"], ["glm_ocr", "GlmOcrForConditionalGeneration"]]), py = /* @__PURE__ */ new Map([["granite_speech", "GraniteSpeechForConditionalGeneration"], ["ultravox", "UltravoxModel"], ["voxtral", "VoxtralForConditionalGeneration"], ["voxtral_realtime", "VoxtralRealtimeForConditionalGeneration"]]), Z3 = /* @__PURE__ */ new Map([["vision-encoder-decoder", "VisionEncoderDecoderModel"]]), hy = /* @__PURE__ */ new Map([["vit", "ViTForImageClassification"], ["ijepa", "IJepaForImageClassification"], ["pvt", "PvtForImageClassification"], ["vit_msn", "ViTMSNForImageClassification"], ["fastvit", "FastViTForImageClassification"], ["mobilevit", "MobileViTForImageClassification"], ["mobilevitv2", "MobileViTV2ForImageClassification"], ["beit", "BeitForImageClassification"], ["deit", "DeiTForImageClassification"], ["hiera", "HieraForImageClassification"], ["convnext", "ConvNextForImageClassification"], ["convnextv2", "ConvNextV2ForImageClassification"], ["dinov2", "Dinov2ForImageClassification"], ["dinov2_with_registers", "Dinov2WithRegistersForImageClassification"], ["resnet", "ResNetForImageClassification"], ["swin", "SwinForImageClassification"], ["segformer", "SegformerForImageClassification"], ["efficientnet", "EfficientNetForImageClassification"], ["mobilenet_v1", "MobileNetV1ForImageClassification"], ["mobilenet_v2", "MobileNetV2ForImageClassification"], ["mobilenet_v3", "MobileNetV3ForImageClassification"], ["mobilenet_v4", "MobileNetV4ForImageClassification"]]), _y = /* @__PURE__ */ new Map([["detr", "DetrForObjectDetection"], ["rt_detr", "RTDetrForObjectDetection"], ["rt_detr_v2", "RTDetrV2ForObjectDetection"], ["rf_detr", "RFDetrForObjectDetection"], ["d_fine", "DFineForObjectDetection"], ["table-transformer", "TableTransformerForObjectDetection"], ["yolos", "YolosForObjectDetection"]]), fy = /* @__PURE__ */ new Map([["owlvit", "OwlViTForObjectDetection"], ["owlv2", "Owlv2ForObjectDetection"], ["grounding-dino", "GroundingDinoForObjectDetection"]]), Mn = /* @__PURE__ */ new Map([["detr", "DetrForSegmentation"], ["clipseg", "CLIPSegForImageSegmentation"]]), my = /* @__PURE__ */ new Map([["segformer", "SegformerForSemanticSegmentation"], ["sapiens", "SapiensForSemanticSegmentation"], ["swin", "SwinForSemanticSegmentation"], ["mobilenet_v1", "MobileNetV1ForSemanticSegmentation"], ["mobilenet_v2", "MobileNetV2ForSemanticSegmentation"], ["mobilenet_v3", "MobileNetV3ForSemanticSegmentation"], ["mobilenet_v4", "MobileNetV4ForSemanticSegmentation"]]), gy = /* @__PURE__ */ new Map([["detr", "DetrForSegmentation"], ["maskformer", "MaskFormerForInstanceSegmentation"]]), wy = /* @__PURE__ */ new Map([["sam", "SamModel"], ["sam2", "Sam2Model"], ["edgetam", "EdgeTamModel"], ["sam3_tracker", "Sam3TrackerModel"]]), yy = /* @__PURE__ */ new Map([["wav2vec2", "Wav2Vec2ForCTC"], ["wav2vec2-bert", "Wav2Vec2BertForCTC"], ["unispeech", "UniSpeechForCTC"], ["unispeech-sat", "UniSpeechSatForCTC"], ["wavlm", "WavLMForCTC"], ["hubert", "HubertForCTC"], ["parakeet_ctc", "ParakeetForCTC"]]), by = /* @__PURE__ */ new Map([["wav2vec2", "Wav2Vec2ForSequenceClassification"], ["wav2vec2-bert", "Wav2Vec2BertForSequenceClassification"], ["unispeech", "UniSpeechForSequenceClassification"], ["unispeech-sat", "UniSpeechSatForSequenceClassification"], ["wavlm", "WavLMForSequenceClassification"], ["hubert", "HubertForSequenceClassification"], ["audio-spectrogram-transformer", "ASTForAudioClassification"]]), vy = /* @__PURE__ */ new Map([["wavlm", "WavLMForXVector"]]), xy = /* @__PURE__ */ new Map([["unispeech-sat", "UniSpeechSatForAudioFrameClassification"], ["wavlm", "WavLMForAudioFrameClassification"], ["wav2vec2", "Wav2Vec2ForAudioFrameClassification"], ["pyannote", "PyAnnoteForAudioFrameClassification"]]), My = /* @__PURE__ */ new Map([["vitmatte", "VitMatteForImageMatting"]]), K3 = /* @__PURE__ */ new Map([["patchtst", "PatchTSTForPrediction"], ["patchtsmixer", "PatchTSMixerForPrediction"]]), ky = /* @__PURE__ */ new Map([["swin2sr", "Swin2SRForImageSuperResolution"]]), Ty = /* @__PURE__ */ new Map([["chmv2", "CHMv2ForDepthEstimation"], ["dpt", "DPTForDepthEstimation"], ["depth_anything", "DepthAnythingForDepthEstimation"], ["glpn", "GLPNForDepthEstimation"], ["sapiens", "SapiensForDepthEstimation"], ["depth_pro", "DepthProForDepthEstimation"], ["metric3d", "Metric3DForDepthEstimation"], ["metric3dv2", "Metric3Dv2ForDepthEstimation"]]), Ey = /* @__PURE__ */ new Map([["sapiens", "SapiensForNormalEstimation"]]), Ay = /* @__PURE__ */ new Map([["vitpose", "VitPoseForPoseEstimation"]]), Cy = /* @__PURE__ */ new Map([["clip", "CLIPVisionModelWithProjection"], ["siglip", "SiglipVisionModel"], ["jina_clip", "JinaCLIPVisionModel"]]), Sy = [[H3, W.EncoderOnly], [Q3, W.EncoderDecoder], [Y3, W.DecoderOnlyWithoutHead], [X3, W.AutoEncoder], [ay, W.EncoderOnly], [sy, W.EncoderOnly], [iy, W.Seq2Seq], [ty, W.Seq2Seq], [oy, W.DecoderOnly], [J3, W.MultiModality], [ly, W.EncoderOnly], [cy, W.EncoderOnly], [uy, W.Vision2Seq], [dy, W.ImageTextToText], [py, W.AudioTextToText], [hy, W.EncoderOnly], [Mn, W.EncoderOnly], [gy, W.EncoderOnly], [my, W.EncoderOnly], [My, W.EncoderOnly], [K3, W.EncoderOnly], [ky, W.EncoderOnly], [Ty, W.EncoderOnly], [Ey, W.EncoderOnly], [Ay, W.EncoderOnly], [_y, W.EncoderOnly], [fy, W.EncoderOnly], [wy, W.MaskGeneration], [yy, W.EncoderOnly], [by, W.EncoderOnly], [ry, W.Seq2Seq], [ny, W.EncoderOnly], [vy, W.EncoderOnly], [xy, W.EncoderOnly], [Cy, W.EncoderOnly]];
for (let [e, t] of Sy) for (let r of e.values()) {
  pr.set(r, t);
  let n = Pl[r];
  An.set(n, r), Al.set(r, n);
}
var eN = [["MusicgenForConditionalGeneration", Mw, W.Musicgen], ["Phi3VForCausalLM", Aw, W.Phi3V], ["CLIPTextModelWithProjection", Vg, W.EncoderOnly], ["SiglipTextModel", Nw, W.EncoderOnly], ["JinaCLIPTextModel", pw, W.EncoderOnly], ["ClapTextModelWithProjection", Rg, W.EncoderOnly], ["ClapAudioModelWithProjection", Gg, W.EncoderOnly], ["DacEncoderModel", jg, W.EncoderOnly], ["DacDecoderModel", Wg, W.EncoderOnly], ["MimiEncoderModel", bw, W.EncoderOnly], ["MimiDecoderModel", vw, W.EncoderOnly], ["SnacEncoderModel", Bw, W.EncoderOnly], ["SnacDecoderModel", $w, W.EncoderOnly], ["Gemma3nForConditionalGeneration", Vs, W.ImageAudioTextToText], ["Gemma4ForConditionalGeneration", cc, W.ImageAudioTextToText], ["SupertonicForConditionalGeneration", Gw, W.Supertonic], ["ChatterboxModel", Bg, W.Chatterbox], ["VoxtralRealtimeForConditionalGeneration", Yw, W.VoxtralRealtime]];
for (let [e, t, r] of eN) pr.set(e, r), An.set(t, e), Al.set(e, t);
var Py = /* @__PURE__ */ new Map([["modnet", Mn], ["birefnet", Mn], ["isnet", Mn], ["ben", Mn]]);
for (let [e, t] of Py.entries()) t.set(e, "PreTrainedModel"), pr.set(e, W.EncoderOnly), Al.set(e, I);
var tN = new Set(Py.keys());
pr.set("PreTrainedModel", W.EncoderOnly);
An.set(I, "PreTrainedModel");
var Se = { MODEL_FOR_SEQUENCE_CLASSIFICATION_MAPPING_NAMES: ay, MODEL_FOR_TOKEN_CLASSIFICATION_MAPPING_NAMES: sy, MODEL_FOR_TEXT_TO_SPECTROGRAM_MAPPING_NAMES: ry, MODEL_FOR_TEXT_TO_WAVEFORM_MAPPING_NAMES: ny, MODEL_FOR_MASKED_LM_MAPPING_NAMES: ly, MODEL_FOR_QUESTION_ANSWERING_MAPPING_NAMES: cy, MODEL_FOR_IMAGE_CLASSIFICATION_MAPPING_NAMES: hy, MODEL_FOR_IMAGE_SEGMENTATION_MAPPING_NAMES: Mn, MODEL_FOR_SEMANTIC_SEGMENTATION_MAPPING_NAMES: my, MODEL_FOR_UNIVERSAL_SEGMENTATION_MAPPING_NAMES: gy, MODEL_FOR_OBJECT_DETECTION_MAPPING_NAMES: _y, MODEL_FOR_ZERO_SHOT_OBJECT_DETECTION_MAPPING_NAMES: fy, MODEL_FOR_MASK_GENERATION_MAPPING_NAMES: wy, MODEL_FOR_CTC_MAPPING_NAMES: yy, MODEL_FOR_AUDIO_CLASSIFICATION_MAPPING_NAMES: by, MODEL_FOR_AUDIO_XVECTOR_MAPPING_NAMES: vy, MODEL_FOR_AUDIO_FRAME_CLASSIFICATION_MAPPING_NAMES: xy, MODEL_FOR_DOCUMENT_QUESTION_ANSWERING_MAPPING_NAMES: Z3, MODEL_FOR_IMAGE_MATTING_MAPPING_NAMES: My, MODEL_FOR_IMAGE_TO_IMAGE_MAPPING_NAMES: ky, MODEL_FOR_DEPTH_ESTIMATION_MAPPING_NAMES: Ty, MODEL_FOR_NORMAL_ESTIMATION_MAPPING_NAMES: Ey, MODEL_FOR_POSE_ESTIMATION_MAPPING_NAMES: Ay, MODEL_FOR_IMAGE_FEATURE_EXTRACTION_MAPPING_NAMES: Cy, MODEL_FOR_IMAGE_TEXT_TO_TEXT_MAPPING_NAMES: dy, MODEL_FOR_AUDIO_TEXT_TO_TEXT_MAPPING_NAMES: py, MODEL_FOR_SEQ_TO_SEQ_CAUSAL_LM_MAPPING_NAMES: iy, MODEL_FOR_SPEECH_SEQ_2_SEQ_MAPPING_NAMES: ty, MODEL_FOR_CAUSAL_LM_MAPPING_NAMES: oy, MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES: uy };
WC(Se);
var Pe = class {
  static MODEL_CLASS_MAPPINGS = null;
  static BASE_IF_FAIL = !1;
  static supports(e) {
    if (!this.MODEL_CLASS_MAPPINGS) return !1;
    for (let t of this.MODEL_CLASS_MAPPINGS) if (t.has(e)) return !0;
    return this.BASE_IF_FAIL;
  }
  static async from_pretrained(e, { progress_callback: t = null, config: r = null, cache_dir: n = null, local_files_only: a = !1, revision: s = "main", model_file_name: i = null, subfolder: o = "onnx", device: l = null, dtype: c = null, use_external_data_format: p = null, session_options: d = {} } = {}) {
    let _ = { progress_callback: t, config: r, cache_dir: n, local_files_only: a, revision: s, model_file_name: i, subfolder: o, device: l, dtype: c, use_external_data_format: p, session_options: d };
    if (_.config = await _a.from_pretrained(e, _), !this.MODEL_CLASS_MAPPINGS) throw new Error("`MODEL_CLASS_MAPPINGS` not implemented for this type of `AutoClass`: " + this.name);
    let { model_type: f } = _.config;
    for (let w of this.MODEL_CLASS_MAPPINGS) {
      let y = w.get(f);
      if (!y) {
        for (let b of w.values()) if (b[0] === f) {
          y = b;
          break;
        }
        if (!y) continue;
      }
      return await Pl[y].from_pretrained(e, _);
    }
    if (this.BASE_IF_FAIL) return tN.has(f) || ce.warn(`Unknown model class "${f}", attempting to construct from base class.`), await I.from_pretrained(e, _);
    throw Error(`Unsupported model type: ${f}`);
  }
}, oa = class extends Pe {
  static MODEL_CLASS_MAPPINGS = Sy.map((e) => e[0]);
  static BASE_IF_FAIL = !0;
}, Nf = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_SEQUENCE_CLASSIFICATION_MAPPING_NAMES];
}, rN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_TOKEN_CLASSIFICATION_MAPPING_NAMES];
}, No = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_SEQ_TO_SEQ_CAUSAL_LM_MAPPING_NAMES];
}, nN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_SPEECH_SEQ_2_SEQ_MAPPING_NAMES];
}, aN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_TEXT_TO_SPECTROGRAM_MAPPING_NAMES];
}, sN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_TEXT_TO_WAVEFORM_MAPPING_NAMES];
}, iN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_CAUSAL_LM_MAPPING_NAMES];
}, oN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_MASKED_LM_MAPPING_NAMES];
}, lN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_QUESTION_ANSWERING_MAPPING_NAMES];
}, cN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES];
}, uN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_IMAGE_CLASSIFICATION_MAPPING_NAMES];
}, Bf = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_IMAGE_SEGMENTATION_MAPPING_NAMES];
}, $f = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_SEMANTIC_SEGMENTATION_MAPPING_NAMES];
}, Df = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_UNIVERSAL_SEGMENTATION_MAPPING_NAMES];
}, dN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_OBJECT_DETECTION_MAPPING_NAMES];
}, pN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_ZERO_SHOT_OBJECT_DETECTION_MAPPING_NAMES];
}, _$ = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_MASK_GENERATION_MAPPING_NAMES];
}, hN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_CTC_MAPPING_NAMES];
}, _N = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_AUDIO_CLASSIFICATION_MAPPING_NAMES];
}, f$ = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_AUDIO_XVECTOR_MAPPING_NAMES];
}, m$ = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_AUDIO_FRAME_CLASSIFICATION_MAPPING_NAMES];
}, fN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_DOCUMENT_QUESTION_ANSWERING_MAPPING_NAMES];
}, g$ = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_IMAGE_MATTING_MAPPING_NAMES];
}, mN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_IMAGE_TO_IMAGE_MAPPING_NAMES];
}, gN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_DEPTH_ESTIMATION_MAPPING_NAMES];
}, w$ = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_NORMAL_ESTIMATION_MAPPING_NAMES];
}, y$ = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_POSE_ESTIMATION_MAPPING_NAMES];
}, wN = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_IMAGE_FEATURE_EXTRACTION_MAPPING_NAMES];
}, b$ = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_IMAGE_TEXT_TO_TEXT_MAPPING_NAMES];
}, v$ = class extends Pe {
  static MODEL_CLASS_MAPPINGS = [Se.MODEL_FOR_AUDIO_TEXT_TO_TEXT_MAPPING_NAMES];
};
async function Wt(e) {
  return Array.isArray(e) || (e = [e]), await Promise.all(e.map((t) => kt.read(t)));
}
async function kn(e, t) {
  return Array.isArray(e) || (e = [e]), await Promise.all(e.map((r) => typeof r == "string" || r instanceof URL ? s2(r, t) : r instanceof Float64Array ? new Float32Array(r) : r));
}
function Jo(e, t) {
  t && (e = e.map((i) => i | 0));
  let [r, n, a, s] = e;
  return { xmin: r, ymin: n, xmax: a, ymax: s };
}
var qe = class extends gt {
  constructor({ task: e, model: t, tokenizer: r = null, processor: n = null }) {
    super(), this.task = e, this.model = t, this.tokenizer = r, this.processor = n;
  }
  async dispose() {
    await this.model.dispose();
  }
}, yN = class extends qe {
  async _call(e, { top_k: t = 1 } = {}) {
    let r = this.tokenizer(e, { padding: !0, truncation: !0 }), n = await this.model(r), { problem_type: a, id2label: s } = this.model.config, i = a === "multi_label_classification" ? (l) => l.sigmoid() : (l) => new V("float32", st(l.data), l.dims), o = [];
    for (let l of n.logits) {
      let c = i(l), p = await In(c, t), d = p[0].tolist(), _ = p[1].tolist().map((f, w) => ({ label: s ? s[f] : `LABEL_${f}`, score: d[w] }));
      t === 1 ? o.push(..._) : o.push(_);
    }
    return Array.isArray(e) || t === 1 ? o : o[0];
  }
}, bN = class extends qe {
  async _call(e, { ignore_labels: t = ["O"], aggregation_strategy: r = "none" } = {}) {
    if (r !== "none" && r !== "simple") throw new Error(`Invalid aggregation_strategy: "${r}". Must be one of "none" or "simple".`);
    let n = Array.isArray(e), a = this.tokenizer(n ? e : [e], { padding: !0, truncation: !0 }), s = (await this.model(a)).logits, i = this.model.config.id2label, o = [];
    for (let l = 0; l < s.dims[0]; ++l) {
      let c = a.input_ids[l].tolist(), p = s[l], d = [];
      for (let _ = 0; _ < p.dims[0]; ++_) {
        let f = p[_], w = We(f.data)[1], y = i ? i[w] : `LABEL_${w}`;
        if (t.includes(y)) continue;
        let b = this.tokenizer.decode([c[_]], { skip_special_tokens: !0 });
        if (b === "") continue;
        let x = st(f.data);
        d.push({ entity: y, score: x[w], index: _, word: b });
      }
      o.push(r === "simple" ? xN(d, c, this.tokenizer) : d);
    }
    return n ? o : o[0];
  }
};
function vN(e) {
  let t = e[0];
  return e[1] === "-" && (t === "B" || t === "I" || t === "E" || t === "S") ? [t, e.slice(2)] : ["I", e];
}
function xN(e, t, r) {
  let n = [], a = null;
  for (let s = 0; s < e.length; ++s) {
    let [i, o] = vN(e[s].entity);
    a === o && i !== "B" && i !== "S" ? (n[n.length - 1].end = s + 1, i === "E" && (a = null)) : (n.push({ tag: o, start: s, end: s + 1 }), a = i === "S" ? null : o);
  }
  return n.map(({ tag: s, start: i, end: o }) => {
    let l = 0, c = [];
    for (let p = i; p < o; ++p) l += e[p].score, c.push(t[e[p].index]);
    return { entity_group: s, score: l / (o - i), word: r.decode(c, { skip_special_tokens: !0 }) };
  });
}
var MN = class extends qe {
  async _call(e, t, { top_k: r = 1 } = {}) {
    let n = this.tokenizer(e, { text_pair: t, padding: !0, truncation: !0 }), a = Array.isArray(e), { start_logits: s, end_logits: i } = await this.model(n), o = n.input_ids.tolist(), l = n.attention_mask.tolist(), { all_special_ids: c, sep_token_id: p } = this.tokenizer, d = [];
    for (let _ = 0; _ < s.dims[0]; ++_) {
      let f = o[_], w = f.findIndex((S) => S == p), y = s[_].tolist(), b = i[_].tolist();
      for (let S = 1; S < y.length; ++S) (l[_] == 0 || S <= w || c.findIndex((O) => O == f[S]) !== -1) && (y[S] = -1 / 0, b[S] = -1 / 0);
      let x = st(y).map((S, O) => [S, O]), T = st(b).map((S, O) => [S, O]);
      x[0][0] = 0, T[0][0] = 0;
      let A = Rx(x, T).filter((S) => S[0][1] <= S[1][1]).map((S) => [S[0][1], S[1][1], S[0][0] * S[1][0]]).sort((S, O) => O[2] - S[2]), E = [];
      for (let S = 0; S < Math.min(A.length, r); ++S) {
        let [O, M, G] = A[S], D = f.slice(O, M + 1), U = this.tokenizer.decode(D, { skip_special_tokens: !0 });
        E.push({ answer: U, score: G });
      }
      r === 1 ? d.push(...E) : d.push(E);
    }
    return a ? d : d[0];
  }
}, kN = class extends qe {
  async _call(e, { top_k: t = 5 } = {}) {
    let { mask_token_id: r, mask_token: n } = this.tokenizer, a = this.tokenizer(e, { padding: !0, truncation: !0 }), { logits: s } = await this.model(a), i = [], o = a.input_ids.tolist();
    for (let l = 0; l < o.length; ++l) {
      let c = o[l], p = c.findIndex((y) => y == r);
      if (p === -1) throw Error(`Mask token (${n}) not found in text.`);
      let d = s[l][p], _ = await In(new V("float32", st(d.data), d.dims), t), f = _[0].tolist(), w = _[1].tolist();
      i.push(w.map((y, b) => {
        let x = c.slice();
        return x[p] = y, { score: f[b], token: Number(y), token_str: this.tokenizer.decode([y]), sequence: this.tokenizer.decode(x, { skip_special_tokens: !0 }) };
      }));
    }
    return Array.isArray(e) ? i : i[0];
  }
}, $u = class extends qe {
  _default_generation_config = { max_new_tokens: 256 };
  _key = "generated_text";
  async _call(e, t = {}) {
    Array.isArray(e) || (e = [e]), this.model.config.prefix && (e = e.map((o) => this.model.config.prefix + o));
    let r = this.model.config.task_specific_params;
    r && r[this.task] && r[this.task].prefix && (e = e.map((o) => r[this.task].prefix + o));
    let n = this.tokenizer, a = { padding: !0, truncation: !0 }, s;
    this.task === "translation" && "_build_translation_inputs" in n ? s = n._build_translation_inputs(e, a, t) : s = n(e, a);
    let i = await this.model.generate({ ...s, ...this._default_generation_config, ...t });
    return n.batch_decode(i, { skip_special_tokens: !0 }).map((o) => ({ [this._key]: o }));
  }
}, TN = class extends $u {
  _key = "summary_text";
}, EN = class extends $u {
  _key = "translation_text";
};
function Rf(e) {
  return Array.isArray(e) && e.every((t) => "role" in t && "content" in t);
}
var AN = class extends qe {
  _default_generation_config = { max_new_tokens: 256 };
  async _call(e, t = {}) {
    let { add_special_tokens: r, return_full_text: n, tools: a, documents: s, chat_template: i, tokenizer_encode_kwargs: o, ...l } = t, c = !1, p = !1, d = r ?? (this.tokenizer.add_bos_token || this.tokenizer.add_eos_token) ?? !1, _ = o, f;
    if (typeof e == "string") f = e = [e];
    else if (Array.isArray(e) && e.every((E) => typeof E == "string")) c = !0, f = e;
    else {
      if (Rf(e)) e = [e];
      else if (Array.isArray(e) && e.every(Rf)) c = !0;
      else throw new Error("Input must be a string, an array of strings, a Chat, or an array of Chats");
      p = !0;
      let E = { tokenize: !1, add_generation_prompt: !0, ...et({ tools: a, documents: s, chat_template: i }, ["tools", "documents", "chat_template"]), ..._ };
      f = e.map((S) => this.tokenizer.apply_chat_template(S, E)), d = !1, _ = void 0;
    }
    let w = p ? !1 : n ?? !0;
    this.tokenizer.padding_side = "left";
    let y = this.tokenizer(f, { add_special_tokens: d, padding: !0, truncation: !0, ..._ }), b = await this.model.generate({ ...y, ...this._default_generation_config, ...l }), x = this.tokenizer.batch_decode(b, { skip_special_tokens: !0 }), T;
    !w && y.input_ids.dims.at(-1) > 0 && (T = this.tokenizer.batch_decode(y.input_ids, { skip_special_tokens: !0 }).map((E) => E.length));
    let A = Array.from({ length: e.length }, (E) => []);
    for (let E = 0; E < x.length; ++E) {
      let S = Math.floor(E / b.dims[0] * e.length);
      T && (x[E] = x[E].slice(T[S])), A[S].push({ generated_text: p ? [...e[S], { role: "assistant", content: x[E] }] : x[E] });
    }
    return !c && A.length === 1 ? A[0] : A;
  }
}, CN = class extends qe {
  constructor(e) {
    super(e), this.label2id = Object.fromEntries(Object.entries(this.model.config.label2id).map(([t, r]) => [t.toLowerCase(), r])), this.entailment_id = this.label2id.entailment, this.entailment_id === void 0 && (ce.warn("Could not find 'entailment' in label2id mapping. Using 2 as entailment_id."), this.entailment_id = 2), this.contradiction_id = this.label2id.contradiction ?? this.label2id.not_entailment, this.contradiction_id === void 0 && (ce.warn("Could not find 'contradiction' in label2id mapping. Using 0 as contradiction_id."), this.contradiction_id = 0);
  }
  async _call(e, t, { hypothesis_template: r = "This example is {}.", multi_label: n = !1 } = {}) {
    let a = Array.isArray(e);
    a || (e = [e]), Array.isArray(t) || (t = [t]);
    let s = t.map((l) => r.replace("{}", l)), i = n || t.length === 1, o = [];
    for (let l of e) {
      let c = [];
      for (let d of s) {
        let _ = this.tokenizer(l, { text_pair: d, padding: !0, truncation: !0 }), f = await this.model(_);
        i ? c.push([f.logits.data[this.contradiction_id], f.logits.data[this.entailment_id]]) : c.push(f.logits.data[this.entailment_id]);
      }
      let p = (i ? c.map((d) => st(d)[1]) : st(c)).map((d, _) => [d, _]).sort((d, _) => _[0] - d[0]);
      o.push({ sequence: l, labels: p.map((d) => t[d[1]]), scores: p.map((d) => d[0]) });
    }
    return a ? o : o[0];
  }
}, SN = class extends qe {
  async _call(e, { top_k: t = 5 } = {}) {
    let r = this.processor.feature_extractor.config.sampling_rate, n = await kn(e, r), a = this.model.config.id2label, s = [];
    for (let i of n) {
      let o = await this.processor(i), l = (await this.model(o)).logits[0], c = await In(new V("float32", st(l.data), l.dims), t), p = c[0].tolist(), d = c[1].tolist().map((_, f) => ({ label: a ? a[_] : `LABEL_${_}`, score: p[f] }));
      s.push(d);
    }
    return Array.isArray(e) ? s : s[0];
  }
}, PN = class extends qe {
  async _call(e, t, { hypothesis_template: r = "This is a sound of {}." } = {}) {
    let n = !Array.isArray(e);
    n && (e = [e]);
    let a = t.map((c) => r.replace("{}", c)), s = this.tokenizer(a, { padding: !0, truncation: !0 }), i = this.processor.feature_extractor.config.sampling_rate, o = await kn(e, i), l = [];
    for (let c of o) {
      let p = await this.processor(c), d = await this.model({ ...s, ...p }), _ = st(d.logits_per_audio.data);
      l.push([..._].map((f, w) => ({ score: f, label: t[w] })));
    }
    return n ? l[0] : l;
  }
}, FN = class extends qe {
  _default_generation_config = {};
  async _call(e, t = {}) {
    switch (t = { ...this._default_generation_config, ...t }, this.model.config.model_type) {
      case "whisper":
      case "lite-whisper":
        return this._call_whisper(e, t);
      case "wav2vec2":
      case "wav2vec2-bert":
      case "unispeech":
      case "unispeech-sat":
      case "hubert":
      case "parakeet_ctc":
        return this._call_wav2vec2(e, t);
      case "moonshine":
        return this._call_moonshine(e, t);
      case "cohere_asr":
        return this._call_cohere_asr(e, t);
      default:
        throw new Error(`AutomaticSpeechRecognitionPipeline does not support model type '${this.model.config.model_type}'.`);
    }
  }
  async _call_wav2vec2(e, t) {
    t.language && ce.warn('`language` parameter is not yet supported for `wav2vec2` models, defaulting to "English".'), t.task && ce.warn('`task` parameter is not yet supported for `wav2vec2` models, defaulting to "transcribe".');
    let r = !Array.isArray(e), n = r ? [e] : e, a = this.processor.feature_extractor.config.sampling_rate, s = await kn(n, a), i = [];
    for (let o of s) {
      let l = await this.processor(o), c = (await this.model(l)).logits[0], p = [];
      for (let _ of c) p.push(We(_.data)[1]);
      let d = this.tokenizer.decode(p, { skip_special_tokens: !0 }).trim();
      i.push({ text: d });
    }
    return r ? i[0] : i;
  }
  async _call_whisper(e, t) {
    let r = t.return_timestamps ?? !1, n = t.chunk_length_s ?? 0, a = t.force_full_sequences ?? !1, s = t.stride_length_s ?? null, i = { ...t };
    r === "word" && (i.return_token_timestamps = !0, i.return_timestamps = !0);
    let o = !Array.isArray(e), l = o ? [e] : e, c = this.processor.feature_extractor.config, p = c.chunk_length / this.model.config.max_source_positions, d = c.hop_length, _ = c.sampling_rate, f = await kn(l, _), w = [];
    for (let y of f) {
      let b = [];
      if (n > 0) {
        if (s === null) s = n / 6;
        else if (n <= s) throw Error("`chunk_length_s` must be larger than `stride_length_s`.");
        let A = _ * n, E = _ * s, S = A - 2 * E, O = 0;
        for (; ; ) {
          let M = O + A, G = y.subarray(O, M), D = await this.processor(G), U = O === 0, q = M >= y.length;
          if (b.push({ stride: [G.length, U ? 0 : E, q ? 0 : E], input_features: D.input_features, is_last: q }), q) break;
          O += S;
        }
      } else b = [{ stride: [y.length, 0, 0], input_features: (await this.processor(y)).input_features, is_last: !0 }];
      for (let A of b) {
        i.num_frames = Math.floor(A.stride[0] / d);
        let E = await this.model.generate({ inputs: A.input_features, ...i });
        if (r === "word") {
          let S = E.sequences.tolist()[0], O = E.token_timestamps.tolist()[0], M = this.tokenizer.timestamp_begin, G = Math.max(S.findIndex((D) => Number(D) >= M), 0);
          A.tokens = S.slice(G), A.token_timestamps = O.slice(G).map((D) => ia(D, 2));
        } else A.tokens = E[0].tolist();
        A.stride = A.stride.map((S) => S / _);
      }
      let [x, T] = this.tokenizer._decode_asr(b, { time_precision: p, return_timestamps: r, force_full_sequences: a });
      w.push({ text: x, ...T });
    }
    return o ? w[0] : w;
  }
  async _call_moonshine(e, t) {
    let r = !Array.isArray(e), n = r ? [e] : e, a = this.processor.feature_extractor.config.sampling_rate, s = await kn(n, a), i = [];
    for (let o of s) {
      let l = await this.processor(o), c = Math.floor(o.length / a) * 6, p = await this.model.generate({ max_new_tokens: c, ...t, ...l }), d = this.tokenizer.batch_decode(p, { skip_special_tokens: !0 })[0];
      i.push({ text: d });
    }
    return r ? i[0] : i;
  }
  async _call_cohere_asr(e, t) {
    let r = !Array.isArray(e), n = r ? [e] : e, a = this.processor.feature_extractor, s = a.config.sampling_rate, i = await kn(n, s), o = t.language ?? "en", l = this.processor.get_decoder_prompt_ids(o), c = [];
    for (let p of i) {
      let d = a.split_audio(p), _ = [];
      for (let w of d) {
        let y = await this.processor(w), b = await this.model.generate({ ...y, decoder_input_ids: l, ...t }), x = this.tokenizer.decode(b[0].tolist(), { skip_special_tokens: !0 }).trim();
        _.push(x);
      }
      let f = this.processor.constructor.join_chunks(_, o);
      c.push({ text: f });
    }
    return r ? c[0] : c;
  }
}, IN = class extends qe {
  DEFAULT_VOCODER_ID = "Xenova/speecht5_hifigan";
  constructor(e) {
    super(e), this.vocoder = e.vocoder ?? null;
  }
  async _prepare_speaker_embeddings(e, t) {
    if ((typeof e == "string" || e instanceof URL) && (e = new Float32Array(await (await we.fetch(e)).arrayBuffer())), e instanceof Float32Array) e = new V("float32", e, [e.length]);
    else if (!(e instanceof V)) throw new Error("Speaker embeddings must be a `Tensor`, `Float32Array`, `string`, or `URL`.");
    if (t > 1) {
      if (e.dims[0] === 1) e = e.repeat(t, 1);
      else if (e.dims[0] !== t) throw new Error(`Expected speaker embeddings batch size to be 1 or ${t}, but got ${e.dims[0]}.`);
    }
    return e;
  }
  _postprocess_waveform(e, t, r, n = null) {
    let a = t.data, [s, i] = t.dims, o = n ? n.data : null, l = [];
    for (let c = 0; c < s; ++c) {
      let p = o ? Math.min(Math.ceil(o[c]), i) : i, d = c * i;
      l.push(new f2(a.slice(d, d + p), r));
    }
    return Array.isArray(e) ? l : l[0];
  }
  async _call(e, t) {
    return this.processor ? this._call_text_to_spectrogram(e, t) : this.model.config.model_type === "supertonic" ? this._call_supertonic(e, t) : this._call_text_to_waveform(e);
  }
  async _call_supertonic(e, { speaker_embeddings: t, num_inference_steps: r, speed: n }) {
    if (!t) throw new Error("Speaker embeddings must be provided for Supertonic models.");
    let { sampling_rate: a, style_dim: s } = this.model.config, i = this.tokenizer(e, { padding: !0, truncation: !0 }), o = i.input_ids.dims[0];
    t = await this._prepare_speaker_embeddings(t, o), t = t.view(o, -1, s);
    let { waveform: l, durations: c } = await this.model.generate_speech({ ...i, style: t, num_inference_steps: r, speed: n });
    return this._postprocess_waveform(e, l, a, c);
  }
  async _call_text_to_waveform(e) {
    let t = this.tokenizer(e, { padding: !0, truncation: !0 }), { waveform: r } = await this.model(t), n = this.model.config.sampling_rate;
    return this._postprocess_waveform(e, r, n);
  }
  async _call_text_to_spectrogram(e, { speaker_embeddings: t }) {
    this.vocoder || (ce.info("No vocoder specified, using default HifiGan vocoder."), this.vocoder = await oa.from_pretrained(this.DEFAULT_VOCODER_ID, { dtype: "fp32" }));
    let { input_ids: r } = this.tokenizer(e, { padding: !0, truncation: !0 }), n = r.dims[0];
    t = await this._prepare_speaker_embeddings(t, n), t = t.view(n, -1);
    let { waveform: a } = await this.model.generate_speech(r, t, { vocoder: this.vocoder }), s = this.processor.feature_extractor.config.sampling_rate;
    return this._postprocess_waveform(e, a, s);
  }
}, LN = class extends qe {
  async _call(e, t = {}) {
    let r = Array.isArray(e), n = await Wt(e), { pixel_values: a } = await this.processor(n), s = [];
    for (let i of a) {
      i.dims = [1, ...i.dims];
      let o = await this.model.generate({ inputs: i, ...t }), l = this.tokenizer.batch_decode(o, { skip_special_tokens: !0 }).map((c) => ({ generated_text: c.trim() }));
      s.push(l);
    }
    return r ? s : s[0];
  }
}, ON = class extends qe {
  async _call(e, { top_k: t = 5 } = {}) {
    let r = await Wt(e), { pixel_values: n } = await this.processor(r), a = await this.model({ pixel_values: n }), { id2label: s } = this.model.config, i = [];
    for (let o of a.logits) {
      let l = await In(new V("float32", st(o.data), o.dims), t), c = l[0].tolist(), p = l[1].tolist().map((d, _) => ({ label: s ? s[d] : `LABEL_${d}`, score: c[_] }));
      i.push(p);
    }
    return Array.isArray(e) ? i : i[0];
  }
}, Gf = { panoptic: "post_process_panoptic_segmentation", instance: "post_process_instance_segmentation", semantic: "post_process_semantic_segmentation" }, Fy = class extends qe {
  async _call(e, { threshold: t = 0.5, mask_threshold: r = 0.5, overlap_mask_area_threshold: n = 0.8, label_ids_to_fuse: a = null, target_sizes: s = null, subtask: i = null } = {}) {
    if (Array.isArray(e) && e.length !== 1) throw Error("Image segmentation pipeline currently only supports a batch size of 1.");
    let o = await Wt(e), l = o.map((b) => [b.height, b.width]), c = await this.processor(o), { inputNames: p, outputNames: d } = this.model.sessions.model;
    if (!p.includes("pixel_values")) {
      if (p.length !== 1) throw Error(`Expected a single input name, but got ${p.length} inputs: ${p}.`);
      let b = p[0];
      if (b in c) throw Error(`Input name ${b} already exists in the inputs.`);
      c[b] = c.pixel_values;
    }
    let _ = await this.model(c), f = null;
    if (i !== null) f = Gf[i];
    else if (this.processor.image_processor) {
      for (let [b, x] of Object.entries(Gf)) if (x in this.processor.image_processor) {
        f = this.processor.image_processor[x].bind(this.processor.image_processor), i = b;
        break;
      }
    }
    let w = this.model.config.id2label, y = [];
    if (i) if (i === "panoptic" || i === "instance") {
      let b = f(_, t, r, n, a, s ?? l)[0], x = b.segmentation;
      for (let T of b.segments_info) {
        let A = new Uint8ClampedArray(x.data.length);
        for (let S = 0; S < x.data.length; ++S) x.data[S] === T.id && (A[S] = 255);
        let E = new kt(A, x.dims[1], x.dims[0], 1);
        y.push({ score: T.score, label: w[T.label_id], mask: E });
      }
    } else if (i === "semantic") {
      let { segmentation: b, labels: x } = f(_, s ?? l)[0];
      for (let T of x) {
        let A = new Uint8ClampedArray(b.data.length);
        for (let S = 0; S < b.data.length; ++S) b.data[S] === T && (A[S] = 255);
        let E = new kt(A, b.dims[1], b.dims[0], 1);
        y.push({ score: null, label: w[T], mask: E });
      }
    } else throw Error(`Subtask ${i} not supported.`);
    else {
      let b = _[d[0]];
      for (let x = 0; x < l.length; ++x) {
        let T = l[x], A = b[x];
        A.data.some((S) => S < -1e-5 || S > 1 + 1e-5) && A.sigmoid_();
        let E = await kt.fromTensor(A.mul_(255).to("uint8")).resize(T[1], T[0]);
        y.push({ label: null, score: null, mask: E });
      }
    }
    return y;
  }
}, zN = class extends Fy {
  async _call(e, t = {}) {
    let r = await Wt(e), n = await super._call(e, t), a = r.map((s, i) => {
      let o = s.clone();
      return o.putAlpha(n[i].mask), o;
    });
    return Array.isArray(e) ? a : a[0];
  }
}, NN = class extends qe {
  async _call(e, t, { hypothesis_template: r = "This is a photo of {}" } = {}) {
    let n = Array.isArray(e), a = await Wt(e), s = t.map((d) => r.replace("{}", d)), i = this.tokenizer(s, { padding: this.model.config.model_type === "siglip" ? "max_length" : !0, truncation: !0 }), { pixel_values: o } = await this.processor(a), l = await this.model({ ...i, pixel_values: o }), c = this.model.config.model_type === "siglip" ? (d) => d.sigmoid().data : (d) => st(d.data), p = [];
    for (let d of l.logits_per_image) {
      let _ = [...c(d)].map((f, w) => ({ score: f, label: t[w] }));
      _.sort((f, w) => w.score - f.score), p.push(_);
    }
    return n ? p : p[0];
  }
}, BN = class extends qe {
  async _call(e, { threshold: t = 0.9, percentage: r = !1 } = {}) {
    let n = Array.isArray(e);
    if (n && e.length !== 1) throw Error("Object detection pipeline currently only supports a batch size of 1.");
    let a = await Wt(e), s = r ? null : a.map((_) => [_.height, _.width]), { pixel_values: i, pixel_mask: o } = await this.processor(a), l = await this.model({ pixel_values: i, pixel_mask: o }), c = this.processor.image_processor.post_process_object_detection(l, t, s), { id2label: p } = this.model.config, d = c.map((_) => _.boxes.map((f, w) => ({ score: _.scores[w], label: p[_.classes[w]], box: Jo(f, !r) })));
    return n ? d : d[0];
  }
}, $N = class extends qe {
  async _call(e, t, { threshold: r = 0.1, top_k: n = null, percentage: a = !1 } = {}) {
    let s = Array.isArray(e), i = await Wt(e), o = this.tokenizer(t, { padding: !0, truncation: !0 }), l = await this.processor(i), c = [];
    for (let p = 0; p < i.length; ++p) {
      let d = i[p], _ = a ? null : [[d.height, d.width]], f = l.pixel_values[p].unsqueeze_(0), w = await this.model({ ...o, pixel_values: f }), y;
      if ("post_process_grounded_object_detection" in this.processor) {
        let b = this.processor.post_process_grounded_object_detection(w, o.input_ids, { box_threshold: r, text_threshold: r, target_sizes: _ })[0];
        y = b.boxes.map((x, T) => ({ score: b.scores[T], label: b.labels[T], box: Jo(x, !a) }));
      } else {
        let b = this.processor.image_processor.post_process_object_detection(w, r, _, !0)[0];
        y = b.boxes.map((x, T) => ({ score: b.scores[T], label: t[b.classes[T]], box: Jo(x, !a) }));
      }
      y.sort((b, x) => x.score - b.score), n !== null && (y = y.slice(0, n)), c.push(y);
    }
    return s ? c : c[0];
  }
}, DN = class extends qe {
  _default_generation_config = { max_new_tokens: 256 };
  async _call(e, t, r = {}) {
    if (Array.isArray(e)) {
      if (e.length !== 1) throw Error("Document Question Answering pipeline currently only supports a batch size of 1.");
      e = e[0];
    }
    let n = (await Wt(e))[0], { pixel_values: a } = await this.processor(n), s = `<s_docvqa><s_question>${t}</s_question><s_answer>`, i = this.tokenizer(s, { add_special_tokens: !1, padding: !0, truncation: !0 }).input_ids, o = await this.model.generate({ inputs: a, max_length: this.model.config.decoder.max_position_embeddings, decoder_input_ids: i, ...this._default_generation_config, ...r }), l = this.tokenizer.batch_decode(o)[0].match(/<s_answer>(.*?)<\/s_answer>/), c = null;
    return l && l.length >= 2 && (c = l[1].trim()), [{ answer: c }];
  }
}, RN = class extends qe {
  async _call(e) {
    let t = await Wt(e), r = await this.processor(t), n = await this.model(r), a = [];
    for (let s of n.reconstruction) {
      let i = s.squeeze().clamp_(0, 1).mul_(255).round_().to("uint8");
      a.push(kt.fromTensor(i));
    }
    return Array.isArray(e) ? a : a[0];
  }
}, GN = class extends qe {
  async _call(e) {
    let t = await Wt(e), r = await this.processor(t), { predicted_depth: n } = await this.model(r), a = [];
    for (let s = 0; s < t.length; ++s) {
      let i = n[s], [o, l] = i.dims.slice(-2), [c, p] = t[s].size, d = (await Gt(i.view(1, 1, o, l), { size: [p, c], mode: "bilinear" })).view(p, c), _ = d.min().item(), f = d.max().item(), w = d.sub(_).div_(f - _).mul_(255).to("uint8").unsqueeze(0), y = kt.fromTensor(w);
      a.push({ predicted_depth: d, depth: y });
    }
    return Array.isArray(e) ? a : a[0];
  }
}, VN = class extends qe {
  async _call(e, { pooling: t = "none", normalize: r = !1, quantize: n = !1, precision: a = "binary" } = {}) {
    let s = this.tokenizer(e, { padding: !0, truncation: !0 }), i = await this.model(s), o = i.last_hidden_state ?? i.logits ?? i.token_embeddings;
    switch (t) {
      case "none":
        break;
      case "mean":
        o = ZT(o, s.attention_mask);
        break;
      case "first_token":
      case "cls":
        o = o.slice(null, 0);
        break;
      case "last_token":
      case "eos":
        o = o.slice(null, -1);
        break;
      default:
        throw Error(`Pooling method '${t}' not supported.`);
    }
    return r && (o = o.normalize(2, -1)), n && (o = eE(o, a)), o;
  }
}, UN = class extends qe {
  async _call(e, { pool: t = null } = {}) {
    let r = await Wt(e), { pixel_values: n } = await this.processor(r), a = await this.model({ pixel_values: n }), s;
    if (t) {
      if (!("pooler_output" in a)) throw Error("No pooled output was returned. Make sure the model has a 'pooler' layer when using the 'pool' option.");
      s = a.pooler_output;
    } else s = a.last_hidden_state ?? a.logits ?? a.image_embeds;
    return s;
  }
}, As = Object.freeze({ "text-classification": { pipeline: yN, model: Nf, default: { model: "Xenova/distilbert-base-uncased-finetuned-sst-2-english" }, type: "text" }, "token-classification": { pipeline: bN, model: rN, default: { model: "Xenova/bert-base-multilingual-cased-ner-hrl" }, type: "text" }, "question-answering": { pipeline: MN, model: lN, default: { model: "Xenova/distilbert-base-cased-distilled-squad" }, type: "text" }, "fill-mask": { pipeline: kN, model: oN, default: { model: "onnx-community/ettin-encoder-32m-ONNX", dtype: "fp32" }, type: "text" }, summarization: { pipeline: TN, model: No, default: { model: "Xenova/distilbart-cnn-6-6" }, type: "text" }, translation: { pipeline: EN, model: No, default: { model: "Xenova/t5-small" }, type: "text" }, "text2text-generation": { pipeline: $u, model: No, default: { model: "Xenova/flan-t5-small" }, type: "text" }, "text-generation": { pipeline: AN, model: iN, default: { model: "onnx-community/Qwen3-0.6B-ONNX", dtype: "q4" }, type: "text" }, "zero-shot-classification": { pipeline: CN, model: Nf, default: { model: "Xenova/distilbert-base-uncased-mnli" }, type: "text" }, "audio-classification": { pipeline: SN, model: _N, default: { model: "Xenova/wav2vec2-base-superb-ks" }, type: "audio" }, "zero-shot-audio-classification": { pipeline: PN, model: oa, default: { model: "Xenova/clap-htsat-unfused" }, type: "multimodal" }, "automatic-speech-recognition": { pipeline: FN, model: [nN, hN], default: { model: "Xenova/whisper-tiny.en" }, type: "multimodal" }, "text-to-audio": { pipeline: IN, model: [sN, aN], default: { model: "onnx-community/Supertonic-TTS-ONNX", dtype: "fp32" }, type: "text" }, "image-to-text": { pipeline: LN, model: cN, default: { model: "Xenova/vit-gpt2-image-captioning" }, type: "multimodal" }, "image-classification": { pipeline: ON, model: uN, default: { model: "Xenova/vit-base-patch16-224" }, type: "multimodal" }, "image-segmentation": { pipeline: Fy, model: [Bf, $f, Df], default: { model: "Xenova/detr-resnet-50-panoptic" }, type: "multimodal" }, "background-removal": { pipeline: zN, model: [Bf, $f, Df], default: { model: "Xenova/modnet" }, type: "image" }, "zero-shot-image-classification": { pipeline: NN, model: oa, default: { model: "Xenova/clip-vit-base-patch32" }, type: "multimodal" }, "object-detection": { pipeline: BN, model: dN, default: { model: "Xenova/detr-resnet-50" }, type: "multimodal" }, "zero-shot-object-detection": { pipeline: $N, model: pN, default: { model: "Xenova/owlvit-base-patch32" }, type: "multimodal" }, "document-question-answering": { pipeline: DN, model: fN, default: { model: "Xenova/donut-base-finetuned-docvqa" }, type: "multimodal" }, "image-to-image": { pipeline: RN, model: mN, default: { model: "Xenova/swin2SR-classical-sr-x2-64" }, type: "image" }, "depth-estimation": { pipeline: GN, model: gN, default: { model: "onnx-community/depth-anything-v2-small" }, type: "image" }, "feature-extraction": { pipeline: VN, model: oa, default: { model: "onnx-community/all-MiniLM-L6-v2-ONNX", dtype: "fp32" }, type: "text" }, "image-feature-extraction": { pipeline: UN, model: [wN, oa], default: { model: "onnx-community/dinov3-vits16-pretrain-lvd1689m-ONNX", dtype: "fp32" }, type: "image" } }), Iy = Object.freeze({ "sentiment-analysis": "text-classification", ner: "token-classification", asr: "automatic-speech-recognition", "text-to-speech": "text-to-audio", embeddings: "feature-extraction" });
async function Ly(e) {
  if (!e) throw new Error("modelId is required");
  return (await an(e, ha, {})).exists ? [ha] : [];
}
async function Fa(e, { config: t = null, dtype: r = null, device: n = null, model_file_name: a = null, include_tokenizer: s = !0, include_processor: i = !0 } = {}) {
  let o = await El(e, { config: t, dtype: r, device: n, model_file_name: a });
  if (s) {
    let l = await hl(e);
    o.push(...l);
  }
  if (i) {
    let l = await Ly(e);
    o.push(...l);
  }
  return o;
}
async function Ia(e, t, r = {}) {
  e = Iy[e] ?? e;
  let n = As[e];
  if (!n) throw new Error(`Unsupported pipeline task: ${e}. Must be one of [${Object.keys(As).join(", ")}]`);
  let { type: a } = n, s = await Fa(t, { ...r, include_tokenizer: a !== "audio" && a !== "image", include_processor: a !== "text" });
  if (e === "text-generation") {
    let i = await Tl(t, r), o = kl(i), l = jC(o);
    if (l) {
      let c = Object.values(l).map((p) => `onnx/${p}`);
      return s.filter((p) => !p.startsWith("onnx/") || c.some((d) => p.startsWith(d)));
    }
  }
  return s;
}
async function x$(e, t = null, { progress_callback: r = null, config: n = null, cache_dir: a = null, local_files_only: s = !1, revision: i = "main", device: o = null, dtype: l = null, subfolder: c = "onnx", use_external_data_format: p = null, model_file_name: d = null, session_options: _ = {} } = {}) {
  e = Iy[e] ?? e;
  let f = As[e.split("_", 1)[0]];
  if (!f) throw Error(`Unsupported pipeline: ${e}. Must be one of [${Object.keys(As)}]`);
  t || (t = f.default.model, ce.info(`No model specified. Using default model: "${t}".`), !l && f.default.dtype && (l = f.default.dtype));
  let w = await Ia(e, t, { device: o, dtype: l }), y = {};
  if (r) try {
    (await Promise.all(w.map(async (U) => an(t, U)))).forEach((U, q) => {
      U.exists && (y[w[q]] = { loaded: 0, total: U.size ?? 0 });
    });
  } catch (U) {
    ce.warn(`Unable to fetch model file metadata for total progress tracking: ${U}`);
  }
  let b = { progress_callback: r ? new fs(r, y) : void 0, config: n, cache_dir: a, local_files_only: s, revision: i, device: o, dtype: l, subfolder: c, use_external_data_format: p, model_file_name: d, session_options: _ }, x = w.includes("tokenizer.json"), T = w.includes("preprocessor_config.json"), A = f.model, E;
  if (Array.isArray(A)) {
    let U = n ?? await _a.from_pretrained(t, b), { model_type: q } = U, H = A.find((Q) => Q.supports(q));
    if (!H) throw Error(`Unsupported model type "${q}" for task "${e}". None of the candidate model classes support this type.`);
    E = H.from_pretrained(t, { ...b, config: U });
  } else E = A.from_pretrained(t, b);
  let [S, O, M] = await Promise.all([x ? Ae.from_pretrained(t, b) : null, T ? gC.from_pretrained(t, b) : null, E]), G = { task: e, model: M };
  S && (G.tokenizer = S), O && (G.processor = O), Sr(r, { status: "ready", task: e, model: t });
  let D = f.pipeline;
  return new D(G);
}
var qN = (e) => e >= 19968 && e <= 40959 || e >= 13312 && e <= 19903 || e >= 131072 && e <= 173791 || e >= 173824 && e <= 177983 || e >= 177984 && e <= 178207 || e >= 178208 && e <= 183983 || e >= 63744 && e <= 64255 || e >= 194560 && e <= 195103, jN = class {
  put(e) {
    throw Error("Not implemented");
  }
  end() {
    throw Error("Not implemented");
  }
}, Vf = pe.IS_PROCESS_AVAILABLE ? (e) => process.stdout.write(e) : (e) => console.log(e), WN = class extends jN {
  constructor(e, { skip_prompt: t = !1, callback_function: r = null, token_callback_function: n = null, skip_special_tokens: a = !0, decode_kwargs: s = {}, ...i } = {}) {
    super(), this.tokenizer = e, this.skip_prompt = t, this.callback_function = r ?? Vf, this.token_callback_function = n, this.decode_kwargs = { skip_special_tokens: a, ...s, ...i }, this.token_cache = [], this.print_len = 0, this.next_tokens_are_prompt = !0, this.special_ids = new Set(this.tokenizer.all_special_ids.map(BigInt));
  }
  put(e) {
    if (e.length > 1) throw Error("TextStreamer only supports batch size of 1");
    let t = this.next_tokens_are_prompt;
    if (t && (this.next_tokens_are_prompt = !1, this.skip_prompt)) return;
    let r = e[0];
    if (this.token_callback_function?.(r), r.length === 1 && this.special_ids.has(r[0])) {
      if (this.decode_kwargs.skip_special_tokens) return;
      if (this.token_cache.length > 0) {
        let i = this.tokenizer.decode(this.token_cache, this.decode_kwargs).slice(this.print_len);
        this.on_finalized_text(i, !1), this.token_cache = [], this.print_len = 0;
      }
      let s = this.tokenizer.decode(r, this.decode_kwargs);
      this.on_finalized_text(s, !1);
      return;
    }
    this.token_cache = $t(this.token_cache, r);
    let n = this.tokenizer.decode(this.token_cache, this.decode_kwargs), a;
    t || n.endsWith(`
`) ? (a = n.slice(this.print_len), this.token_cache = [], this.print_len = 0) : n.length > 0 && qN(n.charCodeAt(n.length - 1)) ? (a = n.slice(this.print_len), this.print_len += a.length) : (a = n.slice(this.print_len, n.lastIndexOf(" ") + 1), this.print_len += a.length), this.on_finalized_text(a, !1);
  }
  end() {
    let e;
    this.token_cache.length > 0 ? (e = this.tokenizer.decode(this.token_cache, this.decode_kwargs).slice(this.print_len), this.token_cache = [], this.print_len = 0) : e = "", this.next_tokens_are_prompt = !0, this.on_finalized_text(e, !0);
  }
  on_finalized_text(e, t) {
    e.length > 0 && this.callback_function?.(e), t && this.callback_function === Vf && pe.IS_PROCESS_AVAILABLE && this.callback_function?.(`
`);
  }
}, M$ = class extends WN {
  constructor(e, { skip_prompt: t = !1, callback_function: r = null, token_callback_function: n = null, on_chunk_start: a = null, on_chunk_end: s = null, on_finalize: i = null, time_precision: o = 0.02, skip_special_tokens: l = !0, decode_kwargs: c = {} } = {}) {
    super(e, { skip_prompt: t, skip_special_tokens: l, callback_function: r, token_callback_function: n, decode_kwargs: c }), this.timestamp_begin = e.timestamp_begin, this.on_chunk_start = a, this.on_chunk_end = s, this.on_finalize = i, this.time_precision = o, this.waiting_for_timestamp = !1;
  }
  put(e) {
    if (e.length > 1) throw Error("WhisperTextStreamer only supports batch size of 1");
    let t = e[0];
    if (t.length === 1) {
      let r = Number(t[0]) - this.timestamp_begin;
      if (r >= 0) {
        let n = r * this.time_precision;
        this.waiting_for_timestamp ? this.on_chunk_end?.(n) : this.on_chunk_start?.(n), this.waiting_for_timestamp = !this.waiting_for_timestamp, this.token_callback_function?.(t);
        return;
      }
    }
    return super.put(e);
  }
  end() {
    super.end(), this.on_finalize?.();
  }
}, Oy = class {
  constructor(e, t) {
    this.image = e, this.timestamp = t;
  }
}, HN = class {
  constructor(e, t) {
    e.length > 0 && e[0] instanceof kt && (e = e.map((r, n) => new Oy(r, (n + 1) / (e.length + 1) * t))), this.frames = e, this.duration = t;
  }
  get width() {
    return this.frames[0].image.width;
  }
  get height() {
    return this.frames[0].image.height;
  }
  get fps() {
    return this.frames.length / this.duration;
  }
};
async function k$(e, { num_frames: t = null, fps: r = null } = {}) {
  if (!pe.IS_BROWSER_ENV) throw new Error("`load_video` is currently only supported in browser environments.");
  if (t == null && r == null) throw new Error("Either num_frames or fps must be provided.");
  let n = [], a = document.createElement("video");
  if (a.crossOrigin = "anonymous", a.muted = !0, typeof e == "string") a.src = e;
  else if (e instanceof Blob) a.src = URL.createObjectURL(e);
  else if (e instanceof HTMLVideoElement) a.src = e.src;
  else throw new Error("Invalid URL or video element provided.");
  if (await new Promise((d) => a.onloadedmetadata = d), a.seekable.start(0) === a.seekable.end(0)) {
    let d = await (await we.fetch(a.src)).blob();
    a.src = URL.createObjectURL(d), await new Promise((_) => a.onloadedmetadata = _);
  }
  let s = a.duration, i, o;
  t != null ? (i = t, o = t === 1 ? 0 : s / (t - 1)) : (o = 1 / r, i = Math.floor(s / o));
  let l = [];
  for (let d = 0; d < i; ++d) l.push(t === 1 ? s / 2 : d * o);
  let c = document.createElement("canvas");
  c.width = a.videoWidth, c.height = a.videoHeight;
  let p = c.getContext("2d", { willReadFrequently: !0 });
  for (let d of l) {
    a.currentTime = d, await new Promise((y) => {
      a.onseeked = y;
    }), p.drawImage(a, 0, 0, c.width, c.height);
    let _ = p.getImageData(0, 0, c.width, c.height), f = new kt(_.data, c.width, c.height, 4), w = new Oy(f, d);
    n.push(w);
  }
  return a.remove(), new HN(n, s);
}
async function ri(e, t, r = {}) {
  let n = await Fn(r?.cache_dir);
  if (!n) return { allCached: !1, files: t.map((s) => ({ file: s, cached: !1 })) };
  let a = await Promise.all(t.map(async (s) => {
    let { localPath: i, proposedCacheKey: o } = wa(e, s, r, n), l = await ya(n, i, o);
    return { file: s, cached: !!l };
  }));
  return { allCached: a.every((s) => s.cached), files: a };
}
async function zy(e, t, r = {}) {
  let n = await Fn(r?.cache_dir);
  if (!n) return !1;
  let { localPath: a, proposedCacheKey: s } = wa(e, t, r, n);
  return !!await ya(n, a, s);
}
async function QN(e, t = {}) {
  if (!e) throw new Error("modelId is required");
  if (!await zy(e, "config.json", t)) return !1;
  let r = await Fa(e, t);
  return (await ri(e, r, t)).allCached;
}
async function XN(e, t = {}) {
  if (!e) throw new Error("modelId is required");
  let r = await Fa(e, t);
  return await ri(e, r, t);
}
async function YN(e, t, r = {}) {
  if (!e) throw new Error("task is required");
  if (!t) throw new Error("modelId is required");
  if (!await zy(t, "config.json", r)) return !1;
  let n = await Ia(e, t, r);
  return (await ri(t, n, r)).allCached;
}
async function JN(e, t, r = {}) {
  if (!e) throw new Error("task is required");
  if (!t) throw new Error("modelId is required");
  let n = await Ia(e, t, r);
  return await ri(t, n, r);
}
async function Ny(e, t, r = {}) {
  let n = await Fn(r?.cache_dir);
  if (!n) return { filesDeleted: 0, filesCached: 0, files: t.map((s) => ({ file: s, deleted: !1, wasCached: !1 })) };
  if (!n.delete) throw new Error("Cache does not support delete operation");
  let a = await Promise.all(t.map(async (s) => {
    let { localPath: i, proposedCacheKey: o } = wa(e, s, r, n), l = !!await ya(n, i, o), c = !1;
    if (l) {
      let p = await n.delete(o), d = !p && o !== i ? await n.delete(i) : !1;
      c = p || d;
    }
    return { file: s, deleted: c, wasCached: l };
  }));
  return { filesDeleted: a.filter((s) => s.deleted).length, filesCached: a.filter((s) => s.wasCached).length, files: a };
}
async function ZN(e, t = {}) {
  if (!e) throw new Error("modelId is required");
  let r = await Fa(e, t);
  return await Ny(e, r, t);
}
async function KN(e, t, r = {}) {
  if (!e) throw new Error("task is required");
  if (!t) throw new Error("modelId is required");
  let n = await Ia(e, t, r);
  return await Ny(t, n, r);
}
var eB = Object.keys(da);
async function tB(e, { config: t = null, model_file_name: r = null, revision: n = "main", cache_dir: a = null, local_files_only: s = !1 } = {}) {
  t = await Tl(e, { config: t, cache_dir: a, local_files_only: s, revision: n });
  let i = "onnx", o = kl(t), { sessions: l } = Sg(o, t, { model_file_name: r }), c = Object.values(l), p = { revision: n, cache_dir: a, local_files_only: s };
  return (await Promise.all(eB.map(async (d) => {
    let _ = da[d] ?? "", f = await Promise.all(c.map(async (w) => {
      let y = `${i}/${w}${_}.onnx`;
      return (await an(e, y, p)).exists;
    }));
    return { dtype: d, available: f.every(Boolean) };
  }))).filter((d) => d.available).map((d) => d.dtype);
}
var T$ = class {
  static async get_files(e, t = {}) {
    return Fa(e, t);
  }
  static async get_pipeline_files(e, t, r = {}) {
    return Ia(e, t, r);
  }
  static async get_model_files(e, t = {}) {
    return El(e, t);
  }
  static async get_tokenizer_files(e) {
    return hl(e);
  }
  static async get_processor_files(e) {
    return Ly(e);
  }
  static async get_available_dtypes(e, t = {}) {
    return tB(e, t);
  }
  static async is_cached(e, t = {}) {
    return QN(e, t);
  }
  static async is_cached_files(e, t = {}) {
    return XN(e, t);
  }
  static async is_pipeline_cached(e, t, r = {}) {
    return YN(e, t, r);
  }
  static async is_pipeline_cached_files(e, t, r = {}) {
    return JN(e, t, r);
  }
  static async get_file_metadata(e, t, r = {}) {
    return an(e, t, r);
  }
  static async clear_cache(e, t = {}) {
    return ZN(e, t);
  }
  static async clear_pipeline_cache(e, t, r = {}) {
    return KN(e, t, r);
  }
};
export {
  m2 as ASTFeatureExtractor,
  uS as ASTForAudioClassification,
  cS as ASTModel,
  Ol as ASTPreTrainedModel,
  iS as AfmoeForCausalLM,
  sS as AfmoeModel,
  Il as AfmoePreTrainedModel,
  rS as AlbertForMaskedLM,
  tS as AlbertForQuestionAnswering,
  eS as AlbertForSequenceClassification,
  KC as AlbertModel,
  xa as AlbertPreTrainedModel,
  sE as AlbertTokenizer,
  aS as ApertusForCausalLM,
  nS as ApertusModel,
  Fl as ApertusPreTrainedModel,
  lS as ArceeForCausalLM,
  oS as ArceeModel,
  Ll as ArceePreTrainedModel,
  SN as AudioClassificationPipeline,
  _a as AutoConfig,
  Ft as AutoFeatureExtractor,
  pt as AutoImageProcessor,
  oa as AutoModel,
  _N as AutoModelForAudioClassification,
  m$ as AutoModelForAudioFrameClassification,
  v$ as AutoModelForAudioTextToText,
  hN as AutoModelForCTC,
  iN as AutoModelForCausalLM,
  gN as AutoModelForDepthEstimation,
  fN as AutoModelForDocumentQuestionAnswering,
  uN as AutoModelForImageClassification,
  wN as AutoModelForImageFeatureExtraction,
  g$ as AutoModelForImageMatting,
  Bf as AutoModelForImageSegmentation,
  b$ as AutoModelForImageTextToText,
  mN as AutoModelForImageToImage,
  _$ as AutoModelForMaskGeneration,
  oN as AutoModelForMaskedLM,
  w$ as AutoModelForNormalEstimation,
  dN as AutoModelForObjectDetection,
  y$ as AutoModelForPoseEstimation,
  lN as AutoModelForQuestionAnswering,
  $f as AutoModelForSemanticSegmentation,
  No as AutoModelForSeq2SeqLM,
  Nf as AutoModelForSequenceClassification,
  nN as AutoModelForSpeechSeq2Seq,
  aN as AutoModelForTextToSpectrogram,
  sN as AutoModelForTextToWaveform,
  rN as AutoModelForTokenClassification,
  Df as AutoModelForUniversalSegmentation,
  cN as AutoModelForVision2Seq,
  f$ as AutoModelForXVector,
  pN as AutoModelForZeroShotObjectDetection,
  gC as AutoProcessor,
  Ae as AutoTokenizer,
  FN as AutomaticSpeechRecognitionPipeline,
  zN as BackgroundRemovalPipeline,
  pS as BartForConditionalGeneration,
  hS as BartForSequenceClassification,
  dS as BartModel,
  $s as BartPretrainedModel,
  iE as BartTokenizer,
  TC as BaseModelOutput,
  jN as BaseStreamer,
  $2 as BeitFeatureExtractor,
  fS as BeitForImageClassification,
  _S as BeitModel,
  zl as BeitPreTrainedModel,
  gS as BertForMaskedLM,
  bS as BertForQuestionAnswering,
  wS as BertForSequenceClassification,
  yS as BertForTokenClassification,
  mS as BertModel,
  Ln as BertPreTrainedModel,
  oE as BertTokenizer,
  D2 as BitImageProcessor,
  xS as BlenderbotForConditionalGeneration,
  vS as BlenderbotModel,
  Nl as BlenderbotPreTrainedModel,
  kS as BlenderbotSmallForConditionalGeneration,
  MS as BlenderbotSmallModel,
  Bl as BlenderbotSmallPreTrainedModel,
  lE as BlenderbotSmallTokenizer,
  cE as BlenderbotTokenizer,
  ES as BloomForCausalLM,
  TS as BloomModel,
  $l as BloomPreTrainedModel,
  uE as BloomTokenizer,
  OS as CHMv2ForDepthEstimation,
  G2 as CHMv2ImageProcessor,
  Dg as CHMv2PreTrainedModel,
  V2 as CLIPFeatureExtractor,
  rg as CLIPImageProcessor,
  NS as CLIPModel,
  sn as CLIPPreTrainedModel,
  GS as CLIPSegForImageSegmentation,
  RS as CLIPSegModel,
  Dl as CLIPSegPreTrainedModel,
  BS as CLIPTextModel,
  Vg as CLIPTextModelWithProjection,
  pE as CLIPTokenizer,
  $S as CLIPVisionModel,
  DS as CLIPVisionModelWithProjection,
  CS as CamembertForMaskedLM,
  FS as CamembertForQuestionAnswering,
  SS as CamembertForSequenceClassification,
  PS as CamembertForTokenClassification,
  AS as CamembertModel,
  On as CamembertPreTrainedModel,
  dE as CamembertTokenizer,
  Lr as CausalLMOutput,
  EC as CausalLMOutputWithPast,
  g2 as ChatterboxFeatureExtractor,
  Bg as ChatterboxModel,
  Ng as ChatterboxPreTrainedModel,
  P2 as ChatterboxProcessor,
  R2 as ChineseCLIPFeatureExtractor,
  LS as ChineseCLIPModel,
  $g as ChineseCLIPPreTrainedModel,
  Gg as ClapAudioModelWithProjection,
  w2 as ClapFeatureExtractor,
  zS as ClapModel,
  Ds as ClapPreTrainedModel,
  Rg as ClapTextModelWithProjection,
  BC as ClassifierFreeGuidanceLogitsProcessor,
  US as CodeGenForCausalLM,
  VS as CodeGenModel,
  Rl as CodeGenPreTrainedModel,
  _E as CodeGenTokenizer,
  hE as CodeLlamaTokenizer,
  HS as Cohere2ForCausalLM,
  WS as Cohere2Model,
  Vl as Cohere2PreTrainedModel,
  b2 as CohereAsrFeatureExtractor,
  XS as CohereAsrForConditionalGeneration,
  QS as CohereAsrModel,
  Ul as CohereAsrPreTrainedModel,
  I2 as CohereAsrProcessor,
  mE as CohereAsrTokenizer,
  jS as CohereForCausalLM,
  qS as CohereModel,
  Gl as CoherePreTrainedModel,
  fE as CohereTokenizer,
  JS as ConvBertForMaskedLM,
  eP as ConvBertForQuestionAnswering,
  ZS as ConvBertForSequenceClassification,
  KS as ConvBertForTokenClassification,
  YS as ConvBertModel,
  zn as ConvBertPreTrainedModel,
  gE as ConvBertTokenizer,
  U2 as ConvNextFeatureExtractor,
  rP as ConvNextForImageClassification,
  ng as ConvNextImageProcessor,
  tP as ConvNextModel,
  ql as ConvNextPreTrainedModel,
  aP as ConvNextV2ForImageClassification,
  nP as ConvNextV2Model,
  jl as ConvNextV2PreTrainedModel,
  lP as DFineForObjectDetection,
  oP as DFineModel,
  Hl as DFinePreTrainedModel,
  NP as DINOv3ConvNextModel,
  Jg as DINOv3ConvNextPreTrainedModel,
  W2 as DINOv3ViTImageProcessor,
  BP as DINOv3ViTModel,
  Zg as DINOv3ViTPreTrainedModel,
  Q2 as DPTFeatureExtractor,
  jP as DPTForDepthEstimation,
  ig as DPTImageProcessor,
  qP as DPTModel,
  ec as DPTPreTrainedModel,
  Wg as DacDecoderModel,
  qg as DacDecoderOutput,
  jg as DacEncoderModel,
  Ug as DacEncoderOutput,
  Hm as DacFeatureExtractor,
  cP as DacModel,
  Rs as DacPreTrainedModel,
  dP as DebertaForMaskedLM,
  _P as DebertaForQuestionAnswering,
  pP as DebertaForSequenceClassification,
  hP as DebertaForTokenClassification,
  uP as DebertaModel,
  Nn as DebertaPreTrainedModel,
  yE as DebertaTokenizer,
  bP as DebertaV2ForMaskedLM,
  MP as DebertaV2ForQuestionAnswering,
  vP as DebertaV2ForSequenceClassification,
  xP as DebertaV2ForTokenClassification,
  yP as DebertaV2Model,
  Bn as DebertaV2PreTrainedModel,
  wE as DebertaV2Tokenizer,
  kP as DecisionTransformerModel,
  Hg as DecisionTransformerPreTrainedModel,
  mP as DeepseekV3ForCausalLM,
  fP as DeepseekV3Model,
  Ql as DeepseekV3PreTrainedModel,
  wP as DeepseekV4ForCausalLM,
  gP as DeepseekV4Model,
  Xl as DeepseekV4PreTrainedModel,
  q2 as DeiTFeatureExtractor,
  EP as DeiTForImageClassification,
  ag as DeiTImageProcessor,
  TP as DeiTModel,
  Yl as DeiTPreTrainedModel,
  AP as DepthAnythingForDepthEstimation,
  Qg as DepthAnythingPreTrainedModel,
  GN as DepthEstimationPipeline,
  CP as DepthProForDepthEstimation,
  Xg as DepthProPreTrainedModel,
  j2 as DetrFeatureExtractor,
  PP as DetrForObjectDetection,
  FP as DetrForSegmentation,
  sg as DetrImageProcessor,
  SP as DetrModel,
  Jl as DetrObjectDetectionOutput,
  Gs as DetrPreTrainedModel,
  Yg as DetrSegmentationOutput,
  LP as Dinov2ForImageClassification,
  IP as Dinov2Model,
  Zl as Dinov2PreTrainedModel,
  zP as Dinov2WithRegistersForImageClassification,
  OP as Dinov2WithRegistersModel,
  Kl as Dinov2WithRegistersPreTrainedModel,
  VP as DistilBertForMaskedLM,
  GP as DistilBertForQuestionAnswering,
  DP as DistilBertForSequenceClassification,
  RP as DistilBertForTokenClassification,
  $P as DistilBertModel,
  $n as DistilBertPreTrainedModel,
  bE as DistilBertTokenizer,
  DN as DocumentQuestionAnsweringPipeline,
  H2 as DonutFeatureExtractor,
  wl as DonutImageProcessor,
  UP as DonutSwinModel,
  Kg as DonutSwinPreTrainedModel,
  Ml as DynamicCache,
  cz as EdgeTamModel,
  HP as EfficientNetForImageClassification,
  X2 as EfficientNetImageProcessor,
  WP as EfficientNetModel,
  tc as EfficientNetPreTrainedModel,
  XP as ElectraForMaskedLM,
  ZP as ElectraForQuestionAnswering,
  YP as ElectraForSequenceClassification,
  JP as ElectraForTokenClassification,
  QP as ElectraModel,
  Dn as ElectraPreTrainedModel,
  vE as ElectraTokenizer,
  jm as EncodecFeatureExtractor,
  RC as EosTokenCriteria,
  eF as Ernie4_5ForCausalLM,
  KP as Ernie4_5Model,
  rc as Ernie4_5PretrainedModel,
  rF as EsmForMaskedLM,
  nF as EsmForSequenceClassification,
  aF as EsmForTokenClassification,
  tF as EsmModel,
  ka as EsmPreTrainedModel,
  xE as EsmTokenizer,
  iF as EuroBertForMaskedLM,
  oF as EuroBertForSequenceClassification,
  lF as EuroBertForTokenClassification,
  sF as EuroBertModel,
  Ta as EuroBertPreTrainedModel,
  uF as ExaoneForCausalLM,
  cF as ExaoneModel,
  nc as ExaonePreTrainedModel,
  pF as FalconForCausalLM,
  _F as FalconH1ForCausalLM,
  hF as FalconH1Model,
  sc as FalconH1PreTrainedModel,
  dF as FalconModel,
  ac as FalconPreTrainedModel,
  ME as FalconTokenizer,
  mF as FastViTForImageClassification,
  fF as FastViTModel,
  ic as FastViTPreTrainedModel,
  VN as FeatureExtractionPipeline,
  dt as FeatureExtractor,
  kN as FillMaskPipeline,
  gF as Florence2ForConditionalGeneration,
  ew as Florence2PreTrainedModel,
  LA as Florence2Processor,
  CC as ForcedBOSTokenLogitsProcessor,
  SC as ForcedEOSTokenLogitsProcessor,
  eA as GLPNFeatureExtractor,
  OF as GLPNForDepthEstimation,
  LF as GLPNModel,
  _c as GLPNPreTrainedModel,
  qF as GPT2LMHeadModel,
  UF as GPT2Model,
  yc as GPT2PreTrainedModel,
  EE as GPT2Tokenizer,
  NF as GPTBigCodeForCausalLM,
  zF as GPTBigCodeModel,
  fc as GPTBigCodePreTrainedModel,
  WF as GPTJForCausalLM,
  jF as GPTJModel,
  bc as GPTJPreTrainedModel,
  $F as GPTNeoForCausalLM,
  BF as GPTNeoModel,
  mc as GPTNeoPreTrainedModel,
  RF as GPTNeoXForCausalLM,
  DF as GPTNeoXModel,
  gc as GPTNeoXPreTrainedModel,
  TE as GPTNeoXTokenizer,
  vF as Gemma2ForCausalLM,
  bF as Gemma2Model,
  lc as Gemma2PreTrainedModel,
  TF as Gemma3ForCausalLM,
  nw as Gemma3ForConditionalGeneration,
  Y2 as Gemma3ImageProcessor,
  kF as Gemma3Model,
  rw as Gemma3PreTrainedModel,
  OA as Gemma3Processor,
  Qm as Gemma3nAudioFeatureExtractor,
  EF as Gemma3nForCausalLM,
  Vs as Gemma3nForConditionalGeneration,
  aw as Gemma3nPreTrainedModel,
  zA as Gemma3nProcessor,
  Xm as Gemma4AudioFeatureExtractor,
  AF as Gemma4ForCausalLM,
  cc as Gemma4ForConditionalGeneration,
  og as Gemma4ImageProcessor,
  NA as Gemma4Processor,
  yF as GemmaForCausalLM,
  wF as GemmaModel,
  oc as GemmaPreTrainedModel,
  kE as GemmaTokenizer,
  Eg as GenerationConfig,
  K2 as Glm46VImageProcessor,
  BA as Glm46VProcessor,
  SF as GlmForCausalLM,
  CF as GlmModel,
  FF as GlmMoeDsaForCausalLM,
  PF as GlmMoeDsaModel,
  dc as GlmMoeDsaPreTrainedModel,
  IF as GlmOcrForConditionalGeneration,
  uc as GlmPreTrainedModel,
  VF as GptOssForCausalLM,
  GF as GptOssModel,
  wc as GptOssPreTrainedModel,
  QF as GraniteForCausalLM,
  HF as GraniteModel,
  YF as GraniteMoeHybridForCausalLM,
  XF as GraniteMoeHybridModel,
  xc as GraniteMoeHybridPreTrainedModel,
  vc as GranitePreTrainedModel,
  v2 as GraniteSpeechFeatureExtractor,
  JF as GraniteSpeechForConditionalGeneration,
  $A as GraniteSpeechProcessor,
  ZF as GroundingDinoForObjectDetection,
  tA as GroundingDinoImageProcessor,
  cw as GroundingDinoPreTrainedModel,
  RA as GroundingDinoProcessor,
  KF as GroupViTModel,
  uw as GroupViTPreTrainedModel,
  tI as HeliumForCausalLM,
  eI as HeliumModel,
  kc as HeliumPreTrainedModel,
  AE as HerbertTokenizer,
  nI as HieraForImageClassification,
  rI as HieraModel,
  Tc as HieraPreTrainedModel,
  sI as HrmTextForCausalLM,
  aI as HrmTextModel,
  Ec as HrmTextPreTrainedModel,
  pI as HubertForCTC,
  hI as HubertForSequenceClassification,
  dI as HubertModel,
  uI as HubertPreTrainedModel,
  fI as HunYuanDenseV1ForCausalLM,
  _I as HunYuanDenseV1Model,
  Ac as HunYuanDenseV1PreTrainedModel,
  gI as IJepaForImageClassification,
  mI as IJepaModel,
  Cc as IJepaPreTrainedModel,
  dw as Idefics3ForConditionalGeneration,
  Ef as Idefics3ImageProcessor,
  Cf as Idefics3Processor,
  ON as ImageClassificationPipeline,
  UN as ImageFeatureExtractionPipeline,
  ue as ImageFeatureExtractor,
  kg as ImageMattingOutput,
  ue as ImageProcessor,
  Fy as ImageSegmentationPipeline,
  RN as ImageToImagePipeline,
  LN as ImageToTextPipeline,
  h$ as InterruptableStoppingCriteria,
  yI as JAISLMHeadModel,
  wI as JAISModel,
  Sc as JAISPreTrainedModel,
  nA as JinaCLIPImageProcessor,
  bI as JinaCLIPModel,
  Us as JinaCLIPPreTrainedModel,
  jA as JinaCLIPProcessor,
  pw as JinaCLIPTextModel,
  vI as JinaCLIPVisionModel,
  MI as Lfm2ForCausalLM,
  xI as Lfm2Model,
  EI as Lfm2MoeForCausalLM,
  TI as Lfm2MoeModel,
  Fc as Lfm2MoePreTrainedModel,
  Pc as Lfm2PreTrainedModel,
  AI as Lfm2VlForConditionalGeneration,
  lA as Lfm2VlImageProcessor,
  WA as Lfm2VlProcessor,
  kI as LightOnOcrForConditionalGeneration,
  P3 as LiteWhisperForConditionalGeneration,
  PI as Llama4ForCausalLM,
  hw as Llama4PreTrainedModel,
  SI as LlamaForCausalLM,
  CI as LlamaModel,
  Ic as LlamaPreTrainedModel,
  CE as LlamaTokenizer,
  rr as LlavaForConditionalGeneration,
  rr as LlavaOnevisionForConditionalGeneration,
  cA as LlavaOnevisionImageProcessor,
  tw as LlavaPreTrainedModel,
  HA as LlavaProcessor,
  MF as LlavaQwen2ForCausalLM,
  Bt as LogLevel,
  jt as LogitsProcessor,
  Qo as LogitsProcessorList,
  xl as LogitsWarper,
  II as LongT5ForConditionalGeneration,
  FI as LongT5Model,
  Lc as LongT5PreTrainedModel,
  OI as M2M100ForConditionalGeneration,
  LI as M2M100Model,
  Oc as M2M100PreTrainedModel,
  SE as M2M100Tokenizer,
  FE as MBart50Tokenizer,
  VI as MBartForCausalLM,
  RI as MBartForConditionalGeneration,
  GI as MBartForSequenceClassification,
  DI as MBartModel,
  Ea as MBartPreTrainedModel,
  Bm as MBartTokenizer,
  LL as MPNetForMaskedLM,
  NL as MPNetForQuestionAnswering,
  OL as MPNetForSequenceClassification,
  zL as MPNetForTokenClassification,
  IL as MPNetModel,
  Rn as MPNetPreTrainedModel,
  OE as MPNetTokenizer,
  RL as MT5ForConditionalGeneration,
  DL as MT5Model,
  Hc as MT5PreTrainedModel,
  NI as MarianMTModel,
  zI as MarianModel,
  zc as MarianPreTrainedModel,
  PE as MarianTokenizer,
  dA as Mask2FormerImageProcessor,
  uA as MaskFormerFeatureExtractor,
  $I as MaskFormerForInstanceSegmentation,
  yl as MaskFormerImageProcessor,
  BI as MaskFormerModel,
  Nc as MaskFormerPreTrainedModel,
  Xe as MaskedLMOutput,
  DC as MaxLengthCriteria,
  UI as Metric3DForDepthEstimation,
  _w as Metric3DPreTrainedModel,
  qI as Metric3Dv2ForDepthEstimation,
  fw as Metric3Dv2PreTrainedModel,
  jI as MgpstrForSceneTextRecognition,
  mw as MgpstrModelOutput,
  gw as MgpstrPreTrainedModel,
  QA as MgpstrProcessor,
  IE as MgpstrTokenizer,
  vw as MimiDecoderModel,
  yw as MimiDecoderOutput,
  bw as MimiEncoderModel,
  ww as MimiEncoderOutput,
  WI as MimiModel,
  qs as MimiPreTrainedModel,
  OC as MinLengthLogitsProcessor,
  zC as MinNewTokensLengthLogitsProcessor,
  YI as Ministral3ForCausalLM,
  XI as Ministral3Model,
  $c as Ministral3PreTrainedModel,
  QI as MinistralForCausalLM,
  HI as MinistralModel,
  Bc as MinistralPreTrainedModel,
  KI as Mistral3ForConditionalGeneration,
  tL as Mistral4ForCausalLM,
  eL as Mistral4Model,
  Rc as Mistral4PreTrainedModel,
  ZI as MistralForCausalLM,
  JI as MistralModel,
  Dc as MistralPreTrainedModel,
  nL as MobileBertForMaskedLM,
  sL as MobileBertForQuestionAnswering,
  aL as MobileBertForSequenceClassification,
  rL as MobileBertModel,
  Aa as MobileBertPreTrainedModel,
  LE as MobileBertTokenizer,
  oL as MobileLLMForCausalLM,
  iL as MobileLLMModel,
  Gc as MobileLLMPreTrainedModel,
  pA as MobileNetV1FeatureExtractor,
  cL as MobileNetV1ForImageClassification,
  uL as MobileNetV1ForSemanticSegmentation,
  cg as MobileNetV1ImageProcessor,
  lL as MobileNetV1Model,
  js as MobileNetV1PreTrainedModel,
  hA as MobileNetV2FeatureExtractor,
  pL as MobileNetV2ForImageClassification,
  hL as MobileNetV2ForSemanticSegmentation,
  ug as MobileNetV2ImageProcessor,
  dL as MobileNetV2Model,
  Ws as MobileNetV2PreTrainedModel,
  _A as MobileNetV3FeatureExtractor,
  fL as MobileNetV3ForImageClassification,
  mL as MobileNetV3ForSemanticSegmentation,
  dg as MobileNetV3ImageProcessor,
  _L as MobileNetV3Model,
  Hs as MobileNetV3PreTrainedModel,
  fA as MobileNetV4FeatureExtractor,
  wL as MobileNetV4ForImageClassification,
  yL as MobileNetV4ForSemanticSegmentation,
  pg as MobileNetV4ImageProcessor,
  gL as MobileNetV4Model,
  Qs as MobileNetV4PreTrainedModel,
  mA as MobileViTFeatureExtractor,
  vL as MobileViTForImageClassification,
  hg as MobileViTImageProcessor,
  bL as MobileViTModel,
  Vc as MobileViTPreTrainedModel,
  ML as MobileViTV2ForImageClassification,
  xL as MobileViTV2Model,
  Uc as MobileViTV2PreTrainedModel,
  Do as ModelFileNotFoundError,
  Ge as ModelOutput,
  T$ as ModelRegistry,
  SL as ModernBertDecoderForCausalLM,
  CL as ModernBertDecoderModel,
  qc as ModernBertDecoderPreTrainedModel,
  TL as ModernBertForMaskedLM,
  EL as ModernBertForSequenceClassification,
  AL as ModernBertForTokenClassification,
  kL as ModernBertModel,
  Ca as ModernBertPreTrainedModel,
  xF as Moondream1ForConditionalGeneration,
  x2 as MoonshineFeatureExtractor,
  FL as MoonshineForConditionalGeneration,
  PL as MoonshineModel,
  jc as MoonshinePreTrainedModel,
  XA as MoonshineProcessor,
  $L as MptForCausalLM,
  BL as MptModel,
  Wc as MptPreTrainedModel,
  GL as MultiModalityCausalLM,
  xw as MultiModalityPreTrainedModel,
  UL as MusicgenForCausalLM,
  Mw as MusicgenForConditionalGeneration,
  VL as MusicgenModel,
  Qc as MusicgenPreTrainedModel,
  jL as NanoChatForCausalLM,
  qL as NanoChatModel,
  Xc as NanoChatPreTrainedModel,
  HL as NemotronHForCausalLM,
  WL as NemotronHModel,
  Yc as NemotronHPreTrainedModel,
  XL as NeoBertForMaskedLM,
  ZL as NeoBertForQuestionAnswering,
  YL as NeoBertForSequenceClassification,
  JL as NeoBertForTokenClassification,
  QL as NeoBertModel,
  Gn as NeoBertPreTrainedModel,
  zE as NllbTokenizer,
  NC as NoBadWordsLogitsProcessor,
  IC as NoRepeatNGramLogitsProcessor,
  KL as NomicBertModel,
  kw as NomicBertPreTrainedModel,
  gA as NougatImageProcessor,
  NE as NougatTokenizer,
  hO as OPTForCausalLM,
  pO as OPTModel,
  nu as OPTPreTrainedModel,
  BN as ObjectDetectionPipeline,
  nO as Olmo2ForCausalLM,
  rO as Olmo2Model,
  Zc as Olmo2PreTrainedModel,
  sO as Olmo3ForCausalLM,
  aO as Olmo3Model,
  Kc as Olmo3PreTrainedModel,
  tO as OlmoForCausalLM,
  oO as OlmoHybridForCausalLM,
  iO as OlmoHybridModel,
  eu as OlmoHybridPreTrainedModel,
  eO as OlmoModel,
  Jc as OlmoPreTrainedModel,
  cO as OpenAIPrivacyFilterForTokenClassification,
  lO as OpenAIPrivacyFilterModel,
  tu as OpenAIPrivacyFilterPreTrainedModel,
  dO as OpenELMForCausalLM,
  uO as OpenELMModel,
  ru as OpenELMPreTrainedModel,
  wA as OwlViTFeatureExtractor,
  gO as OwlViTForObjectDetection,
  bl as OwlViTImageProcessor,
  mO as OwlViTModel,
  su as OwlViTPreTrainedModel,
  YA as OwlViTProcessor,
  fO as Owlv2ForObjectDetection,
  yA as Owlv2ImageProcessor,
  _O as Owlv2Model,
  au as Owlv2PreTrainedModel,
  wO as PaliGemmaForConditionalGeneration,
  ZA as PaliGemmaProcessor,
  Wm as ParakeetFeatureExtractor,
  yO as ParakeetForCTC,
  Tw as ParakeetPreTrainedModel,
  vO as PatchTSMixerForPrediction,
  bO as PatchTSMixerModel,
  iu as PatchTSMixerPreTrainedModel,
  MO as PatchTSTForPrediction,
  xO as PatchTSTModel,
  ou as PatchTSTPreTrainedModel,
  AO as Phi3ForCausalLM,
  EO as Phi3Model,
  cu as Phi3PreTrainedModel,
  Aw as Phi3VForCausalLM,
  vA as Phi3VImageProcessor,
  Ew as Phi3VPreTrainedModel,
  eC as Phi3VProcessor,
  TO as PhiForCausalLM,
  kO as PhiModel,
  lu as PhiPreTrainedModel,
  xA as PixtralImageProcessor,
  tC as PixtralProcessor,
  I as PreTrainedModel,
  ie as PreTrainedTokenizer,
  Wo as PretrainedConfig,
  Ce as Processor,
  SO as PvtForImageClassification,
  MA as PvtImageProcessor,
  CO as PvtModel,
  uu as PvtPreTrainedModel,
  Ym as PyAnnoteFeatureExtractor,
  FO as PyAnnoteForAudioFrameClassification,
  PO as PyAnnoteModel,
  du as PyAnnotePreTrainedModel,
  rC as PyAnnoteProcessor,
  ot as QuestionAnsweringModelOutput,
  MN as QuestionAnsweringPipeline,
  LO as Qwen2ForCausalLM,
  IO as Qwen2Model,
  zO as Qwen2MoeForCausalLM,
  OO as Qwen2MoeModel,
  hu as Qwen2MoePreTrainedModel,
  pu as Qwen2PreTrainedModel,
  BE as Qwen2Tokenizer,
  iw as Qwen2VLForCausalLM,
  pc as Qwen2VLForConditionalGeneration,
  lg as Qwen2VLImageProcessor,
  sw as Qwen2VLPreTrainedModel,
  vl as Qwen2VLProcessor,
  ow as Qwen2_5_VLForCausalLM,
  hc as Qwen2_5_VLForConditionalGeneration,
  wg as Qwen2_5_VLProcessor,
  BO as Qwen3ForCausalLM,
  NO as Qwen3Model,
  DO as Qwen3MoeForCausalLM,
  $O as Qwen3MoeModel,
  fu as Qwen3MoePreTrainedModel,
  GO as Qwen3NextForCausalLM,
  RO as Qwen3NextModel,
  mu as Qwen3NextPreTrainedModel,
  _u as Qwen3PreTrainedModel,
  Cw as Qwen3VLForCausalLM,
  gu as Qwen3VLForConditionalGeneration,
  UO as Qwen3VLMoeForCausalLM,
  VO as Qwen3VLMoeForConditionalGeneration,
  nC as Qwen3VLProcessor,
  Sw as Qwen3_5ForCausalLM,
  wu as Qwen3_5ForConditionalGeneration,
  jO as Qwen3_5MoeForCausalLM,
  qO as Qwen3_5MoeForConditionalGeneration,
  XO as RFDetrForObjectDetection,
  QO as RFDetrModel,
  Pw as RFDetrObjectDetectionOutput,
  bu as RFDetrPreTrainedModel,
  iP as RTDetrForObjectDetection,
  kA as RTDetrImageProcessor,
  sP as RTDetrModel,
  Ma as RTDetrObjectDetectionOutput,
  Wl as RTDetrPreTrainedModel,
  oz as RTDetrV2ForObjectDetection,
  iz as RTDetrV2Model,
  Fw as RTDetrV2ObjectDetectionOutput,
  vu as RTDetrV2PreTrainedModel,
  f2 as RawAudio,
  kt as RawImage,
  HN as RawVideo,
  Oy as RawVideoFrame,
  LC as RepetitionPenaltyLogitsProcessor,
  HO as ResNetForImageClassification,
  WO as ResNetModel,
  yu as ResNetPreTrainedModel,
  rz as RoFormerForMaskedLM,
  sz as RoFormerForQuestionAnswering,
  nz as RoFormerForSequenceClassification,
  az as RoFormerForTokenClassification,
  tz as RoFormerModel,
  Un as RoFormerPreTrainedModel,
  DE as RoFormerTokenizer,
  JO as RobertaForMaskedLM,
  ez as RobertaForQuestionAnswering,
  ZO as RobertaForSequenceClassification,
  KO as RobertaForTokenClassification,
  YO as RobertaModel,
  Vn as RobertaPreTrainedModel,
  $E as RobertaTokenizer,
  Lo as Sam2ImageProcessor,
  Ow as Sam2ImageSegmentationOutput,
  xu as Sam2Model,
  zw as Sam2PreTrainedModel,
  bg as Sam2Processor,
  aC as Sam2VideoProcessor,
  Lo as Sam3ImageProcessor,
  uz as Sam3TrackerModel,
  Lo as SamImageProcessor,
  Iw as SamImageSegmentationOutput,
  lz as SamModel,
  Lw as SamPreTrainedModel,
  yg as SamProcessor,
  TA as SapiensFeatureExtractor,
  pz as SapiensForDepthEstimation,
  hz as SapiensForNormalEstimation,
  dz as SapiensForSemanticSegmentation,
  _g as SapiensImageProcessor,
  Xs as SapiensPreTrainedModel,
  M2 as SeamlessM4TFeatureExtractor,
  EA as SegformerFeatureExtractor,
  fz as SegformerForImageClassification,
  mz as SegformerForSemanticSegmentation,
  fg as SegformerImageProcessor,
  _z as SegformerModel,
  Ys as SegformerPreTrainedModel,
  AC as Seq2SeqLMOutput,
  ne as SequenceClassifierOutput,
  AA as SiglipImageProcessor,
  gz as SiglipModel,
  Mu as SiglipPreTrainedModel,
  Nw as SiglipTextModel,
  RE as SiglipTokenizer,
  wz as SiglipVisionModel,
  bz as SmolLM3ForCausalLM,
  yz as SmolLM3Model,
  ku as SmolLM3PreTrainedModel,
  vz as SmolVLMForConditionalGeneration,
  Ef as SmolVLMImageProcessor,
  Cf as SmolVLMProcessor,
  $w as SnacDecoderModel,
  Bw as SnacEncoderModel,
  k2 as SnacFeatureExtractor,
  xz as SnacModel,
  Js as SnacPreTrainedModel,
  kz as SolarOpenForCausalLM,
  Mz as SolarOpenModel,
  Tu as SolarOpenPreTrainedModel,
  T2 as SpeechT5FeatureExtractor,
  Ez as SpeechT5ForSpeechToText,
  Az as SpeechT5ForTextToSpeech,
  Cz as SpeechT5HifiGan,
  Tz as SpeechT5Model,
  Zs as SpeechT5PreTrainedModel,
  sC as SpeechT5Processor,
  GE as SpeechT5Tokenizer,
  Pz as SqueezeBertForMaskedLM,
  Iz as SqueezeBertForQuestionAnswering,
  Fz as SqueezeBertForSequenceClassification,
  Sz as SqueezeBertModel,
  Sa as SqueezeBertPreTrainedModel,
  VE as SqueezeBertTokenizer,
  Oz as StableLmForCausalLM,
  Lz as StableLmModel,
  Eu as StableLmPreTrainedModel,
  Nz as Starcoder2ForCausalLM,
  zz as Starcoder2Model,
  Au as Starcoder2PreTrainedModel,
  ba as StoppingCriteria,
  Ag as StoppingCriteriaList,
  Bz as StyleTextToSpeech2Model,
  Dw as StyleTextToSpeech2PreTrainedModel,
  TN as SummarizationPipeline,
  Gw as SupertonicForConditionalGeneration,
  Rw as SupertonicPreTrainedModel,
  Tg as SuppressTokensAtBeginLogitsProcessor,
  PC as SuppressTokensLogitsProcessor,
  Vz as Swin2SRForImageSuperResolution,
  CA as Swin2SRImageProcessor,
  Gz as Swin2SRModel,
  Cu as Swin2SRPreTrainedModel,
  Dz as SwinForImageClassification,
  Rz as SwinForSemanticSegmentation,
  $z as SwinModel,
  Ks as SwinPreTrainedModel,
  qz as T5ForConditionalGeneration,
  Uz as T5Model,
  Su as T5PreTrainedModel,
  UE as T5Tokenizer,
  Wz as TableTransformerForObjectDetection,
  jz as TableTransformerModel,
  Vw as TableTransformerObjectDetectionOutput,
  Pu as TableTransformerPreTrainedModel,
  $C as TemperatureLogitsWarper,
  V as Tensor,
  $u as Text2TextGenerationPipeline,
  yN as TextClassificationPipeline,
  AN as TextGenerationPipeline,
  WN as TextStreamer,
  IN as TextToAudioPipeline,
  bN as TokenClassificationPipeline,
  He as TokenClassifierOutput,
  ie as TokenizersBackend,
  p$ as TopKLogitsWarper,
  d$ as TopPLogitsWarper,
  Hz as TrOCRForCausalLM,
  Uw as TrOCRPreTrainedModel,
  EN as TranslationPipeline,
  Mc as UltravoxModel,
  lw as UltravoxPreTrainedModel,
  iC as UltravoxProcessor,
  Xz as UniSpeechForCTC,
  Yz as UniSpeechForSequenceClassification,
  Qz as UniSpeechModel,
  ei as UniSpeechPreTrainedModel,
  e3 as UniSpeechSatForAudioFrameClassification,
  Zz as UniSpeechSatForCTC,
  Kz as UniSpeechSatForSequenceClassification,
  Jz as UniSpeechSatModel,
  Pa as UniSpeechSatPreTrainedModel,
  qA as VLChatProcessor,
  rA as VLMImageProcessor,
  r3 as VaultGemmaForCausalLM,
  t3 as VaultGemmaModel,
  Fu as VaultGemmaPreTrainedModel,
  SA as ViTFeatureExtractor,
  s3 as ViTForImageClassification,
  mg as ViTImageProcessor,
  i3 as ViTMAEModel,
  qw as ViTMAEPreTrainedModel,
  l3 as ViTMSNForImageClassification,
  o3 as ViTMSNModel,
  Lu as ViTMSNPreTrainedModel,
  a3 as ViTModel,
  Iu as ViTPreTrainedModel,
  n3 as VisionEncoderDecoderModel,
  c3 as VitMatteForImageMatting,
  PA as VitMatteImageProcessor,
  jw as VitMattePreTrainedModel,
  u3 as VitPoseForPoseEstimation,
  FA as VitPoseImageProcessor,
  Ww as VitPosePreTrainedModel,
  d3 as VitsModel,
  Hw as VitsModelOutput,
  Qw as VitsPreTrainedModel,
  jE as VitsTokenizer,
  p3 as VoxtralForConditionalGeneration,
  uC as VoxtralProcessor,
  C2 as VoxtralRealtimeFeatureExtractor,
  Yw as VoxtralRealtimeForConditionalGeneration,
  Xw as VoxtralRealtimePreTrainedModel,
  hC as VoxtralRealtimeProcessor,
  b3 as Wav2Vec2BertForCTC,
  v3 as Wav2Vec2BertForSequenceClassification,
  y3 as Wav2Vec2BertModel,
  ti as Wav2Vec2BertPreTrainedModel,
  WE as Wav2Vec2CTCTokenizer,
  E2 as Wav2Vec2FeatureExtractor,
  cI as Wav2Vec2ForAudioFrameClassification,
  oI as Wav2Vec2ForCTC,
  lI as Wav2Vec2ForSequenceClassification,
  iI as Wav2Vec2Model,
  Or as Wav2Vec2PreTrainedModel,
  _C as Wav2Vec2Processor,
  fC as Wav2Vec2ProcessorWithLM,
  E3 as WavLMForAudioFrameClassification,
  M3 as WavLMForCTC,
  k3 as WavLMForSequenceClassification,
  T3 as WavLMForXVector,
  x3 as WavLMModel,
  qn as WavLMPreTrainedModel,
  A2 as WeSpeakerFeatureExtractor,
  A3 as WeSpeakerResNetModel,
  Zw as WeSpeakerResNetPreTrainedModel,
  S2 as WhisperFeatureExtractor,
  Kw as WhisperForConditionalGeneration,
  S3 as WhisperModel,
  Ou as WhisperPreTrainedModel,
  mC as WhisperProcessor,
  M$ as WhisperTextStreamer,
  FC as WhisperTimeStampLogitsProcessor,
  JE as WhisperTokenizer,
  z3 as XLMForQuestionAnswering,
  L3 as XLMForSequenceClassification,
  O3 as XLMForTokenClassification,
  F3 as XLMModel,
  jn as XLMPreTrainedModel,
  B3 as XLMRobertaForMaskedLM,
  R3 as XLMRobertaForQuestionAnswering,
  $3 as XLMRobertaForSequenceClassification,
  D3 as XLMRobertaForTokenClassification,
  N3 as XLMRobertaModel,
  Wn as XLMRobertaPreTrainedModel,
  ZE as XLMRobertaTokenizer,
  KE as XLMTokenizer,
  I3 as XLMWithLMHeadModel,
  Jw as XVectorOutput,
  IA as YolosFeatureExtractor,
  V3 as YolosForObjectDetection,
  gg as YolosImageProcessor,
  G3 as YolosModel,
  ey as YolosObjectDetectionOutput,
  zu as YolosPreTrainedModel,
  q3 as YoutuForCausalLM,
  U3 as YoutuModel,
  Nu as YoutuPreTrainedModel,
  W3 as ZayaForCausalLM,
  j3 as ZayaModel,
  Bu as ZayaPreTrainedModel,
  PN as ZeroShotAudioClassificationPipeline,
  CN as ZeroShotClassificationPipeline,
  NN as ZeroShotImageClassificationPipeline,
  $N as ZeroShotObjectDetectionPipeline,
  Ne as cat,
  s$ as cos_sim,
  IT as dot,
  we as env,
  ut as full,
  Uo as full_like,
  Fm as interpolate,
  Gt as interpolate_4d,
  l$ as layer_norm,
  a2 as load_audio,
  u$ as load_image,
  k$ as load_video,
  FT as log_softmax,
  JT as matmul,
  cl as mean,
  ZT as mean_pooling,
  mt as ones,
  dl as ones_like,
  YT as permute,
  x$ as pipeline,
  eE as quantize_embeddings,
  c$ as rand,
  KT as randn,
  Ls as random,
  s2 as read_audio,
  o$ as rfft,
  Im as slice,
  st as softmax,
  hr as stack,
  Lm as std_mean,
  In as topk,
  Om as zeros,
  pl as zeros_like
};
/*! Bundled license information:

onnxruntime-web/dist/ort.webgpu.bundle.min.mjs:
  (*!
   * ONNX Runtime Web v1.31.0-dev.20260914-8d85527a0
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)
*/
