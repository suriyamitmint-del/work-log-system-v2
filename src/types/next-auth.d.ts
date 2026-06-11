import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      name?: string | null;
    };
  }

  interface User {
    id: string;
    username: string;
    role: string;
  }
}
