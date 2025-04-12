/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import {
  BaseBoxShapeUtil,
  HTMLContainer,
  TLArrowShape,
  TLArrowShapeProps,
  TLBaseShape,
  TLShape,
  TLShapeId,
  TLTextShape,
  Vec,
  toDomPrecision,
  useIsEditing,
  useValue,
} from "tldraw";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Play, RotateCw, Download, Sparkles, Loader2 } from "lucide-react";
import { settingsAtom, settingsStringAtom } from "@/state/settings";
import { useAtomValue } from "jotai";
import { makeShapeID } from "@/lib/makeShapeID";
import { connectShapes } from "@/lib/connectShapes";

// Renamed type definition
export type ProjectIdeaShape = TLBaseShape<
  "project-idea",
  {
    projectidea: string;
    w: number;
    h: number;
    dateCreated?: number;
    charter?: string;
    isBred?: boolean;
  }
>;

// Renamed class and adjusted type parameter
export class ProjectIdeaUtil extends BaseBoxShapeUtil<ProjectIdeaShape> {
  static override type = "project-idea" as const;

  // Adjusted return type hint
  getDefaultProps(): ProjectIdeaShape["props"] {
    return {
      projectidea: "",
      w: (960 * 2) / 3,
      h: (540 * 2) / 3,
      dateCreated: Date.now(),
    };
  }

  // Adjusted type hints for parameters
  override canEdit = () => true;
  override isAspectRatioLocked = (_shape: ProjectIdeaShape) => false;
  override canResize = (_shape: ProjectIdeaShape) => true;
  override canBind = (_shape: ProjectIdeaShape) => true;

  // Kept all methods (getRootShapeId, getAncestors, getParents, layoutTree)
  getRootShapeId(shapeId: TLShapeId): TLShapeId {
    const parentArrow = this.editor
      .getArrowsBoundTo(shapeId)
      .find((a) => a.handleId === "end");
    if (!parentArrow) {
      return shapeId;
    }
    const parentArrowShape = this.editor.getShape(parentArrow.arrowId);

    const start = (parentArrowShape?.props as TLArrowShapeProps).start;
    if (start.type === "binding") {
      return this.getRootShapeId(start.boundShapeId);
    }
    return shapeId;
  }

  getAncestors(shapeId: TLShapeId): TLShape[] {
    const shape = this.editor.getShape(shapeId);
    if (!shape) {
      return [];
    }

    const parents = this.getParents(shapeId);
    if (parents.length) {
      return this.getAncestors(parents[0]).concat([shape]);
    }

    return [shape];
  }

  getParents(shapeId: TLShapeId): TLShapeId[] {
    const shape = this.editor.getShape(shapeId);
    if (!shape) {
      return [];
    }
    const parentShapes = this.editor
      .getArrowsBoundTo(shapeId)
      .filter((a) => a.handleId === "end")
      .map((a) => {
        const start = this.editor.getShape<TLArrowShape>(a.arrowId)!.props
          .start;
        if (start.type === "binding") {
          return start.boundShapeId;
        }
        return null;
      })
      .filter((v): v is TLShapeId => Boolean(v));
    return parentShapes;
  }

  layoutTree(shapeId: TLShapeId) {
    const rootShapeId = this.getRootShapeId(shapeId);
    const toProcess = [{ id: rootShapeId, depth: 0 }];
    const layers: TLShape[][] = [];

    while (toProcess.length) {
      const { id, depth } = toProcess.shift()!;
      const shape = this.editor.getShape(id);
      if (shape) {
        layers[depth] = layers[depth] || [];
        layers[depth].push(shape);
        const arrowIds = this.editor
          .getArrowsBoundTo(id)
          .filter((a) => a.handleId === "start")
          .map((a) => a.arrowId);

        const arrows = arrowIds.map((id) => this.editor.getShape(id));
        for (const arrow of arrows) {
          if (arrow?.type === "arrow") {
            const end = (arrow.props as TLArrowShapeProps).end;
            if (end.type === "binding") {
              const endShape = this.editor.getShape(end.boundShapeId);
              if (endShape) {
                toProcess.push({ id: endShape.id, depth: depth + 1 });
              }
            }
          }
        }
      }
    }

    const root = layers[0][0];
    const centerX = root.x + (root.props as ProjectIdeaShape["props"]).w / 2;

    const spacingX = 100;
    const spacingY = 200;

    const startY = root.y;

    layers.forEach((layer, depth) => {
      const totalWidth = layer.reduce(
        (sum, shape) => sum + (shape.props as ProjectIdeaShape["props"]).w,
        0
      );
      const totalSpacing = (layer.length - 1) * spacingX;
      const startX = centerX - (totalWidth + totalSpacing) / 2;

      let currentX = startX;
      layer.forEach((shape) => {
        this.editor.updateShape({
          id: shape.id,
          type: "project-idea",
          x: currentX,
          y:
            startY +
            depth * ((shape.props as ProjectIdeaShape["props"]).h + spacingY),
        });

        currentX += (shape.props as ProjectIdeaShape["props"]).w + spacingX;
      });
    });
  }

