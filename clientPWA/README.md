# Door bell answering app
- Only works for two people atm
## Run
* `npm install`
* `fix credentials (see bellow)`
* `node index.js`
* open `localhost:8000`

    npx ngrok http -region=eu 8000

## Obtaining TURN/STUN credentials using Xiysys
* Do not use the credentials provided
* Go to https://xirsys.com/
* Sign Up 
* Log in to your account
* Click on `+` beside `MyFirstApp`
* Click on `static TURN Credentials` Button located below `Account Type`.
* Accept the warning by click on `+` that appears just after you clicked on `static TURN Credentials`.
* Copy the text(begins with `iceservers`) that appears below `static TURN Credentials`  and paste in `public/js/credentials.json`.