import { createApp } from "./server.js";

const port = Number(process.env.PORT || 3000);
createApp().listen(port, () => console.log(`notes listening on http://localhost:${port}`));
