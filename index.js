var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var firebase = require('firebase');
require('firebase/auth');
require('firebase/database');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

var firebaseConfig = {
	"#######INSERT YOUR FIREBASE API HERE###########"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

app.get('/', function(req, res) {
	res.redirect('/login');
});

app.get('/login', function(req, res) {
	res.render('login');
});

app.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	const auth = firebase.auth();
	const promise = auth.signInWithEmailAndPassword(email, password);
	promise.catch((e) => console.log(e.message));
	auth.onAuthStateChanged((firebaseUser) => {
		if (firebaseUser) {
			var rootref = database.ref('PROFILES');
			rootref.child('USERS').on('value', function(snapshot) {
				// print who was log in
				console.log(snapshot.child(firebaseUser.uid).child('userName').val() + ' is Logged in!');
			});
			res.redirect('/dashboard');
		} else {
			//res.redirect('/login');
		}
	});
});

app.get('/postProduct', function(req, res) {
	res.render('postProduct');
});

app.post('/postProduct', function(req, res) {
	var about = req.body.description;
	var cat = req.body.protype;
	var extra = '';
	var maxquantity = req.body.stock;
	var proddate = req.body.dop;
	var proname = req.body.name;
	var proprice = req.body.price;

	var ref = database.ref('PRODUCTS').child('POSTS');
	ref.once('value', gotData, errData);
	function gotData(data) {
		//console.log(data.val()); // print in json format
		var products_in_DB = data.val();
		var keys = Object.keys(products_in_DB); // put all the data nodes in a list

		var auth = firebase.auth();
		auth.onAuthStateChanged((firebaseUser) => {
			if (firebaseUser) {
				uId = firebaseUser.uid;
				var obj = {
					// console.log(data.val()); // print in json format
					about: about,
					cat: cat,
					extra: extra,
					maxquantity: maxquantity,
					proddate: proddate,
					proname: proname,
					proprice: proprice,
					uid: uId
				};

				var rootref = database.ref('PRODUCTS');
				rootref.child('POSTS').child(keys.length).set(obj);
				res.redirect('/dashboard');
			}
		});
	}

	function errData(err) {
		console.log('Error!');
		console.log(err);
	}
});

app.get('/home', function(req, res) {
	res.render('home');
});

app.get('/register', function(req, res) {
	res.render('register');
});

app.post('/register', function(req, res) {
	var fname = req.body.fname;
	var lname = req.body.lname;
	var username = fname + ` ` + lname;
	var email = req.body.email;
	var password = req.body.password;
	var date = req.body.datepicker;
	var faddress = req.body.faddress;
	var laddress = req.body.laddess;
	var phone = req.body.phone;
	var location = faddress + ` ` + laddress;
	var pin = req.body.pin;
	const auth = firebase.auth();
	const promise = auth.createUserWithEmailAndPassword(email, password);
	promise.catch((e) => console.log(e.message));
	auth.onAuthStateChanged((firebaseUser) => {
		if (firebaseUser) {
			var obj = {
				dob: date,
				location: location,
				phonenumber: phone,
				pincode: pin,
				userEmail: email,
				userName: username
			};
			var rootref = database.ref('PROFILES');
			rootref.child('USERS').child(firebaseUser.uid).set(obj); // sending data to database
			console.log('Data Sent!');
			red.redirect('/login');
		} else {
			console.log('error');
			res.redirect('/register');
		}
	});
	res.redirect('/login');
});
app.get('/dashboard', function(req, res) {
	var ref = database.ref('PRODUCTS').child('POSTS');
	const auth = firebase.auth();
	ref.once('value', (data) => {
		var rootref = database.ref('PRODUCTS');
		rootref.child('POSTS').once('value', function(snapshot) {
			var tempdata = snapshot.val();
			// console.log(tempdata);
			auth.onAuthStateChanged((firebaseUser) => {
				if (firebaseUser) {
					var rootref = database.ref('PROFILES');
					rootref.child('USERS').on('value', function(snapshot) {
						var user = snapshot.child(firebaseUser.uid).child('userName').val();
						res.render('dashboard', { post: tempdata, currentuser: user });
					});
				}
			});
		});
	});
	// res.render('dashboard');
});

app.get('/myAccount', function(req, res) {
	var ref = database.ref('PROFILES');
	ref.child('USERS').on('value', function(snapshot) {
		console.log(snapshot.val());
	});
});

app.get('/productDetails', function(req, res) {
	res.render('productDetails');
});

app.get('/logout', function(req, res) {
	firebase
		.auth()
		.signOut()
		.then(function() {
			console.log('Logged Out Successfully!');
		})
		.catch(function(error) {
			console.log(error);
		});
	res.redirect('login');
});

app.listen(process.env.PORT || 3000, () => {
	console.log('SERVER IS RUNNING ON PORT 3000!');
});
