--- PAGE 1 ---
User  Authentication,  Authorization,  and  
Secure
 
Session
 
Management
 
in
 
Express.js:
 
Complete
 
Learning
 
Tutorial
 Table  of  Contents  
1.  Authentication  vs  Authorization  2.  Implementing  Authentication  using  Bcrypt  3.  Persistent  Login  with  Sessions  4.  Passport.js  Integration  5.  Adding  Authorization  using  Middleware  6.  Practice  Problems  
1.  Authentication  vs  Authorization  
Understanding  the  Difference  
Authentication  answers  the  question:  “Who  are  you?”  ●  Process  of  verifying  the  identity  of  a  user  ●  Confirms  that  users  are  who  they  claim  to  be  ●  Typically  done  through  username/password,  tokens,  biometrics,  etc.  Authorization  answers  the  question:  “What  are  you  allowed  to  do?”  ●  Process  of  verifying  what  resources  a  user  can  access  ●  Determines  permissions  and  access  rights  ●  Happens  after  authentication  
Real-World  Analogy  
Think  of  an  airport  security  system:  Authentication:  Showing  your  passport  at  check-in  to  prove  your  identity  Authorization:  Your  boarding  pass  determines  which  gates  and  lounges  you  can  access  
Example  Scenario  
//  Authentication:  User  logs  in  
POST
 
/login
 
Body:
 
{
 
username:
 
"john",
 
password:
 
"secret123"
 
}
 
Response:
 
{
 
token:
 
"xyz789",
 
user:
 
{
 
id:
 
1,
 
name:
 
"John",
 
role:
 
"user"
 
}
 
}
 
 
//
 
Authorization:
 
User
 
tries
 
to
 
access
 
admin
 
panel
 

--- PAGE 2 ---
GET  /admin/users  
Headers:
 
{
 
Authorization:
 
"Bearer
 
xyz789"
 
}
 
Response:
 
403
 
Forbidden
 
-
 
"You
 
don't
 
have
 
admin
 
privileges"
 
 
//
 
Authorization:
 
User
 
accesses
 
their
 
own
 
profile
 
GET
 
/profile
 
Headers:
 
{
 
Authorization:
 
"Bearer
 
xyz789"
 
}
 
Response:
 
200
 
OK
 
-
 
{
 
profile
 
data
 
}
 
 
Common  Authentication  Methods  
Session-Based  Authentication:  Server  stores  session  data,  sends  session  ID  to  client  Token-Based  Authentication  (JWT):  Server  creates  signed  token,  client  stores  and  sends  with  
each
 
request
 OAuth:  Third-party  authentication  (Google,  Facebook,  etc.)  Multi-Factor  Authentication  (MFA):  Combines  multiple  verification  methods  
Common  Authorization  Strategies  
Role-Based  Access  Control  (RBAC):  Users  assigned  roles  (admin,  user,  guest),  roles  have  
permissions
 Attribute-Based  Access  Control  (ABAC):  Access  based  on  attributes  (department,  location,  
time)
 Permission-Based:  Direct  assignment  of  specific  permissions  to  users  
2.  Implementing  Authentication  using  Bcrypt  
What  is  Bcrypt?  
Bcrypt  is  a  password  hashing  function  designed  to  be  slow  and  computationally  expensive,  
making
 
it
 
resistant
 
to
 
brute-force
 
attacks.
 Key  Features:  ●  One-way  hashing  (cannot  be  reversed)  ●  Built-in  salt  generation  ●  Adaptive  (can  increase  computational  cost  over  time)  ●  Industry  standard  for  password  security  
Installing  Bcrypt  
npm  install  bcrypt  
 

--- PAGE 3 ---
Example  1:  Basic  Password  Hashing  
const  bcrypt  =  require('bcrypt');  
 
//
 
Number
 
of
 
salt
 
rounds
 
(higher
 
=
 
more
 
secure
 
but
 
slower)
 
const
 
SALT_ROUNDS
 
=
 
10;
 
 
//
 
Hash
 
a
 
password
 
async
 
function
 
hashPassword(plainPassword)
 
{
 
  
try
 
{
 
    
const
 
hashedPassword
 
=
 
await
 
bcrypt.hash(plainPassword,
 
SALT_ROUNDS);
 
    
console.log('Plain
 
Password:',
 
plainPassword);
 
    
console.log('Hashed
 
Password:',
 
hashedPassword);
 
    
return
 
hashedPassword;
 
  
}
 
catch
 
(error)
 
{
 
    
console.error('Error
 
hashing
 
password:',
 
error);
 
    
throw
 
error;
 
  
}
 
}
 
 
//
 
Compare
 
password
 
with
 
hash
 
async
 
function
 
verifyPassword(plainPassword,
 
hashedPassword)
 
{
 
  
try
 
{
 
    
const
 
match
 
=
 
await
 
bcrypt.compare(plainPassword,
 
hashedPassword);
 
    
console.log('Password
 
match:',
 
match);
 
    
return
 
match;
 
  
}
 
catch
 
(error)
 
{
 
    
console.error('Error
 
verifying
 
password:',
 
error);
 
    
throw
 
error;
 
  
}
 
}
 
 
//
 
Demo
 
async
 
function
 
demo()
 
{
 
  
const
 
password
 
=
 
'mySecurePassword123!';
 
  
 
  
//
 
Hash
 
the
 
password
 
  
const
 
hash
 
=
 
await
 
hashPassword(password);
 
  
 
  
//
 
Verify
 
correct
 
password
 
  
await
 
verifyPassword('mySecurePassword123!',
 
hash);
 
//
 
true
 
  
 
  
//
 
Verify
 
incorrect
 
password
 
  
await
 
verifyPassword('wrongPassword',
 
hash);
 
//
 
false
 
}
 
 

--- PAGE 4 ---
demo();  
 Output:  Plain  Password:  mySecurePassword123!  
Hashed
 
Password:
 
$2b$10$xYzAbC123...
 
Password
 
match:
 
true
 
Password
 
match:
 
false
 
 
Example  2:  User  Registration  with  Bcrypt  
const  express  =  require('express');  
const
 
bcrypt
 
=
 
require('bcrypt');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
//
 
Simulated
 
database
 
const
 
users
 
=
 
[];
 
 
//
 
Password
 
validation
 
function
 
function
 
validatePassword(password)
 
