
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
} from 'firebase/auth';
import { auth as firebaseAuth, firebaseConfig } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    return { user: result.user };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(firebaseAuth);
  } catch (error: any) {
    console.error('Error signing out:', error.message);
  }
}

export async function sendPasswordlessLink(email: string) {
  // Utilise l'authDomain du projet Firebase, qui est toujours autorisé.
  const continueUrl = `https://${firebaseConfig.authDomain}/dashboard`;

  const actionCodeSettings = {
    url: continueUrl,
    handleCodeInApp: true,
  };
  try {
    await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    return { success: true }
  } catch (error: any) {
    console.error('Error sending passwordless link:', error);
    // @ts-ignore
    return { error: error.message };
  }
}
