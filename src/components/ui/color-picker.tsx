import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Palette, Check } from 'lucide-react';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

const presetColors = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#64748b', // slate-500
  '#6b7280', // gray-500
  '#374151', // gray-700
  '#1f2937', // gray-800
  '#111827', // gray-900
  '#000000', // black
  '#ffffff', // white
];

const campaignColors = [
  '#dc2626', // red-600 (Republican red)
  '#2563eb', // blue-600 (Democratic blue)
  '#059669', // emerald-600 (Green party)
  '#7c3aed', // violet-600 (Independent purple)
  '#ea580c', // orange-600 (Reform orange)
  '#0891b2', // cyan-600 (Libertarian cyan)
];

export function ColorPicker({ value = '#3b82f6', onChange, className, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  
  const handleColorSelect = (color: string) => {
    setCustomColor(color);
    onChange?.(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange?.(color);
  };

  const isValidHex = (color: string) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };

  const getContrastColor = (hexColor: string) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Parse r, g, b values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 h-9 px-3 py-1 text-base md:text-sm",
            className
          )}
          disabled={disabled}
        >
          <div
            className="w-4 h-4 rounded border border-border"
            style={{ backgroundColor: isValidHex(value) ? value : '#3b82f6' }}
          />
          <span className="flex-1 text-left">
            {isValidHex(value) ? value.toUpperCase() : 'Select color...'}
          </span>
          <Palette className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          {/* Campaign Colors */}
          <div>
            <h4 className="text-sm font-medium mb-2">Campaign Colors</h4>
            <div className="grid grid-cols-6 gap-2">
              {campaignColors.map((color) => (
                <button
                  key={color}
                  className="relative w-8 h-8 rounded-md border border-border hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color.toUpperCase()}
                >
                  {value === color && (
                    <Check 
                      className="w-4 h-4 absolute inset-0 m-auto"
                      style={{ color: getContrastColor(color) }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <h4 className="text-sm font-medium mb-2">Preset Colors</h4>
            <div className="grid grid-cols-8 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className="relative w-7 h-7 rounded-md border border-border hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color.toUpperCase()}
                >
                  {value === color && (
                    <Check 
                      className="w-3 h-3 absolute inset-0 m-auto"
                      style={{ color: getContrastColor(color) }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div>
            <h4 className="text-sm font-medium mb-2">Custom Color</h4>
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={isValidHex(customColor) ? customColor : '#3b82f6'}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                  title="Pick a custom color"
                />
              </div>
              <Input
                value={customColor}
                onChange={handleCustomColorChange}
                placeholder="#3b82f6"
                className="flex-1 font-mono text-sm"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          {/* Color Preview */}
          {isValidHex(customColor) && (
            <div className="p-3 rounded-md border" style={{ backgroundColor: customColor }}>
              <p 
                className="text-sm font-medium text-center"
                style={{ color: getContrastColor(customColor) }}
              >
                Preview Color
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
