import { BrowserRouter, Route,  Routes } from 'react-router-dom'
import './App.css'
import LiveStream from './Components/1_Live_Stream'
import UploadVideo from './Components/2_Upload_Video'
import Process from './Components/Process'

function App() {
 

  return (
    <>
     <BrowserRouter>
     <Routes>
     <Route path={'/'} element={<LiveStream/>}></Route>
     <Route path={'/upload'} element={<UploadVideo/>}></Route>
     <Route path='/process' element={<Process/>}></Route>
     </Routes>

     
     </BrowserRouter>
    </>
  )
}

export default App
