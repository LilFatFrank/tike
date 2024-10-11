import { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  try {
    const { fid } = req.query;

    console.log(fid);

    // Validate the input data
    if (!fid || Array.isArray(fid)) {
      return res.status(400).json({ error: true, message: 'Valid fid is required' });
    }

    // Convert fid to string as Firestore document IDs are strings
    const docId = fid.toString();

    // Check if a document with this ID exists
    const docRef = db.collection('users').doc(docId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ exists: false, message: "User not found" });
    }

    const userData = doc.data();

    res.status(200).json({ exists: true, user: userData });
  } catch (error) {
    console.error("Error checking user existence:", error);
    res.status(500).json({ error: true, message: 'Error checking user existence' });
  }
}
