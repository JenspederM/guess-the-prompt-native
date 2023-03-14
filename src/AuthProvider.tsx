import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {User} from './types';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

type AuthContextType = {
  user: User;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

const AuthProvider = (props: React.PropsWithChildren) => {
  const [user, setUser] = useState<User>();

  const onAuthStateChanged = async (
    authUser: FirebaseAuthTypes.User | null,
  ) => {
    if (!authUser) {
      return;
    }

    let userDoc = await firestore()
      .collection('users')
      .doc(authUser.uid)
      .get()
      .catch(() => null);

    let appUser: User;

    if (userDoc && userDoc.exists) {
      appUser = userDoc.data() as User;
    } else {
      appUser = {
        id: authUser.uid,
        name: '',
      };
      await firestore()
        .collection('users')
        .doc(authUser.uid)
        .set(appUser)
        .catch(() => null);
    }

    setUser(appUser);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubUser = firestore()
      .collection('users')
      .doc(user.id)
      .onSnapshot(snapshot => {
        setUser(snapshot.data() as User);
      });

    return unsubUser;
  }, [user]);

  const context = user ? {user} : null;

  return (
    <AuthContext.Provider value={context}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useUser = () =>
  React.useContext<AuthContextType | null>(AuthContext);
export default AuthProvider;
