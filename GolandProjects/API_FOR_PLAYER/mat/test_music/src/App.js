
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import First_page from "./pages/1/first_page";
import Second_page from "./pages/2/second_page";
import Third_page from "./pages/3/third_page";
import "./global.scss"
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<First_page />} />
        <Route path="/second" element={<Second_page />} />
        <Route path="/third" element={<Third_page />} />
      </Routes>
    </Router>
  );
}