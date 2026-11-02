import { AppProviders } from './src/app/AppProviders';
import { MiniApp } from './src/app/MiniApp';

export default function App() {
  return (
    <AppProviders>
      <MiniApp />
    </AppProviders>
  );
}
