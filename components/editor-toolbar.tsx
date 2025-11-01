"use client"

import type { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Eraser, Palette } from "lucide-react"

interface DrawingState {
  tool: "pencil" | "eraser"
  color: string
  thickness: number
}

interface EditorToolbarProps {
  drawingState: DrawingState
  setDrawingState: Dispatch<SetStateAction<DrawingState>>
}

export function EditorToolbar({ drawingState, setDrawingState }: EditorToolbarProps) {
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#ef4444" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#22c55e" },
    { name: "Yellow", value: "#eab308" },
  ]

  return (
    <div className="w-64 border-l border-border bg-card p-6 flex flex-col gap-6">
      {/* Tool Selection */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Drawing Tools</h3>
        <div className="space-y-2">
          <Button
            onClick={() => setDrawingState({ ...drawingState, tool: "pencil" })}
            variant={drawingState.tool === "pencil" ? "default" : "outline"}
            className={`w-full justify-start ${
              drawingState.tool === "pencil"
                ? "bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Pencil
          </Button>
          <Button
            onClick={() => setDrawingState({ ...drawingState, tool: "eraser" })}
            variant={drawingState.tool === "eraser" ? "default" : "outline"}
            className={`w-full justify-start ${
              drawingState.tool === "eraser"
                ? "bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <Eraser className="mr-2 h-4 w-4" />
            Eraser
          </Button>
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Palette className="h-4 w-4" />
          Color
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => setDrawingState({ ...drawingState, color: color.value })}
              className={`h-8 w-8 rounded border-2 transition-all ${
                drawingState.color === color.value ? "border-foreground scale-110" : "border-border hover:scale-105"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Thickness Slider */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Line Thickness</h3>
        <div className="space-y-3">
          <input
            type="range"
            min="1"
            max="20"
            value={drawingState.thickness}
            onChange={(e) => setDrawingState({ ...drawingState, thickness: Number.parseInt(e.target.value) })}
            className="w-full cursor-pointer accent-primary"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Thin</span>
            <span className="font-semibold text-foreground">{drawingState.thickness}px</span>
            <span>Thick</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Preview</h3>
        <div className="rounded border border-border bg-muted/50 p-4">
          <svg className="h-16 w-full" viewBox="0 0 100 60">
            <line
              x1="10"
              y1="30"
              x2="90"
              y2="30"
              stroke={drawingState.color}
              strokeWidth={drawingState.thickness}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="mt-auto rounded bg-muted/50 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Current Tool:</p>
        <p>
          {drawingState.tool === "pencil" ? "✏️ Pencil" : "🧹 Eraser"} • {drawingState.color}
        </p>
      </div>
    </div>
  )
}
