// components/AuthProviderWrapper.tsx
"use client";

import { Auth0Provider } from "@auth0/auth0-react";

export default function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Auth0Provider
      domain="dev-bp5fm7c4tenrc3vo.us.auth0.com"
      clientId="zN9v3fsIGhGBL4Q4TWFD7WFUXGuyzWTw"
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined" ? window.location.origin : "",
      }}
    >
      {children}
    </Auth0Provider>
  );
}
