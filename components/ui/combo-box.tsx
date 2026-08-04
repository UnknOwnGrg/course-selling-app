"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function ComboboxBasic({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  emptyMessage = "No option found.",
}: ComboboxProps) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Combobox
      items={options}
      itemToStringValue={(item) => item.label}
      value={selected}
      onValueChange={(item) => onChange(item?.value ?? "")}
    >
      <ComboboxInput aria-label="Select option" placeholder={placeholder} />

      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>

        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
