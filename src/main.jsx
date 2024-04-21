import React, { Suspense } from "react";
import { createRoot } from 'react-dom/client';
import "./index.css";
import App from "./App";
import { MetaMaskProvider } from '@metamask/sdk-react';

const container = document.getElementById('root');

const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
    <React.StrictMode>
        <MetaMaskProvider debug={false} sdkOptions={{
            logging: {
                developerMode: false,
            },
            communicationServerUrl: process.env.REACT_APP_COMM_SERVER_URL,
            checkInstallationImmediately: false, // This will automatically connect to MetaMask on page load
            dappMetadata: {
                name: "GNode React App",
                url: window.location.host,
            }
        }}>
            <App tab="home" />
        </MetaMaskProvider>
    </React.StrictMode>
);
