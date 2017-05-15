export class Helpers {
  static loadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = _ => resolve(img);
      img.onerror = reject;
      img.src = path;
    });
  }

  static loop(f) {
    let last;
    let cntinue = true;
    function start() {
      last = performance.now();
      requestAnimationFrame(function x(ts) {
        f(ts - last);
        if (cntinue) requestAnimationFrame(x);
        last = ts;
      });
    }

    start();
    return {
      play() {
        cntinue = true;
        start();
      },
      pause() {
        cntinue = false;
      },
      get isPaused() {
        return !cntinue;
      },
      manual(delta) {
        if(!this.isPaused) return;
        f(delta);
      },
    };
  }

  static autosize(gl, f, opts = {density: window.devicePixelRatio}) {
    const update = function(w, h) {
      gl.canvas.width = w;
      gl.canvas.height = h;
      gl.viewport(0, 0, w, h);
      f && f();
    };
    const rect = gl.canvas.getBoundingClientRect();
    update(rect.width * opts.density, rect.height * opts.density);
    if(typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(entries => {
        const w = entries[0].contentRect.width * opts.density;
        const h = entries[0].contentRect.height * opts.density;
        update(w, h);
      });
      ro.observe(gl.canvas);
    }
  }

  static logMatrix(m) {
    const t = mat4.transpose(mat4.create(), m);
    console.table([0, 1, 2, 3].map(i => t.slice(i*4, (i+1)*4)));
  }
}
