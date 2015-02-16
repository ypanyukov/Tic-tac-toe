var sessionDefault = function () {
    return {
        players: [],
        startValue: !!Math.round(Math.random())
    };
};

var checkWin = function (moves) {
    var gameOver = false,
    // [0, 1, 2]
    // [3, 4, 5]
    // [6, 7, 8]
        winCombination = [
            [0, 1, 2],
            [0, 3, 6],
            [3, 4, 5],
            [6, 7, 8],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

    winCombination.every(function (combination) {
        if (moves.length !== combination.length)
            return false;

        moves.every(function (move) {
            gameOver = Boolean(combination.indexOf(move) + 1);
            return gameOver;
        });
        return !gameOver;
    });

    return gameOver;
};

var deleteElement = function (inputData, key) {
    var returnData;
    if (inputData instanceof Array) {
        returnData = [];
        inputData.forEach(function (element, index) {
            if (key !== index)
                returnData.push(element);
        });
    }
    else if (inputData instanceof Object) {
        returnData = new Object();
        Object.keys(inputData).forEach(function (index) {
            if (key !== index)
                returnData[index] = inputData[index];
        });
    }
    return returnData;
};

exports.socket = function (server) {
    var io = require('socket.io').listen(server),
        clients = {},
        sessions = [],
        sessionId = 0,
        currentSessionId = false;

    io.set('log level', 1);

    io.sockets.on('connection', function (socket) {

        if (currentSessionId !== sessionId)
            currentSessionId = sessionId;

        if (!sessions[currentSessionId])
            sessions[currentSessionId] = sessionDefault();

        socket.on('clientCookie', function (data) {
            var clientUpdateData = {};

            if (!clients[data.value])
                sessions[currentSessionId].players.push(data.value);

            if (!clients[data.value])
                clients[data.value] = {
                    sessionId: currentSessionId,
                    value: (sessions[currentSessionId].players.length == 1) ? sessions[currentSessionId].startValue : !sessions[currentSessionId].startValue,
                    next: (sessions[currentSessionId].players.length == 1) ? sessions[currentSessionId].startValue : !sessions[currentSessionId].startValue,
                    moves: [],
                    roomId: 'room' + currentSessionId
                };

            socket.join(clients[data.value].roomId);

            Object.keys(clients).forEach(function (clientId) {
                if (clients[clientId].sessionId == currentSessionId)
                    clientUpdateData[clientId] = clients[clientId];
            });

            if (sessions[currentSessionId].players.length == 2) {
                io.sockets.in(clients[data.value].roomId).emit('updateData', clientUpdateData);
                sessionId++;
            }

            socket.on('clickToCell', function (data) {
                var movesSum = 0;

                if (!clients[data.cookieId].next)
                    return;

                clients[data.cookieId].moves.push(data.id);

                sessions[currentSessionId].players.forEach(function (clientId) {
                    clients[clientId].next = !clients[clientId].next;
                    movesSum += clients[clientId].moves.length;
                });

                var gameOver = (movesSum == 9) || checkWin(clients[data.cookieId].moves);

                io.sockets.in(clients[data.cookieId].roomId).emit('rivalMakeMove', {
                    client: clients[data.cookieId],
                    gameOver: gameOver
                });

                if (gameOver) {
                    sessions[currentSessionId].players.forEach(function (clientId) {
                        clients = deleteElement(clients, clientId);
                    });

                    sessions = deleteElement(sessions, currentSessionId);
                }
            });
        });
    });
};