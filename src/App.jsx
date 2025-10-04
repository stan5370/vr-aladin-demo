import Aladin from './components/aladin'

function App() {
  return (
    <Aladin 
      target={"18 03 57.94 -28 40 55.0"}
      projection={"STG"}
      survey={"P/DSS2/color"}
      fullScreen={true}
      fov={60}
    />
  )
}

export default App
