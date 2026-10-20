import { createPinia } from "pinia";

/** 应用级 Pinia 实例，在 main.ts 中注册 */
export const pinia = createPinia();

export * from "./repo";
export * from "./chat";
export * from "./issues";
