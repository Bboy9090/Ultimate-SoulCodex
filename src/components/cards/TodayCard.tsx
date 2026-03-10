export default function TodayCard(){

  return(

    <div className="card">

      <h2 className="card-title">
        Today's Focus
      </h2>

      <p className="card-subtitle">
        Operate with calm logic. Avoid unnecessary emotional reactions.
      </p>

      <div className="mt-4">

        <p className="text-sm text-codex-gold">Do</p>

        <ul className="list-disc pl-4 text-sm">
          <li>Finish a priority task</li>
          <li>Protect your attention</li>
          <li>Observe reactions</li>
        </ul>

      </div>

      <div className="mt-4">

        <p className="text-sm text-red-400">Don't</p>

        <ul className="list-disc pl-4 text-sm">
          <li>Rush decisions</li>
          <li>Engage in unnecessary conflict</li>
        </ul>

      </div>

    </div>

  )
}
