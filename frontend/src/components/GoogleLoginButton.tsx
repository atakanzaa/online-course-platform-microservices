import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { googleAuthService } from '../services/googleAuthService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

interface GoogleLoginButtonProps {
  roleSelection?: 'STUDENT' | 'INSTRUCTOR';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  roleSelection = 'STUDENT', 
  onSuccess, 
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode the JWT token to get user info
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
      
      // Prepare the request for our backend
      const loginRequest = {
        idToken: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        firstName: decoded.given_name || decoded.name.split(' ')[0],
        lastName: decoded.family_name || decoded.name.split(' ').slice(1).join(' '),
        profileImage: decoded.picture,
        role: roleSelection
      };

      // Send to our backend
      const response = await googleAuthService.googleLogin(loginRequest);
      
      // Store tokens and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error.response?.data?.message || 'Google login failed';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    const errorMessage = 'Google login was cancelled or failed';
    if (onError) {
      onError(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <div className={isLoading ? "pointer-events-none opacity-50" : ""}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          text="continue_with"
          theme="outline"
          size="large"
          width="100%"
        />
      </div>
      {isLoading && (
        <div className="text-center mt-2">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </div>
        </div>
      )}
    </div>
  );
};

interface GoogleAuthWrapperProps {
  children: React.ReactNode;
}

export const GoogleAuthWrapper: React.FC<GoogleAuthWrapperProps> = ({ children }) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  
  if (!clientId) {
    console.warn('Google Client ID not found. Please set REACT_APP_GOOGLE_CLIENT_ID environment variable.');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
