export default function DoDontCard({
  doList,
  dontList,
}: {
  doList: string[];
  dontList: string[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card">
        <h2 className="card-title text-codex-gold text-center">What to do</h2>
        <ul className="list-disc pl-4 space-y-2 text-sm">
          {doList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="card-title text-red-400 text-center">What to avoid</h2>
        <ul className="list-disc pl-4 space-y-2 text-sm">
          {dontList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
