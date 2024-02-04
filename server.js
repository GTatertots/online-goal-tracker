const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: false }));



app.listen(8080, function () {
	console.log('Server running on port 8080...');
});

