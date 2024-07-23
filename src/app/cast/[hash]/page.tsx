"use client";
import { Cast, Frame, Spinner } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { hash: string } }) {
  const { user } = useNeynarContext();

  const [cast, setCast] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchCast = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`/api/cast`, {
        method: "POST",
        body: JSON.stringify({
          hash: params.hash,
          fid: user?.fid,
        }),
      });
      const data = await resp.json();
      if (data.error) {
        setError(true);
        return;
      }
      setCast(data);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.hash) fetchCast();
  }, [params.hash]);

  if (loading)
    return (
      <div className="p-4 flex items-center justify-center">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <p className="w-full items-center justify-center py-2 text-center">
        Could not fetch cast!
      </p>
    );

  return (
    <>
      {cast ? (
        cast.frames ? (
          <Frame frame={cast} />
        ) : (
          <Cast cast={cast} />
        )
      ) : null}
    </>
  );
}
