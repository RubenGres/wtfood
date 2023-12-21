import './App.css';
import './MyCanvas'
import InfiniteCanvas from './InfiniteCanvas';
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {GoogleOAuthProvider} from '@react-oauth/google';

function App() {
    return (
        <InfiniteCanvas/>
  );
}

export default App;
