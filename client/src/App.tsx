import { useState, useEffect, useCallback } from 'react';
import { Router, Route, Switch, Link } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { Toaster } from '@/components/ui/toaster';
import Explorer from './pages/Explorer';
import Method from './pages/Method';
import { DIMENSIONS } from './lib/dimensions';

function App() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
  }, [dark]);

  return (
    <Router hook={useHashLocation}>
      <div className={dark ? 'dark' : 'light'}>
        <Toaster />
        <Switch>
          <Route path="/" component={Explorer} />
          <Route path="/method" component={Method} />
          <Route>
            <div className="flex items-center justify-center h-screen">
              <p className="text-muted-foreground">Pagina niet gevonden.</p>
            </div>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
