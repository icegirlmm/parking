var mongoose = require('mongoose');
var db = 'mongodb://ice:19960423@39.106.212.83:27017/easypark'
mongoose.connect(db,{ useNewUrlParser: true });
var connection = mongoose.connection;
connection.on('connected', function() {
  console.log('Mongoose 连接到 example数据库');
}) 
connection.once('open', function(callback){
  console.log('数据库启动了');
  // app.listen(8080, () => console.log('Express server listening on port 8080'));
})

exports.mongoose = mongoose;