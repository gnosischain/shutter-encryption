import React from "react";
import ReactDOM from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "sonner";

import { Web3ModalProvider } from "@/components/Web3ModalProvider";
import App from "./App.tsx";
import "./index.css";
import { GraphQLProvider } from "./components/GraphQLProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NextUIProvider>
      <Web3ModalProvider>
        <GraphQLProvider>
          <App />

          <Toaster position="top-right" />
        </GraphQLProvider>
      </Web3ModalProvider>
    </NextUIProvider>
  </React.StrictMode>
);
