
'use strict';
let mqtt    = require('mqtt');
let mysql = require('mysql');
var Pusher = require('pusher');
var pusher = new Pusher({  appId: '800319',  key: '99c5b7cba16d3fd2531f',  secret: '26d73deb169added355a',  cluster: 'ap2',  encrypted: true});

var con = mysql.createConnection({
	host: "localhost",
	user: "deepankar",
	password: "sanu30052",
	database: "feedback"
});
con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});
  
var options = {
	port: 1883,
	clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
	username: 'bsmqtt',
	password: 'blackspektro2019'

};

let client  = mqtt.connect('mqtt://139.59.30.17',options);
client.on('connect', function() { // When connected
	console.log("Connected to local MQTT");
});



client.subscribe("blackspektro/iot/feedback/bpcl");


let device_id="",sak="",button_id="",version=0;


client.on('message', function (topic, payload) 
{
	// message is Buffer
	console.log(payload.toString());
	console.log(typeof payload);
	if(topic=== "blackspektro/iot/feedback/bpcl")
	{	
		let obj= JSON.parse(payload);
		device_id=obj.device_id;
		button_id=obj.button_id;
		pubData(payload);
	}
});
let publishTopic="blackspektro/iot/feedback/bpcl/response"
function pubData(payload)
{
	let obj= JSON.parse(payload),
		device_id= String(obj.device_id),
		feedback_id = 0,
		button_id= String(obj.button_id);
		
		if(button_id == 'NO_FB')
		    feedback_id = 0;
		else if(button_id == 'BAD')
			feedback_id = 1;
		else if(button_id == 'GOOD')
			feedback_id = 3;			
		else
			feedback_id = 2;
			
	var queryString = 	"SELECT * FROM `user_devices` where `device_id` = '"+device_id+"'";
	console.log(queryString);
	con.query(queryString, function (err, result, fields) {
		if (err) throw err;
		console.log(result[0]);
		var user_id = result[0].user_id;
		var user_device_id =  result[0].device_id;
		var indiaTime =  new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
		var date1 = new Date(indiaTime);
        var date =  date1.getDate();
		var month = date1.getMonth();
		var year  = date1.getFullYear();
		var hrs =  date1.getHours();
		var min = date1.getMinutes();
		var sec = date1.getSeconds();
		var todayDate =  year+'-'+(month+1)+'-'+date+' '+hrs+':'+min+':'+sec; 
		console.log(todayDate);
		var insertquery = "INSERT INTO `user_feedback`(`user_id`,`user_device_id`,`feedback_id`,`created_at`,`updated_at`)  VALUES("+user_id+",'"+user_device_id+"',"+feedback_id+",'"+ todayDate+"','"+ todayDate+"')";
		console.log(insertquery);
		con.query(insertquery, function(err,result,fields){
			if(err) throw err;
                        console.log(result);
		});
	});
pusher.trigger('my-channel', 'my-event', {  "message": "hello world"});
	client.publish(publishTopic,payload);
}
