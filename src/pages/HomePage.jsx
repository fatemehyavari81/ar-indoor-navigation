import { useNavigate } from 'react-router-dom';
import ARmap from '../component/ARmap';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartAR = () => {
    navigate('/recognition');
  };

  return (
    <div className="bg-gray-50 flex flex-col items-left p-6">
        <p className="px-6 py-3 bg-violet-900 text-white font-medium rounded-lg hover:bg-violet-950 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2">
        See Map
      </p>
      <ARmap />

      <div className="text-center m-10">
        <h1 className="text-3xl font-bold text-violet-950">
          Welcome to AR Indoor Navigation
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Navigate indoors seamlessly with Augmented Reality. Follow the path to your destination!
        </p>
        <p className="text-sm text-gray-500 italic mt-4">
          Make sure your device supports AR for the best experience.
        </p>

      </div>
      <button
        onClick={handleStartAR}
        className="px-6 py-3 bg-violet-900 text-white font-medium rounded-lg hover:bg-violet-950 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
      >
        Start AR
      </button>
    </div>
  );
};

export default HomePage;
