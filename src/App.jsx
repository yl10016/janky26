import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Assessment from './pages/Assessment.jsx';
import Results from './pages/Results.jsx';
import Portfolio from './pages/Portfolio.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assess" element={<Assessment />} />
          <Route path="/results" element={<Results />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
