import express, {Router} from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pg from 'pg';
import cors from 'cors';
import jwt, { decode } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import serverless from "serverless-http"

const SALT_HASH = 10;

dotenv.config({path:'./.env'});

const app = express();
const router = Router();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const db = new pg.Client({
    user:"avnadmin",
    host: "rowel-user-authentication-sample-user-authentication-sample.a.aivencloud.com",
    database: "defaultdb",
    password: "AVNS_NdUKrQH8KeIs8MW4Ut2",
    port:21541,
    ssl: {
        rejectUnauthorized: false, 
    },
})

db.connect()
.then(() => {
    console.log("Postgres Server is Now Connected");
}).catch((err) => {
    console.log(err);
});

router.get("/", function(req, res) {
    return res.json({message: "Hello"});
})

router.post('/token', async function(req,res) {

    const refreshToken = req.cookies.refreshToken;

    try{
        const result = await db.query("SELECT * from user_refresh_tokens WHERE refresh_token=$1", [hash]);

        if(result.rows.length <= 0) return res.sendStatus(401);

        const tokenInfo = result.rows[0];

        const currentDate = new Date();
        const expiryDate = tokenInfo.expiry_date;

        if(currentDate > expiryDate){
            return res.status(403).json({message: 'Token Expired!'});
        }

        bcrypt.compare(refreshToken, tokenInfo.refreshToken, (err, isMatch) => {
            if(err){
                return res.status(500).json({message: err});
            }

            if(!isMatch){
                return res.status(403);
            }

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, (err, user) => {
    
                const accessToken = generateAccessToken({name: user.name})
                return res.json({accessToken: accessToken});
            });
        })

    } catch(error) {
        return res.status(500).json({message: error});
    }
});

router.get('/verify-authentication', async function(req, res) {

    const accessToken = req.cookies.accessToken;

    try{
        const decodedToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
        
        return res.status(200).json({success:true, message: 'verified User!'});

    } catch(error){
        const refreshResult = await refreshAccessTokens(req,res);

        if(!refreshResult.success) return res.status(refreshResult.status).json({success: false, message: refreshResult.message});

        res.cookie('accessToken', refreshResult.accessToken, {httpOnly: true, secure: true});
        return res.status(200).json({success:true, message: "Verified Client!"});
    }
});

router.post("/login", async function(req, res) {

    console.log("fuck yeah");

    const user = { 
        email: req.body.email,
        password: req.body.password
    };

    const result = await db.query('SELECT email,password FROM user_data WHERE email=$1', [user.email]);


    if(result.rowCount <= 0) res.status(403).json({success: false, message: `Invalid Email`});

    const isPasswordMatch = await bcrypt.compare(user.password, result.rows[0].password);

    if(!isPasswordMatch)  res.status(400).json({success: false, message: `Invalid passsword`});

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET_KEY);

    try{
        const currentDate = new Date();
        const expiryDate = new Date(currentDate);

        expiryDate.setMonth(expiryDate.getMonth() + 1);

        const formattedCurrentDate = currentDate.toISOString().split('T')[0];
        const formattedExpiryDate = expiryDate.toISOString().split('T')[0];

        bcrypt.hash(refreshToken, SALT_HASH, async function(err, hash) {

            const result = await db.query("INSERT INTO user_refresh_token (refresh_token, date_created, expiry_date) VALUES ($1,$2,$3)"
            , [hash, formattedCurrentDate, formattedExpiryDate]);
            
            if(result.rowCount > 0){
                res.cookie('accessToken', accessToken, {httpOnly: true, secure: true, domain: '.aquamarine-arithmetic-ee9cb4.netlify.app'});
                res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, domain: '.aquamarine-arithmetic-ee9cb4.netlify.app'});
        
                return res.status(200).json({success:true, accessToken: accessToken, refreshToken: refreshToken});
            } else {
                return res.sendStatus(403);
            }
        });

    } catch(err) {
        return res.sendStatus(500).json({success: false, message: ""});
    }
});

