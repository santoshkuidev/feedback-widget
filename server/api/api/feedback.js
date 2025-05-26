// This file handles the duplicate path case (/api/api/feedback)
// It simply re-exports the main feedback handler
module.exports = require('../feedback.js');
