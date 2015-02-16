

exports.getContentType = function(ext){
    var contentType = "";

    ext = ext.replace('.', '');

    switch(ext){
        case 'html':
            contentType = 'text/html';
            break;
        case 'json':
            contentType = 'application/json';
            break;
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        case 'jpg':
            contentType = 'image/jpeg';
            break;
        case 'png':
            contentType = 'image/png';
            break;
        case 'gif':
            contentType = 'image/gif';
            break;
        case 'ico':
            contentType = 'image/x-icon';
            break;
        default:
            contentType = 'text/plain';
            break;
    }
};