"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
// Registers the authApi request/response interceptors (token attachment,
// refresh-on-401). Must be imported from a client boundary - the root
// layout is a Server Component, so importing this directly there only
// registers the interceptors on the server's copy of the axios instance,
// never the browser's.
import "@/src/lib/AxiosInterceptor";

export default function NProgressProvider({ children }: { children: any }) {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, [pathname]);

  return children;
}
