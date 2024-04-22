import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, useProgress, Preload } from "@react-three/drei";
import { useSDK } from '@metamask/sdk-react';

import Scene from "./Components/Scene"


function App() {
  const { progress } = useProgress();
  const [clicked, setClicked] = useState(null)
  const [account, setAccount] = useState("");
  const { sdk, connected, chainId } = useSDK();
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
      <div className="btn_div">
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

      <Canvas style={{ position: "absolute" }}>

        <ambientLight intensity={0.8} />
        <color attach="background" args={["#ddfdff"]} />
        <ScrollControls pages={15} infinite>
          <Scene position={[0, 0, 0]} clicked={clicked} setClicked={setClicked} />
        </ScrollControls>
        <Preload all />
      </Canvas>
      {
        clicked && <section className="scene__project project is-left is-project" data-scene-project="">
          <div className="project__overlay">
            <div className="project__back" onClick={() => setClicked(false)}>
              <div className="project__back-cta t-cta" >BACK</div>
              <div class="project__back-circle"></div>
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
