import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleDevelopmentMode = () => {
    if (onError) {
      onError('Google OAuth temporarily disabled. Please use email/password login.');
    }
  };

  return (
    <div className="w-full">
      <button 
        onClick={handleDevelopmentMode}
        className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google ile Devam Et (Geçici Olarak Devre Dışı)
      </button>
      <p className="mt-2 text-xs text-gray-500 text-center">
        Google OAuth yapılandırması düzeltiliyor. Şimdilik email/password ile giriş yapın.
      </p>
    </div>
  );
};

export const GoogleAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default GoogleLoginButton;

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  
  // Check if Google OAuth is properly configured
  if (!clientId || clientId === '347659003886-gs8ipklme97o37cel1fma1egkjl9j53i.apps.googleusercontent.com') {
    return (
      <div className="w-full">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <div className="text-gray-500 mb-2">
            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-900">Google OAuth Not Configured</h3>
            <p className="text-xs text-gray-500 mt-1">
              To enable Google login, configure OAuth in Google Cloud Console
            </p>
          </div>
          <div className="text-xs text-left bg-gray-50 p-3 rounded">
            <strong>Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Go to <span className="font-mono text-blue-600">console.cloud.google.com</span></li>
              <li>Create OAuth 2.0 Client ID</li>
              <li>Add <span className="font-mono">http://localhost:3000</span> to authorized origins</li>
              <li>Update <span className="font-mono">.env</span> with your Client ID</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

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
      };      // Send to our backend
      const response = await googleAuthService.googleLogin(loginRequest);
      
      // Create user object from response
      const user = {
        id: response.userId.toString(),
        email: response.email,
        firstName: decoded.given_name || decoded.name.split(' ')[0],
        lastName: decoded.family_name || decoded.name.split(' ').slice(1).join(' '),
        role: response.role as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN',
        avatar: decoded.picture,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store tokens and user info
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(user));

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
  };  return (
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
  
  if (!clientId || clientId === '347659003886-gs8ipklme97o37cel1fma1egkjl9j53i.apps.googleusercontent.com') {
    console.warn('Google Client ID not configured properly. Please set up your own Google OAuth Client ID.');
    console.warn('Go to https://console.cloud.google.com/ and create OAuth 2.0 credentials.');
    console.warn('Add http://localhost:3000 to authorized JavaScript origins.');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
