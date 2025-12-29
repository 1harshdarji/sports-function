export const formatBookingDate = (date: string) => {
  // date can be:
  // 1) "2025-12-29"
  // 2) "2025-12-28T18:30:00.000Z"
  // We ONLY want YYYY-MM-DD

  const onlyDate = date.split("T")[0]; // 🔥 key fix

  const [year, month, day] = onlyDate.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
