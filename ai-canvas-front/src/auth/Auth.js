import {initializeApp} from "firebase/app";
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from "firebase/auth";

export const firebaseConfig = {
    apiKey: "AIzaSyApc_Q01mz-RNVtxwvtcxF5WhAOk8M6OEg",
    authDomain: "ai-canvas.firebaseapp.com",
    projectId: "ai-canvas",
    storageBucket: "ai-canvas.appspot.com",
    messagingSenderId: "732264051436",
    appId: "1:732264051436:web:95cb2c7c6bb56099502bc9"
};

const BACK_BASE_URL = process.env.REACT_APP_BACK_URL;

console.log('hello from auth')
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async (onSuccess) => {
    try {
        console.log('coucou')
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        console.log(res)
        console.log(user)
        await fetch(BACK_BASE_URL + "/register_user/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    'credential': res._tokenResponse.idToken
                }
            ),
        }).then((resp) => resp.json())
            .then((json) => {
                onSuccess(json.pseudo)
                console.log('setted pseudo as' + json.pseudo)
            })
        console.log(res)
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const logInWithEmailAndPassword = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};


const updatePseudo = async (newPseudo) => {
    try {
        await updateProfile(auth.currentUser, {displayName: newPseudo});
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const sendVerificationMail = async () => {
    try {
        await sendEmailVerification(auth.currentUser);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const registerWithEmailAndPassword = async (pseudo, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        updatePseudo(pseudo)

        const user = res.user;
        console.log(res)
        fetch(BACK_BASE_URL + "/register_user/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    'credential': res._tokenResponse.idToken,
                    'pseudo': pseudo
                }
            ),
        })
        const res_email = await sendVerificationMail();
        console.log("email_send")


    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};
const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset link sent!");
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};
const logout = () => {
    signOut(auth);
};
export {
    auth,
    signInWithGoogle,
    logInWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordReset,
    logout,
    updatePseudo
};