{
 
  
const
 
minLength
 
=
 
8;
 
  
const
 
hasUpperCase
 
=
 
/[A-Z]/.test(password);
 
  
const
 
hasLowerCase
 
=
 
/[a-z]/.test(password);
 
  
const
 
hasNumbers
 
=
 
/\d/.test(password);
 
  
const
 
hasSpecialChar
 
=
 
/[!@#$%^&*(),.?":{}|<>]/.test(password);
 
 
  
const
 
errors
 
=
 
[];
 
 
  
if
 
(password.length
 
<
 
minLength)
 
{
 
    
errors.push(`Password
 
must
 
be
 
at
 
least
 
${minLength}
 
characters
 
long`);
 
  
}
 
  
if
 
(!hasUpperCase)
 
{
 
    
errors.push('Password
 
must
 
contain
 
at
 
least
 
one
 
uppercase
 
letter');
 
  
}
 
  
if
 
(!hasLowerCase)
 
{
 
    
errors.push('Password
 
must
 
contain
 
at
 
least
 
one
 
lowercase
 
letter');
 
  
}
 
  
if
 
(!hasNumbers)
 
{
 
    
errors.push('Password
 
must
 
contain
 
at
 
least
 
one
 
number');
 
  
}
 
  
if
 
(!hasSpecialChar)
 
{
 

--- PAGE 5 ---
    errors.push('Password  must  contain  at  least  one  special  
character');
 
  
}
 
 
  
return
 
{
 
    
isValid:
 
errors.length
 
===
 
0,
 
    
errors:
 
errors
 
  
};
 
}
 
 
//
 
Register
 
endpoint
 
app.post('/register',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
{
 
username,
 
email,
 
password
 
}
 
=
 
req.body;
 
 
    
//
 
Validate
 
input
 
    
if
 
(!username
 
||
 
!email
 
||
 
!password)
 
{
 
      
return
 
res.status(400).json({
 
        
error:
 
'Username,
 
email,
 
and
 
password
 
are
 
required'
 
      
});
 
    
}
 
 
    
//
 
Validate
 
password
 
strength
 
    
const
 
passwordValidation
 
=
 
validatePassword(password);
 
    
if
 
(!passwordValidation.isValid)
 
{
 
      
return
 
res.status(400).json({
 
        
error:
 
'Password
 
does
 
not
 
meet
 
requirements',
 
        
details:
 
passwordValidation.errors
 
      
});
 
    
}
 
 
    
//
 
Check
 
if
 
user
 
already
 
exists
 
    
const
 
existingUser
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 
    
if
 
(existingUser)
 
{
 
      
return
 
res.status(409).json({
 
        
error:
 
'User
 
with
 
this
 
email
 
already
 
exists'
 
      
});
 
    
}
 
 
    
//
 
Hash
 
password
 
    
const
 
hashedPassword
 
=
 
await
 
bcrypt.hash(password,
 
10);
 
 
    
//
 
Create
 
user
 
object
 
    
const
 
newUser
 
=
 
{
 
      
id:
 
users.length
 
+
 
1,
 
      
username:
 
username,
 
      
email:
 
email,
 
      
password:
 
hashedPassword,
 

--- PAGE 6 ---
      createdAt:  new  Date().toISOString()  
    
};
 
 
    
//
 
Save
 
user
 
    
users.push(newUser);
 
 
    
//
 
Return
 
user
 
without
 
password
 
    
res.status(201).json({
 
      
message:
 
'User
 
registered
 
successfully',
 
      
user:
 
{
 
        
id:
 
newUser.id,
 
        
username:
 
newUser.username,
 
        
email:
 
newUser.email,
 
        
createdAt:
 
newUser.createdAt
 
      
}
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
console.error('Registration
 
error:',
 
error);
 
    
res.status(500).json({
 
error:
 
'Registration
 
failed'
 
});
 
  
}
 
});
 
 
//
 
Login
 
endpoint
 
app.post('/login',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
{
 
email,
 
password
 
}
 
=
 
req.body;
 
 
    
//
 
Validate
 
input
 
    
if
 
(!email
 
||
 
!password)
 
{
 
      
return
 
res.status(400).json({
 
        
error:
 
'Email
 
and
 
password
 
are
 
required'
 
      
});
 
    
}
 
 
    
//
 
Find
 
user
 
    
const
 
user
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 
    
if
 
(!user)
 
{
 
      
return
 
res.status(401).json({
 
        
error:
 
'Invalid
 
credentials'
 
      
});
 
    
}
 
 
    
//
 
Verify
 
password
 
    
const
 
isValidPassword
 
=
 
await
 
bcrypt.compare(password,
 
user.password);
 
    
if
 
(!isValidPassword)
 
{
 
      
return
 
res.status(401).json({
 

--- PAGE 7 ---
        error:  'Invalid  credentials'  
      
});
 
    
}
 
 
    
//
 
Login
 
successful
 
    
res.json({
 
      
message:
 
'Login
 
successful',
 
      
user:
 
{
 
        
id:
 
user.id,
 
        
username:
 
user.username,
 
        
email:
 
user.email
 
      
}
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
console.error('Login
 
error:',
 
error);
 
    
res.status(500).json({
 
error:
 
'Login
 
failed'
 
});
 
  
}
 
});
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 
Example  3:  Password  Reset  Functionality  
const  express  =  require('express');  
const
 
bcrypt
 
=
 
require('bcrypt');
 
const
 
crypto
 
=
 
require('crypto');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
//
 
Simulated
 
databases
 
const
 
users
 
=
 
[];
 
const
 
resetTokens
 
=
 
new
 
Map();
 
//
 
email
 
->
 
{
 
token,
 
expires
 
}
 
 
//
 
Request
 
password
 
reset
 
app.post('/forgot-password',
 
(req,
 
res)
 
=>
 
{
 
  
const
 
{
 
email
 
}
 
=
 
req.body;
 
 
  
//
 
Find
 
user
 
  
const
 
user
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 
  
if
 
(!user)
 
{
 
    
//
 
Don't
 
reveal
 
if
 
email
 
exists
 
(security
 
best
 
practice)
 

--- PAGE 8 ---
    return  res.json({  
      
message:
 
'If
 
the
 
email
 
exists,
 
a
 
reset
 
link
 
has
 
been
 
sent'
 
    
});
 
  
}
 
 
  
//
 
Generate
 
reset
 
token
 
  
const
 
resetToken
 
=
 
crypto.randomBytes(32).toString('hex');
 
  
const
 
expires
 
=
 
Date.now()
 
+
 
3600000;
 
//
 
1
 
hour
 
 
  
//
 
Store
 
token
 
  
resetTokens.set(email,
 
{
 
token:
 
resetToken,
 
expires:
 
expires
 
});
 
 
  
//
 
In
 
production,
 
send
 
email
 
with
 
reset
 
link
 
  
console.log(`Reset
 
link:
 
http://localhost:3000/reset-password?token=${resetToken}&email=${email
}`);
 
 
  
res.json({
 
    
message:
 
'If
 
the
 
email
 
exists,
 
a
 
reset
 
link
 
has
 
been
 
sent',
 
    
//
 
Only
 
for
 
demo
 
purposes
 
-
 
remove
 
in
 
production
 
    
resetLink:
 
`http://localhost:3000/reset-password?token=${resetToken}&email=${emai
l}`
 
  
});
 
});
 
 
//
 
Reset
 
password
 
app.post('/reset-password',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
{
 
email,
 
token,
 
newPassword
 
}
 
=
 
req.body;
 
 
    
//
 
Validate
 
input
 
    
if
 
(!email
 
||
 
!token
 
||
 
!newPassword)
 
{
 
      
return
 
res.status(400).json({
 
        
error:
 
'Email,
 
token,
 
and
 
new
 
password
 
are
 
required'
 
      
});
 
    
}
 
 
    
//
 
Verify
 
token
 
    
const
 
resetData
 
=
 
resetTokens.get(email);
 
    
if
 
(!resetData)
 
{
 
      
return
 
res.status(400).json({
 
        
error:
 
'Invalid
 
or
 
expired
 
reset
 
token'
 
      
});
 
    
}
 
 
    
if
 
(resetData.token
 
!==
 
token)
 
{
 
      
return
 
res.status(400).json({
 

--- PAGE 9 ---
        error:  'Invalid  or  expired  reset  token'  
      
});
 
    
}
 
 
    
if
 
(Date.now()
 
>
 
resetData.expires)
 
{
 
      
resetTokens.delete(email);
 
      
return
 
res.status(400).json({
 
        
error:
 
'Reset
 
token
 
has
 
expired'
 
      
});
 
    
}
 
 
    
//
 
Find
 
user
 
    
const
 
user
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 
    
if
 
(!user)
 
{
 
      
return
 
res.status(404).json({
 
error:
 
'User
 
not
 
found'
 
});
 
    
}
 
 
    
//
 
Hash
 
new
 
password
 
    
const
 
hashedPassword
 
=
 
await
 
bcrypt.hash(newPassword,
 
10);
 
 
    
//
 
Update
 
password
 
    
user.password
 
=
 
hashedPassword;
 
    
user.passwordChangedAt
 
=
 
new
 
Date().toISOString();
 
 
    
//
 
Remove
 
used
 
token
 
    
resetTokens.delete(email);
 
 
    
res.json({
 
      
message:
 
'Password
 
reset
 
successfully'
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
console.error('Password
 
reset
 
error:',
 
error);
 
    
res.status(500).json({
 
error:
 
'Password
 
reset
 
failed'
 
});
 
  
}
 
});
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 
3.  Persistent  Login  with  Sessions  

--- PAGE 10 ---
What  is  Persistent  Login?  
Persistent  login  allows  users  to  remain  logged  in  even  after  closing  the  browser  or  across  
multiple
 
visits
 
to
 
the
 
application.
 Implementation  approaches:  ●  Long-lived  session  cookies  ●  “Remember  me”  tokens  ●  Refresh  tokens  
Example  1:  Basic  Session-Based  Authentication  
const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
const
 
bcrypt
 
=
 
require('bcrypt');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
//
 
Configure
 
session
 
app.use(session({
 
  
secret:
 
'your-secret-key-change-in-production',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false,
 
  
cookie:
 
{
 
    
secure:
 
false,
 
//
 
Set
 
to
 
true
 
in
 
production
 
with
 
HTTPS
 
    
httpOnly:
 
true,
 
    
maxAge:
 
24
 
*
 
60
 
*
 
60
 
*
 
1000
 
//
 
24
 
hours
 
  
}
 
}));
 
 
//
 
Simulated
 
database
 
const
 
users
 
=
 
[
 
  
{
 
    
id:
 
1,
 
    
username:
 
'john_doe',
 
    
email:
 
'john@example.com',
 
    
password:
 
'$2b$10$XYZ...'
 
//
 
Pre-hashed
 
password
 
  
}
 
];
 
 
//
 
Authentication
 
middleware
 
const
 
isAuthenticated
 
=
 
(req,
 
res,
 
next)
 
=>
 
{
 
  
if
 
(req.session.userId)
 
{
 
    
return
 
next();
 
  
}
 
  
res.status(401).json({
 
error:
 
'Please
 
login
 
to
 
access
 
this
 
resource'
 

--- PAGE 11 ---
});  
};
 
 
//
 
Register
 
endpoint
 
app.post('/register',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
{
 
username,
 
email,
 
password
 
}
 
=
 
req.body;
 
 
    
//
 
Check
 
if
 
user
 
exists
 
    
if
 
(users.find(u
 
=>
 
u.email
 
===
 
email))
 
{
 
      
return
 
res.status(409).json({
 
error:
 
'User
 
already
 
exists'
 
});
 
    
}
 
 
    
//
 
Hash
 
password
 
    
const
 
hashedPassword
 
=
 
await
 
bcrypt.hash(password,
 
10);
 
 
    
//
 
Create
 
user
 
    
const
 
newUser
 
=
 
{
 
      
id:
 
users.length
 
+
 
1,
 
      
username,
 
      
email,
 
      
password:
 
hashedPassword
 
    
};
 
 
    
users.push(newUser);
 
 
    
//
 
Create
 
session
 
    
req.session.userId
 
=
 
newUser.id;
 
    
req.session.username
 
=
 
newUser.username;
 
 
    
res.status(201).json({
 
      
message:
 
'User
 
registered
 
successfully',
 
      
user:
 
{
 
        
id:
 
newUser.id,
 
        
username:
 
newUser.username,
 
        
email:
 
newUser.email
 
      
}
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
res.status(500).json({
 
error:
 
'Registration
 
failed'
 
});
 
  
}
 
});
 
 
//
 
Login
 
endpoint
 
app.post('/login',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
{
 
email,
 
password
 
}
 
=
 
req.body;
 

--- PAGE 12 ---
 
    
//
 
Find
 
user
 
    
const
 
user
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 
    
if
 
(!user)
 
{
 
      
return
 
res.status(401).json({
 
error:
 
'Invalid
 
credentials'
 
});
 
    
}
 
 
    
//
 
Verify
 
password
 
    
const
 
isValid
 
=
 
await
 
bcrypt.compare(password,
 
user.password);
 
    
if
 
(!isValid)
 
{
 
      
return
 
res.status(401).json({
 
error:
 
'Invalid
 
credentials'
 
});
 
    
}
 
 
    
//
 
Create
 
session
 
    
req.session.userId
 
=
 
user.id;
 
    
req.session.username
 
=
 
user.username;
 
 
    
res.json({
 
      
message:
 
'Login
 
successful',
 
      
user:
 
{
 
        
id:
 
user.id,
 
        
username:
 
user.username,
 
        
email:
 
user.email
 
      
}
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
res.status(500).json({
 
error:
 
'Login
 
failed'
 
});
 
  
}
 
});
 
 
//
 
Check
 
authentication
 
status
 
app.get('/auth/status',
 
(req,
 
res)
 
=>
 
{
 
  
if
 
(req.session.userId)
 
{
 
    
const
 
user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
req.session.userId);
 
    
res.json({
 
      
authenticated:
 
true,
 
      
user:
 
{
 
        
id:
 
user.id,
 
        
username:
 
user.username,
 
        
email:
 
user.email
 
      
}
 
    
});
 
  
}
 
else
 
{
 
    
res.json({
 
authenticated:
 
false
 
});
 
  
}
 
});
 
 

--- PAGE 13 ---
//  Protected  route  
app.get('/profile',
 
isAuthenticated,
 
(req,
 
res)
 
=>
 
{
 
  
const
 
user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
req.session.userId);
 
  
res.json({
 
    
user:
 
{
 
      
id:
 
user.id,
 
      
username:
 
user.username,
 
      
email:
 
user.email
 
    
}
 
  
});
 
});
 
 
//
 
Logout
 
app.post('/logout',
 
(req,
 
res)
 
=>
 
{
 
  
req.session.destroy((err)
 
=>
 
{
 
    
if
 
(err)
 
{
 
      
return
 
res.status(500).json({
 
error:
 
'Logout
 
failed'
 
});
 
    
}
 
    
res.clearCookie('connect.sid');
 
    
res.json({
 
message:
 
'Logged
 
out
 
successfully'
 
});
 
  
});
 
});
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 
Example  2:  “Remember  Me”  Functionality  
const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
const
 
cookieParser
 
=
 
require('cookie-parser');
 
const
 
bcrypt
 
=
 
require('bcrypt');
 
const
 
crypto
 
=
 
require('crypto');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
app.use(cookieParser('cookie-secret-key'));
 
 
app.use(session({
 
  
secret:
 
'session-secret-key',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false,
 
  
cookie:
 
{
 
    
secure:
 
false,
 

--- PAGE 14 ---
    httpOnly:  true,  
    
maxAge:
 
3600000
 
//
 
1
 
hour
 
for
 
regular
 
session
 
  
}
 
}));
 
 
//
 
Databases
 
const
 
users
 
=
 
[];
 
const
 
rememberTokens
 
=
 
new
 
Map();
 
//
 
token
 
->
 
userId
 
 
//
 
Generate
 
secure
 
token
 
function
 
generateToken()
 
{
 
  
return
 
crypto.randomBytes(32).toString('hex');
 
}
 
 
//
 
Middleware
 
to
 
check
 
remember
 
me
 
token
 
const
 
checkRememberMe
 
=
 
async
 
(req,
 
res,
 
next)
 
=>
 
{
 
  
//
 
If
 
already
 
authenticated
 
via
 
session,
 
continue
 
  
if
 
(req.session.userId)
 
{
 
    
return
 
next();
 
  
}
 
 
  
//
 
Check
 
for
 
remember
 
me
 
token
 
  
const
 
rememberToken
 
=
 
req.signedCookies.rememberMe;
 
  
 
  
if
 
(rememberToken
 
&&
 
rememberTokens.has(rememberToken))
 
{
 
    
const
 
userId
 
=
 
rememberTokens.get(rememberToken);
 
    
const
 
user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
userId);
 
 
    
if
 
(user)
 
{
 
      
//
 
Create
 
new
 
session
 
      
req.session.userId
 
=
 
user.id;
 
      
req.session.username
 
=
 
user.username;
 
      
console.log('User
 
authenticated
 
via
 
remember
 
me
 
token');
 
    
}
 
  
}
 
 
  
next();
 
};
 
 
app.use(checkRememberMe);
 
 
//
 
Login
 
with
 
remember
 
me
 
app.post('/login',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
{
 
email,
 
password,
 
rememberMe
 
}
 
=
 
req.body;
 
 
    
//
 
Find
 
user
 
    
const
 
user
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 

--- PAGE 15 ---
    if  (!user)  {  
      
return
 
res.status(401).json({
 
error:
 
'Invalid
 
credentials'
 
});
 
    
}
 
 
    
//
 
Verify
 
password
 
    
const
 
isValid
 
=
 
await
 
bcrypt.compare(password,
 
user.password);
 
    
if
 
(!isValid)
 
{
 
      
return
 
res.status(401).json({
 
error:
 
'Invalid
 
credentials'
 
});
 
    
}
 
 
    
//
 
Create
 
session
 
    
req.session.userId
 
=
 
user.id;
 
    
req.session.username
 
=
 
user.username;
 
 
    
//
 
Handle
 
remember
 
me
 
    
if
 
(rememberMe)
 
{
 
      
const
 
token
 
=
 
generateToken();
 
      
rememberTokens.set(token,
 
user.id);
 
 
      
res.cookie('rememberMe',
 
token,
 
{
 
        
signed:
 
true,
 
        
httpOnly:
 
true,
 
        
maxAge:
 
30
 
*
 
24
 
*
 
60
 
*
 
60
 
*
 
1000,
 
//
 
30
 
days
 
        
secure:
 
false
 
      
});
 
    
}
 
 
    
res.json({
 
      
message:
 
'Login
 
successful',
 
      
rememberMe:
 
!!rememberMe,
 
      
user:
 
{
 
        
id:
 
user.id,
 
        
username:
 
user.username,
 
        
email:
 
user.email
 
      
}
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
res.status(500).json({
 
error:
 
'Login
 
failed'
 
});
 
  
}
 
});
 
 
//
 
Logout
 
app.post('/logout',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Remove
 
remember
 
me
 
token
 
  
const
 
rememberToken
 
=
 
req.signedCookies.rememberMe;
 
  
if
 
(rememberToken)
 
{
 
    
rememberTokens.delete(rememberToken);
 

--- PAGE 16 ---
    res.clearCookie('rememberMe');  
  
}
 
 
  
//
 
Destroy
 
session
 
  
req.session.destroy((err)
 
=>
 
{
 
    
if
 
(err)
 
{
 
      
return
 
res.status(500).json({
 
error:
 
'Logout
 
failed'
 
});
 
    
}
 
    
res.clearCookie('connect.sid');
 
    
res.json({
 
message:
 
'Logged
 
out
 
successfully'
 
});
 
  
});
 
});
 
 
//
 
Protected
 
route
 
app.get('/dashboard',
 
(req,
 
res)
 
=>
 
{
 
  
if
 
(!req.session.userId)
 
{
 
    
return
 
res.status(401).json({
 
error:
 
'Not
 
authenticated'
 
});
 
  
}
 
 
  
const
 
user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
req.session.userId);
 
  
res.json({
 
    
message:
 
'Welcome
 
to
 
dashboard',
 
    
user:
 
{
 
      
id:
 
user.id,
 
      
username:
 
user.username
 
    
}
 
  
});
 
});
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 
Example  3:  Session  with  Redis  Store  (Production-Ready)  
npm  install  redis  connect-redis  
 const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
const
 
RedisStore
 
=
 
require('connect-redis').default;
 
const
 
{
 
createClient
 
}
 
=
 
require('redis');
 
const
 
bcrypt
 
=
 
require('bcrypt');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 

--- PAGE 17 ---
 
//
 
Create
 
Redis
 
client
 
const
 
redisClient
 
=
 
createClient({
 
  
host:
 
'localhost',
 
  
port:
 
6379,
 
  
legacyMode:
 
true
 
});
 
 
redisClient.connect().catch(console.error);
 
 
redisClient.on('error',
 
(err)
 
=>
 
{
 
  
console.error('Redis
 
error:',
 
err);
 
});
 
 
redisClient.on('connect',
 
()
 
=>
 
{
 
  
console.log('Connected
 
to
 
Redis');
 
});
 
 
//
 
Configure
 
session
 
with
 
Redis
 
app.use(session({
 
  
store:
 
new
 
RedisStore({
 
client:
 
redisClient
 
}),
 
  
secret:
 
'your-secret-key',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false,
 
  
cookie:
 
{
 
    
secure:
 
false,
 
//
 
true
 
in
 
production
 
    
httpOnly:
 
true,
 
    
maxAge:
 
24
 
*
 
60
 
*
 
60
 
*
 
1000
 
//
 
24
 
hours
 
  
}
 
}));
 
 
//
 
Users
 
database
 
const
 
users
 
=
 
[];
 
 
//
 
Login
 
app.post('/login',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
{
 
email,
 
password
 
}
 
=
 
req.body;
 
 
    
const
 
user
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 
    
if
 
(!user
 
||
 
!(await
 
bcrypt.compare(password,
 
user.password)))
 
{
 
      
return
 
res.status(401).json({
 
error:
 
'Invalid
 
credentials'
 
});
 
    
}
 
 
    
//
 
Store
 
user
 
data
 
in
 
session
 
(stored
 
in
 
Redis)
 
    
req.session.userId
 
=
 
user.id;
 
    
req.session.username
 
=
 
user.username;
 
    
req.session.email
 
=
 
user.email;
 

--- PAGE 18 ---
    req.session.loginTime  =  new  Date().toISOString();  
 
    
res.json({
 
      
message:
 
'Login
 
successful',
 
      
sessionId:
 
req.sessionID,
 
      
user:
 
{
 
        
id:
 
user.id,
 
        
username:
 
user.username,
 
        
email:
 
user.email
 
      
}
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
res.status(500).json({
 
error:
 
'Login
 
failed'
 
});
 
  
}
 
});
 
 
//
 
Get
 
all
 
active
 
sessions
 
for
 
a
 
user
 
(admin
 
function)
 
app.get('/admin/sessions/:userId',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
userId
 
=
 
parseInt(req.params.userId);
 
    
 
    
//
 
In
 
production,
 
you'd
 
query
 
Redis
 
for
 
sessions
 
    
//
 
This
 
is
 
a
 
simplified
 
example
 
    
res.json({
 
      
message:
 
'Session
 
management',
 
      
note:
 
'Redis
 
stores
 
all
 
session
 
data
 
persistently'
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
res.status(500).json({
 
error:
 
'Failed
 
to
 
retrieve
 
sessions'
 
});
 
  
}
 
});
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 
4.  Passport.js  Integration  
What  is  Passport.js?  
Passport  is  authentication  middleware  for  Node.js  that  supports  over  500+  authentication  
strategies
 
including
 
local
 
authentication,
 
OAuth
 
(Google,
 
Facebook,
 
Twitter),
 
JWT,
 
and
 
more.
 

--- PAGE 19 ---
Key  Features:  ●  Modular  and  flexible  ●  Supports  multiple  strategies  ●  Simple  integration  with  Express  ●  Session  management  
Installing  Passport  
npm  install  passport  passport-local  
 
Example  1:  Local  Strategy  Authentication  
const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
const
 
passport
 
=
 
require('passport');
 
const
 
LocalStrategy
 
=
 
require('passport-local').Strategy;
 
const
 
bcrypt
 
=
 
require('bcrypt');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
app.use(express.urlencoded({
 
extended:
 
false
 
}));
 
 
//
 
Session
 
configuration
 
app.use(session({
 
  
secret:
 
'passport-secret-key',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false,
 
  
cookie:
 
{
 
maxAge:
 
24
 
*
 
60
 
*
 
60
 
*
 
1000
 
}
 
}));
 
 
//
 
Initialize
 
Passport
 
app.use(passport.initialize());
 
app.use(passport.session());
 
 
//
 
Simulated
 
database
 
const
 
users
 
=
 
[
 
  
{
 
    
id:
 
1,
 
    
username:
 
'admin',
 
    
email:
 
'admin@example.com',
 
    
password:
 
'$2b$10$...'
 
//
 
bcrypt
 
hash
 
of
 
'password123'
 
  
}
 
];
 
 
//
 
Configure
 
Passport
 
Local
 
Strategy
 

--- PAGE 20 ---
passport.use(new  LocalStrategy(  
  
{
 
    
usernameField:
 
'email',
 
//
 
field
 
name
 
in
 
req.body
 
    
passwordField:
 
'password'
 
  
},
 
  
async
 
(email,
 
password,
 
done)
 
=>
 
{
 
    
try
 
{
 
      
//
 
Find
 
user
 
      
const
 
user
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 
      
 
      
if
 
(!user)
 
{
 
        
return
 
done(null,
 
false,
 
{
 
message:
 
'Incorrect
 
email'
 
});
 
      
}
 
 
      
//
 
Verify
 
password
 
      
const
 
isValid
 
=
 
await
 
bcrypt.compare(password,
 
user.password);
 
      
 
      
if
 
(!isValid)
 
{
 
        
return
 
done(null,
 
false,
 
{
 
message:
 
'Incorrect
 
password'
 
});
 
      
}
 
 
      
//
 
Authentication
 
successful
 
      
return
 
done(null,
 
user);
 
 
    
}
 
catch
 
(error)
 
{
 
      
return
 
done(error);
 
    
}
 
  
}
 
));
 
 
//
 
Serialize
 
user
 
into
 
session
 
passport.serializeUser((user,
 
done)
 
=>
 
{
 
  
console.log('Serializing
 
user:',
 
user.id);
 
  
done(null,
 
user.id);
 
});
 
 
//
 
Deserialize
 
user
 
from
 
session
 
passport.deserializeUser((id,
 
done)
 
=>
 
{
 
  
console.log('Deserializing
 
user:',
 
id);
 
  
const
 
user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
id);
 
  
if
 
(user)
 
{
 
    
done(null,
 
{
 
      
id:
 
user.id,
 
      
username:
 
user.username,
 
      
email:
 
user.email
 
    
});
 
  
}
 
else
 
{
 
    
done(new
 
Error('User
 
not
 
found'));
 

--- PAGE 21 ---
  }  
});
 
 
//
 
Register
 
endpoint
 
app.post('/register',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
{
 
username,
 
email,
 
password
 
}
 
=
 
req.body;
 
 
    
//
 
Check
 
if
 
user
 
exists
 
    
if
 
(users.find(u
 
=>
 
u.email
 
===
 
email))
 
{
 
      
return
 
res.status(409).json({
 
error:
 
'User
 
already
 
exists'
 
});
 
    
}
 
 
    
//
 
Hash
 
password
 
    
const
 
hashedPassword
 
=
 
await
 
bcrypt.hash(password,
 
10);
 
 
    
//
 
Create
 
user
 
    
const
 
newUser
 
=
 
{
 
      
id:
 
users.length
 
+
 
1,
 
      
username,
 
      
email,
 
      
password:
 
hashedPassword
 
    
};
 
 
    
users.push(newUser);
 
 
    
res.status(201).json({
 
      
message:
 
'User
 
registered
 
successfully',
 
      
user:
 
{
 
        
id:
 
newUser.id,
 
        
username:
 
newUser.username,
 
        
email:
 
newUser.email
 
      
}
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
res.status(500).json({
 
error:
 
'Registration
 
failed'
 
});
 
  
}
 
});
 
 
//
 
Login
 
endpoint
 
using
 
Passport
 
app.post('/login',
 
  
passport.authenticate('local',
 
{
 
    
failureRedirect:
 
'/login-failure',
 
    
failureMessage:
 
true
 
  
}),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 

--- PAGE 22 ---
      message:  'Login  successful',  
      
user:
 
{
 
        
id:
 
req.user.id,
 
        
username:
 
req.user.username,
 
        
email:
 
req.user.email
 
      
}
 
    
});
 
  
}
 
);
 
 
//
 
