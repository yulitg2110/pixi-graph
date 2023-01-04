import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import '@pixi/mixin-get-child-by-name';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import { IPointData } from '@pixi/math';

import { colorToPixi } from '../utils/color';
import { EdgeStyle, NodeStyle } from '../utils/style';
import { getQuadraticAngle, getQuadraticBezierXY } from '../utils/bezier';
import { TextureCache } from '../texture-cache';

const DELIMETER = '::';
const WHITE = 0xffffff;

const EDGE_LINE = 'EDGE_LINE';
const EDGE_ARROW = 'EDGE_ARROW';

const EDGE_CURVE = 'EDGE_CURVE';
const EDGE_CURVE_ARROW = 'EDGE_CURVE_ARROW';

const ARROW_SIZE = 5;

export function createEdge(edgeGfx: Container) {
  // edgeGfx -> edgeLine
  const edgeLine = new Sprite(Texture.WHITE);
  edgeLine.name = EDGE_LINE;
  edgeLine.anchor.set(0.5);
  edgeGfx.addChild(edgeLine);

  // edgeGfx -> edgeArrow
  const edgeArrow = new Sprite();
  edgeArrow.name = EDGE_ARROW;
  edgeArrow.anchor.set(0.5);
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
  edgeStyle: EdgeStyle
) {
  const nodeSize = nodeStyle.size;

  // edgeGfx -> edgeLine
  const length = Math.hypot(targetNodePosition.x - sourceNodePosition.x, targetNodePosition.y - sourceNodePosition.y);
  const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as Sprite;
  edgeLine.height = length - nodeSize * 2 - 4;

  // edgeGfx -> edgeArrow
  const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as Sprite;
  edgeArrow.y = length / 2 - nodeSize - ARROW_SIZE - 1;

  // edgeGfx -> edgeCurve
  const edgeCurve = edgeGfx.getChildByName!(EDGE_CURVE) as Graphics;
  // only do clear when node position changed
  edgeCurve.clear();
  const [color, alpha] = colorToPixi(edgeStyle.color);
  edgeCurve.lineStyle({ width: 1, color, alpha });
  edgeCurve.moveTo(0, -length / 2);
  edgeCurve.quadraticCurveTo(100, 0, 0, length / 2);

  // edgeGfx -> edgeCurveArrow
  const edgeCurveArrow = edgeGfx.getChildByName!(EDGE_CURVE_ARROW) as Graphics;
  // only do clear when node position changed
  edgeCurveArrow.clear();
  const coord = getQuadraticBezierXY(0.2, 0, -length / 2, 100, 0, 0, length / 2);
  const angle = getQuadraticAngle(0.2, 0, -length / 2, 100, 0, 0, length / 2);

  edgeCurveArrow.x = coord.x;
  edgeCurveArrow.y = coord.y;
  edgeCurveArrow.rotation = angle;

  edgeCurveArrow.beginFill(color, alpha, true);
  edgeCurveArrow.moveTo(-10, -10);
  edgeCurveArrow.lineTo(10, 0);
  edgeCurveArrow.lineTo(-10, 10);
  edgeCurveArrow.lineTo(-10, -10);
  edgeCurveArrow.closePath();
  edgeCurveArrow.endFill();
}

export function updateEdgeStyle(
  edgeGfx: Container,
  edgeStyle: EdgeStyle,
  textureCache: TextureCache,
  isDirected: boolean
) {
  // edgeGfx -> edgeLine
  const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as Sprite;
  edgeLine.width = edgeStyle.width;
  [edgeLine.tint, edgeLine.alpha] = colorToPixi(edgeStyle.color);

  if (isDirected) {
    // edgeGfx -> edgeArrow
    const edgeArrowTextureKey = [EDGE_ARROW].join(DELIMETER);
    const edgeArrowTexture = textureCache.get(edgeArrowTextureKey, () => {
      const graphics = new Graphics();
      graphics.beginFill(WHITE, 1.0, true);

      graphics.moveTo(0, ARROW_SIZE);
      graphics.lineTo(ARROW_SIZE, -ARROW_SIZE);
      graphics.lineTo(-ARROW_SIZE, -ARROW_SIZE);
      graphics.lineTo(0, ARROW_SIZE);
      graphics.closePath();
      graphics.endFill();

      return graphics;
    });

    const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as Sprite;
    edgeArrow.texture = edgeArrowTexture;
    [edgeArrow.tint, edgeArrow.alpha] = colorToPixi(edgeStyle.color);
  }
}

export function updateEdgeVisibility(edgeGfx: Container, zoomStep: number) {
  // edgeGfx -> edgeLine
  const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as Sprite;
  edgeLine.visible = zoomStep >= 1;
  edgeLine.visible = false;

  // edgeGFX -> edgeArrow
  const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as Sprite;
  edgeArrow.visible = zoomStep >= 3;
  edgeArrow.visible = false;
}

// 1 draw curve
// 2 curve + arrow
// 3 multi curve between nodes
// 4 self loop
//    https://blogs.sitepointstatic.com/examples/tech/canvas-curves/bezier-curve.html
// 5 self loop + arrow
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
