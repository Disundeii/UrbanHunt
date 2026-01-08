import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HostLanding from './pages/HostLanding';
import HostLobby from './pages/HostLobby';
import PlayerLanding from './pages/PlayerLanding';
import PlayerGame from './pages/PlayerGame';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host/create" element={<HostLanding />} />
        <Route path="/host/:roomCode" element={<HostLobby />} />
        <Route path="/player" element={<PlayerLanding />} />
        <Route path="/player/:roomCode" element={<PlayerGame />} />
      </Routes>
    </Router>
  );
}

export default App;
