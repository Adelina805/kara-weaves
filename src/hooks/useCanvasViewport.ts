"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RULER_OFFSET } from "@/components/fabric-designer/FabricRulers";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const WHEEL_ZOOM_SENSITIVITY = 0.005;
const MIN_VISIBLE_FRACTION = 0.25;

function clampZoom(value: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
}

function clampPan(
  panX: number,
  panY: number,
  displayWidth: number,
  displayHeight: number,
  container: HTMLElement,
): { x: number; y: number } {
  const style = getComputedStyle(container);
  const padLeft = parseFloat(style.paddingLeft);
  const padRight = parseFloat(style.paddingRight);
  const padTop = parseFloat(style.paddingTop);
  const padBottom = parseFloat(style.paddingBottom);
  const viewMinX = padLeft;
  const viewMinY = padTop;
  const viewMaxX = container.clientWidth - padRight;
  const viewMaxY = container.clientHeight - padBottom;

  const minPanX = viewMinX - (1 - MIN_VISIBLE_FRACTION) * displayWidth;
  const maxPanX = viewMaxX - MIN_VISIBLE_FRACTION * displayWidth;
  const minPanY = viewMinY - (1 - MIN_VISIBLE_FRACTION) * displayHeight;
  const maxPanY = viewMaxY - MIN_VISIBLE_FRACTION * displayHeight;

  return {
    x: Math.max(minPanX, Math.min(maxPanX, panX)),
    y: Math.max(minPanY, Math.min(maxPanY, panY)),
  };
}

function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

type UseCanvasViewportOptions = {
  canvasWidth: number;
  canvasHeight: number;
};

