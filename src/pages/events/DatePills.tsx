interface Props {
  dates: string[];
  selected: string | null;
  onSelect: (d: string) => void;
}

export default function DatePills({ dates, selected, onSelect }: Props) {
  return (
    <div className="flex justify-center gap-3 mt-6">
      {dates.map(date => (
        <button
          key={date}
          onClick={() => onSelect(date)}
          className={`px-4 py-2 rounded-full border text-sm
            ${selected === date
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-muted"}
          `}
        >
          {date}
        </button>
      ))}
    </div>
  );
}
