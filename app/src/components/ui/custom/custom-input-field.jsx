import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export const CustomInputField = ({ label, error, ...props }) => (
    <div className="mb-4">
        <Label className="block mb-1 text-sm font-medium">{label}</Label>
        <Input {...props}  className={cn(
        "w-full rounded-xl border border-gray-300 shadow-sm text-base",
        "placeholder:text-gray-400 bg-transparent hover:bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200",
        error && "border-red-500 focus:border-red-500 focus:ring-red-300"
      )} />
        {/* Mensaje de error */}
    {error && (
      <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    )}
    </div>
);

CustomInputField.propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string,
};