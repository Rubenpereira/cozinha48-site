// src/firebase.js
// Configuração do Firebase para o projeto cozinha48-d4408
// IMPORTANTE: substitua os valores abaixo pelas suas credenciais reais
// Acesse: Firebase Console > Configurações do projeto > Seus aplicativos > SDK

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "cozinha48-d4408.firebaseapp.com",
  projectId: "cozinha48-d4408",
  storageBucket: "cozinha48-d4408.appspot.com",
  messagingSenderId: "COLE_SEU_MESSAGING_SENDER_ID",
  appId: "COLE_SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
