export function QrCode({ value }: { value: string }) {
  const seed = [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const cells = Array.from({ length: 121 }, (_, index) => {
    const row = Math.floor(index / 11);
    const col = index % 11;
    const finder =
      (row < 3 && col < 3) ||
      (row < 3 && col > 7) ||
      (row > 7 && col < 3);
    return finder || ((index * 17 + seed + row * col) % 5 < 2);
  });

  return (
    <div aria-label={`QR code for ${value}`} className="grid aspect-square w-full grid-cols-11 gap-1 rounded-lg bg-white p-4 shadow-civic">
      {cells.map((active, index) => (
        <span key={index} className={active ? "rounded-sm bg-civic-ink" : "rounded-sm bg-civic-paper"} />
      ))}
    </div>
  );
}
