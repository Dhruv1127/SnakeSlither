import { useEffect } from "react";
import "@fontsource/inter";

// Main App component for Snake Slither Game
function App() {
  useEffect(() => {
    // The game is initialized through the script tags in index.html
    // All game logic is handled by the vanilla JavaScript files
    console.log('React App mounted - Snake Slither game will initialize');
  }, []);

  // The game content is rendered through the HTML structure in index.html
  // This React app serves as a container and doesn't interfere with the game
  return null;
}

export default App;
