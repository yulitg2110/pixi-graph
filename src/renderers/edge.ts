import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import '@pixi/mixin-get-child-by-name';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import { IPointData } from '@pixi/math';

import { colorToPixi } from '../utils/color';
import { EdgeStyle, NodeStyle } from '../utils/style';
import { getQuadraticAngle, getQuadraticBezierXY, getQuadraticStartEndPoint } from '../utils/bezier';
import { TextureCache } from '../texture-cache';

// const DELIMETER = '::';
// const WHITE = 0xffffff;

const EDGE_LINE = 'EDGE_LINE';
const EDGE_ARROW = 'EDGE_ARROW';

const EDGE_CURVE = 'EDGE_CURVE';
const EDGE_CURVE_ARROW = 'EDGE_CURVE_ARROW';

const ARROW_SIZE = 6;

export function createEdge(edgeGfx: Container) {
  // edgeGfx -> edgeLine
  const edgeLine = new Sprite(Texture.WHITE);
  edgeLine.name = EDGE_LINE;
  edgeLine.anchor.set(0.5);
  edgeGfx.addChild(edgeLine);

  // edgeGfx -> edgeArrow
  const edgeArrow = new Graphics();
  edgeArrow.name = EDGE_ARROW;
  edgeGfx.addChild(edgeArrow);

  // edgeGfx -> edgeCurve
  const edgeCurve = new Graphics();
  edgeCurve.name = EDGE_CURVE;
  edgeGfx.addChild(edgeCurve);

  // edgeGfx -> edgeArrow
  const edgeCurveArrow = new Graphics();
  edgeCurveArrow.name = EDGE_CURVE_ARROW;
  edgeGfx.addChild(edgeCurveArrow);
}

export function updatePosition(
  edgeGfx: Container,
  sourceNodePosition: IPointData,
  targetNodePosition: IPointData,
  nodeStyle: NodeStyle,
  edgeStyle: EdgeStyle,
  isDirected: boolean,
  parallelSeq: number,
  parallelEdgeCount: number
) {
  const nodeSize = nodeStyle.size;
  const [color, alpha] = colorToPixi(edgeStyle.color);

  const length = Math.hypot(targetNodePosition.x - sourceNodePosition.x, targetNodePosition.y - sourceNodePosition.y);

  // edgeGfx -> edgeArrow
  if (parallelEdgeCount <= 1 || (parallelEdgeCount % 2 === 1 && parallelSeq === 1)) {
    // edgeGfx -> edgeLine
    const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as Sprite;
    edgeLine.width = length;

    if (isDirected) {
      const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as Graphics;
      edgeArrow.x = length / 2 - nodeSize;
      edgeArrow.beginFill(color, alpha, true);
      edgeArrow.moveTo(-ARROW_SIZE * 2, -ARROW_SIZE);
      edgeArrow.lineTo(0, 0);
      edgeArrow.lineTo(-ARROW_SIZE * 2, ARROW_SIZE);
      edgeArrow.lineTo(-ARROW_SIZE * 2, -ARROW_SIZE);
      edgeArrow.closePath();
      edgeArrow.endFill();
    }
  } else {
    // edgeGfx -> edgeCurve
    const edgeCurve = edgeGfx.getChildByName!(EDGE_CURVE) as Graphics;

    const dir = parallelSeq % 2 === 0 ? 1 : -1;

    const { sx, sy, ex, ey } = getQuadraticStartEndPoint(
      nodeSize,
      5 * (parallelSeq / 2) * dir,
      -length / 2,
      0,
      length / 2,
      0
    );
    const curveHeight = length * 0.1 * (parallelSeq / 2) * dir + sy;

    // only do clear when node position changed
    edgeCurve.clear();
    edgeCurve.lineStyle({ width: 1, color, alpha });
    edgeCurve.moveTo(sx, sy);
    edgeCurve.quadraticCurveTo(0, curveHeight, ex, ey);

    // edgeGfx -> edgeCurveArrow
    const edgeCurveArrow = edgeGfx.getChildByName!(EDGE_CURVE_ARROW) as Graphics;
    // only do clear when node position changed
    edgeCurveArrow.clear();
    const coord = getQuadraticBezierXY(1, sx, sy, 0, curveHeight, ex, ey);
    const angle = getQuadraticAngle(1, sx, sy, 0, curveHeight, ex, ey);

    edgeCurveArrow.x = coord.x;
    edgeCurveArrow.y = coord.y;
    edgeCurveArrow.rotation = angle;

    edgeCurveArrow.beginFill(color, alpha, true);
    edgeCurveArrow.moveTo(-ARROW_SIZE * 2, -ARROW_SIZE);
    edgeCurveArrow.lineTo(0, 0);
    edgeCurveArrow.lineTo(-ARROW_SIZE * 2, ARROW_SIZE);
    edgeCurveArrow.lineTo(-ARROW_SIZE * 2, -ARROW_SIZE);
    edgeCurveArrow.closePath();
    edgeCurveArrow.endFill();
  }
}