Login
 
failure
 
route
 
app.get('/login-failure',
 
(req,
 
res)
 
=>
 
{
 
  
res.status(401).json({
 
    
error:
 
'Login
 
failed',
 
    
message:
 
req.session.messages
 
||
 
'Invalid
 
credentials'
 
  
});
 
});
 
 
//
 
Middleware
 
to
 
check
 
authentication
 
function
 
isAuthenticated(req,
 
res,
 
next)
 
{
 
  
if
 
(req.isAuthenticated())
 
{
 
    
return
 
next();
 
  
}
 
  
res.status(401).json({
 
error:
 
'Not
 
authenticated'
 
});
 
}
 
 
//
 
Protected
 
route
 
app.get('/profile',
 
isAuthenticated,
 
(req,
 
res)
 
=>
 
{
 
  
res.json({
 
    
user:
 
req.user
 
  
});
 
});
 
 
//
 
Logout
 
app.post('/logout',
 
(req,
 
res)
 
=>
 
{
 
  
req.logout((err)
 
=>
 
{
 
    
if
 
(err)
 
{
 
      
return
 
res.status(500).json({
 
error:
 
'Logout
 
failed'
 
});
 
    
}
 
    
req.session.destroy();
 
    
res.json({
 
message:
 
'Logged
 
out
 
successfully'
 
});
 
  
});
 
});
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 

