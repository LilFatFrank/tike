import { NextApiRequest, NextApiResponse } from "next";
import * as admin from "firebase-admin";

type UserData = {
  username: string;
  fid: number;
  collection: {
    [key: string]: string;
  };
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { fid, ...updateData }: { fid: number } & Partial<UserData> =
      JSON.parse(req.body);

      console.log({ fid, ...updateData })

    // Validate the input data
    if (typeof fid !== "number") {
      return res.status(400).json({ message: "Valid fid is required" });
    }

    // Convert fid to string as Firestore document IDs must be strings
    const docId = fid.toString();

    // Get a reference to the document
    const docRef = db.collection("users").doc(docId);

    // Use set with merge option to update existing fields and add new ones
    await docRef.set(updateData, { merge: true });

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
}
