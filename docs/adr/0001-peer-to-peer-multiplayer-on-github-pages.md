# Peer-to-peer multiplayer on GitHub Pages

Multiplayer connects each juror's phone directly to the courtroom screen with PeerJS (WebRTC), while the game itself stays a static site on GitHub Pages. We chose this so friends can join with nothing but a link and a game code: no claude.ai account (which a Claude artifact "room" would require) and no server for us to host, pay for or maintain.

## Consequences

- The courtroom screen holds the game. If it closes, the game ends unless it can be reopened and jurors reconnect.
- PeerJS's free public broker is used only to introduce devices; if it is down, new games can't start.
- Some school and office networks block direct connections. The game must show a clear error; a relay server is a possible later fix.