--- PAGE 23 ---
Example  2:  Passport  with  JWT  Strategy  
npm  install  passport-jwt  jsonwebtoken  
 const  express  =  require('express');  
const
 
passport
 
=
 
require('passport');
 
const
 
LocalStrategy
 
=
 
require('passport-local').Strategy;
 
const
 
JwtStrategy
 
=
 
require('passport-jwt').Strategy;
 
const
 
ExtractJwt
 
=
 
require('passport-jwt').ExtractJwt;
 
const
 
jwt
 
=
 
require('jsonwebtoken');
 
const
 
bcrypt
 
=
 
require('bcrypt');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
const
 
JWT_SECRET
 
=
 
'your-jwt-secret-key';
 
 
//
 
Users
 
database
 
const
 
users
 
=
 
[];
 
 
//
 
Configure
 
Local
 
Strategy
 
for
 
login
 
passport.use('local',
 
new
 
LocalStrategy(
 
  
{
 
    
usernameField:
 
'email',
 
    
passwordField:
 
'password'
 
  
},
 
  
async
 
(email,
 
password,
 
done)
 
=>
 
{
 
    
try
 
{
 
      
const
 
user
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 
      
 
      
if
 
(!user)
 
{
 
        
return
 
done(null,
 
false,
 
{
 
message:
 
'User
 
not
 
found'
 
});
 
      
}
 
 
      
const
 
isValid
 
=
 
await
 
bcrypt.compare(password,
 
user.password);
 
      
 
      
if
 
(!isValid)
 
{
 
        
return
 
done(null,
 
false,
 
{
 
message:
 
'Invalid
 
password'
 
});
 
      
}
 
 
      
return
 
done(null,
 
user);
 
 
    
}
 
catch
 
(error)
 
{
 
      
return
 
done(error);
 
    
}
 

--- PAGE 24 ---
  }  
));
 
 
//
 
Configure
 
JWT
 
Strategy
 
for
 
protected
 
routes
 
passport.use('jwt',
 
new
 
JwtStrategy(
 
  
{
 
    
jwtFromRequest:
 
ExtractJwt.fromAuthHeaderAsBearerToken(),
 
    
secretOrKey:
 
JWT_SECRET
 
  
},
 
  
(jwtPayload,
 
done)
 
=>
 
{
 
    
try
 
{
 
      
const
 
user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
jwtPayload.id);
 
      
 
      
if
 
(user)
 
{
 
        
return
 
done(null,
 
user);
 
      
}
 
else
 
{
 
        
return
 
done(null,
 
false);
 
      
}
 
 
    
}
 
catch
 
(error)
 
{
 
      
return
 
done(error,
 
false);
 
    
}
 
  
}
 
));
 
 
//
 
Register
 
app.post('/register',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
try
 
{
 
    
const
 
{
 
username,
 
email,
 
password
 
}
 
=
 
req.body;
 
 
    
if
 
(users.find(u
 
=>
 
u.email
 
===
 
email))
 
{
 
      
return
 
res.status(409).json({
 
error:
 
'User
 
already
 
exists'
 
});
 
    
}
 
 
    
const
 
hashedPassword
 
=
 
await
 
bcrypt.hash(password,
 
10);
 
 
    
const
 
newUser
 
=
 
{
 
      
id:
 
users.length
 
+
 
1,
 
      
username,
 
      
email,
 
      
password:
 
hashedPassword,
 
      
role:
 
'user'
 
    
};
 
 
    
users.push(newUser);
 
 
    
//
 
Generate
 
JWT
 
token
 
    
const
 
token
 
=
 
jwt.sign(
 

--- PAGE 25 ---
      {  id:  newUser.id,  email:  newUser.email,  role:  newUser.role  },  
      
JWT_SECRET,
 
      
{
 
expiresIn:
 
'24h'
 
}
 
    
);
 
 
    
res.status(201).json({
 
      
message:
 
'User
 
registered
 
successfully',
 
      
token:
 
token,
 
      
user:
 
{
 
        
id:
 
newUser.id,
 
        
username:
 
newUser.username,
 
        
email:
 
newUser.email
 
      
}
 
    
});
 
 
  
}
 
catch
 
(error)
 
{
 
    
res.status(500).json({
 
error:
 
'Registration
 
failed'
 
});
 
  
}
 
});
 
 
//
 
Login
 
