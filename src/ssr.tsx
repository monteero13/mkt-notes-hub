/// <reference types="vinxi/types/server" />
import {
  createStartHandler,
  defaultRenderHandler,
} from "@tanstack/react-start/server";
import { getRouter } from "./router";

export default createStartHandler({
  createRouter: getRouter,
  renderHandler: defaultRenderHandler,
});
