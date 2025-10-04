import Aladin from './components/aladin'

function App() {
  return (
    <Aladin 
      target={"18 03 57.94 -28 40 55.0"}
      projection={"STG"}
      survey={"CDS/P/Mellinger/color"}
      fullScreen={true}
      showSimbadPointerControl={true}
      showReticle={false}
      fov={60}
      realFullscreen={true}
    />
  )
}

export default App
