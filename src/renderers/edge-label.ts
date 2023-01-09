import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { BitmapText } from '@pixi/text-bitmap';
import '@pixi/mixin-get-child-by-name';
import { colorToPixi } from '../utils/color';
import { EdgeStyle, NodeStyle } from '../utils/style';
import { textToPixi } from '../utils/text';
import { TextureCache } from '../texture-cache';
import { IPointData } from '@pixi/math';
import { getQuadraticBezierXY, getQuadraticStartEndPoint } from '../utils/bezier';

const DELIMETER = '::';

const EDGE_LABEL_TEXT = 'EDGE_LABEL_TEXT';

export function createEdgeLabel(edgeLabelGfx: Container) {
  // edgeLabelGfx -> edgeLabelText
  const edgeLabelText = new Sprite();
  edgeLabelText.name = EDGE_LABEL_TEXT;
  edgeLabelText.anchor.set(0.5);
  edgeLabelGfx.addChild(edgeLabelText);
}

// !!! the label placement should keep consistent with edge line placement
export function updateLabelPosition(
  edgeLabelGfx: Container,
  sourceNodePosition: IPointData,
  targetNodePosition: IPointData,
  nodeStyle: NodeStyle,
  edgeStyle: EdgeStyle,
  textureCache: TextureCache,
  _isDirected: boolean,
  isSelfLoop: boolean,
  parallelEdgeCount: number,
  parallelSeq: number,
  selfLoopHeight?: number // only for self loop edge
) {
  const nodeSize = nodeStyle.size;
  const length = Math.hypot(targetNodePosition.x - sourceNodePosition.x, targetNodePosition.y - sourceNodePosition.y);
  const labelDir = edgeLabelGfx.rotation >= -Math.PI / 2 && edgeLabelGfx.rotation <= Math.PI / 2 ? 1 : -1;

  const edgeLabelText = edgeLabelGfx.getChildByName!(EDGE_LABEL_TEXT) as Sprite;

  const edgeLabelTextTextureKey = [
    EDGE_LABEL_TEXT,
    edgeStyle.label.fontFamily,
    edgeStyle.label.fontSize,
    edgeStyle.label.content,
  ].join(DELIMETER);

  const edgeLabelTextTexture = textureCache.get(edgeLabelTextTextureKey, () => {
    const text = textToPixi(edgeStyle.label.type, edgeStyle.label.content, {
      fontFamily: edgeStyle.label.fontFamily,
      fontSize: edgeStyle.label.fontSize,
    });
    return text;
  });

  edgeLabelText.texture = edgeLabelTextTexture;
  // if dir is -1, we rotation the text, it make label easier to read.
  edgeLabelText.rotation = labelDir > 0 ? 0 : Math.PI;

  // see bezier.ts: y goes from up to down
  let y = 0;

  if (isSelfLoop) {
    y = selfLoopHeight! + (-(edgeLabelTextTexture.height + edgeStyle.label.padding * 2) / 2) * labelDir;
  } else if (parallelEdgeCount <= 1 || (parallelEdgeCount % 2 === 1 && parallelSeq === parallelEdgeCount)) {
    y = (-(edgeLabelTextTexture.height + edgeStyle.label.padding * 2) / 2) * labelDir;
  } else {
    const dir = parallelSeq % 2 === 0 ? 1 : -1;
    const seqInDir = Math.ceil(parallelSeq / 2);

    const curveHeight = length * 0.25 * seqInDir * dir;
    const { sx, sy, ex, ey } = getQuadraticStartEndPoint(nodeSize, 5 * seqInDir * dir, -length / 2, 0, length / 2, 0);

    const center = getQuadraticBezierXY(0.5, sx, sy, 0, curveHeight, ex, ey);
    y = center.y + (-(edgeLabelTextTexture.height + edgeStyle.label.padding * 2) / 2) * labelDir;
  }

  edgeLabelText.y = y;
  [edgeLabelText.tint, edgeLabelText.alpha] = colorToPixi(edgeStyle.label.color);
}

export function updateEdgeLabelVisibility(edgeLabelGfx: Container, zoomStep: number) {
  // edgeLabelGfx -> edgeLabelText
  const edgeLabelText = edgeLabelGfx.getChildByName!(EDGE_LABEL_TEXT) as BitmapText;
  edgeLabelText.visible = zoomStep >= 3;
}
