import { phases } from './data/phases'
import { topics } from './data/topics'
import { quotes } from './data/quotes'
import { STORAGE_KEYS } from './utils/storage'
import { useDayQuote } from './hooks/useDayQuote'

function App() {
  const todayQuote = useDayQuote()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">
          🧭 Career Compass
        </h1>
        <p className="text-sm text-gray-400 mt-1">120-Day Learning Dashboard</p>
      </header>

      <main className="p-6">
        {/* Data foundation loaded — UI components coming in next prompt */}
        <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">📊 Data Foundation Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400">Phases</div>
              <div className="text-xl font-bold text-emerald-400">{phases.length}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400">Topics</div>
              <div className="text-xl font-bold text-blue-400">{topics.length}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400">Quotes</div>
              <div className="text-xl font-bold text-purple-400">{quotes.length}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400">Persistence</div>
              <div className="text-xl font-bold text-amber-400">✓ Ready</div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">💬 Today&apos;s Quote</h2>
          <blockquote className="text-gray-300 italic border-l-4 border-purple-500 pl-4">
            &ldquo;{todayQuote.text}&rdquo;
          </blockquote>
          <p className="text-sm text-gray-500 mt-2">— {todayQuote.author}</p>
        </section>

        <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold mb-2">🗂️ Persistent State Keys</h2>
          <ul className="text-sm text-gray-400 space-y-1 font-mono">
            {Object.values(STORAGE_KEYS).map((key) => (
              <li key={key}>✓ {key}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
