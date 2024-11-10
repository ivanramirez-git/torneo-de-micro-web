import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<any>(null);

  const isAuthenticated = computed(() => !!token.value);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('https://api-micro.freeloz.com/users/login', {
        email,
        password
      });
      
      token.value = response.data.token;
      localStorage.setItem('token', response.data.token);
      
      router.push('/admin');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    router.push('/login');
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout
  };
});