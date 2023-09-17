import type { Unit } from "@/types";

let users: { username: string }[] = [];
const gameState: Unit[] = [];

interface ClientWebSocketData {
  username: string;
}

Bun.serve<ClientWebSocketData>({
  port: 8080,
  fetch(req, server) {
    const success = server.upgrade(req, {
      // Set username
      data: {
        username: "käyttäjä_" + Math.random().toString(16).slice(12),
      },
    });

    return success
      ? undefined
      : new Response("Upgrade failed :(", { status: 500 });
  },
  websocket: {
    // New Client connects to the websockets
    open(ws) {
      const newUsername = { username: ws.data.username };
      users.push(newUsername);

      // Subscribe to pub/sub channel to send/receive broadcast messages,
      // without this the socket could not esnd event to other clients
      ws.subscribe("lobby");

      // Broadcast that a user joined
      // On the client side we can parse various messages by the type property
      ws.publish(
        "lobby",
        JSON.stringify({ type: "USERS_ADD", data: newUsername })
      );

      ws.send(JSON.stringify({ type: "USERS_SET", data: users }));
    },
    // Client sends a message
    message(ws, msg) {
      // Data sent is a string, parse to object
      const newMessage = JSON.parse(msg);
      newMessage.gameState.owner = ws.data.username;
      gameState.push(newMessage);
      ws.publish(
        "lobby",
        JSON.stringify({ type: "GAMESTATE_ADD", data: newMessage })
      );
    },
    // a client disconnects from the server
    close(ws) {
      users = users.filter((user) => user.username !== ws.data.username);

      ws.publish(
        "lobby",
        JSON.stringify({ type: "USERS_REMOVE", data: ws.data.username })
      );
    },
  },
});
