import React, {useState} from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import {useCreateUserWithEmailAndPassword} from 'react-firebase-hooks/auth';
import {
    auth,
    logInWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordReset,
    signInWithGoogle,
    updatePseudo
} from './Auth';
import {GoogleLoginButton} from "react-social-login-buttons";
import {TextField} from "@mui/material";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";


function SigninTabs(props) {
    const [key, setKey] = useState('login');
    const [createUserWithEmailAndPassword, userMail, loadingMail, errorMail] = useCreateUserWithEmailAndPassword(auth);
    const [emailCreate, setEmailCreate] = useState('');
    const [passwordCreate, setPasswordCreate] = useState('');
    const [emailLogin, setEmailLogin] = useState('');
    const [passwordLogin, setPasswordLogin] = useState('');
    const [pseudoCreate, setPseudoCreate] = useState('');
    const [emailReset, setEmailReset] = useState('');


return (
    <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
    >
        <Tab eventKey="login" title="Login">
            <GoogleLoginButton onClick={() => {
                signInWithGoogle((pseudo) => {
                    updatePseudo(pseudo).then(props.onUserChange)
                })
            }}/>
            <br/>
            <div>
                <Box textAlign={'center'}>

                    <TextField
                        type="email"
                        label="Email"
                        value={emailLogin}
                        onChange={(e) => setEmailLogin(e.target.value)}
                        placeholder="user@domain.com"
                    />
                    <br/>
                    <TextField
                        type="password"
                        label="Password"
                        value={passwordLogin}
                        onChange={(e) => setPasswordLogin(e.target.value)}
                        placeholder="password"
                    />
                    <br/>
                    <Button onClick={() => logInWithEmailAndPassword(emailLogin, passwordLogin)}>
                        Login with password
                    </Button>
                </Box>
            </div>
        </Tab>
        <Tab eventKey="createAccount" title="Create Account">
            <Box textAlign={"center"} sx={{alignItems: "center"}}>
                <TextField
                    type="email"
                    label="Email"
                    value={emailCreate}
                    onChange={(e) => setEmailCreate(e.target.value)}
                    placeholder="user@domain.com"
                />
                <br/>
                <TextField
                    type="password"
                    label="Password"
                    value={passwordCreate}
                    onChange={(e) => setPasswordCreate(e.target.value)}
                    placeholder="password"
                />
                <br/>
                <TextField
                    label="Pseudo"
                    value={pseudoCreate}
                    onChange={(e) => setPseudoCreate(e.target.value)}
                    placeholder="pseudo"
                />
                <br/>
                You'll need to verify your email (check your spam folder)

                <Button variant="outlined" onClick={() => registerWithEmailAndPassword(pseudoCreate, emailCreate, passwordCreate)}>
                    Register
                </Button>
            </Box>

        </Tab>

        <Tab eventKey="resetPasswork" title="Password Reset">
            <Box textAlign={"center"}>

                <TextField
                    type="email"
                    label="Email"
                    value={emailReset}
                    onChange={(e) => setEmailReset(e.target.value)}
                    placeholder="user@domain.com"
                />
                <br/>

                <Button onClick={() => sendPasswordReset(emailReset)}>
                    Send reset mail
                </Button>
            </Box>

        </Tab>

    </Tabs>
);
}

export default SigninTabs;