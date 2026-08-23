import { router } from "expo-router";
import { useEffect } from "react";

import { AuthGate } from "@/components/auth-gate";
import { useBusiness } from "@/lib/business-context";

function AccessRedirect() {
  const { authenticated } = useBusiness();
  useEffect(() => { if (authenticated) router.replace("/" as never); }, [authenticated]);
  return null;
}

export default function AccessScreen() {
  return <AuthGate accessOnly><AccessRedirect /></AuthGate>;
}
