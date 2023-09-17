"use client";

import GameMapGrid from "@/components/game/GameMapGrid";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/");
    console.log(socket);

    socket.addEventListener("message", (event) => {
      console.log(event.data);
    });

    return socket.removeEventListener("message", () => {});
  }, []);

  return (
    <main className="flex min-h-screen flex-col justify-center items-center bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
      <GameMapGrid mapWidth={5} />
    </main>
  );
}
