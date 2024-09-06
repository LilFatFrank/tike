"use client";
import { Error } from "@/components";
import { AppContext } from "@/context";
import { SET_PAGE_NOT_FOUND } from "@/context/actions";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function NotFound() {
  const router = useRouter();

  const [, dispatch] = useContext(AppContext);

  useEffect(() => {
    dispatch({ type: SET_PAGE_NOT_FOUND, payload: true });
  }, [dispatch]);

  return (
    <Error
      type="404"
      message="We could not find the page you are looking for."
      buttonLabel="Go to Home"
      buttonAction={() => router.push("/")}
    />
  );
}
