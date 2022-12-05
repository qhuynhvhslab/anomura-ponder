
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log("server is running at " + PORT);
});