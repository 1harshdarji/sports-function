interface Props {
  dates: string[];
  selected: string | null;
  onSelect: (d: string) => void;
}

export default function CalendarView({ dates, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-7 gap-2 mt-6 max-w-md mx-auto">
      {dates.map(date => (
        <button
          key={date}
          onClick={() => onSelect(date)}
          className={`h-10 rounded-lg text-sm
            ${selected === date
              ? "bg-primary text-white"
              : "bg-muted hover:bg-muted/70"}
          `}
        >
          {date.split("-")[2]}
        </button>
      ))}
    </div>
  );
}
