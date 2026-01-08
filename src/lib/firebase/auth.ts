
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth as firebaseAuth } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    // signInWithRedirect ne retourne pas de résultat directement.
    // La gestion de l'utilisateur se fait via onAuthStateChanged après la redirection.
    await signInWithRedirect(firebaseAuth, googleProvider);
    return {}; // Pas d'utilisateur à retourner ici
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
