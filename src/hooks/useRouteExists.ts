import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function useRouteExists() {
  const pathname = usePathname();
  const router = useRouter();
  const [routeExists, setRouteExists] = useState(true);

  useEffect(() => {
    const checkRoute = async () => {
      if (pathname === null) {
        setRouteExists(false);
        return;
      }
      try {
        router.prefetch(pathname);
        setRouteExists(true);
      } catch (error) {
        setRouteExists(false);
      }
    };

    checkRoute();
  }, [pathname, router]);

  return routeExists;
}
