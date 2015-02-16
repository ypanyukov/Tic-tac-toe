var game = require('./modules/game-server');

var config = {
    PORT: 8184
};

var server = require('./modules/server').server(config.PORT);

if (server)
    game.socket(server);