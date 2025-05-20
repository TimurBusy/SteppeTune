import React from "react";
import ReactDOM from 'react-dom';
import App from './app/App.jsx';
import './index.scss';
import { createStore } from "redux";
import reducer from './reducers/reducer.js'; // ✅ один reducer
import { Provider } from 'react-redux';

const store = createStore(
    reducer, // ✅ используем ту переменную, которую импортировали
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
