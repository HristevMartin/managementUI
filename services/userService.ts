interface RegisterData {
  email: string;
  password: string;
  repeatPassword: string;
  role: string;
}

interface LoginData {
  email: string;
  password: string;
}

let apiUrlip = process.env.NEXT_PUBLIC_TRAVEL_SECURITY;

export const registerUser = async (data: RegisterData): Promise<any> => {
  const apiUrl = `${apiUrlip}/auth/register`;
  console.log('the apiURL', apiUrl);

  try {
    console.log('111')
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok){
      console.log('error while calling the api', response);
    }

    console.log('show me the response!!', response);
    const responseData = await response.json();
    console.log('show me the response.status', response.status);

    if (response.status === 200) {
      return { success: true, data: responseData };
    } else {
      console.log('Registration failed:', responseData.message);
      return {
        success: false,
        error: responseData.message || 'Registration failed',
      };
    }
  } catch (error: any) {
    console.error('There was a problem with the fetch operation:', error);
    throw new Error(error.message);
  }
};

export const loginUser = async (data: LoginData): Promise<any> => {
  const apiUrl = `${apiUrlip}/auth/login`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    console.log('show me the response', response);
    const responseData = await response.json();
    if (response.status === 200) {
      return { success: true, message: responseData };
    } else {
      return {
        success: false,
        error: responseData.message || 'Unknown error occurred',
      };
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw new Error('Network error');
  }
};

export const logOutUser = async (access_token) => {
  const apiUrl = `${apiUrlip}/logout`;
  console.log('show me the access token', access_token);

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    let data = await response.json();
    console.log('data', data);

    if (data.status === 200) {
      return { success: true };
    } else {
      return { success: false, error: 'Logout failed' };
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw new Error('Network error');
  }
};