app.post('/login',
 
  
(req,
 
res,
 
next)
 
=>
 
{
 
passport.authenticate('local',
 
{
 
session:
 
false
 
},
 
(err,
 
user,
 
info)
 
=>
 
{
 
if
 
(err)
 
{
 
return
 
res.status(500).json({
 
error:
 
'Authentication
 
error'
 
});
 
}
 
 
 
  
if
 
(!user)
 
{
 
    
return
 
res.status(401).json({
 
error:
 
info.message
 
||
 
'Login
 
failed'
 
});
 
  
}
 
 
  
//
 
Generate
 
JWT
 
token
 
  
const
 
token
 
=
 
jwt.sign(
 
    
{
 
id:
 
user.id,
 
email:
 
user.email,
 
role:
 
user.role
 
},
 
    
JWT_SECRET,
 
    
{
 
expiresIn:
 
'24h'
 
}
 
  
);
 
 
  
res.json({
 
    
message:
 
'Login
 
successful',
 
    
token:
 
token,
 
    
user:
 
{
 
      
id:
 
user.id,
 
      
username:
 
user.username,
 
      
email:
 
user.email,
 
      
role:
 
user.role
 
    
}
 

--- PAGE 26 ---
  });  
 
})(req,
 
res,
 
next);
 
 
}
 
);
 
 
//
 
Protected
 
route
 
app.get('/profile',
 
    
passport.authenticate('jwt',
 
{
 
        
session:
 
false
 
    
}),
 
    
(req,
 
res)
 
=>
 
{
 
        
res.json({
 
            
message:
 
'Protected
 
route
 
accessed',
 
            
user:
 
{
 
                
id:
 
req.user.id,
 
                
username:
 
req.user.username,
 
                
email:
 
req.user.email,
 
                
role:
 
req.user.role
 
            
}
 
        
});
 
    
}
 
);
 
//
 
Refresh
 
token
 
app.post('/refresh-token',
 
        
passport.authenticate('jwt',
 
{
 
            
session:
 
false
 
        
}),
 
        
(req,
 
res)
 
=>
 
{
 
            
const
 
newToken
 
=
 
jwt.sign({
 
                    
id:
 
req.user.id,
 
                    
email:
 
req.user.email,
 
                    
role:
 
req.user.role
 
                
},
 
                
JWT_SECRET,
 
{
 
                    
expiresIn:
 
'24h'
 
                
}
 
            
);
 
 
res.json({
 
message:
 
'Token
 
refreshed',
 
token:
 
newToken
 
});
 
 
});
 
app.listen(3000,
 
()
 
=>
 
{
 
    
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 

--- PAGE 27 ---
Example  3:  Google  OAuth  with  Passport  
npm  install  passport-google-oauth20  
 const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
const
 
passport
 
=
 
require('passport');
 
const
 
GoogleStrategy
 
=
 
require('passport-google-oauth20').Strategy;
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
app.use(session({
 
  
secret:
 
'google-oauth-secret',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false
 
}));
 
 
app.use(passport.initialize());
 
app.use(passport.session());
 
 
//
 
Users
 
database
 
const
 
users
 
=
 
[];
 
 
//
 
Configure
 
Google
 
Strategy
 
passport.use(new
 
GoogleStrategy({
 
    
clientID:
 
process.env.GOOGLE_CLIENT_ID
 
||
 
'your-client-id',
 
    
clientSecret:
 
process.env.GOOGLE_CLIENT_SECRET
 
||
 
'your-client-secret',
 
    
callbackURL:
 
'http://localhost:3000/auth/google/callback'
 
  
},
 
  
(accessToken,
 
refreshToken,
 
profile,
 
done)
 
=>
 
{
 
    
//
 
Find
 
or
 
create
 
user
 
    
let
 
user
 
=
 
users.find(u
 
=>
 
u.googleId
 
===
 
profile.id);
 
 
    
if
 
(!user)
 
{
 
      
user
 
=
 
{
 
        
id:
 
users.length
 
+
 
1,
 
        
googleId:
 
profile.id,
 
        
email:
 
profile.emails[0].value,
 
        
displayName:
 
profile.displayName,
 
        
photo:
 
profile.photos[0]?.value
 
      
};
 
      
users.push(user);
 
    
}
 

--- PAGE 28 ---
 
    
return
 
done(null,
 
user);
 
  
}
 
));
 
 
passport.serializeUser((user,
 
done)
 
=>
 
{
 
  
done(null,
 
user.id);
 
});
 
 
passport.deserializeUser((id,
 
done)
 
=>
 
{
 
  
const
 
user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
id);
 
  
done(null,
 
user);
 
});
 
 
//
 
Routes
 
app.get('/auth/google',
 
  
passport.authenticate('google',
 
{
 
scope:
 
['profile',
 
'email']
 
})
 
);
 
 
app.get('/auth/google/callback',
 
  
passport.authenticate('google',
 
{
 
failureRedirect:
 
'/login'
 
}),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.redirect('/dashboard');
 
  
}
 
);
 
 
app.get('/dashboard',
 
(req,
 
res)
 
=>
 
{
 
  
if
 
(!req.isAuthenticated())
 
{
 
    
return
 
res.redirect('/login');
 
  
}
 
 
  
res.json({
 
    
message:
 
'Welcome
 
to
 
dashboard',
 
    
user:
 
req.user
 
  
});
 
});
 
 
app.get('/logout',
 
(req,
 
res)
 
=>
 
{
 
  
req.logout((err)
 
=>
 
{
 
    
if
 
(err)
 
{
 
      
return
 
res.status(500).json({
 
error:
 
'Logout
 
failed'
 
});
 
    
}
 
    
res.redirect('/');
 
  
});
 
});
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 

--- PAGE 29 ---
});  
 
5.  Adding  Authorization  using  Middleware  
Authorization  Middleware  Patterns  
Authorization  determines  what  authenticated  users  can  access.  Common  patterns  include  
role-based
 
access
 
control,
 
permission-based
 
access,
 
resource
 
ownership
 
verification,
 
and
 
hierarchical
 
roles.
 
Example  1:  Role-Based  Authorization  
const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
const
 
bcrypt
 
=
 
require('bcrypt');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
app.use(session({
 
  
secret:
 
'authorization-secret',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false
 
}));
 
 
//
 
Users
 
database
 
with
 
roles
 
const
 
users
 
=
 
[
 
  
{
 
    
id:
 
1,
 
    
username:
 
'admin',
 
    
email:
 
'admin@example.com',
 
    
password:
 
'$2b$10$...',
 
    
role:
 
'admin'
 
  
},
 
  
{
 
    
id:
 
2,
 
    
username:
 
'moderator',
 
    
email:
 
'mod@example.com',
 
    
password:
 
'$2b$10$...',
 
    
role:
 
'moderator'
 
  
},
 
  
{
 
    
id:
 
3,
 

--- PAGE 30 ---
    username:  'user',  
    
email:
 
'user@example.com',
 
    
password:
 
'$2b$10$...',
 
    
role:
 
'user'
 
  
}
 
];
 
 
//
 
Authentication
 
middleware
 
const
 
isAuthenticated
 
=
 
(req,
 
res,
 
next)
 
=>
 
{
 
  
if
 
(req.session.userId)
 
{
 
    
const
 
user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
req.session.userId);
 
    
req.user
 
=
 
user;
 
    
return
 
next();
 
  
}
 
  
res.status(401).json({
 
error:
 
'Authentication
 
required'
 
});
 
};
 
 
//
 
Authorization
 
middleware
 
-
 
single
 
role
 
const
 
requireRole
 
=
 
(role)
 
=>
 
{
 
  
return
 
(req,
 
res,
 
next)
 
=>
 
{
 
    
if
 
(!req.user)
 
{
 
      
return
 
res.status(401).json({
 
error:
 
'Authentication
 
required'
 
});
 
    
}
 
 
    
if
 
(req.user.role
 
!==
 
role)
 
{
 
      
return
 
res.status(403).json({
 
        
error:
 
'Insufficient
 
permissions',
 
        
required:
 
role,
 
        
current:
 
req.user.role
 
      
});
 
    
}
 
 
    
next();
 
  
};
 
};
 
 
//
 
Authorization
 
middleware
 
-
 
multiple
 
roles
 
const
 
requireAnyRole
 
=
 
(...roles)
 
=>
 
{
 
  
return
 
(req,
 
res,
 
next)
 
=>
 
{
 
    
if
 
(!req.user)
 
{
 
      
return
 
res.status(401).json({
 
error:
 
'Authentication
 
required'
 
});
 
    
}
 
 
    
if
 
(!roles.includes(req.user.role))
 
{
 
      
return
 
res.status(403).json({
 
        
error:
 
'Insufficient
 
permissions',
 

--- PAGE 31 ---
        required:  roles,  
        
current:
 
req.user.role
 
      
});
 
    
}
 
 
    
next();
 
  
};
 
};
 
 
//
 
Login
 
app.post('/login',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
const
 
{
 
email,
 
password
 
}
 
=
 
req.body;
 
 
  
const
 
user
 
=
 
users.find(u
 
=>
 
u.email
 
===
 
email);
 
  
if
 
(!user
 
||
 
!(await
 
bcrypt.compare(password,
 
user.password)))
 
{
 
    
return
 
res.status(401).json({
 
error:
 
'Invalid
 
credentials'
 
});
 
  
}
 
 
  
req.session.userId
 
=
 
user.id;
 
 
  
res.json({
 
    
message:
 
'Login
 
successful',
 
    
user:
 
{
 
      
id:
 
user.id,
 
      
username:
 
user.username,
 
      
role:
 
user.role
 
    
}
 
  
});
 
});
 
 
//
 
Public
 
route
 
-
 
no
 
authentication
 
required
 
app.get('/public',
 
(req,
 
res)
 
=>
 
{
 
  
res.json({
 
message:
 
'This
 
is
 
a
 
public
 
endpoint'
 
});
 
});
 
 
//
 
Protected
 
route
 
-
 
authentication
 
required
 
app.get('/dashboard',
 
isAuthenticated,
 
(req,
 
res)
 
=>
 
{
 
  
res.json({
 
    
message:
 
'Dashboard
 
-
 
available
 
to
 
all
 
authenticated
 
users',
 
    
user:
 
{
 
      
username:
 
req.user.username,
 
      
role:
 
req.user.role
 
    
}
 
  
});
 
});
 
 
//
 
