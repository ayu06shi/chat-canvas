import { Route } from 'react-router-dom/cjs/react-router-dom.min';
import './App.css';
import Home from './pages/Home';
import Chat from './pages/Chat';
import bgImage from './bg1.jpg';

function App() {
  return (
    <div className="App  min-h-screen relative" style={{backgroundImage: `url(${bgImage})`}}>
      <Route path='/' component={Home} exact/>
      <Route path='/chats' component={Chat} />
    </div>
  );
}

export default App;

