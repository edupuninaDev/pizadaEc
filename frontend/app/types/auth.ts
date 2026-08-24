export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  };
};

export type LoginResponse = {
  message: string;
  user: AuthUser;
  token: string;
};