Admin-only
 
route
 
app.get('/admin/users',
 
isAuthenticated,
 
requireRole('admin'),
 
(req,
 

--- PAGE 32 ---
res)  =>  {  
  
res.json({
 
    
message:
 
'User
 
management
 
-
 
admin
 
only',
 
    
users:
 
users.map(u
 
=>
 
({
 
      
id:
 
u.id,
 
      
username:
 
u.username,
 
      
email:
 
u.email,
 
      
role:
 
u.role
 
    
}))
 
  
});
 
});
 
 
//
 
Moderator
 
and
 
Admin
 
route
 
app.post('/posts/:id/moderate',
 
  
isAuthenticated,
 
  
requireAnyRole('admin',
 
'moderator'),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 
      
message:
 
'Post
 
moderated',
 
      
moderator:
 
req.user.username,
 
      
role:
 
req.user.role
 
    
});
 
  
}
 
);
 
 
//
 
User
 
can
 
only
 
access
 
their
 
own
 
data
 
app.get('/users/:id/profile',
 
isAuthenticated,
 
(req,
 
res)
 
=>
 
{
 
  
const
 
requestedId
 
=
 
parseInt(req.params.id);
 
 
  
//
 
Allow
 
admins
 
to
 
view
 
anyone's
 
profile
 
  
if
 
(req.user.role
 
===
 
'admin'
 
||
 
req.user.id
 
===
 
requestedId)
 
{
 
    
const
 
user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
requestedId);
 
    
 
    
if
 
(!user)
 
{
 
      
return
 
res.status(404).json({
 
error:
 
'User
 
not
 
found'
 
});
 
    
}
 
 
    
res.json({
 
      
user:
 
{
 
        
id:
 
user.id,
 
        
username:
 
user.username,
 
        
email:
 
user.email,
 
        
role:
 
user.role
 
      
}
 
    
});
 
  
}
 
else
 
{
 
    
res.status(403).json({
 
      
error:
 
'You
 
can
 
only
 
view
 
your
 
own
 
profile'
 

--- PAGE 33 ---
    });  
  
}
 
});
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 
Example  2:  Permission-Based  Authorization  
const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
app.use(session({
 
  
secret:
 
'permission-secret',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false
 
}));
 
 
//
 
Define
 
permissions
 
const
 
PERMISSIONS
 
=
 
{
 
  
CREATE_POST:
 
'create_post',
 
  
EDIT_POST:
 
'edit_post',
 
  
DELETE_POST:
 
'delete_post',
 
  
CREATE_USER:
 
'create_user',
 
  
DELETE_USER:
 
'delete_user',
 
  
VIEW_ANALYTICS:
 
'view_analytics'
 
};
 
 
//
 
Role
 
permission
 
mapping
 
const
 
ROLE_PERMISSIONS
 
=
 
{
 
  
user:
 
[
 
    
PERMISSIONS.CREATE_POST,
 
    
PERMISSIONS.EDIT_POST
 
  
],
 
  
moderator:
 
[
 
    
PERMISSIONS.CREATE_POST,
 
    
PERMISSIONS.EDIT_POST,
 
    
PERMISSIONS.DELETE_POST
 
  
],
 
  
admin:
 
[
 
    
PERMISSIONS.CREATE_POST,
 

--- PAGE 34 ---
    PERMISSIONS.EDIT_POST,  
    
PERMISSIONS.DELETE_POST,
 
    
PERMISSIONS.CREATE_USER,
 
    
PERMISSIONS.DELETE_USER,
 
    
PERMISSIONS.VIEW_ANALYTICS
 
  
]
 
};
 
 
//
 
Users
 
database
 
const
 
users
 
=
 
[
 
  
{
 
    
id:
 
1,
 
    
username:
 
'admin',
 
    
role:
 
'admin'
 
  
},
 
  
{
 
    
id:
 
2,
 
    
username:
 
'moderator',
 
    
role:
 
'moderator'
 
  
},
 
  
{
 
    
id:
 
3,
 
    
username:
 
'user',
 
    
role:
 
'user'
 
  
}
 
];
 
 
//
 
Authentication
 
middleware
 
const
 
isAuthenticated
 
=
 
(req,
 
res,
 
next)
 
=>
 
{
 
  
if
 
(req.session.userId)
 
{
 
    
req.user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
req.session.userId);
 
    
return
 
next();
 
  
}
 
  
res.status(401).json({
 
error:
 
'Authentication
 
required'
 
});
 
};
 
 
//
 
Permission
 
checker
 
middleware
 
const
 
requirePermission
 
=
 
(...permissions)
 
=>
 
{
 
  
return
 
(req,
 
res,
 
next)
 
=>
 
{
 
    
if
 
(!req.user)
 
{
 
      
return
 
res.status(401).json({
 
error:
 
'Authentication
 
required'
 
});
 
    
}
 
 
    
//
 
Get
 
user's
 
permissions
 
based
 
on
 
role
 
    
const
 
userPermissions
 
=
 
ROLE_PERMISSIONS[req.user.role]
 
||
 
[];
 
 
    
//
 
Check
 
if
 
user
 
has
 
all
 
required
 
permissions
 

--- PAGE 35 ---
    const  hasPermission  =  permissions.every(permission  =>  
      
userPermissions.includes(permission)
 
    
);
 
 
    
if
 
(!hasPermission)
 
{
 
      
return
 
res.status(403).json({
 
        
error:
 
'Insufficient
 
permissions',
 
        
required:
 
permissions,
 
        
available:
 
userPermissions
 
      
});
 
    
}
 
 
    
next();
 
  
};
 
};
 
 
//
 
Login
 
(simplified)
 
app.post('/login',
 
(req,
 
res)
 
=>
 
{
 
  
const
 
{
 
username
 
}
 
=
 
req.body;
 
  
const
 
user
 
=
 
users.find(u
 
=>
 
u.username
 
===
 
username);
 
 
  
if
 
(!user)
 
{
 
    
return
 
res.status(401).json({
 
error:
 
'User
 
not
 
found'
 
});
 
  
}
 
 
  
req.session.userId
 
=
 
user.id;
 
 
  
res.json({
 
    
message:
 
'Login
 
successful',
 
    
user:
 
{
 
      
id:
 
user.id,
 
      
username:
 
user.username,
 
      
role:
 
user.role,
 
      
permissions:
 
ROLE_PERMISSIONS[user.role]
 
    
}
 
  
});
 
});
 
 
//
 
Routes
 
with
 
permission
 
checks
 
app.post('/posts',
 
  
isAuthenticated,
 
  
requirePermission(PERMISSIONS.CREATE_POST),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 
      
message:
 
'Post
 
created',
 
      
author:
 
req.user.username
 
    
});
 
  
}
 

--- PAGE 36 ---
);  
 
app.delete('/posts/:id',
 
  
isAuthenticated,
 
  
requirePermission(PERMISSIONS.DELETE_POST),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 
      
message:
 
'Post
 
deleted',
 
      
deletedBy:
 
req.user.username
 
    
});
 
  
}
 
);
 
 
app.post('/users',
 
  
isAuthenticated,
 
  
requirePermission(PERMISSIONS.CREATE_USER),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 
      
message:
 
'User
 
created',
 
      
createdBy:
 
req.user.username
 
    
});
 
  
}
 
);
 
 
app.get('/analytics',
 
  
isAuthenticated,
 
  
requirePermission(PERMISSIONS.VIEW_ANALYTICS),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 
      
message:
 
'Analytics
 
data',
 
      
data:
 
{
 
        
totalUsers:
 
users.length,
 
        
totalPosts:
 
150
 
      
}
 
    
});
 
  
}
 
);
 
 
//
 
Get
 
current
 
user's
 
permissions
 
app.get('/me/permissions',
 
isAuthenticated,
 
(req,
 
res)
 
=>
 
{
 
  
res.json({
 
    
username:
 
req.user.username,
 
    
role:
 
req.user.role,
 
    
permissions:
 
ROLE_PERMISSIONS[req.user.role]
 
  
});
 
});
 
 
app.listen(3000,
 
()
 
=>
 
{
 

--- PAGE 37 ---
  console.log('Server  running  on  port  3000');  
});
 
 
Example  3:  Resource  Ownership  Authorization  
const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
app.use(session({
 
  
secret:
 
'ownership-secret',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false
 
}));
 
 
//
 
Databases
 
const
 
users
 
=
 
[
 
  
{
 
id:
 
1,
 
username:
 
'alice',
 
role:
 
'user'
 
},
 
  
{
 
id:
 
2,
 
username:
 
'bob',
 
role:
 
'user'
 
},
 
  
{
 
id:
 
3,
 
username:
 
'admin',
 
role:
 
'admin'
 
}
 
];
 
 
const
 
posts
 
=
 
[
 
  
{
 
id:
 
1,
 
title:
 
'Post
 
1',
 
content:
 
'Content
 
1',
 
authorId:
 
1
 
},
 
  
{
 
id:
 
2,
 
title:
 
'Post
 
2',
 
content:
 
'Content
 
2',
 
authorId:
 
2
 
},
 
  
{
 
id:
 
3,
 
title:
 
'Post
 
3',
 
content:
 
'Content
 
3',
 
authorId:
 
1
 
}
 
];
 
 
//
 
Authentication
 
middleware
 
const
 
isAuthenticated
 
=
 
(req,
 
res,
 
next)
 
=>
 
{
 
  
if
 
(req.session.userId)
 
{
 
    
req.user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
req.session.userId);
 
    
return
 
next();
 
  
}
 
  
res.status(401).json({
 
error:
 
'Authentication
 
required'
 
});
 
};
 
 
//
 
Check
 
if
 
user
 
owns
 
the
 
resource
 
or
 
is
 
admin
 
const
 
isOwnerOrAdmin
 
=
 
(resourceGetter)
 
=>
 
