import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Check, ChevronsUpDown, X, AlertCircle } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { cn } from "@/lib/utils";


export function CustomMultiSelect({
    field,
    data = [],
    label,
    getOptionLabel,
    getOptionValue,
    error
}) {
    const [open, setOpen] = useState(false);

    // Sincronizamos directamente con field.value para evitar el useEffect
    const selectedValues = useMemo(() => field.value || [], [field.value]);

    const toggleValue = (val) => {
        const value = String(val);
        const newValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];

        field.onChange(newValues);
    };

    const handleRemove = (e, value) => {
        e.preventDefault();
        e.stopPropagation();
        field.onChange(selectedValues.filter((v) => v !== value));
    };

    // Memoizamos los items seleccionados para mejorar el rendimiento
    const selectedItems = useMemo(() =>
        data.filter((item) => selectedValues.includes(String(getOptionValue(item)))),
        [data, selectedValues, getOptionValue]
    );

    return (
        <div className="w-full space-y-2">
            {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between rounded-xl font-normal transition-all",
                            error ? "border-destructive" : "border-input",
                            selectedValues.length === 0 && "text-muted-foreground"
                        )}
                    >
                        {selectedItems.length > 0
                            ? `${selectedItems.length} seleccionado(s)`
                            : `Seleccionar ${label.toLowerCase()}`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={`Buscar ${label}...`} />
                        <CommandList>
                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                            <CommandGroup>
                                {data.map((item) => {
                                    const value = String(getOptionValue(item));
                                    const isSelected = selectedValues.includes(value);
                                    return (
                                        <CommandItem
                                            key={value}
                                            onSelect={() => toggleValue(value)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {getOptionLabel(item)}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Chips/Badges optimizados */}
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedItems.map((item) => {
                        const value = String(getOptionValue(item));
                        return (
                            <Badge
                                key={value}
                                variant="secondary"
                                className="rounded-full py-1 pl-3 pr-1 gap-1"
                            >
                                {getOptionLabel(item)}
                                <button
                                    type="button"
                                    onClick={(e) => handleRemove(e, value)}
                                    className="rounded-full outline-none hover:bg-destructive/20"
                                >
                                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}

            {/* Mensaje de Error */}
            {error && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    );
}

CustomMultiSelect.propTypes = {
    field: PropTypes.shape({
        value: PropTypes.array,
        onChange: PropTypes.func.isRequired,
    }).isRequired,
    data: PropTypes.array,
    label: PropTypes.string.isRequired,
    getOptionLabel: PropTypes.func.isRequired,
    getOptionValue: PropTypes.func.isRequired,
    error: PropTypes.string,
};