import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Whiteboard from './Components/Whiteboard';
import RoomDetails from './Components/RoomDetails';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/'
       element={<RoomDetails/>}>
   
      </Route>
      <Route path='/whiteboard' element={<Whiteboard/>}>
    
      </Route>
    </Routes>
    </BrowserRouter>

   
  );
}

export default App;
