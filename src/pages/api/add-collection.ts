import { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

type UserData = {
  username: string;
  fid: number;
  collection: {
    [key: string]: string;
  };
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userData: UserData = JSON.parse(req.body);

    // Validate the input data
    if (!userData.username || typeof userData.fid !== 'number' || !userData.collection) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    // Convert fid to string as Firestore document IDs must be strings
    const docId = userData.fid.toString();

    // Check if a document with this ID already exists
    const docRef = db.collection('users').doc(docId);
    const doc = await docRef.get();

    if (doc.exists) {
      return res.status(409).json({ message: 'User with this fid already exists' });
    }

    // Add the new user to Firestore using fid as the document ID
    await docRef.set(userData);

    res.status(201).json({ message: 'User added successfully', id: docId });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Error adding user' });
  }
}
