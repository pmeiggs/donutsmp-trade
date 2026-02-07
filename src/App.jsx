import Header from './components/Header';
import Marketplace from './components/Marketplace';

function App() {
  return (
    <div className="min-h-screen bg-mc-gray text-white">
      <Header />
      <main className="max-w-6xl mx-auto py-10">
        <h2 className="text-3xl font-bold px-4 mb-6">Community Listings</h2>
        <Marketplace />
      </main>
    </div>
  );
}

export default App;