  // Adjusted type hint for parameter
  override component(shape: ProjectIdeaShape) {
    const isEditing = useIsEditing(shape.id);
    const ref = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const settings = useAtomValue(settingsStringAtom);

    useEffect(() => {
      blurInputMobile.register();
      return () => {
        blurInputMobile.release();
      };
    }, []);

    useEffect(() => {
      if (
        (shape.props.projectidea || shape.props.isBred) &&
        !shape.props.charter &&
        !isLoading
      ) {
        formRef.current?.submit();
        setIsLoading(true);
        const currentProjectIdea = formRef.current?.projectidea?.value;
        this.editor.updateShape({
          id: shape.id,
          type: "project-idea",
          props: { ...shape.props, projectidea: currentProjectIdea, charter: null },
        });
      }
    }, [shape.props, shape.id, isLoading]);

    useEffect(() => {
      const iframe = ref.current;
      const onMessage = (event: MessageEvent) => {
        if (event.source !== iframe?.contentWindow) {
          return;
        }
        if (event.data.type === "navigate") {
          const { href } = event.data;

          const newX = shape.x;
          const newY = shape.y + shape.props.h + 100;
          const newId = makeShapeID();
          this.editor.createShape({
            id: newId,
            type: "project-idea",
            x: newX,
            y: newY,
            props: {
              projectidea: href,
              w: shape.props.w,
              h: shape.props.h,
            },
          });

          connectShapes(this.editor, shape.id, newId);

          this.layoutTree(shape.id);
        }
      };
      window.addEventListener("message", onMessage);

      return () => {
        window.removeEventListener("message", onMessage);
      };
    }, [
      shape.id,
      shape.props.h,
      shape.props.w,
      shape.x,
      shape.y,
    ]);

    const boxShadow = useValue(
      "box shadow",
      () => {
        const rotation = this.editor.getShapePageTransform(shape)!.rotation();
        return getRotatedBoxShadow(rotation);
      },
      [this.editor]
    );

    const promptsParam = useValue(
      "prompts",
      () => {
        return JSON.stringify(
          this.editor
            .getCurrentPageShapes()
            .filter((s): s is TLTextShape =>
              Boolean(s.type === "text" && s.meta.prompt)
            )
            .map((t) => t.props.text)
        );
      },
      [this.editor]
    );

    const depsParams = useValue(
      "deps",
      () => {
        const ancestors = shape.props.isBred
          ? this.getParents(shape.id).map(
              (id) => this.editor.getShape<ProjectIdeaShape>(id)!
            )
          : this.getAncestors(shape.id);
        const deps = ancestors.map((s) => {
          return {
            projectidea: (s.props as ProjectIdeaShape["props"]).projectidea,
            charter: (s.props as ProjectIdeaShape["props"]).charter,
          };
        });
        const param = JSON.stringify(deps);
        return param;
      },
      [shape.id, shape.props.isBred]
    );

    const { projectidea } = shape.props;

    const handleDownload = () => {
      if (!shape.props.charter) return;
      const blob = new Blob([shape.props.charter], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "download.html";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleSubmit = () => {
      const currentProjectIdea = formRef.current?.projectidea?.value;
      this.editor.updateShape({
        id: shape.id,
        type: "project-idea",
        props: { ...shape.props, projectidea: currentProjectIdea, charter: null },
        
      });
      formRef.current?.requestSubmit();
    };

    return (
      <HTMLContainer
        className="tl-embed-container flex flex-col border"
        id={shape.id}
        style={{
          boxShadow,
          width: toDomPrecision(shape.props.w),
          height: toDomPrecision(shape.props.h),
        }}
      >
        {isLoading && <LoadingBar />}
        <form
          method="POST"
          ref={formRef}
          action="/api/generate-project"
          target={`iframe-1-${shape.id}`}
          className="flex items-center p-2 w-full gap-2 bg-background border-b"
          onSubmit={() => {
            setIsLoading(true);
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={handleDownload}
            onTouchStart={handleDownload}
            disabled
          >
            <Download />
          </Button>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            onMouseDown={handleSubmit}
            onTouchStart={handleSubmit}
            disabled
          >
            <RotateCw />
          </Button>
          <Input
            name="projectidea"
            type="text"
            defaultValue={projectidea}
            className="address-bar"
            placeholder="Enter your project idea..."
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              this.editor.setEditingShape(shape.id);
            }}
            onBlur={() => this.editor.setEditingShape(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                formRef.current?.requestSubmit();
              }
            }}
            disabled={isLoading }
          />
          <input type="hidden" name="deps" value={depsParams} />
          <input type="hidden" name="settings" value={settings} />
          <input type="hidden" name="prompts" value={promptsParam} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            onMouseDown={handleSubmit}
            onTouchStart={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          </Button>
        </form>
        <iframe
          name={`iframe-1-${shape.id}`}
          id={`iframe-1-${shape.id}`}
          onLoad={(e) => {
            if (!isLoading) return;
            const iframe = e.target as HTMLIFrameElement;
            const html = iframe.contentDocument?.documentElement.outerHTML;
            if (html === `<html><head></head><body></body></html>`) {
              setIsLoading(false);
              return;
            }
            this.editor.updateShape({
              id: shape.id,
              type: "project-idea",
              props: { ...shape.props, charter: html },
            });
            setIsLoading(false);
          }}
          srcDoc={shape.props.charter ?? undefined}
          width="100%"
          height="100%"
          draggable={false}
          style={{
            pointerEvents: isEditing ? "auto" : "none",
            backgroundColor: "var(--color-panel)",
          }}
          ref={ref}
        />

        <div
          style={{
            textAlign: "center",
            position: "absolute",
            bottom: isEditing ? -40 : 0,
            padding: 4,
            fontFamily: "inherit",
            fontSize: 12,
            left: 0,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              background: "var(--color-panel)",
              padding: "4px 12px",
              borderRadius: 99,
              border: "1px solid var(--color-muted-1)",
            }}
          >
            {isEditing
              ? "Click the canvas to exit"
              : "Double click to interact"}
          </span>
        </div>
      </HTMLContainer>
    );
  }

  // Adjusted type hint for parameter
  indicator(shape: ProjectIdeaShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

// Kept helper functions/classes (getRotatedBoxShadow, LoadingBar, RegisterOnce, blurInputMobile)

const ROTATING_BOX_SHADOWS = [
  {
    offsetX: 0,
    offsetY: 2,
    blur: 4,
    spread: -1,
    color: "#0000003a",
  },
  {
    offsetX: 0,
    offsetY: 3,
    blur: 12,
    spread: -2,
    color: "#0000001f",
  },
];

function getRotatedBoxShadow(rotation: number) {
  const cssStrings = ROTATING_BOX_SHADOWS.map((shadow) => {
    const { offsetX, offsetY, blur, spread, color } = shadow;
    const vec = new Vec(offsetX, offsetY);
    const { x, y } = vec.rot(-rotation);
    return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  });
  return cssStrings.join(", ");
}

function LoadingBar() {
  return (
    <div className="w-full h-1 bg-blue-600 animate-pulse absolute top-0 left-0" />
  );
}

class RegisterOnce {
  private registerCount = 0;
  constructor(private fn: () => void) {}
  register() {
    if (this.registerCount === 0) {
      this.fn();
      this.registerCount++;
    }
  }
  release() {
    this.registerCount--;
  }
}

const blurInputMobile = new RegisterOnce(() => {
  document.body.addEventListener("touchstart", (e) => {
    if (!(e.target as HTMLElement).closest(".address-bar")) {
      const activeElement = document.activeElement;
      if (activeElement?.classList.contains("address-bar")) {
        (activeElement as HTMLElement).blur();
      }
    }
  });
});