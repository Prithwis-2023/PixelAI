import ObserveDashboard from './ui/ObserveDashboard';
import CandidateList from './ui/CandidateList';
import RunCenter from './ui/RunCenter';

export default function App() {
  return (
    <main className="app-shell">
      <div className="col">
        <ObserveDashboard />
        <RunCenter />
      </div>
      <div className="col">
        <CandidateList />
      </div>
    </main>
  );
}
