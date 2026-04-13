import { Song } from "@riderdj/types";
import { WebSocket } from "ws";

export const songQueue = new Map<string, Song[]>();

export const rideSockets = new Map<string, Set<WebSocket>>();