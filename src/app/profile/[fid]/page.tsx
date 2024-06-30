"use client";
import { Profile as ProfileComponent } from "@/components";

export default function Page({ params }: { params: { fid: number } }) {
  return <ProfileComponent fid={params.fid as number} />;
}
