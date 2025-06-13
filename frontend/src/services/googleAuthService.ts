import api from '../utils/api';

export interface GoogleAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: string;
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

export const googleAuthService = {  googleLogin: async (request: GoogleLoginRequest): Promise<GoogleAuthResponse> => {
    const response = await api.post<GoogleAuthResponse>('/auth/oauth2/google', request);
    return response.data;
  },
};
