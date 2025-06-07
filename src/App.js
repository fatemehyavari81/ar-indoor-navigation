// import './App.css';
// import ARRealWorld from './component/ARRealWorld';
// import React from 'react';


// const App = () => {

//   return (
//     <div>
//       <ARRealWorld/>
//     </div>
//   );
// }


// export default App;


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RecognitionPage from './pages/RecognitionPage';
import NavigationPage from './pages/NavigationPage';
import ARScene from "./component/ARmap";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ar" element={<ARScene />} />
        <Route path="/recognition" element={<RecognitionPage />} />
        <Route path="/navigation" element={<NavigationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
