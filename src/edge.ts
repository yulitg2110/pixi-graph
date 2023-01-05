import { Container } from '@pixi/display';
import { InteractionEvent } from '@pixi/interaction';
import { IPointData } from '@pixi/math';
import { TypedEmitter } from 'tiny-typed-emitter';
import { createEdge, updateEdgeStyle, updateEdgeVisibility, updatePosition } from './renderers/edge';
import { EdgeStyle, NodeStyle } from './utils/style';
import { TextureCache } from './texture-cache';

interface PixiEdgeEvents {
  mousemove: (event: MouseEvent) => void;
  mouseover: (event: MouseEvent) => void;
  mouseout: (event: MouseEvent) => void;
  mousedown: (event: MouseEvent) => void;
  mouseup: (event: MouseEvent) => void;
}

export class PixiEdge extends TypedEmitter<PixiEdgeEvents> {
  edgeGfx: Container;
  edgePlaceholderGfx: Container;

  hovered: boolean = false;

  constructor() {
    super();

    this.edgeGfx = this.createEdge();
    this.edgePlaceholderGfx = new Container();
  }

  createEdge() {
    const edgeGfx = new Container();
    edgeGfx.interactive = true;
    edgeGfx.buttonMode = true;
    edgeGfx.on('mousemove', (event: InteractionEvent) =>
      this.emit('mousemove', event.data.originalEvent as MouseEvent)
    );
    edgeGfx.on('mouseover', (event: InteractionEvent) =>
      this.emit('mouseover', event.data.originalEvent as MouseEvent)
    );
    edgeGfx.on('mouseout', (event: InteractionEvent) => this.emit('mouseout', event.data.originalEvent as MouseEvent));
    edgeGfx.on('mousedown', (event: InteractionEvent) =>
      this.emit('mousedown', event.data.originalEvent as MouseEvent)
    );
    edgeGfx.on('mouseup', (event: InteractionEvent) => this.emit('mouseup', event.data.originalEvent as MouseEvent));
    createEdge(edgeGfx);
    return edgeGfx;
  }

  updatePosition(
    sourceNodePosition: IPointData,
    targetNodePosition: IPointData,
    nodeStyle: NodeStyle,
    edgeStyle: EdgeStyle,
    isDirected: boolean,
    isSelfLoop: boolean,
    parallelEdgeCount: number,
    parallelSeq: number
  ) {
    const position = {
      x: (sourceNodePosition.x + targetNodePosition.x) / 2,
      y: (sourceNodePosition.y + targetNodePosition.y) / 2,
    };
    const rotation = Math.atan2(
      targetNodePosition.y - sourceNodePosition.y,
      targetNodePosition.x - sourceNodePosition.x
    );
    this.edgeGfx.position.copyFrom(position);
    this.edgeGfx.rotation = rotation;
    updatePosition(
      this.edgeGfx,
      sourceNodePosition,
      targetNodePosition,
      nodeStyle,
      edgeStyle,
      isDirected,
      isSelfLoop,
      parallelEdgeCount,
      parallelSeq
    );
  }

  updateStyle(
    edgeStyle: EdgeStyle,
    textureCache: TextureCache,
    isDirected: boolean,
    isSelfLoop: boolean,
    parallelEdgeCount: number,
    parallelSeq: number
  ) {
    updateEdgeStyle(this.edgeGfx, edgeStyle, textureCache, isDirected, isSelfLoop, parallelEdgeCount, parallelSeq);
  }

  updateVisibility(zoomStep: number, isSelfLoop: boolean, parallelEdgeCount: number, parallelSeq: number) {
    updateEdgeVisibility(this.edgeGfx, zoomStep, isSelfLoop, parallelEdgeCount, parallelSeq);
  }
}
