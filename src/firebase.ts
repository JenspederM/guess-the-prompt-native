import '@react-native-firebase/app';
import FBAuth from '@react-native-firebase/auth';
import FBFirestore from '@react-native-firebase/firestore';
import FBFunctions from '@react-native-firebase/functions';

// set the host and the port property to connect to the emulator
// set these before any read/write operations occur to ensure it doesn't affect your Cloud Firestore data!
if (__DEV__) {
  FBAuth().useEmulator('http://localhost:9099');
  FBFirestore().useEmulator('localhost', 8080);
  FBFunctions().useEmulator('localhost', 5001);
}

export const auth = FBAuth();
export const db = FBFirestore();
export const functions = FBFunctions();