export function updateEdgeStyle(
  edgeGfx: Container,
  edgeStyle: EdgeStyle,
  _textureCache: TextureCache,
  _isDirected: boolean
) {
  // edgeGfx -> edgeLine
  const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as Sprite;
  edgeLine.height = edgeStyle.width;
  [edgeLine.tint, edgeLine.alpha] = colorToPixi(edgeStyle.color);

  // if (isDirected) {
  //   // edgeGfx -> edgeArrow
  //   const edgeArrowTextureKey = [EDGE_ARROW].join(DELIMETER);
  //   const edgeArrowTexture = textureCache.get(edgeArrowTextureKey, () => {
  //     const graphics = new Graphics();
  //     graphics.beginFill(WHITE, 1.0, true);

  //     graphics.moveTo(-ARROW_SIZE, -ARROW_SIZE);
  //     graphics.lineTo(ARROW_SIZE, 0);
  //     graphics.lineTo(-ARROW_SIZE, ARROW_SIZE);
  //     graphics.lineTo(-ARROW_SIZE, -ARROW_SIZE);
  //     graphics.closePath();
  //     graphics.endFill();

  //     return graphics;
  //   });

  //   const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as Sprite;
  //   edgeArrow.texture = edgeArrowTexture;
  //   [edgeArrow.tint, edgeArrow.alpha] = colorToPixi(edgeStyle.color);
  // }
}

// todo(lin)
// also needs to pass parallel information to here
export function updateEdgeVisibility(
  edgeGfx: Container,
  zoomStep: number,
  parallelEdgeCount: number,
  parallelSeq: number
) {
  if (parallelEdgeCount <= 1 || (parallelEdgeCount % 2 === 1 && parallelSeq === 1)) {
    // edgeGfx -> edgeLine
    const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as Sprite;
    edgeLine.visible = zoomStep >= 1;

    // edgeGFX -> edgeArrow
    const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as Sprite;
    edgeArrow.visible = zoomStep >= 3;
  } else {
    // edgeGfx -> edgeCurve
    const edgeCurve = edgeGfx.getChildByName!(EDGE_CURVE) as Graphics;
    edgeCurve.visible = zoomStep >= 1;

    // edgeGfx -> edgeCurveArrow
    const edgeCurveArrow = edgeGfx.getChildByName!(EDGE_CURVE_ARROW) as Graphics;
    edgeCurveArrow.visible = zoomStep >= 3;
  }
}

// 1 multi curve between nodes
//  curve start/end points and heights (based)
// 2 self loop
//    https://blogs.sitepointstatic.com/examples/tech/canvas-curves/bezier-curve.html
// 3 self loop + arrow

// 6 multi loop
// 7 hit testing (hover and click)
// 8 lod => curve to line when no detail needed

// https://codepen.io/IndependentSw/pen/mLZzGj
//  https://math.stackexchange.com/questions/885292/how-to-take-derivative-of-bezier-function
//  https://fr.khanacademy.org/computer-programming/beziertangenta-b-c-d-t/4736929853603840

// https://javascript.info/bezier-curve
// https://pomax.github.io/bezierinfo/
// https://pomax.github.io/bezierjs/
//   https://pomax.github.io/bezierinfo/#circleintersection
