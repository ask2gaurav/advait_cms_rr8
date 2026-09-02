import type {
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { $applyNodeReplacement, DecoratorNode } from "lexical";
import type { JSX } from "react";

export type SerializedImageNode = Spread<
  { src: string; altText: string; caption?: string },
  SerializedLexicalNode
>;

/** Minimal block image node — src + alt + optional caption. */
export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __caption: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__caption, node.__key);
  }

  constructor(src: string, altText: string, caption = "", key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__caption = caption;
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return $createImageNode(json.src, json.altText, json.caption);
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      caption: this.__caption || undefined,
    };
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement("img");
    img.setAttribute("src", this.__src);
    img.setAttribute("alt", this.__altText);
    return { element: img };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const cls = config.theme.image;
    if (cls) span.className = cls;
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <figure className="my-2">
        <img
          src={this.__src}
          alt={this.__altText}
          className="max-w-full rounded-lg"
        />
        {this.__caption && (
          <figcaption className="mt-1 text-center text-sm text-gray-500">
            {this.__caption}
          </figcaption>
        )}
      </figure>
    );
  }
}

export function $createImageNode(
  src: string,
  altText: string,
  caption?: string,
): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, caption));
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
