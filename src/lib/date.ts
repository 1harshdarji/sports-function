export const formatBookingDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);

  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1); // 🔥 ADD +1 DAY

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
