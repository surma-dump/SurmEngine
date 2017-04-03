module.exports = (async function() {
  const {mat4} = await SystemJS.import('/gl-matrix.js');
  class Helpers {
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
        }
      };
    }

    static autosize(gl, f, opts = {density: window.devicePixelRatio}) {
      const ro = new ResizeObserver(entries => {
        const w = entries[0].contentRect.width * opts.density;
        const h = entries[0].contentRect.height * opts.density;
        gl.canvas.width = w;
        gl.canvas.height = h;
        gl.viewport(0, 0, w, h);
        f && f();
      });
      ro.observe(gl.canvas);
    }

    static logMatrix(m) {
      const t = mat4.transpose(mat4.create(), m);
      console.table([0, 1, 2, 3].map(i => t.slice(i*4, (i+1)*4)));
    }
  };

  return {Helpers};
})();