{
 
  
return
 
async
 
(req,
 
res,
 
next)
 
=>
 
{
 
    
try
 
{
 
      
const
 
resource
 
=
 
await
 
resourceGetter(req);
 
 

--- PAGE 38 ---
      if  (!resource)  {  
        
return
 
res.status(404).json({
 
error:
 
'Resource
 
not
 
found'
 
});
 
      
}
 
 
      
//
 
Admin
 
can
 
access
 
any
 
resource
 
      
if
 
(req.user.role
 
===
 
'admin')
 
{
 
        
req.resource
 
=
 
resource;
 
        
return
 
next();
 
      
}
 
 
      
//
 
Check
 
ownership
 
      
if
 
(resource.authorId
 
===
 
req.user.id
 
||
 
resource.userId
 
===
 
req.user.id)
 
{
 
        
req.resource
 
=
 
resource;
 
        
return
 
next();
 
      
}
 
 
      
res.status(403).json({
 
        
error:
 
'You
 
can
 
only
 
modify
 
your
 
own
 
resources'
 
      
});
 
 
    
}
 
catch
 
(error)
 
{
 
      
res.status(500).json({
 
error:
 
'Authorization
 
check
 
failed'
 
});
 
    
}
 
  
};
 
};
 
 
//
 
Login
 
(simplified)
 
app.post('/login',
 
(req,
 
res)
 
=>
 
{
 
  
const
 
{
 
username
 
}
 
=
 
req.body;
 
  
const
 
user
 
=
 
users.find(u
 
=>
 
u.username
 
===
 
username);
 
 
  
if
 
(!user)
 
{
 
    
return
 
res.status(401).json({
 
error:
 
'User
 
not
 
found'
 
});
 
  
}
 
 
  
req.session.userId
 
=
 
user.id;
 
 
  
res.json({
 
    
message:
 
'Login
 
successful',
 
    
user:
 
{
 
id:
 
user.id,
 
username:
 
user.username,
 
role:
 
user.role
 
}
 
  
});
 
});
 
 
//
 
Create
 
post
 
(any
 
authenticated
 
user)
 
app.post('/posts',
 
isAuthenticated,
 
(req,
 
res)
 
=>
 
{
 
  
const
 
{
 
title,
 
content
 
}
 
=
 
req.body;
 
 

--- PAGE 39 ---
  const  newPost  =  {  
    
id:
 
posts.length
 
+
 
1,
 
    
title,
 
    
content,
 
    
authorId:
 
req.user.id
 
  
};
 
 
  
posts.push(newPost);
 
 
  
res.status(201).json({
 
    
message:
 
'Post
 
created',
 
    
post:
 
newPost
 
  
});
 
});
 
 
//
 
Get
 
all
 
posts
 
(public)
 
app.get('/posts',
 
(req,
 
res)
 
=>
 
{
 
  
res.json({
 
posts
 
});
 
});
 
 
//
 
Update
 
post
 
(only
 
owner
 
or
 
admin)
 
app.put('/posts/:id',
 
  
isAuthenticated,
 
  
isOwnerOrAdmin((req)
 
=>
 
{
 
    
return
 
posts.find(p
 
=>
 
p.id
 
===
 
parseInt(req.params.id));
 
  
}),
 
  
(req,
 
res)
 
=>
 
{
 
    
const
 
{
 
title,
 
content
 
}
 
=
 
req.body;
 
 
    
req.resource.title
 
=
 
title
 
||
 
req.resource.title;
 
    
req.resource.content
 
=
 
content
 
||
 
req.resource.content;
 
 
    
res.json({
 
      
message:
 
'Post
 
updated',
 
      
post:
 
req.resource,
 
      
updatedBy:
 
req.user.username
 
    
});
 
  
}
 
);
 
 
//
 
Delete
 
post
 
(only
 
owner
 
or
 
admin)
 
app.delete('/posts/:id',
 
  
isAuthenticated,
 
  
isOwnerOrAdmin((req)
 
=>
 
{
 
    
return
 
posts.find(p
 
=>
 
p.id
 
===
 
parseInt(req.params.id));
 
  
}),
 
  
(req,
 
res)
 
=>
 
{
 
    
const
 
index
 
=
 
posts.findIndex(p
 
=>
 
p.id
 
===
 
req.resource.id);
 

--- PAGE 40 ---
    posts.splice(index,  1);  
 
    
res.json({
 
      
message:
 
'Post
 
deleted',
 
      
deletedBy:
 
req.user.username
 
    
});
 
  
}
 
);
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 
Example  4:  Hierarchical  Role  Authorization  
const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
app.use(session({
 
  
secret:
 
'hierarchical-secret',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false
 
}));
 
 
//
 
Define
 
role
 
hierarchy
 
(higher
 
number
 
=
 
more
 
privilege)
 
const
 
ROLE_HIERARCHY
 
=
 
{
 
  
guest:
 
0,
 
  
user:
 
1,
 
  
moderator:
 
2,
 
  
admin:
 
3,
 
  
superadmin:
 
4
 
};
 
 
//
 
Users
 
const
 
users
 
=
 
[
 
  
{
 
id:
 
1,
 
username:
 
'guest',
 
role:
 
'guest'
 
},
 
  
{
 
id:
 
2,
 
username:
 
'user',
 
role:
 
'user'
 
},
 
  
{
 
id:
 
3,
 
username:
 
'moderator',
 
role:
 
'moderator'
 
},
 
  
{
 
id:
 
4,
 
username:
 
'admin',
 
role:
 
'admin'
 
},
 
  
{
 
id:
 
5,
 
username:
 
'superadmin',
 
role:
 
'superadmin'
 
}
 
];
 
 

--- PAGE 41 ---
//  Authentication  middleware  
const
 
isAuthenticated
 
=
 
(req,
 
res,
 
next)
 
=>
 
{
 
  
if
 
(req.session.userId)
 
{
 
    
req.user
 
=
 
users.find(u
 
=>
 
u.id
 
===
 
req.session.userId);
 
    
return
 
next();
 
  
}
 
  
res.status(401).json({
 
error:
 
'Authentication
 
required'
 
});
 
};
 
 
//
 
Require
 
minimum
 
role
 
level
 
const
 
requireMinRole
 
=
 
(minRole)
 
=>
 
{
 
  
return
 
(req,
 
res,
 
next)
 
=>
 
{
 
    
if
 
(!req.user)
 
{
 
      
return
 
res.status(401).json({
 
error:
 
'Authentication
 
required'
 
});
 
    
}
 
 
    
const
 
userRoleLevel
 
=
 
ROLE_HIERARCHY[req.user.role];
 
    
const
 
minRoleLevel
 
=
 
ROLE_HIERARCHY[minRole];
 
 
    
if
 
(userRoleLevel
 
<
 
minRoleLevel)
 
{
 
      
return
 
res.status(403).json({
 
        
error:
 
'Insufficient
 
role
 
level',
 
        
required:
 
minRole,
 
        
current:
 
req.user.role
 
      
});
 
    
}
 
 
    
next();
 
  
};
 
};
 
 
//
 
Login
 
app.post('/login',
 
(req,
 
res)
 
=>
 
{
 
  
const
 
{
 
username
 
}
 
=
 
req.body;
 
  
const
 
user
 
=
 
users.find(u
 
=>
 
u.username
 
===
 
username);
 
 
  
if
 
(!user)
 
{
 
    
return
 
res.status(401).json({
 
error:
 
'User
 
not
 
found'
 
});
 
  
}
 
 
  
req.session.userId
 
=
 
user.id;
 
 
  
res.json({
 
    
message:
 
'Login
 
successful',
 
    
user:
 
{
 
      
username:
 
user.username,
 
      
role:
 
user.role,
 

--- PAGE 42 ---
      roleLevel:  ROLE_HIERARCHY[user.role]  
    
}
 
  
});
 
});
 
 
//
 
Routes
 
with
 
hierarchical
 
authorization
 
