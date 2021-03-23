import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import App from './app/layout/App';
import { store, StoreContext } from './app/stores/store';

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </StoreContext.Provider>,
  document.getElementById('root')
);
