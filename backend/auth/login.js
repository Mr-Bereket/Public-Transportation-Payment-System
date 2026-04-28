const router = require("express").Router();

router.post("/", (req, res) => {
  res.send("login");
});

module.exports = router;
