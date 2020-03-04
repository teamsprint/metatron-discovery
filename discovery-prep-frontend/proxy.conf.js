const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/oauth",
      "/extensions"
    ],
    target: "http://metatron-web-05:8180",
    secure: false
  },
  {
    context: [
      "/stomp"
    ],
    target: "http://metatron-web-05:8180",
    secure: false
  }
];

module.exports = PROXY_CONFIG;
