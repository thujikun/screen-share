Web RTC Screen Sharing
===============================

## Introduction
This App enables us to share our screen.


## Requirements
Chrome 26+  
* Access to chrome://flags, and then check Enable screen capture support in getUserMedia(), and relaunch.


## Getting started
````
npm install
cd ssl
/System/Library/OpenSSL/misc/CA.sh -newca
openssl genrsa -des3 -out server.key 1024
openssl req -new -days 365 -key server.key -out server.csr
rm -f demoCA/index.txt
touch demoCA/index.txt
openssl ca -in server.csr -keyfile demoCA/private/cakey.pem -out server.crt
cd ..
node app.js
````
This is Mac OSX Case. You may need execute as Super User with "sudo".
If you use Windows, google it and make express server ssl.  
Screen Capture API work on only SSL server.


## Sharing
1. Access to server(default is 3000 port), and then room no is created automatically.
2. Share URL with the person you want to share your screen.
3. Click start button on both your PC and his PC.
4. Click send offer button on either your PC or his PC.
* Web RTC is still unbalance. so if failed, try again.


### License
Copyright (c) 2013 Ryosuke Tsuji at Site Sctivity Group in CWD
Licensed under the [MIT license](https://github.com/thujikun/screen-share/blob/master/LICENSE_MIT).
