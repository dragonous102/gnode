import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Preload, Html } from "@react-three/drei";
import { useSDK } from '@metamask/sdk-react';
import { Atom } from "react-loading-indicators";
import Scene from "./Components/Scene"


function App() {
  const [clicked, setClicked] = useState(null)
  const [account, setAccount] = useState("");
  const { sdk, connected, chainId } = useSDK();
  const [isLoaded, setLoaded] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })
  const onMouseMove = e => {
    setCursorPosition({ top: e.clientY, left: e.clientX });
  }
  const onMouseLeave = e => {
    setCursorPosition({ top: "3vh", left: "3vw" });
  }
  // Effect for managing loading state
  useEffect(() => {
    // Simulate a loading process
    const timer = setTimeout(() => setLoaded(true), 2000); // e.g., 2 seconds load time
    return () => clearTimeout(timer);
  }, []);

  const connect = async () => {
    try {
      if (connected) {
        sdk?.disconnect();
      } else {
        const accounts = await sdk?.connect();
        setAccount(accounts?.[0]);
      }

    } catch (err) {
      console.warn(`failed to connect..`, err);
    }
  };
  return (
    <>
      {isLoaded && <div className="btn_div">
        <button className="connect_btn" onClick={connect}>
          {connected ? "Disconnect" : "Connect"}
        </button>
        {connected && (
          <div className="info_div">
            <>
              {chainId && `Connected chain: ${chainId}`}
              <p></p>
              {account && `Connected account: ${account}`}
            </>
          </div>
        )}
      </div>
      }

      <Canvas style={{ position: "absolute" }}>
        <Suspense fallback={<Html center><Atom color="#32cd32" size="large" text="Loading..." textColor="#90eb3c" /></Html>}>
          <ambientLight intensity={0.8} />
          <color attach="background" args={["#ddfdff"]} />
          <ScrollControls pages={15} infinite>
            <Scene position={[0, 0, 0]} clicked={clicked} setClicked={setClicked} />
          </ScrollControls>
          <Preload all />
        </Suspense>
      </Canvas>
      {
        clicked && <section className="scene__project project is-left is-project" data-scene-project="">
          <div className="project__overlay">
            <div className="back__wrapper" onMouseMove={onMouseMove} onMouseOut={onMouseLeave}>
              <div className="project__back" style={{ ...cursorPosition }} onClick={() => { setClicked(false), setCursorPosition({ top: "3vh", left: "3vw" }) }}  >
                <div className="project__back-cta t-cta" >BACK</div>
                <div className="project__back-circle"></div>
              </div>
            </div>

            <div className="project__outer">
              <div className="project__container">
                <div className="project__content">
                  <h2 className="project__title">Soloar System</h2>
                </div>
              </div>
            </div>

          </div>
        </section>
      }
    </>

  );
}




export default App;
