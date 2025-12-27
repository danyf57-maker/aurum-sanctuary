import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
} from 'firebase/auth';
import { auth as firebaseAuth } from './config';

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
  const actionCodeSettings = {
    url: `${window.location.origin}/sanctuary`,
    handleCodeInApp: true,
  };
  try {
    await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    return { success: true }
  } catch (error: any) {
    console.error('Error sending passwordless link:', error);
    return { error: error.message };
  }
}
