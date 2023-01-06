import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import '@pixi/mixin-get-child-by-name';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import { IPointData } from '@pixi/math';
import { GRAPHICS_CURVES } from '@pixi/graphics';

import { colorToPixi } from '../utils/color';
import { EdgeStyle, NodeStyle } from '../utils/style';
import {
  getCubicBezierAngle,
  getCubicBezierXY,
  getQuadraticAngle,
  getQuadraticBezierXY,
  getQuadraticStartEndPoint,
  getLoopEdgeBezierPoint,
} from '../utils/bezier';
import { TextureCache } from '../texture-cache';

GRAPHICS_CURVES.minSegments = 8 * 4;
// const DELIMETER = '::';
// const WHITE = 0xffffff;

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
  isSelfLoop: boolean,
  parallelEdgeCount: number,
  parallelSeq: number
) {
  const nodeSize = nodeStyle.size;
  const [color, alpha] = colorToPixi(edgeStyle.color);
  const length = Math.hypot(targetNodePosition.x - sourceNodePosition.x, targetNodePosition.y - sourceNodePosition.y);

  const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as Sprite;
  const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as Graphics;
  const edgeCurve = edgeGfx.getChildByName!(EDGE_CURVE) as Graphics;
  const edgeCurveArrow = edgeGfx.getChildByName!(EDGE_CURVE_ARROW) as Graphics;

  edgeLine.visible = false;
  edgeArrow.visible = false;
  edgeCurve.visible = false;
  edgeCurveArrow.visible = false;

  if (isSelfLoop) {
    edgeCurve.visible = true;
    edgeCurveArrow.visible = true;

    const { sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey } = getLoopEdgeBezierPoint(nodeSize, parallelSeq, 0, 0);

    // only do clear when node position changed
    edgeCurve.clear();
    edgeCurve.lineStyle({ width: 1, color, alpha });
    edgeCurve.moveTo(sx, sy);
    edgeCurve.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);

    // edgeGfx -> edgeCurveArrow
    // only do clear when node position changed
    edgeCurveArrow.clear();
    const coord = getCubicBezierXY(1, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey);
    const angle = getCubicBezierAngle(1, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey);

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

    return;
  }

  // edgeGfx -> edgeArrow
  if (parallelEdgeCount <= 1 || (parallelEdgeCount % 2 === 1 && parallelSeq === parallelEdgeCount)) {
    edgeLine.visible = true;
    edgeArrow.visible = true;

    // edgeGfx -> edgeLine
    edgeLine.width = length;

    if (isDirected) {
      edgeArrow.clear();
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
    edgeCurve.visible = true;
    edgeCurveArrow.visible = true;

    // edgeGfx -> edgeCurve
    const dir = parallelSeq % 2 === 0 ? 1 : -1;
    const seqInDir = Math.ceil(parallelSeq / 2);

    const { sx, sy, ex, ey } = getQuadraticStartEndPoint(nodeSize, 5 * seqInDir * dir, -length / 2, 0, length / 2, 0);
    const curveHeight = length * 0.25 * seqInDir * dir;

    // only do clear when node position changed
    edgeCurve.clear();
    edgeCurve.lineStyle({ width: 1, color, alpha });
    edgeCurve.moveTo(sx, sy);
    edgeCurve.quadraticCurveTo(0, curveHeight, ex, ey);

    // edgeGfx -> edgeCurveArrow
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
  _isDirected: boolean,
  isSelfLoop: boolean,
  parallelEdgeCount: number,
  parallelSeq: number
) {
  if (isSelfLoop) {
    return;
  }
  if (parallelEdgeCount <= 1 || (parallelEdgeCount % 2 === 1 && parallelSeq === parallelEdgeCount)) {
    // edgeGfx -> edgeLine
    const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as Sprite;
    edgeLine.height = edgeStyle.width;
    [edgeLine.tint, edgeLine.alpha] = colorToPixi(edgeStyle.color);
  }
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

export function updateEdgeVisibility(
  edgeGfx: Container,
  zoomStep: number,
  isSelfLoop: boolean,
  parallelEdgeCount: number,
  parallelSeq: number
) {
  const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as Sprite;
  const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as Sprite;
  const edgeCurve = edgeGfx.getChildByName!(EDGE_CURVE) as Graphics;
  const edgeCurveArrow = edgeGfx.getChildByName!(EDGE_CURVE_ARROW) as Graphics;

  if (isSelfLoop) {
    // edgeGfx -> edgeCurve
    edgeCurve.visible = zoomStep >= 2;
    // edgeGfx -> edgeCurveArrow
    edgeCurveArrow.visible = zoomStep >= 3;

    // hide line
    edgeLine.visible = false;
    edgeArrow.visible = false;
    return;
  }

  if (parallelEdgeCount <= 1 || (parallelEdgeCount % 2 === 1 && parallelSeq === parallelEdgeCount)) {
    // edgeGfx -> edgeLine
    edgeLine.visible = zoomStep >= 2;
    // edgeGFX -> edgeArrow
    edgeArrow.visible = zoomStep >= 3;

    // hide curve
    edgeCurve.visible = false;
    edgeCurveArrow.visible = false;
  } else {
    // edgeGfx -> edgeCurve
    edgeCurve.visible = zoomStep >= 2;
    // edgeGfx -> edgeCurveArrow
    edgeCurveArrow.visible = zoomStep >= 3;

    // hide line
    edgeLine.visible = false;
    edgeArrow.visible = false;
  }
}
