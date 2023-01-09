import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { BitmapText } from '@pixi/text-bitmap';
import '@pixi/mixin-get-child-by-name';
import { colorToPixi } from '../utils/color';
import { EdgeStyle } from '../utils/style';
import { textToPixi } from '../utils/text';
import { TextureCache } from '../texture-cache';

const DELIMETER = '::';

const EDGE_LABEL_TEXT = 'EDGE_LABEL_TEXT';

export function createEdgeLabel(edgeLabelGfx: Container) {
  // edgeLabelGfx -> edgeLabelText
  const edgeLabelText = new Sprite();
  edgeLabelText.name = EDGE_LABEL_TEXT;
  edgeLabelText.anchor.set(0.5);
  edgeLabelGfx.addChild(edgeLabelText);
}

export function updateEdgeLabelStyle(edgeLabelGfx: Container, edgeStyle: EdgeStyle, textureCache: TextureCache) {
  const dir = edgeLabelGfx.rotation >= -Math.PI / 2 && edgeLabelGfx.rotation <= Math.PI / 2 ? 1 : -1;

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

  // edgeLabelGfx -> edgeLabelText
  const edgeLabelText = edgeLabelGfx.getChildByName!(EDGE_LABEL_TEXT) as Sprite;
  edgeLabelText.texture = edgeLabelTextTexture;
  // if dir is -1, we rotation the text, so good for user to read the edge label
  edgeLabelText.rotation = dir > 0 ? 0 : Math.PI;

  edgeLabelText.y = (-(edgeLabelTextTexture.height + edgeStyle.label.padding * 2) / 2) * dir;
  [edgeLabelText.tint, edgeLabelText.alpha] = colorToPixi(edgeStyle.label.color);
}

export function updateEdgeLabelVisibility(edgeLabelGfx: Container, zoomStep: number) {
  // edgeLabelGfx -> edgeLabelText
  const edgeLabelText = edgeLabelGfx.getChildByName!(EDGE_LABEL_TEXT) as BitmapText;
  edgeLabelText.visible = zoomStep >= 3;
}
