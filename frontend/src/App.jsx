import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LiveStream from "./Components/1_Live_Stream";
import UploadVideo from "./Components/2_Upload_Video";
import Process from "./Components/Process";
import LandingPage from "./Components/LandingPage";
import { ThreeDCardDemo } from "./Components/CardsChoice";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={"/"} element={<LandingPage />}></Route>
          <Route path={"/live"} element={<LiveStream />}></Route>
          <Route path={"/upload"} element={<UploadVideo />}></Route>
          <Route path="/process" element={<Process />}></Route>
          <Route path="/choice" element={<ThreeDCardDemo/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
