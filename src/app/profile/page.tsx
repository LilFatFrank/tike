"use client";
import { Profile as ProfileComponent } from "@/components";
import { useNeynarContext } from "@neynar/react";

export default function Profile() {

    const { user } = useNeynarContext();

  return <ProfileComponent fid={user?.fid as number} />;
}
