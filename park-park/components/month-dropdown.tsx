import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MonthDropdown({
  months,
  value, // <-- controlled selected month from parent
  onChange,
}: {
  months: { label: string; value: string }[];
  value: string;
  onChange: (month: string) => void;
}) {
  return (
    <Select
      value={value} // controlled value
      onValueChange={(val) => onChange(val)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a month" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
