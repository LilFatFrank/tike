"use client";
import { memo, useCallback, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Error } from "@/components";
import { SET_PAGE_NOT_FOUND } from "@/context/actions";
import { AppContext } from "@/context";

const useNotFoundEffect = () => {
  const [, dispatch] = useContext(AppContext);
  useEffect(() => {
    dispatch({ type: SET_PAGE_NOT_FOUND, payload: true });
  }, [dispatch]);
};

const NotFound = memo(() => {
  const router = useRouter();
  useNotFoundEffect();

  const handleGoHome = useCallback(() => router.push("/"), [router]);

  return (
    <Error
      type="404"
      message="We could not find the page you are looking for."
      buttonLabel="Go to Home"
      buttonAction={handleGoHome}
    />
  );
});

export default NotFound;
