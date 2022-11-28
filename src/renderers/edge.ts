import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import '@pixi/mixin-get-child-by-name';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import { IPointData } from '@pixi/math';

import { colorToPixi } from '../utils/color';
import { EdgeStyle, NodeStyle } from '../utils/style';
import { TextureCache } from '../texture-cache';

const DELIMETER = '::';
const WHITE = 0xffffff;

const EDGE_LINE = 'EDGE_LINE';
const EDGE_ARROW = 'EDGE_ARROW';

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
}

export function updatePosition(
  edgeGfx: Container,
  sourceNodePosition: IPointData,
  targetNodePosition: IPointData,
  nodeStyle: NodeStyle
) {
  const nodeOuterSize = nodeStyle.size + nodeStyle.border.width;

  // edgeGfx -> edgeLine
  const length = Math.hypot(targetNodePosition.x - sourceNodePosition.x, targetNodePosition.y - sourceNodePosition.y);
  const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as unknown as Sprite;
  // reduce line length
  edgeLine.height = length - nodeOuterSize * 2 - 2;

  // edgeGfx -> edgeArrow
  const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as unknown as Sprite;
  edgeArrow.y = length / 2 - nodeOuterSize - ARROW_SIZE;
}

export function updateEdgeStyle(
  edgeGfx: Container,
  edgeStyle: EdgeStyle,
  textureCache: TextureCache,
  isDirected: boolean
) {
  // edgeGfx -> edgeLine
  const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as unknown as Sprite;
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

    const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as unknown as Sprite;
    edgeArrow.texture = edgeArrowTexture;
    [edgeArrow.tint, edgeArrow.alpha] = colorToPixi(edgeStyle.color);
  }
}

export function updateEdgeVisibility(edgeGfx: Container, zoomStep: number) {
  // edgeGfx -> edgeLine
  const edgeLine = edgeGfx.getChildByName!(EDGE_LINE) as unknown as Sprite;
  edgeLine.visible = zoomStep >= 1;

  // edgeGFX -> edgeArrow
  const edgeArrow = edgeGfx.getChildByName!(EDGE_ARROW) as unknown as Sprite;
  edgeArrow.visible = zoomStep >= 3;
}
