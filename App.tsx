import { AppProviders } from './src/app/AppProviders';
import { MiniApp } from './src/app/MiniApp';
import { ThemeOverride } from './src/shared/theme/index';

export default function App() {
  return (
    <AppProviders>
      <ThemeOverride appearance="light">
        <MiniApp />
      </ThemeOverride>
    </AppProviders>
  );
}
