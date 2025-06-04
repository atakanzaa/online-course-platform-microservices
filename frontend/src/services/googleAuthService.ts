import api from '../utils/api';

export interface GoogleAuthResponse {
  user: any;
  token: string;
}

export interface GoogleLoginRequest {
  idToken: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  role?: 'STUDENT' | 'INSTRUCTOR';
}

export const googleAuthService = {
  googleLogin: async (request: GoogleLoginRequest): Promise<GoogleAuthResponse> => {
    const response = await api.post<{ data: GoogleAuthResponse }>('/auth/oauth2/google', request);
    return response.data.data;
  },
};
