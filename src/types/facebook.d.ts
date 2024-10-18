declare namespace fb {
    interface StatusResponse {
      status: string;
      authResponse: AuthResponse;
    }
  
    interface AuthResponse {
      accessToken: string;
      expiresIn: number;
      signedRequest: string;
      userID: string;
    }
  }
  
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init(params: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
      login(callback: (response: fb.StatusResponse) => void, options?: { scope: string }): void;
    };
  }