import { useState } from "react";
import PropTypes from "prop-types";
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function CustomSelect({ field, data = [], label, getOptionLabel, getOptionValue, error }) {
    const [open, setOpen] = useState(false);

    // Encontramos el label del item seleccionado para mostrarlo en el botón
    const selectedLabel = data.find(
        (item) => String(getOptionValue(item)) === String(field.value)
    );

    return (
        <div className="w-full space-y-1.5">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between rounded-xl font-normal text-base h-11 transition-all",
                            "border-input bg-background hover:bg-accent/50",
                            error && "border-destructive focus-visible:ring-destructive",
                            !field.value && "text-muted-foreground"
                        )}
                    >
                        <span className="truncate">
                            {selectedLabel ? getOptionLabel(selectedLabel) : `Seleccione ${label}`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-full min-w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                >
                    <Command>
                        <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
                        <CommandList>
                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                            <CommandGroup>
                                {data.map((item) => {
                                    const value = String(getOptionValue(item));
                                    const isSelected = String(field.value) === value;

                                    return (
                                        <CommandItem
                                            key={value}
                                            value={getOptionLabel(item)} // Permite buscar por el label
                                            onSelect={() => {
                                                field.onChange(value);
                                                setOpen(false);
                                            }}
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

            {/* Mensaje de error optimizado */}
            {error && (
                <p className="flex items-center gap-1.5 mt-1 text-sm font-medium text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    );
}

CustomSelect.propTypes = {
    field: PropTypes.shape({
        value: PropTypes.any,
        onChange: PropTypes.func.isRequired,
    }).isRequired,
    data: PropTypes.array,
    label: PropTypes.string.isRequired,
    getOptionLabel: PropTypes.func.isRequired,
    getOptionValue: PropTypes.func.isRequired,
    error: PropTypes.string,
};