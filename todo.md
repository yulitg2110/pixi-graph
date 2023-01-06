## foundation

1. edge label

   a. line

   b. parallel edge

   c. self loop

2. hit testing for curve edge

3. improve level of detail

   - fallback curve to line and remove self loop when zoom level is too small.

   - cull node first and then for visible nodes/edges and zoom level great than 1, we may switch to render with graphic instead of texture.

## layouts

1. move layout to web worker?
2. support interactive force layout?

- forceAtlas2
- egraph-forcelayout?
- webcloa?
- layout based on webgl/wgpu

may be need to update `updateNodeStyleByKey`, if we later use web worker to do layout

## performance

1.  should use graphic to generate the texture, so webgl only render texture(so we can render many nodes/edges), may be try to generate high resolution texture and scale down to specific width/height, so when zoom in, the texture is still looks good.

2.  fix performance bottleneck on cull(run javascript profile will show the current cull implementation have performance issue). maybe we should use [pixi-cull](https://github.com/davidfig/pixi-cull), but `pixi-cuss` have [issue](https://github.com/davidfig/pixi-cull/issues/2) to calculate bounding box when use rotation

3.  we may need to do some benchmark on interaction(hover/click), and check if we need to use quad tree to improve interaction performance

    a. https://jimkang.com/quadtreevis/

    b. https://www.cs.cmu.edu/~ckingsf/bioinfo-lectures/quadtrees.pdf

some references

- https://slides.com/nicolasjoseph/largescalevis
- https://www.html5gamedevs.com/topic/44255-performance-tips-for-large-scale-2d-graphing/
- https://medium.com/@bigtimebuddy/rendering-fast-graphics-with-pixijs-6f547895c08c
- https://medium.com/@bigtimebuddy/lets-talk-about-text-pixijs-244b9f95f830

## thumbnail

## graph editing

- add new nodes
- add new edges between edges

## refer

- https://github.com/graphology/graphology

- https://pixijs.io/guides/index.html
- https://medium.com/@sukantk3.4 // learn pixi

- https://github.com/pixijs/graphics-smooth
- https://github.com/davidfig/pixi-viewport
- https://github.com/Ameobea/spotifytrack

### bezier curve

- https://javascript.info/bezier-curve
- https://pomax.github.io/bezierinfo/
- https://pomax.github.io/bezierjs/
- https://pomax.github.io/bezierinfo/#circleintersection

### webgl/wgpu

- https://github.com/nblintao/ParaGraphL
- https://nblintao.github.io/ParaGraphL/
- http://www.vizitsolutions.com/portfolio/webgl/gpgpu/

- https://web.dev/gpu-compute/
- https://github.com/regl-project/regl/blob/gh-pages/example/graph.js
- https://surma.dev/things/webgpu/
- https://austin-eng.com/webgpu-samples
- https://gpuweb.github.io/gpuweb/explainer/
- https://github.com/mikbry/awesome-webgpu
- https://toji.github.io/webgpu-gltf-case-study/#who-this-document-is-for
