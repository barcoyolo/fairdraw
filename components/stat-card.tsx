export function StatCard({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "gold" | "alert" }) {
  const tones = {
    default: "bg-white",
    gold: "bg-[#fff8e7]",
    alert: "bg-[#fff1ef]"
  };

  return (
    <div className={`rounded-lg border border-civic-line p-4 ${tones[tone]}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-civic-ink/60">{label}</div>
      <div className="stat-number mt-2 text-3xl font-bold text-civic-ink">{value}</div>
    </div>
  );
}