export function useCanvasViewport({ canvasWidth, canvasHeight }: UseCanvasViewportOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [fitScale, setFitScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const panRef = useRef({ x: 0, y: 0 });
  panRef.current = { x: panX, y: panY };

  const fitScaleRef = useRef(fitScale);
  fitScaleRef.current = fitScale;

  const spaceKeyRef = useRef(false);
  const panStartRef = useRef({ panX: 0, panY: 0, clientX: 0, clientY: 0 });
  const panPointerIdRef = useRef<number | null>(null);

  const pinchRef = useRef({
    pointers: new Map<number, { x: number; y: number }>(),
    initialDistance: 0,
    initialZoom: 1,
  });

  const getDisplaySize = useCallback(() => {
    return {
      width: canvasWidth * fitScaleRef.current * zoomRef.current,
      height: canvasHeight * fitScaleRef.current * zoomRef.current,
    };
  }, [canvasWidth, canvasHeight]);

  const applyPan = useCallback(
    (nextPanX: number, nextPanY: number) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const { width, height } = getDisplaySize();
      const clamped = clampPan(nextPanX, nextPanY, width, height, container);
      panRef.current = clamped;
      setPanX(clamped.x);
      setPanY(clamped.y);
    },
    [getDisplaySize],
  );

  const centerCanvas = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const style = getComputedStyle(container);
    const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const availableWidth = container.clientWidth - padX;
    const availableHeight = container.clientHeight - padY;
    const displayWidth = canvasWidth * fitScaleRef.current * zoomRef.current;
    const displayHeight = canvasHeight * fitScaleRef.current * zoomRef.current;

    const nextPanX = padX / 2 + (availableWidth - displayWidth) / 2;
    const nextPanY = padY / 2 + (availableHeight - displayHeight) / 2;

    applyPan(nextPanX, nextPanY);
  }, [applyPan, canvasWidth, canvasHeight]);

  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, nextZoom: number) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const currentZoom = zoomRef.current;
      const clamped = clampZoom(nextZoom);
      if (clamped === currentZoom) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      const scale = fitScaleRef.current * currentZoom;
      const worldX = (screenX - panRef.current.x) / scale;
      const worldY = (screenY - panRef.current.y) / scale;
      const newScale = fitScaleRef.current * clamped;
      const nextPanX = screenX - worldX * newScale;
      const nextPanY = screenY - worldY * newScale;

      setZoom(clamped);

      const { width, height } = {
        width: canvasWidth * fitScaleRef.current * clamped,
        height: canvasHeight * fitScaleRef.current * clamped,
      };
      const clampedPan = clampPan(nextPanX, nextPanY, width, height, container);
      panRef.current = clampedPan;
      setPanX(clampedPan.x);
      setPanY(clampedPan.y);
    },
    [canvasWidth, canvasHeight],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateFitScale = () => {
      const { width, height } = container.getBoundingClientRect();
      const style = getComputedStyle(container);
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const availableWidth = Math.max(0, width - padX - RULER_OFFSET);
      const availableHeight = Math.max(0, height - padY - RULER_OFFSET);
      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;

      setFitScale(Math.min(scaleX, scaleY, 1));
    };

    updateFitScale();
    const observer = new ResizeObserver(updateFitScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    if (zoomRef.current === 1) {
      centerCanvas();
      return;
    }

    applyPan(panRef.current.x, panRef.current.y);
  }, [fitScale, canvasWidth, canvasHeight, centerCanvas, applyPan]);

  useEffect(() => {
    applyPan(panRef.current.x, panRef.current.y);
  }, [zoom, applyPan]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || spaceKeyRef.current) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      event.preventDefault();
      spaceKeyRef.current = true;
      setIsSpacePressed(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") {
        return;
      }

      spaceKeyRef.current = false;
      setIsSpacePressed(false);
    };

    const handleBlur = () => {
      spaceKeyRef.current = false;
      setIsSpacePressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const zoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    zoomAtPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      zoomRef.current + ZOOM_STEP,
    );
  }, [zoomAtPoint]);

  const zoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    zoomAtPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      zoomRef.current - ZOOM_STEP,
    );
  }, [zoomAtPoint]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    zoomRef.current = 1;
    setIsPanning(false);
    setIsPinching(false);
    panPointerIdRef.current = null;
    pinchRef.current.pointers.clear();
    pinchRef.current.initialDistance = 0;
    centerCanvas();
  }, [centerCanvas]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        const nextZoom = zoomRef.current * (1 - event.deltaY * WHEEL_ZOOM_SENSITIVITY);
        zoomAtPoint(event.clientX, event.clientY, nextZoom);
        return;
      }

      const nextPanX = panRef.current.x - event.deltaX;
      const nextPanY = panRef.current.y - event.deltaY;
      applyPan(nextPanX, nextPanY);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [applyPan, zoomAtPoint]);

  const startPan = useCallback((event: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    panStartRef.current = {
      panX: panRef.current.x,
      panY: panRef.current.y,
      clientX: event.clientX,
      clientY: event.clientY,
    };
    panPointerIdRef.current = event.pointerId;
    setIsPanning(true);
    container.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent): boolean => {
      const pinch = pinchRef.current;
      pinch.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pinch.pointers.size === 2) {
        const points = [...pinch.pointers.values()];
        pinch.initialDistance = pointerDistance(points[0], points[1]);
        pinch.initialZoom = zoomRef.current;
        setIsPinching(true);
        return true;
      }

      if (event.button === 1 || (spaceKeyRef.current && event.button === 0)) {
        startPan(event);
        return true;
      }

      return false;
    },
    [startPan],
  );

  const handlePanStart = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0 || spaceKeyRef.current) {
        return;
      }

      startPan(event);
    },
    [startPan],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent): boolean => {
      const pinch = pinchRef.current;
      if (pinch.pointers.has(event.pointerId)) {
        pinch.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (pinch.pointers.size === 2 && pinch.initialDistance > 0) {
          const points = [...pinch.pointers.values()];
          const distance = pointerDistance(points[0], points[1]);
          const scale = distance / pinch.initialDistance;
          const midX = (points[0].x + points[1].x) / 2;
          const midY = (points[0].y + points[1].y) / 2;

          zoomAtPoint(midX, midY, pinch.initialZoom * scale);
          return true;
        }
      }

      if (panPointerIdRef.current === event.pointerId) {
        const nextPanX =
          panStartRef.current.panX + (event.clientX - panStartRef.current.clientX);
        const nextPanY =
          panStartRef.current.panY + (event.clientY - panStartRef.current.clientY);

        applyPan(nextPanX, nextPanY);
        return true;
      }

      return pinch.pointers.size >= 2;
    },
    [applyPan, zoomAtPoint],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent): void => {
    const pinch = pinchRef.current;
    pinch.pointers.delete(event.pointerId);

    if (pinch.pointers.size < 2) {
      setIsPinching(false);
      pinch.initialDistance = 0;
    }

    if (panPointerIdRef.current === event.pointerId) {
      const container = containerRef.current;
      if (container) {
        container.releasePointerCapture(event.pointerId);
      }
      panPointerIdRef.current = null;
      setIsPanning(false);
    }
  }, []);

  const zoomPercent = `${Math.round(zoom * 100)}%`;
  const isViewportGestureActive = isPanning || isPinching;

  return {
    containerRef,
    zoom,
    fitScale,
    panX,
    panY,
    zoomPercent,
    zoomIn,
    zoomOut,
    resetZoom,
    isPanning,
    isPinching,
    isSpacePressed,
    isViewportGestureActive,
    handlePointerDown,
    handlePanStart,
    handlePointerMove,
    handlePointerUp,
  };
}