router.post("/register", async function(req, res) {

    const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }

    const userExistResult = await db.query('SELECT * from user_data WHERE email=$1', [userData.email]);

    if(userExistResult.rows.length > 0) {
        return res.status(403).json({success: false, message: "Email has been taken!"});
    }

    bcrypt.hash(userData.password, SALT_HASH, async function(err, hash) {

        try{
            const result = await db.query("INSERT INTO user_data (name,email, password) VALUES ($1,$2,$3)",
             [userData.name, userData.email, hash]);

            const accessToken = generateAccessToken(userData.email);
            const refreshToken = jwt.sign(userData.email, process.env.REFRESH_TOKEN_SECRET_KEY);

            try{
                const currentDate = new Date();
                const expiryDate = new Date(currentDate);

                expiryDate.setMonth(expiryDate.getMonth() + 1);

                const formattedCurrentDate = currentDate.toISOString().split('T')[0];
                const formattedExpiryDate = expiryDate.toISOString().split('T')[0];

                bcrypt.hash(refreshToken, SALT_HASH, async function(err, hash) {

                    const result = await db.query("INSERT INTO user_refresh_token (refresh_token, date_created, expiry_date) VALUES ($1,$2,$3)"
                    , [hash, formattedCurrentDate, formattedExpiryDate]);
                
                    if(result.rowCount > 0){

                        res.cookie('accessToken', accessToken, {httpOnly: true, secure: true});
                        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true});

                        return res.status(200).json({success: true, accessToken: accessToken, refreshToken: refreshToken});
                    } else {
                        return res.sendStatus(403);
                    }
                });

            } catch(err) {
                return res.status(500).json({success: false, message: `Failed to upload refresh token ${err}`});
            }

        } catch(err) {
            console.log(err);
            return res.status(500).json({success: false, message: `Failed to register! ${err}`});
        }
    });
});



router.get("/user", async function(req, res) {

    const accessToken = req.cookies.accessToken;

    if(!accessToken) return res.status(403).json({success:false, message: "Invalid Access Token"});

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY, async (err,user) => {
        const result = await db.query("SELECT name,email from user_data WHERE email=$1", [user.email]);

        if(result.rowCount <= 0) return res.status(403).json({success:false, message: "Invalid Access Token"});

        const userData = result.rows[0];
        return res.status(200).json({success: true, userData: userData});
    });
});

router.get("/testServer", async function(req,res) {
    return res.json({message: "server is live"});
  });

router.post('/logout', async function(req,res){
    const refreshToken = req.cookies.refreshToken;

    const hashedToken = await bcrypt.hash(refreshToken, SALT_HASH);
    console.log("fuck you");
    const result = await db.query('DELETE FROM user_refresh_token WHERE refresh_token=$1', [hashedToken]);
    console.log("fuck you");

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({success: true, message:"Logout Success"});
});

function generateAccessToken(userData){
    return jwt.sign({email: userData.email}, process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn: '10m'});
}

async function refreshAccessTokens(req, res){
    const refreshToken = req.cookies.refreshToken;

    try{

        if(!refreshToken){
            console.log("fuck i dunno");
        } else {

            console.log(req.cookies.refreshToken);

        }
        const refreshTokenHashed = await bcrypt.hash(refreshToken, SALT_HASH);
        
        console.log("fuck2");
        const result = await db.query("SELECT * from user_refresh_token WHERE refresh_token=$1", [refreshTokenHashed]);
        console.log("fuck3");

        if(result.rows.length <= 0) return {status: 503, success: false,message: "Refresh Token Invalid"};
        console.log("fuck4");

        const tokenInfo = result.rows[0];

        const currentDate = new Date();
        const expiryDate = tokenInfo.expiry_date;

        if(currentDate > expiryDate){
            return {status: 403, success: false, message: 'Token Expired!'};
        }

        if(refreshTokenHashed != tokenInfo.refresh_token){
            return {status: 403, success: false, message: 'Token could not be found!'};
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, (err, user) => {

            const accessToken = generateAccessToken({email: user.email})
            return {success: true, accessToken: accessToken};
        });

    } catch(error) {
        return {status: 500, success: false, message: "Internal Server Error"};
    }
}

app.use("/api/", router);

// app.listen(process.env.SERVER_PORT, () => {
//     console.log(`Listening to PORT ${process.env.SERVER_PORT}`);
// })

export const handler = serverless(app);