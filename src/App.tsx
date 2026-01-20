function App() {
  return (
    <div className="min-h-screen bg-game-bg text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-display font-bold text-accent mb-4">
          Fortune's Hand
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Card × Slot × Roulette Deckbuilder
        </p>
        <button className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg text-xl transition-colors">
          Start Game
        </button>
      </div>
    </div>
  );
}

export default App;
