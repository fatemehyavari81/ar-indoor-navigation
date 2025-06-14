import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaTwitterSquare } from "react-icons/fa";

import ARmap from '../component/ARmap';


const features = [
  "Seamless indoor navigation with AR ",
  "Recognizes your environment instantly",
  "Multi-floor and restricted-area support",
  "Works smoothly with IoT location detection",
];

const faqs = [
  {
    question: "Does my device need AR support?",
    answer: "Yes, devices with ARKit (iOS) or ARCore (Android) provide the best experience.",
  },
  {
    question: "Is the camera always active?",
    answer: "Only while using AR features like environment detection and navigation.",
  },
  {
    question: "Can it work offline?",
    answer: "Some AR features require internet to retrieve the latest building data.",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedFloor, setSelectedFloor] = useState("1");

  const [isDark, setIsDark] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  const handleStartAR = () => navigate('/recognition');
  const toggleDarkMode = () => setIsDark(!isDark);

useEffect(() => {
    document.body.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className={`transition-colors duration-300 min-h-screen px-6 py-8 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

      {/* Header with toggle */}
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-violet-700 dark:text-violet-400">
          AR Indoor Navigation
        </h1>
        {/* <button
          onClick={toggleDarkMode}
          className="text-sm border px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;"
        >
          {isDark ? '☀  ' : '🌙  '}
        </button> */}
        <div className="relative">
        <input
          type="checkbox"
          id="checkbox"
          checked={isDark}
          onChange={() => setIsDark(!isDark)}
          className="sr-only"
        />
        <label
          htmlFor="checkbox"
          className="bg-black w-[50px] h-[26px] rounded-full flex justify-between items-center p-1 cursor-pointer relative"
        >
          <FaMoon className="text-yellow-400" />
          <FaSun className="text-orange-400" />
          <span
            className={`absolute top-[2px] left-[2px] bg-white w-[22px] h-[22px] rounded-full transition-transform duration-200 ${
              isDark ? "translate-x-6" : ""
            }`}
          ></span>
        </label>
      </div>
      </div>


      {/* Map Section with Floor Selector */}
      <section className="max-w-6xl mx-auto mb-12 ">
        <h2 className="text-xl font-semibold mb-3">Live Map Preview</h2>
        <div className="mb-6">
          <label htmlFor="floor-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Select Floor
          </label>
          <div className="relative">
            <select
              id="floor-select"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="block w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
            >
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
            </select>
            {/* Dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>


        {/* Map Display */}
        <div className="relative h-72 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
          {mapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/60 z-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent"></div>
            </div>
          )}
          <ARmap floor={selectedFloor} onLoad={() => setMapLoading(false)} />
        </div>
      </section>


      {/* Demo Video */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-xl font-semibold mb-4">Watch it in action</h2>
        <video
          src="/demo/ar-navigation-demo.mp4" // Replace with actual file
          controls
          autoPlay
          loop
          muted
          className="rounded-xl w-full shadow-md"
        />
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 mb-20">
        <div>
          <h2 className="text-2xl font-bold text-violet-700 dark:text-violet-400 mb-4">Why Use Our AR App?</h2>
          <ul className="list-disc pl-5 space-y-2 text-base leading-relaxed">
            {features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold text-violet-700 dark:text-violet-400 mb-4">FAQs & Tips</h2>
          <dl className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i}>
                <dt className="font-semibold">{faq.question}</dt>
                <dd className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Call to Action */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={handleStartAR}
          className="px-8 py-3 bg-violet-700 text-white font-semibold rounded-xl shadow-md hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-400 transition"
        >
          Start AR Navigation
        </button>
        <p className="text-xs italic text-gray-500 dark:text-gray-400">Ensure camera permission is enabled</p>
      </div>
    </div>
  );
};

export default HomePage;


