"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/utils";
import type { FilterOptions } from "@/types";

type ProductFiltersProps = {
  options: {
    sizes: string[];
    colors: string[];
    styles: string[];
    priceRange: [number, number];
  };
  filters: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
  onReset: () => void;
};

export default function ProductFilters({
  options,
  filters,
  onFilterChange,
  onReset,
}: ProductFiltersProps) {

  const handleCheckboxChange = (
    category: "sizes" | "colors" | "styles",
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[category];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    onFilterChange({ [category]: newValues });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-headline">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={["price", "styles", "colors", "sizes"]} className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent className="pt-4">
            <Slider
              min={options.priceRange[0]}
              max={options.priceRange[1]}
              step={10}
              value={filters.price}
              onValueChange={(value) => onFilterChange({ price: value as [number, number] })}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatPrice(filters.price[0])}</span>
              <span>{formatPrice(filters.price[1])}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="styles">
          <AccordionTrigger>Style</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {options.styles.map((style) => (
              <div key={style} className="flex items-center space-x-2">
                <Checkbox
                  id={`style-${style}`}
                  checked={filters.styles.includes(style)}
                  onCheckedChange={(checked) => handleCheckboxChange("styles", style, !!checked)}
                />
                <label htmlFor={`style-${style}`} className="text-sm">
                  {style}
                </label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="colors">
          <AccordionTrigger>Color</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {options.colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={filters.colors.includes(color)}
                  onCheckedChange={(checked) => handleCheckboxChange("colors", color, !!checked)}
                />
                <label htmlFor={`color-${color}`} className="text-sm">
                  {color}
                </label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sizes">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {options.sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={filters.sizes.includes(size)}
                  onCheckedChange={(checked) => handleCheckboxChange("sizes", size, !!checked)}
                />
                <label htmlFor={`size-${size}`} className="text-sm">
                  {size}
                </label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
