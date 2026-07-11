import { IntroSplash } from "./features/intro/IntroSplash";
import { TvScreen } from "./features/tv/TvScreen";
import { GameStoreProvider } from "./state/useGameStore";

export default function App() {
  return (
    <GameStoreProvider>
      <IntroSplash>
        <TvScreen />
      </IntroSplash>
    </GameStoreProvider>
  );
}