app.get('/public',
 
(req,
 
res)
 
=>
 
{
 
  
res.json({
 
message:
 
'Public
 
endpoint
 
-
 
no
 
authentication
 
needed'
 
});
 
});
 
 
app.get('/user/content',
 
  
isAuthenticated,
 
  
requireMinRole('user'),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 
      
message:
 
'User
 
content
 
-
 
accessible
 
by
 
user
 
and
 
above',
 
      
accessedBy:
 
req.user.username
 
    
});
 
  
}
 
);
 
 
app.get('/moderator/panel',
 
  
isAuthenticated,
 
  
requireMinRole('moderator'),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 
      
message:
 
'Moderator
 
panel
 
-
 
accessible
 
by
 
moderator
 
and
 
above',
 
      
accessedBy:
 
req.user.username
 
    
});
 
  
}
 
);
 
 
app.get('/admin/settings',
 
  
isAuthenticated,
 
  
requireMinRole('admin'),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 
      
message:
 
'Admin
 
settings
 
-
 
accessible
 
by
 
admin
 
and
 
above',
 
      
accessedBy:
 
req.user.username
 
    
});
 
  
}
 
);
 
 
app.get('/superadmin/system',
 
  
isAuthenticated,
 
  
requireMinRole('superadmin'),
 
  
(req,
 
res)
 
=>
 
{
 
    
res.json({
 

--- PAGE 43 ---
      message:  'System  management  -  superadmin  only',  
      
accessedBy:
 
req.user.username
 
    
});
 
  
}
 
);
 
 
app.listen(3000,
 
()
 
=>
 
{
 
  
console.log('Server
 
running
 
on
 
port
 
3000');
 
});
 
 
6.  Practice  Problems  
Problem  1:  Secure  User  Registration  System  
Objective:  Build  a  complete  user  registration  system  with  proper  password  hashing  and  
validation.
 Requirements:  ●  Password  must  be  at  least  8  characters  ●  Must  contain  uppercase,  lowercase,  number,  and  special  character  ●  Hash  password  using  bcrypt  ●  Store  user  in  database  ●  Prevent  duplicate  registrations  ●  Return  appropriate  error  messages  Starter  Code:  const  express  =  require('express');  
const
 
bcrypt
 
=
 
require('bcrypt');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
const
 
users
 
=
 
[];
 
 
//
 
TODO:
 
Implement
 
password
 
validation
 
function
 
function
 
validatePassword(password)
 
{
 
  
//
 
Your
 
code
 
here
 
}
 
 
//
 
TODO:
 
Implement
 
registration
 
endpoint
 
app.post('/register',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.listen(3000);
 
 

--- PAGE 44 ---
Test  Cases:  //  Valid  registration  
POST
 
/register
 
Body:
 
{
 
  
"username":
 
"john_doe",
 
  
"email":
 
"john@example.com",
 
  
"password":
 
"SecurePass123!"
 
}
 
Expected:
 
201
 
Created
 
 
//
 
Weak
 
password
 
POST
 
/register
 
Body:
 
{
 
  
"username":
 
"jane",
 
  
"email":
 
"jane@example.com",
 
  
"password":
 
"weak"
 
}
 
Expected:
 
400
 
Bad
 
Request
 
with
 
validation
 
errors
 
 
//
 
Duplicate
 
email
 
POST
 
/register
 
Body:
 
{
 
  
"username":
 
"another",
 
  
"email":
 
"john@example.com",
 
  
"password":
 
"SecurePass123!"
 
}
 
Expected:
 
409
 
Conflict
 
 
Problem  2:  Session-Based  Shopping  Cart  
Objective:  Implement  a  shopping  cart  using  sessions  that  persists  across  page  visits.  Requirements:  ●  Add  items  to  cart  ●  Update  item  quantities  ●  Remove  items  from  cart  ●  Calculate  total  price  ●  Clear  cart  ●  Cart  persists  across  browser  sessions  Starter  Code:  const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 

--- PAGE 45 ---
app.use(session({  
  
secret:
 
'cart-secret',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false
 
}));
 
 
//
 
TODO:
 
Initialize
 
cart
 
middleware
 
const
 
initCart
 
=
 
(req,
 
res,
 
next)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
};
 
 
//
 
TODO:
 
Implement
 
cart
 
operations
 
app.post('/cart/add',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.put('/cart/update/:productId',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.delete('/cart/remove/:productId',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.get('/cart',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.listen(3000);
 
 
Problem  3:  Multi-Role  Authorization  System  
Objective:  Build  an  authorization  system  with  three  roles:  user,  moderator,  and  admin.  Requirements:  ●  Users  can  create  and  edit  their  own  posts  ●  Moderators  can  edit  and  delete  any  post  ●  Admins  can  do  everything  including  user  management  ●  Implement  appropriate  middleware  for  each  role  ●  Return  proper  error  messages  for  unauthorized  access  Starter  Code:  const  express  =  require('express');  
const
 
session
 
=
 
require('express-session');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 

--- PAGE 46 ---
 
app.use(session({
 
  
secret:
 
'auth-secret',
 
  
resave:
 
false,
 
  
saveUninitialized:
 
false
 
}));
 
 
const
 
users
 
=
 
[];
 
const
 
posts
 
=
 
[];
 
 
//
 
TODO:
 
Implement
 
authentication
 
middleware
 
const
 
isAuthenticated
 
=
 
(req,
 
res,
 
next)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
};
 
 
//
 
TODO:
 
Implement
 
role-based
 
authorization
 
middleware
 
const
 
requireRole
 
=
 
(role)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
};
 
 
//
 
TODO:
 
Implement
 
resource
 
ownership
 
check
 
const
 
isOwnerOrModerator
 
=
 
(req,
 
res,
 
next)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
};
 
 
//
 
TODO:
 
Implement
 
routes
 
app.post('/posts',
 
isAuthenticated,
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.put('/posts/:id',
 
isAuthenticated,
 
isOwnerOrModerator,
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.delete('/posts/:id',
 
isAuthenticated,
 
requireRole('moderator'),
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.listen(3000);
 
 
Problem  4:  JWT  Authentication  with  Refresh  Tokens  
Objective:  Implement  JWT  authentication  with  access  and  refresh  token  system.  

--- PAGE 47 ---
Requirements:  ●  Generate  access  token  (15  minutes  expiry)  ●  Generate  refresh  token  (7  days  expiry)  ●  Store  refresh  tokens  securely  ●  Implement  token  refresh  endpoint  ●  Implement  logout  (invalidate  refresh  token)  Starter  Code:  const  express  =  require('express');  
const
 
jwt
 
=
 
require('jsonwebtoken');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
const
 
ACCESS_SECRET
 
=
 
'access-secret';
 
const
 
REFRESH_SECRET
 
=
 
'refresh-secret';
 
 
const
 
users
 
=
 
[];
 
const
 
refreshTokens
 
=
 
new
 
Set();
 
 
//
 
TODO:
 
Generate
 
access
 
token
 
function
 
generateAccessToken(user)
 
{
 
  
//
 
Your
 
code
 
here
 
}
 
 
//
 
TODO:
 
Generate
 
refresh
 
token
 
function
 
generateRefreshToken(user)
 
{
 
  
//
 
Your
 
code
 
here
 
}
 
 
//
 
TODO:
 
Implement
 
login
 
app.post('/login',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
//
 
TODO:
 
Implement
 
token
 
refresh
 
app.post('/token/refresh',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
//
 
TODO:
 
Implement
 
logout
 
app.post('/logout',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
//
 
TODO:
 
Implement
 
protected
 
route
 
app.get('/protected',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 

--- PAGE 48 ---
 
app.listen(3000);
 
 
Problem  5:  Passport.js  with  Multiple  Strategies  
Objective:  Implement  authentication  using  both  local  strategy  and  JWT  strategy  with  
Passport.js.
 Requirements:  ●  Use  local  strategy  for  username/password  login  ●  Use  JWT  strategy  for  API  authentication  ●  Support  both  session-based  and  token-based  auth  ●  Implement  proper  error  handling  ●  Add  route  to  switch  between  auth  methods  Starter  Code:  const  express  =  require('express');  
const
 
passport
 
=
 
require('passport');
 
const
 
LocalStrategy
 
=
 
require('passport-local').Strategy;
 
const
 
JwtStrategy
 
=
 
require('passport-jwt').Strategy;
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
const
 
users
 
=
 
[];
 
 
//
 
TODO:
 
Configure
 
Local
 
Strategy
 
passport.use('local',
 
new
 
LocalStrategy(
 
  
{
 
/*
 
options
 
*/
 
},
 
  
async
 
(username,
 
password,
 
done)
 
=>
 
{
 
    
//
 
Your
 
code
 
here
 
  
}
 
));
 
 
//
 
TODO:
 
Configure
 
JWT
 
Strategy
 
passport.use('jwt',
 
new
 
JwtStrategy(
 
  
{
 
/*
 
options
 
*/
 
},
 
  
(payload,
 
done)
 
=>
 
{
 
    
//
 
Your
 
code
 
here
 
  
}
 
));
 
 
//
 
TODO:
 
Implement
 
login
 
endpoint
 
app.post('/auth/login',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 

--- PAGE 49 ---
//  TODO:  Implement  API  login  (returns  JWT)  
app.post('/auth/api-login',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
//
 
TODO:
 
Protected
 
route
 
with
 
session
 
auth
 
app.get('/dashboard',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
//
 
TODO:
 
Protected
 
route
 
with
 
JWT
 
auth
 
app.get('/api/profile',
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.listen(3000);
 
 
Problem  6:  Rate-Limited  Login  with  Account  Lockout  
Objective:  Implement  login  rate  limiting  and  account  lockout  after  failed  attempts.  Requirements:  ●  Allow  5  login  attempts  per  hour  per  email  ●  Lock  account  for  30  minutes  after  5  failed  attempts  ●  Track  failed  attempts  ●  Clear  attempts  counter  on  successful  login  ●  Return  appropriate  error  messages  Starter  Code:  const  express  =  require('express');  
const
 
bcrypt
 
=
 
require('bcrypt');
 
 
const
 
app
 
=
 
express();
 
app.use(express.json());
 
 
const
 
users
 
=
 
[];
 
const
 
loginAttempts
 
=
 
new
 
Map();
 
//
 
email
 
->
 
{
 
count,
 
lockUntil
 
}
 
 
//
 
TODO:
 
Implement
 
check
 
login
 
attempts
 
function
 
checkLoginAttempts(email)
 
{
 
  
//
 
Your
 
code
 
here
 
}
 
 
//
 
TODO:
 
Implement
 
record
 
failed
 
attempt
 
function
 
recordFailedAttempt(email)
 
{
 
  
//
 
Your
 
code
 
here
 
}
 

--- PAGE 50 ---
 
//
 
TODO:
 
Implement
 
clear
 
attempts
 
function
 
clearAttempts(email)
 
{
 
  
//
 
Your
 
code
 
here
 
}
 
 
//
 
TODO:
 
Implement
 
login
 
with
 
rate
 
limiting
 
app.post('/login',
 
async
 
(req,
 
res)
 
=>
 
{
 
  
//
 
Your
 
code
 
here
 
});
 
 
app.listen(3000);
 
 
Summary  and  Best  Practices  
Security  Best  Practices  
Password  Security:  ●  Always  hash  passwords  using  bcrypt  (never  store  plain  text)  ●  Use  sufficient  salt  rounds  (10-12)  ●  Implement  strong  password  requirements  ●  Consider  password  breach  checking  Session  Security:  ●  Use  secure  session  secrets  ●  Set  httpOnly  and  secure  flags  on  cookies  ●  Implement  session  timeouts  ●  Use  HTTPS  in  production  ●  Regenerate  session  IDs  after  login  JWT  Security:  ●  Use  strong  secret  keys  ●  Keep  access  tokens  short-lived  ●  Implement  refresh  token  rotation  ●  Store  tokens  securely  (http  HttpOnly  cookies)  ●  Validate  tokens  on  every  request  Authorization  Best  Practices:  ●  Always  authenticate  before  authorization  ●  Follow  principle  of  least  privilege  ●  Use  middleware  for  consistent  enforcement  ●  Log  authorization  failures  ●  Implement  proper  error  messages  (don’t  leak  info)  
Common  Pitfalls  to  Avoid  
Never  store  passwords  in  plain  text.  Don’t  confuse  authentication  with  authorization.  Avoid  

--- PAGE 51 ---
returning  different  error  messages  for  invalid  username  vs  password.  Don’t  expose  sensitive  
information
 
in
 
error
 
messages.
 
Remember
 
to
 
validate
 
and
 
sanitize
 
all
 
user
 
inputs.
 
Always
 
use
 
HTTPS
 
in
 
production.
 
Don’t
 
rely
 
solely
 
on
 
client-side
 
validation.
 
This  tutorial  has  covered  the  complete  authentication  and  authorization  workflow  in  Express.js  
applications,
 
from
 
basic
 
password
 
hashing
 
to
 
complex
 
role-based
 
access
 
control
 
systems.
 
Practice
 
the
 
provided
 
exercises
 
to
 
reinforce
 
your
 
understanding!
 